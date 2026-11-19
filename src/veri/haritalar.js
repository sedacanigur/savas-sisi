// İklimler, hava durumları, günün saatleri ve harita düzenleri.

export const IKLIMLER = {
  iliman: {cim: "#7f9a4a", ad: "Ilıman", zemin: ["#5f7a3a", "#738a45", "#8a8a5a"], toprak: "#6b5a3e", agac: "yaprak", agacYogun: 1, kayaYogun: 0.5, sicaklik: 1,
    hava: {acik: 4, bulutlu: 3, yagmur: 2, sis: 2, firtina: 1}},
  karli: {cim: null, ad: "Karlı dağ", zemin: ["#d9dee3", "#c9d0d6", "#f2f4f6"], toprak: "#8a8f94", agac: "cam", agacYogun: 0.9, kayaYogun: 1, sicaklik: 0,
    hava: {acik: 3, bulutlu: 3, kar: 4, sis: 2, firtina: 1}},
  col: {cim: "#b8a46a", ad: "Kurak / çöl", zemin: ["#c9a96b", "#d6b97d", "#b8955a"], toprak: "#a8854f", agac: "palmiye", agacYogun: 0.15, kayaYogun: 0.6, sicaklik: 2,
    hava: {acik: 7, bulutlu: 2, firtina: 1, sis: 0}},
  bataklik: {cim: "#6a8240", ad: "Orman ve bataklık", zemin: ["#41552d", "#4d6233", "#5d6b3f"], toprak: "#4a3f2c", agac: "yaprak", agacYogun: 1.8, kayaYogun: 0.2, sicaklik: 1,
    hava: {acik: 2, bulutlu: 3, yagmur: 3, sis: 4}},
  kiyi: {cim: "#8e9a58", ad: "Kıyı", zemin: ["#6f8a46", "#86935a", "#d8c793"], toprak: "#7b6646", agac: "cali", agacYogun: 0.6, kayaYogun: 0.8, sicaklik: 1,
    hava: {acik: 5, bulutlu: 3, yagmur: 1, sis: 2, firtina: 1}},
  bozkir: {cim: "#a9a564", ad: "Bozkır", zemin: ["#9a9a5c", "#a9a265", "#8a8550"], toprak: "#7b6c48", agac: "cali", agacYogun: 0.25, kayaYogun: 0.4, sicaklik: 1,
    hava: {acik: 5, bulutlu: 3, yagmur: 1, sis: 1, firtina: 1}},
};

// gorus: görüş çarpanı · isabet: isabet çarpanı · hiz: hareket çarpanı · tutukluk: ek tutukluk çarpanı
// moral: savaş başında moral değişimi · ekmek: ekmek tüketim çarpanı · sisYog: sahne sisi yoğunluğu
export const HAVALAR = {
  acik:    {ad: "Açık", gorus: 1, isabet: 1, hiz: 1, tutukluk: 1, moral: 0, ekmek: 1, sisYog: 0.0016, yagis: null, ruzgar: 2, bulut: 0.1},
  bulutlu: {ad: "Bulutlu", gorus: 0.9, isabet: 0.97, hiz: 1, tutukluk: 1, moral: 0, ekmek: 1, sisYog: 0.0024, yagis: null, ruzgar: 4, bulut: 0.6},
  yagmur:  {ad: "Yağmur", gorus: 0.7, isabet: 0.85, hiz: 0.85, tutukluk: 3, moral: -8, ekmek: 1, sisYog: 0.004, yagis: "yagmur", ruzgar: 6, bulut: 0.9, camur: true},
  kar:     {ad: "Kar", gorus: 0.65, isabet: 0.85, hiz: 0.75, tutukluk: 1.5, moral: -10, ekmek: 1.5, sisYog: 0.0045, yagis: "kar", ruzgar: 4, bulut: 0.9},
  sis:     {ad: "Sis", gorus: 0.4, isabet: 0.9, hiz: 0.95, tutukluk: 1.3, moral: -4, ekmek: 1, sisYog: 0.011, yagis: null, ruzgar: 1, bulut: 0.7},
  firtina: {ad: "Fırtına", gorus: 0.55, isabet: 0.7, hiz: 0.8, tutukluk: 3, moral: -12, ekmek: 1.2, sisYog: 0.006, yagis: "yagmur", ruzgar: 12, bulut: 1, camur: true},
};

export const SAATLER = {
  safak:  {ad: "Şafak", gunes: 8, renk: "#ffb27a", gok: ["#f3b98a", "#7d95b8"], isik: 0.75, gorus: 0.8},
  gunduz: {ad: "Gündüz", gunes: 50, renk: "#fff4e0", gok: ["#cfe0ef", "#6f9ccf"], isik: 1.1, gorus: 1},
  aksam:  {ad: "Akşam", gunes: 10, renk: "#ff9a5c", gok: ["#f2a46a", "#5e6f9c"], isik: 0.7, gorus: 0.8},
  gece:   {ad: "Gece", gunes: -20, renk: "#8fa6d6", gok: ["#1b2436", "#0b1120"], isik: 0.32, gorus: 0.45},
};

// Harita düzenleri. Koordinatlar metre; z+ güney (biz), z- kuzey (düşman gelir).
// tip: arazi üreticisinin kullandığı düzen
export const HARITALAR = {
  tepe:   {ad: "Ardıç Tepesi", tip: "tepe", iklim: "iliman", tanim: "Ormanlık yamaçlar arasında bir sırt. Sırtı tutan vadiyi tutar."},
  gecit:  {ad: "Kartal Geçidi", tip: "gecit", iklim: "karli", tanim: "İki dağ arasında dar bir geçit. Süvariye dar, topçuya cennet."},
  kopru:  {ad: "Söğütlü Köprü", tip: "kopru", iklim: "bataklik", tanim: "Bataklık nehrin tek köprüsü. Düşman ya köprüden ya sığ geçitten gelir."},
  koy:    {ad: "Karaağaç Köyü", tip: "koy", iklim: "bozkir", tanim: "Taş evler ve bahçe duvarları; savunmaya elverişli bir köy."},
  vaha:   {ad: "Zemzem Vahası", tip: "vaha", iklim: "col", tanim: "Kum tepeleri arasındaki tek su kaynağı. Sıcak ve açık arazi."},
  kale:   {ad: "Taşburun Kalesi", tip: "kale", iklim: "iliman", tanim: "Eski bir kale ve önündeki tabyalar."},
  kiyi:   {ad: "Mavi Koy", tip: "kiyi", iklim: "kiyi", tanim: "Düşman sandallarla kıyıya çıkar. Yamaçları tut."},
  siper:  {ad: "Kırmızı Sırt Siperleri", tip: "siper", iklim: "iliman", tanim: "Siper hatları, tel örgüler ve kimsenin olmayan topraklar."},
  kamp:   {ad: "Ordugâh", tip: "kamp", iklim: "iliman", tanim: "Kendi kampın. Gece baskınına karşı savun."},
};

// Ağırlıklı rastgele seçim
export function agirlikliSec(obj, r = Math.random) {
  const e = Object.entries(obj).filter(([, w]) => w > 0); const t = e.reduce((a, [, w]) => a + w, 0);
  let x = r() * t; for (const [k, w] of e) { x -= w; if (x <= 0) return k; } return e[0][0];
}
