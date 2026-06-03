/*!
 * ember-forge — Canvas2D ember particle shader for Roxabi Factory.
 * Ported from ~/.roxabi/forge/lyra/landing/lyra-landing-ember-forge-v0.1.0.js
 * Adapted to the roxabi-site shader convention:
 *   window.EmberForge = { init(canvas) } — auto-inits #hero-bg in dark mode.
 *   app.js calls EmberForge.init(heroEl) on dark-mode activation.
 *   No-WebGL fallback: when OffscreenCanvas or 2D context is unavailable,
 *   applies the crucible static-gradient fallback (CSS class on <body>).
 *
 * The diamond silhouette from the original is preserved — particles orbit/rise
 * around the forge mark that sits in the right column of the 2-col hero.
 * Canvas is positioned absolute inset-0 behind all hero content.
 */
(function () {
  'use strict';

  // ── config ────────────────────────────────────────────────
  var CFG = {
    PARTICLE_COUNT_BASE: 420,
    PARTICLE_MIN: 240,
    PARTICLE_MAX: 600,
    PARTICLE_FADE_RATE: 0.935,

    HEAT_HALF_RES: 2,
    HEAT_DIFFUSE: 0.92,
    HEAT_PARTICLE_STRENGTH: 0.15,

    BUOYANCY: -0.016,
    TURBULENCE: 0.010,
    DRAG: 0.986,

    DIAMOND_HALF_W: 0.09,
    DIAMOND_HALF_H: 0.14,
    DIAMOND_REPEL_RADIUS: 1.2,
    DIAMOND_REPEL_FORCE: 0.28,

    BLAST_COUNT: 45,
    BLAST_SPEED: 4.0,
  };

  // ── init contract ─────────────────────────────────────────
  var started = false;

  function init(canvas) {
    if (!canvas || started) return;

    // No-WebGL / no-2D fallback: apply static gradient via CSS
    var ctx2d = null;
    try { ctx2d = canvas.getContext('2d'); } catch (e) {}
    if (!ctx2d) {
      document.body.classList.add('no-webgl');
      return;
    }

    // OffscreenCanvas required for trail buffer — degrade gracefully if missing
    if (typeof OffscreenCanvas === 'undefined') {
      document.body.classList.add('no-webgl');
      return;
    }

    started = true;
    run(canvas, ctx2d);
  }

  // ── main shader ───────────────────────────────────────────
  function run(canvas, ctx) {
    var W = 0, H = 0, DPR = 1;
    var frameId = null;
    var lastTime = 0;
    var diamond = { cx: 0, cy: 0, hw: 0, hh: 0 };

    // Buffers
    var trailCanvas, trailCtx;
    var heatCanvas, heatCtx, heatData, heatImgData;
    var heatW = 0, heatH = 0;

    function initBuffers() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth  || window.innerWidth;
      H = canvas.offsetHeight || window.innerHeight;

      canvas.width  = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(DPR, DPR);

      trailCanvas = new OffscreenCanvas(Math.round(W * DPR), Math.round(H * DPR));
      trailCtx    = trailCanvas.getContext('2d');

      heatW = Math.round(W / CFG.HEAT_HALF_RES);
      heatH = Math.round(H / CFG.HEAT_HALF_RES);
      heatCanvas  = new OffscreenCanvas(heatW, heatH);
      heatCtx     = heatCanvas.getContext('2d');
      heatData    = new Float32Array(heatW * heatH);
      heatImgData = heatCtx.createImageData(heatW, heatH);

      // Diamond centered on the right column (~75% of width) at 50% height
      diamond.cx = W * 0.72;
      diamond.cy = H * 0.50;
      diamond.hw = W * CFG.DIAMOND_HALF_W;
      diamond.hh = H * CFG.DIAMOND_HALF_H;
    }

    // ── particles ──────────────────────────────────────────
    var MAX_P = CFG.PARTICLE_MAX;
    var px    = new Float32Array(MAX_P);
    var py    = new Float32Array(MAX_P);
    var pvx   = new Float32Array(MAX_P);
    var pvy   = new Float32Array(MAX_P);
    var plife = new Float32Array(MAX_P);
    var pmaxl = new Float32Array(MAX_P);
    var psize = new Float32Array(MAX_P);
    var ptype = new Uint8Array(MAX_P);
    var particleCount = CFG.PARTICLE_COUNT_BASE;

    function resetParticle(i) {
      var spread = W * 0.65;
      px[i]   = diamond.cx + (Math.random() - 0.5) * spread;
      py[i]   = H + 5 + Math.random() * H * 0.12;
      pvx[i]  = (Math.random() - 0.5) * 0.55;
      pvy[i]  = -(0.35 + Math.random() * 1.1);
      pmaxl[i] = 120 + Math.random() * 200;
      plife[i] = pmaxl[i];
      psize[i] = 0.6 + Math.random() * 1.8;
      var r = Math.random();
      ptype[i] = r < 0.10 ? 2 : (r < 0.55 ? 0 : 1);
    }

    function initParticles() {
      particleCount = Math.min(CFG.PARTICLE_MAX,
                      Math.max(CFG.PARTICLE_MIN, Math.floor(W * H / 4500)));
      for (var i = 0; i < particleCount; i++) {
        resetParticle(i);
        py[i]    = Math.random() * H * 1.4 - H * 0.2;
        plife[i] = Math.random() * pmaxl[i];
      }
    }

    var _cn = { dx: 0, dy: 0 };
    function curlNoise(x, y, t) {
      var s = 0.003, ts = t * 0.0004;
      var v1 = Math.sin(x * s + ts) * Math.cos(y * s * 0.7 + ts * 0.8);
      var v2 = Math.cos(x * s * 0.8 - ts * 0.6) * Math.sin(y * s + ts * 1.1);
      _cn.dx = v1 - v2;
      _cn.dy = -(v1 + v2) * 0.5;
      return _cn;
    }

    function repelFromDiamond(i) {
      var dx = px[i] - diamond.cx;
      var dy = py[i] - diamond.cy;
      var nx = dx / diamond.hw;
      var ny = dy / diamond.hh;
      var dist = Math.abs(nx) + Math.abs(ny);
      if (dist < CFG.DIAMOND_REPEL_RADIUS) {
        var force = CFG.DIAMOND_REPEL_FORCE * (1 - dist / CFG.DIAMOND_REPEL_RADIUS);
        var len   = Math.sqrt(dx * dx + dy * dy) || 1;
        pvx[i] += (dx / len) * force;
        pvy[i] += (dy / len) * force;
      }
    }

    function updateParticles(t) {
      for (var i = 0; i < particleCount; i++) {
        plife[i] -= 1;
        if (plife[i] <= 0 || py[i] < -20) { resetParticle(i); continue; }
        var curl = curlNoise(px[i], py[i], t);
        pvx[i] += curl.dx * CFG.TURBULENCE;
        pvy[i] += curl.dy * CFG.TURBULENCE;
        pvy[i] += CFG.BUOYANCY;
        repelFromDiamond(i);
        pvx[i] *= CFG.DRAG; pvy[i] *= CFG.DRAG;
        px[i] += pvx[i]; py[i] += pvy[i];
      }
    }

    function drawParticles() {
      for (var i = 0; i < particleCount; i++) {
        var life01 = plife[i] / pmaxl[i];
        var alpha  = Math.min(1, life01 * 2.5) * 0.80;
        if (alpha < 0.01) continue;
        var r = psize[i] * life01 * 0.6 + psize[i] * 0.4;
        var col;
        switch (ptype[i]) {
          case 0:  col = 'rgba(232,93,4,'   + alpha + ')'; break;
          case 1:  col = 'rgba(249,115,22,' + alpha + ')'; break;
          default: col = 'rgba(250,250,250,' + (alpha * 0.82) + ')'; break;
        }
        trailCtx.beginPath();
        trailCtx.arc(px[i] * DPR, py[i] * DPR, r * DPR, 0, Math.PI * 2);
        trailCtx.fillStyle = col;
        trailCtx.fill();
      }
    }

    // ── heat field ─────────────────────────────────────────
    function seedHeat(lx, ly, strength, radius) {
      var hx = Math.round(lx / CFG.HEAT_HALF_RES);
      var hy = Math.round(ly / CFG.HEAT_HALF_RES);
      var hr = Math.round(radius / CFG.HEAT_HALF_RES);
      var x0 = Math.max(0, hx - hr), x1 = Math.min(heatW - 1, hx + hr);
      var y0 = Math.max(0, hy - hr), y1 = Math.min(heatH - 1, hy + hr);
      var r2 = hr * hr;
      for (var hy2 = y0; hy2 <= y1; hy2++) {
        for (var hx2 = x0; hx2 <= x1; hx2++) {
          var dd = (hx2 - hx) * (hx2 - hx) + (hy2 - hy) * (hy2 - hy);
          if (dd <= r2) {
            var idx = hy2 * heatW + hx2;
            heatData[idx] = Math.min(1, heatData[idx] + strength * (1 - dd / r2));
          }
        }
      }
    }

    function updateHeatField() {
      for (var i = 0; i < particleCount; i++) {
        if (plife[i] > 0 && py[i] > 0 && py[i] < H) {
          var hx = Math.round(px[i] / CFG.HEAT_HALF_RES);
          var hy = Math.round(py[i] / CFG.HEAT_HALF_RES);
          if (hx >= 0 && hx < heatW && hy >= 0 && hy < heatH) {
            var life01 = plife[i] / pmaxl[i];
            heatData[hy * heatW + hx] = Math.min(1, heatData[hy * heatW + hx] + CFG.HEAT_PARTICLE_STRENGTH * life01);
          }
        }
      }
      var n = heatW * heatH;
      for (var idx = 0; idx < n; idx++) heatData[idx] *= CFG.HEAT_DIFFUSE;
      var d = heatImgData.data;
      for (var idx2 = 0; idx2 < n; idx2++) {
        var v = heatData[idx2];
        if (v < 0.008) { d[idx2*4]=d[idx2*4+1]=d[idx2*4+2]=d[idx2*4+3]=0; continue; }
        var rr, gg, bb;
        if (v < 0.4) {
          var t1 = v / 0.4;
          rr = Math.round(232 * t1); gg = Math.round(93 * t1); bb = Math.round(4 * t1);
        } else if (v < 0.75) {
          var t2 = (v - 0.4) / 0.35;
          rr = Math.round(232 + (249-232)*t2); gg = Math.round(93 + (115-93)*t2); bb = Math.round(4 + (22-4)*t2);
        } else {
          var t3 = (v - 0.75) / 0.25;
          rr = Math.round(249 + (250-249)*t3); gg = Math.round(115 + (250-115)*t3); bb = Math.round(22 + (250-22)*t3);
        }
        d[idx2*4]=rr; d[idx2*4+1]=gg; d[idx2*4+2]=bb; d[idx2*4+3]=Math.round(v*155);
      }
      heatCtx.putImageData(heatImgData, 0, 0);
    }

    // The diamond geometry (diamond.*) still shapes the ember flow via
    // repelFromDiamond — particles part around the forge mark — but its rim
    // is no longer drawn: the visible orange diamond was removed by request.

    // ── click blast ────────────────────────────────────────
    function spawnBlast(lx, ly) {
      var spawned = 0;
      for (var i = 0; i < particleCount && spawned < CFG.BLAST_COUNT; i++) {
        if (plife[i] <= 0 || plife[i] < pmaxl[i] * 0.25) {
          var angle = Math.random() * Math.PI * 2;
          var speed = CFG.BLAST_SPEED * (0.4 + Math.random() * 0.6);
          px[i] = lx + (Math.random()-0.5)*20; py[i] = ly + (Math.random()-0.5)*20;
          pvx[i] = Math.cos(angle)*speed; pvy[i] = Math.sin(angle)*speed - 0.5;
          pmaxl[i] = 40 + Math.random()*60; plife[i] = pmaxl[i];
          psize[i] = 1.0 + Math.random()*2.5;
          var r = Math.random();
          ptype[i] = r < 0.15 ? 2 : (r < 0.55 ? 0 : 1);
          spawned++;
        }
      }
      seedHeat(lx, ly, 0.85, 100);
    }

    // ── interaction ────────────────────────────────────────
    function bindInteraction() {
      // No mouse-follow spotlight — only a discrete click/tap ember burst.
      window.addEventListener('click', function (e) { spawnBlast(e.clientX, e.clientY); });
      window.addEventListener('touchstart', function (e) {
        if (e.touches.length > 0) spawnBlast(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { if (frameId !== null) { cancelAnimationFrame(frameId); frameId = null; } }
        else { if (frameId === null) { lastTime = performance.now(); frameId = requestAnimationFrame(loop); } }
      });
      window.addEventListener('resize', function () {
        if (frameId !== null) cancelAnimationFrame(frameId);
        initBuffers(); initParticles();
        lastTime = performance.now(); frameId = requestAnimationFrame(loop);
      }, { passive: true });
    }

    // ── RAF loop ───────────────────────────────────────────
    function loop(timestamp) {
      frameId = requestAnimationFrame(loop);
      lastTime = timestamp;

      // Fade trail buffer
      trailCtx.save();
      trailCtx.globalCompositeOperation = 'destination-in';
      trailCtx.globalAlpha = CFG.PARTICLE_FADE_RATE;
      trailCtx.fillStyle = '#000';
      trailCtx.fillRect(0, 0, trailCanvas.width, trailCanvas.height);
      trailCtx.restore();

      drawParticles();
      updateParticles(timestamp);
      updateHeatField();

      // Composite
      ctx.clearRect(0, 0, W, H);

      // 1. Obsidian base
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, W, H);

      // 2. Heat (screen blend)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.68;
      ctx.drawImage(heatCanvas, 0, 0, W, H);
      ctx.restore();

      // 3. Trail buffer (lighter)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.84;
      ctx.drawImage(trailCanvas, 0, 0, W, H);
      ctx.restore();

      // 4. Vignette
      var vig = ctx.createRadialGradient(W*0.5, H*0.5, H*0.15, W*0.5, H*0.5, Math.max(W,H)*0.78);
      vig.addColorStop(0, 'rgba(10,10,15,0)');
      vig.addColorStop(1, 'rgba(10,10,15,0.58)');
      ctx.save();
      ctx.fillStyle = vig;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // 5. Warm overlay (overlay blend)
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      var warmGrad = ctx.createLinearGradient(0, H*0.6, 0, H);
      warmGrad.addColorStop(0, 'rgba(232,93,4,0)');
      warmGrad.addColorStop(1, 'rgba(232,93,4,0.05)');
      ctx.fillStyle = warmGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // ── bootstrap ──────────────────────────────────────────
    initBuffers();
    initParticles();
    bindInteraction();
    lastTime = performance.now();
    frameId  = requestAnimationFrame(loop);
  }

  // Expose global (matches kinetic-grid convention: window.EmberForge.init)
  window.EmberForge = { init: init };

}());
