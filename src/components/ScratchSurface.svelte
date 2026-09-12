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
    disabled = false,
    onprogress,
    oncomplete,
    children,
  } = $props();

  const FOILS = {
    silver: ["#cfd2d7", "#8b8f96", "#eceef1", "#63676d"],
    gold: ["#ffd98a", "#c9962f", "#fff0c4", "#8a5f12"],
    blue: ["#9fd8ef", "#3d8fb4", "#dcf4fc", "#225b7a"],
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
    drawFoil();
    ready = true;
  }

  function drawFoil() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const pal = FOILS[theme] || FOILS.silver;

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);

    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, pal[0]);
    g.addColorStop(0.42, pal[1]);
    g.addColorStop(0.58, pal[2]);
    g.addColorStop(1, pal[3]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#ffffff";
    const band = Math.max(14, 20 * dpr);
    for (let x = -h; x < w; x += band * 2.4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + h, h);
      ctx.lineTo(x + h + band, h);
      ctx.lineTo(x + band, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.15;
    const dots = Math.floor((w * h) / 900);
    for (let i = 0; i < dots; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const s = Math.random() * 1.7 * dpr;
      ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
      ctx.fillRect(x, y, s, s);
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = "#111116";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${Math.round(15 * dpr)}px system-ui, sans-serif`;
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 9);
    const spanX = 200 * dpr;
    const spanY = 54 * dpr;
    const diag = Math.hypot(w, h);
    for (let y = -diag; y < diag; y += spanY) {
      for (let x = -diag; x < diag; x += spanX) {
        ctx.fillText("GRATTA E VINCI", x, y);
      }
    }
    ctx.restore();

    ctx.save();
    const vg = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.2,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.78
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.3)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = "rgba(18,18,24,0.78)";
    ctx.font = `900 ${Math.round(14 * dpr)}px system-ui, sans-serif`;
    ctx.fillText(label, cx, cy - 7 * dpr);
    ctx.font = `700 ${Math.round(9.5 * dpr)}px system-ui, sans-serif`;
    ctx.fillStyle = "rgba(18,18,24,0.6)";
    ctx.fillText("✦ gratta con il dito o il mouse ✦", cx, cy + 12 * dpr);
    ctx.restore();
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
