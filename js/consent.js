/* ============================================================
   COOKIE CONSENT (Google Consent Mode v2)
   The inline <head> snippet on every page sets all consent to
   "denied" by default, re-applies a stored choice and loads GTM.
   This file only handles the banner UI and the
   "Cookie settings" links ([data-cookie-settings]).
   Storage key must match the <head> snippet: 'cookieConsent'.
============================================================ */
(function initConsent() {
  const KEY = 'cookieConsent';

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function saveChoice(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  const banner = document.createElement('div');
  banner.className = 'consent';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('aria-labelledby', 'consentTitle');
  banner.hidden = true;
  banner.innerHTML =
    '<div class="consent__inner">' +
      '<p class="consent__text">' +
        '<strong class="consent__title" id="consentTitle">' +
          '<span class="lng lng--en">Cookies</span><span class="lng lng--nl">Cookies</span>' +
        '</strong> ' +
        '<span class="lng lng--en">This site uses Google Analytics for anonymous visitor statistics, only if you agree. No advertising cookies.</span>' +
        '<span class="lng lng--nl">Deze site gebruikt Google Analytics voor anonieme bezoekersstatistieken, alleen als je daarmee akkoord gaat. Geen advertentiecookies.</span>' +
      '</p>' +
      '<div class="consent__actions">' +
        '<button type="button" class="consent__btn" data-consent="granted">' +
          '<span class="lng lng--en">Accept</span><span class="lng lng--nl">Accepteren</span></button>' +
        '<button type="button" class="consent__btn" data-consent="denied">' +
          '<span class="lng lng--en">Decline</span><span class="lng lng--nl">Weigeren</span></button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(banner);

  function show() {
    banner.hidden = false;
    // next frame so the slide-in transition runs
    requestAnimationFrame(() => banner.classList.add('is-visible'));
  }

  function hide() {
    banner.classList.remove('is-visible');
    setTimeout(() => { banner.hidden = true; }, 400);
  }

  banner.querySelectorAll('[data-consent]').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.consent;
      saveChoice(value);
      gtag('consent', 'update', {
        analytics_storage: value,
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      if (value === 'denied') clearGaCookies();
      hide();
    });
  });

  // Withdrawing consent: remove existing _ga cookies (GA won't clear them itself)
  function clearGaCookies() {
    const host = location.hostname;
    const domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid') {
        domains.forEach(d => {
          document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  // "Cookie settings" links reopen the banner
  document.querySelectorAll('[data-cookie-settings]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      // close the nav overlay first if the link lives inside it
      const navBtn = document.getElementById('navBtn');
      if (document.body.classList.contains('nav-open') && navBtn) navBtn.click();
      show();
    });
  });

  // Custom cursor hover state (main.js only wires elements present at load)
  banner.querySelectorAll('button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  const stored = getChoice();
  if (stored !== 'granted' && stored !== 'denied') show();
})();
