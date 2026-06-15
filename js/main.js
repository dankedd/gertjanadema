/* ============================================================
   GERTJAN — main.js
============================================================ */

/* ============================================================
   LANGUAGE TOGGLE  (NL / EN)
   The <head> inline script sets data-lang on <html> before paint
   to avoid a flash. This wires the toggle buttons and persists choice.
============================================================ */
(function initLang() {
  const root = document.documentElement;
  const buttons = document.querySelectorAll('.lang-toggle [data-lang-set]');

  function setLang(l) {
    if (l !== 'nl' && l !== 'en') l = 'en';
    root.setAttribute('data-lang', l);
    root.lang = l;
    try { localStorage.setItem('siteLang', l); } catch (e) {}
    buttons.forEach(b => b.classList.toggle('is-active', b.dataset.langSet === l));
  }

  buttons.forEach(b => b.addEventListener('click', () => setLang(b.dataset.langSet)));

  // Sync active state with whatever the head script already applied
  setLang(root.getAttribute('data-lang') || 'en');
})();

/* ============================================================
   LOADER
============================================================ */
const loader    = document.getElementById('loader');
const loaderBar = loader?.querySelector('.loader__bar');

function finishLoader() {
  loader.classList.add('done');
  setTimeout(() => { loader.style.display = 'none'; }, 700);
}

if (loaderBar) {
  loaderBar.style.width = '60%';
  window.addEventListener('load', () => {
    loaderBar.style.width = '100%';
    setTimeout(finishLoader, 400);
  });
  // Fallback — don't block if load fires late
  setTimeout(() => { if (!loader.classList.contains('done')) finishLoader(); }, 4000);
}

/* ============================================================
   CUSTOM CURSOR
============================================================ */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');

if (cursor && window.matchMedia('(hover: hover)').matches) {
  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function followRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(followRing);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ============================================================
   NAVIGATION
============================================================ */
const navBtn   = document.getElementById('navBtn');
const nav      = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav__link');

function openNav() {
  navBtn.classList.add('is-open');
  nav.classList.add('is-open');
  nav.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('nav-open');
}

function closeNav() {
  navBtn.classList.remove('is-open');
  nav.classList.remove('is-open');
  nav.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.body.classList.remove('nav-open');
}

navBtn.addEventListener('click', () => {
  nav.classList.contains('is-open') ? closeNav() : openNav();
});

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    e.preventDefault();
    closeNav();

    if (!href.startsWith('#')) {
      // Cross-page link — let nav close animation start, then navigate
      setTimeout(() => { window.location.href = href; }, 380);
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 680);
    }
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
});

/* Flip hamburger colour over the light About section */
const aboutSection = document.getElementById('about');
if (aboutSection) {
  const btnObserver = new IntersectionObserver(
    ([entry]) => navBtn.classList.toggle('is-dark', entry.isIntersecting),
    { threshold: 0.2 }
  );
  btnObserver.observe(aboutSection);
}

/* ============================================================
   HERO VIDEO
============================================================ */
const heroVideo    = document.getElementById('heroVideo');
const heroFallback = document.getElementById('heroFallback');

if (heroVideo) {
  const showFallback = () => {
    heroFallback.style.opacity = '1';
    heroVideo.style.display    = 'none';
  };

  heroVideo.addEventListener('canplay', () => {
    heroVideo.classList.add('is-ready');
    heroFallback.style.transition = 'opacity 1s ease';
    heroFallback.style.opacity    = '0';
  });

  heroVideo.addEventListener('error', showFallback);

  // If video hasn't started playing in 3s, show fallback
  const fallbackTimer = setTimeout(showFallback, 3000);
  heroVideo.addEventListener('canplay', () => clearTimeout(fallbackTimer));
}

/* ============================================================
   PARALLAX — hero content drifts up on scroll
============================================================ */
const heroContent = document.querySelector('.hero__content');
const heroMedia   = document.querySelector('.hero__media');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (!heroContent) return;
  heroContent.style.transform = `translateY(${y * 0.28}px)`;
  heroContent.style.opacity   = String(Math.max(0, 1 - y / 550));
  if (heroMedia) heroMedia.style.transform = `translateY(${y * 0.14}px)`;
}, { passive: true });

/* ============================================================
   SCROLL REVEAL (Intersection Observer)
============================================================ */
const revealEls = document.querySelectorAll('.reveal');

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('is-visible'), delay);
    revealObs.unobserve(el);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObs.observe(el));

/* ============================================================
   CONNECTION CANVAS — particle network
============================================================ */
(function initCanvas() {
  const canvas = document.getElementById('connectionCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, mouse = { x: null, y: null };

  const PARTICLE_AREA = 9000;  // one particle per N px²
  const LINK_DIST     = 130;
  const MOUSE_DIST    = 160;
  const SPEED         = 0.45;
  const COLOR_PART    = 'rgba(33,131,128,';
  const COLOR_MOUSE   = 'rgba(255,188,66,';

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initParticles();
  }

  function initParticles() {
    const count = Math.min(Math.floor((W * H) / PARTICLE_AREA), 90);
    particles = Array.from({ length: count }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r:  Math.random() * 1.5 + 0.8,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      // move
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_PART + '0.7)';
      ctx.fill();

      // link to nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q    = particles[j];
        const dx   = p.x - q.x;
        const dy   = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = COLOR_PART + alpha + ')';
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }

      // link to mouse
      if (mouse.x !== null) {
        const dx   = p.x - mouse.x;
        const dy   = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_DIST) {
          const alpha = (1 - dist / MOUSE_DIST) * 0.55;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = COLOR_MOUSE + alpha + ')';
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', e => {
    const r   = canvas.getBoundingClientRect();
    mouse.x   = e.clientX - r.left;
    mouse.y   = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = mouse.y = null; });
  canvas.addEventListener('touchmove', e => {
    const r   = canvas.getBoundingClientRect();
    const t   = e.touches[0];
    mouse.x   = t.clientX - r.left;
    mouse.y   = t.clientY - r.top;
  }, { passive: true });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
})();

/* ============================================================
   FRAGMENTED PIECES — subtle parallax on mouse move
============================================================ */
(function fragParallax() {
  const stage  = document.querySelector('.fragmented__stage');
  const pieces = document.querySelectorAll('.frag-piece');
  if (!stage || !pieces.length) return;

  const depths = [0.018, 0.030, 0.022, 0.014, 0.040];

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    pieces.forEach((piece, i) => {
      const factor = depths[i] || 0.02;
      const tx = dx * factor;
      const ty = dy * factor;
      // preserve existing rotation
      const base = piece.style.transform.replace(/translate\([^)]+\)\s*/g, '');
      piece.style.transform = `translate(${tx}px, ${ty}px) ${base}`;
    });
  });
})();

/* ============================================================
   TIMELINE COUNTER ANIMATION
   (numbers count up when scrolled into view)
============================================================ */
(function timelineAnimation() {
  const items = document.querySelectorAll('.timeline__item');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateX(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach((item, i) => {
    item.style.opacity    = '0';
    item.style.transform  = 'translateX(-30px)';
    item.style.transition = `opacity 0.7s ease ${i * 0.07}s, transform 0.7s ease ${i * 0.07}s`;
    obs.observe(item);
  });
})();

/* ============================================================
   MARBLE GRID — subtle tilt on hover
============================================================ */
document.querySelectorAll('.marble-cell').forEach(cell => {
  cell.addEventListener('mousemove', e => {
    const r  = cell.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const dx = (e.clientX - cx) / (r.width  / 2);
    const dy = (e.clientY - cy) / (r.height / 2);
    cell.style.transform = `perspective(800px) rotateY(${dx * 3}deg) rotateX(${-dy * 3}deg)`;
  });
  cell.addEventListener('mouseleave', () => {
    cell.style.transform = '';
    cell.style.transition = 'transform 0.6s ease';
  });
  cell.addEventListener('mouseenter', () => {
    cell.style.transition = 'transform 0.15s ease';
  });
});

/* ============================================================
   CV — TIMELINE TRACK ANIMATION
   Adds .in-view to .cv-tl-group when it enters the viewport,
   which triggers the vertical line scaleY animation in cv.css.
============================================================ */
(function cvTimelineTracks() {
  const groups = document.querySelectorAll('.cv-tl-group');
  if (!groups.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  groups.forEach(g => obs.observe(g));
})();

/* ============================================================
   CV — YOUTUBE EMBED ACTIVATOR
   Replace the placeholder inner content with a real iframe
   when a valid data-src is set on .yt-embed.
   Usage: <div class="yt-embed" data-src="https://youtube.com/embed/VIDEOID">
============================================================ */
(function activateYouTube() {
  document.querySelectorAll('.yt-embed[data-src]').forEach(el => {
    const src = el.dataset.src || '';
    // Only activate if it looks like a real embed URL (contains a video ID)
    if (!src.includes('youtube.com/embed/') || src.endsWith('VIDEO_ID_HERE')) return;

    const iframe = document.createElement('iframe');
    iframe.src              = src;
    iframe.allow            = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen  = true;
    iframe.loading          = 'lazy';
    iframe.title            = 'Video';
    // Hide the placeholder inner content, show iframe
    const inner = el.querySelector('.yt-embed__inner');
    if (inner) inner.style.display = 'none';
    el.appendChild(iframe);
  });
})();

/* ============================================================
   YOUTUBE BACKGROUND VIDEO (index.html hero)

   To change the video:
     1. Get the YouTube URL, e.g. https://youtu.be/Y0l7m2XTkIw
     2. Copy the 11-character ID that follows youtu.be/
     3. Paste it as the value of YT_VIDEO_ID below
============================================================ */
(function initYTBackground() {
  const YT_VIDEO_ID = 'Y0l7m2XTkIw'; // ← paste YouTube video ID here

  const playerEl = document.getElementById('ytBgPlayer');
  const fallback  = document.getElementById('heroFallback');
  if (!playerEl) return; // not on index.html

  let playing = false;

  // Give up waiting after 6 seconds — keep animated orbs visible
  const giveUpTimer = setTimeout(() => {
    if (!playing && fallback) fallback.style.opacity = '1';
  }, 6000);

  function showVideo() {
    if (playing) return;
    playing = true;
    clearTimeout(giveUpTimer);
    // The YT API replaced #ytBgPlayer div with an iframe; fade it in
    const iframe = document.getElementById('ytBgPlayer');
    if (iframe) iframe.classList.add('is-ready');
    if (fallback) {
      fallback.style.transition = 'opacity 1.4s ease';
      fallback.style.opacity    = '0';
    }
  }

  function showFallback() {
    if (fallback) fallback.style.opacity = '1';
    clearTimeout(giveUpTimer);
  }

  // Defined before the script tag is injected so the API can call it
  window.onYouTubeIframeAPIReady = function () {
    /* eslint-disable no-undef */
    new YT.Player('ytBgPlayer', {
      videoId: YT_VIDEO_ID,
      playerVars: {
        autoplay:        1,
        mute:            1,
        loop:            1,
        playlist:        YT_VIDEO_ID, // required for loop
        controls:        0,
        rel:             0,
        iv_load_policy:  3, // no annotations
        modestbranding:  1,
        disablekb:       1,
        fs:              0,
        playsinline:     1,
        enablejsapi:     1,
        vq:              'hd1080',
      },
      events: {
        onReady(e) {
          // Belt-and-suspenders: mute + play in case autoplay was delayed
          e.target.mute();
          e.target.setVolume(0);
          e.target.playVideo();
        },
        onStateChange(e) {
          if (e.data === YT.PlayerState.PLAYING) showVideo();
        },
        onError: showFallback,
      },
    });
    /* eslint-enable no-undef */
  };

  // Inject the YouTube IFrame API — fires onYouTubeIframeAPIReady when ready
  const script  = document.createElement('script');
  script.src    = 'https://www.youtube.com/iframe_api';
  script.async  = true;
  document.head.appendChild(script);
})();

/* ============================================================
   CAROUSEL
   Initialises every [data-carousel] element on the page.
   Features: arrow buttons, dot indicators, touch/swipe, auto-advance.
============================================================ */
(function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track  = carousel.querySelector('.carousel__track');
    const slides = carousel.querySelectorAll('.carousel__slide');
    const dotsEl = carousel.querySelector('.carousel__dots');
    const btnPrev = carousel.querySelector('.carousel__btn--prev');
    const btnNext = carousel.querySelector('.carousel__btn--next');

    if (!track || slides.length < 2) {
      // Single slide — hide controls
      if (btnPrev) btnPrev.style.display = 'none';
      if (btnNext) btnNext.style.display = 'none';
      return;
    }

    let current   = 0;
    let autoTimer = null;
    const total   = slides.length;

    // Build dots
    const dots = Array.from({ length: total }, (_, i) => {
      const d = document.createElement('button');
      d.className  = 'carousel__dot' + (i === 0 ? ' is-active' : '');
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
      return d;
    });

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
      resetAuto();
    }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }

    btnPrev.addEventListener('click', () => goTo(current - 1));
    btnNext.addEventListener('click', () => goTo(current + 1));

    // Touch / swipe support
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 40) goTo(delta > 0 ? current + 1 : current - 1);
    }, { passive: true });

    // Pause auto on hover
    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', resetAuto);

    resetAuto();
  });
})();
