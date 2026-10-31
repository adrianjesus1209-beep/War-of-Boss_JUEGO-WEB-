/**
 * WAR OF BOSS — Figura Particle Logo Effect
 * Renders an interactive logo with particle scatter/assembly, mouse repulsion, and theme adaptation.
 */
(function () {
  'use strict';

  const FIG_EASE = {
    easeOut: function (t) { return 1 - (1 - t) * (1 - t); },
    easeInOut: function (t) { return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t); },
    easeIn: function (t) { return t * t; },
    linear: function (t) { return t; },
  };

  var figuraCanvas, figuraCtx;
  var figuraContainer;
  var figuraParticles = [];
  var figuraDims = { W: 0, H: 0 };
  var figuraMouse = { x: -99999, y: -99999, active: false };
  var figuraPrevMouse = { x: -99999, y: -99999 };
  var figuraMouseSpeed = 0;
  var figuraSmoothMouse = { x: -99999, y: -99999 };
  var figuraAnimState = "active";
  var figuraAnimStartTime = 0;
  var figuraAnimTimer = null;
  var figuraRoamFadeStart = 0;
  var figuraRoamFadeFrom = 1;
  var figuraRoamFadeTo = 1;
  var figuraAnimFrame = null;
  var figuraVisible = false;
  var figuraInitialized = false;

  var FIGURE_CONFIG = {
    particleCount: 50,
    particleSize: 5,
    particleShape: "circle",
    hoverEnabled: true,
    hoverType: "roam",
    roamWidth: 0,
    roamHeight: 0,
    roamShape: "rectangle",
    roamOpacity: 0.5,
    hideType: "scatter",
    transitionDuration: 0.8,
    transitionEase: "easeInOut",
    repulsionEnabled: true,
    repulsionMode: "outside",
    repulsionForce: 10,
    repulsionRadius: 50,
  };

  function figuraContainRect(iW, iH, cW, cH) {
    var a = iW / iH, b = cW / cH;
    return a > b
      ? { x: 0, y: Math.round((cH - cW / a) / 2), w: cW, h: Math.round(cW / a) }
      : { x: Math.round((cW - cH * a) / 2), y: 0, w: Math.round(cH * a), h: cH };
  }

  function figuraShuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
  }

  function figuraRandomInShape(shape, bx, by, bw, bh) {
    var cx = bx + bw / 2, cy = by + bh / 2;
    if (shape === "circle") {
      var r = bw / 2, ang = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * r;
      return [cx + Math.cos(ang) * d, cy + Math.sin(ang) * d];
    }
    if (shape === "oval") {
      var rx = bw / 2, ry = bh / 2, ang2 = Math.random() * Math.PI * 2, d2 = Math.sqrt(Math.random());
      return [cx + d2 * rx * Math.cos(ang2), cy + d2 * ry * Math.sin(ang2)];
    }
    return [bx + Math.random() * bw, by + Math.random() * bh];
  }

  function figuraGetTransitionParams() {
    return {
      easeFn: FIG_EASE[FIGURE_CONFIG.transitionEase] || FIG_EASE.easeOut,
      durMs: (FIGURE_CONFIG.transitionDuration || 0.8) * 1000,
    };
  }

  function figuraMkParticle(src, x, y, idleX, idleY) {
    return {
      x: x, y: y, vx: 0, vy: 0, startX: x, startY: y,
      repX: 0, repY: 0,
      homeX: src.homeX, homeY: src.homeY,
      idleX: idleX, idleY: idleY,
      r: src.r, g: src.g, b: src.b, a: src.a,
      inZone: false,
      roamTargetX: 0, roamTargetY: 0,
      repTargetX: 0, repTargetY: 0,
    };
  }

  function figuraStartAnim(newState) {
    var W = figuraDims.W, H = figuraDims.H;
    var ht = FIGURE_CONFIG.hoverType, rw = FIGURE_CONFIG.roamWidth, rh = FIGURE_CONFIG.roamHeight;
    var rs = FIGURE_CONFIG.roamShape, rOp = FIGURE_CONFIG.roamOpacity;
    var durMs = figuraGetTransitionParams().durMs;
    var bw = Math.max(80, rw || W), bh = Math.max(80, rh || H);
    var bx = (W - bw) / 2, by = (H - bh) / 2;

    figuraParticles.forEach(function (p) {
      p.startX = p.x;
      p.startY = p.y;
      if (newState === "scattering" && ht === "roam") {
        var t = figuraRandomInShape(rs, bx, by, bw, bh);
        p.roamTargetX = t[0];
        p.roamTargetY = t[1];
        p.idleX = t[0];
        p.idleY = t[1];
      }
    });

    var _rOp = rOp != null ? rOp : 0.5;
    if (ht === "roam") {
      if (newState === "scattering") {
        figuraRoamFadeStart = Date.now();
        figuraRoamFadeFrom = 1;
        figuraRoamFadeTo = _rOp;
      } else if (newState === "assembling") {
        figuraRoamFadeStart = Date.now();
        figuraRoamFadeFrom = _rOp;
        figuraRoamFadeTo = 1;
      }
    }

    if (newState === "scattering" && ht === "roam") {
      clearTimeout(figuraAnimTimer);
      figuraAnimState = "idle";
      return;
    }

    figuraAnimStartTime = Date.now();
    figuraAnimState = newState;
    clearTimeout(figuraAnimTimer);
    var next = newState === "assembling" ? "active" : "idle";
    figuraAnimTimer = setTimeout(function () {
      if (figuraAnimState === newState) figuraAnimState = next;
    }, durMs);
  }

  function figuraGetIsDark() {
    return document.documentElement.classList.contains("dark");
  }

  function figuraInitParticles() {
    var W = figuraDims.W, H = figuraDims.H;
    if (!W || !H || !figuraCanvas) return;

    var isDark = figuraGetIsDark();
    var imageUrl = isDark ? "figura/oscuro/logo-oscuro.png" : "figura/claro/logo-claro.png";

    var isMobile = W < 768;
    FIGURE_CONFIG.particleSize = isMobile ? 3 : 5;
    FIGURE_CONFIG.repulsionRadius = isMobile ? 35 : 50;
    FIGURE_CONFIG.repulsionForce = isMobile ? 6 : 10;

    clearTimeout(figuraAnimTimer);
    var gap = Math.max(2, Math.round(150 / Math.max(1, FIGURE_CONFIG.particleCount)));
    var dpr = window.devicePixelRatio || 1;
    figuraCanvas.width = Math.round(W * dpr);
    figuraCanvas.height = Math.round(H * dpr);
    figuraMouse = { x: -99999, y: -99999, active: false };
    figuraParticles = [];

    var tryLoad = function (cors) {
      var img = new Image();
      if (cors) img.crossOrigin = "anonymous";
      img.onerror = function () { if (cors) tryLoad(false); };
      img.onload = function () {
        var base = figuraContainRect(img.naturalWidth || img.width, img.naturalHeight || img.height, W, H);
        var sc = isMobile ? 7 : 5;
        var f = Math.max(1, Math.min(20, sc)) / 10;
        var w = base.w * f, h = base.h * f;
        var rect = { x: (W - w) / 2, y: (H - h) / 2, w: w, h: h };

        var off = document.createElement("canvas");
        off.width = W;
        off.height = H;
        var oc = off.getContext("2d");
        oc.drawImage(img, rect.x, rect.y, rect.w, rect.h);

        var px;
        try { px = oc.getImageData(0, 0, W, H).data; } catch (_) { return; }

        var src = [];
        var colorMul = isDark ? 1 : 0.3;
        for (var y = 0; y < H; y += gap) {
          for (var x = 0; x < W; x += gap) {
            var i = (y * W + x) * 4;
            if (px[i + 3] >= 20) {
              src.push({
                homeX: x, homeY: y,
                r: Math.round(px[i] * colorMul),
                g: Math.round(px[i + 1] * colorMul),
                b: Math.round(px[i + 2] * colorMul),
                a: px[i + 3],
              });
            }
          }
        }
        figuraShuffle(src);

        var ht = FIGURE_CONFIG.hoverType;
        var rw = FIGURE_CONFIG.roamWidth, rh = FIGURE_CONFIG.roamHeight;
        var rs = FIGURE_CONFIG.roamShape;
        var bw = Math.max(80, rw || W), bh = Math.max(80, rh || H);
        var bx = (W - bw) / 2, by = (H - bh) / 2;

        if (!FIGURE_CONFIG.hoverEnabled) {
          figuraAnimState = "active";
          figuraParticles = src.map(function (p) { return figuraMkParticle(p, p.homeX, p.homeY, p.homeX, p.homeY); });
        } else if (ht === "roam") {
          figuraParticles = src.map(function (p) {
            var rnd = figuraRandomInShape(rs, bx, by, bw, bh);
            var pt = figuraMkParticle(p, rnd[0], rnd[1], rnd[0], rnd[1]);
            var tgt = figuraRandomInShape(rs, bx, by, bw, bh);
            pt.roamTargetX = tgt[0];
            pt.roamTargetY = tgt[1];
            pt.vx = (Math.random() - 0.5) * 1.2;
            pt.vy = (Math.random() - 0.5) * 1.2;
            return pt;
          });
          figuraAnimState = "idle";
        } else {
          figuraParticles = src.map(function (p) {
            var maxD = Math.max(W, H);
            var d = 0.5 * maxD;
            var angle = Math.random() * Math.PI * 2;
            var ox = p.homeX + Math.cos(angle) * d;
            var oy = p.homeY + Math.sin(angle) * d;
            return figuraMkParticle(p, ox, oy, ox, oy);
          });
          figuraAnimState = "idle";
        }
      };
      img.src = imageUrl;
    };
    tryLoad(true);
  }

  var figuraFrameCount = 0;
  function figuraDraw() {
    if (!figuraVisible) {
      figuraAnimFrame = null;
      return;
    }
    figuraFrameCount++;
    if (figuraAnimState === "idle" && figuraFrameCount % 2 === 0) {
      figuraAnimFrame = requestAnimationFrame(figuraDraw);
      return;
    }
    figuraAnimFrame = requestAnimationFrame(figuraDraw);
    var PW = figuraCanvas.width, PH = figuraCanvas.height;
    if (!PW || !PH) return;
    var dpr = window.devicePixelRatio || 1;
    if (!figuraParticles.length) return;

    if (!figuraCtx._idata || PW !== figuraCtx._bW || PH !== figuraCtx._bH) {
      figuraCtx._idata = figuraCtx.createImageData(PW, PH);
      figuraCtx._bW = PW;
      figuraCtx._bH = PH;
    }
    var idata = figuraCtx._idata;
    idata.data.fill(0);
    var buf = idata.data;

    var ht = FIGURE_CONFIG.hoverType;
    var rw = FIGURE_CONFIG.roamWidth, rh = FIGURE_CONFIG.roamHeight;
    var rOp = FIGURE_CONFIG.roamOpacity, rs = FIGURE_CONFIG.roamShape;
    var repOn = FIGURE_CONFIG.repulsionEnabled;
    var rF = FIGURE_CONFIG.repulsionForce, rR = FIGURE_CONFIG.repulsionRadius;
    var rMode = FIGURE_CONFIG.repulsionMode;
    var pSz = FIGURE_CONFIG.particleSize;
    var pShape = FIGURE_CONFIG.particleShape;

    var state = figuraAnimState;
    var rawMx = figuraMouse.x, rawMy = figuraMouse.y, active = figuraMouse.active;
    var hitSpeed = figuraMouseSpeed;
    figuraMouseSpeed *= 0.88;

    var sm = figuraSmoothMouse;
    if (active) {
      var lerpFactor = Math.max(0.08, 0.3 - hitSpeed * 0.006);
      if (sm.x < -9000) { sm.x = rawMx; sm.y = rawMy; }
      else { sm.x += (rawMx - sm.x) * lerpFactor; sm.y += (rawMy - sm.y) * lerpFactor; }
    } else { sm.x = -99999; sm.y = -99999; }

    var mx = sm.x, my = sm.y;
    var ps = Math.max(1, Math.ceil((pSz / 4) * dpr));
    var tp = figuraGetTransitionParams();
    var easeFn = tp.easeFn, durMs = tp.durMs;
    var elapsed = Date.now() - figuraAnimStartTime;
    var animT = easeFn(Math.min(1, elapsed / durMs));
    var DW = figuraDims.W, DH = figuraDims.H;
    var bw = Math.max(80, rw || DW), bh = Math.max(80, rh || DH);
    var bx = (DW - bw) / 2, by = (DH - bh) / 2;

    var half = ps / 2;
    var drawParticle = function (cx, cy, r, g, b, a, isCircle) {
      var px0 = Math.round(cx) - (ps >> 1);
      var py0 = Math.round(cy) - (ps >> 1);
      for (var dy = 0; dy < ps; dy++) {
        var iy = py0 + dy;
        if (iy < 0 || iy >= PH) continue;
        var row = iy * PW;
        for (var dx = 0; dx < ps; dx++) {
          if (isCircle) {
            var ddx = dx - half + 0.5, ddy = dy - half + 0.5;
            if (ddx * ddx + ddy * ddy > half * half) continue;
          }
          var ix = px0 + dx;
          if (ix < 0 || ix >= PW) continue;
          var i = (row + ix) * 4;
          buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
        }
      }
    };

    var repCutoff = Math.max(1, rR);
    var repCutoffSq = repCutoff * repCutoff;
    var pIdx = 0;
    var fadeElapsed = ht === "roam" && figuraRoamFadeStart > 0 ? Date.now() - figuraRoamFadeStart : 0;

    for (var pi = 0; pi < figuraParticles.length; pi++) {
      var p = figuraParticles[pi];
      var isCircle = pShape === "circle" || (pShape === "both" && pIdx % 2 === 1);
      pIdx++;

      var baseX = p.x, baseY = p.y;
      if (state === "assembling") {
        baseX = p.startX + (p.homeX - p.startX) * animT;
        baseY = p.startY + (p.homeY - p.startY) * animT;
      } else if (state === "scattering") {
        baseX = p.startX + (p.idleX - p.startX) * animT;
        baseY = p.startY + (p.idleY - p.startY) * animT;
      } else if (state === "active") {
        baseX = p.homeX;
        baseY = p.homeY;
      } else if (state === "idle") {
        if (ht === "roam") {
          var dtx = p.roamTargetX - p.x, dty = p.roamTargetY - p.y;
          if (dtx * dtx + dty * dty < 9) {
            var tgt = figuraRandomInShape(rs, bx, by, bw, bh);
            p.roamTargetX = tgt[0];
            p.roamTargetY = tgt[1];
          }
          p.vx = (p.vx || 0) * 0.98 + (p.roamTargetX - p.x) * 0.003;
          p.vy = (p.vy || 0) * 0.98 + (p.roamTargetY - p.y) * 0.003;
          var sp2_sq = p.vx * p.vx + p.vy * p.vy;
          if (sp2_sq > 2.25) { var sp2 = Math.sqrt(sp2_sq); p.vx = (p.vx / sp2) * 1.5; p.vy = (p.vy / sp2) * 1.5; }
          p.x += p.vx;
          p.y += p.vy;
          baseX = p.x;
          baseY = p.y;
        } else {
          baseX = p.idleX;
          baseY = p.idleY;
        }
      }

      if (repOn) {
        if (rMode === "random") {
          var dxr = baseX - rawMx, dyr = baseY - rawMy;
          if (dxr * dxr + dyr * dyr < repCutoffSq) {
            if (!p.inZone) {
              var angR = Math.random() * Math.PI * 2;
              var dR = Math.random() * rF * 5;
              p.repTargetX = Math.cos(angR) * dR;
              p.repTargetY = Math.sin(angR) * dR;
              p.inZone = true;
            }
            p.repX += (p.repTargetX - p.repX) * 0.15;
            p.repY += (p.repTargetY - p.repY) * 0.15;
          } else { p.inZone = false; }
        } else {
          if (active) {
            var dx = baseX - mx, dy = baseY - my;
            var distSq = dx * dx + dy * dy;
            if (distSq > 0 && distSq < repCutoffSq) {
              var dist = Math.sqrt(distSq);
              var nx = dx / dist, ny = dy / dist;
              var falloff = 1 - dist / repCutoff;
              var push = falloff * hitSpeed * rF * 0.05;
              p.repX += nx * push;
              p.repY += ny * push;
              var targetRepX = nx * (repCutoff - dist);
              var targetRepY = ny * (repCutoff - dist);
              p.repX += (targetRepX - p.repX) * 0.06;
              p.repY += (targetRepY - p.repY) * 0.06;
              p.inZone = true;
            } else { p.inZone = false; }
          } else { p.inZone = false; }
        }
      } else { p.inZone = false; }

      if (!p.inZone) { p.repX *= 0.97; p.repY *= 0.97; }
      p.x = baseX + p.repX;
      p.y = baseY + p.repY;

      var dr, dg, db, da;
      if (state === "active") {
        dr = p.r; dg = p.g; db = p.b; da = p.a;
      } else if (ht === "roam" && FIGURE_CONFIG.hoverEnabled) {
        var alphaMul;
        if (figuraRoamFadeStart === 0) { alphaMul = rOp != null ? rOp : 0.5; }
        else {
          var feT = Math.min(1, Math.max(0, fadeElapsed / durMs));
          var feEased = easeFn(feT);
          alphaMul = figuraRoamFadeFrom + (figuraRoamFadeTo - figuraRoamFadeFrom) * feEased;
        }
        dr = p.r; dg = p.g; db = p.b;
        da = Math.round(p.a * alphaMul);
      } else if (ht === "hide" && FIGURE_CONFIG.hoverEnabled) {
        var alphaMul2;
        if (state === "idle") alphaMul2 = 0;
        else if (state === "assembling") alphaMul2 = animT;
        else if (state === "scattering") alphaMul2 = 1 - animT;
        else alphaMul2 = 1;
        dr = p.r; dg = p.g; db = p.b;
        da = Math.round(p.a * alphaMul2);
      } else {
        dr = p.r; dg = p.g; db = p.b; da = p.a;
      }
      if (da < 1) continue;

      drawParticle(p.x * dpr, p.y * dpr, dr, dg, db, da, isCircle);
    }
    figuraCtx.putImageData(idata, 0, 0);
  }

  function figuraOnMouseMove(e) {
    if (!figuraCanvas) return;
    var rect = figuraCanvas.getBoundingClientRect();
    var W = figuraDims.W, H = figuraDims.H;
    var scaleX = rect.width > 0 ? W / rect.width : 1;
    var scaleY = rect.height > 0 ? H / rect.height : 1;
    var mx = (e.clientX - rect.left) * scaleX;
    var my = (e.clientY - rect.top) * scaleY;

    if (figuraPrevMouse.x > -9999) {
      var ddx = mx - figuraPrevMouse.x, ddy = my - figuraPrevMouse.y;
      figuraMouseSpeed = Math.sqrt(ddx * ddx + ddy * ddy);
    }
    figuraPrevMouse = { x: mx, y: my };
    figuraMouse = { x: mx, y: my, active: true };

    if (FIGURE_CONFIG.hoverEnabled) {
      var s = figuraAnimState;
      if (s === "idle" || s === "scattering") figuraStartAnim("assembling");
    }
  }

  function figuraOnMouseLeave() {
    figuraMouse = { x: -99999, y: -99999, active: false };
    if (FIGURE_CONFIG.hoverEnabled) {
      var s = figuraAnimState;
      if (s === "assembling" || s === "active") figuraStartAnim("scattering");
    }
  }

  function figuraBuild() {
    figuraContainer = document.getElementById("particle-container");
    if (!figuraContainer) return;

    if (!figuraCanvas) {
      figuraCanvas = document.createElement("canvas");
      figuraContainer.appendChild(figuraCanvas);
      figuraCtx = figuraCanvas.getContext("2d");
      figuraCanvas.addEventListener("mousemove", figuraOnMouseMove);
      figuraCanvas.addEventListener("mouseleave", figuraOnMouseLeave);

      if ('ontouchstart' in window) {
        var figuraTouchStartX = 0;
        var figuraTouchStartY = 0;
        var figuraTouchIsScroll = false;

        figuraCanvas.addEventListener("touchstart", function (e) {
          figuraTouchStartX = e.touches[0].clientX;
          figuraTouchStartY = e.touches[0].clientY;
          figuraTouchIsScroll = false;
          figuraOnMouseMove(e.touches[0]);
        }, { passive: true });

        figuraCanvas.addEventListener("touchmove", function (e) {
          var dx = Math.abs(e.touches[0].clientX - figuraTouchStartX);
          var dy = Math.abs(e.touches[0].clientY - figuraTouchStartY);
          if (dy > 10 && dy > dx) {
            if (!figuraTouchIsScroll) {
              figuraTouchIsScroll = true;
              figuraOnMouseLeave();
            }
            return;
          }
          e.preventDefault();
          figuraOnMouseMove(e.touches[0]);
        }, { passive: false });

        figuraCanvas.addEventListener("touchend", function () {
          figuraOnMouseLeave();
        });
      }
    }

    var ro = new ResizeObserver(function (entries) {
      var r = entries[0] && entries[0].contentRect;
      if (!r) return;
      var W = Math.round(r.width), H = Math.round(r.height);
      if (!W || !H) return;
      figuraDims = { W: W, H: H };
      figuraInitParticles();
    });
    ro.observe(figuraContainer);

    figuraDraw();
    figuraInitialized = true;
  }

  var figuraSectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        figuraVisible = true;
        if (!figuraInitialized) figuraBuild();
        else if (!figuraAnimFrame) figuraDraw();
      } else {
        figuraVisible = false;
      }
    });
  }, { threshold: 0.1 });

  var figuraSection = document.getElementById("figura");
  if (figuraSection) figuraSectionObserver.observe(figuraSection);

  var figuraThemeObserver = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === "class") {
        if (figuraInitialized) figuraInitParticles();
        break;
      }
    }
  });
  figuraThemeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

})();
