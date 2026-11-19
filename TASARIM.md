# Savaş Sisi — Oyun Tasarım Belgesi

> Çalışma adı. Görünen ad `src/veri/oyun.js` içindeki `OYUN_ADI` sabitinden gelir; değiştirmek için yalnızca orayı düzenle.

Tarayıcıda (bilgisayarda) oynanan, 1860–1918 arasında geçen 3D bir **savunma** savaş oyunu. Oyuncu bazen bir **asker** (birinci şahıs), bazen **komutan** (üçüncü şahıs) olarak oynar. Ana hikâye bir sefer boyunca ilerler; savaşların arasında **savaş kampında** olaylar yaşanır. Sorular savaşın içinde değil, savaştan önceki ve sonraki aşamalarda sorulur ve savaşın gidişini belirler.

## 1. Temel kararlar

| Konu | Karar |
|---|---|
| Platform | Bilgisayar tarayıcısı, Three.js, Cloudflare Workers'ta yayın |
| Kamera | Savaşta asker: 1. şahıs · Komutan: 3. şahıs · Kamp: 3. şahıs |
| Dönem | 19. yüzyıl ağırlıklı (1860'lar) → hikâye ilerledikçe I. Dünya Savaşı teknolojisi (1914–18) |
| Taraf | Biz hep **savunuruz**: mevzi, kale, köprü, kıyı, kamp, konvoy savunması |
| Ülkeler | Gerçek ülkeler (Osmanlı, Fransa, Prusya/Almanya, Britanya, Rusya, Avusturya-Macaristan…) ve kurgusal ülkeler (Ardıçova, Demirmark…) |
| Şiddet | Az kanlı: vurulan asker küçük bir kızıl toz ile devrilir, kısa süre sonra kaybolur |
| Sorular | Aşama 1, 2 ve 4'te; savaşta (Aşama 3) soru yok |
| Soru kaynakları | Tarih soruları, LGS bankası (Türkçe, Matematik, Fen, İnkılap, Din), Notion yanlış defteri |

## 2. Oyun döngüsü

**Kamp → Brifing → Aşama 1 → Aşama 2 → Aşama 3 (Savaş) → Aşama 4 → Kamp**

| Aşama | Ne olur | Ders ağırlığı | Doğru cevap | Yanlış cevap (hafif) |
|---|---|---|---|---|
| 1. Konuşlanma | 3D arazide birlikler mevzilere yerleştirilir, plan seçilir | Matematik, sözel mantık, tarih | İstihbarat: bir bölgede sis kalkar; ek birlik hakkı; siper/tahkimat | Bölge sisli kalır |
| 2. Son hazırlık | Teftiş: silah, cephane, at, araç ve **ekmek** kontrolü | Fen (basınç, basit makineler, elektrik, enerji) | Birlik bakımlı (tutukluk yok), cephane tam, ekmek dağıtılır → moral | Tutukluk/arıza riski, yarım cephane |
| 3. Savaş | Gerçek zamanlı savunma. Asker 1. şahıs, komutan 3. şahıs | — | — | — |
| 4. Savaş sonrası | Ganimet toplanır, yaralılar tahliye edilir, kampa dönülür | Türkçe, İnkılap, Din, yanlış defteri | Ganimet sandığı açılır, yaralı kurtarılır, şan | Sandık kilitli kalır |

Yanlış defteri soruları "özel ganimet sandığı" olarak gelir (daha değerli ödül).

## 3. Kaynaklar, moral ve ekmek

- **Ekmek**: Ordunun yakıtı. Her savaş öncesi her manga 1 ekmek tayını tüketir. Tayın alamayan manga düşük moralle başlar. Kampta **Fırın** binası ekmek üretir; un ganimetle ve ikmal ile gelir.
- **Moral** (manga başına 0–100): Ekmek, kazanılan çarpışmalar, yakında komutan/subay/bando, sancak, siper içinde olmak artırır. Kayıplar, topçu ateşi, süvari hücumu, yağmur/soğuk, açlık azaltır. Moral 25'in altına düşen manga **bozulur** ve geri kaçar; toparlanabilir.
- **Diğer kaynaklar**: Altın, Demir, Barut, At, Kömür/Yakıt (motorlu dönem), Şan (terfi).

## 4. Teknoloji ve üretim ağacı

Teknoloji araştırması kampta **Harp Okulu**'nda yapılır (kaynak + görev süresi). Açılan teknoloji ilgili birlik/silah/aracın **üretimini** açar. Üretim kamp binalarında yapılır: Kışla (piyade), Ahır (süvari, at), Tophane (top, cephane), Atölye (araç, motor), Tersane (gemi), Hangar (balon, uçak), Fırın (ekmek).

Dört kol, beş çağ (1860 · 1870 · 1880–90 · 1900–10 · 1914–18):

1. **Piyade ve silah**: Ağızdan dolma tüfek → Kuyruktan dolma (iğneli tüfek) → Metal fişek → Şarjörlü dumansız barutlu tüfek → Hafif makineli/el bombası/alev silahı
2. **Süvari ve at**: Hafif süvari → Mızraklı, kürasiyer → Ejder (atlı piyade) → Atlı topçu → Deve süvarisi, motosikletli keşif
3. **Topçu ve makine**: Ağızdan dolma top → Çelik kuyruktan dolma (Krupp tipi) → Gatling → Maxim → Obüs/havan → Tank
4. **Lojistik, haberleşme, hava, deniz**: Fırın/ikmal arabası → Telgraf/heliograf → Demiryolu, zırhlı tren → Gözetleme balonu → Sahra telefonu → Kamyon, zırhlı otomobil → Çift kanatlı keşif uçağı → Avcı uçağı, zeplin · Buharlı zırhlı gemi → Torpido botu → Kıyı topçusu

## 5. Birlikler

**Piyade**: Tüfekçi (hat piyadesi), Avcı/nişancı, Keskin nişancı, Bomba eri, İstihkâmcı (siper, tel, mayın, köprü), Sıhhiyeci, Sancaktar (moral), Borazancı/Bando (moral), Makineli tüfek ekibi, Havan ekibi, Alev eri, Telefoncu (topçu çağırır), Gözcü.

**Süvari**: Hafif süvari (hussar: hızlı, keşif, kovalama), Mızraklı süvari (ilk çarpışmada çok güçlü), Kürasiyer (zırhlı ağır süvari), Ejder (atlı piyade: atla gelir, inip tüfekle savaşır), Kazak/akıncı tipi düzensiz süvari (baskın), Atlı topçu (hızlı top), Deve süvarisi (çölde dayanıklı), Motosikletli keşif (geç dönem).

**Topçu**: Sahra topu, Ağır top, Obüs (tepe arkasını vurur), Havan, Gatling, Maxim, Kıyı topu, Uçaksavar topu.

**Araç, hava, deniz**: İkmal arabası, Kamyon, Zırhlı otomobil, Zırhlı tren, Tank (yavaş, arızalı ama siperi ezer), Gözetleme balonu (sisi kaldırır), Zeplin, Çift kanatlı keşif ve avcı uçağı, Buharlı zırhlı gemi, Torpido botu.

**Kendi asker türünü yap** (Kışla → Birlik Tasarla): Temel sınıf (piyade/süvari/topçu ekibi) + silah + ekipman (kalpak/kask, zırh, dürbün, kürek, el bombası) + eğitim (talim, nişancılık, süngü) + renk ve ad. Bedel ve özellikler (can, hız, isabet, moral) seçimlere göre hesaplanır. Teknoloji ağacında açık olmayan parça seçilemez.

## 6. Silahlar (her biri işlevli)

| Silah | Özellik |
|---|---|
| Ağızdan dolma tüfek | Güçlü, çok yavaş doldurma, yağmurda tutukluk, yoğun barut dumanı |
| İğneli / kuyruktan dolma tüfek | Yatarak doldurulabilir, daha hızlı |
| Şarjörlü tüfek (dumansız) | 5'li şarjör, duman yok → yerini belli etmez |
| Toplu tabanca | Subay; yakın mesafe, hızlı |
| Süngü / kılıç / mızrak | Yakın dövüş; mızrak süvari hücumunda çok güçlü |
| Keskin nişancı tüfeği | Dürbün, nefes tutma, rüzgâr etkisi |
| Gatling | Elle çevrilir, yüksek atış hızı, tutukluk riski |
| Maxim | Sürekli ateş, ısınır (su ile soğutma), süvariyi durdurur |
| El bombası | Siperi temizler; sis bombası görüşü keser |
| Alev silahı | Siper/sığınak, çok kısa menzil |
| Sahra topu / obüs / havan | Balistik atış; obüs ve havan tepe arkasını vurur; misket (yakın) / tane (uzak) |

## 7. İklim ve hava

İklimler: Ilıman, Karlı dağ, Kurak/çöl, Bataklık/orman, Kıyı. Hava: Açık, Bulutlu, Yağmur, Kar, Sis, Fırtına; günün saati: Şafak, Gündüz, Akşam, Gece.

- **Sis/gece**: görüş mesafesi düşer → savaş sisi büyür.
- **Yağmur**: ağızdan dolma silahlar tutukluk yapar, çamur süvariyi ve topları yavaşlatır.
- **Kar/soğuk**: ekmek tüketimi artar, moral düşer.
- **Çöl/sıcak**: su ve ekmek önemli, atlar yorulur; deve süvarisi avantajlı.
- **Rüzgâr**: duman ve keskin nişancı atışını sürükler.

## 8. Savaş sisi

Düşman yalnızca bir dost biriminin görüş alanındaysa görünür. Görüşü artıranlar: Aşama 1 istihbaratı, gözcü, dürbün, tepe, gözetleme balonu, keşif uçağı, işaret fişeği (gece). Sis bombası ve barut dumanı görüşü keser.

## 9. Modlar

1. **Ana Sefer** — hikâyeli kampanya (kamp, olaylar, görevler)
2. **Serbest Savunma** — harita, iklim, hava, ülke ve birlik seç
3. **Dalga Savunması** — giderek güçlenen saldırılar, skor
4. **Tarihi Savunmalar** — gerçek savunma muharebeleri (ör. Plevne 1877, Çanakkale 1915)
5. **Köprü/Geçit Tutma** — dar alanda dayanma
6. **Kıyı Savunması** — kıyı topları ve mayınla gemilere karşı
7. **Kamp Baskını** — gece, kendi kampını savun
8. **Konvoy Koruma** — ikmal arabalarını/treni hedefe ulaştır
9. **Kuşatma Altında** — kale savunması, ekmek azalırken dayan
10. **Günün Görevi** — herkese aynı harita, hava ve sorular
11. **Tatbikat** — yanlış defteri ağırlıklı sorularla eğitim savaşı
12. **Poligon** — kampta silah deneme

## 10. Hikâye (Ana Sefer, taslak)

Kurgusal sınır ülkesi **Ardıçova**, kuzeydeki **Demirmark İmparatorluğu**'nun saldırısına uğrar. Oyuncu genç bir teğmen olarak başlar, bölüm bölüm terfi eder ve 1860'lardan 1918'e uzanan bir savunma savaşında ordusunu modernleştirir. Gerçek ülkeler silah satıcısı, müttefik, gözlemci ya da tarihi savunmalarda taraf olarak yer alır.

Kamp karakterleri: Çavuş Halit (eğitim), Sıhhiyeci Nermin (revir), Aşçı Rıza Usta (fırın, moral), Tamirci Kemal (atölye), Telgrafçı Selim (haberler, görevler), Yüzbaşı Demir (amir).

Kamp olayları: ekmek kıtlığı, casus şüphesi, kayıp ikmal arabası, köylülerin yardım çağrısı, mektuplar, askerler arası anlaşmazlık, salgın, gece baskını, yabancı silah tüccarı, firari.

## 11. Ölçek ve performans

| Ayar | Aynı anda asker | Araç/top |
|---|---|---|
| Düşük | ~80 | 6 |
| Orta (varsayılan) | ~160 | 12 |
| Yüksek | ~300 | 20 |

Askerler parça parça çizilen low-poly modellerdir; tüm askerler **instanced** çizilir (birkaç düzine çizim çağrısı). Oynama süresinin ~%85–90'ı 3D'dir; sorular, menüler ve diyaloglar 3D sahnenin üstünde 2D paneldir.

## 12. Geliştirme aşamaları

1. **Dikey dilim** (bu sürüm): kamp, 4 aşamalı döngü, sorular, asker ve komutan modları, iklim/hava, savaş sisi, süvari, topçu, balon, ekmek/moral, teknoloji/üretim ağacı, birlik tasarlama, kayıt.
2. Daha çok harita, Tarihi Savunmalar, kıyı/gemi savunması, zırhlı tren.
3. Uçaklar ve tanklar sahada tam oynanır hale; siper ağı ve tel örgü inşası.
4. Hikâyenin tamamı, kamp olaylarının genişlemesi, ses ve müzik.
