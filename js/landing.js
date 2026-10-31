/**
 * WAR OF BOSS — Main Landing Page Controller
 * Handles GSAP entrance animations, dynamic configuration rendering, and analytics metrics.
 */
(function () {
  'use strict';

  // 1. GSAP ScrollTrigger Entrance Transitions
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const entrance = document.getElementById('gallery-entrance');
    const text = document.querySelector('.gallery-entrance-text');
    const grid = document.querySelector('.gallery-grid');
    const heroContent = document.querySelector('.hero-content');
    const heroBg = document.querySelector('.hero-bg');

    if (heroBg && heroContent) {
      gsap.to(heroContent, {
        opacity: 0,
        y: -120,
        scale: 0.9,
        scrollTrigger: {
          trigger: heroBg,
          start: 'top top',
          end: '80% top',
          scrub: 1.2,
        }
      });
    }

    if (entrance && text) {
      gsap.fromTo(text,
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1, y: 0, scale: 1,
          scrollTrigger: {
            trigger: entrance,
            start: 'top bottom',
            end: 'top center',
            scrub: 1.2,
          }
        }
      );

      if (grid) {
        gsap.to(grid, {
          opacity: 0,
          scrollTrigger: {
            trigger: entrance,
            start: '30% top',
            end: '80% top',
            scrub: true,
          }
        });
      }
    }

    const newsSection = document.getElementById('news');
    const newsText = newsSection && newsSection.querySelector('.gallery-entrance-text');
    if (newsText) {
      gsap.fromTo(newsText,
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1, y: 0, scale: 1,
          scrollTrigger: {
            trigger: newsSection,
            start: 'top bottom',
            end: 'top center',
            scrub: 1.2,
          }
        }
      );
    }

    const figuraSection = document.getElementById('figura');
    const figuraText = figuraSection && figuraSection.querySelector('.glitch');
    if (figuraText) {
      gsap.fromTo(figuraText,
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1, y: 0, scale: 1,
          scrollTrigger: {
            trigger: figuraSection,
            start: 'top bottom',
            end: 'top center',
            scrub: 1.2,
          }
        }
      );
    }
  }

  // 2. Dynamic Configuration Renderer
  function applyConfig(cfg) {
    if (!cfg) return;

    if (cfg.general) {
      if (cfg.general.titulo) {
        document.querySelectorAll('.glitch').forEach(el => {
          el.textContent = cfg.general.titulo;
          el.setAttribute('data-text', cfg.general.titulo);
        });
        document.title = cfg.general.titulo;
      }
      if (cfg.general.subtitulo) {
        const subEl = document.querySelector('main p.font-retro');
        if (subEl) subEl.textContent = cfg.general.subtitulo;
      }
      if (cfg.general.boton_descarga_texto) {
        document.querySelectorAll('.neon-btn').forEach(btn => {
          if (btn.tagName === 'A' && (btn.innerText.includes('DESCARGAR') || btn.innerText.includes('JUGAR'))) {
            btn.textContent = cfg.general.boton_descarga_texto;
          }
        });
      }
      if (cfg.general.subtexto_descarga) {
        const subDesc = document.querySelector('#download p.font-retro');
        if (subDesc) subDesc.textContent = cfg.general.subtexto_descarga;
      }
      if (cfg.general.enlace_descarga) {
        document.querySelectorAll('a[href="#download"], a.neon-btn').forEach(a => {
          a.href = cfg.general.enlace_descarga;
          if (cfg.general.enlace_descarga !== 'javascript:void(0)' && cfg.general.enlace_descarga !== '#') {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }
        });
      }
    }

    if (cfg.caracteristicas && Array.isArray(cfg.caracteristicas)) {
      const featuresGrid = document.getElementById('features');
      if (featuresGrid) {
        featuresGrid.innerHTML = '';
        cfg.caracteristicas.forEach((feat, idx) => {
          const card = document.createElement('div');
          card.className = 'pixel-border rounded-sm bg-[#18181B]/80 p-6 backdrop-blur-sm transition-all hover:bg-[#1e1e22]/90 feat-clickable';
          card.setAttribute('data-feat-index', idx);
          card.style.cursor = 'pointer';
          card.innerHTML = `
            <div class="mb-3 font-pixel text-[10px]" style="color: ${feat.color || '#ff0033'}">${feat.numero || String(idx + 1).padStart(2, '0')}</div>
            <h3 class="mb-2 font-pixel text-[10px] text-white">${feat.titulo || ''}</h3>
            <p class="font-retro text-base leading-relaxed text-white/50">${(feat.descripcion || '').substring(0, 80)}${(feat.descripcion || '').length > 80 ? '...' : ''}</p>
          `;
          card.addEventListener('click', () => {
            if (typeof window.openFeatureModal === 'function') {
              window.openFeatureModal(feat);
            }
          });
          featuresGrid.appendChild(card);
        });
      }
    }

    if (cfg.novedades && Array.isArray(cfg.novedades)) {
      const newsGrid = document.querySelector('#news .grid');
      if (newsGrid) {
        newsGrid.innerHTML = '';
        const top6 = cfg.novedades.slice(0, 6);
        top6.forEach(nov => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'pixel-border rounded bg-zinc-800/20 p-6 backdrop-blur-sm transition-all hover:bg-zinc-800/40 flex flex-col justify-between';

          const wrapper = document.createElement('div');
          const header = document.createElement('div');
          header.className = 'flex items-center justify-between mb-3';

          const tag = document.createElement('span');
          tag.className = 'font-pixel text-[9px]';
          tag.style.color = nov.tag_color || '#ff0033';
          tag.textContent = nov.tag || '';

          const fecha = document.createElement('span');
          fecha.className = 'font-retro text-xs text-white/40';
          fecha.textContent = nov.fecha || '';

          header.appendChild(tag);
          header.appendChild(fecha);

          const titulo = document.createElement('h3');
          titulo.className = 'font-pixel text-xs text-white mb-2 leading-relaxed';
          titulo.textContent = nov.titulo || '';

          const desc = document.createElement('p');
          desc.className = 'font-retro text-sm text-white/60 leading-relaxed';
          desc.textContent = nov.descripcion || '';

          wrapper.appendChild(header);
          wrapper.appendChild(titulo);
          wrapper.appendChild(desc);
          itemDiv.appendChild(wrapper);
          newsGrid.appendChild(itemDiv);
        });

        const btnContainer = document.getElementById('news-more-container');
        if (btnContainer) {
          if (cfg.novedades.length > 6) {
            btnContainer.classList.remove('hidden');
          } else {
            btnContainer.classList.add('hidden');
          }
        }
      }
    }

    if (cfg.multimedia) {
      if (cfg.multimedia.fondo) {
        const heroBgImage = document.querySelector('.hero-bg-image');
        if (heroBgImage) heroBgImage.style.backgroundImage = `url('${cfg.multimedia.fondo}')`;
      }
      if (cfg.multimedia.logo_oscuro) {
        const fav = document.getElementById('favicon');
        if (fav) fav.href = 'uploads/imagenes/favicon.png';
      }
      if (cfg.multimedia.fotos && Array.isArray(cfg.multimedia.fotos)) {
        const carouselCards = document.querySelectorAll('#carousel-stage .carousel-card img');
        cfg.multimedia.fotos.forEach((fotoItem, i) => {
          const url = typeof fotoItem === 'string' ? fotoItem : (fotoItem?.url || '');
          const desc = typeof fotoItem === 'string' ? '' : (fotoItem?.descripcion || '');
          if (carouselCards[i]) {
            if (url) carouselCards[i].src = url;
            carouselCards[i].setAttribute('data-desc', desc);
          }
        });
        if (typeof window.updateLightboxSources === 'function') {
          window.updateLightboxSources();
        }
      }
    }
  }

  // 3. Cache & Config Loading
  const CFG_VERSION = 3;
  let cachedCfg = null;
  try {
    cachedCfg = JSON.parse(sessionStorage.getItem('siteConfig'));
    if (cachedCfg && cachedCfg._version !== CFG_VERSION) cachedCfg = null;
  } catch (e) {}

  if (cachedCfg) {
    window.siteConfig = cachedCfg;
    applyConfig(cachedCfg);
  } else {
    fetch('api/obtener_config.php?v=' + Date.now())
      .then(res => res.json())
      .then(cfg => {
        window.siteConfig = cfg;
        try {
          cfg._version = CFG_VERSION;
          sessionStorage.setItem('siteConfig', JSON.stringify(cfg));
        } catch (e) {}
        applyConfig(cfg);
      })
      .catch(() => console.log('Landing usando contenido estático por defecto.'));
  }

  // 4. Analytics Visitor Hit
  fetch('api/metricas.php?tipo=visita').catch(() => {});

  window.applyLandingConfig = applyConfig;
})();
