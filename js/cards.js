/* ============================================================
   QUIZZING SOCIETY — CARD INTERACTIONS
   Team card 3D tilt, trophy confetti, mini quiz
   ============================================================ */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Team Card 3D Tilt ── */
  function initTeamCards() {
    const cards = document.querySelectorAll('.team-card');
    if (!cards.length || reducedMotion) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        if (card.classList.contains('is-flipped')) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.querySelector('.team-card-inner').style.transform =
          `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('is-flipped')) {
          card.querySelector('.team-card-inner').style.transform =
            'perspective(800px) rotateX(0) rotateY(0)';
        }
      });

      card.addEventListener('click', () => {
        card.classList.toggle('is-flipped');
        if (card.classList.contains('is-flipped')) {
          card.querySelector('.team-card-inner').style.transform =
            'perspective(800px) rotateY(180deg)';
        } else {
          card.querySelector('.team-card-inner').style.transform =
            'perspective(800px) rotateX(0) rotateY(0)';
        }
      });
    });
  }

  /* ── Achievement Confetti ── */
  function createConfetti(x, y) {
    const container = document.createElement('div');
    container.classList.add('confetti-container');
    document.body.appendChild(container);

    const colors = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#1D4ED8', '#DBEAFE'];
    const shapes = ['square', 'circle'];

    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.classList.add('confetti-piece');

      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = 6 + Math.random() * 8;
      const startX = x + (Math.random() - 0.5) * 200;
      const drift = (Math.random() - 0.5) * 300;
      const duration = 1.5 + Math.random() * 2;
      const delay = Math.random() * 0.3;

      piece.style.cssText = `
        left: ${startX}px;
        top: ${y - 20}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${shape === 'circle' ? '50%' : '2px'};
        opacity: 1;
        animation: confetti-fall ${duration}s ease-in ${delay}s forwards;
        --drift: ${drift}px;
      `;

      // Custom animation with drift
      piece.animate([
        { transform: `translateY(0) translateX(0) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(${300 + Math.random() * 200}px) translateX(${drift}px) rotate(${720 * (Math.random() > 0.5 ? 1 : -1)}deg)`, opacity: 0 }
      ], {
        duration: duration * 1000,
        delay: delay * 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });

      container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 4000);
  }

  function initAchievementCards() {
    const cards = document.querySelectorAll('.achievement-card');
    if (reducedMotion) return;

    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const rect = card.getBoundingClientRect();
        createConfetti(rect.left + rect.width / 2, rect.top);
      });
    });
  }

  /* ── Mini Quiz ── */
  function initMiniQuiz() {
    const options = document.querySelectorAll('.mini-quiz-option');
    const resultEl = document.getElementById('mini-quiz-result');
    if (!options.length) return;

    let answered = false;

    options.forEach(option => {
      option.addEventListener('click', () => {
        if (answered) return;
        answered = true;

        const isCorrect = option.dataset.correct === 'true';

        if (isCorrect) {
          option.classList.add('is-correct');
          if (resultEl) {
            resultEl.textContent = 'Correct! You clearly belong here.';
            resultEl.classList.add('is-visible');
          }
        } else {
          option.classList.add('is-wrong');
          // Highlight the correct one
          options.forEach(o => {
            if (o.dataset.correct === 'true') o.classList.add('is-correct');
          });
          if (resultEl) {
            resultEl.textContent = 'Not quite! Join us and you\'ll know next time.';
            resultEl.classList.add('is-visible');
          }
        }

        // Reset after delay
        setTimeout(() => {
          options.forEach(o => {
            o.classList.remove('is-correct', 'is-wrong');
          });
          if (resultEl) resultEl.classList.remove('is-visible');
          answered = false;
        }, 3000);
      });
    });
  }

  /* ── Init ── */
  function init() {
    initTeamCards();
    initAchievementCards();
    initMiniQuiz();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
