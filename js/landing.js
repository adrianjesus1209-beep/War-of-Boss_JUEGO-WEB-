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

    // En fuentes pixeladas (Press Start 2P), los acentos en mayúsculas deforman las letras a minúsculas pequeñas (como 'í')
    function cleanPixelText(str) {
      if (!str) return '';
      return String(str)
        .replace(/Í/g, 'I')
        .replace(/Á/g, 'A')
        .replace(/É/g, 'E')
        .replace(/Ó/g, 'O')
        .replace(/Ú/g, 'U');
    }

    if (cfg.caracteristicas && Array.isArray(cfg.caracteristicas)) {
      const featuresGrid = document.getElementById('features');
      if (featuresGrid) {
        featuresGrid.innerHTML = '';
        cfg.caracteristicas.forEach((feat, idx) => {
          const card = document.createElement('div');
          card.className = 'pixel-border rounded-sm bg-[#18181B]/55 p-6 backdrop-blur-md transition-all hover:bg-[#1e1e22]/75 feat-clickable';
          card.setAttribute('data-feat-index', idx);
          card.style.cursor = 'pointer';
          card.innerHTML = `
            <div class="mb-3 font-pixel text-[10px]" style="color: ${feat.color || '#ff0033'}">${feat.numero || String(idx + 1).padStart(2, '0')}</div>
            <h3 class="mb-2 font-pixel text-[10px] text-white">${cleanPixelText(feat.titulo || '')}</h3>
            <p class="font-retro text-base leading-relaxed text-white/70">${(feat.descripcion || '').substring(0, 80)}${(feat.descripcion || '').length > 80 ? '...' : ''}</p>
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
          tag.textContent = cleanPixelText(nov.tag || '');

          const fecha = document.createElement('span');
          fecha.className = 'font-retro text-xs text-white/40';
          fecha.textContent = nov.fecha || '';

          header.appendChild(tag);
          header.appendChild(fecha);

          const titulo = document.createElement('h3');
          titulo.className = 'font-pixel text-xs text-white mb-2 leading-relaxed';
          titulo.textContent = cleanPixelText(nov.titulo || '');

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
      function syncHeroBackground() {
        if (!cfg.multimedia) return;
        const isDark = document.documentElement.classList.contains('dark');
        const fondoUrl = (!isDark && cfg.multimedia.fondo_claro) 
          ? cfg.multimedia.fondo_claro 
          : (cfg.multimedia.fondo || '');

        if (!fondoUrl) return;

        const heroBg = document.querySelector('.hero-bg');
        const heroBgImage = document.querySelector('.hero-bg-image');
        const heroBgVideo = document.querySelector('.hero-bg-video');
        const cleanUrl = fondoUrl.split('?')[0].toLowerCase();
        const isVideo = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm');

        if (isVideo && heroBgVideo) {
          if (heroBgVideo.src !== fondoUrl && !heroBgVideo.src.endsWith(fondoUrl)) {
            heroBgVideo.src = fondoUrl;
            heroBgVideo.load();
          }
          heroBgVideo.classList.remove('hidden');
          if (heroBg && heroBg.classList.contains('hero-zoomed')) {
            heroBgVideo.muted = false;
          }
          heroBgVideo.play().catch(() => {});
          if (heroBgImage) heroBgImage.style.display = 'none';

          // Optimización: Pausar reproducción cuando el Hero no esté visible en el viewport
          if ('IntersectionObserver' in window && !heroBgVideo._obsAttached) {
            heroBgVideo._obsAttached = true;
            const heroObserver = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  heroBgVideo.play().catch(() => {});
                } else {
                  heroBgVideo.pause();
                }
              });
            }, { threshold: 0.1 });
            const heroMain = document.querySelector('.hero-bg');
            if (heroMain) heroObserver.observe(heroMain);
          }
        } else {
          if (heroBgVideo) {
            heroBgVideo.pause();
            heroBgVideo.classList.add('hidden');
          }
          if (heroBgImage) {
            heroBgImage.style.display = 'block';
            heroBgImage.style.backgroundImage = `url('${fondoUrl}')`;
          }
        }
      }

      syncHeroBackground();
      window.addEventListener('themeChanged', syncHeroBackground);
      if ('MutationObserver' in window && !window._heroThemeObserverAttached) {
        window._heroThemeObserverAttached = true;
        const themeObserver = new MutationObserver(() => syncHeroBackground());
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
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

  // 3. Cache & Config Loading (Optimización de Cero Latencia)
  const CFG_VERSION = 3;
  let cachedCfg = window.initialConfig || null;
  if (!cachedCfg) {
    try {
      cachedCfg = JSON.parse(sessionStorage.getItem('warOfBossSiteConfig'));
      if (cachedCfg && cachedCfg._version !== CFG_VERSION) cachedCfg = null;
    } catch (e) {}
  }

  if (cachedCfg) {
    window.siteConfig = cachedCfg;
    try {
      if (!cachedCfg._version) {
        cachedCfg._version = CFG_VERSION;
        sessionStorage.setItem('warOfBossSiteConfig', JSON.stringify(cachedCfg));
      }
    } catch (e) {}
    applyConfig(cachedCfg);
  } else {
    fetch('api/obtener_config.php?v=' + Date.now())
      .then(res => res.json())
      .then(cfg => {
        window.siteConfig = cfg;
        try {
          cfg._version = CFG_VERSION;
          sessionStorage.setItem('warOfBossSiteConfig', JSON.stringify(cfg));
        } catch (e) {}
        applyConfig(cfg);
      })
      .catch(() => console.log('Landing usando contenido estático por defecto.'));
  }

  // 4. Analytics Visitor Hit
  fetch('api/metricas.php?tipo=visita').catch(() => {});

  // 5. Interacción Zoom en el Fondo (Video / Imagen) con Oscurecimiento y Control de Audio
  (function initHeroZoom() {
    const heroBg = document.querySelector('.hero-bg');
    const heroVideo = document.querySelector('.hero-bg-video');
    const heroImage = document.querySelector('.hero-bg-image');
    const closeBtn = document.querySelector('.hero-zoom-close');
    const backdrop = document.querySelector('.hero-zoom-backdrop');
    const bgMusic = document.getElementById('bg-music');
    const audioBar = document.getElementById('hero-zoom-audio-bar');
    const volBtn = document.getElementById('hero-zoom-vol-btn');
    const volIcon = document.getElementById('hero-zoom-vol-icon');
    const volSlider = document.getElementById('hero-zoom-volume-slider');
    const volText = document.getElementById('hero-zoom-vol-text');

    if (!heroBg) return;

    let musicWasPlayingBeforeZoom = false;
    let videoVolume = 0.2; // Empieza en 20% por petición del usuario
    let lastNonZeroVolume = 0.2;

    const iconOn = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
    const iconLow = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>';
    const iconMute = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';

    function updateVideoVolIcon(vol, isMuted) {
      if (!volIcon) return;
      if (isMuted || vol === 0) {
        volIcon.innerHTML = iconMute;
      } else if (vol < 0.5) {
        volIcon.innerHTML = iconLow;
      } else {
        volIcon.innerHTML = iconOn;
      }
    }

    function updateSliderBackground(val) {
      if (!volSlider) return;
      volSlider.style.background = `linear-gradient(to right, #ff0033 ${val}%, #333333 ${val}%)`;
    }

    function syncAudioBarUI() {
      const isMuted = heroVideo ? heroVideo.muted : false;
      const displayVol = isMuted ? 0 : videoVolume;
      const percent = Math.round(displayVol * 100);

      if (volSlider) {
        volSlider.value = percent;
        updateSliderBackground(percent);
      }
      if (volText) {
        volText.textContent = `${percent}%`;
      }
      updateVideoVolIcon(displayVol, isMuted);
    }

    function openZoom() {
      heroBg.classList.add('hero-zoomed');

      // Si la música de fondo de la web está sonando, pausarla temporalmente
      if (bgMusic && !bgMusic.paused) {
        musicWasPlayingBeforeZoom = true;
        bgMusic.pause();
      } else {
        musicWasPlayingBeforeZoom = false;
      }

      // Comprobar si hay video activo
      const hasActiveVideo = heroVideo && !heroVideo.classList.contains('hidden') && !!heroVideo.src;

      if (hasActiveVideo) {
        // El sonido empieza al 20% para un volumen moderado y suave
        videoVolume = 0.2;
        lastNonZeroVolume = 0.2;
        heroVideo.volume = videoVolume;
        heroVideo.muted = false;
        heroVideo.play().catch(() => {});

        if (audioBar) {
          audioBar.classList.add('has-video');
          audioBar.classList.remove('is-expanded');
          syncAudioBarUI();
        }
      } else {
        if (audioBar) {
          audioBar.classList.remove('has-video');
          audioBar.classList.remove('is-expanded');
        }
      }
    }

    function closeZoom() {
      heroBg.classList.remove('hero-zoomed');

      if (audioBar) {
        audioBar.classList.remove('has-video');
        audioBar.classList.remove('is-expanded');
      }

      // Volver a silenciar el video en el fondo del hero
      if (heroVideo) {
        heroVideo.muted = true;
      }

      // Reanudar la música de fondo de la web si estaba sonando previamente
      if (bgMusic && musicWasPlayingBeforeZoom) {
        bgMusic.play().catch(() => {});
      }
    }

    // Controles de la barra de audio flotante
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        const val = parseInt(volSlider.value, 10);
        videoVolume = val / 100;
        if (videoVolume > 0) {
          lastNonZeroVolume = videoVolume;
        }
        if (heroVideo) {
          heroVideo.volume = videoVolume;
          heroVideo.muted = (val === 0);
        }
        if (volText) {
          volText.textContent = `${val}%`;
        }
        updateSliderBackground(val);
        updateVideoVolIcon(videoVolume, heroVideo ? heroVideo.muted : false);
      });

      volSlider.addEventListener('click', (e) => e.stopPropagation());
      volSlider.addEventListener('mousedown', (e) => e.stopPropagation());
      volSlider.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    }

    if (volBtn) {
      volBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!audioBar) return;

        // Si la barra estaba comprimida, al darle clic se expande para editar el volumen
        if (!audioBar.classList.contains('is-expanded')) {
          audioBar.classList.add('is-expanded');
          return;
        }

        // Si ya estaba expandida, alternar silencio / reactivar volumen
        if (!heroVideo) return;
        if (heroVideo.muted || heroVideo.volume === 0) {
          heroVideo.muted = false;
          videoVolume = lastNonZeroVolume > 0 ? lastNonZeroVolume : 0.2;
          heroVideo.volume = videoVolume;
        } else {
          lastNonZeroVolume = heroVideo.volume > 0 ? heroVideo.volume : 0.2;
          heroVideo.muted = true;
        }
        syncAudioBarUI();
      });
      volBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    if (audioBar) {
      audioBar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.closest('#hero-zoom-volume-slider')) return;
        if (!audioBar.classList.contains('is-expanded')) {
          audioBar.classList.add('is-expanded');
        }
      });
      audioBar.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    // Colapsar la barra al hacer click fuera
    document.addEventListener('click', (e) => {
      if (audioBar && audioBar.classList.contains('is-expanded')) {
        if (!audioBar.contains(e.target)) {
          audioBar.classList.remove('is-expanded');
        }
      }
    });

    function toggleZoom(e) {
      // Si el click fue en un botón, enlace, tarjeta o barra interactiva, no activar/cerrar zoom
      if (e.target.closest('a, button, .feat-clickable, input, #download, #hero-zoom-audio-bar') && !e.target.closest('.hero-zoom-close')) {
        return;
      }
      // Si la barra de volumen estaba expandida, un click fuera la comprime primero
      if (audioBar && audioBar.classList.contains('is-expanded')) {
        audioBar.classList.remove('is-expanded');
        return;
      }
      if (heroBg.classList.contains('hero-zoomed')) {
        closeZoom();
      } else {
        openZoom();
      }
    }

    if (heroVideo) heroVideo.addEventListener('click', toggleZoom);
    if (heroImage) heroImage.addEventListener('click', toggleZoom);
    if (closeBtn) closeBtn.addEventListener('click', closeZoom);
    if (backdrop) backdrop.addEventListener('click', closeZoom);

    // Permitir hacer click en cualquier parte vacía del Hero para hacer zoom
    heroBg.addEventListener('click', (e) => {
      if (e.target === heroBg || e.target.classList.contains('hero-content') || e.target.classList.contains('vignette')) {
        toggleZoom(e);
      }
    });

    // Cerrar zoom con tecla Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && heroBg.classList.contains('hero-zoomed')) {
        closeZoom();
      }
    });
  })();

  window.applyLandingConfig = applyConfig;
})();
