/* ============================================================
   EXHIBITIONS — exhibitions.js
   Map of Light + Living Timeline
============================================================ */

/* ============================================================
   DATA
============================================================ */
const TODAY = new Date(); // live date — status (past / current / upcoming) updates automatically

const INSTALLATION = {
  connection:  { label: 'Connection',             color: '#6BE8E8', glow: 'rgba(107,232,232,0.55)' },
  marbles:     { label: 'Marbles',                color: '#FFBC42', glow: 'rgba(255,188,66,0.55)'  },
  fragmented:  { label: 'Fragmented Appearances', color: '#E83070', glow: 'rgba(232,48,112,0.55)'  },
  melting:     { label: 'Melting',                color: '#4DD9AC', glow: 'rgba(77,217,172,0.55)'  },
};

// Agenda items are generated at build time from content/exhibitions.yml
// (edited in Pages CMS) and embedded in the page as JSON.
const EVENTS = (function () {
  try {
    const el = document.getElementById('exData');
    const data = el ? JSON.parse(el.textContent) : [];
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('Exhibition data could not be read', e);
    return [];
  }
})();

/* ============================================================
   I18N — fixed labels in EN / NL
   Text rendered into HTML carries both languages; CSS shows the
   active one (same .lng mechanism as the rest of the site).
============================================================ */
const T = {
  nowShowing: { en: 'Now showing', nl: 'Nu te zien' },
  upcoming:   { en: 'Upcoming',    nl: 'Binnenkort' },
  media:      { en: 'Image / Video', nl: 'Afbeelding / video' },
};

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Bilingual inline HTML; collapses to plain text when both are equal.
function bi(en, nl) {
  if (nl == null || nl === '' || nl === en) return escHtml(en);
  return `<span class="lng lng--en">${escHtml(en)}</span><span class="lng lng--nl">${escHtml(nl)}</span>`;
}
function t(key) { return bi(T[key].en, T[key].nl); }

function currentLang() {
  return document.documentElement.getAttribute('data-lang') === 'nl' ? 'nl' : 'en';
}

function locationHtml(evt) {
  return bi(`${evt.city}, ${evt.country}`, `${evt.city}, ${evt.country_nl || evt.country}`);
}

/* ============================================================
   UTILITIES
============================================================ */
function computeStatus(evt) {
  const start = new Date(evt.date_start);
  const end   = new Date(evt.date_end);
  if (TODAY < start) return 'upcoming';
  if (TODAY > end)   return 'past';
  return 'current';
}

const LOCALE = { en: 'en-GB', nl: 'nl-NL' };

function formatDateIn(str, lang) {
  const d = new Date(str);
  return d.toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShortIn(str, lang) {
  const d = new Date(str);
  return d.toLocaleDateString(LOCALE[lang], { month: 'short', year: 'numeric' });
}

// Bilingual date range, e.g. "21 Oct 2026 — 31 Oct 2026" / "21 okt 2026 — 31 okt 2026"
function dateRangeHtml(evt, short) {
  const one = l => evt.date_start === evt.date_end
    ? formatDateIn(evt.date_start, l)
    : short
      ? `${formatDateShortIn(evt.date_start, l)} — ${formatDateShortIn(evt.date_end, l)}`
      : `${formatDateIn(evt.date_start, l)} — ${formatDateIn(evt.date_end, l)}`;
  return bi(one('en'), one('nl'));
}

function getYear(str) {
  return new Date(str).getFullYear();
}

/* ============================================================
   STATE
============================================================ */
const state = {
  filters: { installation: null, year: null, country: null },
  highlighted: null,
};

const pinEls    = {};  // id → .map-pin DOM element
const tlEls     = {};  // id → .ex-tl-event DOM element
const markerMap = {};  // id → Leaflet marker
let leafletMap  = null;
let clusterGroup = null;

/* ============================================================
   BOOT
============================================================ */
window.addEventListener('load', () => {
  // Enrich events with computed status
  EVENTS.forEach(e => { e.status = computeStatus(e); });

  buildStatusBadges();
  buildFilters();
  initMap();
  renderTimeline();
  initDetailCard();
  updateFilterCount();
  localizeSelects();
});

// <select>/<option> cannot hold the .lng spans, so their text is swapped
// whenever the visitor switches language (main.js fires "sitelangchange").
function localizeSelects() {
  const lang = currentLang();
  document.querySelectorAll('.ex-select option[data-en]').forEach(opt => {
    opt.textContent = opt.getAttribute('data-' + lang) || opt.getAttribute('data-en');
  });
  document.querySelectorAll('#filterCountry option[data-country-en]').forEach(opt => {
    opt.textContent = opt.getAttribute('data-country-' + lang) || opt.getAttribute('data-country-en');
  });
}
document.addEventListener('sitelangchange', localizeSelects);

/* ============================================================
   STATUS BADGES (header)
============================================================ */
function buildStatusBadges() {
  const container = document.getElementById('exHeaderStatus');
  if (!container) return;

  const current  = EVENTS.filter(e => e.status === 'current');
  const upcoming = EVENTS.filter(e => e.status === 'upcoming');

  if (current.length) {
    container.insertAdjacentHTML('beforeend', `
      <div class="ex-status-badge ex-status-badge--current">
        <div class="ex-status-badge__dot"></div>
        ${current.length} ${t('nowShowing')}
      </div>`);
  }

  if (upcoming.length) {
    container.insertAdjacentHTML('beforeend', `
      <div class="ex-status-badge ex-status-badge--upcoming">
        <div class="ex-status-badge__dot"></div>
        ${upcoming.length} ${t('upcoming')}
      </div>`);
  }
}

/* ============================================================
   FILTERS
============================================================ */
function buildFilters() {
  // Populate year dropdown (sorted desc)
  const years = [...new Set(EVENTS.map(e => getYear(e.date_start)))].sort((a, b) => b - a);
  const yearSel = document.getElementById('filterYear');
  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSel.appendChild(opt);
  });

  // Populate country dropdown (sorted alpha)
  const countries = [...new Set(EVENTS.map(e => e.country))].sort();
  const countryNl = {};
  EVENTS.forEach(e => { countryNl[e.country] = e.country_nl || e.country; });
  const countrySel = document.getElementById('filterCountry');
  countries.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    opt.setAttribute('data-country-en', c);
    opt.setAttribute('data-country-nl', countryNl[c]);
    countrySel.appendChild(opt);
  });

  // Installation pill buttons
  document.querySelectorAll('.ex-pill[data-filter="installation"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ex-pill[data-filter="installation"]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.filters.installation = btn.dataset.value || null;
      applyFilters();
    });
  });

  yearSel.addEventListener('change', () => {
    state.filters.year = yearSel.value ? +yearSel.value : null;
    applyFilters();
  });

  countrySel.addEventListener('change', () => {
    state.filters.country = countrySel.value || null;
    applyFilters();
  });
}

function getFilteredEvents() {
  return EVENTS.filter(e => {
    if (state.filters.installation && e.installation !== state.filters.installation) return false;
    if (state.filters.year     && getYear(e.date_start) !== state.filters.year)     return false;
    if (state.filters.country  && e.country !== state.filters.country)               return false;
    return true;
  });
}

function applyFilters() {
  const visible = new Set(getFilteredEvents().map(e => e.id));
  updateMapForFilter(visible);
  updateTimelineForFilter(visible);
  updateFilterCount(visible.size);
}

function updateFilterCount(n) {
  const el = document.getElementById('exFilterNum');
  if (!el) return;
  el.textContent = n !== undefined ? n : EVENTS.length;
}

/* ============================================================
   MAP
============================================================ */
function initMap() {
  if (typeof L === 'undefined') {
    console.warn('Leaflet not loaded — map unavailable');
    return;
  }

  leafletMap = L.map('exMap', {
    center: [52, 8],
    zoom: 5,
    zoomControl: false,
    minZoom: 2,
    maxZoom: 12,
    worldCopyJump: true,
  });

  // Dark tile layer — CartoDB Dark Matter
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(leafletMap);

  L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

  // Marker cluster group with custom cluster icons
  clusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    maxClusterRadius: 50,
    iconCreateFunction: cluster => {
      const count = cluster.getChildCount();
      return L.divIcon({
        html: `<div class="map-cluster">${count}</div>`,
        className: '',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
    },
  });

  // Add markers (items without valid coordinates only appear in the timeline)
  const located = EVENTS.filter(e => Array.isArray(e.coordinates));
  located.forEach(addMarker);
  leafletMap.addLayer(clusterGroup);

  // Fit to all event bounds
  if (located.length) {
    const bounds = L.latLngBounds(located.map(e => e.coordinates));
    leafletMap.fitBounds(bounds, { padding: [80, 80], maxZoom: 7 });
  }

  // Map tooltip element
  const tip   = document.getElementById('exMapTip');
  const mapEl = document.getElementById('exMap');

  // Move tooltip with mouse inside the map container
  mapEl.addEventListener('mousemove', e => {
    const rect = mapEl.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
  });

  // On mobile, disable drag scroll that interferes with page scroll
  if (window.matchMedia('(hover: none)').matches) {
    leafletMap.scrollWheelZoom.disable();
  }
}

function addMarker(evt) {
  const inst   = INSTALLATION[evt.installation] || INSTALLATION.connection;
  const status = evt.status;

  const icon = L.divIcon({
    className: '',
    html: `<div class="map-pin map-pin--${evt.installation} map-pin--${status}" data-id="${evt.id}">
             <div class="map-pin__core"></div>
             <div class="map-pin__ring"></div>
             <div class="map-pin__ring-2"></div>
           </div>`,
    iconSize:   [14, 14],
    iconAnchor: [7, 7],
  });

  const marker = L.marker(evt.coordinates, { icon, zIndexOffset: status === 'current' ? 200 : status === 'upcoming' ? 100 : 0 });

  marker.on('add', function() {
    const el = this.getElement();
    if (!el) return;
    const pin = el.querySelector('.map-pin');
    if (pin) pinEls[evt.id] = pin;
  });

  marker.on('mouseover', function() {
    showMapTip(evt);
    setHighlight(evt.id, 'map');
  });

  marker.on('mouseout', function() {
    hideMapTip();
    clearHighlight(evt.id);
  });

  marker.on('click', function() {
    openCard(evt.id);
  });

  markerMap[evt.id] = marker;
  clusterGroup.addLayer(marker);
}

function showMapTip(evt) {
  const tip    = document.getElementById('exMapTip');
  const inst   = INSTALLATION[evt.installation];
  const status = evt.status;

  document.getElementById('exMapTipTag').textContent  = inst.label;
  document.getElementById('exMapTipTag').style.color  = inst.color;
  document.getElementById('exMapTipName').textContent = evt.event_name;
  document.getElementById('exMapTipLoc').innerHTML    = locationHtml(evt);

  document.getElementById('exMapTipDate').innerHTML = dateRangeHtml(evt, true) +
    (status === 'current' ? ' · ' + t('nowShowing') : status === 'upcoming' ? ' · ' + t('upcoming') : '');

  tip.classList.add('is-visible');
}

function hideMapTip() {
  document.getElementById('exMapTip').classList.remove('is-visible');
}

function updateMapForFilter(visibleIds) {
  EVENTS.forEach(evt => {
    const marker = markerMap[evt.id];
    if (!marker) return;
    const el = marker.getElement();
    if (!el) return;
    if (visibleIds.has(evt.id)) {
      el.classList.remove('is-filtered');
    } else {
      el.classList.add('is-filtered');
    }
  });
}

/* ============================================================
   TIMELINE
============================================================ */
function renderTimeline() {
  const container = document.getElementById('exTimeline');
  if (!container) return;

  // Sort: upcoming first → current → past (newest first within each group)
  const sorted = [...EVENTS].sort((a, b) => {
    const order = { upcoming: 0, current: 1, past: 2 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return new Date(b.date_start) - new Date(a.date_start);
  });

  let currentYear = null;
  let idx = 0;

  sorted.forEach(evt => {
    const year = getYear(evt.date_start);

    // Year separator
    if (year !== currentYear) {
      currentYear = year;
      const yearEl = document.createElement('div');
      yearEl.className = 'ex-tl-year';
      yearEl.innerHTML = `<div class="ex-tl-year__label">${year}</div>`;
      container.appendChild(yearEl);
    }

    // Side alternates per event (not per year)
    const side = idx % 2 === 0 ? 'left' : 'right';
    idx++;

    const item = buildTimelineItem(evt, side);
    container.appendChild(item);
    tlEls[evt.id] = item;
  });
}

function buildTimelineItem(evt, side) {
  const inst   = INSTALLATION[evt.installation];
  const status = evt.status;

  const dateStr = dateRangeHtml(evt, false);

  const statusBadge = status === 'current'
    ? `<div class="ex-tl-event__status-badge">● ${t('nowShowing')}</div>`
    : status === 'upcoming'
    ? `<div class="ex-tl-event__status-badge" style="color:var(--teal)">◌ ${t('upcoming')}</div>`
    : '';

  const el = document.createElement('div');
  el.className = [
    'ex-tl-event',
    `ex-tl-event--${side}`,
    `ex-tl-event--inst-${evt.installation}`,
    `ex-tl-event--status-${status}`,
    'reveal',
  ].join(' ');

  el.setAttribute('role', 'listitem');
  el.setAttribute('data-id', evt.id);
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', `${evt.event_name}, ${evt.city}`);

  el.innerHTML = `
    <div class="ex-tl-event__dot">
      <div class="ex-tl-event__dot-inner"></div>
    </div>
    <div class="ex-tl-event__card">
      <div class="ex-tl-event__tag">${inst.label}</div>
      <h3 class="ex-tl-event__name">${escHtml(evt.event_name)}</h3>
      <p class="ex-tl-event__loc">${locationHtml(evt)}</p>
      <p class="ex-tl-event__date">${dateStr}</p>
      ${statusBadge}
    </div>`;

  // Hover: cross-link to map
  el.addEventListener('mouseenter', () => setHighlight(evt.id, 'timeline'));
  el.addEventListener('mouseleave', () => clearHighlight(evt.id));

  // Click / keyboard: open detail card
  el.addEventListener('click', () => openCard(evt.id));
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openCard(evt.id); });

  return el;
}

function updateTimelineForFilter(visibleIds) {
  const container  = document.getElementById('exTimeline');
  const emptyState = document.getElementById('exTlEmpty');
  let anyVisible = false;

  // Show/hide event items
  Object.entries(tlEls).forEach(([id, el]) => {
    if (visibleIds.has(id)) {
      el.classList.remove('is-filtered');
      anyVisible = true;
    } else {
      el.classList.add('is-filtered');
    }
  });

  // Show/hide year labels (hide if all events in that year are filtered)
  document.querySelectorAll('.ex-tl-year').forEach(yearEl => {
    let nextSibling = yearEl.nextElementSibling;
    let hasVisible = false;
    while (nextSibling && !nextSibling.classList.contains('ex-tl-year')) {
      if (!nextSibling.classList.contains('is-filtered')) hasVisible = true;
      nextSibling = nextSibling.nextElementSibling;
    }
    yearEl.style.display = hasVisible ? '' : 'none';
  });

  // Empty state
  if (emptyState) {
    emptyState.classList.toggle('is-visible', !anyVisible);
  }
}

/* ============================================================
   CROSS-LINKING
============================================================ */
function setHighlight(id, source) {
  if (state.highlighted === id) return;
  state.highlighted = id;

  // Highlight pin
  const pin = pinEls[id];
  if (pin) pin.classList.add('is-highlighted');

  // Highlight timeline item
  const tlEl = tlEls[id];
  if (tlEl) {
    tlEl.classList.add('is-highlighted');
    // Scroll into view when hover comes from map, only if already in timeline section
    if (source === 'map' && isInViewport(document.getElementById('timeline-section'))) {
      tlEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

function clearHighlight(id) {
  if (state.highlighted !== id) return;
  state.highlighted = null;

  const pin = pinEls[id];
  if (pin) pin.classList.remove('is-highlighted');

  const tlEl = tlEls[id];
  if (tlEl) tlEl.classList.remove('is-highlighted');
}

function isInViewport(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
}

/* ============================================================
   DETAIL CARD
============================================================ */
function initDetailCard() {
  const overlay = document.getElementById('exCardOverlay');
  const closeBtn = document.getElementById('exCardClose');

  overlay.addEventListener('click', closeCard);
  closeBtn.addEventListener('click', closeCard);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCard();
  });
}

function openCard(id) {
  const evt  = EVENTS.find(e => e.id === id);
  if (!evt) return;

  const inst   = INSTALLATION[evt.installation];
  const status = evt.status;

  const dateStr = dateRangeHtml(evt, false);

  const statusLabel = status === 'current'
    ? `<span class="ex-card__status">● ${t('nowShowing')}</span>`
    : status === 'upcoming'
    ? `<span class="ex-card__status" style="color:var(--teal)">◌ ${t('upcoming')}</span>`
    : '';

  // Optional image (uploaded via the CMS to assets/images/agenda/).
  const mediaHtml = evt.media
    ? (evt.media.includes('youtube') || evt.media.includes('vimeo')
        ? `<iframe src="${escHtml(evt.media)}" frameborder="0" allowfullscreen loading="lazy" style="width:100%;height:100%;"></iframe>`
        : `<img src="${escHtml(evt.media)}" alt="${escHtml(evt.event_name)}" loading="lazy" />`)
    : `<div class="placeholder"><span class="placeholder__label">${t('media')}</span><div class="placeholder__icon">+</div></div>`;

  // Description: NL when Dutch is selected; each language falls back to the other.
  const desc = (evt.description || evt.description_nl)
    ? `<p class="ex-card__desc">${bi(evt.description || evt.description_nl, evt.description_nl || evt.description)}</p>`
    : '';

  document.getElementById('exCardInner').innerHTML = `
    <div class="ex-card__tag ex-card__tag--${evt.installation}">
      <div class="ex-card__tag-dot"></div>
      ${inst.label}
      ${statusLabel}
    </div>
    <h2 class="ex-card__title">${escHtml(evt.event_name)}</h2>
    <p class="ex-card__location">${locationHtml(evt)}</p>
    <p class="ex-card__dates">${dateStr}</p>
    <div class="ex-card__media">${mediaHtml}</div>
    ${desc}
  `;

  document.getElementById('exCard').classList.add('is-open');
  document.getElementById('exCardOverlay').classList.add('is-open');
  document.getElementById('exCard').setAttribute('aria-hidden', 'false');

  // Trap focus in card
  document.getElementById('exCardClose').focus();
}

function closeCard() {
  document.getElementById('exCard').classList.remove('is-open');
  document.getElementById('exCardOverlay').classList.remove('is-open');
  document.getElementById('exCard').setAttribute('aria-hidden', 'true');
}

/* ============================================================
   SCROLL REVEAL (timeline items)
============================================================ */
function initScrollReveal() {
  // Reuse the global reveal observer from main.js if available,
  // but the timeline items are added after DOMContentLoaded so
  // we need our own observer here.
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('is-visible'), delay);
      revealObs.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  // Observe all .reveal elements inside the timeline (added by renderTimeline)
  document.querySelectorAll('#exTimeline .reveal').forEach(el => revealObs.observe(el));

  // Also wire reveal for the static .reveal elements on this page
  document.querySelectorAll('.ex-tl-header .reveal, .ex-tl-header.reveal').forEach(el => revealObs.observe(el));
}

/* ============================================================
   MAP STICKY — fade map as timeline scrolls into view
============================================================ */
(function initMapFade() {
  const mapSection = document.getElementById('map-section');
  const tlSection  = document.getElementById('timeline-section');
  if (!mapSection || !tlSection) return;

  window.addEventListener('scroll', () => {
    const tlTop    = tlSection.getBoundingClientRect().top;
    const viewH    = window.innerHeight;
    // Start fading when timeline is 60% into view
    const progress = Math.max(0, Math.min(1, (viewH - tlTop) / (viewH * 0.6)));
    mapSection.style.opacity = String(1 - progress * 0.7);
  }, { passive: true });
})();

/* ============================================================
   REVEAL OBSERVER INIT (fires after timeline rendered)
============================================================ */
window.addEventListener('load', () => {
  // Small delay so DOM is fully populated by renderTimeline()
  setTimeout(initScrollReveal, 50);
});
