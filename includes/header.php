<!DOCTYPE html>
<html lang="es" class="dark">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WAR OF BOSS</title>
  <link rel="dns-prefetch" href="https://cdn.tailwindcss.com">
  <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
  <link rel="preconnect" href="https://cdn.tailwindcss.com" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            pixel: ['"Press Start 2P"', 'cursive'],
            retro: ['"VT323"', 'monospace'],
          },
        },
      },
    }
  </script>
  <link rel="icon" id="favicon" href="<?=$base?>uploads/imagenes/favicon.png" type="image/png">
  <link rel="stylesheet" href="<?=$base?>css/estilos.css">
  <script>
    (function() {
      var saved = localStorage.getItem('theme');
      var favicon = document.getElementById('favicon');
      if (saved === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
      if (favicon) favicon.href = '<?=$base?>uploads/imagenes/favicon.png';
    })();
  </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
</head>

<body id="top">

  <?php $basePath = (basename($_SERVER['SCRIPT_NAME'] ?? '') === 'index.php') ? '' : $base . 'index.php'; ?>
  <nav class="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
    <div class="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">

      <a href="<?=$base?>index.php" class="flex items-center gap-2">
        <img src="<?=$base?>uploads/imagenes/logo_oscuro.png" alt="" class="logo-dark h-8 sm:h-10">
        <img src="<?=$base?>uploads/imagenes/logo_claro.png" alt="" class="logo-light h-8 sm:h-10">
        <span class="glitch font-pixel text-[11px] sm:text-[10px] tracking-widest text-white/90 nav-glitch" data-text="WAR OF BOSS">WAR OF BOSS</span>
      </a>

      <div class="hidden items-center gap-6 md:flex">
        <a href="<?= $basePath ?>#top"
          class="nav-link font-retro text-sm text-white/60 transition-colors hover:text-white">Características</a>
        <a href="<?= $basePath ?>#news"
          class="nav-link font-retro text-sm text-white/60 transition-colors hover:text-white">Novedades</a>
        <a href="<?= $basePath ?>#download"
          class="nav-link header-dl-link font-retro text-sm text-white/60 transition-colors hover:text-white">DESCARGAR DEMO</a>
      </div>

      <div class="flex items-center gap-3">

        <button id="theme-toggle" type="button" class="theme-toggle mr-6" aria-label="Alternar tema" title="Alternar tema">
          <svg id="theme-icon-sun" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg id="theme-icon-moon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

        <div id="music-control-group" class="group relative flex items-center mr-2 py-2">
          <button id="vol-icon-btn" type="button"
            class="nav-link font-retro text-sm text-white/60 transition-colors group-hover:text-white flex items-center gap-1"
            aria-label="Alternar Silencio" title="Alternar Silencio">
            <svg id="music-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg> <span class="hidden sm:inline">MÚSICA</span>
          </button>

          <div id="volume-panel"
            class="volume-panel hidden group-hover:block md:group-hover:block absolute top-[100%] left-1/2 -translate-x-1/2 bg-[#18181B] border border-white/10 rounded px-3 py-2 z-50">
            <input id="volume-slider" type="range" min="0" max="100" value="70" class="volume-slider"
              aria-label="Volumen">
          </div>
        </div>

        <a href="<?= $basePath ?>#download"
          class="neon-btn header-dl-link hidden rounded bg-[#ff0033] px-4 py-2 font-pixel text-[11px] text-white transition-all hover:bg-[#ff1a4d] sm:block">
          DESCARGAR DEMO
        </a>

        <button id="menu-btn" type="button" class="flex flex-col gap-[6px] md:hidden p-2" aria-label="Menú">
          <span class="block h-[2px] w-6 bg-white transition-all duration-300 origin-center" id="bar1"></span>
          <span class="block h-[2px] w-6 bg-white transition-all duration-300" id="bar2"></span>
          <span class="block h-[2px] w-6 bg-white transition-all duration-300 origin-center" id="bar3"></span>
        </button>
      </div>
    </div>

  </nav>

  <div id="mobile-overlay" class="fixed inset-0 bg-black/60 z-40 hidden opacity-0 transition-opacity duration-300 md:hidden"></div>

  <div id="mobile-menu" class="fixed top-0 right-0 h-full w-72 bg-[#1a1a1f] border-l border-white/10 z-50 transform translate-x-full transition-transform duration-300 ease-in-out md:hidden flex flex-col">
    <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <span class="font-pixel text-[11px] tracking-widest text-white">MENÚ</span>
      <button id="mobile-close-btn" class="text-white/70 hover:text-white transition-colors p-1">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="flex flex-col gap-1 px-6 py-6 flex-grow">
      <a href="<?= $basePath ?>#top" class="mobile-link font-retro text-base py-3 px-3 text-white hover:text-white/80 transition-colors">Características</a>
      <a href="<?= $basePath ?>#news" class="mobile-link font-retro text-base py-3 px-3 text-white hover:text-white/80 transition-colors">Novedades</a>
      <a href="<?= $basePath ?>#download" class="mobile-link header-dl-link font-retro text-base py-3 px-3 text-white hover:text-white/80 transition-colors">DESCARGAR DEMO</a>
    </div>
    <div class="px-6 py-6 border-t border-white/10 space-y-4">
      <button id="mobile-theme-toggle" class="w-full flex items-center gap-3 font-retro text-sm text-white/80 hover:text-white transition-colors py-2">
        <svg id="mobile-theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <span>Cambiar tema</span>
      </button>
      <a href="<?= $basePath ?>#download" class="mobile-link neon-btn header-dl-link block w-full rounded bg-[#ff0033] px-4 py-3 text-center font-pixel text-[11px] text-white">DESCARGAR DEMO</a>
    </div>
  </div>

  <audio id="bg-music" src="<?=$base?>uploads/audio/audio_musica.mp3" loop preload="auto"></audio>

  <script>
  document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

    function openMobileMenu() {
      menuBtn.classList.add('active');
      mobileMenu.classList.remove('translate-x-full');
      mobileMenu.classList.add('translate-x-0');
      mobileOverlay.classList.remove('hidden');
      requestAnimationFrame(() => mobileOverlay.classList.remove('opacity-0'));
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('translate-x-0');
      mobileMenu.classList.add('translate-x-full');
      mobileOverlay.classList.add('opacity-0');
      setTimeout(() => mobileOverlay.classList.add('hidden'), 300);
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', () => {
      if (menuBtn.classList.contains('active')) closeMobileMenu();
      else openMobileMenu();
    });

    mobileCloseBtn.addEventListener('click', closeMobileMenu);
    mobileOverlay.addEventListener('click', closeMobileMenu);

    mobileMenu.querySelectorAll('a.mobile-link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    if (mobileThemeToggle) {
      mobileThemeToggle.addEventListener('click', () => {
        document.getElementById('theme-toggle').click();
      });
    }

    const themeToggle = document.getElementById('theme-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');

    function updateThemeIcon() {
      const isDark = document.documentElement.classList.contains('dark');
      themeIconSun.style.display = isDark ? 'block' : 'none';
      themeIconMoon.style.display = isDark ? 'none' : 'block';
      const mobileIcon = document.getElementById('mobile-theme-icon');
      if (mobileIcon) {
        if (isDark) {
          mobileIcon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        } else {
          mobileIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        }
      }
    }

    function applyTheme(theme) {
      const favicon = document.getElementById('favicon');
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
      if (favicon) favicon.href = '<?=$base?>uploads/imagenes/favicon.png';
      localStorage.setItem('theme', theme);
      updateThemeIcon();
    }

    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(isDark ? 'light' : 'dark');
      playClick();
    });

    updateThemeIcon();

    document.querySelectorAll('.glitch').forEach(el => {
      const observer = new MutationObserver(() => {
        const newText = el.textContent.trim();
        if (el.getAttribute('data-text') !== newText) {
          el.setAttribute('data-text', newText);
        }
      });
      observer.observe(el, { childList: true, characterData: true, subtree: true });
    });

    let clickAudio = null;

    window.playClick = function() {
      if (!clickAudio) {
        clickAudio = new Audio('<?=$base?>uploads/audio/audio_clic.mp3');
      }
      clickAudio.currentTime = 0;
      clickAudio.play().catch(function(e) { if (e.name !== 'AbortError') console.error("playClick error:", e); });
    };

    const bgMusic = document.getElementById('bg-music');
    const musicIcon = document.getElementById('music-icon');
    const volIconBtn = document.getElementById('vol-icon-btn');
    const volumeSlider = document.getElementById('volume-slider');
    let isMusicPlaying = false;
    let volume = 0.7;

    function updateVolIcon() {
      const iconOn = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
      const iconLow = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>';
      const iconMute = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
      if (!isMusicPlaying || volume === 0) musicIcon.innerHTML = iconMute;
      else if (volume < 0.5) musicIcon.innerHTML = iconLow;
      else musicIcon.innerHTML = iconOn;
    }

    function toggleVolumePanel(e) {
      if (window.innerWidth > 768) return;
      const panel = document.getElementById('volume-panel');
      if (!panel) return;
      e.stopPropagation();
      panel.classList.toggle('active');
    }

    volIconBtn.addEventListener('click', (e) => {
      toggleVolumePanel(e);
      if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
      } else {
        bgMusic.play().then(() => {
          isMusicPlaying = true;
          updateVolIcon();
        }).catch(function(e) { console.error('bgMusic error:', e); });
      }
      updateVolIcon();
      updateSliderBackground();
    });

    document.addEventListener('click', function(e) {
      if (window.innerWidth > 768) return;
      const panel = document.getElementById('volume-panel');
      const btn = document.getElementById('vol-icon-btn');
      if (panel && panel.classList.contains('active') && !panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('active');
      }
    });

    function updateSliderBackground() {
      const val = volumeSlider.value;
      volumeSlider.style.background = `linear-gradient(to right, #ff0033 ${val}%, #333 ${val}%)`;
    }

    bgMusic.volume = volume;
    volumeSlider.value = volume * 100;
    updateVolIcon();
    updateSliderBackground();

    volumeSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      volume = volumeSlider.value / 100;
      bgMusic.volume = volume;
      if (volume === 0 && isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
      } else if (volume > 0 && !isMusicPlaying) {
        bgMusic.play().then(() => {
          isMusicPlaying = true;
          updateVolIcon();
        }).catch(function(e) { console.error('bgMusic slider error:', e); });
      }
      updateVolIcon();
      updateSliderBackground();
    });

    function setupAudio() {
      document.addEventListener('click', function(e) {
        var t = e.target.closest('.neon-btn, .nav-link, footer a, #menu-btn, nav a.flex, #features > div, .nov-card, .nov-pagination-btn');
        if (t) playClick();
      });
    }
    setupAudio();

    document.addEventListener('click', function(e) {
      var btn = e.target.closest('a');
      if (btn && (btn.classList.contains('header-dl-link') || btn.getAttribute('href') === '#download' || btn.classList.contains('neon-btn'))) {
        fetch('<?=$base?>api/metricas.php?tipo=descarga').catch(function() {});
      }
    });

    var CFG_VERSION = 2;
    var cachedCfg = null;
    try { cachedCfg = JSON.parse(sessionStorage.getItem('warOfBossSiteConfig')); if (cachedCfg && cachedCfg._version !== CFG_VERSION) cachedCfg = null; } catch(e) {}
    if (cachedCfg) {
      applyHeaderConfig(cachedCfg);
    } else {
    fetch('<?=$base?>api/obtener_config.php?v=' + Date.now())
      .then(res => res.json())
      .then(function(cfg) {
        window.siteConfig = cfg;
        try { cfg._version = CFG_VERSION; sessionStorage.setItem('warOfBossSiteConfig', JSON.stringify(cfg)); } catch(e) {}
        applyHeaderConfig(cfg);
      })
      .catch(() => {});
    }

    function applyHeaderConfig(cfg) {
      if (!cfg || !cfg.general) return;
      const g = cfg.general;
      const dlLinks = document.querySelectorAll('.header-dl-link');
      dlLinks.forEach(a => {
        if (g.boton_descarga_texto) a.textContent = g.boton_descarga_texto;
        if (g.enlace_descarga && g.enlace_descarga !== 'javascript:void(0)' && g.enlace_descarga !== '#') {
          a.href = g.enlace_descarga;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
      });
      if (cfg.multimedia) {
        if (cfg.multimedia.audio_musica) {
          const bgMusicEl = document.getElementById('bg-music');
          if (bgMusicEl) bgMusicEl.src = '<?=$base?>' + cfg.multimedia.audio_musica;
        }
        if (cfg.multimedia.audio_clic) {
          window.playClick = function() {
            if (!clickAudio) {
              clickAudio = new Audio('<?=$base?>' + cfg.multimedia.audio_clic);
              clickAudio.volume = 0.5;
            }
            clickAudio.currentTime = 0;
            clickAudio.play().catch(function(e) { if (e.name !== 'AbortError') console.error('playClick from config error:', e); });
          };
        }
      }
    }
  });
  </script>
