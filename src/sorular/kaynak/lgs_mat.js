// LGS · Matematik (8. sınıf) — orta (2) ve zor (3) düzey. Şekil gerektirmeyen, metinle verilebilen sorular.
// [konu, soru, şıklar, doğru, açıklama, zorluk]
LGS_ADD("mat", [
 // ---------- 1. Çarpanlar ve Katlar ----------
 ["m1","360 sayısının kaç tane pozitif tam sayı böleni vardır?",["18","20","24","30"],2,"360 = 2³ · 3² · 5 olduğundan bölen sayısı (3+1)(2+1)(1+1) = 24'tür.",2],
 ["m1","Kenar uzunlukları 72 cm ve 120 cm olan dikdörtgen bir pano, kenar uzunluğu santimetre cinsinden tam sayı olan ve olabildiğince büyük, birbirinin aynısı kare karolarla boşluksuz kaplanacaktır. Kaç karo kullanılır?",["12","15","20","24"],1,"Karonun kenarı EBOB(72, 120) = 24 cm olur. 72 : 24 = 3 ve 120 : 24 = 5, toplam 3 · 5 = 15 karo.",2],
 ["m1","Üç zil sırasıyla 12, 18 ve 30 dakikada bir çalmaktadır. Üçü saat 09.00'da birlikte çaldıktan sonra aynı gün ilk kez saat kaçta yeniden birlikte çalar?",["10.30","11.00","12.00","15.00"],2,"EKOK(12, 18, 30) = 180 dakika = 3 saat. 09.00 + 3 saat = 12.00.",2],
 ["m1","a ve b aralarında asal iki pozitif tam sayıdır ve EKOK(a, b) = 84'tür. Buna göre a + b toplamı en az kaçtır?",["19","20","25","31"],0,"Aralarında asal sayılarda EKOK = a · b = 84. Uygun çiftler (1, 84), (3, 28), (4, 21), (7, 12); toplamı en küçük olan 7 + 12 = 19.",3],
 ["m1","İki basamaklı a ve b doğal sayıları için EBOB(a, b) = 6 ve EKOK(a, b) = 90'dır. Buna göre a + b kaçtır?",["36","48","54","96"],1,"a = 6x, b = 6y, x ve y aralarında asal, x · y = 90 : 6 = 15. (1, 15) çifti 6 ve 90 verir, ikisi de iki basamaklı değildir. (3, 5) çifti 18 ve 30 verir: 18 + 30 = 48.",3],
 ["m1","Bir sınıftaki öğrenciler 4'erli, 6'şarlı ve 9'arlı gruplara ayrıldığında her seferinde 3 öğrenci açıkta kalmaktadır. Sınıf mevcudu 40'tan fazla ve 100'den az olduğuna göre kaçtır?",["39","63","75","111"],2,"EKOK(4, 6, 9) = 36, mevcut 36k + 3 biçimindedir: 39, 75, 111… Aralıkta olan 75'tir.",3],
 ["m1","a ve b pozitif tam sayılar olmak üzere 2ᵃ · 3ᵇ sayısının 20 tane pozitif böleni vardır. a > b olduğuna göre bu sayı en az kaçtır?",["432","576","648","1536"],0,"(a+1)(b+1) = 20 ve a > b > 0 için (a, b) = (4, 3) ya da (9, 1). 2⁴ · 3³ = 432 ve 2⁹ · 3 = 1536; en küçüğü 432.",3],
 ["m1","Bir manav 84 elma ve 126 armudu, her pakette yalnızca bir tür meyve olacak ve bütün paketlerde eşit sayıda meyve bulunacak biçimde paketleyecektir. En az kaç paket kullanılır?",["5","6","7","42"],0,"Paket sayısının en az olması için her paketteki meyve sayısı EBOB(84, 126) = 42 olmalı. 84 : 42 + 126 : 42 = 2 + 3 = 5 paket.",2],

 // ---------- 2. Üslü İfadeler ----------
 ["m2","(−2)³ − (−3)² + 2⁰ işleminin sonucu kaçtır?",["−16","−14","0","2"],0,"(−2)³ = −8, (−3)² = 9, 2⁰ = 1. −8 − 9 + 1 = −16.",2],
 ["m2","4⁵ + 4⁵ + 4⁵ + 4⁵ = 2ˣ olduğuna göre x kaçtır?",["10","11","12","20"],2,"4 · 4⁵ = 4⁶ = (2²)⁶ = 2¹².",2],
 ["m2","0,00036 sayısının bilimsel gösterimi aşağıdakilerden hangisidir?",["36 · 10⁻⁵","3,6 · 10⁻⁴","0,36 · 10⁻³","3,6 · 10⁻³"],1,"Bilimsel gösterimde katsayı 1 ile 10 arasında olmalıdır: 0,00036 = 3,6 · 10⁻⁴. A ve C değerce doğru olsa da bilimsel gösterim değildir.",2],
 ["m2","2ˣ = 5 olduğuna göre 8ˣ⁺¹ ifadesinin değeri kaçtır?",["40","125","200","1000"],3,"8ˣ⁺¹ = 2³ˣ⁺³ = (2ˣ)³ · 2³ = 125 · 8 = 1000.",3],
 ["m2","Bir bakteri türü 20 dakikada bir ikiye bölünmektedir. Başlangıçta 3 · 2⁵ bakteri bulunan bir kapta 2 saat sonra kaç bakteri olur?",["3 · 2⁷","3 · 2¹¹","6 · 2¹¹","3 · 2¹⁷"],1,"2 saat = 120 dakika, 120 : 20 = 6 bölünme. 3 · 2⁵ · 2⁶ = 3 · 2¹¹.",3],
 ["m2","(1/3)⁻² · 9⁻¹ · 27 işleminin sonucu aşağıdakilerden hangisidir?",["3¹","3²","3³","3⁴"],2,"(1/3)⁻² = 3², 9⁻¹ = 3⁻², 27 = 3³. Üsler toplanır: 2 − 2 + 3 = 3.",2],
 ["m2","a = 4,8 · 10⁷ ve b = 1,2 · 10⁻³ olduğuna göre a · b çarpımının bilimsel gösterimi hangisidir?",["5,76 · 10⁴","5,76 · 10³","6 · 10⁴","5,76 · 10¹⁰"],0,"4,8 · 1,2 = 5,76 ve 10⁷ · 10⁻³ = 10⁴.",2],
 ["m2","3ˣ⁺² − 3ˣ = 72 olduğuna göre x kaçtır?",["1","2","3","4"],1,"3ˣ · 3² − 3ˣ = 3ˣ(9 − 1) = 8 · 3ˣ = 72, buradan 3ˣ = 9 ve x = 2.",3],
 ["m2","Işık saniyede yaklaşık 3 · 10⁸ m yol alır. Güneş'ten çıkan ışık Dünya'ya yaklaşık 5 · 10² saniyede ulaştığına göre Dünya ile Güneş arasındaki uzaklık yaklaşık kaç kilometredir?",["1,5 · 10⁸","1,5 · 10¹¹","15 · 10⁷","1,5 · 10⁵"],0,"Uzaklık = 3 · 10⁸ · 5 · 10² = 15 · 10¹⁰ m = 1,5 · 10¹¹ m. 1 km = 10³ m olduğundan 1,5 · 10⁸ km. B seçeneği metre cinsindendir.",3],

 // ---------- 3. Kareköklü İfadeler ----------
 ["m3","√48 + √27 − √75 işleminin sonucu kaçtır?",["√3","2√3","4√3","0"],1,"√48 = 4√3, √27 = 3√3, √75 = 5√3. 4√3 + 3√3 − 5√3 = 2√3.",2],
 ["m3","√(2⁶ + 2⁶ + 2⁶ + 2⁶) ifadesinin değeri kaçtır?",["8","16","32","64"],1,"4 · 2⁶ = 2⁸ ve √(2⁸) = 2⁴ = 16.",2],
 ["m3","Alanı 50 cm² olan bir karenin köşegen uzunluğu kaç santimetredir?",["5√2","10","10√2","25"],1,"Kenar √50 = 5√2 cm. Köşegen = kenar · √2 = 5√2 · √2 = 10 cm.",3],
 ["m3","4√5 sayısı hangi iki ardışık tam sayı arasındadır?",["7 ile 8","8 ile 9","9 ile 10","19 ile 20"],1,"4√5 = √80 ve 64 < 80 < 81 olduğundan 8 < √80 < 9.",2],
 ["m3","a = √12 ve b = √75 olduğuna göre b : a oranı kaçtır?",["5/2","25/4","√5","3"],0,"√12 = 2√3, √75 = 5√3. Oran 5√3 : 2√3 = 5/2.",2],
 ["m3","√0,49 + √0,0016 işleminin sonucu kaçtır?",["0,074","0,47","0,74","7,4"],2,"√0,49 = 0,7 ve √0,0016 = 0,04. Toplam 0,74.",2],
 ["m3","Aşağıdakilerden hangisi irrasyonel bir sayıdır?",["√0,09","√1,44","√0,4","√2,25"],2,"√0,09 = 0,3; √1,44 = 1,2; √2,25 = 1,5. 0,4 = 4/10 tam kare bir kesre dönüşmediği için √0,4 irrasyoneldir.",2],
 ["m3","Kenar uzunlukları √18 cm ve √32 cm olan bir dikdörtgenin çevresi ile alanı aşağıdakilerden hangisinde doğru verilmiştir?",["Çevre 7√2 cm, alan 24 cm²","Çevre 14√2 cm, alan 24 cm²","Çevre 14√2 cm, alan 12 cm²","Çevre 50 cm, alan 24 cm²"],1,"√18 = 3√2, √32 = 4√2. Çevre 2(3√2 + 4√2) = 14√2 cm; alan 3√2 · 4√2 = 24 cm².",3],
 ["m3","√a sayısı 6 ile 7 arasındadır ve a bir doğal sayıdır. a'nın alabileceği kaç farklı değer vardır?",["11","12","13","14"],1,"36 < a < 49 olmalı: a = 37, 38, …, 48 → 12 değer.",3],

 // ---------- 4. Veri Analizi ----------
 ["m4","Bir kırtasiyede Ocak–Nisan aylarında satılan defter ve kalem sayıları sırasıyla şöyledir: Ocak 40 defter, 60 kalem; Şubat 55 defter, 45 kalem; Mart 70 defter, 50 kalem; Nisan 35 defter, 80 kalem. Defter satışının kalem satışından fazla olduğu aylarda satılan toplam ürün sayısı kaçtır?",["100","120","220","255"],2,"Defter satışı Şubat (55 > 45) ve Mart (70 > 50) aylarında fazladır. 100 + 120 = 220.",2],
 ["m4","Bir kırtasiyenin aylık toplam satışları (defter + kalem) Ocak 100, Şubat 100, Mart 120, Nisan 115 adettir. Hangi ayda toplam satış bir önceki aya göre azalmıştır?",["Şubat","Mart","Nisan","Hiçbirinde"],2,"Şubat'ta değişmemiş, Mart'ta artmış, Nisan'da 120'den 115'e düşmüştür.",2],
 ["m4","Beş öğrencinin bir ayda okuduğu kitap sayıları Ali 12, Bora 8, Can x, Deniz 15, Ece 10'dur. Okunan kitap sayılarının ortalaması 11 olduğuna göre Can kaç kitap okumuştur?",["8","10","11","12"],1,"Toplam 5 · 11 = 55 olmalı. 12 + 8 + 15 + 10 = 45, buradan x = 10.",2],
 ["m4","Bir kasabada bir gün içinde ölçülen sıcaklıklar şöyledir: 08.00'de 4 °C, 10.00'da 9 °C, 12.00'de 15 °C, 14.00'te 17 °C, 16.00'da 12 °C. Bu verilerle çizilen çizgi grafiğinde art arda iki ölçüm arasındaki en büyük artış hangi zaman aralığındadır?",["08.00–10.00","10.00–12.00","12.00–14.00","14.00–16.00"],1,"Artışlar: 5, 6, 2 °C; 14.00–16.00 arasında düşüş vardır. En büyük artış 10.00–12.00 arasındadır.",2],
 ["m4","A ve B şirketlerinin dört yıllık kârları (milyon TL) şöyledir: A: 12, 15, 15, 20; B: 10, 16, 14, 22. A şirketinin kârının bir önceki yıla göre arttığı ve aynı yıl B'nin kârının A'nınkinden fazla olduğu yıllar hangileridir?",["Yalnız 2. yıl","2. ve 4. yıl","3. ve 4. yıl","Yalnız 4. yıl"],1,"A'nın kârı 2. yıl (12→15) ve 4. yıl (15→20) artmıştır. Bu yıllarda B: 16 > 15 ve 22 > 20.",3],
 ["m4","Bir öğrencinin bir yıl boyunca her ay ölçülen boy uzunluğundaki değişimi en iyi gösteren grafik türü hangisidir?",["Sütun grafiği","Çizgi grafiği","Daire grafiği","Resim grafiği"],1,"Bir niceliğin zaman içindeki değişimini göstermek için çizgi grafiği kullanılır.",2],
 ["m4","Bir okulun 8. sınıf şubelerindeki erkek ve kız öğrenci sayıları şöyledir: 8A 14 erkek, 16 kız; 8B 18 erkek, 12 kız; 8C 15 erkek, 15 kız; 8D 11 erkek, 19 kız. Kız öğrencilerin erkeklerden fazla olduğu şubelerdeki toplam öğrenci sayısının, bütün 8. sınıf öğrencilerine oranı kaçtır?",["1/4","1/3","1/2","2/3"],2,"Kızların fazla olduğu şubeler 8A (30) ve 8D (30): 60 öğrenci. Toplam 4 · 30 = 120. 60/120 = 1/2.",3],

 // ---------- 5. Basit Olayların Olma Olasılığı ----------
 ["m5","Bir torbada 4 kırmızı, 6 mavi ve x tane yeşil bilye vardır. Torbadan rastgele çekilen bir bilyenin mavi olma olasılığı 2/5 olduğuna göre x kaçtır?",["3","4","5","6"],2,"6 / (10 + x) = 2/5 → 30 = 20 + 2x → x = 5.",2],
 ["m5","1'den 30'a kadar numaralandırılmış 30 karttan rastgele biri çekiliyor. Çekilen kartın numarasının 3'ün katı olup 5'in katı olmama olasılığı kaçtır?",["1/3","4/15","1/5","8/15"],1,"3'ün katları 10 tane; bunlardan 15 ve 30 aynı zamanda 5'in katıdır. 8/30 = 4/15.",3],
 ["m5","Bir torbada 3 kırmızı ve 5 beyaz top vardır. Torbaya kaç kırmızı top eklenirse rastgele çekilen bir topun kırmızı olma olasılığı 2/3 olur?",["4","5","6","7"],3,"(3 + k) / (8 + k) = 2/3 → 9 + 3k = 16 + 2k → k = 7.",3],
 ["m5","Hilesiz bir zar atıldığında üst yüze asal sayı gelme olasılığı kaçtır?",["1/3","1/2","2/3","5/6"],1,"1–6 arasındaki asal sayılar 2, 3 ve 5'tir. 3/6 = 1/2.",2],
 ["m5","Aşağıdakilerden hangisi imkânsız olaydır?",["Hilesiz bir madenî para atıldığında yazı gelmesi","Yüzlerinde 1–6 yazan bir zar atıldığında 7 gelmesi","Bir sınıftan seçilen öğrencinin kız olması","Yalnızca mavi bilyelerin bulunduğu bir torbadan mavi bilye çekilmesi"],1,"Zarda 7 bulunmadığından olasılığı 0'dır. D seçeneği kesin olaydır.",2],
 ["m5","Bir sınıfta 12 kız ve 18 erkek öğrenci vardır. Sınıftan 3 kız ve 2 erkek öğrenci başka şubeye geçtikten sonra sınıftan rastgele seçilen bir öğrencinin kız olma olasılığı kaçtır?",["9/25","2/5","3/10","9/20"],0,"Kalan: 9 kız, 16 erkek, toplam 25. Olasılık 9/25.",3],
 ["m5","Bir torbadan rastgele çekilen bilyenin mavi olma olasılığı 3/8'dir. Torbada mavi olmayan 15 bilye bulunduğuna göre kaç mavi bilye vardır?",["6","8","9","12"],2,"Mavi olmama olasılığı 5/8 → toplam bilye 15 : 5 · 8 = 24. Mavi 24 − 15 = 9.",2],

 // ---------- 6. Cebirsel İfadeler ve Özdeşlikler ----------
 ["m6","(x + 3)² − (x − 3)² ifadesinin en sade hâli aşağıdakilerden hangisidir?",["6x","12x","18","2x² + 18"],1,"(x² + 6x + 9) − (x² − 6x + 9) = 12x.",2],
 ["m6","Kenar uzunlukları (2x + 1) cm ve (x − 3) cm olan bir dikdörtgenin alanını gösteren cebirsel ifade hangisidir?",["2x² − 5x − 3","2x² + 5x − 3","2x² − 7x − 3","3x − 2"],0,"(2x + 1)(x − 3) = 2x² − 6x + x − 3 = 2x² − 5x − 3.",2],
 ["m6","103² − 97² işleminin sonucu kaçtır?",["600","1200","1600","2400"],1,"İki kare farkı: (103 − 97)(103 + 97) = 6 · 200 = 1200.",2],
 ["m6","a + b = 9 ve a · b = 14 olduğuna göre a² + b² kaçtır?",["53","67","81","95"],0,"(a + b)² = a² + 2ab + b² → 81 = a² + b² + 28 → a² + b² = 53.",3],
 ["m6","x² − 10x + 25 ifadesinin çarpanlarına ayrılmış biçimi hangisidir?",["(x − 5)²","(x + 5)²","(x − 5)(x + 5)","(x − 25)(x − 1)"],0,"Tam kare özdeşliği: x² − 2 · 5 · x + 5² = (x − 5)².",2],
 ["m6","Bir kenarı (a + 4) m olan kare biçimindeki bir bahçenin içinden bir kenarı a m olan kare bir bölüm çiçeklik olarak ayrılıyor. Bahçenin geri kalan kısmının alanı kaç metrekaredir?",["16","8a + 16","a² + 16","4a + 16"],1,"(a + 4)² − a² = a² + 8a + 16 − a² = 8a + 16.",3],
 ["m6","3(2x − 1) − 2(x − 4) ifadesinin en sade hâli hangisidir?",["4x + 5","4x − 11","4x + 11","8x − 5"],0,"6x − 3 − 2x + 8 = 4x + 5. Parantezin önündeki eksi, −4'ü +8 yapar.",2],
 ["m6","(x − 2)(x + 2) − (x − 1)² ifadesinin en sade hâli hangisidir?",["2x − 5","−2x − 3","2x − 3","−5"],0,"x² − 4 − (x² − 2x + 1) = x² − 4 − x² + 2x − 1 = 2x − 5.",3],

 // ---------- 7. Doğrusal Denklemler ----------
 ["m7","(x − 1)/3 + (x + 1)/2 = 6 denkleminin çözümü kaçtır?",["5","6","7","8"],2,"Paydalar eşitlenir: 2(x − 1) + 3(x + 1) = 36 → 5x + 1 = 36 → x = 7.",2],
 ["m7","Koordinat düzleminde A(1, 3) ve B(5, 11) noktalarından geçen doğrunun eğimi kaçtır?",["1/2","2","3","4"],1,"Eğim = (11 − 3) / (5 − 1) = 8/4 = 2.",2],
 ["m7","y = 3x − 6 doğrusu ile koordinat eksenleri arasında kalan üçgensel bölgenin alanı kaç birimkaredir?",["6","9","12","18"],0,"x eksenini (2, 0), y eksenini (0, −6) noktasında keser. Alan = 2 · 6 / 2 = 6.",3],
 ["m7","Bir taksinin açılış ücreti 40 TL, kilometre başına ücreti 25 TL'dir. Yolculuk sonunda 340 TL ödeyen bir yolcu kaç kilometre yol gitmiştir?",["10","12","13","14"],1,"25x + 40 = 340 → 25x = 300 → x = 12 km.",2],
 ["m7","Bir babanın yaşı oğlunun yaşının 4 katıdır. 6 yıl sonra babanın yaşı oğlunun yaşının 3 katı olacaktır. Oğul şimdi kaç yaşındadır?",["8","10","12","14"],2,"4x + 6 = 3(x + 6) → 4x + 6 = 3x + 18 → x = 12.",2],
 ["m7","Aşağıdaki denklemlerden hangisinin grafiği orijinden geçer?",["y = 2x + 1","y = −2x","x = 3","y = 4"],1,"Orijinden geçen doğruların denklemi y = mx biçimindedir; (0, 0) yalnızca y = −2x'i sağlar.",2],
 ["m7","Eğimi −3 olan ve (2, 1) noktasından geçen doğru y eksenini hangi noktada keser?",["(0, −5)","(0, 7)","(0, 5)","(7, 0)"],1,"y = −3x + n ve 1 = −6 + n → n = 7. Doğru y eksenini (0, 7)'de keser.",3],
 ["m7","Birinci depoda 600 L su vardır ve depo dakikada 15 L boşalmaktadır. İkinci depoda 150 L su vardır ve dakikada 30 L su eklenmektedir. Kaç dakika sonra iki depodaki su miktarı eşit olur?",["9","10","12","15"],1,"600 − 15t = 150 + 30t → 450 = 45t → t = 10.",3],

 // ---------- 8. Eşitsizlikler ----------
 ["m8","3x − 5 < 2x + 4 eşitsizliğini sağlayan en büyük tam sayı kaçtır?",["7","8","9","10"],1,"x < 9 bulunur; 9 dahil olmadığından en büyük tam sayı 8'dir.",2],
 ["m8","−2x + 7 ≥ 1 eşitsizliğini sağlayan kaç tane doğal sayı vardır?",["2","3","4","5"],2,"−2x ≥ −6 → x ≤ 3 (negatif sayıya bölünce yön değişir). Doğal sayılar 0, 1, 2, 3 → 4 tane.",3],
 ["m8","−3 < 2x + 1 ≤ 9 eşitsizliğini sağlayan kaç farklı tam sayı vardır?",["5","6","7","8"],1,"−4 < 2x ≤ 8 → −2 < x ≤ 4. Tam sayılar −1, 0, 1, 2, 3, 4 → 6 tane.",3],
 ["m8","Bir otoparkın ücreti ilk saat için 50 TL, sonraki her saat için 30 TL'dir. Otopark için en fazla 300 TL ödemek isteyen bir sürücü aracını en fazla kaç saat park edebilir?",["8","9","10","11"],1,"50 + 30(t − 1) ≤ 300 → 30(t − 1) ≤ 250 → t − 1 ≤ 8,3… → t ≤ 9 saat.",3],
 ["m8","Sayı doğrusunda −2'nin üzerinde içi dolu bir daire bulunuyor ve buradan sağa doğru bir ok çizilmiş. Bu gösterime karşılık gelen eşitsizlik hangisidir?",["x > −2","x ≥ −2","x ≤ −2","x < −2"],1,"İçi dolu daire sınırın dahil olduğunu, sağa giden ok büyük değerleri gösterir: x ≥ −2.",2],
 ["m8","(x − 1)/2 > (x + 3)/3 eşitsizliğini sağlayan en küçük tam sayı kaçtır?",["8","9","10","11"],2,"3(x − 1) > 2(x + 3) → 3x − 3 > 2x + 6 → x > 9. En küçük tam sayı 10.",3],
 ["m8","a < b ve c < 0 olduğuna göre aşağıdakilerden hangisi kesinlikle doğrudur?",["a · c < b · c","a · c > b · c","a + c > b + c","a − c > b − c"],1,"Eşitsizliğin iki tarafı negatif bir sayıyla çarpılınca yön değişir: a · c > b · c. Toplama ve çıkarmada yön değişmez.",3],

 // ---------- 9. Üçgenler ----------
 ["m9","İki kenarının uzunluğu 5 cm ve 9 cm olan bir üçgenin üçüncü kenarının uzunluğu santimetre cinsinden bir tam sayıdır. Üçüncü kenar kaç farklı değer alabilir?",["7","8","9","10"],2,"Üçgen eşitsizliği: 9 − 5 < x < 9 + 5 → 4 < x < 14. x = 5, 6, …, 13 → 9 değer.",2],
 ["m9","Dik kenarları 9 cm ve 12 cm olan bir dik üçgenin hipotenüsü kaç santimetredir?",["13","15","17","21"],1,"Pisagor: 9² + 12² = 81 + 144 = 225 → hipotenüs 15 cm.",2],
 ["m9","ABC üçgeninde m(A) = 50° ve m(B) = 70°'dir. Bu üçgenin en uzun kenarı hangisidir?",["[AB]","[BC]","[AC]","Belirlenemez"],2,"m(C) = 60°. En büyük açı B'dir; en uzun kenar en büyük açının karşısındaki [AC]'dir.",2],
 ["m9","Uzunluğu 25 m olan bir merdiven dik bir duvara dayanmıştır ve alt ucu duvardan 7 m uzaktadır. Merdivenin alt ucu duvardan 15 m uzaklaşacak biçimde kaydırılırsa üst ucu kaç metre aşağı iner?",["2","3","4","5"],2,"İlk yükseklik √(25² − 7²) = 24 m, sonraki √(25² − 15²) = 20 m. 24 − 20 = 4 m.",3],
 ["m9","ABC ikizkenar üçgeninde |AB| = |AC| ve m(A) = 40°'dir. B açısının açıortayı [AC] kenarını D noktasında kesmektedir. m(BDC) kaç derecedir?",["65","70","75","80"],2,"m(B) = m(C) = 70°, m(ABD) = 35°. BDC açısı ABD üçgeninin dış açısıdır: 40° + 35° = 75°.",3],
 ["m9","Aşağıdaki uzunluklardan hangisi bir dik üçgenin kenar uzunlukları olabilir?",["4, 5, 6","6, 8, 11","7, 24, 25","5, 12, 14"],2,"7² + 24² = 49 + 576 = 625 = 25². Diğerlerinde iki küçük kenarın kareleri toplamı en büyüğün karesine eşit değildir.",2],
 ["m9","Koordinat düzleminde A(1, 2) ve B(7, 10) noktaları arasındaki uzaklık kaç birimdir?",["8","10","12","14"],1,"Yatay fark 6, dikey fark 8. Pisagor: √(36 + 64) = 10.",2],
 ["m9","Bir dikdörtgenin köşegeni 17 cm ve bir kenarı 8 cm'dir. Bu dikdörtgenin alanı kaç santimetrekaredir?",["60","120","136","255"],1,"Diğer kenar √(17² − 8²) = √225 = 15 cm. Alan 8 · 15 = 120 cm².",3],

 // ---------- 10. Eşlik ve Benzerlik ----------
 ["m10","Benzer iki üçgenden küçüğünün büyüğüne benzerlik oranı 2/3'tür. Küçük üçgenin çevresi 24 cm olduğuna göre büyük üçgenin çevresi kaç santimetredir?",["16","32","36","54"],2,"Çevreler de benzerlik oranıyla orantılıdır: 24 · 3/2 = 36 cm.",2],
 ["m10","Boyu 1,6 m olan bir öğrencinin gölgesi 2 m iken, aynı anda yakındaki bir ağacın gölgesi 15 m'dir. Ağacın boyu kaç metredir?",["10","12","15","18,75"],1,"Benzer üçgenler: 1,6 / 2 = h / 15 → h = 12 m.",2],
 ["m10","Ölçeği 1 : 200 000 olan bir haritada iki şehir arasındaki uzaklık 6 cm'dir. Bu şehirler arasındaki gerçek uzaklık kaç kilometredir?",["1,2","12","120","1200"],1,"6 · 200 000 = 1 200 000 cm = 12 000 m = 12 km.",2],
 ["m10","Kenar uzunlukları 4 cm ve 6 cm olan bir dikdörtgene benzer olan başka bir dikdörtgenin kısa kenarı 10 cm'dir. Bu dikdörtgenin alanı kaç santimetrekaredir?",["100","120","150","240"],2,"Benzerlik oranı 10/4 = 2,5; uzun kenar 6 · 2,5 = 15 cm. Alan 10 · 15 = 150 cm².",3],
 ["m10","İki üçgenin eş olduğunu göstermek için aşağıdaki koşullardan hangisi tek başına yeterli değildir?",["Üç kenarın karşılıklı eşit olması (KKK)","İki kenar ve aralarındaki açının eşit olması (KAK)","Bir kenar ve iki ucundaki açıların eşit olması (AKA)","Üç açının karşılıklı eşit olması (AAA)"],3,"Açıları eşit üçgenler benzerdir ama boyutları farklı olabilir; AAA eşlik için yeterli değildir.",2],
 ["m10","ABC ve DEF üçgenleri benzerdir. |AB| = 6 cm, |BC| = 8 cm, |AC| = 10 cm'dir. DEF üçgeninin en uzun kenarı 25 cm olduğuna göre en kısa kenarı kaç santimetredir?",["12","15","18","20"],1,"Benzerlik oranı 25/10 = 2,5. En kısa kenar 6 · 2,5 = 15 cm.",3],
 ["m10","10 cm × 15 cm boyutlarındaki bir fotoğraf, oranları korunarak kısa kenarı 24 cm olacak biçimde büyütülüyor. Büyütülmüş fotoğrafın uzun kenarı kaç santimetredir?",["29","30","36","40"],2,"Oran 24/10 = 2,4. Uzun kenar 15 · 2,4 = 36 cm. 29 seçeneği kenarlara aynı sayıyı (14) eklemenin yanlış sonucudur.",2],

 // ---------- 11. Dönüşüm Geometrisi ----------
 ["m11","A(3, −2) noktasının x eksenine göre yansımasının koordinatları nedir?",["(−3, −2)","(3, 2)","(−3, 2)","(2, 3)"],1,"x eksenine göre yansımada apsis aynı kalır, ordinatın işareti değişir: (3, 2).",2],
 ["m11","A(−4, 1) noktası önce 5 birim sağa, sonra 3 birim aşağı ötelenirse görüntüsünün koordinatları ne olur?",["(1, −2)","(1, 4)","(−9, −2)","(−1, −2)"],0,"Sağa 5: x = −4 + 5 = 1. Aşağı 3: y = 1 − 3 = −2.",2],
 ["m11","A(2, 5) noktası önce y eksenine göre yansıtılıyor, sonra 4 birim yukarı öteleniyor. Son görüntünün koordinatları nedir?",["(−2, 9)","(2, 9)","(−2, 1)","(6, 5)"],0,"y eksenine göre yansıma: (−2, 5). 4 birim yukarı: (−2, 9).",3],
 ["m11","P(a, b) noktası önce x eksenine, sonra y eksenine göre yansıtılırsa son görüntü hangisi olur?",["(a, −b)","(−a, b)","(−a, −b)","(b, a)"],2,"x eksenine göre: (a, −b). Ardından y eksenine göre: (−a, −b).",3],
 ["m11","Bir öteleme A(1, 2) noktasını A'(4, −1) noktasına taşımaktadır. Aynı öteleme B(−2, 3) noktasını hangi noktaya taşır?",["(1, 0)","(−5, 6)","(1, 6)","(−5, 0)"],0,"Öteleme: 3 birim sağa, 3 birim aşağı. B'(−2 + 3, 3 − 3) = (1, 0).",3],
 ["m11","Bir şekil ötelendiğinde aşağıdakilerden hangisi değişir?",["Boyutları","Biçimi","Konumu","Açılarının ölçüsü"],2,"Öteleme şekli kaydırır; biçim, boyut ve açılar korunur, yalnızca konum değişir.",2],
 ["m11","Köşeleri A(1, 1), B(4, 1) ve C(1, 5) olan ABC üçgeni y eksenine göre yansıtılıyor. Görüntü üçgenin alanı kaç birimkaredir?",["3","6","10","12"],1,"Yansıma alanı değiştirmez. Dik kenarlar 3 ve 4, alan 3 · 4 / 2 = 6.",2],

 // ---------- 12. Geometrik Cisimler ----------
 ["m12","Taban ayrıtları 4 cm ve 5 cm, yüksekliği 10 cm olan dikdörtgenler prizmasının yüzey alanı kaç santimetrekaredir?",["200","220","240","400"],1,"2(4 · 5 + 4 · 10 + 5 · 10) = 2(20 + 40 + 50) = 220 cm². 200, hacmin değeridir.",2],
 ["m12","Taban yarıçapı 3 cm ve yüksekliği 10 cm olan dik dairesel silindirin hacmi kaç santimetreküptür? (π = 3 alınız.)",["90","180","270","300"],2,"V = π · r² · h = 3 · 9 · 10 = 270 cm³.",2],
 ["m12","Taban yarıçapı 5 cm ve yüksekliği 8 cm olan dik dairesel silindirin yanal alanı kaç santimetrekaredir? (π = 3 alınız.)",["120","200","240","390"],2,"Yanal alan = 2 · π · r · h = 2 · 3 · 5 · 8 = 240 cm². 390, tabanlar da eklenince bulunan toplam yüzey alanıdır.",2],
 ["m12","Kare dik piramidin köşe, ayrıt ve yüz sayılarının toplamı kaçtır?",["16","17","18","20"],2,"Köşe 5 (4 taban + 1 tepe), ayrıt 8, yüz 5. Toplam 18.",2],
 ["m12","İç ayrıt uzunluğu 60 cm olan küp biçimindeki boş bir depoya 108 L su konuluyor. Suyun yüksekliği kaç santimetre olur? (1 L = 1000 cm³)",["20","25","30","36"],2,"108 L = 108 000 cm³. Taban alanı 60 · 60 = 3600 cm². Yükseklik 108 000 : 3600 = 30 cm.",3],
 ["m12","Taban yarıçapı 10 cm olan silindir biçimindeki bir kapta bir miktar su vardır. Kaba, bir ayrıtı 6 cm olan küp biçimindeki bir taş atıldığında taş tamamen suya batıyor ve su taşmıyor. Su seviyesi kaç santimetre yükselir? (π = 3 alınız.)",["0,6","0,72","0,8","1,2"],1,"Küpün hacmi 216 cm³. Kabın taban alanı 3 · 10² = 300 cm². Yükselme 216 : 300 = 0,72 cm.",3],
 ["m12","Dik dairesel koninin yüzey açınımında yanal yüz hangi geometrik şekildir?",["Üçgen","Daire dilimi","Dikdörtgen","Yamuk"],1,"Koninin yanal yüzü açıldığında bir daire dilimi, tabanı ise bir daire olur. Silindirin yanal yüzü dikdörtgendir.",2],
 ["m12","Tabanı dik kenarları 6 cm ve 8 cm olan dik üçgen, yüksekliği 12 cm olan üçgen dik prizmanın hacmi kaç santimetreküptür?",["288","360","480","576"],0,"Taban alanı 6 · 8 / 2 = 24 cm². Hacim 24 · 12 = 288 cm³. 576, taban alanını ikiye bölmeyi unutunca bulunur.",3]
]);
