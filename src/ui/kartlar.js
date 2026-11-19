// Savaş öncesi "Ordu kur" ekranı: asker kartları ve yardımcı komutan seçimi.
import {el, esc, toast} from "./arayuz.js";
import {BIRLIKLER} from "../veri/birlikler.js";
import {SILAHLAR} from "../veri/silahlar.js";
import {ULKELER} from "../veri/ulkeler.js";
import {KOMUTANLAR, KOMUTAN, PASIFLER, YETENEKLER} from "../veri/komutanlar.js";
import {K, birlikTanimi, yeniManga, kaydet} from "../kayit.js";
import {ses} from "../ses.js";
import {kilitAc} from "../girdi.js";

const SINIF_AD = {piyade: "Piyade", suvari: "Süvari", topcu: "Topçu", makineli: "Makineli", destek: "Destek", arac: "Araç", hava: "Hava"};
const ULKE_AD = id => (ULKELER[id] && ULKELER[id].ad) || {abd: "ABD", italya: "İtalya"}[id] || id;

// Sınıfa göre basit siluet (SVG)
export function ikon(sinif, renk = "#e9e2c8") {
  const P = {
    piyade: `<circle cx="32" cy="14" r="6"/><path d="M24 22h16l3 20h-5l-2 18h-4l-1-14-1 14h-4l-2-18h-5z"/><rect x="41" y="4" width="3" height="40" rx="1" transform="rotate(12 42 24)"/>`,
    suvari: `<path d="M8 40c4-8 14-12 26-11l10-6 6 4-4 3 2 8c0 5-3 9-8 10l2 12h-4l-3-11h-14l-4 11h-4l2-12c-4-1-7-4-7-8z"/><circle cx="30" cy="12" r="5"/><path d="M25 18h10l2 12H23z"/><rect x="36" y="2" width="2.5" height="26" rx="1" transform="rotate(30 37 15)"/>`,
    topcu: `<circle cx="20" cy="44" r="12" fill="none" stroke="currentColor" stroke-width="4"/><path d="M14 34l38-14 3 7-38 14z"/><path d="M26 44h30l-2 4H26z"/>`,
    makineli: `<path d="M10 30h34v8H10z"/><path d="M44 32h14v4H44z"/><path d="M20 38l-8 18M28 38v18M36 38l8 18" stroke="currentColor" stroke-width="3"/><rect x="18" y="22" width="16" height="8"/>`,
    destek: `<path d="M10 22h40l4 18H6z"/><circle cx="16" cy="46" r="7"/><circle cx="44" cy="46" r="7"/><path d="M12 22c4-12 32-12 36 0z" opacity=".6"/>`,
    arac: `<path d="M4 44l6-18h40l10 18-6 8H10z"/><rect x="20" y="16" width="20" height="10"/><path d="M40 20h16v4H40z"/>`,
    hava: `<path d="M6 30h52v4H6zM6 20h52v4H6z"/><path d="M28 14h8v34h-8z"/><path d="M22 46h20v4H22z"/>`,
  };
  return `<svg viewBox="0 0 64 64" width="56" height="56" fill="${renk}" style="color:${renk}" aria-hidden="true">${P[sinif] || P.piyade}</svg>`;
}

export function puanOf(d) {
  const m = d.maliyet || {};
  return Math.max(1, Math.round(((m.altin || 0) + (m.demir || 0) * 0.5 + (m.barut || 0) * 0.5 + (m.at || 0) * 1.2 + (m.yakit || 0)) / 18));
}

function istat(d) {
  const w = SILAHLAR[d.silah] || SILAHLAR.agizdan_tufek, y = SILAHLAR[d.yakin];
  const atis = w.tur === "top" ? 0.9 : w.tur === "makineli" ? 0.85 : Math.min(1, w.isabet * w.hasar * Math.max(1, w.sarjor) / Math.max(1, w.dolum) / 6) * (d.isabet || 1);
  return [
    ["Can", Math.min(1, d.can / 160)], ["Ateş", Math.min(1, atis)], ["Menzil", Math.min(1, Math.sqrt(w.menzil / 1400))],
    ["Yakın", y ? Math.min(1, y.hasar / 60 * (d.yakinHasar || 1)) : 0.1], ["Hız", Math.min(1, d.kosu / 9)], ["Moral", Math.min(1, (d.moral || 1) / 1.5)],
  ];
}
function silahListesi(d) {
  const L = [];
  if (d.silah && d.silah !== "tabanca") L.push(SILAHLAR[d.silah]?.ad);
  if (d.ikinci) L.push(SILAHLAR[d.ikinci]?.ad);
  if (d.yakin) L.push(SILAHLAR[d.yakin]?.ad);
  if (d.silah === "tabanca" || d.sinif === "suvari" || d.tabanca) L.push("Tabanca");
  return L.filter(Boolean).join(" · ");
}

export function kartHTML(d, {sayi, ust, alt, sec, kilit} = {}) {
  const renk = d.renk || "#3a4a3e";
  return `<div class="kart2 ${sec ? "sec" : ""} ${kilit ? "kilit" : ""}">
    <div class="kust" style="background:linear-gradient(160deg, ${renk}, #1a1712)">${ikon(d.sinif)}<span class="ksay">${sayi ?? d.boy}<small>asker</small></span>${ust ? `<span class="krozet">${ust}</span>` : ""}</div>
    <div class="kgov"><b>${esc(d.ad)}</b><small>${SINIF_AD[d.sinif] || ""} · ${d.yil || ""}</small>
    <div class="kbar">${istat(d).map(([k, v]) => `<span>${k}</span><i><em style="width:${Math.round(v * 100)}%"></em></i>`).join("")}</div>
    <small class="ksil">${esc(silahListesi(d))}</small>
    <small class="kacik">${esc(d.aciklama || "")}</small>
    ${alt ? `<div class="kalt">${alt}</div>` : ""}</div></div>`;
}

function komutanHTML(k, sec, kilit) {
  const y = YETENEKLER[k.yetenek];
  return `<div class="kom ${sec ? "sec" : ""} ${kilit ? "kilit" : ""}"><div class="kyuz" style="background:${k.renk}">${esc(k.ini)}</div>
    <div><b>${esc(k.ad)}</b><small>${esc(ULKE_AD(k.ulke))}${k.gercek ? " · tarihî" : ""}</small>
    <small><i>Pasif:</i> ${esc(PASIFLER[k.pasif])}</small><small><i>Yetenek — ${esc(y.ad)}:</i> ${esc(y.aciklama)}</small>
    ${kilit ? `<small class="kkilit">${esc(kilit)}</small>` : ""}</div></div>`;
}

// op: {kalici, ordu, gorev}. Dönüş: {ordu: [kayıt], komutanlar: [id]} ya da null (vazgeç)
export function orduKur(op) {
  kilitAc();
  const g = op.gorev, slot = g.slot || 6, yil = g.yil || 1866;
  const butce = op.kalici ? Infinity : 6 + slot * 3;
  const secilen = op.kalici ? op.ordu.filter(r => r.secili && r.asker > 0).slice(0, slot).map(r => r.id) : (op.ordu || []).map(r => r.tur);
  const komSec = (op.kalici ? (K.komutanSecili || ["demir"]) : ["demir"]).filter(id => KOMUTAN[id]).slice(0, 2);
  let filtre = "hepsi";
  return new Promise(res => {
    const k = el(`<div class="ordukur modal-arka"><div class="modal kagit genis" role="dialog" aria-modal="true">
      <div class="ok-bas"><div><span class="eyebrow">Savaş öncesi · ${esc(g.ad || "")}</span><h2>Ordunu kur</h2>
      <p class="soluk">${op.kalici ? `Savaşa götüreceğin bölükleri seç (en fazla <b>${slot}</b>). Kartlara tıkla.` : `Komuta puanınla asker kartları seç (en fazla <b>${slot}</b> bölük). Aynı karttan birden çok alabilirsin.`} Sonra en fazla iki yardımcı komutan seç.</p></div>
      <div class="ok-durum"></div></div>
      <div class="ok-sekme"></div>
      <div class="ok-govde"><div class="ok-kartlar"></div><div class="ok-yan"><h3>Seçilen bölükler</h3><div class="ok-secilen"></div><h3 style="margin-top:14px">Yardımcı komutanlar <span class="soluk" style="font-size:13px">(en fazla 2)</span></h3><div class="ok-kom"></div></div></div>
      <div class="alt"><button class="btn vaz">Vazgeç</button><button class="btn ana tamam">Konuşlanmaya geç →</button></div></div></div>`);
    document.body.appendChild(k);
    const q = s => k.querySelector(s);
    const tanimlar = op.kalici ? null : Object.entries(BIRLIKLER).filter(([id, d]) => (d.yil || 1860) <= yil && d.sinif !== "deniz" && !(d.sinif === "hava" && yil < 1912)).map(([id, d]) => ({...d, id}));
    const harcanan = () => op.kalici ? 0 : secilen.reduce((t, id) => t + puanOf(BIRLIKLER[id]), 0);
    const ciz = () => {
      q(".ok-durum").innerHTML = op.kalici ? `<div class="puan"><span>Bölük</span><b>${secilen.length}/${slot}</b></div>` : `<div class="puan"><span>Komuta puanı</span><b>${butce - harcanan()}</b></div><div class="puan"><span>Bölük</span><b>${secilen.length}/${slot}</b></div>`;
      // sekmeler
      const siniflar = ["hepsi", ...new Set((op.kalici ? op.ordu.map(r => birlikTanimi(r.tur).sinif) : tanimlar.map(d => d.sinif)))];
      q(".ok-sekme").innerHTML = siniflar.map(s => `<button class="btn kucuk ${s === filtre ? "ana" : ""}" data-s="${s}">${s === "hepsi" ? "Hepsi" : SINIF_AD[s] || s}</button>`).join("");
      q(".ok-sekme").querySelectorAll("button").forEach(b => b.onclick = () => { filtre = b.dataset.s; ciz(); });
      // kartlar
      const K2 = q(".ok-kartlar"); K2.innerHTML = "";
      if (op.kalici) {
        for (const r of op.ordu) {
          const d = birlikTanimi(r.tur); if (filtre !== "hepsi" && d.sinif !== filtre) continue;
          const sec = secilen.includes(r.id);
          const yildiz = "★".repeat(Math.min(5, Math.floor((r.tecrube || 0) / 2)));
          const c = el(`<button class="kartbtn">${kartHTML({...d, ad: r.ad + " · " + d.ad}, {sayi: r.asker, ust: yildiz || null, sec, kilit: r.asker <= 0, alt: r.revir ? `<span class="cip kotu">revirde ${r.revir}</span>` : ""})}</button>`);
          c.disabled = r.asker <= 0;
          c.onclick = () => { if (sec) secilen.splice(secilen.indexOf(r.id), 1); else if (secilen.length < slot) secilen.push(r.id); else return toast(`En fazla ${slot} bölük götürebilirsin.`); ses("tik"); ciz(); };
          K2.appendChild(c);
        }
      } else {
        for (const d of tanimlar) {
          if (filtre !== "hepsi" && d.sinif !== filtre) continue;
          const p = puanOf(d), adet = secilen.filter(x => x === d.id).length;
          const c = el(`<button class="kartbtn">${kartHTML(d, {ust: adet ? `×${adet}` : null, sec: adet > 0, alt: `<span class="kbedel">◆ ${p} puan</span>`})}</button>`);
          c.onclick = () => { if (secilen.length >= slot) return toast(`En fazla ${slot} bölük.`); if (harcanan() + p > butce) return toast("Komuta puanı yetmiyor."); secilen.push(d.id); ses("tik"); ciz(); };
          K2.appendChild(c);
        }
      }
      // seçilenler
      const S = q(".ok-secilen"); S.innerHTML = secilen.length ? "" : `<p class="soluk">Henüz bölük seçilmedi.</p>`;
      secilen.forEach((x, i) => {
        const r = op.kalici ? op.ordu.find(r => r.id === x) : null, d = op.kalici ? birlikTanimi(r.tur) : BIRLIKLER[x];
        const b = el(`<div class="ok-sat"><span class="ikon-k" style="background:${d.renk || "#3a4a3e"}">${ikon(d.sinif)}</span><span><b>${esc(r ? r.ad : d.ad)}</b><small>${esc(d.ad)} · ${r ? r.asker : d.boy} asker</small></span><button class="btn kucuk" aria-label="Çıkar">×</button></div>`);
        b.querySelector("button").onclick = () => { secilen.splice(i, 1); ciz(); }; S.appendChild(b);
      });
      // komutanlar
      const KM = q(".ok-kom"); KM.innerHTML = "";
      for (const km of KOMUTANLAR) {
        const acik = op.kalici ? (km.bedel === 0 || (K.komutanlar || []).includes(km.id)) : true;
        const donemDisi = km.yil > yil + 2;
        const kilit = !acik ? `Karargâh'tan davet et (${km.bedel} şan)` : donemDisi ? `${km.yil} yılından sonra` : null;
        const sec = komSec.includes(km.id);
        const c = el(`<button class="kartbtn">${komutanHTML(km, sec, kilit)}</button>`);
        c.disabled = !!kilit;
        c.onclick = () => { if (sec) komSec.splice(komSec.indexOf(km.id), 1); else if (komSec.length < 2) komSec.push(km.id); else return toast("En fazla iki yardımcı komutan."); ses("tik"); ciz(); };
        KM.appendChild(c);
      }
      q(".tamam").disabled = !secilen.length;
    };
    ciz();
    const kapat = v => { k.remove(); res(v); };
    q(".vaz").onclick = () => kapat(null);
    q(".tamam").onclick = () => {
      let ordu;
      if (op.kalici) { for (const r of op.ordu) r.secili = secilen.includes(r.id); K.komutanSecili = komSec.slice(); kaydet(); ordu = op.ordu.filter(r => r.secili); }
      else { K.ordu = secilen.map(id => { const r = yeniManga(id); r.secili = true; return r; }); ordu = K.ordu; K.kaynak.ekmek = Math.max(K.kaynak.ekmek || 0, op.ekmekAz ? Math.ceil(ordu.length / 2) : ordu.length + 2); }
      kapat({ordu, komutanlar: komSec.slice()});
    };
  });
}
