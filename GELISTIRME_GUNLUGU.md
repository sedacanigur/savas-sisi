# Geliştirme günlüğü

## Gece çalışması · 19–20 Kasım 2026 (İstanbul saati)

İstenenler: askerlerin canı ve yaralanma, daha çok asker türü ve sayısı (bölük 30–65 kişi), savaş öncesi asker kartlarıyla birlik seçimi, yanımıza başka komutanlar alma, süvarinin aşırı güçlü olması, formasyonlar (kare vb.), askerlerde birden çok silah (kılıç, tabanca, mızrak), Son Tabur'daki asker türlerini inceleme, askerleri biraz hızlandırma, karargâhı güzelleştirme, hataları düzeltme.

### 22:27 · Başlangıç
- Son Tabur'un `data.js` dosyasını inceledim: 70'e yakın birim (milis, uzun mızraklı, siper eri, lağımcı, sancaktar, grenadiyer, bersaglieri, İskoç dağlıları, Tirol avcısı, zeybek, gerillero, Kızıl Gömlekliler, Ölüm Hüsarları, Spencer süvarisi, cephane arabası…), 13 komutan (pasif yetenek + etkin yetenek + özel güç) ve taktik kartları (kare formasyonu, kolon hücumu, avcı perdesi…). Savaş Sisi'ne uyarlanacak olanları seçtim.
- Gece planı: (1) can, yaralanma, süvari dengesi, hız, bölük büyüklüğü ve performans · (2) formasyonlar · (3) birden çok silah, subay/sancaktar/borazan · (4) yeni asker türleri · (5) asker kartları ile ordu kurma · (6) yardımcı komutanlar ve yetenekleri · (7) karargâh/kamp görselleri · (8) hatalar, duraklatma menüsü, test, yayın.

### 22:34 · Can, yaralanma, süvari dengesi, hız, büyük bölükler, formasyonlar, çok silah
- **Can:** bütün askerlerin canı 1,6 katına çıktı; atlıların canı +60. Tüfek isabeti %20 düşürüldü (dönemin gerçek isabet oranlarına daha yakın).
- **Yaralanma:** canı yarının altına düşen asker *hafif yaralı* olur: topallar, %25 yavaş yürür, %20 kötü nişan alır. Canı biten askerin %55'i *ağır yaralı* olarak yere düşer (kolunu kaldırıp yardım bekler), sıhhiye ekibi ayağa kaldırabilir, savaş sonrası sahadan toplanabilir. Yaralılar 150 sn sahada kalır.
- **Süvari dengesi:** kılıç (55→42 hasar), mızrak (90→60, ilk darbe ×2→×1,6), süngü ayarlandı; atlıların vuruş aralığı uzadı, hücum çarpanı ×1,4→×1,15. Süngülü/mızraklı piyade atlıya karşı darbe vurur (hatta %18, karede %55). Süvari kareye ancak %25 isabetle vurur ve 9 saniye sonra geri çekilir; düşman süvarisi kareye çoğunlukla hücum etmez.
- **Hız:** bütün birlikler %25 hızlandı (oyuncu dahil).
- **Bölükler 30–65 kişi:** hat piyadesi 48, muhafız 56, zuhaf 40, avcı 36, süvari 30–40. Grafik ayarı artık 500 / 900 / 1400 askere kadar çiziyor; uzak askerler daha az parçayla çiziliyor (LOD).
- **Formasyonlar:** Hat, Kare, Kol, Dağınık (piyade) ve Kama (süvari). Her birinin hız, ateş gücü, süvariye ve topçuya dayanıklılık etkisi var. Komutan tuşları: Z hat · C kare · K kol · J dağınık. 1900 öncesi piyade süvari yaklaşınca kendiliğinden kare oluyor; düşman uzaktan kol hâlinde yürüyüp ateşe hat düzeninde başlıyor, 1904 sonrası dağınık düzen.
- **Bölük kadrosu:** her bölükte subay (kılıç + tabanca, moral ve isabet bonusu), sancaktar (moral) ve borazancı var. Subay ya da sancak düşerse bölüğün morali sarsılıyor. Ölenlerin yeri 2,5 saniyede bir dolduruluyor (saflar sıklaşıyor).
- **Birden çok silah:** süvari karabina + tabanca + kılıç/mızrak taşıyor (mızrak ilk çarpışmada %50 kırılır, kılıca geçer); subaylar tabanca kullanıyor. 1. şahısta 1 tüfek, 2 tabanca, 3 kılıç/süngü. Yeni yakın silahlar: yatağan, uzun mızrak, kama.
- Hata: çimlerin arka yüzleri karanlık görünüyordu, düzeltildi.
