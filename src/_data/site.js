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

const CONTENT = path.resolve('content');
const SITE_ROOT = path.resolve('.');

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

// ---- Works ---------------------------------------------------------------
function loadWorks() {
  const works = WORKS.map((slug, i) => {
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
    };
  });
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

export default function () {
  warnings.length = 0;
  const about = loadPage('about', ['quote', 'body'], 'md');
  // About-page paragraphs are interleaved per language (one <p> per paragraph pair).
  const pEn = splitParagraphs(about.en.body), pNl = splitParagraphs(about.nl.body);
  about.paragraphs = Array.from({ length: Math.max(pEn.length, pNl.length) },
    (_, i) => ({ en: pEn[i] ?? pNl[i] ?? '', nl: pNl[i] ?? pEn[i] ?? '' }));

  return {
    works: loadWorks(),
    home: loadPage('home', ['subtitle', 'motto']),
    about,
    contact: loadPage('contact', ['heading']),
    exhibitions: loadExhibitions(),
    warnings,
  };
}
