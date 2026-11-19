// Birlik türleri. Bir "manga" aynı türden askerlerden oluşur (boy = asker sayısı).
// sinif: piyade | suvari | topcu | makineli | destek | arac | hava | deniz
// hiz: yürüyüş (m/sn) · kosu: koşu/dörtnala · gorus: görüş mesafesi (m) · moral: başlangıç moral çarpanı
// maliyet: üretim bedeli · bina: üretildiği kamp binası · tek: gereken teknoloji
// ozel: atli, inip_savasir, mizrak, zirh, sihhiye, sancak, borazan, istihkam, telefon, gozcu, deve, motor, ucar, yuzer
const M = (altin, demir = 0, barut = 0, at = 0, yakit = 0) => ({altin, demir, barut, at, yakit});

export const BIRLIKLER = {
  // ================= PİYADE =================
  hat_piyadesi: {ad: "Hat piyadesi", sinif: "piyade", boy: 48, can: 100, hiz: 1.5, kosu: 3.6, silah: "agizdan_tufek", yakin: "sungu", moral: 1, gorus: 160,
    maliyet: M(30, 4, 6), bina: "kisla", tek: null, yil: 1860, aciklama: "Ordunun belkemiği. Sıra hâlinde yaylım ateşi açar, süngü hücumu yapar."},
  avci: {ad: "Avcı eri", sinif: "piyade", boy: 36, can: 90, hiz: 1.7, kosu: 4, silah: "igneli_tufek", yakin: "sungu", moral: 1.05, gorus: 200,
    maliyet: M(40, 4, 6), bina: "kisla", tek: "igneli", yil: 1866, aciklama: "Dağınık düzende savaşan hafif piyade. Siper ve ağaç arkasını iyi kullanır."},
  modern_piyade: {ad: "Tüfekçi (şarjörlü)", sinif: "piyade", boy: 48, can: 100, hiz: 1.6, kosu: 3.8, silah: "sarjorlu_tufek", yakin: "sungu", ikinci: "el_bombasi", moral: 1, gorus: 200,
    maliyet: M(45, 8, 8), bina: "kisla", tek: "sarjor", yil: 1889, aciklama: "Dumansız barut ve 5'li şarjör. 1904'ten sonra el bombası taşır."},
  zuhaf: {ad: "Zuhaf", sinif: "piyade", boy: 40, can: 110, hiz: 1.8, kosu: 4.3, silah: "agizdan_tufek", yakin: "sungu", moral: 1.3, gorus: 180, yakinHasar: 1.3,
    maliyet: M(55, 4, 8), bina: "kisla", tek: "zuhaf", yil: 1860, renk: "#283a6e", aciklama: "Şalvarlı, fesli seçkin hafif piyade. Hızlı koşar, süngü hücumunda çok yıkıcıdır."},
  muhafiz: {ad: "Muhafız alayı", sinif: "piyade", boy: 56, can: 125, hiz: 1.5, kosu: 3.6, silah: "agizdan_tufek", yakin: "sungu", moral: 1.5, gorus: 160, isabet: 1.15,
    maliyet: M(80, 8, 10), bina: "kisla", tek: "muhafiz", yil: 1860, renk: "#5a1a22", aciklama: "En disiplinli piyade. Kolay kolay bozulmaz; hattın sigortasıdır."},
  keskin_nisanci: {ad: "Keskin nişancı", sinif: "piyade", boy: 12, can: 80, hiz: 1.5, kosu: 3.6, silah: "keskin_tufek", yakin: "sungu", moral: 1.1, gorus: 380,
    maliyet: M(50, 4, 4), bina: "kisla", tek: "durbun", yil: 1870, ozel: {gozcu: true}, aciklama: "Uzaktan subay ve topçuları avlar. Görüşü çok geniştir."},
  istihkamci: {ad: "İstihkâmcı", sinif: "piyade", boy: 30, can: 100, hiz: 1.5, kosu: 3.4, silah: "igneli_tufek", yakin: "sungu", moral: 1, gorus: 150,
    maliyet: M(45, 10, 6), bina: "kisla", tek: "istihkam", yil: 1866, ozel: {istihkam: true}, aciklama: "Siper kazar, kum torbası ve tel örgü kurar: yakındaki mangalara siper bonusu verir."},
  sihhiyeci: {ad: "Sıhhiye ekibi", sinif: "piyade", boy: 8, can: 80, hiz: 1.6, kosu: 3.8, silah: "tabanca", moral: 1, gorus: 140,
    maliyet: M(35), bina: "revir", tek: null, yil: 1860, ozel: {sihhiye: true}, aciklama: "Yakındaki yaralıları ayağa kaldırır; savaş sonrası daha çok yaralı kurtarılır."},
  sancak_muhafiz: {ad: "Sancak muhafızları", sinif: "piyade", boy: 30, can: 120, hiz: 1.5, kosu: 3.6, silah: "agizdan_tufek", yakin: "sungu", moral: 1.4, gorus: 160,
    maliyet: M(60, 4, 6), bina: "kisla", tek: "sancak", yil: 1860, ozel: {sancak: true, borazan: true}, aciklama: "Sancak ve borazan: 40 m içindeki bütün mangaların morali daha yavaş düşer."},
  bomba_eri: {ad: "Bomba eri", sinif: "piyade", boy: 30, can: 100, hiz: 1.6, kosu: 3.8, silah: "sarjorlu_tufek", yakin: "sungu", ikinci: "el_bombasi", moral: 1.1, gorus: 180,
    maliyet: M(50, 10, 14), bina: "kisla", tek: "bomba", yil: 1904, aciklama: "Siperlere el bombası atar. Sis bombası da taşıyabilir."},
  telefoncu: {ad: "Telefoncu / gözcü", sinif: "piyade", boy: 4, can: 80, hiz: 1.6, kosu: 3.8, silah: "tabanca", moral: 1, gorus: 320,
    maliyet: M(40, 6), bina: "kisla", tek: "telefon", yil: 1899, ozel: {telefon: true, gozcu: true}, aciklama: "Sahra telefonu ile topçu ateşini yönetir: topçu atış hakkı +2, isabet artar."},
  alev_eri: {ad: "Alev eri", sinif: "piyade", boy: 3, can: 110, hiz: 1.4, kosu: 3.2, silah: "alev", moral: 1.1, gorus: 140,
    maliyet: M(60, 14, 10, 0, 4), bina: "atolye", tek: "alev", yil: 1915, aciklama: "Siper savunmasında son çare. Yakına gelen düşmanın moralini çökertir."},
  hucum_eri: {ad: "Hücum eri", sinif: "piyade", boy: 32, can: 110, hiz: 1.8, kosu: 4.2, silah: "hafif_makineli", yakin: "sungu", ikinci: "el_bombasi", moral: 1.3, gorus: 180,
    maliyet: M(70, 14, 14), bina: "kisla", tek: "hucum", yil: 1917, aciklama: "Hafif makineli ve el bombalı seçkin karşı hücum birliği."},

  // ================= SÜVARİ =================
  kazak: {ad: "Kazak süvarisi", sinif: "suvari", boy: 36, can: 100, hiz: 3.2, kosu: 9.5, silah: "karabina", yakin: "mizrak", moral: 1.05, gorus: 260,
    maliyet: M(45, 4, 2, 10), bina: "ahir", tek: "akinci", yil: 1860, ozel: {atli: true, mizrak: true, gozcu: true}, aciklama: "Mızraklı düzensiz süvari. Keşifte ve kaçanı kovalamakta ustadır."},
  hafif_suvari: {ad: "Hafif süvari (hussar)", sinif: "suvari", boy: 30, can: 110, hiz: 3, kosu: 9, silah: "karabina", yakin: "kilic", moral: 1.1, gorus: 260,
    maliyet: M(45, 4, 2, 6), bina: "ahir", tek: null, yil: 1860, ozel: {atli: true, gozcu: true}, aciklama: "Hızlı keşif, kaçanı kovalama. Görüşü geniş; savaş sisini kaldırır."},
  mizrakli: {ad: "Mızraklı süvari", sinif: "suvari", boy: 30, can: 120, hiz: 3, kosu: 8.5, silah: "karabina", yakin: "mizrak", moral: 1.2, gorus: 200,
    maliyet: M(55, 6, 2, 6), bina: "ahir", tek: "mizrak", yil: 1860, ozel: {atli: true, mizrak: true}, aciklama: "İlk çarpışma çok yıkıcıdır. Piyade karesine karşı zayıf."},
  kurasiyer: {ad: "Kürasiyer (ağır süvari)", sinif: "suvari", boy: 30, can: 170, hiz: 2.6, kosu: 7.5, silah: "tabanca", yakin: "kilic", moral: 1.3, gorus: 180,
    maliyet: M(70, 16, 2, 6), bina: "ahir", tek: "zirh", yil: 1860, ozel: {atli: true, zirh: true}, aciklama: "Göğüs zırhlı, ağır atlı. Yavaştır ama hücumu durdurulamaz."},
  ejder: {ad: "Ejder (atlı piyade)", sinif: "suvari", boy: 36, can: 100, hiz: 3, kosu: 8, silah: "igneli_tufek", yakin: "kilic", moral: 1.05, gorus: 200,
    maliyet: M(55, 6, 6, 8), bina: "ahir", tek: "ejder", yil: 1866, ozel: {atli: true, inip_savasir: true}, aciklama: "Atla hızla gelir, attan inip tüfekle savaşır. Gedikleri kapatır."},
  akinci: {ad: "Akıncı (düzensiz süvari)", sinif: "suvari", boy: 40, can: 90, hiz: 3.2, kosu: 9.5, silah: "karabina", yakin: "kilic", moral: 0.95, gorus: 240,
    maliyet: M(35, 2, 2, 8), bina: "ahir", tek: "akinci", yil: 1860, ozel: {atli: true}, aciklama: "Ucuz ve çok hızlı. Kanat baskınları ve topçu avı için."},
  atli_topcu: {ad: "Atlı topçu", sinif: "topcu", boy: 5, can: 100, hiz: 3, kosu: 7, silah: "agizdan_top", yakin: "kilic", moral: 1.1, gorus: 220,
    maliyet: M(90, 18, 16, 6), bina: "ahir", tek: "atli_top", yil: 1866, ozel: {atli: true, top: true}, aciklama: "Top atlarla hızla yer değiştirir; sonra kurulur ve ateş eder."},
  deve_suvarisi: {ad: "Deve süvarisi", sinif: "suvari", boy: 30, can: 120, hiz: 2.6, kosu: 7, silah: "metal_fisek", yakin: "kilic", moral: 1.1, gorus: 240,
    maliyet: M(50, 4, 6, 6), bina: "ahir", tek: "deve", yil: 1880, ozel: {atli: true, deve: true, inip_savasir: true}, aciklama: "Çölde yorulmaz; sıcaktan etkilenmez. Atlar develerden ürker."},
  motosikletli: {ad: "Motosikletli keşif", sinif: "suvari", boy: 12, can: 90, hiz: 4, kosu: 12, silah: "sarjorlu_tufek", yakin: "sungu", moral: 1, gorus: 300,
    maliyet: M(60, 18, 4, 0, 8), bina: "atolye", tek: "motor", yil: 1910, ozel: {motor: true, gozcu: true, inip_savasir: true}, aciklama: "En hızlı keşif. Attan değil motordan iner."},

  // ================= TOPÇU / MAKİNELİ =================
  sahra_topu: {ad: "Sahra bataryası", sinif: "topcu", boy: 5, can: 90, hiz: 1.2, kosu: 3, silah: "agizdan_top", yakin: "kilic", moral: 1, gorus: 200,
    maliyet: M(80, 20, 20, 2), bina: "tophane", tek: null, yil: 1860, ozel: {top: true}, aciklama: "Bir top ve 4 kişilik ekip. Yakına misket, uzağa gülle."},
  celik_batarya: {ad: "Çelik top bataryası", sinif: "topcu", boy: 5, can: 90, hiz: 1.2, kosu: 3, silah: "celik_top", yakin: "kilic", moral: 1, gorus: 220,
    maliyet: M(110, 30, 24, 2), bina: "tophane", tek: "celik_top", yil: 1870, ozel: {top: true}, aciklama: "Daha uzun menzil ve hız. Hafif zırhı deler."},
  seri_batarya: {ad: "Seri atışlı batarya", sinif: "topcu", boy: 5, can: 90, hiz: 1.3, kosu: 3, silah: "seri_top", yakin: "kilic", moral: 1, gorus: 240,
    maliyet: M(140, 40, 30, 2), bina: "tophane", tek: "seri_top", yil: 1897, ozel: {top: true}, aciklama: "Geri tepme frenli modern top."},
  obus_bataryasi: {ad: "Obüs bataryası", sinif: "topcu", boy: 5, can: 90, hiz: 1, kosu: 2.6, silah: "obus", yakin: "kilic", moral: 1, gorus: 160,
    maliyet: M(130, 40, 30, 2), bina: "tophane", tek: "obus", yil: 1880, ozel: {top: true}, aciklama: "Dik açılı atış: tepe arkasını ve siperleri vurur."},
  havan_ekibi: {ad: "Havan ekibi", sinif: "topcu", boy: 3, can: 90, hiz: 1.4, kosu: 3.4, silah: "havan", moral: 1, gorus: 150,
    maliyet: M(60, 14, 16), bina: "tophane", tek: "havan", yil: 1915, ozel: {top: true}, aciklama: "Siper hattında taşınabilir topçu."},
  roket_bataryasi: {ad: "Roket bataryası", sinif: "topcu", boy: 4, can: 90, hiz: 1.5, kosu: 3.4, silah: "roket", yakin: "kilic", moral: 1, gorus: 180,
    maliyet: M(60, 10, 24), bina: "tophane", tek: "roket", yil: 1860, ozel: {top: true}, aciklama: "Ucuz, hızlı kurulan roket rampaları. İsabetsiz ama gürültülü ve korkutucu."},
  dag_bataryasi: {ad: "Dağ bataryası (katırlı)", sinif: "topcu", boy: 4, can: 90, hiz: 2, kosu: 4, silah: "dag_topu", yakin: "kilic", moral: 1, gorus: 200,
    maliyet: M(85, 20, 16, 2), bina: "tophane", tek: "celik_top", yil: 1870, ozel: {top: true}, aciklama: "Hafif dağ topu; dağ ve geçit haritalarında çok çevik."},
  kusatma_bataryasi: {ad: "Kuşatma topu", sinif: "topcu", boy: 6, can: 100, hiz: 0.7, kosu: 1.4, silah: "agir_top", yakin: "kilic", moral: 1, gorus: 160,
    maliyet: M(220, 80, 50, 4), bina: "tophane", tek: "obus", yil: 1880, ozel: {top: true}, aciklama: "Dev top; kale duvarını ve siperi dağıtır. Gözcü ya da balonla birlikte kullan."},
  mitralyoz_ekibi: {ad: "Mitralyöz ekibi", sinif: "makineli", boy: 3, can: 90, hiz: 1.2, kosu: 3, silah: "mitralyoz", moral: 1, gorus: 220,
    maliyet: M(85, 24, 18), bina: "tophane", tek: "gatling", yil: 1866, aciklama: "Uzun menzilli yaylım ateşi; topçu gibi geriden kullanılır."},
  gatling_ekibi: {ad: "Gatling ekibi", sinif: "makineli", boy: 3, can: 90, hiz: 1.2, kosu: 3, silah: "gatling", moral: 1, gorus: 180,
    maliyet: M(80, 22, 18), bina: "tophane", tek: "gatling", yil: 1866, aciklama: "Elle çevrilen seri ateş. Tutukluk yapabilir."},
  maxim_ekibi: {ad: "Maxim ekibi", sinif: "makineli", boy: 3, can: 90, hiz: 1.2, kosu: 3, silah: "maxim", moral: 1.1, gorus: 220,
    maliyet: M(100, 26, 24), bina: "tophane", tek: "maxim", yil: 1886, aciklama: "Süvari hücumlarının sonu. Isınınca durur."},

  // ================= DESTEK / ARAÇ / HAVA / DENİZ =================
  ikmal_arabasi: {ad: "İkmal arabası", sinif: "destek", boy: 2, can: 80, hiz: 2, kosu: 4, silah: "tabanca", moral: 1, gorus: 120,
    maliyet: M(40, 6, 0, 2), bina: "ahir", tek: null, yil: 1860, ozel: {ikmal: true}, aciklama: "Yakındaki mangaların cephanesini ve ekmeğini yeniler."},
  gozetleme_balonu: {ad: "Gözetleme balonu", sinif: "destek", boy: 2, can: 150, hiz: 0, kosu: 0, silah: "tabanca", moral: 1, gorus: 600,
    maliyet: M(120, 10, 0, 0, 6), bina: "hangar", tek: "balon", yil: 1870, ozel: {balon: true, gozcu: true}, aciklama: "Bağlı balon savaş sisini geniş bir alanda kaldırır; topçu isabetini artırır."},
  zirhli_araba: {ad: "Zırhlı otomobil", sinif: "arac", boy: 3, can: 500, hiz: 4, kosu: 9, silah: "maxim", moral: 1.3, gorus: 220,
    maliyet: M(160, 60, 20, 0, 20), bina: "atolye", tek: "zirhli_arac", yil: 1912, ozel: {motor: true, zirh: true, arac: "zirhli"}, aciklama: "Makineli tüfekli, hafif zırhlı. Yolda hızlı, arazide zorlanır."},
  tank: {ad: "Tank", sinif: "arac", boy: 6, can: 1400, hiz: 1.2, kosu: 1.6, silah: "tank_topu", moral: 1.5, gorus: 150,
    maliyet: M(300, 120, 40, 0, 40), bina: "atolye", tek: "tank", yil: 1916, ozel: {motor: true, zirh: 2, arac: "tank", ezer: true}, aciklama: "Yavaş, gürültülü, sık arızalanır; ama siperi ve teli ezer. Yalnızca top, el bombası ve tanksavar deler."},
  kesif_ucagi: {ad: "Keşif uçağı", sinif: "hava", boy: 1, can: 120, hiz: 30, kosu: 30, silah: "tabanca", moral: 1, gorus: 500,
    maliyet: M(180, 30, 0, 0, 30), bina: "hangar", tek: "ucak", yil: 1912, ozel: {ucar: true, gozcu: true, arac: "ucak"}, aciklama: "Savaş alanı üstünde tur atar, sisi kaldırır, topçuya hedef bildirir."},
  avci_ucagi: {ad: "Avcı uçağı", sinif: "hava", boy: 1, can: 140, hiz: 40, kosu: 40, silah: "hafif_makineli", moral: 1.2, gorus: 400,
    maliyet: M(240, 40, 10, 0, 40), bina: "hangar", tek: "avci", yil: 1916, ozel: {ucar: true, arac: "ucak"}, aciklama: "Düşman balon ve uçaklarını düşürür, yürüyen kolları taciz eder."},
  zeplin: {ad: "Zeplin", sinif: "hava", boy: 1, can: 600, hiz: 8, kosu: 8, silah: "obus", moral: 1, gorus: 500,
    maliyet: M(400, 80, 40, 0, 60), bina: "hangar", tek: "zeplin", yil: 1915, ozel: {ucar: true, arac: "zeplin"}, aciklama: "Yavaş ve büyük. Bomba bırakır, uçaksavara açık hedeftir."},
  zirhli_gemi: {ad: "Buharlı zırhlı gemi", sinif: "deniz", boy: 1, can: 3000, hiz: 4, kosu: 6, silah: "celik_top", moral: 1.5, gorus: 500,
    maliyet: M(600, 200, 80, 0, 80), bina: "tersane", tek: "zirhli_gemi", yil: 1870, ozel: {yuzer: true, arac: "gemi"}, aciklama: "Kıyı savunmasında ateş desteği (yakında)."},
};

export const birlik = (id, ozel = {}) => ozel[id] || BIRLIKLER[id];

// Düşman tarafının dönemine göre kullandığı birlikler (görev tanımlarında kısayol)
export const DUSMAN_DONEM = [
  {yil: 1860, piyade: "hat_piyadesi", hafif: "avci", suvari: ["hafif_suvari", "mizrakli", "kurasiyer", "kazak"], top: "sahra_topu", mg: null, roket: "roket_bataryasi", secme: "zuhaf"},
  {yil: 1870, piyade: "hat_piyadesi", hafif: "avci", suvari: ["hafif_suvari", "mizrakli", "ejder", "kazak"], top: "celik_batarya", mg: "mitralyoz_ekibi", roket: "roket_bataryasi", secme: "muhafiz", agir: "dag_bataryasi"},
  {yil: 1880, piyade: "hat_piyadesi", hafif: "avci", suvari: ["hafif_suvari", "mizrakli", "ejder", "kazak"], top: "celik_batarya", mg: "gatling_ekibi", secme: "muhafiz", agir: "kusatma_bataryasi"},
  {yil: 1889, piyade: "modern_piyade", hafif: "avci", suvari: ["hafif_suvari", "mizrakli", "ejder"], top: "celik_batarya", mg: "maxim_ekibi"},
  {yil: 1904, piyade: "modern_piyade", hafif: "bomba_eri", suvari: ["hafif_suvari", "ejder"], top: "seri_batarya", mg: "maxim_ekibi"},
  {yil: 1915, piyade: "modern_piyade", hafif: "bomba_eri", suvari: ["ejder"], top: "seri_batarya", mg: "maxim_ekibi", agir: "obus_bataryasi"},
  {yil: 1917, piyade: "hucum_eri", hafif: "bomba_eri", suvari: ["ejder"], top: "obus_bataryasi", mg: "maxim_ekibi", arac: "tank"},
];
export function donem(yil) { let d = DUSMAN_DONEM[0]; for (const x of DUSMAN_DONEM) if (yil >= x.yil) d = x; return d; }
