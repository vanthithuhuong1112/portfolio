"""Cut the studio-white background off the portrait.

The Canva export sits on a perfectly uniform #FFFFFF field (std 0 across the
sampled corners), and the sweater she is wearing reads 211-219 - far enough from
white that a flood fill seeded on the border cannot eat into it. Flood fill
rather than a plain threshold because the highlights on skin and knitwear are
bright, and a threshold would punch holes in them.
"""
import io
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

SRC = r'C:/Users/dangk/Downloads/Bản sao của VAN THI THU HUONG _ Resume.png'
FRAME = 2          # the export draws a 2px page border
NEAR_WHITE = 246   # every channel at or above this counts as background
SQUARE_TOP = 35    # ~9% headroom above the hairline


def flood_background(rgb):
    h, w, _ = rgb.shape
    white = (rgb >= NEAR_WHITE).all(axis=2)
    seen = np.zeros((h, w), dtype=bool)
    q = deque()

    for x in range(w):
        for y in (0, h - 1):
            if white[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if white[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))

    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and white[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return seen


def build(out_path, top, size):
    src = Image.open(SRC).convert('RGB')
    inner = src.crop((FRAME, FRAME, src.width - FRAME, src.height - FRAME))
    rgb = np.array(inner)

    bg = flood_background(rgb)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    a_img = Image.fromarray(alpha, mode='L')

    # Pull the matte in by a pixel so the white the export anti-aliased into the
    # hair does not survive as a bright fringe on a dark page, then soften the
    # cut so the edge is not a staircase.
    a_img = a_img.filter(ImageFilter.MinFilter(3))
    a_img = a_img.filter(ImageFilter.GaussianBlur(0.8))

    cut = inner.convert('RGBA')
    cut.putalpha(a_img)
    cut = cut.crop((0, top, inner.width, top + size))
    cut.save(out_path, optimize=True)

    a = np.array(cut)[:, :, 3]
    print(f'{out_path}: {cut.size}, transparent {round((a == 0).mean() * 100, 1)}% '
          f'/ partial {round(((a > 0) & (a < 255)).mean() * 100, 1)}%')
    return cut


def proof(square, out_path):
    """Side by side over the site background and over white.

    A cut-out that looks clean on white can still show a bright fringe on a dark
    page, which is the case that matters here — check this before committing.
    """
    sheet = Image.new('RGB', (square.width * 2 + 60, square.height + 40), (9, 13, 20))
    sheet.paste(square, (20, 20), square)
    on_white = Image.new('RGBA', square.size, (255, 255, 255, 255))
    on_white.alpha_composite(square)
    sheet.paste(on_white.convert('RGB'), (square.width + 40, 20))
    sheet.save(out_path)
    print('proof sheet:', out_path)


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1:
        SRC = sys.argv[1]
    square = build('assets/avaTH-portrait.png', SQUARE_TOP, 486)
    if '--proof' in sys.argv:
        proof(square, 'cutout-proof.png')
