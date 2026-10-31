document.addEventListener('DOMContentLoaded', () => {
  let currentConfig = null;

  const loginModal = document.getElementById("login-modal");
  const loginForm = document.getElementById("login-form");
  const loginPassword = document.getElementById("login-password");
  const loginError = document.getElementById("login-error");
  const dashboardContent = document.getElementById("dashboard-content");
  const logoutBtn = document.getElementById("logout-btn");
  const configForm = document.getElementById("config-form");
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-message");

  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.add("hidden"));

      btn.classList.add("active");
      document.getElementById(`tab-${targetTab}`).classList.remove("hidden");
      checkScrollDownButtonVisibility();
    });
  });

  function showToast(msg, isError = false) {
    toastMsg.textContent = msg;
    toast.style.borderColor = isError ? "#ef4444" : "#ff0033";
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 3000);
  }

  function checkAuthStatus() {
    fetch("../api/login.php")
      .then(res => res.json())
      .then(data => {
        if (data.logged_in) {
          loginModal.classList.add("hidden");
          loginModal.classList.remove("flex");
          dashboardContent.classList.remove("hidden");
          loadConfig();
        } else {
          loginModal.classList.remove("hidden");
          loginModal.classList.add("flex");
          dashboardContent.classList.add("hidden");
        }
      })
      .catch(() => {
        loginModal.classList.remove("hidden");
        loginModal.classList.add("flex");
      });
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginError.classList.add("hidden");

    fetch("../api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clave: loginPassword.value })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          loginModal.classList.add("hidden");
          loginModal.classList.remove("flex");
          dashboardContent.classList.remove("hidden");
          loadConfig();
        } else {
          loginError.textContent = data.mensaje || "Error al autenticar";
          loginError.classList.remove("hidden");
        }
      })
      .catch(() => {
        loginError.textContent = "Error de conexión con el servidor";
        loginError.classList.remove("hidden");
      });
  });

  logoutBtn.addEventListener("click", () => {
    clearInterval(hostStatusInterval);
    fetch("../api/logout.php")
      .then(() => {
        loginModal.classList.remove("hidden");
        loginModal.classList.add("flex");
        dashboardContent.classList.add("hidden");
        loginPassword.value = "";
      });
  });

  function loadConfig() {
    fetch("../api/obtener_config.php")
      .then(res => res.json())
      .then(data => {
        currentConfig = data;
        populateForm(data);
      })
      .catch(() => {
        showToast("Error al cargar la configuración", true);
      });
  }

  function populateForm(cfg, resetStates = true) {
    if (resetStates) {
      resetAllSectionStates();
    }

    const genTitulo = cfg.general?.titulo || "";
    const genSubtitulo = cfg.general?.subtitulo || "";
    document.getElementById("gen-titulo").value = genTitulo;
    document.getElementById("gen-subtitulo").value = genSubtitulo;
    document.getElementById("gen-boton-descarga").value = cfg.general?.boton_descarga_texto || "";
    document.getElementById("gen-subtexto-descarga").value = cfg.general?.subtexto_descarga || "";

    document.getElementById("summary-gen-titulo").textContent = genTitulo || "--";
    document.getElementById("summary-gen-subtitulo").textContent = genSubtitulo || "--";

    if (cfg.caracteristicas) {
      cfg.caracteristicas.forEach((feat, idx) => {
        const t = document.getElementById(`feat-${idx}-titulo`);
        const d = document.getElementById(`feat-${idx}-desc`);
        const imgInp = document.getElementById(`feat-${idx}-imagen`);
        const s = document.getElementById(`feat-${idx}-summary`);
        const fileEl = document.getElementById(`file-feat-${idx}`);
        if (t) t.value = feat.titulo || "";
        if (d) d.value = feat.descripcion || "";
        if (imgInp) imgInp.value = feat.imagen || "";
        if (fileEl) fileEl.value = '';
        if (s) s.textContent = feat.titulo ? `${feat.titulo} — ${feat.descripcion?.substring(0, 45)}...` : "Haz clic en Editar para ingresar datos";
        updateFeatPreview(idx, feat.imagen || "");
      });
    }

    const getCleanUrl = (url) => (url && url !== 'javascript:void(0)' && url !== '#') ? url : '';
    document.getElementById("red-enlace-descarga").value = getCleanUrl(cfg.general?.enlace_descarga);
    let redesArray = cfg.redes;
    if (!Array.isArray(redesArray)) {
      redesArray = [];
      const legacyMap = { twitter: 'Twitter / X', discord: 'Discord', steam: 'Steam', itchio: 'itch.io' };
      Object.entries(legacyMap).forEach(([key, label]) => {
        const u = getCleanUrl(cfg.redes?.[key]);
        if (u) redesArray.push({ nombre: label, url: u });
      });
    }
    renderRedes(redesArray);

    document.getElementById("media-fondo").value = cfg.multimedia?.fondo || "";
    document.getElementById("media-logo-claro").value = cfg.multimedia?.logo_claro || "";
    document.getElementById("media-logo-oscuro").value = cfg.multimedia?.logo_oscuro || "";
    document.getElementById("media-audio-clic").value = cfg.multimedia?.audio_clic || "";
    document.getElementById("media-audio-musica").value = cfg.multimedia?.audio_musica || "";

    updateAudioPlayers(cfg.multimedia);

    const sidebarLogo = document.getElementById("admin-sidebar-logo");
    if (sidebarLogo && cfg.multimedia?.logo_oscuro) {
      sidebarLogo.src = "../" + cfg.multimedia.logo_oscuro.replace(/^\//, '');
    }

    renderNovedades(cfg.novedades || []);

    renderFotos(cfg.multimedia?.fotos || []);

    const novCountEl = document.getElementById("stat-novedades-count");
    if (novCountEl && cfg.novedades) {
      novCountEl.textContent = cfg.novedades.length;
    }

    updateImagePreviews(cfg);

    loadRealMetrics();

    loadIPTable();
  }

  function updateAudioPlayers(multimedia) {
    const playerClic = document.getElementById("player-audio-clic");
    const playerMusica = document.getElementById("player-audio-musica");

    if (playerClic && multimedia?.audio_clic) {
      const srcClic = multimedia.audio_clic.startsWith('http') ? multimedia.audio_clic : '../' + multimedia.audio_clic.replace(/^\//, '');
      playerClic.src = srcClic;
    }
    if (playerMusica && multimedia?.audio_musica) {
      const srcMusica = multimedia.audio_musica.startsWith('http') ? multimedia.audio_musica : '../' + multimedia.audio_musica.replace(/^\//, '');
      playerMusica.src = srcMusica;
    }
  }

  const MAX_REDES = 10;

  function renderRedes(redesArray) {
    const container = document.getElementById("redes-container");
    if (!container) return;
    container.innerHTML = "";

    (redesArray || []).forEach((red, idx) => {
      container.appendChild(createRedRow(red.nombre || "", red.url || "", idx));
    });

    updateAddRedBtn();
  }

  function createRedRow(nombre, url, idx) {
    const div = document.createElement("div");
    div.className = "red-row bg-[#121215] rounded-lg border border-white/5 p-4 flex items-center gap-3 group";
    div.innerHTML = `
      <span class="flex-shrink-0 w-6 h-6 rounded-md bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-mono text-zinc-400">${String(idx + 1).padStart(2, '0')}</span>
      <input type="text" class="red-nombre input-field text-xs font-bold flex-shrink-0 w-36" placeholder="Nombre del sitio" value="${nombre.replace(/"/g, '&quot;')}">
      <input type="text" class="red-url input-field text-xs font-mono flex-1" placeholder="https://..." value="${url.replace(/"/g, '&quot;')}">
      <button type="button" class="red-test-btn btn-secondary text-xs flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
        </svg>
        <span class="hidden sm:inline">Probar</span>
      </button>
      <button type="button" class="red-del-btn flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-950/40 border border-white/5 hover:border-red-500/30 transition-all duration-200" title="Eliminar">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>`;

    div.querySelector(".red-test-btn").addEventListener("click", () => {
      const u = div.querySelector(".red-url").value.trim();
      if (u && u !== 'javascript:void(0)') window.open(u, "_blank");
      else showToast("Ingresa una URL válida primero", true);
    });

    div.querySelector(".red-del-btn").addEventListener("click", () => {
      div.remove();
      reindexRedes();
      setSectionDirty("redes", true);
      updateAddRedBtn();
    });

    div.querySelectorAll(".red-nombre, .red-url").forEach(inp => {
      inp.addEventListener("input", () => setSectionDirty("redes", true));
    });

    return div;
  }

  function reindexRedes() {
    document.querySelectorAll("#redes-container .red-row").forEach((row, i) => {
      const badge = row.querySelector("span.font-mono");
      if (badge) badge.textContent = String(i + 1).padStart(2, "0");
    });
  }

  function updateAddRedBtn() {
    const btn = document.getElementById("add-red-btn");
    if (!btn) return;
    const count = document.querySelectorAll("#redes-container .red-row").length;
    if (count >= MAX_REDES) {
      btn.disabled = true;
      btn.classList.add("opacity-40", "cursor-not-allowed", "pointer-events-none");
      btn.title = "Máximo 10 sitios alcanzado";
    } else {
      btn.disabled = false;
      btn.classList.remove("opacity-40", "cursor-not-allowed", "pointer-events-none");
      btn.title = "";
    }
  }

  const addRedBtn = document.getElementById("add-red-btn");
  if (addRedBtn) {
    addRedBtn.addEventListener("click", () => {
      const count = document.querySelectorAll("#redes-container .red-row").length;
      if (count >= MAX_REDES) return;
      const container = document.getElementById("redes-container");
      container.appendChild(createRedRow("", "", count));
      updateAddRedBtn();
      setSectionDirty("redes", true);
    });
  }

  const redEnlaceInput = document.getElementById("red-enlace-descarga");
  if (redEnlaceInput) {
    redEnlaceInput.addEventListener("input", () => setSectionDirty("redes", true));
  }

  function updateImagePreviews(cfg) {
    const previewMap = [
      { key: 'fondo', id: 'preview-fondo', placeholderId: 'preview-fondo-placeholder' },
      { key: 'logo_claro', id: 'preview-logo-claro', placeholderId: 'preview-logo-claro-placeholder' },
      { key: 'logo_oscuro', id: 'preview-logo-oscuro', placeholderId: 'preview-logo-oscuro-placeholder' }
    ];
    previewMap.forEach(item => {
      const imgEl = document.getElementById(item.id);
      const placeholderEl = document.getElementById(item.placeholderId);
      const src = cfg.multimedia?.[item.key];
      if (imgEl && src) {
        const fullSrc = (src.startsWith('http') ? src : '../' + src.replace(/^\//, '')) + '?v=' + Date.now();
        imgEl.src = fullSrc;
        imgEl.style.display = 'block';
        if (placeholderEl) placeholderEl.style.display = 'none';
        imgEl.onerror = () => {
          imgEl.style.display = 'none';
          if (placeholderEl) placeholderEl.style.display = 'flex';
        };
      } else if (imgEl) {
        imgEl.style.display = 'none';
        if (placeholderEl) placeholderEl.style.display = 'flex';
      }
    });
  }

  let chartInstance = null;
  let currentPeriodDays = 7;

  function buildMetricUrl(fechaInicio, fechaFin) {
    let url = "../api/metricas.php?";
    if (fechaFin) {
      url += `fecha_fin=${fechaFin}`;
      if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
    }
    return url;
  }

  function getDateNDaysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  function formatDateES(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function updateRangeLabel(data) {
    const label = document.getElementById("chart-range-label");
    if (!label) return;
    if (data.rango) {
      const r = data.rango;
      if (r.dias <= 7) {
        label.textContent = `Últimos ${r.dias} días`;
      } else if (r.dias <= 365) {
        label.textContent = `Últimos ${r.dias} días`;
      } else {
        label.textContent = `${formatDateES(r.inicio)} — ${formatDateES(r.fin)}`;
      }
      if (r.semanal) {
        label.textContent += ' (vista semanal)';
      }
    } else {
      label.textContent = 'Métricas acumuladas desde la actividad real';
    }
  }

  function loadRealMetrics(fechaInicio, fechaFin) {
    const url = buildMetricUrl(fechaInicio, fechaFin);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const visitasEl = document.getElementById("stat-visitas-count");
        const descargasEl = document.getElementById("stat-descargas-count");
        const usuariosEl = document.getElementById("stat-usuarios-count");
        if (visitasEl) visitasEl.textContent = (data.visitas_totales || 0).toLocaleString();
        if (descargasEl) descargasEl.textContent = (data.descargas_totales || 0).toLocaleString();
        if (usuariosEl) usuariosEl.textContent = (data.usuarios_unicos || 0).toLocaleString();

        updateRangeLabel(data);

        const ctx = document.getElementById("analyticsChart");
        if (!ctx) return;
        if (chartInstance) chartInstance.destroy();

        const labels = data.historial_semanal?.labels || [];
        const visitasData = data.historial_semanal?.visitas || [];
        const descargasData = data.historial_semanal?.descargas || [];
        const pointCount = labels.length;
        const isWeekly = data.rango?.semanal || false;
        const pointRadius = isWeekly ? 4 : (pointCount > 30 ? 1.5 : 3);
        const pointHoverRadius = isWeekly ? 6 : (pointCount > 30 ? 3 : 5);

        chartInstance = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Visitas Reales",
                data: visitasData,
                borderColor: "#ff0033",
                backgroundColor: "rgba(255, 0, 51, 0.12)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "#ff0033",
                pointRadius: pointRadius,
                pointHoverRadius: pointHoverRadius
              },
              {
                label: "Descargas Clicadas",
                data: descargasData,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.08)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "#3b82f6",
                pointRadius: pointRadius,
                pointHoverRadius: pointHoverRadius
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: { color: "#a1a1aa", font: { size: 11 } }
              }
            },
            scales: {
              x: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: {
                  color: "#a1a1aa",
                  font: { size: 10 },
                  maxRotation: pointCount > 30 ? 45 : 0,
                  autoSkip: true,
                  maxTicksLimit: pointCount > 60 ? 20 : (pointCount > 30 ? 15 : pointCount)
                }
              },
              y: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: { color: "#a1a1aa", font: { size: 10 } },
                beginAtZero: true
              }
            }
          }
        });
      })
      .catch(err => {
        console.log("Error al cargar métricas dinámicas", err);
        showToast("Error al cargar métricas del servidor", true);
      });

    loadHostStatus();
  }

  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const days = parseInt(btn.dataset.days);
      currentPeriodDays = days;

      document.getElementById('chart-date-start').value = '';
      document.getElementById('chart-date-end').value = '';

      let fechaInicio, fechaFin;
      if (days === 0) {
        fechaInicio = '';
        fechaFin = 'all';
      } else {
        fechaInicio = getDateNDaysAgo(days - 1);
        fechaFin = getDateNDaysAgo(0);
      }
      loadRealMetrics(fechaInicio, fechaFin);
    });
  });

  document.getElementById('chart-apply-range')?.addEventListener('click', () => {
    const start = document.getElementById('chart-date-start').value;
    const end = document.getElementById('chart-date-end').value;
    if (!start || !end) {
      showToast('Selecciona ambas fechas');
      return;
    }
    if (start > end) {
      showToast('La fecha de inicio debe ser anterior a la fecha fin');
      return;
    }
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    loadRealMetrics(start, end);
  });

  function loadHostStatus() {
    fetch("../api/estado_host.php")
      .then(res => res.json())
      .then(data => {
        const diskText = document.getElementById("host-disk-text");
        const hostName = document.getElementById("host-name-text");
        const hostPhp = document.getElementById("host-php-text");

        if (diskText) diskText.textContent = `${data.mb_usados} MB`;
        if (hostName) hostName.textContent = data.host;
        if (hostPhp) hostPhp.textContent = data.version_php;
      })
      .catch(() => {
        const diskText = document.getElementById("host-disk-text");
        const hostName = document.getElementById("host-name-text");
        const hostPhp = document.getElementById("host-php-text");
        if (diskText) diskText.textContent = 'Error';
        if (hostName) hostName.textContent = 'Error';
        if (hostPhp) hostPhp.textContent = 'Error';
      });
  }

  const hostStatusInterval = setInterval(loadHostStatus, 60000);

  function renderNovedades(novedades) {
    const container = document.getElementById("novedades-container");
    container.innerHTML = "";

    novedades.forEach((item, index) => {
      const tagColor = item.tag_color || '#ff0033';
      const div = document.createElement("div");
      div.className = "p-4 bg-[#121215] border border-white/5 rounded-lg space-y-3";
      div.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="nov-badge-preview px-2.5 py-1 rounded text-[11px] font-bold font-mono border transition-all" style="background-color: ${tagColor}22; color: ${tagColor}; border-color: ${tagColor}55">${item.tag || 'ACTUALIZACIÓN'}</span>
            <span class="nov-title-preview text-xs text-white font-bold font-sans">${item.titulo || 'Sin título'}</span>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="btn-secondary text-[11px] py-1 px-3 toggle-nov-btn" data-index="${index}">Editar</button>
            <button type="button" class="text-xs text-red-500 hover:underline delete-nov-btn" data-index="${index}">Eliminar</button>
          </div>
        </div>

        <!-- Campos de Edición (Ocultos hasta dar clic en Editar) -->
        <div id="nov-body-${index}" class="hidden space-y-3 pt-3 border-t border-white/5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs text-zinc-400 mb-1">Etiqueta / Tag</label>
              <input type="text" class="input-field nov-tag" value="${item.tag || ''}">
            </div>
            <div>
              <label class="block text-xs text-zinc-400 mb-1">Fecha</label>
              <input type="text" class="input-field nov-fecha" value="${item.fecha || ''}">
            </div>
            <div>
              <label class="block text-xs text-zinc-400 mb-1">Color de la Etiqueta</label>
              <div class="flex items-center gap-2">
                <input type="color" class="nov-color-picker h-9 w-12 rounded cursor-pointer border border-white/10 bg-black/40 p-1" value="${tagColor}">
                <input type="text" class="input-field nov-color font-mono text-xs" value="${tagColor}">
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs text-zinc-400 mb-1">Título de la Novedad</label>
            <input type="text" class="input-field nov-titulo" value="${item.titulo || ''}">
          </div>
          <div>
            <label class="block text-xs text-zinc-400 mb-1">Descripción</label>
            <textarea rows="2" class="input-field nov-desc">${item.descripcion || ''}</textarea>
          </div>
        </div>
      `;
      container.appendChild(div);

      setTimeout(() => {
        const badgePreview = div.querySelector(".nov-badge-preview");
        const titlePreview = div.querySelector(".nov-title-preview");
        const tagInput = div.querySelector(".nov-tag");
        const titleInput = div.querySelector(".nov-titulo");
        const picker = div.querySelector(".nov-color-picker");
        const textInp = div.querySelector(".nov-color");

        const updateBadgeColor = (color) => {
          if (badgePreview) {
            badgePreview.style.backgroundColor = color + "22";
            badgePreview.style.color = color;
            badgePreview.style.borderColor = color + "55";
          }
        };

        if (tagInput && badgePreview) tagInput.addEventListener("input", (e) => { setSectionDirty("novedades", true); badgePreview.textContent = e.target.value || "TAG"; });
        if (titleInput && titlePreview) titleInput.addEventListener("input", (e) => { setSectionDirty("novedades", true); titlePreview.textContent = e.target.value || "Sin título"; });
        const fechaInput = div.querySelector(".nov-fecha");
        const descInput = div.querySelector(".nov-desc");
        if (fechaInput) fechaInput.addEventListener("input", () => setSectionDirty("novedades", true));
        if (descInput) descInput.addEventListener("input", () => setSectionDirty("novedades", true));
        if (picker && textInp) {
          picker.addEventListener("input", (e) => { textInp.value = e.target.value; updateBadgeColor(e.target.value); setSectionDirty("novedades", true); });
          textInp.addEventListener("input", (e) => { setSectionDirty("novedades", true); if (/^#[0-9A-F]{6}$/i.test(e.target.value)) { picker.value = e.target.value; updateBadgeColor(e.target.value); } });
        }
      }, 20);
    });

    document.querySelectorAll(".toggle-nov-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.getAttribute("data-index");
        const body = document.getElementById(`nov-body-${idx}`);
        if (body) {
          const isHidden = body.classList.contains("hidden");
          body.classList.toggle("hidden");
          e.target.textContent = isHidden ? "Ocultar" : "Editar";
        }
      });
    });

    document.querySelectorAll(".delete-nov-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.getAttribute("data-index"));
        currentConfig.novedades.splice(idx, 1);
        renderNovedades(currentConfig.novedades);
        setSectionDirty("novedades", true);
      });
    });
  }

  document.getElementById("add-novedad-btn").addEventListener("click", () => {
    if (!currentConfig.novedades) currentConfig.novedades = [];
    currentConfig.novedades.push({
      id: Date.now(),
      tag: "NUEVA ACTUALIZACIÓN",
      tag_color: "#ff0033",
      fecha: "HOY",
      titulo: "Título de la Novedad",
      descripcion: "Descripción de la novedad..."
    });
    renderNovedades(currentConfig.novedades);
    setSectionDirty("novedades", true);
  });

  function renderFotos(fotos) {
    const container = document.getElementById("fotos-container");
    if (!container) return;
    container.innerHTML = "";

    fotos.forEach((fotoItem, idx) => {
      const url = typeof fotoItem === 'string' ? fotoItem : (fotoItem?.url || '');
      const desc = typeof fotoItem === 'string' ? '' : (fotoItem?.descripcion || '');
      const fullSrc = (url.startsWith('http') ? url : '../' + url.replace(/^\//, '')) + '?v=' + Date.now();

      const div = document.createElement("div");
      div.className = "foto-card p-4 bg-[#121215] border border-white/5 rounded-lg space-y-3";
      div.innerHTML = `
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold text-white">Captura #${idx + 1}</label>
          <span class="text-[10px] text-zinc-500 font-mono">Carrusel 3D</span>
        </div>
        <div class="preview-box rounded-lg overflow-hidden border border-white/5 bg-black/40" style="height:140px">
          <img id="preview-foto-${idx}" src="${fullSrc}" alt="Foto #${idx + 1}" class="w-full h-full object-cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="w-full h-full flex items-center justify-center text-zinc-600 text-xs" style="display:none">Sin previsualización</div>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-zinc-400 mb-1">Ruta / URL de la imagen:</label>
          <input type="text" id="foto-input-${idx}" class="input-field foto-url-input text-xs font-mono" value="${url.replace(/"/g, '&quot;')}">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-zinc-400 mb-1">Descripción en visor / lightbox:</label>
          <input type="text" id="foto-desc-${idx}" class="input-field foto-desc-input text-xs" placeholder="" value="${desc.replace(/"/g, '&quot;')}">
        </div>
        <div class="flex items-center gap-2">
          <input type="file" id="foto-file-${idx}" accept="image/*" class="hidden">
          <button type="button" onclick="document.getElementById('foto-file-${idx}').click()" class="btn-secondary text-xs w-full">Subir / Reemplazar Foto</button>
        </div>
        <span id="foto-status-${idx}" class="text-xs text-emerald-400 block"></span>
      `;
      container.appendChild(div);

      setTimeout(() => {
        const inp = document.getElementById(`foto-input-${idx}`);
        const descInp = document.getElementById(`foto-desc-${idx}`);
        const img = document.getElementById(`preview-foto-${idx}`);
        if (inp && img) {
          inp.addEventListener("input", (e) => {
            setSectionDirty("galeria", true);
            delete pendingGalleryFiles[idx];
            const stEl = document.getElementById(`foto-status-${idx}`);
            if (stEl) stEl.textContent = '';
            const val = e.target.value;
            img.src = val.startsWith('http') ? val : '../' + val.replace(/^\//, '');
            img.style.display = 'block';
          });
        }
        if (descInp) {
          descInp.addEventListener("input", () => setSectionDirty("galeria", true));
        }

        const fileInput = document.getElementById(`foto-file-${idx}`);
        if (fileInput) {
          fileInput.addEventListener("change", () => {
            if (fileInput.files.length > 0) {
              pendingGalleryFiles[idx] = { file: fileInput.files[0], oldPath: url };
              const blobUrl = URL.createObjectURL(fileInput.files[0]);
              document.getElementById(`preview-foto-${idx}`).src = blobUrl;
              document.getElementById(`foto-status-${idx}`).textContent = 'Listo para subir';
              setSectionDirty("galeria", true);
            }
          });
        }
      }, 50);
    });
  }

  function uploadFile(fileObj, antiguoPath, tipoRecurso, callback, skipModal) {
    const formData = new FormData();
    formData.append("archivo", fileObj);
    formData.append("tipo_recurso", tipoRecurso);

    fetch("../api/subir_archivo.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          callback(data.ruta);
          if (!skipModal && fileObj.type && fileObj.type.startsWith('image/')) {
            showImageModal(tipoRecurso, data.ruta, fileObj);
          } else if (!skipModal) {
            showToast("Archivo subido y reemplazado en almacenamiento");
          }
        } else {
          showToast(data.error || "Error al subir archivo", true);
        }
      })
      .catch(() => showToast("Error de conexión al subir archivo", true));
  }

  function showImageModal(tipoRecurso, ruta, fileObj) {
    const modal = document.getElementById("modal-imagen");
    const recursoEl = document.getElementById("modal-imagen-recurso");
    const previewEl = document.getElementById("modal-imagen-preview");
    const rutaEl = document.getElementById("modal-imagen-ruta");

    const nombres = {
      fondo: 'Imagen de Fondo (Hero)',
      logo_claro: 'Logo Claro',
      logo_oscuro: 'Logo Oscuro',
    };
    const nombreLegible = nombres[tipoRecurso] || tipoRecurso.replace(/_/g, ' ');

    recursoEl.textContent = `Se actualizó correctamente: ${nombreLegible}`;
    rutaEl.textContent = `Ruta: ${ruta}`;

    const blobUrl = URL.createObjectURL(fileObj);
    previewEl.src = blobUrl;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const previewMap = {
      fondo: 'preview-fondo',
      logo_claro: 'preview-logo-claro',
      logo_oscuro: 'preview-logo-oscuro'
    };
    if (previewMap[tipoRecurso]) {
      const prevImg = document.getElementById(previewMap[tipoRecurso]);
      const prevPlaceholder = document.getElementById(previewMap[tipoRecurso] + '-placeholder');
      if (prevImg) {
        prevImg.src = blobUrl;
        prevImg.style.display = 'block';
      }
      if (prevPlaceholder) prevPlaceholder.style.display = 'none';
    }
  }

  document.getElementById("modal-imagen-cerrar").addEventListener("click", () => {
    const modal = document.getElementById("modal-imagen");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  });

  const toggleGeneralBtn = document.getElementById("toggle-edit-general");
  if (toggleGeneralBtn) {
    toggleGeneralBtn.addEventListener("click", () => {
      const editFields = document.getElementById("general-edit-fields");
      const summary = document.getElementById("general-summary");
      if (editFields) {
        const isHidden = editFields.classList.contains("hidden");
        editFields.classList.toggle("hidden");
        if (summary) summary.classList.toggle("hidden", !isHidden);
        toggleGeneralBtn.querySelector("span").textContent = isHidden ? "Ocultar" : "Editar";
      }
    });
  }

  const sectionStates = {
    general: false,
    caracteristicas: false,
    novedades: false,
    redes: false,
    multimedia: false,
    galeria: false,
    audios: false
  };

  const sectionNames = {
    general: 'General',
    caracteristicas: 'Características',
    novedades: 'Novedades',
    redes: 'Redes & Descargas',
    multimedia: 'Imágenes & Logos',
    galeria: 'Galería 3D',
    audios: 'Audios & Música'
  };

  function setSectionDirty(sectionKey, isDirty) {
    if (!(sectionKey in sectionStates)) return;
    sectionStates[sectionKey] = isDirty;

    const saveBtn = document.querySelector(`.btn-save-section[data-section="${sectionKey}"]`);
    const cancelBtn = document.querySelector(`.btn-cancel-section[data-section="${sectionKey}"]`);
    const statusDot = document.getElementById(`status-dot-${sectionKey}`);
    const statusText = document.getElementById(`status-text-${sectionKey}`);

    if (saveBtn) {
      if (isDirty) {
        saveBtn.disabled = false;
        saveBtn.className = "btn-save-section py-2.5 px-6 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all duration-300 bg-[#ff0033] text-white hover:bg-red-600 border border-red-400/50 shadow-lg shadow-red-950/60 cursor-pointer";
        
        if (cancelBtn) {
          cancelBtn.disabled = false;
          cancelBtn.className = "btn-cancel-section py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all duration-300 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-white/10 cursor-pointer";
        }

        if (statusDot) statusDot.className = "w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping transition-all";
        if (statusText) {
          statusText.className = "text-amber-400 font-bold font-sans transition-all";
          statusText.textContent = `● Cambios pendientes en ${sectionNames[sectionKey]}`;
        }
      } else {
        saveBtn.disabled = true;
        saveBtn.className = "btn-save-section py-2.5 px-6 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all duration-300 bg-zinc-800/60 text-zinc-500 border border-white/5 opacity-40 cursor-not-allowed pointer-events-none";

        if (cancelBtn) {
          cancelBtn.disabled = true;
          cancelBtn.className = "btn-cancel-section py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all duration-300 bg-zinc-800/60 text-zinc-500 border border-white/5 opacity-40 cursor-not-allowed pointer-events-none";
        }

        if (statusDot) statusDot.className = "w-2 h-2 rounded-full bg-zinc-600 transition-all";
        if (statusText) {
          statusText.className = "text-zinc-500 font-sans transition-all";
          statusText.textContent = `Sin cambios en ${sectionNames[sectionKey]}`;
        }
      }
    }

    checkScrollDownButtonVisibility();
  }

  function resetAllSectionStates() {
    Object.keys(sectionStates).forEach(sec => {
      setSectionDirty(sec, false);
    });
  }

  function checkScrollDownButtonVisibility() {
    const scrollContainer = document.getElementById("main-content-scroll");
    const floatingBtn = document.getElementById("floating-scroll-down-btn");
    if (!floatingBtn) return;

    const activeTabBtn = document.querySelector(".tab-btn.active");
    const activeTabKey = activeTabBtn ? activeTabBtn.getAttribute("data-tab") : null;

    const hasDirty = (activeTabKey && sectionStates[activeTabKey]) || Object.values(sectionStates).some(v => v === true);

    let scrollTop = 0;
    let scrollHeight = 0;
    let clientHeight = 0;

    if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
      scrollTop = scrollContainer.scrollTop;
      scrollHeight = scrollContainer.scrollHeight;
      clientHeight = scrollContainer.clientHeight;
    } else {
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = window.innerHeight;
    }

    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    const isScrolledUp = distanceToBottom > 60;

    if (hasDirty && isScrolledUp) {
      floatingBtn.classList.remove("hidden");
      floatingBtn.classList.add("flex");
    } else {
      floatingBtn.classList.add("hidden");
      floatingBtn.classList.remove("flex");
    }
  }

  const floatingBtnEl = document.getElementById("floating-scroll-down-btn");
  if (floatingBtnEl) {
    floatingBtnEl.addEventListener("click", () => {
      const scrollContainer = document.getElementById("main-content-scroll");
      if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth"
        });
      } else {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth"
        });
      }
    });
  }

  const mainScrollEl = document.getElementById("main-content-scroll");
  if (mainScrollEl) mainScrollEl.addEventListener("scroll", checkScrollDownButtonVisibility);
  window.addEventListener("scroll", checkScrollDownButtonVisibility);

  document.querySelectorAll(".toggle-feat-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const targetId = e.target.getAttribute("data-target");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const isHidden = targetEl.classList.contains("hidden");
        targetEl.classList.toggle("hidden");
        e.target.textContent = isHidden ? "Ocultar" : "Editar";
      }
    });
  });

  ["gen-titulo", "gen-subtitulo", "gen-boton-descarga", "gen-subtexto-descarga"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", (e) => {
        setSectionDirty("general", true);
        if (id === "gen-titulo") document.getElementById("summary-gen-titulo").textContent = e.target.value || "--";
        if (id === "gen-subtitulo") document.getElementById("summary-gen-subtitulo").textContent = e.target.value || "--";
      });
    }
  });

  [0, 1, 2].forEach(idx => {
    const t = document.getElementById(`feat-${idx}-titulo`);
    const d = document.getElementById(`feat-${idx}-desc`);
    const s = document.getElementById(`feat-${idx}-summary`);
    const updateSummary = () => {
      setSectionDirty("caracteristicas", true);
      if (s) s.textContent = (t && t.value) ? `${t.value} — ${(d?.value || '').substring(0, 45)}...` : "Haz clic en Editar para ingresar datos";
    };
    if (t) t.addEventListener("input", updateSummary);
    if (d) d.addEventListener("input", updateSummary);
  });

  ["red-enlace-descarga"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => setSectionDirty("redes", true));
    }
  });

  const mediaInputs = [
    { inputId: "media-fondo", imgId: "preview-fondo", placeholderId: "preview-fondo-placeholder", sec: "multimedia", key: "fondo", statusId: "status-fondo" },
    { inputId: "media-logo-claro", imgId: "preview-logo-claro", placeholderId: "preview-logo-claro-placeholder", sec: "multimedia", key: "logo_claro", statusId: "status-logo-claro" },
    { inputId: "media-logo-oscuro", imgId: "preview-logo-oscuro", placeholderId: "preview-logo-oscuro-placeholder", sec: "multimedia", key: "logo_oscuro", statusId: "status-logo-oscuro" }
  ];
  mediaInputs.forEach(m => {
    const inp = document.getElementById(m.inputId);
    const img = document.getElementById(m.imgId);
    const ph = document.getElementById(m.placeholderId);
    if (inp && img) {
      inp.addEventListener("input", (e) => {
        setSectionDirty(m.sec, true);
        delete pendingFiles[m.key];
        const stEl = document.getElementById(m.statusId);
        if (stEl) stEl.textContent = '';
        const src = e.target.value;
        if (src) {
          img.src = src.startsWith('http') ? src : '../' + src.replace(/^\//, '');
          img.style.display = 'block';
          if (ph) ph.style.display = 'none';
        } else {
          img.style.display = 'none';
          if (ph) ph.style.display = 'flex';
        }
      });
    }
  });

  document.querySelectorAll(".test-link-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const inputId = btn.getAttribute("data-input");
      const inp = document.getElementById(inputId);
      const url = inp ? inp.value.trim() : '';
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        window.open(url, '_blank');
      } else {
        showToast("Ingresa una dirección web válida (ej. https://...)", true);
      }
    });
  });

  const inputAudioClic = document.getElementById("media-audio-clic");
  const inputAudioMusica = document.getElementById("media-audio-musica");
  if (inputAudioClic) {
    inputAudioClic.addEventListener("input", (e) => {
      setSectionDirty("audios", true);
      const player = document.getElementById("player-audio-clic");
      if (player) player.src = e.target.value.startsWith('http') ? e.target.value : '../' + e.target.value.replace(/^\//, '');
    });
  }
  if (inputAudioMusica) {
    inputAudioMusica.addEventListener("input", (e) => {
      setSectionDirty("audios", true);
      const player = document.getElementById("player-audio-musica");
      if (player) player.src = e.target.value.startsWith('http') ? e.target.value : '../' + e.target.value.replace(/^\//, '');
    });
  }

  const pendingFiles = {};
  const pendingGalleryFiles = {};
  const pendingAudioFiles = {};
  const pendingFeatFiles = {};
  const IMAGE_KEYS = ['fondo', 'logo_claro', 'logo_oscuro'];

  const mediaKeys = [
    { fileId: "file-fondo", inputId: "media-fondo", statusId: "status-fondo", key: "fondo", sec: "multimedia" },
    { fileId: "file-logo-claro", inputId: "media-logo-claro", statusId: "status-logo-claro", key: "logo_claro", sec: "multimedia" },
    { fileId: "file-logo-oscuro", inputId: "media-logo-oscuro", statusId: "status-logo-oscuro", key: "logo_oscuro", sec: "multimedia" },
    { fileId: "file-audio-clic", inputId: "media-audio-clic", statusId: "status-audio-clic", key: "audio_clic", sec: "audios" },
    { fileId: "file-audio-musica", inputId: "media-audio-musica", statusId: "status-audio-musica", key: "audio_musica", sec: "audios" },
  ];

  mediaKeys.forEach(m => {
    const el = document.getElementById(m.fileId);
    if (el) {
      el.addEventListener("change", () => {
        if (el.files.length > 0) {
          if (IMAGE_KEYS.includes(m.key)) {
            pendingFiles[m.key] = el.files[0];
            const previewImg = document.getElementById(m.inputId.replace('media-', 'preview-'));
            const placeholder = document.getElementById(m.inputId.replace('media-', 'preview-') + '-placeholder');
            if (previewImg) {
              previewImg.src = URL.createObjectURL(el.files[0]);
              previewImg.style.display = 'block';
            }
            if (placeholder) placeholder.style.display = 'none';
            document.getElementById(m.statusId).textContent = 'Listo para subir';
            setSectionDirty(m.sec, true);
          } else {
            pendingAudioFiles[m.key] = { file: el.files[0], oldPath: document.getElementById(m.inputId).value };
            const playerId = m.key === 'audio_clic' ? 'player-audio-clic' : 'player-audio-musica';
            const player = document.getElementById(playerId);
            if (player) {
              player.src = URL.createObjectURL(el.files[0]);
              player.play().catch(() => {});
            }
            document.getElementById(m.statusId).textContent = 'Listo para subir';
            setSectionDirty(m.sec, true);
          }
        }
      });
    }
  });

  function updateFeatPreview(idx, src) {
    const img = document.getElementById(`preview-feat-${idx}`);
    const ph = document.getElementById(`preview-feat-${idx}-placeholder`);
    if (!img) return;
    if (!src) {
      img.src = '';
      img.style.display = 'none';
      if (ph) ph.style.display = 'flex';
      return;
    }
    const isBlobOrHttp = src.startsWith('blob:') || src.startsWith('http');
    const fullSrc = isBlobOrHttp ? src : '../' + src.replace(/^\//, '') + '?v=' + Date.now();
    img.onload = () => { img.style.display = 'block'; if (ph) ph.style.display = 'none'; };
    if (!isBlobOrHttp) {
      img.onerror = () => { img.style.display = 'none'; if (ph) ph.style.display = 'flex'; };
    } else {
      img.onerror = null;
    }
    img.src = fullSrc;
  }

  [0, 1, 2].forEach(idx => {
    const fileEl = document.getElementById(`file-feat-${idx}`);
    const imgInp = document.getElementById(`feat-${idx}-imagen`);
    const statusEl = document.getElementById(`status-feat-${idx}`);

    if (fileEl) {
      fileEl.addEventListener("change", () => {
        if (fileEl.files.length > 0) {
          pendingFeatFiles[idx] = fileEl.files[0];
          const blobUrl = URL.createObjectURL(fileEl.files[0]);
          updateFeatPreview(idx, blobUrl);
          if (statusEl) statusEl.textContent = 'Listo para subir';
          if (imgInp) imgInp.value = '';
          setSectionDirty("caracteristicas", true);
        }
      });
    }

    if (imgInp) {
      imgInp.addEventListener("input", (e) => {
        delete pendingFeatFiles[idx];
        if (statusEl) statusEl.textContent = '';
        updateFeatPreview(idx, e.target.value);
        setSectionDirty("caracteristicas", true);
      });
    }
  });

  function saveConfig(targetSection = null) {
    const novDivs = document.querySelectorAll("#novedades-container > div");
    const nuevasNovedades = [];
    novDivs.forEach((div, idx) => {
      nuevasNovedades.push({
        id: idx + 1,
        tag: div.querySelector(".nov-tag")?.value || "",
        tag_color: div.querySelector(".nov-color")?.value || "#ff0033",
        fecha: div.querySelector(".nov-fecha")?.value || "",
        titulo: div.querySelector(".nov-titulo")?.value || "",
        descripcion: div.querySelector(".nov-desc")?.value || ""
      });
    });

    const getSaveUrl = (id) => {
      const val = document.getElementById(id)?.value?.trim();
      return val ? val : 'javascript:void(0)';
    };

    const fotoCards = document.querySelectorAll("#fotos-container > div.foto-card");
    const nuevasFotos = Array.from(fotoCards).map(card => ({
      url: card.querySelector(".foto-url-input")?.value?.trim() || "",
      descripcion: card.querySelector(".foto-desc-input")?.value?.trim() || ""
    }));

    const configToSave = {
      general: {
        titulo: document.getElementById("gen-titulo").value,
        subtitulo: document.getElementById("gen-subtitulo").value,
        boton_descarga_texto: document.getElementById("gen-boton-descarga").value,
        subtexto_descarga: document.getElementById("gen-subtexto-descarga").value,
        enlace_descarga: getSaveUrl("red-enlace-descarga")
      },
      caracteristicas: [
        {
          numero: "01",
          color: "#ff0033",
          titulo: document.getElementById("feat-0-titulo").value,
          descripcion: document.getElementById("feat-0-desc").value,
          imagen: document.getElementById("feat-0-imagen").value
        },
        {
          numero: "02",
          color: "#0040ff",
          titulo: document.getElementById("feat-1-titulo").value,
          descripcion: document.getElementById("feat-1-desc").value,
          imagen: document.getElementById("feat-1-imagen").value
        },
        {
          numero: "03",
          color: "#ff0033",
          titulo: document.getElementById("feat-2-titulo").value,
          descripcion: document.getElementById("feat-2-desc").value,
          imagen: document.getElementById("feat-2-imagen").value
        }
      ],
      novedades: nuevasNovedades,
      redes: (function() {
        const rows = document.querySelectorAll("#redes-container .red-row");
        const arr = [];
        rows.forEach(row => {
          const nombre = row.querySelector(".red-nombre")?.value?.trim() || "";
          const url = row.querySelector(".red-url")?.value?.trim() || "";
          if (nombre || url) arr.push({ nombre, url: url || 'javascript:void(0)' });
        });
        return arr;
      })(),
      multimedia: {
        fondo: document.getElementById("media-fondo").value,
        logo_claro: document.getElementById("media-logo-claro").value,
        logo_oscuro: document.getElementById("media-logo-oscuro").value,
        audio_clic: document.getElementById("media-audio-clic").value,
        audio_musica: document.getElementById("media-audio-musica").value,
        fotos: nuevasFotos
      }
    };

    const pendingKeys = Object.keys(pendingFiles);
    const pendingGalleryKeys = Object.keys(pendingGalleryFiles);
    const pendingAudioKeys = Object.keys(pendingAudioFiles);
    const pendingFeatKeys = Object.keys(pendingFeatFiles);
    const totalPending = pendingKeys.length + pendingGalleryKeys.length + pendingAudioKeys.length + pendingFeatKeys.length;

    if (totalPending === 0) {
      doSaveConfig(configToSave, targetSection);
    } else {
      let uploaded = 0;
      function checkAllDone() {
        uploaded++;
        if (uploaded === totalPending) {
          doSaveConfig(configToSave, targetSection);
        }
      }
      pendingKeys.forEach(key => {
        const file = pendingFiles[key];
        const inputId = key === 'fondo' ? 'media-fondo' : key === 'logo_claro' ? 'media-logo-claro' : 'media-logo-oscuro';
        const statusId = key === 'fondo' ? 'status-fondo' : key === 'logo_claro' ? 'status-logo-claro' : 'status-logo-oscuro';
        const antiguo = configToSave.multimedia[key];
        uploadFile(file, antiguo, key, (nuevaRuta) => {
          configToSave.multimedia[key] = nuevaRuta;
          document.getElementById(inputId).value = nuevaRuta;
          document.getElementById(statusId).textContent = '';
          delete pendingFiles[key];
          checkAllDone();
        }, true);
      });
      pendingGalleryKeys.forEach(idx => {
        const { file, oldPath } = pendingGalleryFiles[idx];
        const numIdx = parseInt(idx);
        uploadFile(file, oldPath, `foto_${numIdx}`, (nuevaRuta) => {
          configToSave.multimedia.fotos[numIdx].url = nuevaRuta;
          document.getElementById(`foto-input-${numIdx}`).value = nuevaRuta;
          const previewImg = document.getElementById(`preview-foto-${numIdx}`);
          if (previewImg) previewImg.src = '../' + nuevaRuta.replace(/^\//, '') + '?v=' + Date.now();
          document.getElementById(`foto-status-${numIdx}`).textContent = '';
          delete pendingGalleryFiles[idx];
          checkAllDone();
        }, true);
      });
      pendingAudioKeys.forEach(key => {
        const { file, oldPath } = pendingAudioFiles[key];
        const inputId = key === 'audio_clic' ? 'media-audio-clic' : 'media-audio-musica';
        const statusId = key === 'audio_clic' ? 'status-audio-clic' : 'status-audio-musica';
        const playerId = key === 'audio_clic' ? 'player-audio-clic' : 'player-audio-musica';
        uploadFile(file, oldPath, key, (nuevaRuta) => {
          configToSave.multimedia[key] = nuevaRuta;
          document.getElementById(inputId).value = nuevaRuta;
          document.getElementById(statusId).textContent = '';
          const player = document.getElementById(playerId);
          if (player) player.src = '../' + nuevaRuta.replace(/^\//, '') + '?v=' + Date.now();
          delete pendingAudioFiles[key];
          checkAllDone();
        }, true);
      });
      pendingFeatKeys.forEach(idx => {
        const file = pendingFeatFiles[idx];
        const numIdx = parseInt(idx);
        const antiguo = configToSave.caracteristicas[numIdx].imagen;
        uploadFile(file, antiguo, `feat_${numIdx}`, (nuevaRuta) => {
          configToSave.caracteristicas[numIdx].imagen = nuevaRuta;
          document.getElementById(`feat-${numIdx}-imagen`).value = nuevaRuta;
          updateFeatPreview(numIdx, nuevaRuta);
          document.getElementById(`status-feat-${numIdx}`).textContent = '';
          delete pendingFeatFiles[idx];
          checkAllDone();
        }, true);
      });
    }
  }

  function doSaveConfig(configToSave, targetSection) {
    fetch("../api/guardar_config.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configToSave)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          currentConfig = configToSave;
          if (targetSection && sectionNames[targetSection]) {
            setSectionDirty(targetSection, false);
            showToast(`¡Configuración de ${sectionNames[targetSection]} guardada con éxito!`);
          } else {
            resetAllSectionStates();
            showToast("¡Toda la configuración guardada correctamente!");
          }
          populateForm(configToSave, false);
        } else {
          showToast(data.error || "Error al guardar cambios", true);
        }
      })
      .catch(() => showToast("Error de conexión con la API", true));
  }

  function cancelSection(sec) {
    if (!currentConfig || !sectionNames[sec]) return;

    if (sec === 'general') {
      const genTitulo = currentConfig.general?.titulo || "";
      const genSubtitulo = currentConfig.general?.subtitulo || "";
      document.getElementById("gen-titulo").value = genTitulo;
      document.getElementById("gen-subtitulo").value = genSubtitulo;
      document.getElementById("gen-boton-descarga").value = currentConfig.general?.boton_descarga_texto || "";
      document.getElementById("gen-subtexto-descarga").value = currentConfig.general?.subtexto_descarga || "";
      document.getElementById("summary-gen-titulo").textContent = genTitulo || "--";
      document.getElementById("summary-gen-subtitulo").textContent = genSubtitulo || "--";
    } else if (sec === 'caracteristicas') {
      Object.keys(pendingFeatFiles).forEach(k => delete pendingFeatFiles[k]);
      if (currentConfig.caracteristicas) {
        currentConfig.caracteristicas.forEach((feat, idx) => {
          const t = document.getElementById(`feat-${idx}-titulo`);
          const d = document.getElementById(`feat-${idx}-desc`);
          const imgInp = document.getElementById(`feat-${idx}-imagen`);
          const s = document.getElementById(`feat-${idx}-summary`);
          const fileEl = document.getElementById(`file-feat-${idx}`);
          if (t) t.value = feat.titulo || "";
          if (d) d.value = feat.descripcion || "";
          if (imgInp) imgInp.value = feat.imagen || "";
          if (fileEl) fileEl.value = '';
          if (s) s.textContent = feat.titulo ? `${feat.titulo} — ${feat.descripcion?.substring(0, 45)}...` : "Haz clic en Editar para ingresar datos";
          updateFeatPreview(idx, feat.imagen || "");
          const stEl = document.getElementById(`status-feat-${idx}`);
          if (stEl) stEl.textContent = '';
        });
      }
    } else if (sec === 'novedades') {
      renderNovedades(JSON.parse(JSON.stringify(currentConfig.novedades || [])));
    } else if (sec === 'redes') {
      const getCleanUrl = (url) => (url && url !== 'javascript:void(0)' && url !== '#') ? url : '';
      document.getElementById("red-enlace-descarga").value = getCleanUrl(currentConfig.general?.enlace_descarga);
      let redesArray = currentConfig.redes;
      if (!Array.isArray(redesArray)) {
        redesArray = [];
        const legacyMap = { twitter: 'Twitter / X', discord: 'Discord', steam: 'Steam', itchio: 'itch.io' };
        Object.entries(legacyMap).forEach(([key, label]) => {
          const u = getCleanUrl(currentConfig.redes?.[key]);
          if (u) redesArray.push({ nombre: label, url: u });
        });
      }
      renderRedes(redesArray);
    } else if (sec === 'multimedia') {
      IMAGE_KEYS.forEach(key => { delete pendingFiles[key]; });
      document.getElementById("media-fondo").value = currentConfig.multimedia?.fondo || "";
      document.getElementById("media-logo-claro").value = currentConfig.multimedia?.logo_claro || "";
      document.getElementById("media-logo-oscuro").value = currentConfig.multimedia?.logo_oscuro || "";
      ['status-fondo', 'status-logo-claro', 'status-logo-oscuro'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
      });
      updateImagePreviews(currentConfig);
    } else if (sec === 'galeria') {
      Object.keys(pendingGalleryFiles).forEach(k => delete pendingGalleryFiles[k]);
      renderFotos(currentConfig.multimedia?.fotos || []);
    } else if (sec === 'audios') {
      Object.keys(pendingAudioFiles).forEach(k => delete pendingAudioFiles[k]);
      document.getElementById("media-audio-clic").value = currentConfig.multimedia?.audio_clic || "";
      document.getElementById("media-audio-musica").value = currentConfig.multimedia?.audio_musica || "";
      updateAudioPlayers(currentConfig.multimedia);
    }

    setSectionDirty(sec, false);
    showToast(`Cambios de ${sectionNames[sec]} cancelados`);
  }

  document.querySelectorAll(".btn-save-section").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const sec = btn.getAttribute("data-section");
      saveConfig(sec);
    });
  });

  document.querySelectorAll(".btn-cancel-section").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const sec = btn.getAttribute("data-section");
      cancelSection(sec);
    });
  });

  configForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveConfig(null);
  });

  let ipPaginaActual = 1;
  let ipFiltroActual = '';

  function loadIPTable() {
    const filtro = ipFiltroActual ? `&filtro=${ipFiltroActual}` : '';
    fetch(`../api/lista_ips.php?pagina=${ipPaginaActual}&por_pagina=50${filtro}`)
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById("tabla-ips-body");
        const totalLabel = document.getElementById("ip-total-label");
        const pageInfo = document.getElementById("ip-page-info");
        const prevBtn = document.getElementById("ip-prev-page");
        const nextBtn = document.getElementById("ip-next-page");

        totalLabel.textContent = `${data.total_registros} registros`;
        pageInfo.textContent = `Página ${data.pagina_actual} de ${data.total_paginas}`;
        prevBtn.disabled = data.pagina_actual <= 1;
        nextBtn.disabled = data.pagina_actual >= data.total_paginas;

        if (data.registros.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" class="px-5 py-8 text-center text-xs text-zinc-500">No hay registros de IPs todavía</td></tr>';
          return;
        }

        tbody.innerHTML = data.registros.map(reg => {
          const tipoClass = reg.tipo === 'visita' 
            ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20' 
            : 'text-blue-400 bg-blue-950/40 border-blue-500/20';
          const tipoLabel = reg.tipo === 'visita' ? 'Visita' : 'Descarga';
          return `
            <tr class="hover:bg-white/[0.02] transition-colors">
              <td class="px-5 py-3 text-xs text-zinc-500 font-mono">${reg.id}</td>
              <td class="px-5 py-3 text-xs text-white font-mono">${reg.direccion_ip}</td>
              <td class="px-5 py-3"><span class="text-[11px] px-2 py-0.5 rounded border font-medium ${tipoClass}">${tipoLabel}</span></td>
              <td class="px-5 py-3 text-xs text-zinc-400 font-mono">${reg.fecha_registro}</td>
            </tr>
          `;
        }).join('');
      })
      .catch(() => {
        document.getElementById("tabla-ips-body").innerHTML = '<tr><td colspan="4" class="px-5 py-8 text-center text-xs text-red-400">Error al cargar registros</td></tr>';
        showToast("Error al cargar el registro de IPs", true);
      });
  }

  document.getElementById("filtro-tipo-ip").addEventListener("change", (e) => {
    ipFiltroActual = e.target.value;
    ipPaginaActual = 1;
    loadIPTable();
  });

  document.getElementById("ip-prev-page").addEventListener("click", () => {
    if (ipPaginaActual > 1) {
      ipPaginaActual--;
      loadIPTable();
    }
  });
  document.getElementById("ip-next-page").addEventListener("click", () => {
    ipPaginaActual++;
    loadIPTable();
  });

  document.getElementById("btn-exportar-pdf").addEventListener("click", () => {
    const btn = document.getElementById("btn-exportar-pdf");
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<svg class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Generando...';

    if (typeof window.jspdf === 'undefined') {
      showToast("La librería PDF no está disponible. Verifica tu conexión a internet.", true);
      btn.disabled = false;
      btn.innerHTML = originalHTML;
      return;
    }

    fetch(`../api/exportar_ips.php?filtro=${ipFiltroActual}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          showToast('Error: ' + data.error, true);
          return;
        }
        if (data.registros.length === 0) {
          showToast('No hay registros para exportar.', true);
          return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();

        doc.setFillColor(18, 18, 24);
        doc.rect(0, 0, pageW, pageH, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Registro de Direcciones IP', 14, 18);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(160, 160, 170);
        doc.text('War of Boss', 14, 25);

        const now = new Date();
        const fechaStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        doc.setFontSize(9);
        doc.text(`Exportado: ${fechaStr}`, pageW - 14, 18, { align: 'right' });

        const filtroLabels = { todos: 'Todos los tipos', visita: 'Solo Visitas', descarga: 'Solo Descargas' };
        doc.text(`Filtro: ${filtroLabels[data.filtro] || 'Todos los tipos'}`, pageW - 14, 24, { align: 'right' });

        doc.text(`Total: ${data.total} registros`, pageW - 14, 30, { align: 'right' });

        doc.setDrawColor(60, 60, 70);
        doc.setLineWidth(0.3);
        doc.line(14, 34, pageW - 14, 34);

        const tableData = data.registros.map((reg, i) => [
          i + 1,
          reg.direccion_ip,
          reg.tipo === 'visita' ? 'Visita' : 'Descarga',
          reg.fecha_registro
        ]);

        doc.autoTable({
          startY: 38,
          margin: { left: 14, right: 14 },
          head: [['#', 'Dirección IP', 'Tipo', 'Fecha y Hora']],
          body: tableData,
          styles: {
            fillColor: [18, 18, 24],
            textColor: [220, 220, 230],
            lineColor: [40, 40, 50],
            lineWidth: 0.2,
            fontSize: 8,
            cellPadding: 3
          },
          headStyles: {
            fillColor: [30, 30, 40],
            textColor: [140, 140, 155],
            fontStyle: 'bold',
            fontSize: 8
          },
          alternateRowStyles: {
            fillColor: [22, 22, 30]
          },
          columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 50, fontStyle: 'bold' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 'auto' }
          },
          didParseCell: function (hookData) {
            if (hookData.section === 'body' && hookData.column.index === 2) {
              const val = hookData.cell.raw;
              if (val === 'Visita') {
                hookData.cell.styles.textColor = [52, 211, 153];
              } else {
                hookData.cell.styles.textColor = [96, 165, 250];
              }
            }
          },
          didDrawPage: function (hookData) {
            doc.setFontSize(7);
            doc.setTextColor(80, 80, 90);
            doc.text(
              `War of Boss — Registro de IPs — Página ${hookData.pageNumber}`,
              pageW / 2, pageH - 6, { align: 'center' }
            );
          }
        });

        const fechaArchivo = now.toISOString().slice(0, 10);
        doc.save(`registro_ips_${fechaArchivo}.pdf`);
      })
      .catch(err => {
        alert('Error al exportar: ' + err.message);
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      });
  });

  checkAuthStatus();
});
