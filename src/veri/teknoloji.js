// Teknoloji ve üretim ağacı. Araştırma Harp Okulu'nda yapılır ve bir görev sürer.
// kol: piyade | suvari | topcu | lojistik · on: önkoşullar · yukselt: mevcut birliklerin silahını yükseltir
const C = (altin, demir = 0, barut = 0, yakit = 0) => ({altin, demir, barut, yakit});

export const KOLLAR = [
  {id: "piyade", ad: "Piyade ve silah"},
  {id: "suvari", ad: "Süvari ve at"},
  {id: "topcu", ad: "Topçu ve makine"},
  {id: "lojistik", ad: "Lojistik, haberleşme, hava ve deniz"},
];
export const CAGLAR = [1860, 1870, 1885, 1900, 1914];

export const TEKNOLOJILER = [
  // ---------- piyade ----------
  {id: "igneli", ad: "İğneli tüfek", kol: "piyade", yil: 1866, on: [], maliyet: C(60, 20, 10), aciklama: "Avcı erlerini açar. Kuyruktan dolma: diz çökerek hızlı doldurma."},
  {id: "sancak", ad: "Sancak ve bando", kol: "piyade", yil: 1860, on: [], maliyet: C(40), aciklama: "Sancak muhafızlarını açar: çevredeki mangaların morali daha yavaş düşer."},
  {id: "istihkam", ad: "İstihkâm okulu", kol: "piyade", yil: 1866, on: [], maliyet: C(50, 20), aciklama: "İstihkâmcıları açar. Aşama 1'de tahkimat daha ucuz."},
  {id: "durbun", ad: "Dürbünlü tüfek", kol: "piyade", yil: 1870, on: ["igneli"], maliyet: C(70, 20, 10), aciklama: "Keskin nişancıları açar."},
  {id: "metal_fisek", ad: "Metal fişek", kol: "piyade", yil: 1874, on: ["igneli"], maliyet: C(90, 30, 20), yukselt: {agizdan_tufek: "metal_fisek", igneli_tufek: "metal_fisek"}, aciklama: "Hat piyadesi ve avcılar metal fişekli tüfeğe geçer: yağmurda tutukluk biter."},
  {id: "sarjor", ad: "Şarjörlü dumansız tüfek", kol: "piyade", yil: 1889, on: ["metal_fisek"], maliyet: C(140, 50, 30), yukselt: {metal_fisek: "sarjorlu_tufek"}, aciklama: "Tüfekçileri açar; bütün tüfekler şarjörlü ve dumansız olur."},
  {id: "bomba", ad: "El bombası", kol: "piyade", yil: 1904, on: ["sarjor"], maliyet: C(100, 30, 40), aciklama: "Bomba erlerini açar. Tüfekçiler el bombası taşır."},
  {id: "kask", ad: "Çelik kask", kol: "piyade", yil: 1915, on: ["bomba"], maliyet: C(120, 60), aciklama: "Bütün piyadenin canı +20."},
  {id: "alev", ad: "Alev silahı", kol: "piyade", yil: 1915, on: ["bomba", "atolye"], maliyet: C(120, 40, 20, 10), aciklama: "Alev erlerini açar."},
  {id: "hucum", ad: "Hücum taktikleri", kol: "piyade", yil: 1917, on: ["bomba"], maliyet: C(160, 50, 40), aciklama: "Hafif makineli hücum erlerini açar."},
  // ---------- süvari ----------
  {id: "akinci", ad: "Akıncı ocakları", kol: "suvari", yil: 1860, on: [], maliyet: C(40), aciklama: "Ucuz ve hızlı düzensiz süvari."},
  {id: "mizrak", ad: "Mızrak talimi", kol: "suvari", yil: 1860, on: [], maliyet: C(50, 10), aciklama: "Mızraklı süvariyi açar."},
  {id: "zirh", ad: "Göğüs zırhı", kol: "suvari", yil: 1862, on: ["mizrak"], maliyet: C(80, 40), aciklama: "Kürasiyerleri açar."},
  {id: "at_yetistirme", ad: "Haralar", kol: "suvari", yil: 1866, on: [], maliyet: C(60), aciklama: "Her görev sonunda +2 at."},
  {id: "ejder", ad: "Ejder alayları", kol: "suvari", yil: 1866, on: ["igneli"], maliyet: C(70, 10, 10), aciklama: "Atlı piyadeyi açar."},
  {id: "atli_top", ad: "Atlı topçu", kol: "suvari", yil: 1866, on: ["at_yetistirme"], maliyet: C(90, 30, 20), aciklama: "Hızla yer değiştiren topları açar."},
  {id: "deve", ad: "Deve süvarisi", kol: "suvari", yil: 1880, on: ["ejder"], maliyet: C(70, 10, 10), aciklama: "Çöl haritalarında çok güçlü."},
  {id: "motor", ad: "Motosiklet", kol: "suvari", yil: 1910, on: ["atolye"], maliyet: C(100, 50, 0, 20), aciklama: "Motosikletli keşfi açar."},
  // ---------- topçu ----------
  {id: "gatling", ad: "Gatling", kol: "topcu", yil: 1866, on: [], maliyet: C(80, 40, 20), aciklama: "Elle çevrilen seri ateş silahı."},
  {id: "celik_top", ad: "Çelik top (Krupp tipi)", kol: "topcu", yil: 1870, on: [], maliyet: C(110, 60, 30), yukselt: {agizdan_top: "celik_top"}, aciklama: "Bataryalar çelik kuyruktan dolma topa geçer."},
  {id: "obus", ad: "Obüs", kol: "topcu", yil: 1880, on: ["celik_top"], maliyet: C(130, 60, 40), aciklama: "Tepe arkasını vuran obüs bataryaları."},
  {id: "maxim", ad: "Maxim", kol: "topcu", yil: 1886, on: ["gatling"], maliyet: C(140, 60, 40), aciklama: "Su soğutmalı makineli tüfek."},
  {id: "seri_top", ad: "Seri atışlı top", kol: "topcu", yil: 1897, on: ["celik_top"], maliyet: C(160, 70, 40), yukselt: {celik_top: "seri_top"}, aciklama: "Geri tepme frenli modern top."},
  {id: "havan", ad: "Siper havanı", kol: "topcu", yil: 1915, on: ["obus"], maliyet: C(100, 40, 30), aciklama: "Taşınabilir dik atış."},
  {id: "zirhli_arac", ad: "Zırhlı otomobil", kol: "topcu", yil: 1912, on: ["motor", "maxim"], maliyet: C(180, 90, 20, 30), aciklama: "Makineli tüfekli zırhlı araç."},
  {id: "tank", ad: "Tank", kol: "topcu", yil: 1916, on: ["zirhli_arac"], maliyet: C(300, 160, 40, 60), aciklama: "Siperi ezen paletli zırhlı araç."},
  // ---------- lojistik / hava / deniz ----------
  {id: "firin2", ad: "Ordu fırını", kol: "lojistik", yil: 1860, on: [], maliyet: C(50, 20), aciklama: "Fırın her görevde +4 ekmek fazla pişirir."},
  {id: "telgraf", ad: "Telgraf ve heliograf", kol: "lojistik", yil: 1860, on: [], maliyet: C(50, 10), aciklama: "Her savaşta topçu atış hakkı +1."},
  {id: "demiryolu", ad: "Demiryolu", kol: "lojistik", yil: 1866, on: [], maliyet: C(100, 60), aciklama: "Her görev sonunda ikmal: +20 altın, +10 un, +6 barut."},
  {id: "konserve", ad: "Konserve ve sahra mutfağı", kol: "lojistik", yil: 1875, on: ["firin2"], maliyet: C(80, 20), aciklama: "Ekmeği olmayan mangaların moral cezası yarıya iner; soğukta ekmek tüketimi artmaz."},
  {id: "balon", ad: "Gözetleme balonu", kol: "lojistik", yil: 1870, on: ["telgraf"], maliyet: C(110, 20, 0, 10), aciklama: "Hangarı ve gözetleme balonunu açar."},
  {id: "telefon", ad: "Sahra telefonu", kol: "lojistik", yil: 1899, on: ["telgraf"], maliyet: C(100, 30), aciklama: "Telefoncu/gözcü ekibini açar."},
  {id: "atolye", ad: "Motor atölyesi", kol: "lojistik", yil: 1899, on: ["demiryolu"], maliyet: C(140, 80, 0, 20), aciklama: "Atölye binasını açar: motorlu araçlar ve alev silahı."},
  {id: "ucak", ad: "Çift kanatlı uçak", kol: "lojistik", yil: 1912, on: ["balon", "atolye"], maliyet: C(200, 60, 0, 40), aciklama: "Keşif uçağını açar."},
  {id: "avci", ad: "Avcı uçağı", kol: "lojistik", yil: 1916, on: ["ucak"], maliyet: C(220, 70, 20, 40), aciklama: "Avcı uçağını açar."},
  {id: "zeplin", ad: "Zeplin", kol: "lojistik", yil: 1915, on: ["ucak"], maliyet: C(260, 90, 40, 60), aciklama: "Zeplini açar."},
  {id: "zirhli_gemi", ad: "Zırhlı gemi", kol: "lojistik", yil: 1870, on: ["demiryolu"], maliyet: C(300, 150, 60, 40), aciklama: "Tersaneyi açar (kıyı savunması yakında)."},
];
export const TEK = Object.fromEntries(TEKNOLOJILER.map(t => [t.id, t]));

// Kamp binaları. Üretim bu binalarda yapılır.
export const BINALAR = {
  harita:     {ad: "Harita Masası", tanim: "Sonraki görev, brifing ve sefere çıkış."},
  ordu:       {ad: "Karargâh", tanim: "Mangalar, savaşa gidecek birlikler, terfi."},
  harp_okulu: {ad: "Harp Okulu", tanim: "Teknoloji araştırması (bir görev sürer)."},
  kisla:      {ad: "Kışla", tanim: "Piyade üretimi ve kendi birliğini tasarlama."},
  ahir:       {ad: "Ahır", tanim: "Süvari, at ve ikmal arabası."},
  tophane:    {ad: "Tophane", tanim: "Toplar, makineli tüfekler ve cephane."},
  firin:      {ad: "Fırın", tanim: "Undan ekmek pişirir. Ekmek moraldir."},
  revir:      {ad: "Revir", tanim: "Yaralılar iyileşir, sıhhiye ekipleri yetişir."},
  atolye:     {ad: "Motor Atölyesi", tanim: "Motorlu araçlar, alev silahı.", tek: "atolye"},
  hangar:     {ad: "Hangar", tanim: "Balon, uçak ve zeplin.", tek: "balon"},
  tersane:    {ad: "Tersane", tanim: "Gemiler (yakında).", tek: "zirhli_gemi"},
};

// Kendi birliğini tasarla: seçilebilir parçalar
export const TASARIM = {
  temel: [
    {id: "piyade", ad: "Piyade", sinif: "piyade", boy: 8, can: 100, hiz: 1.5, kosu: 3.6, gorus: 170, maliyet: {altin: 25}},
    {id: "suvari", ad: "Süvari", sinif: "suvari", boy: 6, can: 110, hiz: 3, kosu: 8.5, gorus: 220, maliyet: {altin: 35, at: 6}, ozel: {atli: true}},
    {id: "ekip", ad: "Makineli ekibi", sinif: "makineli", boy: 3, can: 90, hiz: 1.2, kosu: 3, gorus: 200, maliyet: {altin: 40}},
  ],
  silah: [
    {id: "agizdan_tufek", tek: null, maliyet: {barut: 4}}, {id: "igneli_tufek", tek: "igneli", maliyet: {barut: 5, demir: 2}},
    {id: "metal_fisek", tek: "metal_fisek", maliyet: {barut: 6, demir: 3}}, {id: "sarjorlu_tufek", tek: "sarjor", maliyet: {barut: 8, demir: 5}},
    {id: "keskin_tufek", tek: "durbun", maliyet: {barut: 4, demir: 6, altin: 10}}, {id: "karabina", tek: null, maliyet: {barut: 3}},
    {id: "tabanca", tek: null, maliyet: {barut: 2}}, {id: "hafif_makineli", tek: "hucum", maliyet: {barut: 12, demir: 8}},
    {id: "gatling", tek: "gatling", maliyet: {barut: 14, demir: 18}, sadece: "ekip"}, {id: "maxim", tek: "maxim", maliyet: {barut: 20, demir: 24}, sadece: "ekip"},
  ],
  yakin: [{id: "sungu", tek: null}, {id: "kilic", tek: null}, {id: "mizrak", tek: "mizrak", sadece: "suvari"}],
  ekipman: [
    {id: "kask", ad: "Çelik kask", tek: "kask", etki: {can: 20}, maliyet: {demir: 6}},
    {id: "zirh", ad: "Göğüs zırhı", tek: "zirh", etki: {can: 40, hiz: -0.2}, maliyet: {demir: 12}},
    {id: "durbun", ad: "Dürbün", tek: "durbun", etki: {gorus: 120}, maliyet: {altin: 10}},
    {id: "bomba", ad: "El bombası", tek: "bomba", etki: {ikinci: "el_bombasi"}, maliyet: {barut: 8}},
    {id: "kurek", ad: "Kürek (siper kazar)", tek: "istihkam", etki: {istihkam: true}, maliyet: {demir: 4}},
    {id: "sancak", ad: "Sancak ve borazan", tek: "sancak", etki: {sancak: true, moral: 0.2}, maliyet: {altin: 15}},
    {id: "matara", ad: "Matara ve azık", tek: null, etki: {azik: true}, maliyet: {altin: 5}},
  ],
  egitim: [
    {id: "talim", ad: "Talim (hızlı doldurma)", etki: {dolum: 0.8}, maliyet: {altin: 15}},
    {id: "nisan", ad: "Nişancılık", etki: {isabet: 1.2}, maliyet: {altin: 20}},
    {id: "sungu", ad: "Süngü talimi", etki: {yakinHasar: 1.4}, maliyet: {altin: 15}},
    {id: "disiplin", ad: "Disiplin", etki: {moral: 0.25}, maliyet: {altin: 20}},
  ],
};
