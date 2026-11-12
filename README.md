# gertjanadema.nl

Static site built with [Eleventy](https://www.11ty.dev/). Texts are edited by the artist through [Pages CMS](https://pagescms.org) (config: `.pages.yml`); every save is a commit to GitHub, and Vercel rebuilds and deploys automatically.

| Path | What |
|---|---|
| `content/nl/…`, `content/en/…` | Editable texts per language (works, home, about, contact) |
| `content/exhibitions.yml` | Agenda: one list for both languages (only the descriptions are per language) |
| `src/*.njk` | Page templates (the original hand-written HTML, with the texts replaced by fields) |
| `src/_includes/nav.njk` | Shared navigation menu |
| `src/_data/site.js` | Reads `/content`, applies the NL↔EN fallback and validates the agenda |
| `css/`, `js/`, `assets/`, `festivals.html` | Copied unchanged into the build |
| `HANDLEIDING-TEKSTEN.md` | Instructions for the artist (Dutch) |

```bash
npm install
npm start        # local preview at http://localhost:8080 (rebuilds on change)
npm run build    # output in _site/
```

Content problems never break the build. They are printed as `⚠ content:` warnings, for example agenda items without valid coordinates (still shown in the timeline) or agenda photos larger than 1 MB.

Deployment: Vercel uses `vercel.json` (`npm run build`, output `_site`, 301 redirect `/cv.html` → `/about.html`). URLs are unchanged (`connection.html`, `about.html`, …).
