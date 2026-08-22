# Thu Hương — Portfolio

Static site (HTML + CSS + a little vanilla JS), published with GitHub Pages from `main` → `/ (root)`.

**Live:** https://vanthithuhuong1112.github.io/portfolio/

## Pages

| Path | Purpose |
| --- | --- |
| `index.html` | Main portfolio — the link to share publicly and put on a CV. |
| `adify.html` | Application page tailored for **CÔNG TY TNHH ADIFY** (Digital Marketing Intern, Performance / Ecommerce). Creative-led. |
| `highlands.html` | Application page tailored for **Highland Coffee Service JSC** (Digital Marketing Intern). Coordination / data / documentation-led. |
| `projects/*.html` | One detail page per project. |

The two application pages are **not linked from `index.html`** on purpose — each company should only ever
see the page written for them. Send the direct link. Both carry `<meta name="robots" content="noindex">`
so they stay out of search results.

## CVs

Three one-page CVs, all generated from HTML source so they stay editable:

| Source | Output |
| --- | --- |
| `cv/cv-master.html` | `assets/VAN_THI_THU_HUONG_CV.pdf` — general |
| `cv/cv-adify.html` | `assets/VAN_THI_THU_HUONG_CV_ADIFY.pdf` |
| `cv/cv-highlands.html` | `assets/VAN_THI_THU_HUONG_CV_HIGHLANDS.pdf` |

All three share `cv/cv.css`, which is a rebuild of the Canva **"Resume - A4"** template measured from
the exported PDF — photo at x=61pt, 24pt name block at x=244.7pt, rules at y=135 and y=207 framing the
summary, then a 163.8pt / 362.3pt two-column body. Editing the layout in one place changes all three.

`cv/fonts/` holds **Noto Serif** (latin + vietnamese subsets, ~130 KB), self-hosted so the PDF renders
identically offline and inside headless Edge. The Canva original used PT Serif, which has no Vietnamese
subset — that is why `Ị` and `ƯƠ` in the name fell back to a sans-serif mid-word in the old export.

### The CV photo

All three CVs use `assets/avaTH-cv.png`, the portrait exported from page 11 of the Canva deck. The export
arrives as 490×733 with a 2 px frame drawn around the page; that frame is cropped off and the image is then
cut to **486×525**, the exact aspect of the photo box in `cv.css` (118.6pt × 128pt), with roughly 10% headroom
above the hairline. Keeping the file at that aspect means `object-fit: cover` has nothing left to crop, so the
framing in the PDF is whatever you see in the file. At 486 px wide it also lands close to 300 dpi at print size.

The site uses the same portrait, cropped differently and **cut out**: `assets/avaTH-portrait.png` is a
**486×486 transparent PNG** for the 128×128 rounded avatar in the hero and the lightbox behind it. Two crops
rather than one file because the CV box is nearly square while the hero is exactly square, and letting CSS crop a
tall portrait into either one clipped the top of the head.

The cut-out is generated, not hand-masked — `tools/cutout-portrait.py` rebuilds it from the export: the Canva export sits on a
perfectly uniform `#FFFFFF` field, so a flood fill seeded from the border removes the background without touching
the highlights on skin or the near-white sweater (211–219, far enough from 255). The matte is eroded a pixel
before a 0.8px blur, otherwise the white the export anti-aliased into the hair survives as a bright fringe on the
dark page. The CV keeps the white background — a framed photo is what the template expects.

`assets/avaTH.png` (and the high-resolution `assets/avaTH1.jpg`) are the previous portrait, kept but no longer
referenced.

### Rebuilding a CV after editing its HTML

Edit the `.html`, then render it with headless Edge (Windows):

```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="C:/CODE/portfolio/assets/VAN_THI_THU_HUONG_CV_ADIFY.pdf" "file:///C:/CODE/portfolio/cv/cv-adify.html"
```

**Each CV must stay on one A4 page.** The layout is a CSS grid, and Chrome will move the *entire* grid
to a second page once it no longer fits — so a small overrun looks like a big one. To check quickly,
open the CV at `http://localhost:5173/cv/cv-adify.html` and run this in the console:

```bash
document.querySelector('.sheet').scrollHeight   // must stay at 1115 (px)
```

If it exceeds 1115, trim a bullet rather than shrinking the type — `line-height: 1.30` in `cv/cv.css`
already matches the leading measured in the original and has little room left.

### Keeping the CV links clickable

The contact rows and the project titles are real `<a>` elements, which is what puts clickable
annotations into the exported PDF. **Use absolute URLs** (`https://vanthithuhuong1112.github.io/...`)
— a relative path resolves against the local file when the PDF is opened from a download and goes
nowhere. If you add a project, link its title to the matching page under `projects/`.

To confirm the links survived a re-render:

```bash
python -c "import pdfplumber;p=pdfplumber.open('assets/VAN_THI_THU_HUONG_CV_ADIFY.pdf');print(len(p.pages[0].hyperlinks),'links')"
```

Expect **12 on the general CV, 10 on the ADIFY one, 10 on the Highlands one** (a title that wraps onto two
lines produces two annotations, which is why the count moves when wording changes length).

## Running locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173. Opening `index.html` straight from the filesystem also works, but a
server is closer to how GitHub Pages behaves.

## Structure

```
index.html            adify.html      highlands.html
styles.css            app.js          # shared styles + shared behaviour
cv/                   # CV sources (HTML) + shared print stylesheet
projects/             # project detail pages
assets/               # CV PDFs, project PDFs, images, video
tools/                # one-off asset scripts (portrait cut-out)
```

`styles.css` is themed with CSS custom properties. A page picks its accent colour with
`<body data-accent="adify">` or `<body data-accent="highlands">`; with no attribute it uses the
default blue/violet.

`app.js` is shared by `index.html`, the two application pages and the Slow North project page —
scroll progress bar, image lightbox, reveal-on-scroll, nav highlighting. The older project pages
still carry their own inline scripts.

Two layout rules are worth knowing before editing a card or a hero:

- A project card ends with `<div class="cta">` holding its document button, and the stylesheet pins
  **that** row to the floor of the card (`.grid-projects .project > .cta:last-child`). Tags keep the
  old `margin-top: auto` only when they are the last thing in the card. Do not add an inline
  `margin-top` to a card CTA — it beats the rule and the buttons stop lining up across a row.
- `.project-detail-page .hero-main` is a grid with `align-content: center`, because the summary
  sidebar next to it is usually the taller of the two. Any direct child that should keep its natural
  width — currently the eyebrow pill — needs `justify-self: start`, since grid items stretch.

## Project documents

Every project claim that can be checked links to the document behind it. The PDFs live in `assets/` and are
linked from the project page, from the matching card on `index.html`, and from whichever application page
carries that project:

| File | Backs |
| --- | --- |
| `assets/slow-north-webinar-report.pdf` | Slow North webinar — the full written report (50 pages: brochure, Facebook post, registration and email screenshots, survey form and results). The same report also exists as a [Sway](https://sway.cloud.microsoft/KtFrcvZ91ut2ntsp) and the session recording is on [YouTube](https://youtu.be/Y2HqN0w3u5Y). |
| `assets/hoi-an-destination-choice-deck.pdf` | Hoi An research — 12-page summary deck (context, method, reliability table, β/f² ranking, recommendations, Q1–Q4 roadmap). Sits **alongside** the full thesis, not instead of it. |
| `assets/graduation-project-hoi-an.pdf` | Hoi An research — the full 64-page thesis. |
| `assets/business-research.pdf` | TikTok livestream purchase-intention study. |
| `assets/topcv-labor-market-report.pdf` | TopCV × UFM hybrid event. |

Numbers quoted on the Slow North and Hoi An pages come straight from those files — 17 registrations,
15 attendees, 13 survey responses (77% extremely satisfied, 92% would return); 433 responses, R² 0.828,
β 0.297 for social influence. If a document is replaced, re-check the page against it.

One known discrepancy: the summary deck labels its outcome construct row "Tourism infrastructure (TI)"
while TI is defined earlier in the same deck as *Travel Choice Intention*. The site table uses the correct
label; the deck itself is still worth fixing in Canva.

### Why the webinar report is a re-render

The report as exported from Word is 6 MB of page-sized images with no text layer and no link annotations. It is
stored here re-rendered at **120 dpi, JPEG quality 68** — 3.0 MB, half the weight, with the body text still sharp
on screen. Nothing was lost in the conversion because there was no text or link data to lose. If the report is
ever re-exported, run the same pass rather than committing the raw 6 MB file:

```bash
python -c "import pypdfium2 as p;d=p.PdfDocument('in.pdf');i=[d[n].render(scale=120/72).to_pil().convert('RGB') for n in range(len(d))];i[0].save('out.pdf',save_all=True,append_images=i[1:],resolution=120,quality=68,optimize=True)"
```

## Branches

`main` is the working branch and **the only branch GitHub Pages publishes** (source: `main` → `/`, confirmed
via `gh api repos/<owner>/portfolio/pages`). `apply/adify` and `apply/highlands` are *archive* branches: each
holds the pack sent to one company, with the other company's page, CV source and CV PDF removed. They are a
record of what was sent, **not separate deployments** — a branch has no URL of its own.

That means the live site serves both application pages, and a reader who edits `adify.html` to
`highlands.html` in the address bar reaches the other one. What protects them is that neither page is linked
from `index.html` and both carry `<meta name="robots" content="noindex">`, so they stay out of search results
and off the site's own navigation. If genuine isolation is ever needed, the two packs have to live in separate
repositories with their own Pages sites — one repo cannot publish two branches.

To refresh a pack after work lands on `main`:

```bash
git checkout apply/adify && git merge main
```

The three removed files come back as `modify/delete` conflicts every time, which is the merge asking
whether the removal still stands. It does — `git rm` them again and commit:

```bash
git rm highlands.html cv/cv-highlands.html assets/VAN_THI_THU_HUONG_CV_HIGHLANDS.pdf
```

On `apply/highlands` the mirror image: `adify.html`, `cv/cv-adify.html`,
`assets/VAN_THI_THU_HUONG_CV_ADIFY.pdf`.

### Writing against a posting

Both application pages carry a **"Against the posting"** section that walks the job description in its
own order and its own words, with the evidence under each item — ADIFY's 50/20/15/15 split of the role,
Highlands' nine responsibilities grouped into four. When a posting asks for something that is not there,
the page says so plainly (the TikTok paid-spend gap on the ADIFY page). A claimed strength a recruiter
disproves in the interview costs more than the gap it covered.
