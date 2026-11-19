// Ana menü, mod kurulumları, ayarlar ve nasıl oynanır.
import {motor} from "./motor.js";
import {Kamp} from "./kamp.js";
import {UI, el, esc, modal, toast, gecis, temizle, onayla} from "./ui/arayuz.js";
import {K, AYAR, ayarKaydet, yukle, yeniSefer, kayitVar, seferSil, geciciKayit, yeniManga} from "./kayit.js";
import {OYUN_ADI, SURUM, GRAFIK} from "./veri/oyun.js";
import {MODLAR, TARIHI, BOLUMLER} from "./veri/hikaye.js";
import {HARITALAR, IKLIMLER, HAVALAR, SAATLER, agirlikliSec} from "./veri/haritalar.js";
import {ULKELER} from "./veri/ulkeler.js";
import {BIRLIKLER, donem} from "./veri/birlikler.js";
import {TEKNOLOJILER} from "./veri/teknoloji.js";
import {gorevBaslat} from "./akis.js";
import {sesBaslat, sesSeviye} from "./ses.js";
import {YANLIS, yanlisYukle} from "./sorular/soru.js";
import {rng, hashStr} from "./dunya/gurultu.js";
import {kilitBirak} from "./girdi.js";

export function anaMenu() {
  kilitBirak();
  temizle();
  motor.ekran(new Kamp(true));
  const devam = kayitVar();
  const m = el(`<div id="menu"><div class="sol">
    <div class="logo">${esc(OYUN_ADI)}<small>1860 – 1918 · SAVUNMA SAVAŞI</small></div>
    <div class="modlar"></div>
    <div class="menu-alt"><button class="btn ayar">Ayarlar</button><button class="btn nasil">Nasıl oynanır?</button></div>
    <p class="soluk" style="font-size:12px;margin:0">${esc(SURUM)}</p></div><div></div></div>`);
  const L = m.querySelector(".modlar");
  for (const md of MODLAR) {
    const b = el(`<button class="mod" ${md.yakinda ? "disabled" : ""}><div><b>${esc(md.ad)}</b><span>${esc(md.tanim)}</span></div>${md.yakinda ? "<i>YAKINDA</i>" : md.id === "sefer" && devam ? "<i>DEVAM</i>" : ""}</button>`);
    b.onclick = () => { sesBaslat(); modAc(md.id); };
    L.appendChild(b);
  }
  m.querySelector(".ayar").onclick = ayarlar;
  m.querySelector(".nasil").onclick = nasil;
  UI.appendChild(m);
}

async function modAc(id) {
  if (id === "sefer") return seferAc();
  if (id === "serbest") return serbest();
  if (id === "tarihi") return tarihi();
  const yil = 1870 + Math.floor(Math.random() * 46);
  const hazir = {
    dalga: () => ({ad: "Dalga Savunması", harita: rastgele(["tepe", "koy", "gecit", "kopru", "vaha"]), hava: "acik", saat: "gunduz", yil, sonsuz: true, slot: 7, skorAnahtar: "savassisi-dalga-en", brifing: "Saldırılar bitmeyecek. Ne kadar dayanabilirsin?"}),
    kopru: () => ({ad: "Köprü Tutma", harita: "kopru", hava: "sis", saat: "safak", yil: 1870, slot: 6, sure: 600, dalgalar: dalgaUret(1870, 1.4, 540), brifing: "Tek köprü. Kimse geçmeyecek."}),
    baskin: () => ({ad: "Kamp Baskını", harita: "kamp", hava: "acik", saat: "gece", yil: 1880, slot: 6, sure: 480, dalgalar: dalgaUret(1880, 1.1, 420, true), brifing: "Gece yarısı nöbetçiler alarm verdi! Ordugâh kuşatılıyor. Fişekleri kullan."}),
    kusatma: () => ({ad: "Kuşatma Altında", harita: "kale", hava: "kar", saat: "gunduz", yil: 1877, slot: 7, sure: 660, ekmekAz: true, dalgalar: dalgaUret(1877, 1.6, 600), brifing: "Kale aylardır kuşatma altında. Ekmek az, düşman çok. Dayan."}),
    gunluk: () => gunluk(),
    tatbikat: () => ({ad: "Tatbikat", harita: rastgele(["tepe", "koy", "kopru"]), hava: "acik", saat: "gunduz", yil, slot: 6, sure: 420, dalgalar: dalgaUret(yil, 0.9, 380), tercih: "yanlis", brifing: "Eğitim savaşı: sorular yanlış defterinden gelir."}),
  }[id];
  if (!hazir) return;
  const g = hazir();
  if (id === "tatbikat" && !AYAR.soru.yanlis) toast("Yanlış defteri ayarlardan kapalı; sorular olağan kaynaklardan gelecek.", 4000);
  if (id === "tatbikat" && AYAR.soru.yanlis && YANLIS.durum !== "ok") { yanlisYukle(true); toast("Yanlış defteri yükleniyor…"); }
  baslatGecici(g);
}
const rastgele = a => a[Math.floor(Math.random() * a.length)];

function seferAc() {
  const var_ = yukle();
  if (!var_) { yeniSefer(); return kampa(); }
  const m = modal(`<span class="eyebrow">Ana Sefer</span><h2>Kayıtlı sefer bulundu</h2>
    <p>${K.bolum >= BOLUMLER.length ? "Sefer tamamlanmış." : `${K.bolum + 1}. bölüm: <b>${esc(BOLUMLER[K.bolum].ad)}</b> (${BOLUMLER[K.bolum].yil})`} · ${K.ordu.length} manga · ${K.istatistik.zafer} zafer</p>
    <div class="alt"><button class="btn yeni">Yeni sefer başlat</button><button class="btn ana devam">Devam et</button></div>`);
  m.querySelector(".devam").onclick = () => { m.kapat(); kampa(); };
  m.querySelector(".yeni").onclick = async () => { m.kapat(); if (await onayla("Yeni sefer?", "Kayıtlı seferin silinecek.", "Sil ve başla")) { seferSil(); yeniSefer(); kampa(); } };
}
function kampa() { gecis(() => { temizle(); motor.ekran(new Kamp(false)); }); }

// Serbest modlar için geçici ordu ve kaynak
function geciciOrdu(yil, slot, ekmekAz) {
  const d = donem(yil);
  const tek = {}; for (const t of TEKNOLOJILER) if (t.yil <= yil) tek[t.id] = true;
  geciciKayit({kaynak: {ekmek: 0, altin: 0, un: 0}, tek, ozel: {}, ordu: [], firin: 1, istatistik: {zafer: 0, yenilgi: 0, dusen: 0, kayip: 0, dogru: 0, yanlis: 0}});
  const turler = [d.piyade, d.piyade, d.hafif, d.suvari[0], d.top, d.mg || d.piyade, yil >= 1866 ? "sancak_muhafiz" : d.piyade, yil >= 1870 ? "gozetleme_balonu" : d.suvari[1] || d.piyade, "sihhiyeci"];
  // önerilen ordu (kart ekranında değiştirilebilir)
  for (const t of turler.slice(0, Math.min(slot, 5))) if (t && BIRLIKLER[t]) K.ordu.push(yeniManga(t));
  K.ordu.forEach(r => r.secili = true);
  K.kaynak.ekmek = ekmekAz ? Math.ceil(slot / 2) : slot + 2;
}
function baslatGecici(g) {
  const iklim = g.iklim || HARITALAR[g.harita].iklim;
  const biz = g.biz || "ardicova", dusman = g.dusman || (g.yil > 1910 ? "demirmark" : "demirmark");
  const gorev = {slot: 6, ...g, iklim, biz, dusman, dusmanAd: ULKELER[dusman].ad};
  geciciOrdu(gorev.yil, gorev.slot, g.ekmekAz);
  gorevBaslat(gorev, {ordu: K.ordu, kalici: false, tercih: g.tercih, ekmekAz: g.ekmekAz, donus: () => anaMenu(), vazgec: () => {}});
}

export function dalgaUret(yil, zorluk = 1, sure = 420, gece = false) {
  const D = []; let t = 5; const kanatlar = ["sol", "merkez", "sag"];
  const turler = {piyade: 5, hafif: 2, suvari: 2, top: 1.2, mg: yil >= 1866 ? 1 : 0, agir: yil >= 1880 ? 0.6 : 0, arac: yil >= 1912 ? 0.6 : 0};
  let i = 0;
  while (t < sure * 0.75) {
    const tur = i === 0 ? "piyade" : agirlikliSec(turler);
    const adet = Math.max(1, Math.round((tur === "piyade" ? 2 : 1) * zorluk * (1 + i * 0.12) + (Math.random() < 0.3 ? 1 : 0)));
    D.push({t: Math.round(t), tur, adet: tur === "arac" ? 1 : adet, kanat: gece ? rastgele(kanatlar) : kanatlar[(i + 1) % 3]});
    t += 45 + Math.random() * 30; i++;
  }
  return D;
}

function gunluk() {
  const d = new Date(), gun = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const r = rng(hashStr(gun));
  const harita = ["tepe", "gecit", "kopru", "koy", "vaha", "kale", "kiyi", "siper"][Math.floor(r() * 8)];
  const iklim = HARITALAR[harita].iklim;
  const hava = agirlikliSec(IKLIMLER[iklim].hava, r);
  const saat = ["safak", "gunduz", "aksam", "gece"][Math.floor(r() * 4)];
  const yil = harita === "siper" ? 1915 + Math.floor(r() * 3) : 1862 + Math.floor(r() * 52);
  const R0 = Math.random; Math.random = r; const dalgalar = dalgaUret(yil, 1.2, 480); Math.random = R0;
  if (harita === "kiyi") dalgalar.forEach(x => x.cikarma = true);
  return {ad: `Günün Görevi · ${gun}`, harita, hava, saat, yil, slot: 7, sure: 540, dalgalar, seed: hashStr(gun), skorAnahtar: "savassisi-gunluk-" + gun, brifing: "Bugün herkes aynı savaşta. En yüksek skoru yap!"};
}

function serbest() {
  const sec = (ad, ad2, obj, v) => `<label>${ad}<select class="${ad2}">${Object.entries(obj).map(([k, o]) => `<option value="${k}" ${k === v ? "selected" : ""}>${esc(o.ad)}</option>`).join("")}</select></label>`;
  const m = modal(`<span class="eyebrow">Serbest Savunma</span><h2>Savaşını kur</h2>
    <div class="form">${sec("Harita", "harita", HARITALAR, "tepe")}${sec("İklim", "iklim", {"": {ad: "Haritanın iklimi"}, ...IKLIMLER}, "")}${sec("Hava", "hava", HAVALAR, "acik")}${sec("Günün saati", "saat", SAATLER, "gunduz")}
    <label>Yıl: <b class="yilg">1870</b><input type="range" class="yil" min="1860" max="1918" value="1870"></label>
    ${sec("Biz", "biz", ULKELER, "ardicova")}${sec("Düşman", "dusman", ULKELER, "demirmark")}
    <label>Zorluk<select class="zor"><option value="0.7">Kolay</option><option value="1" selected>Orta</option><option value="1.4">Zor</option><option value="1.9">Çok zor</option></select></label>
    <label>Manga sayısı<select class="slot">${[4, 5, 6, 7, 8, 9].map(n => `<option ${n === 6 ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <label>Ekmek<select class="ekmek"><option value="">Bol</option><option value="az">Kıt</option></select></label></div>
    <div class="alt"><button class="btn kpt">Vazgeç</button><button class="btn ana basla">Savaşa hazırlan →</button></div>`);
  m.icerik.style.width = "min(860px,100%)";
  const y = m.querySelector(".yil"); y.oninput = () => m.querySelector(".yilg").textContent = y.value;
  m.querySelector(".kpt").onclick = () => m.kapat();
  m.querySelector(".basla").onclick = () => {
    const v = c => m.querySelector("." + c).value;
    const yil = +v("yil"), harita = v("harita");
    const dalgalar = dalgaUret(yil, +v("zor"), 480, v("saat") === "gece");
    if (harita === "kiyi") dalgalar.forEach(x => x.cikarma = true);
    m.kapat();
    baslatGecici({ad: `Serbest Savunma · ${HARITALAR[harita].ad}`, harita, iklim: v("iklim") || undefined, hava: v("hava"), saat: v("saat"), yil, biz: v("biz"), dusman: v("dusman"), slot: +v("slot"), sure: 540, dalgalar, ekmekAz: v("ekmek") === "az"});
  };
}
function tarihi() {
  const m = modal(`<span class="eyebrow">Tarihi Savunmalar</span><h2>Gerçek savunmalardan esinlenen senaryolar</h2><p class="soluk">Birlikler, hava ve arazi oyun için sadeleştirilmiştir.</p>
    <div class="liste" style="display:grid;gap:8px"></div><div class="alt"><button class="btn kpt">Kapat</button></div>`);
  m.querySelector(".kpt").onclick = () => m.kapat();
  for (const t of TARIHI) {
    const b = el(`<button class="secenek" style="color:inherit;background:#f6edd3;border-color:#cdbb8c"><b style="color:#211d16">${esc(t.ad)}</b><span class="cip" style="color:#5d4a1c">${esc(ULKELER[t.biz].ad)} ↔ ${esc(ULKELER[t.dusman].ad)}</span><span style="color:#6b6250">${esc(t.brifing)}</span></button>`);
    b.onclick = () => { m.kapat(); baslatGecici({...t}); };
    m.querySelector(".liste").appendChild(b);
  }
}

function ayarlar() {
  const m = modal(`<span class="eyebrow">Ayarlar</span><h2>Ayarlar</h2>
    <div class="ayar-satir"><span>Grafik</span><select class="grafik">${Object.entries(GRAFIK).map(([k, g]) => `<option value="${k}" ${AYAR.grafik === k ? "selected" : ""}>${g.ad} · ~${g.asker} asker</option>`).join("")}</select></div>
    <div class="ayar-satir"><span>Fare hassasiyeti</span><input type="range" class="has" min="0.3" max="2.5" step="0.1" value="${AYAR.hassasiyet}"></div>
    <div class="ayar-satir"><span>Ses</span><input type="range" class="ses" min="0" max="1" step="0.05" value="${AYAR.ses}"></div>
    <div class="ayar-satir"><span>Soru kaynakları</span><div>
      <label><input type="checkbox" class="s-tarih" ${AYAR.soru.tarih ? "checked" : ""}> Tarih soruları</label><br>
      <label><input type="checkbox" class="s-lgs" ${AYAR.soru.lgs ? "checked" : ""}> LGS (Türkçe, Matematik, Fen, İnkılap, Din)</label><br>
      <label><input type="checkbox" class="s-yanlis" ${AYAR.soru.yanlis ? "checked" : ""}> Yanlış defteri (Notion) <span class="soluk ydur">${YANLIS.durum === "ok" ? `· ${YANLIS.sorular.length} soru` : YANLIS.durum === "hata" ? "· yüklenemedi: " + esc(YANLIS.hata) : YANLIS.durum === "yukleniyor" ? "· yükleniyor" : ""}</span></label></div></div>
    <p class="soluk" style="font-size:13px">Aşama 1'de ağırlıklı Matematik ve mantık, Aşama 2'de Fen, Aşama 4'te Türkçe, İnkılap ve Din soruları gelir. Özel ganimet sandıkları yanlış defterinden sorar. Yanlış defteri yalnızca Cloudflare'deki sürümde (NOTION_TOKEN tanımlıyken) çalışır.</p>
    <div class="alt"><button class="btn ana kpt">Kaydet</button></div>`);
  m.querySelector(".kpt").onclick = () => {
    const q = c => m.querySelector("." + c);
    AYAR.grafik = q("grafik").value; AYAR.hassasiyet = +q("has").value; sesSeviye(+q("ses").value);
    AYAR.soru = {tarih: q("s-tarih").checked, lgs: q("s-lgs").checked, yanlis: q("s-yanlis").checked};
    if (!AYAR.soru.tarih && !AYAR.soru.lgs && !AYAR.soru.yanlis) AYAR.soru.tarih = true;
    ayarKaydet(); motor.ayarUygula(); if (AYAR.soru.yanlis) yanlisYukle(true);
    m.kapat(); toast("Ayarlar kaydedildi. Grafik ayarı bir sonraki savaşta tam uygulanır.");
  };
}
function nasil() {
  modal(`<span class="eyebrow">Nasıl oynanır?</span><h2>${esc(OYUN_ADI)}</h2>
    <p>Bu bir <b>savunma</b> savaşı oyunu. Her görev dört aşamadan oluşur:</p>
    <ol style="line-height:1.6">
      <li><b>Konuşlanma:</b> Mangalarını sarı alana yerleştir. Soruları doğru cevapla, kazandığın hazırlık puanıyla keşif yap (savaş sisi kalkar), siper kaz, topçu hakkı al.</li>
      <li><b>Son hazırlık:</b> Mangaları teftiş et. Doğru cevap = bakımlı silah, tam cephane, yüksek moral. Ekmek dağıt: aç manga düşük moralle savaşır.</li>
      <li><b>Savaş:</b> Asker olarak 1. şahıs ya da komutan olarak 3. şahıs oyna; V ile geçiş yaparsın. Bu aşamada soru yok.</li>
      <li><b>Ganimet:</b> Savaş alanında sandıkları aç ve yaralıları kurtar (her biri bir soru), sonra kampa dön.</li>
    </ol>
    <p><b>Kamp:</b> Fırında ekmek pişir, Harp Okulu'nda teknoloji araştır, Kışla/Ahır/Tophane'de birlik üret, kendi birliğini tasarla, Harita Masası'ndan sefere çık.</p>
    <p><b>Moral ve ekmek:</b> Moral 20'nin altına düşen manga bozulur ve kaçar. Ekmek, sancak, siper ve komutanın yakınlığı morali korur. Yağmur ve kar morali düşürür; yağmur ağızdan dolma tüfeklerde tutukluk yapar.</p>
    <p><b>Savaş sisi:</b> Düşmanı ancak askerlerinin gördüğü yerde görürsün. Süvari, gözcü, balon, uçak ve işaret fişeği görüşü artırır; barut dumanı ve sis azaltır.</p>
    <div class="alt"><button class="btn ana" onclick="this.closest('.modal-arka').remove()">Anladım</button></div>`);
}
