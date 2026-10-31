
  <footer class="border-t border-white/10 bg-black pb-12 pt-8">
    <div class="mx-auto max-w-[1200px] px-6">
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">

        <div class="flex items-center gap-4">
          <img src="<?=$base?>uploads/imagenes/logo_oscuro.png" alt="WAR OF BOSS" class="logo-dark h-5 sm:h-6 opacity-70">
          <img src="<?=$base?>uploads/imagenes/logo_claro.png" alt="WAR OF BOSS" class="logo-light h-5 sm:h-6 opacity-70">
        </div>

        <div id="footer-redes" class="flex items-center gap-5 flex-wrap">

        </div>
      </div>
      <div class="mt-6 border-t border-white/5 pt-6 text-center">
        <p class="font-retro text-xs text-white/20">&copy; 2026 War of Boss. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>

  <script>
  (function() {
    function renderFooter(cfg) {
      if (!cfg) return;
      if (cfg.multimedia) {
        if (cfg.multimedia.logo_claro) {
          document.querySelectorAll('.logo-light').forEach(img => img.src = '<?=$base?>' + cfg.multimedia.logo_claro);
        }
        if (cfg.multimedia.logo_oscuro) {
          document.querySelectorAll('.logo-dark').forEach(img => img.src = '<?=$base?>' + cfg.multimedia.logo_oscuro);
        }
      }
      const footerRedes = document.getElementById('footer-redes');
      if (footerRedes && cfg.redes) {
        footerRedes.innerHTML = '';
        let redesArr = cfg.redes;
        if (redesArr && !Array.isArray(redesArr)) {
          const legacyKeys = Object.entries(redesArr);
          redesArr = legacyKeys.map(([key, url]) => ({
            nombre: key.charAt(0).toUpperCase() + key.slice(1),
            url: url
          }));
        }
        if (Array.isArray(redesArr) && redesArr.length > 0) {
          const hoverColors = ['#ff0033','#0040ff','#ff0033','#0040ff','#ff0033','#0040ff','#ff0033','#0040ff'];
          redesArr.forEach((red, i) => {
            const url = red.url && red.url !== 'javascript:void(0)' && red.url !== '#' ? red.url : null;
            const a = document.createElement('a');
            a.href = url || 'javascript:void(0)';
            if (url) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
            a.textContent = red.nombre || ('Enlace ' + (i + 1));
            a.className = 'font-retro text-sm text-white/40 transition-colors';
            a.addEventListener('mouseenter', () => a.style.color = hoverColors[i % hoverColors.length]);
            a.addEventListener('mouseleave', () => a.style.color = '');
            footerRedes.appendChild(a);
          });
        }
      }
    }
    if (window.siteConfig) {
      renderFooter(window.siteConfig);
    } else {
      fetch('<?=$base?>api/obtener_config.php?v=' + Date.now())
        .then(res => res.json())
        .then(cfg => { window.siteConfig = cfg; renderFooter(cfg); })
        .catch(() => {});
    }
  })();
  </script>
