/**
 * WAR OF BOSS — 3D Scroll-Driven Carousel
 * Uses GSAP & ScrollTrigger to create an interactive 3D perspective gallery.
 */
(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Desktop Carousel Implementation
  function initDesktopCarousel() {
    if (window.innerWidth <= 768) return;

    const section = document.getElementById('carousel');
    const scene = document.getElementById('carousel-scene');
    const stage = document.getElementById('carousel-stage');
    const cards = gsap.utils.toArray('#carousel-stage .carousel-card');
    const progressBar = document.getElementById('carousel-progress');
    const N = cards.length;

    if (!section || !scene || !stage || N === 0) return;

    const targets = [
      { x: -740, y: -80, z: -300, rY: -55, rZ: -22, s: 0.70 },
      { x: -560, y: 140, z: -180, rY: -38, rZ: 16, s: 0.80 },
      { x: -360, y: -160, z: -50, rY: -22, rZ: -20, s: 0.88 },
      { x: -190, y: 120, z: 50, rY: -10, rZ: 11, s: 0.94 },
      { x: 0, y: -30, z: 240, rY: 0, rZ: -4, s: 1.05 },
      { x: 190, y: 120, z: 50, rY: 10, rZ: 11, s: 0.94 },
      { x: 360, y: -160, z: -50, rY: 22, rZ: -20, s: 0.88 },
      { x: 560, y: 140, z: -180, rY: 38, rZ: 16, s: 0.80 },
      { x: 740, y: -80, z: -300, rY: 55, rZ: -22, s: 0.70 },
      { x: 880, y: 80, z: -400, rY: 68, rZ: 28, s: 0.65 },
    ];

    const setTf = cards.map(c => v => { c.style.transform = v; });
    const setOpacity = cards.map(c => gsap.quickSetter(c, 'opacity'));

    gsap.set(cards, {
      x: 0, y: 0, z: 0,
      rotateY: 0, rotateZ: 0, rotateX: 0,
      scale: (i) => i === 0 ? 1 : 0.85,
      opacity: (i) => i === 0 ? 1 : 0,
      transformOrigin: '50% 50%',
      zIndex: (i) => N - i,
    });

    const easeScroll = gsap.parseEase('power2.inOut');

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2,
      onUpdate: (self) => {
        const p = easeScroll(self.progress);
        if (progressBar) progressBar.style.transform = 'scaleX(' + self.progress + ')';
        for (let i = 0; i < N; i++) {
          const t = targets[i] || targets[N - 1];
          const iScale = i === 0 ? 1 : 0.85;
          const s = iScale + (t.s - iScale) * p;
          setTf[i]('translate3d(' + (t.x * p) + 'px,' + (t.y * p) + 'px,' + (t.z * p) + 'px) rotateY(' + (t.rY * p) + 'deg) rotateZ(' + (t.rZ * p) + 'deg) scale(' + s + ')');
          const iOp = i === 0 ? 1 : 0;
          setOpacity[i](iOp + (1 - iOp) * p);
        }
      }
    });
  }

  // Mobile Carousel Implementation
  function initMobileCarousel() {
    if (window.innerWidth > 768) return;

    const section = document.getElementById('carousel');
    const scene = document.getElementById('carousel-scene');
    const stage = document.getElementById('carousel-stage');
    const cards = document.querySelectorAll('#carousel-stage .carousel-card');

    if (!section || !scene || !stage || cards.length === 0) return;

    const cardWidth = (90 * window.innerWidth) / 100;
    const gap = 20;
    const viewportCenter = (scene.offsetWidth / 2) - (cardWidth / 2);

    cards.forEach((card, i) => {
      card.style.left = (i * (cardWidth + gap)) + 'px';
      card.style.top = '50%';
      card.style.transform = 'translateY(-50%)';
      card.style.marginLeft = '0';
      const img = card.querySelector('img');
      if (img) {
        if (img.complete) img.classList.add('loaded');
        else img.addEventListener('load', function () { this.classList.add('loaded'); });
      }
    });

    const totalW = cards.length * (cardWidth + gap) - gap;
    stage.style.width = totalW + 'px';
    stage.style.transform = 'translate3d(' + viewportCenter + 'px, 0, 0)';
    const maxScrollX = Math.max(0, totalW - cardWidth);
    section.style.height = (cards.length * 30 + 18) + 'vh';

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 4.5,
      onUpdate: (self) => {
        const p = easeInOut(self.progress);
        stage.style.transform = 'translate3d(' + (viewportCenter - p * maxScrollX) + 'px, 0, 0)';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDesktopCarousel();
    initMobileCarousel();
  });
})();
