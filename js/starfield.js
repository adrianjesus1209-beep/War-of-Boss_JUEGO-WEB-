/**
 * WAR OF BOSS — Starfield & Comet Canvas Effect
 * Animates twinkling stars and randomized comets in the carousel background.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, comets;
  const isMobile = window.innerWidth <= 768;
  const STAR_COUNT = isMobile ? 50 : 120;
  const MAX_COMETS = isMobile ? 2 : 4;
  let glowGradient = null;
  let glowStars = [];
  let plainStars = [];
  let frame = 0;
  let canvasVisible = true;
  let rafId = null;

  function resize() {
    W = canvas.width = (canvas.offsetWidth / 2) | 0;
    H = canvas.height = (canvas.offsetHeight / 2) | 0;
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function createStar() {
    const size = rand(0.4, 3.0);
    const r = Math.floor(rand(200, 255));
    return {
      x: rand(0, W),
      y: rand(0, H),
      size: size,
      opacity: rand(0.15, size > 1.8 ? 0.95 : 0.6),
      twinkleSpeed: rand(0.006, 0.022),
      twinklePhase: rand(0, Math.PI * 2),
      baseVx: rand(-0.25, 0.25),
      baseVy: rand(-0.2, 0.2),
      floatFreq: rand(0.005, 0.02),
      floatAmp: rand(0.1, 0.3),
      glow: size > 1.6,
      colorR: r,
      colorG: Math.floor(r * 0.04),
      colorB: Math.floor(r * 0.08),
    };
  }

  function createComet(immediate) {
    const dir = Math.random() > 0.5 ? 1 : -1;
    const speed = rand(7, 15);
    const angleDeg = rand(20, 55);
    const angle = angleDeg * (Math.PI / 180);
    const tailLen = rand(130, 300);

    let startX, startY;
    if (dir === 1) {
      const fromTop = Math.random() > 0.4;
      startX = fromTop ? rand(-100, W * 0.7) : rand(-200, -80);
      startY = fromTop ? rand(-200, -60) : rand(0, H * 0.5);
    } else {
      const fromTop = Math.random() > 0.4;
      startX = fromTop ? rand(W * 0.3, W + 100) : rand(W + 80, W + 200);
      startY = fromTop ? rand(-200, -60) : rand(0, H * 0.5);
    }

    return {
      x: startX,
      y: startY,
      vx: dir * Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      tailLen: tailLen,
      headR: rand(1.6, 3.5),
      hue: `${Math.floor(rand(220, 255))}, ${Math.floor(rand(5, 45))}, ${Math.floor(rand(5, 30))}`,
      delay: immediate ? Math.floor(rand(0, 80)) : Math.floor(rand(20, 180)),
      active: immediate && Math.random() > 0.3,
    };
  }

  function resetComet(comet, immediate) {
    const dir = Math.random() > 0.5 ? 1 : -1;
    const speed = rand(7, 15);
    const angleDeg = rand(20, 55);
    const angle = angleDeg * (Math.PI / 180);
    const tailLen = rand(130, 300);

    let startX, startY;
    if (dir === 1) {
      const fromTop = Math.random() > 0.4;
      startX = fromTop ? rand(-100, W * 0.7) : rand(-200, -80);
      startY = fromTop ? rand(-200, -60) : rand(0, H * 0.5);
    } else {
      const fromTop = Math.random() > 0.4;
      startX = fromTop ? rand(W * 0.3, W + 100) : rand(W + 80, W + 200);
      startY = fromTop ? rand(-200, -60) : rand(0, H * 0.5);
    }

    comet.x = startX;
    comet.y = startY;
    comet.vx = dir * Math.cos(angle) * speed;
    comet.vy = Math.sin(angle) * speed;
    comet.tailLen = tailLen;
    comet.headR = rand(1.6, 3.5);
    comet.hue = `${Math.floor(rand(220, 255))}, ${Math.floor(rand(5, 45))}, ${Math.floor(rand(5, 30))}`;
    comet.delay = immediate ? Math.floor(rand(0, 80)) : Math.floor(rand(20, 180));
    comet.active = immediate && Math.random() > 0.3;
  }

  function initComets() {
    comets = [];
    for (let i = 0; i < MAX_COMETS; i++) {
      comets.push(createComet(i < 3));
    }
  }

  function drawComet(c) {
    if (!c.active) return;

    const tailX = c.x - c.vx * (c.tailLen / Math.hypot(c.vx, c.vy));
    const tailY = c.y - c.vy * (c.tailLen / Math.hypot(c.vx, c.vy));

    const grad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
    grad.addColorStop(0, 'rgba(255, 255, 240, 1)');
    grad.addColorStop(0.15, 'rgba(255, 120, 80, 0.85)');
    grad.addColorStop(0.5, `rgba(${c.hue}, 0.25)`);
    grad.addColorStop(1, `rgba(${c.hue}, 0)`);

    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth = c.headR * 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.headR * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 200, 200, 0.9)';
    ctx.fill();

    ctx.restore();
  }

  function updateComet(c) {
    if (!c.active) {
      c.delay--;
      if (c.delay <= 0) c.active = true;
      return;
    }
    c.x += c.vx;
    c.y += c.vy;

    if (c.x > W + 350 || c.x < -350 || c.y > H + 350) {
      resetComet(c, false);
    }
  }

  function init() {
    resize();
    glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    glowGradient.addColorStop(0, 'rgba(255, 20, 40, 1)');
    glowGradient.addColorStop(0.4, 'rgba(200, 0, 20, 0.4)');
    glowGradient.addColorStop(1, 'rgba(120, 0, 10, 0)');
    particles = Array.from({ length: STAR_COUNT }, createStar);
    glowStars = particles.filter(p => p.glow);
    plainStars = particles.filter(p => !p.glow);
    initComets();
  }

  function draw() {
    if (!canvasVisible) {
      rafId = null;
      return;
    }
    frame++;
    if (frame % 2 === 0) {
      rafId = requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, W, H);

    for (let p of glowStars) {
      const twinkle = Math.sin(frame * p.twinkleSpeed + p.twinklePhase);
      const alpha = Math.max(0.05, p.opacity + twinkle * (p.opacity * 0.5));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.scale(p.size * 4, p.size * 4);
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.colorR}, ${p.colorG}, ${p.colorB}, ${alpha})`;
      ctx.fill();
    }

    for (let p of plainStars) {
      const twinkle = Math.sin(frame * p.twinkleSpeed + p.twinklePhase);
      const alpha = Math.max(0.05, p.opacity + twinkle * (p.opacity * 0.5));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.colorR}, ${p.colorG}, ${p.colorB}, ${alpha})`;
      ctx.fill();
    }

    for (let p of particles) {
      p.x += p.baseVx + Math.cos(frame * p.floatFreq + p.twinklePhase) * p.floatAmp;
      p.y += p.baseVy + Math.sin(frame * p.floatFreq + p.twinklePhase) * p.floatAmp;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    }

    comets.forEach(c => {
      updateComet(c);
      drawComet(c);
    });

    rafId = requestAnimationFrame(draw);
  }

  const canvasObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        canvasVisible = entry.isIntersecting;
        if (canvasVisible && !rafId) draw();
      });
    },
    { threshold: 0.1 }
  );

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  init();
  const carouselSection = document.getElementById('carousel');
  if (carouselSection) canvasObserver.observe(carouselSection);
  draw();
})();
