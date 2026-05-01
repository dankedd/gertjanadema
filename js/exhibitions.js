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

const EVENTS = [
  // ── 2026 ──────────────────────────────────────────────────
  {
    id: 'e01',
    installation: 'connection',
    event_name: 'Kronach Leuchtet 2026',
    city: 'Kronach',
    country: 'Germany',
    coordinates: [50.2397, 11.3279],
    date_start: '2026-04-24',
    date_end: '2026-05-02',
    description: null,
  },
  // ── 2025 ──────────────────────────────────────────────────
  {
    id: 'e02',
    installation: 'connection',
    event_name: 'Lichtbeeldenroute Zwolle',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5168, 6.0830],
    date_start: '2025-12-18',
    date_end: '2026-01-04',
    description: null,
  },
  {
    id: 'e03',
    installation: 'fragmented',
    event_name: 'Deltion School Project',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5210, 6.0920],
    date_start: '2025-12-15',
    date_end: '2025-12-17',
    description: 'Fragmented Appearances presented as part of a school project at Deltion College, Zwolle.',
  },
  {
    id: 'e04',
    installation: 'marbles',
    event_name: 'Enschede Lights Up',
    city: 'Enschede',
    country: 'Netherlands',
    coordinates: [52.2215, 6.8937],
    date_start: '2025-12-11',
    date_end: '2025-12-14',
    description: null,
  },
  {
    id: 'e05',
    installation: 'marbles',
    event_name: 'Light Up Wakefield',
    city: 'Wakefield',
    country: 'United Kingdom',
    coordinates: [53.6830, -1.4977],
    date_start: '2025-11-21',
    date_end: '2025-11-23',
    description: null,
  },
  {
    id: 'e06',
    installation: 'melting',
    event_name: 'Vonk Festival Utrecht',
    city: 'Utrecht',
    country: 'Netherlands',
    coordinates: [52.0907, 5.1214],
    date_start: '2025-10-07',
    date_end: '2025-10-25',
    description: null,
  },
  {
    id: 'e07',
    installation: 'marbles',
    event_name: 'Goldstuecke Gelsenkirchen-Buer',
    city: 'Gelsenkirchen',
    country: 'Germany',
    coordinates: [51.5177, 7.0857],
    date_start: '2025-10-02',
    date_end: '2025-10-05',
    description: null,
  },
  {
    id: 'e08',
    installation: 'connection',
    event_name: 'Visualia Pula 2025',
    city: 'Pula',
    country: 'Croatia',
    coordinates: [44.8666, 13.8496],
    date_start: '2025-09-18',
    date_end: '2025-09-20',
    description: null,
  },
  {
    id: 'e09',
    installation: 'marbles',
    event_name: 'Fjoertoer Terschelling',
    city: 'Terschelling',
    country: 'Netherlands',
    coordinates: [53.4017, 5.2122],
    date_start: '2025-03-28',
    date_end: '2025-03-29',
    description: null,
  },
  {
    id: 'e10',
    installation: 'marbles',
    event_name: 'Zandvoort Light Walk',
    city: 'Zandvoort',
    country: 'Netherlands',
    coordinates: [52.3717, 4.5328],
    date_start: '2025-02-15',
    date_end: '2025-02-15',
    description: 'Marbles & Fragmented Appearances presented at the Zandvoort Light Walk.',
  },
  {
    id: 'e11',
    installation: 'marbles',
    event_name: 'Geneva Lux',
    city: 'Geneva',
    country: 'Switzerland',
    coordinates: [46.2044, 6.1432],
    date_start: '2025-01-13',
    date_end: '2025-02-02',
    description: null,
  },
  // ── 2024 ──────────────────────────────────────────────────
  {
    id: 'e12',
    installation: 'melting',
    event_name: 'Lichtjeswandeling Engelse Werk Zwolle',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5140, 6.0760],
    date_start: '2024-12-27',
    date_end: '2024-12-27',
    description: null,
  },
  {
    id: 'e13',
    installation: 'marbles',
    event_name: 'Academiehuis Zwolle',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5178, 6.0845],
    date_start: '2024-12-13',
    date_end: '2025-01-03',
    description: null,
  },
  {
    id: 'e14',
    installation: 'fragmented',
    event_name: 'Valoilmiö Hämeenlinna',
    city: 'Hämeenlinna',
    country: 'Finland',
    coordinates: [60.9960, 24.4641],
    date_start: '2024-11-21',
    date_end: '2024-11-23',
    description: null,
  },
  {
    id: 'e15',
    installation: 'marbles',
    event_name: 'Wonderlicht Zaandam',
    city: 'Zaandam',
    country: 'Netherlands',
    coordinates: [52.4380, 4.8308],
    date_start: '2024-10-31',
    date_end: '2024-11-01',
    description: 'Marbles & Fragmented Appearances at Wonderlicht Zaandam.',
  },
  {
    id: 'e16',
    installation: 'marbles',
    event_name: 'Kronach Leuchtet 2024',
    city: 'Kronach',
    country: 'Germany',
    coordinates: [50.2397, 11.3279],
    date_start: '2024-04-26',
    date_end: '2024-05-04',
    description: null,
  },
  {
    id: 'e17',
    installation: 'melting',
    event_name: 'Makersfestival Zwolle',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5155, 6.0800],
    date_start: '2024-03-16',
    date_end: '2024-03-16',
    description: null,
  },
  {
    id: 'e18',
    installation: 'marbles',
    event_name: 'Caprera Licht Festival Bloemendaal',
    city: 'Bloemendaal',
    country: 'Netherlands',
    coordinates: [52.4009, 4.6214],
    date_start: '2024-02-20',
    date_end: '2024-03-03',
    description: null,
  },
  {
    id: 'e19',
    installation: 'marbles',
    event_name: 'Canary Wharf Winter Lights London 2024',
    city: 'London',
    country: 'United Kingdom',
    coordinates: [51.5045, -0.0199],
    date_start: '2024-01-18',
    date_end: '2024-02-03',
    description: null,
  },
  // ── 2023 ──────────────────────────────────────────────────
  {
    id: 'e20',
    installation: 'marbles',
    event_name: 'Jyväskylä City of Light 2023',
    city: 'Jyväskylä',
    country: 'Finland',
    coordinates: [62.2415, 25.7209],
    date_start: '2023-09-28',
    date_end: '2023-10-07',
    description: null,
  },
  {
    id: 'e21',
    installation: 'marbles',
    event_name: 'Maker Faire Hannover',
    city: 'Hannover',
    country: 'Germany',
    coordinates: [52.3759, 9.7320],
    date_start: '2023-08-19',
    date_end: '2023-08-20',
    description: null,
  },
  {
    id: 'e22',
    installation: 'fragmented',
    event_name: 'Personeelsfeest Gemeente Zwolle',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5168, 6.0830],
    date_start: '2023-06-23',
    date_end: '2023-06-23',
    description: null,
  },
  {
    id: 'e23',
    installation: 'marbles',
    event_name: 'Bright Festival Brussels',
    city: 'Brussels',
    country: 'Belgium',
    coordinates: [50.8503, 4.3517],
    date_start: '2023-02-16',
    date_end: '2023-02-19',
    description: null,
  },
  {
    id: 'e24',
    installation: 'fragmented',
    event_name: 'Copenhagen Light Festival',
    city: 'Copenhagen',
    country: 'Denmark',
    coordinates: [55.6761, 12.5683],
    date_start: '2023-02-02',
    date_end: '2023-02-26',
    description: null,
  },
  {
    id: 'e25',
    installation: 'marbles',
    event_name: 'Academiehuis / Grote Kerk Zwolle',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5178, 6.0845],
    date_start: '2023-01-20',
    date_end: '2023-01-22',
    description: null,
  },
  {
    id: 'e26',
    installation: 'marbles',
    event_name: 'Grand Opening Academiehuis / Grote Kerk Zwolle',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5178, 6.0840],
    date_start: '2023-01-19',
    date_end: '2023-01-19',
    description: null,
  },
  {
    id: 'e27',
    installation: 'fragmented',
    event_name: 'Winter Lights Canary Wharf London 2023',
    city: 'London',
    country: 'United Kingdom',
    coordinates: [51.5045, -0.0199],
    date_start: '2023-01-18',
    date_end: '2023-01-28',
    description: null,
  },
  // ── 2022 ──────────────────────────────────────────────────
  {
    id: 'e28',
    installation: 'fragmented',
    event_name: 'Lichtjeswandeling Zwolle',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5140, 6.0760],
    date_start: '2022-12-27',
    date_end: '2022-12-27',
    description: null,
  },
  {
    id: 'e29',
    installation: 'fragmented',
    event_name: 'The Hague Highlights',
    city: 'The Hague',
    country: 'Netherlands',
    coordinates: [52.0705, 4.3007],
    date_start: '2022-12-14',
    date_end: '2022-12-18',
    description: null,
  },
  {
    id: 'e30',
    installation: 'marbles',
    event_name: 'Essen Light Festival',
    city: 'Essen',
    country: 'Germany',
    coordinates: [51.4556, 7.0116],
    date_start: '2022-09-30',
    date_end: '2022-10-09',
    description: null,
  },
  {
    id: 'e31',
    installation: 'marbles',
    event_name: 'Visualia Pula 2022',
    city: 'Pula',
    country: 'Croatia',
    coordinates: [44.8666, 13.8496],
    date_start: '2022-09-15',
    date_end: '2022-09-17',
    description: null,
  },
  {
    id: 'e32',
    installation: 'fragmented',
    event_name: 'Fabriek Magnifique',
    city: 'Rotterdam',
    country: 'Netherlands',
    coordinates: [51.9225, 4.4792],
    date_start: '2022-07-23',
    date_end: '2022-07-24',
    description: null,
  },
  {
    id: 'e33',
    installation: 'fragmented',
    event_name: 'IJsseltheaterfietstocht',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5155, 6.0820],
    date_start: '2022-05-28',
    date_end: '2022-05-28',
    description: null,
  },
  // ── 2021 ──────────────────────────────────────────────────
  {
    id: 'e34',
    installation: 'fragmented',
    event_name: 'Co-Workersday',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5168, 6.0830],
    date_start: '2021-12-11',
    date_end: '2021-12-11',
    description: null,
  },
  {
    id: 'e35',
    installation: 'fragmented',
    event_name: 'Proto Zwolle 2021',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5168, 6.0830],
    date_start: '2021-06-24',
    date_end: '2021-07-11',
    description: null,
  },
  // ── 2020 ──────────────────────────────────────────────────
  {
    id: 'e36',
    installation: 'fragmented',
    event_name: 'Berlin Leuchtet',
    city: 'Berlin',
    country: 'Germany',
    coordinates: [52.5200, 13.4050],
    date_start: '2020-09-25',
    date_end: '2020-10-04',
    description: null,
  },
  {
    id: 'e37',
    installation: 'fragmented',
    event_name: 'University of Twente',
    city: 'Enschede',
    country: 'Netherlands',
    coordinates: [52.2395, 6.8567],
    date_start: '2020-08-31',
    date_end: '2020-09-15',
    description: null,
  },
  {
    id: 'e38',
    installation: 'fragmented',
    event_name: 'Wie is er Doorgedraaid? — Zwolle',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5168, 6.0830],
    date_start: '2020-08-29',
    date_end: '2020-08-29',
    description: 'Fragmented Appearances & Humming around and around — Wie is er Doorgedraaid?',
  },
  {
    id: 'e39',
    installation: 'fragmented',
    event_name: 'Luminale 2020 Frankfurt/Offenbach',
    city: 'Frankfurt',
    country: 'Germany',
    coordinates: [50.1109, 8.6821],
    date_start: '2020-03-12',
    date_end: '2020-03-15',
    description: null,
  },
  // ── 2019 ──────────────────────────────────────────────────
  {
    id: 'e40',
    installation: 'fragmented',
    event_name: 'Orbitfest Groningen — Artist in Focus',
    city: 'Groningen',
    country: 'Netherlands',
    coordinates: [53.2194, 6.5665],
    date_start: '2019-12-21',
    date_end: '2019-12-22',
    description: 'Fragmented Appearances & Humming around and around — Orbitfest Groningen, artist in focus.',
  },
  {
    id: 'e41',
    installation: 'fragmented',
    event_name: 'De Tuin der Lusten',
    city: 'Zwolle',
    country: 'Netherlands',
    coordinates: [52.5168, 6.0830],
    date_start: '2019-12-12',
    date_end: '2019-12-14',
    description: null,
  },
  {
    id: 'e42',
    installation: 'fragmented',
    event_name: 'Jyväskylä City of Light 2019',
    city: 'Jyväskylä',
    country: 'Finland',
    coordinates: [62.2415, 25.7209],
    date_start: '2019-09-26',
    date_end: '2019-09-28',
    description: null,
  },
  // ── 2018 ──────────────────────────────────────────────────
  {
    id: 'e43',
    installation: 'fragmented',
    event_name: 'Woest & Bijster — Bennekom',
    city: 'Bennekom',
    country: 'Netherlands',
    coordinates: [51.9745, 5.6474],
    date_start: '2018-10-20',
    date_end: '2018-10-28',
    description: 'Fragmented Appearances & Humming around and around — opening act for Woest & Bijster, Bennekom.',
  },
];

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

function formatDate(str) {
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(str) {
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
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
});

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
        ${current.length} Now showing
      </div>`);
  }

  if (upcoming.length) {
    container.insertAdjacentHTML('beforeend', `
      <div class="ex-status-badge ex-status-badge--upcoming">
        <div class="ex-status-badge__dot"></div>
        ${upcoming.length} Upcoming
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
  const countrySel = document.getElementById('filterCountry');
  countries.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
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

  // Add all markers
  EVENTS.forEach(addMarker);
  leafletMap.addLayer(clusterGroup);

  // Fit to all event bounds
  const bounds = L.latLngBounds(EVENTS.map(e => e.coordinates));
  leafletMap.fitBounds(bounds, { padding: [80, 80], maxZoom: 7 });

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
  document.getElementById('exMapTipLoc').textContent  = `${evt.city}, ${evt.country}`;

  const dateStr = evt.date_start === evt.date_end
    ? formatDate(evt.date_start)
    : `${formatDateShort(evt.date_start)} — ${formatDateShort(evt.date_end)}`;

  document.getElementById('exMapTipDate').textContent = dateStr +
    (status === 'current' ? ' · Now showing' : status === 'upcoming' ? ' · Upcoming' : '');

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

  const dateStr = evt.date_start === evt.date_end
    ? formatDate(evt.date_start)
    : `${formatDate(evt.date_start)} — ${formatDate(evt.date_end)}`;

  const statusBadge = status === 'current'
    ? `<div class="ex-tl-event__status-badge">● Now showing</div>`
    : status === 'upcoming'
    ? `<div class="ex-tl-event__status-badge" style="color:var(--teal)">◌ Upcoming</div>`
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
      <h3 class="ex-tl-event__name">${evt.event_name}</h3>
      <p class="ex-tl-event__loc">${evt.city}, ${evt.country}</p>
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

  const dateStr = evt.date_start === evt.date_end
    ? formatDate(evt.date_start)
    : `${formatDate(evt.date_start)} — ${formatDate(evt.date_end)}`;

  const statusLabel = status === 'current'
    ? `<span class="ex-card__status">● Now showing</span>`
    : status === 'upcoming'
    ? `<span class="ex-card__status" style="color:var(--teal)">◌ Upcoming</span>`
    : '';

  const mediaHtml = evt.media
    ? (evt.media.includes('youtube') || evt.media.includes('vimeo')
        ? `<iframe src="${evt.media}" frameborder="0" allowfullscreen loading="lazy" style="width:100%;height:100%;"></iframe>`
        : `<img src="${evt.media}" alt="${evt.event_name}" loading="lazy" />`)
    : `<div class="placeholder"><span class="placeholder__label">Image / Video</span><div class="placeholder__icon">+</div></div>`;

  document.getElementById('exCardInner').innerHTML = `
    <div class="ex-card__tag ex-card__tag--${evt.installation}">
      <div class="ex-card__tag-dot"></div>
      ${inst.label}
      ${statusLabel}
    </div>
    <h2 class="ex-card__title">${evt.event_name}</h2>
    <p class="ex-card__location">${evt.city}, ${evt.country}</p>
    <p class="ex-card__dates">${dateStr}</p>
    <div class="ex-card__media">${mediaHtml}</div>
    ${evt.description ? `<p class="ex-card__desc">${evt.description}</p>` : ''}
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
