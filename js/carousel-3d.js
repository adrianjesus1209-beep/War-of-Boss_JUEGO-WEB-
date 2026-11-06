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

    let ticking = false;
    let latestProgress = 0;

    function applyTransforms(progressVal) {
      const p = easeScroll(progressVal);
      if (progressBar) progressBar.style.transform = 'scaleX(' + progressVal + ')';
      for (let i = 0; i < N; i++) {
        const t = targets[i] || targets[N - 1];
        const iScale = i === 0 ? 1 : 0.85;
        const s = iScale + (t.s - iScale) * p;
        setTf[i]('translate3d(' + (t.x * p).toFixed(2) + 'px,' + (t.y * p).toFixed(2) + 'px,' + (t.z * p).toFixed(2) + 'px) rotateY(' + (t.rY * p).toFixed(2) + 'deg) rotateZ(' + (t.rZ * p).toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')');
        const iOp = i === 0 ? 1 : 0;
        setOpacity[i](Number((iOp + (1 - iOp) * p).toFixed(3)));
      }
      ticking = false;
    }

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      fastScrollEnd: true,
      onUpdate: (self) => {
        latestProgress = self.progress;
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(() => applyTransforms(latestProgress));
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

    let tickingMobile = false;
    let latestMobileProgress = 0;

    function applyMobileTransforms(progressVal) {
      const p = easeInOut(progressVal);
      stage.style.transform = 'translate3d(' + (viewportCenter - p * maxScrollX).toFixed(1) + 'px, 0, 0)';
      tickingMobile = false;
    }

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      fastScrollEnd: true,
      onUpdate: (self) => {
        latestMobileProgress = self.progress;
        if (!tickingMobile) {
          tickingMobile = true;
          requestAnimationFrame(() => applyMobileTransforms(latestMobileProgress));
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDesktopCarousel();
    initMobileCarousel();
  });
})();
