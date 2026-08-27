# Vinamilk Mexico portfolio patch

Run from the root of `vanthithuhuong1112/portfolio`:

```bash
python apply_vinamilk_mexico_patch.py
```

It will:
1. Create `projects/vinamilk-mexico-entry.html`
2. Add the project card to `index.html`
3. Add clickable project links in:
   - `cv/cv-master.html`
   - `cv/cv-highlands.html`
   - `cv/cv-adify.html`

Then preview:

```bash
python -m http.server 5173
```

Open:
- http://localhost:5173/#projects
- http://localhost:5173/projects/vinamilk-mexico-entry.html

Important: re-render the CV PDFs after patching. The HTML sources will have the new links, but existing PDFs do not update automatically.
