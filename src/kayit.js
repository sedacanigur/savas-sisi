// Kayıt: kaynaklar, teknolojiler, ordu (mangalar), kendi birlikler, sefer ilerlemesi, ayarlar.
import {BASLANGIC_KAYNAK, VARSAYILAN_AYAR} from "./veri/oyun.js";
import {BIRLIKLER} from "./veri/birlikler.js";
import {TEKNOLOJILER, TEK} from "./veri/teknoloji.js";
import {SILAHLAR} from "./veri/silahlar.js";

const KEY = "savassisi-kayit-v1", AYAR_KEY = "savassisi-ayar-v1";
const sakla = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const getir = k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };

export let K = null;      // aktif kayıt (sefer)
export let AYAR = {...VARSAYILAN_AYAR, ...(getir(AYAR_KEY) || {})};
AYAR.soru = {...VARSAYILAN_AYAR.soru, ...(AYAR.soru || {})};
export function ayarKaydet() { sakla(AYAR_KEY, AYAR); }

let mangaNo = 1;
const SIRA = ["1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10.", "11.", "12."];
export function yeniManga(tur, ozel) {
  const d = birlikTanimi(tur, ozel);
  const n = mangaNo++;
  const tip = {piyade: "Bölük", suvari: "Süvari Takımı", topcu: "Batarya", makineli: "Makineli Takımı", destek: "Destek", arac: "Araç Takımı", hava: "Filo"}[d.sinif] || "Takım";
  return {id: "m" + Date.now().toString(36) + n, tur, ad: `${SIRA[(n - 1) % 12]} ${tip}`, asker: d.boy, boy: d.boy, tecrube: 0, yarali: 0, secili: true};
}

export function yeniSefer() {
  mangaNo = 1;
  K = {surum: 1, kaynak: {...BASLANGIC_KAYNAK}, tek: {}, arastirma: null, bolum: 0, ordu: [], ozel: {}, firin: 1,
    olay: "giris", rutbe: 0, gorevSayisi: 0, istatistik: {zafer: 0, yenilgi: 0, dusen: 0, kayip: 0, dogru: 0, yanlis: 0}};
  for (const t of ["hat_piyadesi", "hat_piyadesi", "hat_piyadesi", "hafif_suvari", "sahra_topu"]) K.ordu.push(yeniManga(t));
  K.ordu[3].secili = false;
  kaydet();
  return K;
}
export function yukle() { K = getir(KEY); if (K) mangaNo = K.ordu.length + 1; return K; }
export function kaydet() { if (K) sakla(KEY, K); }
export function kayitVar() { return !!getir(KEY); }
export function seferSil() { try { localStorage.removeItem(KEY); } catch (e) {} K = null; }
export function geciciKayit(k) { K = k; mangaNo = k.ordu.length + 1; } // serbest modlar: kaydedilmeyen ordu

// Teknolojiye ve kendi tasarımlara göre bir birliğin güncel tanımı
export function birlikTanimi(id, ozel) {
  const kay = ozel || (K && K.ozel) || {};
  const tek = (K && K.tek) || {};
  const temel = kay[id] || BIRLIKLER[id];
  if (!temel) return BIRLIKLER.hat_piyadesi;
  const d = {...temel, id, ozel: {...(temel.ozel || {})}};
  // silah yükseltmeleri (yalnızca oyuncunun tarafı için anlamlı; düşman kendi tanımını kullanır)
  if (!ozel) for (const t of TEKNOLOJILER) if (tek[t.id] && t.yukselt && t.yukselt[d.silah] && !temel.ozelTasarim) {
    const yeni = t.yukselt[d.silah]; if (SILAHLAR[yeni]) d.silah = yeni;
  }
  if (!ozel && tek.kask && d.sinif === "piyade") d.can += 20;
  if (!ozel && tek.bomba && d.silah === "sarjorlu_tufek" && !d.ikinci) d.ikinci = "el_bombasi";
  return d;
}

export function tekAcik(id) { return !id || !!(K && K.tek[id]); }
export function binaAcik(b) { return !b.tek || tekAcik(b.tek); }
export function tekArastirilabilir(t) { return !K.tek[t.id] && t.on.every(o => K.tek[o]) && !(K.arastirma && K.arastirma.id === t.id); }

export function yeterli(m) { return Object.entries(m || {}).every(([k, v]) => (K.kaynak[k] || 0) >= v); }
export function harca(m) { if (!yeterli(m)) return false; for (const [k, v] of Object.entries(m || {})) K.kaynak[k] -= v; kaydet(); return true; }
export function ekle(m) { for (const [k, v] of Object.entries(m || {})) K.kaynak[k] = Math.max(0, (K.kaynak[k] || 0) + v); kaydet(); }

export function arastirmaBitir() {
  if (K.arastirma) { K.tek[K.arastirma.id] = true; const ad = TEK[K.arastirma.id].ad; K.arastirma = null; kaydet(); return ad; }
  return null;
}
