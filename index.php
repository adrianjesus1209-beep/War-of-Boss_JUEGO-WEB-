<?php 
$base = ''; 
$configRaw = file_exists(__DIR__ . '/api/config.json') ? file_get_contents(__DIR__ . '/api/config.json') : '{}';
?>
<script>window.initialConfig = <?=$configRaw?>;</script>
<?php include 'includes/header.php'; ?>

  <main class="hero-bg relative overflow-hidden">

    <div class="crt-overlay"></div>

    <div class="hero-zoom-backdrop"></div>

    <button type="button" class="hero-zoom-close" aria-label="Cerrar zoom">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>

    <!-- Barra flotante de audio para el video en zoom -->
    <div class="hero-zoom-audio-bar" id="hero-zoom-audio-bar" role="toolbar" aria-label="Control de volumen del video">
      <button type="button" class="hero-zoom-vol-btn" id="hero-zoom-vol-btn" aria-label="Silenciar o activar volumen">
        <svg id="hero-zoom-vol-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
      </button>
      <input type="range" id="hero-zoom-volume-slider" class="volume-slider hero-video-slider" min="0" max="100" value="20" aria-label="Volumen del video">
      <span class="hero-zoom-vol-text font-retro text-sm text-white/90 min-w-[34px] text-right" id="hero-zoom-vol-text">20%</span>
    </div>

    <div class="hero-bg-image"></div>
    <video class="hero-bg-video hidden" autoplay muted loop playsinline preload="metadata"></video>

    <div class="vignette"></div>

    <div class="hero-content mx-auto max-w-[1200px] px-6 pt-16 pb-20 sm:pt-24 sm:pb-32">

      <div class="fade-in mb-4 text-center">
        <h1
          class="glitch font-pixel text-xl leading-relaxed tracking-wider text-white drop-shadow-[0_0_12px_rgba(255,0,51,0.3)] sm:text-3xl lg:text-5xl"
          data-text="WAR OF BOSS">
          WAR OF BOSS
        </h1>
      </div>

      <p class="fade-in fade-in-delay mb-12 text-center font-retro text-xl tracking-wide text-white/80 sm:text-3xl">
        Domina la arena. Desafía a los titanes. Sobrevive a la guerra de jefes.
      </p>

      <div id="features" class="fade-in fade-in-delay-2 mx-auto mb-6 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">

      </div>

      <div id="download" class="fade-in fade-in-delay-3 text-center">
        <a href="javascript:void(0)" target="_blank" rel="noopener noreferrer"
          class="neon-btn mb-4 inline-block rounded bg-[#ff0033] px-8 py-3 font-pixel text-[12px] text-white transition-all hover:bg-[#ff1a4d] sm:text-xs">
          DESCARGAR DEMO
        </a>
        <p class="font-retro text-sm text-white/30">Demo gratuita &middot; Windows &middot; Próximamente 2026</p>
      </div>

    </div>
  </main>

  <section id="gallery-entrance" class="gallery-entrance">
    <div class="gallery-grid"></div>
    <div class="gallery-entrance-text">
      <h2 class="gallery-title section-glitch font-pixel text-2xl sm:text-4xl tracking-[0.5em] text-white" data-text="GALERIA">GALERIA</h2>
      <div class="scroll-indicator mt-4 flex flex-col items-center gap-4 mb-4">
        <div class="chevron-down"></div>
      </div>
      <p class="font-retro text-sm sm:text-base text-white/50 tracking-[0.2em]">IMÁGENES DEL COMBATE</p>
    </div>
  </section>

  <section id="carousel" class="carousel-section">
    <div class="carousel-scene" id="carousel-scene">

      <canvas id="starfield-canvas" class="starfield-canvas"></canvas>
      <div class="carousel-stage" id="carousel-stage">
        <div class="carousel-card" data-index="0"><img src="uploads/galeria/foto_0.webp" alt="Foto 01" loading="eager" decoding="async"></div>
        <div class="carousel-card" data-index="1"><img src="uploads/galeria/foto_1.webp" alt="Foto 02" loading="eager" decoding="async"></div>
        <div class="carousel-card" data-index="2"><img src="uploads/galeria/foto_2.webp" alt="Foto 03" loading="eager" decoding="async"></div>
        <div class="carousel-card" data-index="3"><img src="uploads/galeria/foto_3.webp" alt="Foto 04" loading="lazy" decoding="async"></div>
        <div class="carousel-card" data-index="4"><img src="uploads/galeria/foto_4.webp" alt="Foto 05" loading="lazy" decoding="async"></div>
        <div class="carousel-card" data-index="5"><img src="uploads/galeria/foto_5.webp" alt="Foto 06" loading="lazy" decoding="async"></div>
        <div class="carousel-card" data-index="6"><img src="uploads/galeria/foto_6.webp" alt="Foto 07" loading="lazy" decoding="async"></div>
        <div class="carousel-card" data-index="7"><img src="uploads/galeria/foto_7.webp" alt="Foto 08" loading="lazy" decoding="async"></div>
        <div class="carousel-card" data-index="8"><img src="uploads/galeria/foto_8.webp" alt="Foto 09" loading="lazy" decoding="async"></div>
        <div class="carousel-card" data-index="9"><img src="uploads/galeria/foto_9.webp" alt="Foto 10" loading="lazy" decoding="async"></div>
      </div>
    </div>
  </section>

  <div id="carousel-progress" class="carousel-progress"></div>

  <div id="lightbox" class="lightbox" role="dialog" aria-modal="true" aria-label="Galería">
    <div class="lightbox-backdrop" id="lightbox-backdrop"></div>
    <button type="button" class="lightbox-close" id="lightbox-close" aria-label="Cerrar">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
    <button type="button" class="lightbox-nav lightbox-prev" id="lightbox-prev" aria-label="Anterior">
      <svg class="lb-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      <span class="lb-label font-retro">← ANTERIOR</span>
    </button>
    <button type="button" class="lightbox-nav lightbox-next" id="lightbox-next" aria-label="Siguiente">
      <span class="lb-label font-retro">SIGUIENTE →</span>
      <svg class="lb-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
    <div class="lightbox-content">
      <div id="lightbox-img-wrapper" class="lightbox-img-wrapper">
        <div class="lightbox-spinner" id="lightbox-spinner"></div>
        <img id="lightbox-img-a" class="lb-slide active" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="">
        <img id="lightbox-img-b" class="lb-slide" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="">
      </div>
      <div id="lightbox-desc" class="lightbox-desc font-retro"></div>
      <div class="lightbox-info">
        <div class="lightbox-counter font-pixel" id="lightbox-counter"></div>
      </div>
    </div>
  </div>

  <div id="feature-modal" class="feature-modal" role="dialog" aria-modal="true" aria-label="Detalle de característica">
    <div class="feature-modal-backdrop" id="feature-modal-backdrop"></div>
    <div class="feature-modal-content">
      <button type="button" class="feature-modal-close" id="feature-modal-close" aria-label="Cerrar">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="feature-modal-inner">
        <div class="feature-modal-text">
          <span class="feature-modal-number" id="feature-modal-number">01</span>
          <h3 class="feature-modal-title" id="feature-modal-title"></h3>
          <p class="feature-modal-desc" id="feature-modal-desc"></p>
        </div>
        <div class="feature-modal-image" id="feature-modal-image-wrapper">
          <img id="feature-modal-img" src="" alt="">
        </div>
      </div>
    </div>
  </div>

  <section id="news" class="gallery-entrance relative min-h-screen py-24 flex flex-col items-center justify-center overflow-x-hidden">
    <div class="gallery-grid"></div>
    <div class="gallery-entrance-text max-w-[1100px] px-6 relative z-10 text-center w-full">
      <h2 class="gallery-title section-glitch section-glitch-slow font-pixel text-2xl sm:text-4xl tracking-[0.3em] text-white mb-6" data-text="NOVEDADES" style="animation-delay: 5s, 0s;">NOVEDADES</h2>
      <div class="scroll-indicator mt-4 flex flex-col items-center gap-4 mb-4">
        <div class="chevron-down"></div>
      </div>
      <p class="font-retro text-base sm:text-xl text-white/60 tracking-[0.2em] mb-12">ACTUALIZACIONES DEL COMBATE</p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">

      </div>

      <div id="news-more-container" class="mt-12 text-center hidden">
        <a href="pages/novedades.php" class="inline-block font-pixel text-xs text-white/50 hover:text-white transition-colors duration-300 news-glow-link">
          VER HISTORIAL COMPLETO →
        </a>
      </div>
    </div>
  </section>

  <section id="figura">
    <div id="particle-container"></div>
    <div class="figura-overlay">
      <h1 class="glitch font-pixel text-xl sm:text-3xl tracking-wider drop-shadow-[0_0_12px_rgba(255,0,51,0.3)]" data-text="WAR OF BOSS">WAR OF BOSS</h1>
    </div>
  </section>

<?php include 'includes/footer.php'; ?>

  <!-- Scripts Modulares con Cache-Busting -->
  <script src="js/starfield.js?v=<?=filemtime(__DIR__ . '/js/starfield.js')?>" defer></script>
  <script src="js/carousel-3d.js?v=<?=filemtime(__DIR__ . '/js/carousel-3d.js')?>" defer></script>
  <script src="js/lightbox.js?v=<?=filemtime(__DIR__ . '/js/lightbox.js')?>" defer></script>
  <script src="js/features-modal.js?v=<?=filemtime(__DIR__ . '/js/features-modal.js')?>" defer></script>
  <script src="js/figura-particles.js?v=<?=filemtime(__DIR__ . '/js/figura-particles.js')?>" defer></script>
  <script src="js/landing.js?v=<?=filemtime(__DIR__ . '/js/landing.js')?>" defer></script>
</body>
</html>
