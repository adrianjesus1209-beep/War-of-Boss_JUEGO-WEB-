/**
 * WAR OF BOSS — Feature Details Modal
 * Controls popup modal displaying in-depth information about key game features.
 */
(function () {
  'use strict';

  const modal = document.getElementById('feature-modal');
  const backdrop = document.getElementById('feature-modal-backdrop');
  const closeBtn = document.getElementById('feature-modal-close');
  const numberEl = document.getElementById('feature-modal-number');
  const titleEl = document.getElementById('feature-modal-title');
  const descEl = document.getElementById('feature-modal-desc');
  const imgEl = document.getElementById('feature-modal-img');
  const imgWrapper = document.getElementById('feature-modal-image-wrapper');

  function openFeatureModal(feat) {
    if (!modal) return;
    if (numberEl) {
      numberEl.textContent = feat.numero || '01';
      numberEl.style.color = feat.color || '#ff0033';
    }
    if (titleEl) {
      titleEl.textContent = feat.titulo || '';
      titleEl.style.color = feat.color || '#ff0033';
    }
    if (descEl) {
      descEl.textContent = feat.descripcion || '';
    }
    if (feat.imagen) {
      const src = feat.imagen.startsWith('http') ? feat.imagen : feat.imagen + '?v=' + Date.now();
      if (imgEl) {
        imgEl.src = src;
        imgEl.alt = feat.titulo || '';
      }
      if (imgWrapper) imgWrapper.style.display = 'block';
    } else {
      if (imgEl) imgEl.src = '';
      if (imgWrapper) imgWrapper.style.display = 'none';
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeFeatureModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  window.openFeatureModal = openFeatureModal;
  window.closeFeatureModal = closeFeatureModal;

  if (closeBtn) closeBtn.addEventListener('click', closeFeatureModal);
  if (backdrop) backdrop.addEventListener('click', closeFeatureModal);

  document.addEventListener('keydown', (e) => {
    if (modal && modal.classList.contains('active') && e.key === 'Escape') {
      closeFeatureModal();
    }
  });
})();
