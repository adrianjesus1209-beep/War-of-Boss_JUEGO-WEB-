<?php $base = '../'; ?>
<?php include __DIR__ . '/../includes/header.php'; ?>

  <style>

    .nov-title-color { color: #fff; }
    .nov-subtitle-color { color: rgba(255,255,255,0.6); }
    .nov-muted { color: rgba(255,255,255,0.6); }
    .nov-empty { color: rgba(255,255,255,0.4); }
    .nov-pagination-btn { background: #18181B; border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }
    .nov-pagination-btn:hover { border-color: rgba(255,0,51,0.6); color: #fff; }
    .nov-pagination-btn.disabled { opacity: 0.4; cursor: not-allowed; }
    .nov-pagination-btn.active { background: #ff0033; border-color: #ff0033; color: #fff; }

    html:not(.dark) .nov-title-color { color: #18181b; }
    html:not(.dark) .nov-subtitle-color { color: #71717a; }
    html:not(.dark) .nov-muted { color: #52525b; }
    html:not(.dark) .nov-empty { color: #a1a1aa; }
    html:not(.dark) .nov-pagination-btn { background: #fff; border-color: #d4d4d8; color: #27272a; }
    html:not(.dark) .nov-pagination-btn:hover { border-color: #ff0033; color: #ff0033; }
    html:not(.dark) .nov-pagination-btn.disabled { opacity: 0.4; cursor: not-allowed; }
    html:not(.dark) .nov-pagination-btn.active { background: #ff0033; border-color: #ff0033; color: #fff; }

    html:not(.dark) .nov-card {
      background: rgba(209,213,219,0.2) !important;
      border: 1px solid rgba(0,0,0,0.04) !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02) !important;
      backdrop-filter: blur(8px) !important;
    }
    html:not(.dark) .nov-card:hover {
      background: rgba(209,213,219,0.35) !important;
      box-shadow: 0 8px 30px rgba(255,0,51,0.06) !important;
      border-color: rgba(255,0,51,0.15) !important;
    }
    html:not(.dark) .nov-card .nov-card-title { color: #18181b !important; }
    html:not(.dark) .nov-card .nov-card-desc { color: #52525b !important; }
    html:not(.dark) .nov-card .nov-card-date { color: #a1a1aa !important; }
  </style>

  <main class="relative pt-20 pb-24 px-6 max-w-[1100px] mx-auto w-full" style="min-height: calc(100vh - 60px);">
    <div class="text-center mb-16">
      <h1 class="section-glitch section-glitch-fast font-pixel text-2xl sm:text-4xl tracking-[0.3em] nov-title-color mb-4 transition-colors duration-300" data-text="HISTORIAL DE NOVEDADES" style="animation-delay: 2s;">HISTORIAL DE NOVEDADES</h1>
      <p class="font-retro text-lg sm:text-2xl nov-subtitle-color tracking-[0.2em] transition-colors duration-300">TODAS LAS TRANSMISIONES DE LA ARENA</p>
    </div>

    <div id="novedades-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-16">

    </div>

    <div id="pagination-controls" class="flex flex-col items-center gap-3 font-pixel text-xs sm:flex-row sm:justify-center">

    </div>
  </main>

<?php include __DIR__ . '/../includes/footer.php'; ?>

  <script>
    let currentConfig = null;
    let currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
    const itemsPerPage = 6;

    function renderPage(page) {
      if (!currentConfig || !currentConfig.novedades) return;
      currentPage = page;
      const allNews = Array.isArray(currentConfig.novedades) ? currentConfig.novedades : [];
      const totalPages = Math.ceil(allNews.length / itemsPerPage) || 1;

      if (currentPage < 1) currentPage = 1;
      if (currentPage > totalPages) currentPage = totalPages;

      const params = new URLSearchParams(window.location.search);
      params.set('page', currentPage);
      history.replaceState(null, '', '?' + params.toString());

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageItems = allNews.slice(startIndex, endIndex);

      const grid = document.getElementById('novedades-grid');
      grid.innerHTML = '';

      if (pageItems.length === 0) {
        grid.innerHTML = '<div class="col-span-2 text-center font-retro text-xl nov-empty py-12 transition-colors duration-300">No hay novedades registradas.</div>';
      } else {
        pageItems.forEach(nov => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'pixel-border rounded bg-zinc-800/20 p-6 backdrop-blur-sm transition-all hover:bg-zinc-800/40 flex flex-col justify-between nov-card';

          const wrapper = document.createElement('div');

          const header = document.createElement('div');
          header.className = 'flex items-center justify-between mb-3';

          const tag = document.createElement('span');
          tag.className = 'font-pixel text-[11px]';
          tag.style.color = nov.tag_color || '#ff0033';
          tag.textContent = nov.tag || '';

          const fecha = document.createElement('span');
          fecha.className = 'font-retro text-xs text-white/40 nov-card-date transition-colors duration-300';
          fecha.textContent = nov.fecha || '';

          header.appendChild(tag);
          header.appendChild(fecha);

          const titulo = document.createElement('h3');
          titulo.className = 'font-pixel text-xs text-white mb-2 leading-relaxed nov-card-title transition-colors duration-300';
          titulo.textContent = nov.titulo || '';

          const desc = document.createElement('p');
          desc.className = 'font-retro text-sm text-white/60 leading-relaxed nov-card-desc transition-colors duration-300';
          desc.textContent = nov.descripcion || '';

          wrapper.appendChild(header);
          wrapper.appendChild(titulo);
          wrapper.appendChild(desc);
          itemDiv.appendChild(wrapper);
          grid.appendChild(itemDiv);
        });
      }

      const pagination = document.getElementById('pagination-controls');
      pagination.innerHTML = '';

      if (totalPages > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = `px-5 py-3 rounded-lg border nov-pagination-btn transition-all w-full sm:w-auto order-1 ${currentPage > 1 ? 'cursor-pointer' : 'disabled'}`;
        prevBtn.innerHTML = `<span class="sm:hidden">← ATRÁS</span><span class="hidden sm:inline">← ANTERIOR</span>`;
        if (currentPage > 1) prevBtn.onclick = () => renderPage(currentPage - 1);
        pagination.appendChild(prevBtn);

        const numsWrapper = document.createElement('div');
        numsWrapper.className = 'flex items-center justify-center gap-2 order-2 flex-wrap';
        for (let i = 1; i <= totalPages; i++) {
          const numBtn = document.createElement('button');
          numBtn.className = `px-4 py-3 rounded-lg border nov-pagination-btn transition-all ${i === currentPage ? 'active font-bold shadow-md' : 'cursor-pointer'}`;
          numBtn.textContent = String(i).padStart(2, '0');
          numBtn.setAttribute('aria-label', 'Página ' + i);
          if (i === currentPage) numBtn.setAttribute('aria-current', 'page');
          numBtn.onclick = () => renderPage(i);
          numsWrapper.appendChild(numBtn);
        }
        pagination.appendChild(numsWrapper);

        const nextBtn = document.createElement('button');
        nextBtn.className = `px-5 py-3 rounded-lg border nov-pagination-btn transition-all w-full sm:w-auto order-3 ${currentPage < totalPages ? 'cursor-pointer' : 'disabled'}`;
        nextBtn.innerHTML = `<span class="sm:hidden">ADELANTE →</span><span class="hidden sm:inline">SIGUIENTE →</span>`;
        if (currentPage < totalPages) nextBtn.onclick = () => renderPage(currentPage + 1);
        pagination.appendChild(nextBtn);
      }
    }

    function initNovedades(cfg) {
      currentConfig = cfg;
      renderPage(1);
    }
    var CFG_VERSION = 2;
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem('warOfBossSiteConfig')); if (cached && cached._version !== CFG_VERSION) cached = null; } catch(e) {}
    if (cached) {
      initNovedades(cached);
    } else if (window.siteConfig) {
      initNovedades(window.siteConfig);
    } else {
      fetch('<?=$base?>api/obtener_config.php?v=' + Date.now())
        .then(res => res.json())
        .then(function(cfg) {
          window.siteConfig = cfg;
          try { cfg._version = CFG_VERSION; sessionStorage.setItem('warOfBossSiteConfig', JSON.stringify(cfg)); } catch(e) {}
          initNovedades(cfg);
        })
        .catch(function(err) { console.error(err); });
    }
  </script>
</body>
</html>
