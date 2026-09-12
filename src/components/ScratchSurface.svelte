<script>
  import {
    startScratch,
    stopScratch,
    setScratchIntensity,
    coin,
  } from "../lib/audio.js";

  let {
    theme = "silver",
    label = "GRATTA QUI",
    threshold = 0.55,
    targets = null,
    disabled = false,
    onprogress,
    oncomplete,
    children,
  } = $props();

  const COVERS = {
    silver: { base: ["#eef0f3", "#b7bbc1", "#ffffff", "#83878d"], money: true },
    gold: { base: ["#ffe49b", "#c9952c", "#fff3cc", "#835a0f"], money: true },
    blue: { base: ["#cdeefb", "#57a6c6", "#ecfaff", "#2b7595"], money: false },
  };

  let wrap = $state(null);
  let canvas = $state(null);

  let revealed = $state(false);
  let progress = $state(0);
  let drawing = $state(false);
  let pointer = $state({ x: 0, y: 0 });

  let ctx = null;
  let cells = null;
  let cols = 0;
  let rows = 0;
  let cell = 16;
  let marked = 0;
  let last = null;
  let ready = false;
  let dpr = 1;

  function init() {
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx = canvas.getContext("2d");
    cell = Math.max(11, Math.round(13 * dpr));
    cols = Math.ceil(canvas.width / cell);
    rows = Math.ceil(canvas.height / cell);
    cells = new Uint8Array(cols * rows);
    marked = 0;
    progress = 0;
    drawFoil(sampleTargets());
    ready = true;
  }

  function rr(g, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + rad, y);
    g.arcTo(x + w, y, x + w, y + h, rad);
    g.arcTo(x + w, y + h, x, y + h, rad);
    g.arcTo(x, y + h, x, y, rad);
    g.arcTo(x, y, x + w, y, rad);
    g.closePath();
  }

  function drawCoin(g, x, y, r) {
    const rg = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    rg.addColorStop(0, "#fff6c8");
    rg.addColorStop(0.45, "#f5c542");
    rg.addColorStop(0.8, "#cf9412");
    rg.addColorStop(1, "#8a5c06");
    g.save();
    g.fillStyle = rg;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = Math.max(1, r * 0.1);
    g.strokeStyle = "#8a5c06";
    g.stroke();
    g.beginPath();
    g.arc(x, y, r * 0.74, 0, Math.PI * 2);
    g.strokeStyle = "rgba(120,80,0,0.55)";
    g.lineWidth = Math.max(1, r * 0.06);
    g.stroke();
    g.fillStyle = "rgba(110,72,0,0.9)";
    g.font = `900 ${Math.round(r * 1.15)}px system-ui, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("€", x, y + r * 0.06);
    g.restore();
  }

  function drawDollar(g, x, y, size, rot) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.fillStyle = "rgba(24,104,58,0.9)";
    g.font = `900 ${Math.round(size)}px system-ui, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("$", 0, 0);
    g.restore();
  }

  function drawBanknote(g, x, y, w, h, rot) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.fillStyle = "#2f9160";
    rr(g, -w / 2, -h / 2, w, h, h * 0.18);
    g.fill();
    g.strokeStyle = "rgba(255,255,255,0.75)";
    g.lineWidth = Math.max(1, w * 0.012);
    rr(g, -w / 2 + w * 0.07, -h / 2 + h * 0.14, w * 0.86, h * 0.72, h * 0.12);
    g.stroke();
    g.fillStyle = "rgba(255,255,255,0.9)";
    g.beginPath();
    g.arc(0, 0, h * 0.22, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#2f9160";
    g.font = `900 ${Math.round(h * 0.34)}px system-ui, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("$", 0, h * 0.01);
    g.restore();
  }

  function drawWaveLine(g, y, w, amp, step, alpha) {
    g.save();
    g.globalAlpha = alpha;
    g.lineWidth = Math.max(1.5, 2.4 * dpr);
    g.strokeStyle = "#ffffff";
    for (let k = 0; k < 3; k++) {
      g.beginPath();
      for (let x = -20; x <= w + 20; x += step) {
        const yy = y + k * 7 * dpr + Math.sin(x / (26 * dpr) + k) * amp;
        if (x <= -20 + step) g.moveTo(x, yy);
        else g.lineTo(x, yy);
      }
      g.stroke();
    }
    g.restore();
  }

  function drawAnchor(g, x, y, s, rot) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.strokeStyle = "#0b3b52";
    g.fillStyle = "#0b3b52";
    g.lineWidth = Math.max(1, s * 0.12);
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(0, -s * 0.6);
    g.lineTo(0, s * 0.5);
    g.stroke();
    g.beginPath();
    g.arc(0, -s * 0.72, s * 0.13, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(-s * 0.32, -s * 0.3);
    g.lineTo(s * 0.32, -s * 0.3);
    g.stroke();
    g.beginPath();
    g.arc(0, s * 0.02, s * 0.55, Math.PI * 0.12, Math.PI * 0.88);
    g.stroke();
    g.beginPath();
    g.moveTo(-s * 0.54, s * 0.32);
    g.lineTo(-s * 0.64, s * 0.06);
    g.lineTo(-s * 0.36, s * 0.12);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(s * 0.54, s * 0.32);
    g.lineTo(s * 0.64, s * 0.06);
    g.lineTo(s * 0.36, s * 0.12);
    g.closePath();
    g.fill();
    g.restore();
  }

  function drawSail(g, x, y, s, rot) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.fillStyle = "#0b3b52";
    g.beginPath();
    g.moveTo(-s * 0.6, s * 0.34);
    g.lineTo(s * 0.6, s * 0.34);
    g.lineTo(s * 0.4, s * 0.56);
    g.lineTo(-s * 0.4, s * 0.56);
    g.closePath();
    g.fill();
    g.strokeStyle = "#0b3b52";
    g.lineWidth = Math.max(1, s * 0.07);
    g.beginPath();
    g.moveTo(0, s * 0.34);
    g.lineTo(0, -s * 0.62);
    g.stroke();
    g.fillStyle = "#ffffff";
    g.strokeStyle = "#0b3b52";
    g.lineWidth = Math.max(1, s * 0.05);
    g.beginPath();
    g.moveTo(s * 0.04, -s * 0.56);
    g.lineTo(s * 0.5, s * 0.14);
    g.lineTo(s * 0.04, s * 0.14);
    g.closePath();
    g.fill();
    g.stroke();
    g.beginPath();
    g.moveTo(-s * 0.04, -s * 0.46);
    g.lineTo(-s * 0.42, s * 0.14);
    g.lineTo(-s * 0.04, s * 0.14);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
  }

  function drawStar(g, x, y, s, rot, color) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.fillStyle = color;
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = (Math.PI / 5) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? s : s * 0.45;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fill();
    g.restore();
  }

  function sampleTargets() {
    if (!targets || !wrap) return null;
    const base = wrap.getBoundingClientRect();
    const out = { winning: [], yours: [], symbols: [] };
    for (const grp of targets) {
      const els = wrap.querySelectorAll(grp.selector);
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        (out[grp.key] || (out[grp.key] = [])).push({
          x: (r.left - base.left) * dpr,
          y: (r.top - base.top) * dpr,
          w: r.width * dpr,
          h: r.height * dpr,
          sym: el.dataset.sym || el.textContent.trim(),
        });
      });
    }
    return out;
  }

  // ---- copertine allineate 1:1 alle celle del tagliando ----
  // Ogni simbolo e' centrato esattamente sulla propria cella: nessun
  // sparpagliamento, la copertura combacia con quello che c'e' sotto.
  function fillTile(x, y, w, h, fn) {
    const pad = Math.min(w, h) * 0.06;
    fn(x + w / 2, y + h / 2, w - pad * 2, h - pad * 2);
  }

  function coinTile(x, y, w, h) {
    fillTile(x, y, w, h, (cx, cy, tw, th) =>
      drawCoin(ctx, cx, cy, Math.min(tw, th) * 0.36)
    );
  }

  function banknoteTile(x, y, w, h) {
    fillTile(x, y, w, h, (cx, cy, tw, th) => {
      const bw = tw * 0.96;
      const bh = th * 0.6;
      // mazzetta di banconote impilate, centrata nella cella
      for (let i = -1; i <= 1; i++) {
        drawBanknote(ctx, cx, cy + i * th * 0.11, bw, bh, i * 0.06);
      }
    });
  }

  function seaTile(x, y, w, h, sym) {
    fillTile(x, y, w, h, (cx, cy, tw, th) => {
      const s = Math.min(tw, th) * 0.38;
      if (sym === "⚓") drawAnchor(ctx, cx, cy, s, 0);
      else if (sym === "⛵") drawSail(ctx, cx, cy, s, 0);
      else if (sym === "⭐")
        drawStar(ctx, cx, cy, s * 0.9, 0, "rgba(255,255,255,0.95)");
      else drawCoin(ctx, cx, cy, s * 0.95);
    });
  }

  function drawMoneyCover(w, h, layout) {
    for (const c of layout?.winning || []) coinTile(c.x, c.y, c.w, c.h);
    for (const c of layout?.yours || []) banknoteTile(c.x, c.y, c.w, c.h);
  }

  function drawSeaCover(w, h, layout) {
    for (let i = 0; i < 6; i++) {
      drawWaveLine(ctx, h * (0.1 + i * 0.16), w, 5 * dpr, 6 * dpr, 0.26);
    }
    for (const c of layout?.symbols || []) seaTile(c.x, c.y, c.w, c.h, c.sym);
  }

  function drawFoil(layout) {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const pal = COVERS[theme] || COVERS.silver;
    const g = ctx;

    g.globalCompositeOperation = "source-over";
    g.clearRect(0, 0, w, h);

    const bg = g.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, pal.base[0]);
    bg.addColorStop(0.42, pal.base[1]);
    bg.addColorStop(0.58, pal.base[2]);
    bg.addColorStop(1, pal.base[3]);
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);

    if (pal.money) drawMoneyCover(w, h, layout);
    else drawSeaCover(w, h, layout);

    g.save();
    g.globalAlpha = 0.08;
    g.fillStyle = "#ffffff";
    const band = Math.max(14, 20 * dpr);
    for (let x = -h; x < w; x += band * 2.6) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + h, h);
      g.lineTo(x + h + band, h);
      g.lineTo(x + band, 0);
      g.closePath();
      g.fill();
    }
    g.restore();

    g.save();
    g.globalAlpha = 0.12;
    g.fillStyle = "#101014";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `900 ${Math.round(15 * dpr)}px system-ui, sans-serif`;
    g.translate(w / 2, h / 2);
    g.rotate(-Math.PI / 9);
    const spanX = 200 * dpr;
    const spanY = 54 * dpr;
    const diag = Math.hypot(w, h);
    for (let y = -diag; y < diag; y += spanY) {
      for (let x = -diag; x < diag; x += spanX) {
        g.fillText("GRATTA E VINCI", x, y);
      }
    }
    g.restore();

    g.save();
    const vg = g.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.22,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.78
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.22)");
    g.fillStyle = vg;
    g.fillRect(0, 0, w, h);
    g.restore();

    g.save();
    g.strokeStyle = "rgba(20,20,28,0.35)";
    g.lineWidth = Math.max(1, 1.4 * dpr);
    g.setLineDash([7 * dpr, 6 * dpr]);
    rr(g, 7 * dpr, 7 * dpr, w - 14 * dpr, h - 14 * dpr, 12 * dpr);
    g.stroke();
    g.restore();

    drawHint(g, w, h);
  }

  function drawHint(g, w, h) {
    const cx = w / 2;
    const cy = h / 2;
    g.save();
    g.font = `900 ${Math.round(15 * dpr)}px system-ui, sans-serif`;
    const tw = g.measureText(label).width;
    const pw = tw + 74 * dpr;
    const ph = 58 * dpr;
    rr(g, cx - pw / 2, cy - ph / 2, pw, ph, 16 * dpr);
    g.fillStyle = "rgba(255,255,255,0.9)";
    g.fill();
    g.strokeStyle = "rgba(20,20,28,0.18)";
    g.lineWidth = 1.5 * dpr;
    g.stroke();

    drawCoin(g, cx - pw / 2 + 26 * dpr, cy - 2 * dpr, 14 * dpr);
    g.fillStyle = "#15151b";
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.font = `900 ${Math.round(15 * dpr)}px system-ui, sans-serif`;
    g.fillText(label, cx - pw / 2 + 48 * dpr, cy - 8 * dpr);
    g.font = `700 ${Math.round(9.5 * dpr)}px system-ui, sans-serif`;
    g.fillStyle = "rgba(20,20,28,0.6)";
    g.fillText(
      "gratta con il dito o il mouse",
      cx - pw / 2 + 48 * dpr,
      cy + 10 * dpr
    );
    g.restore();
  }

  function localPos(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy,
      cx: e.clientX - rect.left,
      cy: e.clientY - rect.top,
    };
  }

  function onDown(e) {
    if (disabled || revealed || !ready) return;
    e.preventDefault();
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    drawing = true;
    const p = localPos(e);
    last = { x: p.x, y: p.y };
    pointer = { x: p.cx, y: p.cy };
    coin();
    startScratch();
    scratchSegment(p.x, p.y, p.x, p.y);
  }

  function onMove(e) {
    if (!drawing || revealed || disabled) return;
    e.preventDefault();
    const p = localPos(e);
    pointer = { x: p.cx, y: p.cy };
    const speed = last ? Math.hypot(p.x - last.x, p.y - last.y) : 0;
    setScratchIntensity(Math.min(1, speed / (cell * 2)));
    scratchSegment(last.x, last.y, p.x, p.y);
    last = { x: p.x, y: p.y };
  }

  function onUp() {
    if (!drawing) return;
    drawing = false;
    stopScratch();
  }

  function scratchSegment(x0, y0, x1, y1) {
    if (!ctx) return;
    const brush = cell * 1.6;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = brush;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(dist / (cell * 0.7)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      ctx.beginPath();
      ctx.arc(x, y, brush * (0.32 + Math.random() * 0.28), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
      markCells(x, y, brush * 0.95);
    }
    updateProgress();
  }

  function markCells(x, y, r) {
    const c0 = Math.max(0, Math.floor((x - r) / cell));
    const c1 = Math.min(cols - 1, Math.floor((x + r) / cell));
    const r0 = Math.max(0, Math.floor((y - r) / cell));
    const r1 = Math.min(rows - 1, Math.floor((y + r) / cell));
    const r2 = r * r;
    for (let ry = r0; ry <= r1; ry++) {
      for (let cx = c0; cx <= c1; cx++) {
        const px = (cx + 0.5) * cell;
        const py = (ry + 0.5) * cell;
        const dx = px - x;
        const dy = py - y;
        if (dx * dx + dy * dy <= r2) {
          const idx = ry * cols + cx;
          if (cells[idx] === 0) {
            cells[idx] = 1;
            marked++;
          }
        }
      }
    }
  }

  function updateProgress() {
    const total = cols * rows;
    if (!total) return;
    const p = marked / total;
    progress = p;
    onprogress?.(p);
    if (!revealed && p >= threshold) reveal();
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    drawing = false;
    stopScratch();
    oncomplete?.();
  }

  $effect(() => {
    if (!canvas || !wrap) return;
    init();
    const ro = new ResizeObserver(() => {
      if (!ready) init();
    });
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      stopScratch();
    };
  });
</script>

<div class="scratch" bind:this={wrap}>
  <div class="art" class:art--revealed={revealed}>
    {@render children?.()}
  </div>

  <canvas
    bind:this={canvas}
    class="foil"
    class:foil--gone={revealed}
    aria-hidden="true"
    onpointerdown={onDown}
    onpointermove={onMove}
    onpointerup={onUp}
    onpointercancel={onUp}
    onpointerleave={onUp}
    oncontextmenu={(e) => e.preventDefault()}
  ></canvas>

  {#if drawing && !revealed}
    <div
      class="coin"
      style="left:{pointer.x}px; top:{pointer.y}px"
      aria-hidden="true"
      ><span>€</span></div
    >
  {/if}

  {#if !revealed}
    <div class="hud">
      <span class="hud__pct" aria-live="polite"
        >{Math.round(progress * 100)}%</span
      >
      <button
        class="hud__btn"
        type="button"
        onpointerdown={(e) => e.stopPropagation()}
        onclick={reveal}>Rivela tutto</button
      >
    </div>
  {/if}
</div>

<style>
  .scratch {
    position: relative;
    min-height: 330px;
    border-radius: 16px;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }

  .art {
    transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .art--revealed {
    transform: scale(1.005);
  }

  .foil {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    border-radius: inherit;
    cursor: crosshair;
    transition: opacity 0.5s ease, transform 0.5s ease;
    touch-action: none;
  }

  .foil--gone {
    opacity: 0;
    transform: scale(1.03);
    pointer-events: none;
  }

  .coin {
    position: absolute;
    z-index: 6;
    width: 38px;
    height: 38px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    display: grid;
    place-items: center;
    pointer-events: none;
    color: #5a3c00;
    font-weight: 900;
    font-size: 17px;
    background: radial-gradient(
      circle at 34% 28%,
      #fff3c4,
      #f5b301 45%,
      #965f00
    );
    border: 2px solid #7a4f00;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.45),
      inset 0 1px 2px rgba(255, 255, 255, 0.6);
    animation: wobble 0.45s ease-in-out infinite;
  }

  .coin span {
    transform: translateY(-1px);
  }

  .hud {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10px;
    z-index: 7;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    pointer-events: none;
  }

  .hud__pct {
    padding: 5px 10px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.14);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: #fff;
    backdrop-filter: blur(6px);
  }

  .hud__btn {
    pointer-events: auto;
    padding: 7px 13px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.62);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 11.5px;
    font-weight: 800;
    letter-spacing: 0.04em;
    backdrop-filter: blur(6px);
    transition: transform 0.14s ease, background 0.2s ease;
  }

  .hud__btn:active {
    transform: scale(0.95);
    background: rgba(0, 0, 0, 0.8);
  }
</style>
