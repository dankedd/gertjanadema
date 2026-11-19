# gertjanadema.nl

Static site built with [Eleventy](https://www.11ty.dev/). Texts and work photos are edited by the artist through [Pages CMS](https://pagescms.org) (config: `.pages.yml`); every save is a commit to GitHub, and Vercel rebuilds and deploys automatically.

| Path | What |
|---|---|
| `content/nl/…`, `content/en/…` | Editable texts per language (works, home, about, contact) |
| `content/works/<work>.yml` | Photos of each work (file + alt NL/EN, first = main photo) and the YouTube demo link — shared by both languages |
| `content/exhibitions.yml` | Agenda: one list for both languages (only the descriptions are per language) |
| `assets/uploads/works/<work>/` | Uploaded photo originals — build input only, never published |
| `src/*.njk` | Page templates (the original hand-written HTML, with the texts replaced by fields) |
| `src/_includes/` | Shared navigation, work gallery and demo-video modal |
| `src/_data/site.js` | Reads `/content`, applies the NL↔EN fallback, resizes photos, validates the agenda |
| `css/`, `js/`, `assets/`, `festivals.html` | Copied unchanged into the build (except `assets/uploads`) |
| `HANDLEIDING-TEKSTEN.md` | Instructions for the artist (Dutch) |

```bash
npm install
npm start        # local preview at http://localhost:8080 (rebuilds on change)
npm run build    # output in _site/
```

## Photos

Each work photo is resized by `@11ty/eleventy-img` to WebP + JPEG at 600/1000/1600/2000 px (never upscaled), with EXIF rotation baked in and metadata stripped. Output goes to `_site/img/works/<name>-<content hash>-<width>.<ext>`; the gallery uses `srcset`/`sizes`, the first photo loads eagerly, the rest lazily.

Processed files are cached in `node_modules/.cache/gj-work-images` (Vercel keeps `node_modules` between builds because the install command is `npm install`, not `npm ci`), so only new or changed photos are processed: about 35 s for a cold build, about 2 s with the cache.

`vercel.json` 301-redirects the old photo URLs (`/assets/images/<work>/…`, `/assets/reflections-of-hope/reflections-of-hope-1-*`) to the 1600 px JPEG. Those targets contain the content hash, so changing the resize options in `src/_data/site.js` changes them — the build warns when a redirect target no longer exists. Targets are still generated when a photo is removed from a list but its upload file remains.

## Warnings

Content problems never break the build. They are printed as `⚠ content:` warnings, for example uploads larger than 10 MB, a missing or invalid YouTube link (no Demo button is shown), agenda photos larger than 1 MB or invalid dates. Agenda coordinates are kept in `content/exhibitions.yml` for a possible future map but are hidden in the CMS (the map is not on the site).

Deployment: Vercel uses `vercel.json` (`npm install`, `npm run build`, output `_site`, 301 redirect `/cv.html` → `/about.html` plus the photo redirects above). Page URLs are unchanged (`connection.html`, `about.html`, …).
