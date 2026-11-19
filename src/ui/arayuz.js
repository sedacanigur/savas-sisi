// Arayüz yardımcıları: modal pencere, soru penceresi, bildirim, geçiş.
import {soruSec, sonucBildir} from "../sorular/soru.js";
import {ses} from "../ses.js";
import {K, kaydet} from "../kayit.js";
import {kilitAc} from "../girdi.js";

export const UI = document.getElementById("ui");
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
export function el(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
export function temizle() { UI.innerHTML = ""; }

export function modal(html, {kapat = true, sinif = ""} = {}) {
  kilitAc();
  const arka = el(`<div class="modal-arka"><div class="modal kagit ${sinif}" role="dialog" aria-modal="true">${html}</div></div>`);
  document.body.appendChild(arka);
  const kap = () => { arka.remove(); document.removeEventListener("keydown", tuş); };
  const tuş = e => { if (e.key === "Escape" && kapat) { kap(); arka.onKapat && arka.onKapat(); } };
  document.addEventListener("keydown", tuş);
  if (kapat) arka.addEventListener("mousedown", e => { if (e.target === arka) { kap(); arka.onKapat && arka.onKapat(); } });
  arka.kapat = kap; arka.icerik = arka.firstElementChild;
  return arka;
}
export function acikModalVar() { return !!document.querySelector(".modal-arka"); }

let toastT = null;
export function toast(m, sure = 2600) {
  document.querySelectorAll(".toast").forEach(t => t.remove());
  const t = el(`<div class="toast panel">${m}</div>`); document.body.appendChild(t);
  clearTimeout(toastT); toastT = setTimeout(() => t.remove(), sure);
}

export function gecis(fn) {
  const g = document.getElementById("gecis"); g.classList.add("on");
  return new Promise(res => setTimeout(async () => { await fn(); requestAnimationFrame(() => setTimeout(() => { g.classList.remove("on"); res(); }, 60)); }, 480));
}

// Soru sor: doğruysa true. baslik/odul metinleri pencerede gösterilir.
export function soruSor(asama, {baslik = "Soru", odul = "", tercih = null, kapatilabilir = false} = {}) {
  const q = soruSec(asama, tercih);
  return new Promise(res => {
    const harf = "ABCDE";
    const foto = q.fotograf;
    const html = `<div class="soru">
      <div class="kat"><span class="eyebrow">${esc(baslik)}</span><span class="eyebrow">${esc(q.kategori)}</span></div>
      ${foto ? `<div class="qimg">${q.pdf ? `<object data="${esc(q.img)}" type="application/pdf"><a href="${esc(q.img)}" target="_blank" rel="noopener">Soruyu aç (PDF)</a></object>` : `<img src="${esc(q.img)}" alt="Yanlış defteri sorusu">`}</div>` : `<div class="metin">${esc(q.metin)}</div>`}
      ${odul ? `<div class="odul">Doğru cevap: ${odul}</div>` : ""}
      <div class="siklar ${foto ? "foto" : ""}">${q.siklar.map((s, i) => `<button class="sik" data-i="${i}"><b>${harf[i]}</b>${foto ? "" : `<span>${esc(s)}</span>`}</button>`).join("")}</div>
      <div class="cevap"></div></div>`;
    const m = modal(html, {kapat: kapatilabilir});
    let cevaplandi = false;
    m.onKapat = () => { if (!cevaplandi) res(null); };
    m.querySelectorAll(".sik").forEach(b => b.onclick = () => {
      if (cevaplandi) return; cevaplandi = true;
      const i = +b.dataset.i, ok = i === q.dogru;
      m.querySelectorAll(".sik").forEach((x, j) => { if (j === q.dogru) x.classList.add("dogru"); else if (j === i) x.classList.add("yanlis"); x.disabled = true; });
      sonucBildir(q, ok); ses(ok ? "dogru" : "yanlis");
      if (K && K.istatistik) { K.istatistik[ok ? "dogru" : "yanlis"]++; kaydet(); }
      m.querySelector(".cevap").innerHTML = `<div class="aciklama ${ok ? "iyi" : "kotu"}"><b>${ok ? "Doğru!" : "Yanlış."}</b> ${esc(q.aciklama || "")}</div>
        <div class="alt"><button class="btn ana devam">Devam</button></div>`;
      const d = m.querySelector(".devam"); d.focus();
      d.onclick = () => { m.kapat(); res(ok); };
    });
    // klavye: A-D
    const k = e => { const i = "abcd".indexOf(e.key.toLowerCase()); if (i >= 0 && !cevaplandi) m.querySelectorAll(".sik")[i]?.click(); else if (e.key === "Enter" && cevaplandi) m.querySelector(".devam")?.click(); };
    document.addEventListener("keydown", k);
    const eski = m.kapat; m.kapat = () => { document.removeEventListener("keydown", k); eski(); };
  });
}

export function onayla(baslik, metin, evet = "Evet", hayir = "Vazgeç") {
  return new Promise(res => {
    const m = modal(`<span class="eyebrow">Onay</span><h2>${esc(baslik)}</h2><p>${metin}</p><div class="alt"><button class="btn h">${esc(hayir)}</button><button class="btn ana e">${esc(evet)}</button></div>`);
    m.onKapat = () => res(false);
    m.querySelector(".e").onclick = () => { m.kapat(); res(true); };
    m.querySelector(".h").onclick = () => { m.kapat(); res(false); };
  });
}

export const bedelMetin = (m, KAYNAK) => Object.entries(m || {}).filter(([, v]) => v).map(([k, v]) => `${KAYNAK[k] ? KAYNAK[k].simge : ""} ${v} ${KAYNAK[k] ? KAYNAK[k].ad.toLowerCase() : k}`).join(" · ");
