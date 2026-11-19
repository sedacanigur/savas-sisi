// Soru seçimi. Her aşamanın ders ağırlığı farklıdır:
// Aşama 1 (konuşlanma): Matematik, sözel mantık, tarih · Aşama 2 (hazırlık): Fen, tarih
// Aşama 4 (ganimet): Türkçe, İnkılap, Din, tarih · özel sandık: yanlış defteri
import {Q, LQ, setIslenen, topicAllowed} from "./banka.gen.js";
import {AYAR} from "../kayit.js";

const DURUM_KEY = "savassisi-soru-durum-v1";
const durum = (() => { try { return JSON.parse(localStorage.getItem(DURUM_KEY)) || {}; } catch (e) { return {}; } })();
durum.son = durum.son || []; durum.yanlis = durum.yanlis || {};
const durumKaydet = () => { try { localStorage.setItem(DURUM_KEY, JSON.stringify(durum)); } catch (e) {} };

const ASAMA_DERS = {
  1: {mat: 3, tr: 1, tarih: 2, topics: {tr: ["t11", "t7"]}},
  2: {fen: 4, tarih: 1, mat: 1},
  4: {tr: 2, ink: 2, din: 1, tarih: 2},
};

const karistir = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

function agirlikli(obj) {
  const e = Object.entries(obj).filter(([k, w]) => k !== "topics" && w > 0); let t = e.reduce((a, [, w]) => a + w, 0), x = Math.random() * t;
  for (const [k, w] of e) { x -= w; if (x <= 0) return k; } return e[0][0];
}

function tarihSoru() {
  const havuz = Q.map((q, i) => i).filter(i => !durum.son.includes("t" + i));
  const i = havuz.length ? havuz[Math.random() * havuz.length | 0] : Math.random() * Q.length | 0;
  const q = Q[i];
  return {id: "t" + i, kategori: q[0], metin: q[1], siklar: q[2], dogru: q[3], aciklama: q[4], zorluk: q[5] || 2};
}

function lgsSoru(sid, konular) {
  let aday = LQ.filter(x => x.s === sid && topicAllowed(x.t) && (!konular || konular.includes(x.t)));
  if (!aday.length) aday = LQ.filter(x => x.s === sid && topicAllowed(x.t));
  if (!aday.length) return null;
  const yanlislar = aday.filter(x => durum.yanlis[x.id] && !durum.son.includes(x.id));
  let x;
  if (yanlislar.length && Math.random() < 0.25) x = yanlislar[Math.random() * yanlislar.length | 0];
  else { const yeni = aday.filter(x => !durum.son.includes(x.id)); const h = yeni.length ? yeni : aday; x = h[Math.random() * h.length | 0]; }
  const q = x.q;
  return {id: x.id, kategori: "LGS · " + q[0], metin: q[1], siklar: q[2], dogru: q[3], aciklama: q[4], zorluk: q[5] || 2, lgs: true};
}

// ---- Yanlış defteri (Notion, Worker üzerinden) ----
export const YANLIS = {durum: "bos", sorular: [], hata: "", at: 0};
export async function yanlisYukle(zorla) {
  if (YANLIS.durum === "yukleniyor") return;
  if (!zorla && YANLIS.durum === "ok" && Date.now() - YANLIS.at < 40 * 60 * 1000) return;
  YANLIS.durum = "yukleniyor";
  try {
    const r = await fetch("/api/yanlis", {cache: "no-store"});
    const d = await r.json().catch(() => ({error: "sunucu yanıtı okunamadı"}));
    if (!r.ok || d.error) throw new Error(d.error || "HTTP " + r.status);
    YANLIS.sorular = d.questions.filter(x => x.ans >= 0 && x.ans < 4 && x.img).map(x => ({
      id: "y" + x.id, kategori: "Yanlış defteri" + (x.ders ? " · " + x.ders : ""), metin: "", siklar: ["A", "B", "C", "D"], dogru: x.ans,
      aciklama: `Doğru cevap ${"ABCD"[x.ans]}.` + (x.prev ? ` Daha önce ${x.prev} işaretlemiştin.` : ""), img: x.img, pdf: !!x.pdf, fotograf: true}));
    setIslenen(d.topics || []);
    YANLIS.durum = "ok"; YANLIS.at = Date.now(); YANLIS.hata = "";
  } catch (e) { YANLIS.durum = "hata"; YANLIS.hata = String(e.message || e); }
}
if (AYAR.soru.yanlis) yanlisYukle();

export function yanlisVar() { return AYAR.soru.yanlis && YANLIS.durum === "ok" && YANLIS.sorular.length > 0; }
export function yanlisSoru() {
  if (!yanlisVar()) return null;
  const h = YANLIS.sorular.filter(q => !durum.son.includes(q.id));
  return (h.length ? h : YANLIS.sorular)[Math.random() * (h.length || YANLIS.sorular.length) | 0];
}

// Bir aşama için soru
export function soruSec(asama, tercih) {
  let q = null;
  if (tercih === "yanlis") q = yanlisSoru();
  const lgs = AYAR.soru.lgs, tarih = AYAR.soru.tarih || !lgs;
  for (let deneme = 0; !q && deneme < 6; deneme++) {
    const w = {...ASAMA_DERS[asama] || ASAMA_DERS[1]};
    if (!lgs) for (const k of Object.keys(w)) if (k !== "tarih" && k !== "topics") w[k] = 0;
    if (!tarih) w.tarih = 0;
    const ders = agirlikli(w);
    q = ders === "tarih" ? tarihSoru() : lgsSoru(ders, (w.topics || {})[ders]);
  }
  if (!q) q = tarihSoru();
  if (!q.fotograf) {
    const idx = karistir([0, 1, 2, 3].slice(0, q.siklar.length));
    q = {...q, siklar: idx.map(i => q.siklar[i]), dogru: idx.indexOf(q.dogru)};
  }
  durum.son = [q.id, ...durum.son.filter(x => x !== q.id)].slice(0, 120);
  durumKaydet();
  return q;
}

export function sonucBildir(q, dogru) {
  if (!q) return;
  if (q.lgs) { if (dogru) delete durum.yanlis[q.id]; else durum.yanlis[q.id] = 1; durumKaydet(); }
}
