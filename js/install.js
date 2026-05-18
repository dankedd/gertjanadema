/* ============================================================
   INSTALL.JS — Modal system, gallery keyboard nav, image counter
   Loaded on all installation/artwork pages, after main.js.
============================================================ */

/* ============================================================
   MODAL SYSTEM
============================================================ */
(function initModals() {
  const triggers = document.querySelectorAll('[data-modal]');
  const modals   = document.querySelectorAll('.exh-modal');
  if (!modals.length) return;

  function openModal(id) {
    const modal = document.getElementById('modal-' + id);
    if (!modal) return;

    // For video modals: lazy-create the YouTube iframe if data-yt is set
    if (modal.classList.contains('exh-modal--video')) {
      const ytId = modal.dataset.yt;
      const wrap  = modal.querySelector('.exh-modal__video-wrap');
      if (ytId && wrap && !wrap.querySelector('iframe')) {
        const iframe = document.createElement('iframe');
        iframe.src             = 'https://www.youtube.com/embed/' + ytId
                               + '?autoplay=1&rel=0&modestbranding=1&enablejsapi=1';
        iframe.allow           = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;
        // Replace placeholder content with iframe
        wrap.innerHTML = '';
        wrap.appendChild(iframe);
      }
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Shift focus to close button for accessibility
    const closeBtn = modal.querySelector('.exh-modal__close');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 60);
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    // Stop video playback by removing the iframe
    if (modal.classList.contains('exh-modal--video')) {
      const wrap   = modal.querySelector('.exh-modal__video-wrap');
      const iframe = wrap && wrap.querySelector('iframe');
      if (iframe) iframe.remove();
    }

    // Only restore body scroll if no other modal is open
    const anyOpen = document.querySelector('.exh-modal.is-open');
    if (!anyOpen) document.body.style.overflow = '';
  }

  // Triggers
  triggers.forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });

  // Close via backdrop or close button
  modals.forEach(modal => {
    modal.querySelector('.exh-modal__backdrop')
        ?.addEventListener('click', () => closeModal(modal));
    modal.querySelector('.exh-modal__close')
        ?.addEventListener('click', () => closeModal(modal));
  });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    modals.forEach(m => { if (m.classList.contains('is-open')) closeModal(m); });
  });
})();

/* ============================================================
   GALLERY KEYBOARD NAVIGATION (← →)
   Does not fire when a modal is open.
============================================================ */
(function initGalleryKeys() {
  const carousel = document.querySelector('.exh-gallery [data-carousel]');
  if (!carousel) return;

  document.addEventListener('keydown', e => {
    if (document.querySelector('.exh-modal.is-open')) return;
    if (e.key === 'ArrowLeft')  carousel.querySelector('.carousel__btn--prev')?.click();
    if (e.key === 'ArrowRight') carousel.querySelector('.carousel__btn--next')?.click();
  });
})();

/* ============================================================
   IMAGE COUNTER  (e.g. "2 / 6")
   Watches dot-class mutations set by the carousel in main.js.
============================================================ */
(function initCounter() {
  const carousel = document.querySelector('.exh-gallery [data-carousel]');
  if (!carousel) return;

  const counter = carousel.querySelector('.carousel__counter');
  const dotsEl  = carousel.querySelector('.carousel__dots');
  if (!counter || !dotsEl) return;

  function updateCounter() {
    const allDots   = dotsEl.querySelectorAll('.carousel__dot');
    const activeDot = dotsEl.querySelector('.carousel__dot.is-active');
    if (!allDots.length) return;
    const index = Array.from(allDots).indexOf(activeDot);
    counter.textContent = (index + 1) + ' / ' + allDots.length;
  }

  // Observe class changes on the dots container triggered by carousel in main.js
  const obs = new MutationObserver(updateCounter);
  obs.observe(dotsEl, { attributes: true, subtree: true, attributeFilter: ['class'] });

  // Initial value — dots are built by main.js carousel init
  // Give main.js a tick to build dots before reading them
  setTimeout(updateCounter, 0);
})();
