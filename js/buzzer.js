/* ============================================================
   QUIZZING SOCIETY — BUZZER INTERACTION
   Sound synthesis + ripple animation + random fact display
   ============================================================ */

(function () {
  'use strict';

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playBuzzerSound() {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();

      // Main buzz tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);

      // Click transient
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = 'sine';
      click.frequency.setValueAtTime(1200, ctx.currentTime);
      clickGain.gain.setValueAtTime(0.3, ctx.currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      click.connect(clickGain);
      clickGain.connect(ctx.destination);
      click.start(ctx.currentTime);
      click.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Silently fail if audio isn't available
    }
  }

  function showFact() {
    const overlay = document.getElementById('buzzer-overlay');
    const popup = document.getElementById('buzzer-fact');
    const textEl = document.getElementById('buzzer-fact-text');

    if (!overlay || !popup || !textEl) return;

    // Get random question
    const q = window.QSQuiz ? window.QSQuiz.getRandomQuestion() : null;
    if (q) {
      textEl.textContent = q.q;
    } else {
      textEl.textContent = 'The word "quiz" was allegedly coined in 1791 as the result of a bet in Dublin!';
    }

    overlay.classList.add('is-active');
    popup.classList.add('is-active');
  }

  function hideFact() {
    const overlay = document.getElementById('buzzer-overlay');
    const popup = document.getElementById('buzzer-fact');

    if (overlay) overlay.classList.remove('is-active');
    if (popup) popup.classList.remove('is-active');
  }

  function createRipple(button, e) {
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  function init() {
    const buzzerBtn = document.getElementById('buzzer-btn');
    const closeBtn = document.getElementById('buzzer-close');
    const overlay = document.getElementById('buzzer-overlay');

    if (buzzerBtn) {
      buzzerBtn.addEventListener('click', (e) => {
        // createRipple(buzzerBtn, e); // Removed as user requested size stop increasing
        playBuzzerSound();
        showFact();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', hideFact);
    }

    if (overlay) {
      overlay.addEventListener('click', hideFact);
    }

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideFact();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
