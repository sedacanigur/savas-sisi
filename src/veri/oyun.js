// Oyunun görünen adı ve genel ayarlar. Adı değiştirmek için yalnızca OYUN_ADI'nı düzenle.
export const OYUN_ADI = "Savaş Sisi";
export const SURUM = "0.1 · dikey dilim";

// Grafik ayarları: aynı anda sahada olabilecek asker sayısı ve detay
export const GRAFIK = {
  dusuk:  {ad: "Düşük",  asker: 500,  arac: 8,  agac: 320,  golge: false, arazi: 112, piksel: 0.75, parcacik: 1400, cim: 3000,  kalabalik: 0.65},
  orta:   {ad: "Orta",   asker: 900,  arac: 14, agac: 700,  golge: true,  arazi: 160, piksel: 1,    parcacik: 2600, cim: 9000,  kalabalik: 0.85},
  yuksek: {ad: "Yüksek", asker: 1400, arac: 24, agac: 1100, golge: true,  arazi: 200, piksel: 1.25, parcacik: 4000, cim: 18000, kalabalik: 1.1},
};

export const VARSAYILAN_AYAR = {
  grafik: "orta",
  hassasiyet: 1,
  ses: 0.7,
  soru: {tarih: true, lgs: true, yanlis: false},
  kamera: "asker", // savaşta varsayılan rol
};

// Kaynaklar (görünen ad, simge)
export const KAYNAK = {
  altin: {ad: "Altın", simge: "◆"},
  demir: {ad: "Demir", simge: "▣"},
  barut: {ad: "Barut", simge: "✹"},
  un:    {ad: "Un", simge: "❖"},
  ekmek: {ad: "Ekmek", simge: "◗"},
  at:    {ad: "At", simge: "♞"},
  yakit: {ad: "Kömür/Yakıt", simge: "▲"},
  san:   {ad: "Şan", simge: "★"},
};

export const BASLANGIC_KAYNAK = {altin: 120, demir: 40, barut: 40, un: 20, ekmek: 12, at: 6, yakit: 0, san: 0};

export const RUTBELER = ["Teğmen", "Üsteğmen", "Yüzbaşı", "Binbaşı", "Yarbay", "Albay", "Tuğgeneral", "Tümgeneral"];
