/**
 * WAR OF BOSS — Lightbox Gallery Modal
 * Full-screen modal with sliding double-buffer transitions, touch gestures, and keyboard navigation.
 */
(function () {
  'use strict';

  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const imgA = document.getElementById('lightbox-img-a');
  const imgB = document.getElementById('lightbox-img-b');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxSpinner = document.getElementById('lightbox-spinner');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const backdrop = document.getElementById('lightbox-backdrop');

  let activeImg = imgA;
  let hiddenImg = imgB;
  let sources = [];
  let current = 0;
  let isAnimating = false;
  let spinnerTimer = null;
  let pendingCheckImg = null;

  window.updateLightboxSources = function () {
    const latestCards = Array.from(document.querySelectorAll('#carousel-stage .carousel-card'));
    sources = latestCards.map(c => {
      const imgEl = c.querySelector('img');
      const src = imgEl ? imgEl.src : '';
      return {
        src: src,
        alt: imgEl ? imgEl.alt : '',
        desc: imgEl ? (imgEl.getAttribute('data-desc') || '') : ''
      };
    });
  };

  window.updateLightboxSources();

  function showSpinner(show) {
    if (spinnerTimer) {
      clearTimeout(spinnerTimer);
      spinnerTimer = null;
    }
    if (show) {
      spinnerTimer = setTimeout(() => {
        if (lightboxSpinner) lightboxSpinner.classList.add('visible');
      }, 120);
    } else {
      if (lightboxSpinner) lightboxSpinner.classList.remove('visible');
    }
  }

  function updateInfo(idx) {
    if (lightboxCounter) {
      lightboxCounter.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(sources.length).padStart(2, '0');
    }
    if (lightboxDesc) {
      lightboxDesc.textContent = sources[idx]?.desc || '';
    }
  }

  const DUR = 360;
  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

  function setImgStyle(img, tx, opacity, animated) {
    img.style.transition = animated
      ? `transform ${DUR}ms ${EASE}, opacity ${DUR * 0.85}ms ease`
      : 'none';
    img.style.transform = `translate(calc(-50% + ${tx}), -50%)`;
    img.style.opacity = String(opacity);
  }

  function resetImgToCenter(img, visible) {
    img.style.transition = 'none';
    img.style.transform = 'translate(-50%, -50%)';
    img.style.opacity = visible ? '1' : '0';
  }

  function openLightbox(index) {
    window.updateLightboxSources();
    if (!sources || sources.length === 0) return;
    current = ((index % sources.length) + sources.length) % sources.length;

    activeImg.src = sources[current].src;
    activeImg.alt = sources[current].alt;
    activeImg.className = 'lb-slide active';
    activeImg.style.transition = 'none';

    hiddenImg.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    hiddenImg.className = 'lb-slide';
    resetImgToCenter(hiddenImg, false);

    updateInfo(current);
    resetImgToCenter(activeImg, true);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    showSpinner(false);
    if (typeof gsap !== 'undefined') gsap.killTweensOf(activeImg);
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      activeImg.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      hiddenImg.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      activeImg.className = 'lb-slide active';
      hiddenImg.className = 'lb-slide';
      resetImgToCenter(activeImg, true);
      resetImgToCenter(hiddenImg, false);
    }, 350);
  }

  function navigateTo(newIdx, direction) {
    if (isAnimating || !sources || sources.length === 0) return;
    newIdx = ((newIdx % sources.length) + sources.length) % sources.length;
    if (newIdx === current) return;
    isAnimating = true;

    current = newIdx;
    const targetSrc = sources[current].src;
    const targetAlt = sources[current].alt;
    const isNext = direction === 'next';
    const offScreen = isNext ? '100vw' : '-100vw';
    const outDir = isNext ? '-100vw' : '100vw';

    if (pendingCheckImg) {
      pendingCheckImg.onload = null;
      pendingCheckImg.onerror = null;
    }
    const checkImg = new Image();
    pendingCheckImg = checkImg;
    checkImg.src = targetSrc;
    const isLoaded = checkImg.complete && checkImg.naturalWidth > 0;
    if (!isLoaded) showSpinner(true);

    const executeSlide = () => {
      if (checkImg !== pendingCheckImg) return;
      showSpinner(false);

      hiddenImg.src = targetSrc;
      hiddenImg.alt = targetAlt;
      hiddenImg.className = 'lb-slide';
      setImgStyle(hiddenImg, offScreen, 0, false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setImgStyle(activeImg, outDir, 0, true);
          setImgStyle(hiddenImg, '0px', 1, true);

          hiddenImg.className = 'lb-slide active';

          const temp = activeImg;
          activeImg = hiddenImg;
          hiddenImg = temp;

          updateInfo(current);

          setTimeout(() => {
            hiddenImg.style.transition = 'none';
            hiddenImg.style.opacity = '0';
            isAnimating = false;
          }, DUR + 20);
        });
      });
    };

    if (isLoaded) {
      executeSlide();
    } else {
      checkImg.onload = executeSlide;
      checkImg.onerror = executeSlide;
    }
  }

  function showNext() { navigateTo(current + 1, 'next'); }
  function showPrev() { navigateTo(current - 1, 'prev'); }

  // Bind click on carousel cards
  const cards = Array.from(document.querySelectorAll('#carousel-stage .carousel-card'));
  cards.forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'Escape') closeLightbox();
  });

  let touchStartX = 0;
  let touchStartY = 0;
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 50 && dy < 80) {
      if (dx > 0) showNext();
      else showPrev();
    }
  });

  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;
})();
