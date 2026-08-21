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

`cv/cv.css` is shared; each CV overrides only `--accent` / `--accent-soft` for its own colour.

### Rebuilding a CV after editing its HTML

Edit the `.html`, then render it with headless Edge (Windows):

```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="C:/CODE/portfolio/assets/VAN_THI_THU_HUONG_CV_ADIFY.pdf" "file:///C:/CODE/portfolio/cv/cv-adify.html"
```

Each CV is tuned to fill roughly one A4 page. If you add content and it spills onto a second page,
either trim a bullet or nudge `font-size` / `line-height` in `cv/cv.css`.

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
