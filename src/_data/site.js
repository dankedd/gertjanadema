// Reads every editable text from /content (managed through Pages CMS)
// and hands it to the templates as `site`.
//
// Rules:
// - A missing or empty Dutch text falls back to English, and vice versa.
// - Problems in the content never fail the build: they are reported as
//   "⚠ content:" warnings in the build log and the item is handled gracefully.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import Image from '@11ty/eleventy-img';

const CONTENT = path.resolve('content');
const SITE_ROOT = path.resolve('.');

// ---- Work photos ------------------------------------------------------------
// Uploads (originals) live in assets/uploads/works/<work>/ and are never
// published. At build time every photo is resized to WebP + JPEG in a few
// widths. Results are cached in node_modules/.cache (kept between Vercel
// builds), keyed by a hash of the file contents, so only new or changed
// photos are processed again. Only the files the pages use are copied to _site.
const IMG_WIDTHS = [600, 1000, 1600, 2000];
const IMG_CACHE = path.resolve('node_modules/.cache/gj-work-images');
const IMG_URL = 'img/works/';
const IMG_OUT = path.resolve('_site', IMG_URL);
const IMG_SIZES = '(max-width: 768px) 100vw, 70vw';
const UPLOAD_WARN_MB = 10;

// Fixed order and numbering of the works (also the page URLs: <slug>.html).
const WORKS = ['connection', 'marbles', 'fibonacci', 'fragmented', 'reflections'];

// Installation categories available in the agenda (must match css/exhibitions.css).
const INSTALLATIONS = ['connection', 'marbles', 'fragmented', 'melting'];

// Dutch names for the countries used in the agenda (shown when NL is selected).
const COUNTRY_NL = {
  'Netherlands': 'Nederland', 'The Netherlands': 'Nederland', 'Germany': 'Duitsland',
  'United Kingdom': 'Verenigd Koninkrijk', 'UK': 'Verenigd Koninkrijk', 'England': 'Engeland',
  'Belgium': 'België', 'France': 'Frankrijk', 'Switzerland': 'Zwitserland', 'Croatia': 'Kroatië',
  'Finland': 'Finland', 'Denmark': 'Denemarken', 'Sweden': 'Zweden', 'Norway': 'Noorwegen',
  'Spain': 'Spanje', 'Italy': 'Italië', 'Portugal': 'Portugal', 'Austria': 'Oostenrijk',
  'Poland': 'Polen', 'Czech Republic': 'Tsjechië', 'Czechia': 'Tsjechië', 'Ireland': 'Ierland',
  'Scotland': 'Schotland', 'Luxembourg': 'Luxemburg', 'Estonia': 'Estland', 'Latvia': 'Letland',
  'Lithuania': 'Litouwen', 'Hungary': 'Hongarije', 'Slovenia': 'Slovenië', 'Greece': 'Griekenland',
  'United States': 'Verenigde Staten', 'USA': 'Verenigde Staten',
};

const warnings = [];
const warn = msg => { warnings.push(msg); console.warn(`⚠ content: ${msg}`); };

// CORE_SCHEMA keeps dates such as 2026-10-21 as plain strings.
const parseYaml = (src, file) => {
  try { return yaml.load(src, { schema: yaml.CORE_SCHEMA }) || {}; }
  catch (e) { warn(`${file} kon niet gelezen worden (${e.reason || e.message}) — standaardtekst blijft leeg.`); return {}; }
};

function readFile(rel) {
  const file = path.join(CONTENT, rel);
  if (!fs.existsSync(file)) { warn(`${rel} ontbreekt.`); return null; }
  return fs.readFileSync(file, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
}

function readYaml(rel) {
  const src = readFile(rel);
  return src == null ? {} : parseYaml(src, rel);
}

// Markdown file with YAML frontmatter → { ...frontmatter, body }
function readMd(rel) {
  const src = readFile(rel);
  if (src == null) return {};
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { body: src.trim() };
  return { ...parseYaml(m[1], rel), body: m[2].trim() };
}

const str = v => (v == null ? '' : String(v)).trim();
const has = v => Array.isArray(v) ? v.length > 0 : str(v) !== '';

// Fill empty fields of one language from the other.
function bilingual(en, nl, fields) {
  const out = { en: {}, nl: {} };
  for (const f of fields) {
    const e = en[f], n = nl[f];
    out.en[f] = has(e) ? e : (has(n) ? n : (Array.isArray(e) || Array.isArray(n) ? [] : ''));
    out.nl[f] = has(n) ? n : out.en[f];
  }
  return out;
}

function cleanSpecs(list, where) {
  if (!Array.isArray(list)) return [];
  return list
    .filter(s => s && (has(s.label) || has(s.value)))
    .map(s => ({ label: str(s.label), value: str(s.value) }));
}

// ---- YouTube ---------------------------------------------------------------
// Accepts youtube.com/watch?v=…, youtu.be/…, /shorts/…, /embed/…, /live/…
// or a bare 11-character video id.
function youtubeId(input) {
  const s = str(input);
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;
  let url;
  try { url = new URL(/^https?:\/\//i.test(s) ? s : 'https://' + s); } catch { return null; }
  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let id = null;
  if (host === 'youtu.be') id = url.pathname.split('/')[1];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v');
    const m = url.pathname.match(/^\/(shorts|embed|live|v)\/([^/?#]+)/);
    if (!id && m) id = m[2];
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

// ---- Photos ----------------------------------------------------------------
let imagesCopied = new Set();

const photoSlug = file => path.basename(file, path.extname(file)).toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'foto';

// NB: changing these options changes the content hash in the generated file
// names, and with it the targets of the photo redirects in vercel.json.
function resizePhoto(file) {
  const base = photoSlug(file);
  return Image(file, {
    widths: IMG_WIDTHS,
    formats: ['webp', 'jpeg'],
    outputDir: IMG_CACHE,
    urlPath: IMG_URL,
    fixOrientation: true,          // bake EXIF rotation into the pixels (incl. 180°)
    sharpJpegOptions: { quality: 82, mozjpeg: true, progressive: true },
    sharpWebpOptions: { quality: 80 },
    filenameFormat: (id, src, width, format) => `${base}-${id}-${width}.${format}`,
  });
}

function publishImage(v) {
  if (imagesCopied.has(v.filename)) return;
  fs.mkdirSync(IMG_OUT, { recursive: true });
  fs.copyFileSync(v.outputPath, path.join(IMG_OUT, v.filename));
  imagesCopied.add(v.filename);
}

// A redirect target whose photo was removed from a list is still generated
// from its upload (the file stays in assets/uploads), so old links keep working.
async function ensureRedirectTarget(filename) {
  const m = filename.match(/^(.*)-[A-Za-z0-9_-]{10}-\d+\.(jpeg|webp)$/);
  if (!m) return false;
  const uploads = path.join(SITE_ROOT, 'assets/uploads/works');
  if (!fs.existsSync(uploads)) return false;
  for (const work of fs.readdirSync(uploads)) {
    const dir = path.join(uploads, work);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (photoSlug(f) !== m[1]) continue;
      try {
        const meta = await resizePhoto(path.join(dir, f));
        const hit = Object.values(meta).flat().find(v => v.filename === filename);
        if (hit) { publishImage(hit); return true; }
      } catch { /* not processable: ignore */ }
    }
  }
  return false;
}

async function processPhoto(work, item, i) {
  const ref = str(item.image);
  const label = `Foto ${i + 1} van "${work}"`;
  if (!ref) { warn(`${label} heeft geen bestand — wordt overgeslagen.`); return null; }
  if (/^https?:\/\//i.test(ref)) { warn(`${label}: externe afbeelding (${ref}) wordt niet ondersteund — wordt overgeslagen.`); return null; }
  const file = path.join(SITE_ROOT, decodeURI(ref).replace(/^\/+/, ''));
  if (!fs.existsSync(file)) { warn(`${label}: bestand ${ref} bestaat niet — wordt overgeslagen.`); return null; }
  const mb = fs.statSync(file).size / 1024 / 1024;
  if (mb > UPLOAD_WARN_MB) warn(`${label}: ${ref} is ${mb.toFixed(1)} MB (groter dan ${UPLOAD_WARN_MB} MB) — wordt wel verkleind, maar de upload en de build duren langer.`);

  let meta;
  try {
    meta = await resizePhoto(file);
  } catch (e) {
    warn(`${label}: ${ref} kon niet verwerkt worden (${e.message}) — wordt overgeslagen. Gebruik JPG, PNG of WebP.`);
    return null;
  }

  // Publish only what the pages reference.
  for (const fmt of Object.values(meta)) for (const v of fmt) publishImage(v);

  const jpeg = meta.jpeg, webp = meta.webp;
  const largest = jpeg[jpeg.length - 1];
  const fallback = [...jpeg].reverse().find(v => v.width <= 1000) || jpeg[0];
  const altEn = str(item.alt_en), altNl = str(item.alt_nl);
  return {
    src: fallback.url,
    jpegSrcset: jpeg.map(v => v.srcset).join(', '),
    webpSrcset: webp.map(v => v.srcset).join(', '),
    width: largest.width,
    height: largest.height,
    alt_en: altEn || altNl,
    alt_nl: altNl || altEn,
    needsAlt: !altEn && !altNl,
    upload: ref,
    jpeg1600: ([...jpeg].reverse().find(v => v.width <= 1600) || jpeg[0]).url,
  };
}

async function loadPhotos(slug, title) {
  const data = readYaml(`works/${slug}.yml`);
  const list = Array.isArray(data.photos) ? data.photos : [];
  const photos = (await Promise.all(list.map((p, i) => processPhoto(slug, p || {}, i)))).filter(Boolean);
  photos.forEach((p, i) => {
    if (p.needsAlt) { warn(`Foto ${i + 1} van "${slug}" heeft geen alt-tekst — de titel van het werk wordt gebruikt.`); p.alt_en = p.alt_nl = title; }
  });
  if (!photos.length) warn(`"${slug}" heeft geen (bruikbare) foto's — de galerij is leeg.`);

  const yt = str(data.youtube);
  const id = youtubeId(yt);
  if (!yt) warn(`"${slug}": geen YouTube-link ingevuld — er wordt geen demo-knop getoond.`);
  else if (!id) warn(`"${slug}": "${yt}" is geen geldige YouTube-link — er wordt geen demo-knop getoond.`);
  return { photos, youtube_id: id };
}

// ---- Works ---------------------------------------------------------------
async function loadWorks() {
  const works = await Promise.all(WORKS.map(async (slug, i) => {
    const en = readMd(`en/works/${slug}.md`);
    const nl = readMd(`nl/works/${slug}.md`);
    en.specs = cleanSpecs(en.specs); nl.specs = cleanSpecs(nl.specs);
    const b = bilingual(en, nl, ['title', 'subtitle', 'specs', 'info_title', 'body']);
    if (!has(b.en.title)) { warn(`Werk "${slug}" heeft geen titel — de bestandsnaam wordt gebruikt.`); b.en.title = b.nl.title = slug; }
    return {
      slug,
      url: `${slug}.html`,
      num: String(i + 1).padStart(2, '0'),
      title: str(b.en.title),          // used where only one language fits (<title>, aria-labels)
      en: b.en,
      nl: b.nl,
      google_description: str(en.google_description),
      ...(await loadPhotos(slug, str(b.en.title))),
    };
  }));
  const bySlug = Object.fromEntries(works.map(w => [w.slug, w]));
  return { list: works, ...bySlug };
}

// ---- Agenda --------------------------------------------------------------
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function normDate(v) {
  const s = str(v).slice(0, 10);          // tolerate "2026-10-21T00:00"
  if (!DATE_RE.test(s)) return null;
  const d = new Date(s + 'T00:00:00Z');
  return isNaN(d) ? null : s;
}
function normCoord(v, min, max) {
  if (v === null || v === undefined || str(v) === '') return null;
  const n = typeof v === 'number' ? v : Number(str(v).replace(',', '.'));
  return Number.isFinite(n) && n >= min && n <= max ? n : NaN;
}

function loadExhibitions() {
  const data = readYaml('exhibitions.yml');
  const raw = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
  const events = [];

  raw.forEach((item, i) => {
    if (!item || typeof item !== 'object') return;
    const name = str(item.event_name);
    const label = name || `item ${i + 1}`;

    const start = normDate(item.date_start);
    if (!name) { warn(`Agenda-item ${i + 1} heeft geen naam en wordt overgeslagen.`); return; }
    if (!start) { warn(`"${label}": de begindatum ontbreekt of is ongeldig — item wordt overgeslagen.`); return; }
    let end = normDate(item.date_end);
    if (!end) {
      if (has(item.date_end)) warn(`"${label}": de einddatum is ongeldig — begindatum wordt gebruikt.`);
      end = start;
    }
    if (end < start) { warn(`"${label}": de einddatum ligt vóór de begindatum — begindatum wordt gebruikt.`); end = start; }

    const installation = str(item.installation).toLowerCase();
    if (!INSTALLATIONS.includes(installation)) {
      warn(`"${label}": onbekend kunstwerk "${item.installation}" (kies uit ${INSTALLATIONS.join(', ')}) — item wordt overgeslagen.`);
      return;
    }

    const lat = normCoord(item.latitude, -90, 90);
    const lng = normCoord(item.longitude, -180, 180);
    let coordinates = null;
    // Coordinates are optional and not editable in the CMS (the map is not on
    // the site); existing values are kept for a possible future map.
    if (lat === null && lng === null) {
      // no coordinates: fine, no warning
    } else if (lat === null || lng === null || Number.isNaN(lat) || Number.isNaN(lng)) {
      warn(`"${label}": coördinaten zijn leeg of ongeldig (breedtegraad ${item.latitude ?? '—'}, lengtegraad ${item.longitude ?? '—'}) — geen punt op de kaart.`);
    } else {
      coordinates = [lat, lng];
    }

    let image = str(item.image);
    if (image) {
      const local = path.join(SITE_ROOT, image.replace(/^\/+/, ''));
      if (/^https?:\/\//i.test(image)) {
        // external image: leave as-is
      } else if (!fs.existsSync(local)) {
        warn(`"${label}": afbeelding ${image} bestaat niet — er wordt geen afbeelding getoond.`);
        image = '';
      } else {
        const mb = fs.statSync(local).size / 1024 / 1024;
        if (mb > 1) warn(`"${label}": afbeelding ${image} is ${mb.toFixed(1)} MB (liefst onder 1 MB) — de pagina laadt daardoor trager.`);
      }
    }

    const country = str(item.country);
    const descEn = str(item.description_en), descNl = str(item.description_nl);
    events.push({
      id: `e${String(i + 1).padStart(2, '0')}`,
      installation,
      event_name: name,
      city: str(item.city),
      country,
      country_nl: COUNTRY_NL[country] || country,
      coordinates,
      date_start: start,
      date_end: end,
      description: descEn || descNl || null,
      description_nl: descNl || descEn || null,
      media: image || null,
    });
  });

  return { google_description: str(data.google_description), events };
}

// ---- Single pages ----------------------------------------------------------
function loadPage(name, fields, kind = 'yml') {
  const read = kind === 'md' ? readMd : readYaml;
  const en = read(`en/${name}.${kind}`);
  const nl = read(`nl/${name}.${kind}`);
  const b = bilingual(en, nl, fields);
  return { en: b.en, nl: b.nl, google_description: str(en.google_description) };
}

function splitParagraphs(md) {
  return str(md).split(/\n\s*\n/).map(p => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
}

export default async function () {
  warnings.length = 0;
  imagesCopied = new Set();
  const about = loadPage('about', ['quote', 'body'], 'md');
  // About-page paragraphs are interleaved per language (one <p> per paragraph pair).
  const pEn = splitParagraphs(about.en.body), pNl = splitParagraphs(about.nl.body);
  about.paragraphs = Array.from({ length: Math.max(pEn.length, pNl.length) },
    (_, i) => ({ en: pEn[i] ?? pNl[i] ?? '', nl: pNl[i] ?? pEn[i] ?? '' }));

  const works = await loadWorks();

  // vercel.json redirects old photo URLs to generated files; their names
  // contain a content hash, so check they still exist.
  try {
    const vercel = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, 'vercel.json'), 'utf8'));
    for (const r of vercel.redirects || []) {
      if (!String(r.destination).startsWith('/' + IMG_URL)) continue;
      const target = r.destination.slice(IMG_URL.length + 1);
      if (!imagesCopied.has(target) && !(await ensureRedirectTarget(target))) {
        warn(`vercel.json: redirect ${r.source} wijst naar ${r.destination}, maar die afbeelding bestaat niet (meer). Pas de redirect aan.`);
      }
    }
  } catch (e) { warn(`vercel.json kon niet gecontroleerd worden (${e.message}).`); }

  return {
    works,
    home: loadPage('home', ['subtitle', 'motto']),
    about,
    contact: loadPage('contact', ['heading']),
    exhibitions: loadExhibitions(),
    warnings,
  };
}
