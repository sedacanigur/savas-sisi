// Kodla üretilen sesler (WebAudio). Dış ses dosyası yok.
import {AYAR} from "./kayit.js";

let ctx = null, ana = null, gurultuBuf = null, ortam = null;
const son = {};
function hazirla() {
  if (ctx) return true;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    ana = ctx.createGain(); ana.gain.value = AYAR.ses; ana.connect(ctx.destination);
    const n = ctx.sampleRate * 2; gurultuBuf = ctx.createBuffer(1, n, ctx.sampleRate); const d = gurultuBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return true;
  } catch (e) { return false; }
}
export function sesBaslat() { if (hazirla() && ctx.state === "suspended") ctx.resume(); }
export function sesSeviye(v) { AYAR.ses = v; if (ana) ana.gain.value = v; }

function gurultu(sure, f1, f2, kazanc, t0 = 0, tip = "bandpass", q = 0.8) {
  const s = ctx.createBufferSource(); s.buffer = gurultuBuf; s.playbackRate.value = 0.7 + Math.random() * 0.6;
  const f = ctx.createBiquadFilter(); f.type = tip; f.frequency.setValueAtTime(f1, ctx.currentTime + t0); f.frequency.exponentialRampToValueAtTime(Math.max(30, f2), ctx.currentTime + t0 + sure); f.Q.value = q;
  const g = ctx.createGain(); g.gain.setValueAtTime(kazanc, ctx.currentTime + t0); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t0 + sure);
  s.connect(f); f.connect(g); g.connect(ana); s.start(ctx.currentTime + t0, Math.random()); s.stop(ctx.currentTime + t0 + sure + 0.05);
}
function ton(fr, sure, kazanc, t0 = 0, tip = "sine", fr2) {
  const o = ctx.createOscillator(); o.type = tip; o.frequency.setValueAtTime(fr, ctx.currentTime + t0); if (fr2) o.frequency.exponentialRampToValueAtTime(fr2, ctx.currentTime + t0 + sure);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, ctx.currentTime + t0); g.gain.linearRampToValueAtTime(kazanc, ctx.currentTime + t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t0 + sure);
  o.connect(g); g.connect(ana); o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + sure + 0.05);
}

// tur: musket | rifle | pistol | gatling | mg | smg | cannon | boom | boom_s | thump | alev | puf | isabet | kilic | at
export function ses(tur, mesafe = 0, guc = 1) {
  if (!ctx || AYAR.ses <= 0) return;
  const k = Math.min(1, 30 / (mesafe + 30)) * guc; if (k < 0.04) return;
  const simdi = performance.now(); const sinir = {musket: 25, rifle: 25, mg: 30, gatling: 30, smg: 30, cannon: 60, boom: 60}[tur] || 40;
  if (son[tur] && simdi - son[tur] < sinir) return; son[tur] = simdi;
  const uzak = mesafe > 120;
  switch (tur) {
    case "musket": gurultu(0.5, 1800, 200, 0.9 * k, 0, "lowpass"); gurultu(0.9, 300, 60, 0.6 * k, 0.02, "lowpass"); break;
    case "rifle": gurultu(0.25, uzak ? 1200 : 3500, 300, 0.9 * k, 0, "lowpass"); gurultu(0.5, 500, 80, 0.4 * k, 0.01, "lowpass"); break;
    case "pistol": gurultu(0.2, 2500, 300, 0.6 * k, 0, "lowpass"); break;
    case "gatling": case "mg": case "smg": gurultu(0.12, uzak ? 1000 : 2600, 300, 0.6 * k, 0, "lowpass"); break;
    case "cannon": gurultu(1.8, 700, 40, 1.2 * k, 0, "lowpass"); ton(70, 0.8, 0.5 * k, 0, "sine", 35); break;
    case "boom": gurultu(2.2, 900, 30, 1.3 * k, 0, "lowpass"); ton(55, 1.2, 0.6 * k, 0, "sine", 25); break;
    case "boom_s": gurultu(1, 1200, 60, 0.9 * k, 0, "lowpass"); break;
    case "thump": gurultu(0.4, 400, 60, 0.7 * k, 0, "lowpass"); break;
    case "alev": gurultu(0.3, 600, 300, 0.4 * k, 0, "bandpass"); break;
    case "puf": gurultu(0.6, 1500, 400, 0.3 * k, 0, "bandpass"); break;
    case "isabet": gurultu(0.08, 2000, 800, 0.25 * k, 0, "bandpass", 2); break;
    case "vizilti": ton(1400 + Math.random() * 600, 0.12, 0.08 * k, 0, "sine", 600); break;
    case "kilic": ton(2400, 0.15, 0.1 * k, 0, "triangle", 1800); gurultu(0.1, 4000, 2000, 0.15 * k, 0, "highpass"); break;
    case "at": for (let i = 0; i < 4; i++) gurultu(0.07, 300, 120, 0.25 * k, i * 0.11, "lowpass"); break;
    case "tik": ton(900, 0.05, 0.15, 0, "square"); break;
    case "dogru": ton(660, 0.15, 0.2); ton(880, 0.25, 0.2, 0.12); break;
    case "yanlis": ton(220, 0.35, 0.2, 0, "triangle", 160); break;
    case "sandik": ton(330, 0.1, 0.2); ton(495, 0.1, 0.2, 0.08); ton(660, 0.3, 0.2, 0.16); break;
  }
}
// Borazan: hücum, toplanma, zafer
export function borazan(tur = "hucum") {
  if (!ctx) return;
  const N = {hucum: [[392, 0.15], [523, 0.15], [659, 0.15], [784, 0.45], [659, 0.15], [784, 0.6]], toplan: [[523, 0.3], [659, 0.3], [784, 0.6], [659, 0.3], [523, 0.6]], zafer: [[523, 0.2], [659, 0.2], [784, 0.2], [1046, 0.8], [784, 0.25], [1046, 1]], yenilgi: [[392, 0.5], [349, 0.5], [311, 1.2]]}[tur];
  let t = 0; for (const [f, s] of N) { ton(f, s * 0.95, 0.12, t, "sawtooth"); ton(f * 2, s * 0.9, 0.04, t, "square"); t += s; }
}
// Ortam sesi: yağmur/rüzgâr/ateş
export function ortamSes(tur) {
  if (!ctx) return;
  if (ortam) { try { ortam.s.stop(); } catch (e) {} ortam = null; }
  if (!tur) return;
  const s = ctx.createBufferSource(); s.buffer = gurultuBuf; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = tur === "yagmur" ? "highpass" : "lowpass"; f.frequency.value = tur === "yagmur" ? 1800 : tur === "ruzgar" ? 400 : 300;
  const g = ctx.createGain(); g.gain.value = tur === "yagmur" ? 0.12 : 0.08;
  s.connect(f); f.connect(g); g.connect(ana); s.start(); ortam = {s, g};
}
