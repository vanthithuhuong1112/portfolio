"""Shrink a Canva PDF export.

Two passes, both lossless as far as the page structure is concerned:
  1. identical image XObjects (Canva repeats the same background on every slide)
     are merged into one object;
  2. plain 8-bit RGB / grayscale images are re-encoded as JPEG.

Stencil masks (/ImageMask), 1-bit art and anything carrying a /Decode array are
left untouched - re-encoding those turns Canva's brush illustrations into flat
silhouettes. The text layer, vector art and page count are never touched.
"""
import sys, io, hashlib
import pikepdf
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
Q_RGB  = int(sys.argv[3]) if len(sys.argv) > 3 else 78
Q_GRAY = int(sys.argv[4]) if len(sys.argv) > 4 else 82
MIN_BYTES = 40_000

pdf = pikepdf.open(src)

def dict_sig(obj):
    """Everything about the image except its payload length."""
    return repr(sorted((str(k), str(v)) for k, v in obj.items() if str(k) != '/Length'))

# ---- 1. merge byte-identical images that are also described identically ------
canon, dup = {}, {}
for obj in pdf.objects:
    if not isinstance(obj, pikepdf.Stream):           continue
    if obj.get('/Subtype') != pikepdf.Name('/Image'): continue
    key = (hashlib.sha1(obj.read_raw_bytes()).hexdigest(), dict_sig(obj))
    if key in canon: dup[obj.objgen] = canon[key]
    else:            canon[key] = obj

def rewrite(obj, seen):
    gen = getattr(obj, 'objgen', None)
    if gen and gen != (0, 0):
        if gen in seen: return
        seen.add(gen)
    if isinstance(obj, (pikepdf.Dictionary, pikepdf.Stream)):
        items = [(k, obj[k]) for k in list(obj.keys())]
    elif isinstance(obj, pikepdf.Array):
        items = list(enumerate(obj))
    else:
        return
    for k, v in items:
        tgt = dup.get(getattr(v, 'objgen', None))
        if tgt is not None: obj[k] = tgt
        else:               rewrite(v, seen)

for page in pdf.pages:
    rewrite(page.obj, set())
print(f'  merged {len(dup)} duplicate image objects -> {len(canon)} unique')

# ---- 2. re-encode the plain photographic images ------------------------------
def convertible(obj):
    if obj.get('/ImageMask'):                       return False   # stencil mask
    if int(obj.get('/BitsPerComponent', 8)) != 8:   return False
    if '/Decode' in obj:                            return False
    cs = obj.get('/ColorSpace')
    if cs is None:                                  return False
    if isinstance(cs, pikepdf.Array) and str(cs[0]) == '/Indexed': return False
    return True

converted = saved = 0
for obj in canon.values():
    before = len(obj.read_raw_bytes())
    if before < MIN_BYTES or not convertible(obj):
        continue
    try:
        pil = pikepdf.PdfImage(obj).as_pil_image()
    except Exception as e:
        print('  skip (decode failed):', e); continue
    if pil.mode in ('L', '1', 'LA'):
        pil, cs, q = pil.convert('L'), pikepdf.Name('/DeviceGray'), Q_GRAY
    else:
        pil, cs, q = pil.convert('RGB'), pikepdf.Name('/DeviceRGB'), Q_RGB
    buf = io.BytesIO()
    pil.save(buf, 'JPEG', quality=q, optimize=True)
    jpg = buf.getvalue()
    if len(jpg) >= before:                          # never grow a stream
        continue
    keep = {k: obj[k] for k in ('/SMask', '/Mask') if k in obj}
    obj.write(jpg, filter=pikepdf.Name('/DCTDecode'))
    obj.ColorSpace, obj.BitsPerComponent = cs, 8
    obj.Width, obj.Height = pil.width, pil.height
    if '/DecodeParms' in obj: del obj['/DecodeParms']
    for k, v in keep.items(): obj[k] = v
    converted += 1
    saved += before - len(jpg)
print(f'  re-encoded {converted} images, {saved/1e6:.1f} MB of stream data saved')

pdf.save(dst, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate,
         recompress_flate=True, deterministic_id=True)
