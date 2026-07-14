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
  
  /* Removed old initPageLoader */  function initMobileNav() {
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

  /* ── GSAP Landing Animation ── */
  function initLandingAnimation() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    if (!window.gsap) {
      loader.style.display = 'none';
      return;
    }

    if (sessionStorage.getItem('qs-landing-played')) {
      loader.style.display = 'none';
      return;
    }
    sessionStorage.setItem('qs-landing-played', 'true');

    // Ensure elements are visible initially before we animate from hidden states
    const tl = gsap.timeline();
    
    // 1. Warp Drive Exit
    tl.to('.loader-orbit', {
      scale: 20,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.inOut',
      delay: 0.8
    })
    .to('.loader-text, .loader-progress', {
      opacity: 0,
      duration: 0.3
    }, '<')
    .to(loader, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => { loader.style.display = 'none'; }
    }, '-=0.4')
    // 2. Hero Stagger Entrance
    .from(['.hero-logo', '.hero-logo-divider', '.hero-iitgn-logo'], {
      y: -50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'back.out(1.7)'
    }, '-=0.2')
    .from('.hero-title', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'back.out(1.5)'
    }, '-=0.5')
    .from('.hero-subtitle', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.6')
    .from('.hero-cta-group', {
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(2)'
    }, '-=0.4');
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

  /* ── NPC Scroll Effects ── */
  function initNPCScrollEffects() {
    const npcChar = document.getElementById('npc-character');
    const npcBubble = document.getElementById('npc-speech-bubble');
    if (!npcChar || !npcBubble || !window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const states = [
      { id: '#hero', text: 'Welcome to the Arena! Think you can beat the high score?', className: 'npc-state-waving' },
      { id: '#about', text: 'Let me analyze your trivia potential...', className: 'npc-state-glasses' },
      { id: '#pillars', text: 'Read these carefully. There WILL be a quiz later.', className: 'npc-state-idea' },
      { id: '#how-it-works', text: 'Step 1: Join. Step 2: Panic. Step 3: Win!', className: 'npc-state-pointing' },
      { id: '#testimonials', text: "Don't just take my word for it. They survived!", className: 'npc-state-party' },
      { id: '#faq', text: 'Got questions? I have answers (mostly).', className: 'npc-state-glasses' },
      { id: '#join-cta', text: 'Your destiny awaits. Join us today!', className: 'npc-state-cheer' }
    ];

    let bubbleTimeout;
    function updateNPC(text, className) {
      npcBubble.textContent = text;
      npcChar.className = 'npc-character ' + className;
      
      npcBubble.classList.remove('is-visible');
      clearTimeout(bubbleTimeout);
      setTimeout(() => {
        npcBubble.classList.add('is-visible');
      }, 50);

      bubbleTimeout = setTimeout(() => {
        npcBubble.classList.remove('is-visible');
      }, 4000);
    }

    states.forEach((state) => {
      const section = document.querySelector(state.id);
      if (!section) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => updateNPC(state.text, state.className),
        onEnterBack: () => updateNPC(state.text, state.className)
      });
    });

    // Make NPC clickable to re-show current message
    npcChar.addEventListener('click', () => {
      npcBubble.classList.remove('is-visible');
      clearTimeout(bubbleTimeout);
      setTimeout(() => {
        npcBubble.classList.add('is-visible');
      }, 50);
      bubbleTimeout = setTimeout(() => {
        npcBubble.classList.remove('is-visible');
      }, 4000);
    });
  }

  /* ── Daily Challenge ── */
  function initDailyChallenge() {
    const questionTextEl = document.getElementById('dc-question-text');
    const optionsContainer = document.getElementById('dc-options-container');
    const resultDiv = document.getElementById('dc-result');
    const resetBtn = document.getElementById('dc-reset-btn');
    const npcChar = document.getElementById('npc-character');
    const npcBubble = document.getElementById('npc-speech-bubble');
    const countdownEl = document.getElementById('dc-countdown');
    
    // Countdown Timer Logic
    if (countdownEl) {
      function updateCountdown() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Next midnight
        const diffMs = midnight - now;
        
        const h = Math.floor(diffMs / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diffMs % (1000 * 60)) / 1000).toString().padStart(2, '0');
        
        countdownEl.textContent = `${h}:${m}:${s}`;
      }
      updateCountdown();
      setInterval(updateCountdown, 1000);
    }
    
    // Inject confetti keyframes dynamically
    if (!document.getElementById('confetti-styles')) {
      const style = document.createElement('style');
      style.id = 'confetti-styles';
      style.innerHTML = `
        @keyframes confetti-fall { 
          0% { transform: translateY(0) rotate(0deg); opacity: 1; } 
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } 
        }
      `;
      document.head.appendChild(style);
    }
    
    if (!questionTextEl || !optionsContainer) {
      console.error("Missing DOM elements for Daily Challenge", {questionTextEl, optionsContainer});
      return;
    }
    
    // Explicitly fallback to window object if needed
    const getQuestion = typeof getQuestionOfTheDay === 'function' ? getQuestionOfTheDay : window.getQuestionOfTheDay;
    if (typeof getQuestion !== 'function') {
      console.error("getQuestionOfTheDay is not a function. Check if js/questions.js loaded successfully.");
      return;
    }

    let currentQuestionData = getQuestion();

    function renderQuestion() {
      questionTextEl.textContent = currentQuestionData.question;
      optionsContainer.innerHTML = '';
      resultDiv.style.display = 'none';
      if (resetBtn) resetBtn.style.display = 'none';

      currentQuestionData.options.forEach((optText, index) => {
        const btn = document.createElement('button');
        btn.className = 'dc-option';
        btn.textContent = optText;
        btn.setAttribute('data-correct', index === currentQuestionData.correctIndex ? 'true' : 'false');
        
        btn.addEventListener('click', function() {
          const allOptions = optionsContainer.querySelectorAll('.dc-option');
          allOptions.forEach(b => b.disabled = true);
          
          const isCorrect = this.getAttribute('data-correct') === 'true';
          this.classList.add(isCorrect ? 'correct' : 'wrong');
          resultDiv.style.display = 'block';
          if (resetBtn) resetBtn.style.display = 'block'; // Show reset button after answering
          
          if (isCorrect) {
            resultDiv.textContent = "Correct! Great job!";
            resultDiv.style.color = "#10b981";
            if (npcChar && npcBubble) {
              npcChar.className = 'npc-character npc-state-cheer';
              npcBubble.textContent = "You nailed it!";
              npcBubble.classList.add('is-visible');
            }
            for (let i = 0; i < 40; i++) {
              const confetti = document.createElement('div');
              confetti.className = 'confetti-piece';
              confetti.style.left = Math.random() * 100 + '%';
              confetti.style.backgroundColor = ['#38bdf8', '#f43f5e', '#fbbf24', '#10b981'][Math.floor(Math.random() * 4)];
              confetti.style.animation = `confetti-fall ${Math.random() * 2 + 2}s linear forwards`;
              document.body.appendChild(confetti);
              setTimeout(() => confetti.remove(), 4000);
            }
          } else {
            resultDiv.textContent = "Incorrect. Try again!";
            resultDiv.style.color = "#ef4444";
            const correctBtn = optionsContainer.querySelector('.dc-option[data-correct="true"]');
            if (correctBtn) correctBtn.classList.add('correct');
            if (npcChar && npcBubble) {
              npcChar.className = 'npc-character npc-state-facepalm';
              npcBubble.textContent = "Oh no... better luck next time!";
              npcBubble.classList.add('is-visible');
            }
          }
          
          setTimeout(() => {
            if(npcBubble) npcBubble.classList.remove('is-visible');
          }, 4000);
        });

        optionsContainer.appendChild(btn);
      });
    }

    renderQuestion();

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        // Just re-render to reset the state
        renderQuestion();
      });
    }
  }

  /* ── Easter Egg: Matrix Mode ── */
  function initEasterEgg() {
    let pressed = [];
    const secretCode = 'quiz';
    const overlay = document.getElementById('matrix-overlay');
    const terminal = document.getElementById('matrix-terminal');
    const exitBtn = document.getElementById('matrix-exit');
    
    window.addEventListener('keyup', (e) => {
      pressed.push(e.key.toLowerCase());
      pressed.splice(-secretCode.length - 1, pressed.length - secretCode.length);
      
      if (pressed.join('').includes(secretCode)) {
        document.body.classList.add('matrix-mode');
        if (overlay) {
          overlay.classList.add('is-active');
          simulateTerminal();
        }
      }
    });
    
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        document.body.classList.remove('matrix-mode');
        overlay.classList.remove('is-active');
        if (terminal) terminal.innerHTML = '';
      });
    }

    function simulateTerminal() {
      if (!terminal) return;
      terminal.innerHTML = '';
      const lines = [
        "Accessing Mainframe...",
        "Bypassing security protocols...",
        "Decrypting Q-Files...",
        "SUCCESS: Welcome to the hidden database."
      ];
      let i = 0;
      function addLine() {
        if (i < lines.length) {
          const p = document.createElement('p');
          p.textContent = '> ' + lines[i];
          terminal.appendChild(p);
          i++;
          setTimeout(addLine, Math.random() * 500 + 300);
        }
      }
      setTimeout(addLine, 500);
    }
  }

  /* ── Highlight Current Nav Item ── */
  function highlightCurrentNav() {
    const path = window.location.pathname;
    let page = path.split('/').pop();
    if (page === '' || page === '/') page = 'index.html';
    
    const navLinks = document.querySelectorAll('.pill');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      // Some hrefs might be just 'index.html', check if it matches
      if (href && href.includes(page)) {
        link.classList.add('active');
      }
    });
  }

  /* ── Global Background Injection ── */
  function injectGlobalBackground() {
    if (document.getElementById('global-premium-bg')) return;
    
    const bgContainer = document.createElement('div');
    bgContainer.id = 'global-premium-bg';
    bgContainer.innerHTML = `
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-grid-overlay"></div>
    `;
    document.body.prepend(bgContainer);
  }

  /* ── FAQ Accordion ── */
  function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
      btn.addEventListener('click', () => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        // Close all others
        faqQuestions.forEach(otherBtn => {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherBtn.nextElementSibling.style.maxHeight = null;
        });
        
        if (!isExpanded) {
          btn.setAttribute('aria-expanded', 'true');
          const answer = btn.nextElementSibling;
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  }

  /* ── On This Day Widget ── */
  async function initOnThisDay() {
    const dateEl = document.getElementById('otd-date');
    const bodyEl = document.getElementById('otd-body');
    if (!dateEl || !bodyEl) return;

    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const displayDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dateEl.textContent = displayDate;

    try {
      const res = await fetch('js/data/on-this-day.json');
      if (!res.ok) throw new Error('Could not load local database');
      const data = await res.json();
      
      const key = `${month}-${day}`;
      const events = data[key] || [];
      
      bodyEl.innerHTML = '';
      
      if (events.length === 0) {
        bodyEl.innerHTML = '<div class="otd-loading">No events found today.</div>';
        return;
      }
      
      events.forEach(ev => {
        const item = document.createElement('div');
        item.className = 'otd-item';
        item.innerHTML = `<span class="otd-year">${ev.year}</span>: ${ev.text}`;
        bodyEl.appendChild(item);
      });
    } catch (err) {
      console.error("On This Day error:", err);
      bodyEl.innerHTML = '<div class="otd-loading" style="color:var(--text-secondary);">Could not load history database right now.</div>';
    }
  }

  /* ── Initialize ── */
  function init() {
    injectGlobalBackground();
    initTheme();
    initMobileNav();
    // initPageLoader(); removed
    initPillNavAnimation();
    initTypewriter();
    initLandingAnimation();
    initFooterYear();
    initBackToTop();
    initNPCScrollEffects();
    initDailyChallenge();
    initEasterEgg();
    highlightCurrentNav();
    initFAQ();
    initOnThisDay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
