// Yardımcı komutanlar: savaşa en fazla 2 komutan yanına alınır.
// pasif: savaş boyunca etkili · yetenek: savaşta N (1. komutan) ve M (2. komutan) tuşuyla kullanılır, bekleme süresi var.
// Gerçek tarihî kişiler oyun için sadeleştirilmiştir; Ardıçova subayları kurgusaldır.
export const PASIFLER = {
  tahkim:  "Tahkimat ustası: bütün bölükler daha iyi siper alır, moral +5.",
  topcu:   "Kurmay ve topçu: topların isabeti %30 artar, %15 hızlı doldurulur.",
  suvari:  "Süvari önderi: süvarinin yakın dövüş hasarı %20 artar, süvari morali +10.",
  sungu:   "Süngü ruhu: piyadenin yakın dövüş hasarı %25 artar.",
  nisanci: "Nişancılık talimi: tüfek isabeti %12 artar.",
  moral:   "Sarsılmaz irade: bölükler ancak moral 10'un altına inince bozulur, moral daha hızlı toparlanır.",
  kesif:   "Keşif ustası: bütün birliklerin görüş mesafesi %25 artar.",
  ikmal:   "İkmal ustası: bütün bölükler tok ve tam cephaneyle başlar; cephane %20 fazla.",
  hiz:     "Hızlı manevra: bütün birlikler %15 daha hızlı.",
  kare:    "Kare talimi: kare düzenindeki piyade süvariye karşı daha da sağlam; kare kurmak beklemesiz.",
};
export const YETENEKLER = {
  yaylim:   {ad: "Yaylım ateşi!", bekleme: 70, aciklama: "Bütün piyade anında doldurur; 15 sn boyunca isabet %50 artar."},
  kare:     {ad: "Kare olun!", bekleme: 45, aciklama: "Bütün piyade bölükleri hemen kare düzenine geçer."},
  toparlan: {ad: "Toparlanın!", bekleme: 80, aciklama: "Bozulan bölükler toplanır, bütün bölüklerin morali +25."},
  baraj:    {ad: "Topçu barajı", bekleme: 90, aciklama: "Nişan noktasına iki kat güçlü, ücretsiz topçu ateşi."},
  takviye:  {ad: "Takviye", bekleme: 150, aciklama: "Karargâhın yanına taze bir bölük gelir."},
  hucum:    {ad: "Hücum!", bekleme: 75, aciklama: "Seçili bölük ve bütün süvari hücuma kalkar; moral +15."},
  siper:    {ad: "Siper kazın!", bekleme: 120, aciklama: "Bütün bölükler bulundukları yerde siper kazar (tahkimat)."},
  kesif:    {ad: "Keşif kolu", bekleme: 90, aciklama: "25 sn boyunca savaş sisi bütün haritada kalkar."},
  yuruyus:  {ad: "Cebrî yürüyüş", bekleme: 80, aciklama: "25 sn boyunca bütün birlikler %40 hızlı."},
};

export const KOMUTANLAR = [
  // ---- Ardıçova (kurgusal; Ana Sefer'de baştan açık) ----
  {id: "demir", ad: "Yüzbaşı Demir", ulke: "ardicova", yil: 1860, ini: "YD", renk: "#2c5d57", pasif: "moral", yetenek: "toparlan", bedel: 0,
    tanim: "Ardıçova'nın yaşlı kurdu. Kaçan askeri bile geri döndürür."},
  {id: "halit", ad: "Çavuş Halit", ulke: "ardicova", yil: 1860, ini: "ÇH", renk: "#8a5a2b", pasif: "sungu", yetenek: "yaylim", bedel: 0,
    tanim: "Talim çavuşu; sesi topu bastırır."},
  {id: "kartal", ad: "Binbaşı Ayşe Kartal", ulke: "ardicova", yil: 1866, ini: "AK", renk: "#4a6a8a", pasif: "kesif", yetenek: "kesif", bedel: 20,
    tanim: "Dağ yollarını avucunun içi gibi bilen keşif subayı."},
  {id: "rustem", ad: "Albay Rüstem Ardıç", ulke: "ardicova", yil: 1866, ini: "RA", renk: "#5a3a2a", pasif: "topcu", yetenek: "baraj", bedel: 30,
    tanim: "Topçu okulunun kurucusu; mermiyi zarfa koyar gibi yerine bırakır."},
  // ---- tarihî komutanlar ----
  {id: "osman", ad: "Gazi Osman Paşa", ulke: "osmanli", yil: 1877, ini: "OP", renk: "#7a1f2b", pasif: "tahkim", yetenek: "siper", bedel: 60, gercek: true,
    tanim: "Plevne tabyalarını aylarca savunan komutan (1832–1900)."},
  {id: "muhtar", ad: "Gazi Ahmed Muhtar Paşa", ulke: "osmanli", yil: 1877, ini: "AM", renk: "#6a2a2a", pasif: "nisanci", yetenek: "yaylim", bedel: 50, gercek: true,
    tanim: "1877'de Kafkas cephesindeki başarılarıyla 'Gazi' unvanını aldı (1839–1919)."},
  {id: "mkemal", ad: "Mustafa Kemal", ulke: "osmanli", yil: 1915, ini: "MK", renk: "#3a3a3a", pasif: "moral", yetenek: "hucum", bedel: 80, gercek: true,
    tanim: "1915'te Arıburnu ve Anafartalar'da çıkarmayı durduran komutan (1881–1938)."},
  {id: "moltke", ad: "Helmuth von Moltke", ulke: "prusya", yil: 1866, ini: "HM", renk: "#2b2b2b", pasif: "topcu", yetenek: "baraj", bedel: 60, gercek: true,
    tanim: "Prusya kurmay başkanı; demiryolu ve telgrafla savaşı planladı (1800–1891)."},
  {id: "albrecht", ad: "Arşidük Albrecht", ulke: "avusturya", yil: 1866, ini: "AA", renk: "#8a6d1e", pasif: "kare", yetenek: "kare", bedel: 40, gercek: true,
    tanim: "1866'da Custoza'da İtalyanları durduran Avusturya komutanı (1817–1895)."},
  {id: "garibaldi", ad: "Giuseppe Garibaldi", ulke: "italya", yil: 1860, ini: "GG", renk: "#c0392b", pasif: "sungu", yetenek: "takviye", bedel: 50, gercek: true,
    tanim: "Kızıl gömlekli gönüllülerin önderi (1807–1882)."},
  {id: "skobelev", ad: "Mihail Skobelev", ulke: "rusya", yil: 1877, ini: "MS", renk: "#e8e2d0", pasif: "suvari", yetenek: "hucum", bedel: 50, gercek: true,
    tanim: "Beyaz atı ve beyaz üniformasıyla 'Beyaz General' (1843–1882)."},
  {id: "grant", ad: "Ulysses S. Grant", ulke: "abd", yil: 1864, ini: "UG", renk: "#1f3a6b", pasif: "ikmal", yetenek: "takviye", bedel: 50, gercek: true,
    tanim: "İkmal hatlarını ve sayı üstünlüğünü ustaca kullanan ABD komutanı (1822–1885)."},
  {id: "kitchener", ad: "Herbert Kitchener", ulke: "britanya", yil: 1898, ini: "HK", renk: "#8a7a52", pasif: "kesif", yetenek: "yuruyus", bedel: 50, gercek: true,
    tanim: "Sudan seferinde çölü demiryoluyla aşan Britanya komutanı (1850–1916)."},
  {id: "foch", ad: "Ferdinand Foch", ulke: "fransa", yil: 1914, ini: "FF", renk: "#4a5a8a", pasif: "hiz", yetenek: "yuruyus", bedel: 70, gercek: true,
    tanim: "1918'de İtilaf ordularının başkomutanı (1851–1929)."},
];
export const KOMUTAN = Object.fromEntries(KOMUTANLAR.map(k => [k.id, k]));
