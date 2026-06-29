/* ============================================================
   QUIZZING SOCIETY — SCROLL ANIMATIONS
   IntersectionObserver-based reveal engine
   ============================================================ */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Scroll Reveal ── */
  function initScrollReveal() {
    const elements = document.querySelectorAll('[data-scroll]');
    if (!elements.length) return;

    if (reducedMotion) {
      elements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.scrollDelay || 0;
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  /* ── Stagger Children ── */
  function initStaggerReveal() {
    const containers = document.querySelectorAll('[data-stagger]');
    if (!containers.length) return;

    if (reducedMotion) {
      containers.forEach(c => {
        c.querySelectorAll('.stagger-child').forEach(ch => ch.classList.add('is-visible'));
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const children = entry.target.querySelectorAll('.stagger-child');
          const staggerDelay = parseInt(entry.target.dataset.stagger) || 100;
          children.forEach((child, i) => {
            setTimeout(() => {
              child.classList.add('is-visible');
            }, i * staggerDelay);
          });
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    containers.forEach(c => observer.observe(c));
  }

  /* ── Counter Animation ── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.countSuffix || '';
    const duration = 2000;
    const start = performance.now();

    if (reducedMotion) {
      el.textContent = target + suffix;
      return;
    }

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(easeOutQuart(progress) * target);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  /* ── Navbar Scroll State ── */
  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            navbar.classList.add('is-scrolled');
          } else {
            navbar.classList.remove('is-scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial check
  }

  /* ── Active Nav Link ── */
  function initActiveNav() {
    const navLinks = document.querySelectorAll('.pill');
    if (!navLinks.length) return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      // Special case for root/index
      if (currentPath === '' && linkPath === 'index.html') {
        link.classList.add('is-active');
        return;
      }
      
      if (linkPath === currentPath) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  /* ── Parallax on scroll ── */
  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length || reducedMotion) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.1;
            const rect = el.getBoundingClientRect();
            const offsetY = (rect.top + scrollY - window.innerHeight / 2) * speed;
            el.style.transform = `translateY(${offsetY}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Scroll Indicator Hide ── */
  function initScrollIndicator() {
    const indicator = document.getElementById('scroll-indicator');
    if (!indicator) return;

    function onScroll() {
      if (window.scrollY > 100) {
        indicator.style.opacity = '0';
        indicator.style.pointerEvents = 'none';
      } else {
        indicator.style.opacity = '';
        indicator.style.pointerEvents = '';
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Initialize all ── */
  function init() {
    initScrollReveal();
    initStaggerReveal();
    initCounters();
    initNavbarScroll();
    initActiveNav();
    initParallax();
    initScrollIndicator();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.QSScroll = { initScrollReveal, initStaggerReveal, initCounters };
})();
