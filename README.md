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

Expect 10 on the general CV, 8 on the ADIFY one, 9 on the Highlands one (a title that wraps onto two
lines produces two annotations).

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
```

`styles.css` is themed with CSS custom properties. A page picks its accent colour with
`<body data-accent="adify">` or `<body data-accent="highlands">`; with no attribute it uses the
default blue/violet.

`app.js` is shared by `index.html`, the two application pages and the Slow North project page —
scroll progress bar, image lightbox, reveal-on-scroll, nav highlighting. The older project pages
still carry their own inline scripts.

## Branches

`apply/adify` and `apply/highlands` are frozen snapshots of exactly what each company was sent,
with the other company's page and CV removed. `main` is the working branch.
