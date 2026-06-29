/* ============================================================
   QUIZZING SOCIETY — PARTICLE SYSTEM
   Canvas-based floating question marks
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  let animId = null;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SYMBOLS = ['?', '!', 'Q', '?', '?', '?', 'A', '?'];
  const PARTICLE_COUNT_DESKTOP = 45;
  const PARTICLE_COUNT_MOBILE = 20;
  const MOUSE_RADIUS = 120;

  function getParticleCount() {
    return window.innerWidth < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
  }

  function resize() {
    canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
    canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.offsetWidth;
      this.y = Math.random() * canvas.offsetHeight;
      this.size = 12 + Math.random() * 24;
      this.opacity = 0.04 + Math.random() * 0.08;
      this.baseOpacity = this.opacity;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = -0.15 - Math.random() * 0.3;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.008;
      this.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      this.drift = Math.random() * Math.PI * 2;
      this.driftSpeed = 0.003 + Math.random() * 0.005;
      this.driftAmplitude = 0.3 + Math.random() * 0.5;
    }

    update() {
      this.drift += this.driftSpeed;
      this.x += this.speedX + Math.sin(this.drift) * this.driftAmplitude;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        this.x += (dx / dist) * force * 2;
        this.y += (dy / dist) * force * 2;
        this.opacity = this.baseOpacity + force * 0.1;
      } else {
        this.opacity += (this.baseOpacity - this.opacity) * 0.05;
      }

      // Wrap around
      if (this.y < -this.size) {
        this.y = canvas.offsetHeight + this.size;
        this.x = Math.random() * canvas.offsetWidth;
      }
      if (this.x < -this.size) this.x = canvas.offsetWidth + this.size;
      if (this.x > canvas.offsetWidth + this.size) this.x = -this.size;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      ctx.font = `${this.size}px "Playfair Display", Georgia, serif`;
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary').trim() || '#1E40AF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.symbol, 0, 0);
      ctx.restore();
    }
  }

  function init() {
    resize();
    particles = [];
    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    if (reducedMotion) {
      // Draw once, static
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach(p => p.draw());
      return;
    }

    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    animId = requestAnimationFrame(animate);
  }

  // Event listeners
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Touch support
  canvas.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    resize();
    // Adjust particle count
    const targetCount = getParticleCount();
    while (particles.length < targetCount) particles.push(new Particle());
    while (particles.length > targetCount) particles.pop();
  });

  // Reduced motion listener
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    reducedMotion = e.matches;
    if (reducedMotion && animId) {
      cancelAnimationFrame(animId);
      animId = null;
    } else if (!reducedMotion) {
      animate();
    }
  });

  // Start
  init();
  animate();
})();
