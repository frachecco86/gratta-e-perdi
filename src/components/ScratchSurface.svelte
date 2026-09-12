<script>
  import {
    startScratch,
    stopScratch,
    setScratchIntensity,
    coin,
  } from "../lib/audio.js";

  let {
    theme = "silver",
    threshold = 0.55,
    targets = null,
    disabled = false,
    onprogress,
    oncomplete,
    revealed = $bindable(false),
    children,
  } = $props();

  const KIND = {
    winning: "coin",
    yours: "banknote",
    symbols: "sea",
  };

  const THEME_FOIL = {
    silver: ["#eef0f3", "#a9adb4", "#ffffff", "#7d818a"],
    gold: ["#ffe49b", "#c9952c", "#fff3cc", "#835a0f"],
    blue: ["#d8f2fc", "#5aa9c8", "#f0fbff", "#2b7595"],
  };

  let wrap = $state(null);
  let canvas = $state(null);

  let progress = $state(0);
  let drawing = $state(false);
  let pointer = $state({ x: 0, y: 0 });

  let ctx = null;
  let zones = [];
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
    progress = 0;
    buildZones();
    drawFoil();
    ready = true;
  }

  // Ogni casella del biglietto diventa una zona grattabile indipendente,
  // con la sua griglia di copertura e il suo simbolo (moneta/mazzetta/simbolo).
  function buildZones() {
    const base = wrap.getBoundingClientRect();
    const cellSize = Math.max(10, Math.round(11 * dpr));
    zones = [];
    if (!targets) return;

    for (const grp of targets) {
      const kind = KIND[grp.key] || "coin";
      wrap.querySelectorAll(grp.selector).forEach((el) => {
        const r = el.getBoundingClientRect();
        const pad = 2 * dpr;
        const x = (r.left - base.left - pad) * dpr;
        const y = (r.top - base.top - pad) * dpr;
        const w = (r.width + pad * 2) * dpr;
        const h = (r.height + pad * 2) * dpr;
        const cols = Math.max(3, Math.ceil(w / cellSize));
        const rows = Math.max(3, Math.ceil(h / cellSize));
        zones.push({
          x,
          y,
          w,
          h,
          r: Math.min(w, h) * 0.16,
          cols,
          rows,
          cells: new Uint8Array(cols * rows),
          marked: 0,
          kind,
          sym: el.dataset.sym || el.textContent.trim(),
        });
      });
    }
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


  // ---- copertura: un simbolo per ogni cella, dentro la sua zona ----
  function drawCoinTile(cx, cy, tw, th) {
    drawCoin(ctx, cx, cy, Math.min(tw, th) * 0.42);
  }

  function drawBanknoteTile(cx, cy, tw, th) {
    const bw = tw * 0.96;
    const bh = th * 0.6;
    for (let i = -1; i <= 1; i++) {
      drawBanknote(ctx, cx, cy + i * th * 0.11, bw, bh, i * 0.06);
    }
  }

  function drawSeaTile(cx, cy, tw, th, sym) {
    const s = Math.min(tw, th) * 0.78;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${Math.round(s)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", system-ui, sans-serif`;
    ctx.fillText(sym || "⭐", cx, cy + s * 0.04);
    ctx.restore();
  }

  function fillZone(g, z) {
    const cw = z.w / z.cols;
    const ch = z.h / z.rows;

    g.save();
    rr(g, z.x, z.y, z.w, z.h, z.r);
    g.clip();

    // fondo metalizzato della graffetta
    const pal = THEME_FOIL[theme] || THEME_FOIL.silver;
    const lg = g.createLinearGradient(z.x, z.y, z.x + z.w, z.y + z.h);
    lg.addColorStop(0, pal[0]);
    lg.addColorStop(0.45, pal[1]);
    lg.addColorStop(0.6, pal[2]);
    lg.addColorStop(1, pal[3]);
    g.fillStyle = lg;
    g.fillRect(z.x, z.y, z.w, z.h);

    g.globalAlpha = 0.09;
    g.fillStyle = "#ffffff";
    const band = Math.max(10, 14 * dpr);
    for (let x = z.x - z.h; x < z.x + z.w; x += band * 2.6) {
      g.beginPath();
      g.moveTo(x, z.y);
      g.lineTo(x + z.h, z.y + z.h);
      g.lineTo(x + z.h + band, z.y + z.h);
      g.lineTo(x + band, z.y);
      g.closePath();
      g.fill();
    }
    g.globalAlpha = 1;

    // il simbolo, centrato nella zona
    const cx = z.x + z.w / 2;
    const cy = z.y + z.h / 2;
    const tw = z.w * 0.86;
    const th = z.h * 0.86;
    if (z.kind === "coin") drawCoinTile(cx, cy, tw, th);
    else if (z.kind === "banknote") drawBanknoteTile(cx, cy, tw, th);
    else drawSeaTile(cx, cy, tw, th, z.sym);

    g.restore();

    // bordo della casella, ben visibile
    g.save();
    g.strokeStyle = "rgba(30,30,38,0.5)";
    g.lineWidth = Math.max(1, 1.6 * dpr);
    rr(g, z.x + 1 * dpr, z.y + 1 * dpr, z.w - 2 * dpr, z.h - 2 * dpr, z.r);
    g.stroke();
    g.restore();

    void cw;
    void ch;
  }

  function drawFoil() {
    if (!ctx || !canvas) return;
    const g = ctx;
    g.globalCompositeOperation = "source-over";
    g.clearRect(0, 0, canvas.width, canvas.height);
    for (const z of zones) fillZone(g, z);
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
    setScratchIntensity(Math.min(1, speed / (13 * dpr * 2)));
    scratchSegment(last.x, last.y, p.x, p.y);
    last = { x: p.x, y: p.y };
  }

  function onUp() {
    if (!drawing) return;
    drawing = false;
    stopScratch();
  }

  function scratchSegment(x0, y0, x1, y1) {
    if (!ctx || !zones.length) return;
    const brush = 13 * dpr;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    for (const z of zones) {
      if (
        x1 < z.x - brush ||
        x1 > z.x + z.w + brush ||
        y1 < z.y - brush ||
        y1 > z.y + z.h + brush
      )
        continue;
      ctx.save();
      rr(ctx, z.x, z.y, z.w, z.h, z.r);
      ctx.clip();
      ctx.lineWidth = brush;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x1, y1, brush * 0.62, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
      ctx.restore();
    }

    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(dist / (brush * 0.6)));
    for (const z of zones) {
      if (
        x1 < z.x - brush ||
        x1 > z.x + z.w + brush ||
        y1 < z.y - brush ||
        y1 > z.y + z.h + brush
      )
        continue;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        markZone(z, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, brush * 0.7);
      }
    }
    updateProgress();
  }

  function markZone(z, x, y, r) {
    if (x < z.x - r || x > z.x + z.w + r || y < z.y - r || y > z.y + z.h + r)
      return;
    const cw = z.w / z.cols;
    const ch = z.h / z.rows;
    const c0 = Math.max(0, Math.floor((x - r - z.x) / cw));
    const c1 = Math.min(z.cols - 1, Math.floor((x + r - z.x) / cw));
    const r0 = Math.max(0, Math.floor((y - r - z.y) / ch));
    const r1 = Math.min(z.rows - 1, Math.floor((y + r - z.y) / ch));
    const r2 = r * r;
    for (let ry = r0; ry <= r1; ry++) {
      for (let cx = c0; cx <= c1; cx++) {
        const px = z.x + (cx + 0.5) * cw;
        const py = z.y + (ry + 0.5) * ch;
        const dx = px - x;
        const dy = py - y;
        if (dx * dx + dy * dy <= r2) {
          const idx = ry * z.cols + cx;
          if (z.cells[idx] === 0) {
            z.cells[idx] = 1;
            z.marked++;
          }
        }
      }
    }
  }

  function updateProgress() {
    if (!zones.length) return;
    let total = 0;
    let done = 0;
    for (const z of zones) {
      total += z.cols * z.rows;
      done += z.marked;
    }
    if (!total) return;
    const p = done / total;
    progress = p;
    onprogress?.(p);
    if (!revealed && p >= threshold) reveal();
  }

  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    drawing = false;
    stopScratch();
    oncomplete?.();
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    finish();
  }

  // il bottone "Rivela tutto" del genitore imposta `revealed`
  $effect(() => {
    if (revealed) finish();
  });

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





</style>
