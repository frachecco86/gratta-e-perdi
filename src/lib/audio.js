/* ============================================================
   Web Audio synth engine — nessun asset esterno.
   Suoni: moneta, grattare (rumore), reveal, jingle di esito.
   ============================================================ */

let ctx = null;
let master = null;
let muted = false;
let scratch = null;
let noiseBuf = null;

function ensure() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function unlockAudio() {
  ensure();
}

export function setMuted(v) {
  muted = !!v;
  if (master && ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.02);
  }
}

export function isMuted() {
  return muted;
}

function getNoise() {
  if (noiseBuf) return noiseBuf;
  const len = Math.floor(ctx.sampleRate * 1.6);
  noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

function blip(when, freq, dur, type = "square", gain = 0.18) {
  const c = ctx;
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, when);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  o.connect(g);
  g.connect(master);
  o.start(when);
  o.stop(when + dur + 0.03);
}

function slide(when, f0, f1, dur, type = "triangle", gain = 0.16) {
  const c = ctx;
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, when);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), when + dur);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  o.connect(g);
  g.connect(master);
  o.start(when);
  o.stop(when + dur + 0.03);
}

function noiseBurst(when, dur, gain, freq, q) {
  const c = ctx;
  if (!c) return;
  const src = c.createBufferSource();
  src.buffer = getNoise();
  src.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(when);
  src.stop(when + dur + 0.05);
}

/* --- moneta metallica (stile "coin" arcade) --- */
export function coin() {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime;
  blip(t, 988, 0.06, "square", 0.2);
  blip(t + 0.055, 1319, 0.1, "square", 0.18);
  blip(t, 1976, 0.04, "triangle", 0.08);
}

/* --- click UI --- */
export function click() {
  const c = ensure();
  if (!c) return;
  blip(c.currentTime, 660, 0.035, "triangle", 0.09);
}

/* --- rumore del grattare (loop) --- */
export function startScratch() {
  const c = ensure();
  if (!c || scratch) return;
  const src = c.createBufferSource();
  src.buffer = getNoise();
  src.loop = true;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1100;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2600;
  bp.Q.value = 0.6;
  const g = c.createGain();
  g.gain.value = 0.0001;
  src.connect(hp);
  hp.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start();
  g.gain.setTargetAtTime(0.05, c.currentTime, 0.04);
  scratch = { src, g };
}

export function setScratchIntensity(v) {
  if (!scratch || !ctx) return;
  const target = 0.02 + Math.min(1, Math.max(0, v)) * 0.08;
  scratch.g.gain.setTargetAtTime(target, ctx.currentTime, 0.05);
}

export function stopScratch() {
  if (!scratch || !ctx) return;
  const s = scratch;
  scratch = null;
  s.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
  setTimeout(() => {
    try {
      s.src.stop();
    } catch {
      /* noop */
    }
  }, 220);
}

/* --- whoosh del reveal --- */
export function reveal() {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime;
  noiseBurst(t, 0.34, 0.18, 2400, 0.8);
  slide(t, 320, 1400, 0.28, "sine", 0.1);
}

/* --- jingle di esito --- */
export function play(kind) {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + 0.02;

  switch (kind) {
    case "mirage": {
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((f, i) => blip(t + i * 0.09, f, 0.22, "square", 0.2));
      blip(t + 0.45, 2093, 0.4, "triangle", 0.14);
      noiseBurst(t + 0.45, 0.5, 0.1, 6000, 0.9);
      break;
    }
    case "small": {
      [523, 659, 784, 1047].forEach((f, i) =>
        blip(t + i * 0.07, f, 0.16, "square", 0.18)
      );
      break;
    }
    case "refund": {
      blip(t, 784, 0.1, "square", 0.16);
      blip(t + 0.1, 988, 0.12, "square", 0.14);
      blip(t + 0.24, 392, 0.3, "triangle", 0.1);
      break;
    }
    case "near": {
      [523, 659, 880].forEach((f, i) =>
        blip(t + i * 0.08, f, 0.14, "triangle", 0.16)
      );
      blip(t + 0.3, 932, 0.36, "triangle", 0.12);
      setTimeout(() => {
        if (!ctx) return;
        blip(ctx.currentTime, 130, 0.45, "sine", 0.16);
      }, 380);
      break;
    }
    default: {
      // "nothing" / perdita
      [392, 330, 262, 196].forEach((f, i) =>
        blip(t + i * 0.1, f, 0.2, "triangle", 0.13)
      );
      break;
    }
  }
}
