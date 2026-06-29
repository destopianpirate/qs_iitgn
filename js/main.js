/* ============================================================
   QUIZZING SOCIETY — MAIN APPLICATION
   Theme toggle, pill nav, smooth scroll, page loader, typewriter
   ============================================================ */

(function () {
  'use strict';

  /* ── Theme Toggle ── */
  function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const saved = localStorage.getItem('qs-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('qs-theme', next);
    });
  }

  /* ── Mobile Navigation ── */
  
  function initPageLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    
    if (localStorage.getItem('loaderShown')) {
      loader.style.display = 'none';
    } else {
      setTimeout(() => {
        loader.classList.add('is-hidden');
        localStorage.setItem('loaderShown', 'true');
        setTimeout(() => { loader.style.display = 'none'; }, 800);
      }, 1500);
    }
  }

  function initMobileNav() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.querySelector('.pill-nav');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('is-open');
      menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    menu.querySelectorAll('.pill').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('is-open');
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        toggle.classList.remove('is-open');
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Pill Nav GSAP Hover Animations ── */
  function initPillNavAnimation() {
    const pills = document.querySelectorAll('.pill');
    pills.forEach(pill => {
      const circle = pill.querySelector('.hover-circle');
      const label = pill.querySelector('.pill-label');
      const hoverLabel = pill.querySelector('.pill-label-hover');
      if (!circle) return;

      const rect = pill.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.left = '50%';
      circle.style.bottom = `-${delta}px`;

      if (window.gsap) {
        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 });

        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.35, ease: 'power2.out' }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 0.35, ease: 'power2.out' }, 0);
        if (hoverLabel) tl.to(hoverLabel, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0);

        pill.addEventListener('mouseenter', () => tl.play());
        pill.addEventListener('mouseleave', () => tl.reverse());
      }
    });
  }



  /* ── Typewriter Effect ── */
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    const phrases = [
      'Where curiosity meets competition.',
      'Test your wits. Challenge your mind.'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function type() {
      const currentPhrase = phrases[phraseIndex];

      if (isPaused) {
        setTimeout(type, 1500);
        isPaused = false;
        isDeleting = true;
        return;
      }

      if (!isDeleting) {
        el.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentPhrase.length) {
          isPaused = true;
          setTimeout(type, 80);
          return;
        }
        setTimeout(type, 60 + Math.random() * 40);
      } else {
        el.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(type, 400);
          return;
        }
        setTimeout(type, 30);
      }
    }

    setTimeout(type, 1000);
  }

  /* ── Page Loader ── */
  function initLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    const hideLoader = () => {
      setTimeout(() => {
        loader.classList.add('is-hidden');
        setTimeout(() => loader.remove(), 800);
      }, 1800);
    };

    if (document.readyState !== 'loading') {
      hideLoader();
    } else {
      document.addEventListener('DOMContentLoaded', hideLoader);
    }
  }

  /* ── Year in footer ── */
  function initFooterYear() {
    const yearEl = document.getElementById('footer-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ── Back to Top ── */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Initialize ── */
  function init() {
    initTheme();
    initMobileNav();
    initPageLoader();
    initPillNavAnimation();
    initTypewriter();
    initLoader();
    initFooterYear();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
