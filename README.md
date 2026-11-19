# Savaş Sisi

Tarayıcıda oynanan, 1860–1918 arasında geçen 3D bir **savunma** savaş oyunu. Savaşta asker olarak birinci şahıs, komutan olarak üçüncü şahıs oynanır. Ana hikâye bir sefer boyunca ilerler; savaşların arasında savaş kampında olaylar yaşanır. Sorular savaştan önce ve sonra sorulur ve savaşın gidişini belirler.

Tasarımın tamamı için: [TASARIM.md](TASARIM.md). Oyunun görünen adı `src/veri/oyun.js` içindeki `OYUN_ADI` sabitindedir.

## Görev döngüsü
1. **Konuşlanma:** Mangalar yerleştirilir. İstihbarat soruları hazırlık puanı kazandırır; puanla keşif yapılır (savaş sisi kalkar), siper kazılır, topçu hakkı ya da ek manga alınır.
2. **Son hazırlık:** Ekmek dağıtılır, mangalar teftiş edilir. Doğru cevap bakımlı silah, tam cephane ve yüksek moral demektir.
3. **Savaş:** Gerçek zamanlıdır, soru sorulmaz. Asker (1. şahıs) ile komutan (3. şahıs) arasında `V` ile geçilir, `Tab` taktik haritayı açar.
4. **Ganimet:** Sandıklar açılır ve yaralılar kurtarılır (her biri bir soru), sonra kampa dönülür.

## Modlar
Ana Sefer (10 bölüm, 1866–1918), Serbest Savunma, Dalga Savunması, Tarihi Savunmalar (Plevne, Arıburnu, Bazeilles), Köprü Tutma, Kamp Baskını, Kuşatma Altında, Günün Görevi, Tatbikat. Kıyı Savunması ve Konvoy Koruma henüz yapılmadı.

## Birlikler
Piyade: hat piyadesi, avcı, zuhaf, muhafız alayı, tüfekçi, keskin nişancı, istihkâmcı, sıhhiye, sancak muhafızları, bomba eri, telefoncu, alev eri, hücum eri.
Süvari: hafif süvari, mızraklı, kürasiyer, ejder, akıncı, Kazak, deve süvarisi, motosikletli, atlı topçu.
Topçu ve makine: sahra, çelik, seri atışlı ve obüs bataryaları, katırlı dağ bataryası, kuşatma topu, roket bataryası, havan, Gatling, mitralyöz, Maxim.
Yeni piyade/süvari: milis, grenadiyer, dağlılar, uzun mızraklılar, Bersaglieri, Tirol avcıları, efeler, gerilla, kızıl gömlekliler, lağımcı, bando, ölüm hüsarları, Spencer süvarisi, cephane arabası.
Bölükler 30–65 kişidir (keşif/sıhhiye gibi küçük ekipler hariç). Bölüklerde subay, sancaktar ve borazancı vardır; subay ya da sancak düşerse moral sarsılır. Askerlerin ana silahının yanında kılıç, mızrak, yatağan, kama ya da tabanca gibi ikinci silahları vardır. Askerler yaralanabilir: hafif yaralı topallar, ağır yaralı yere düşer ve savaş sonunda revire gider.

Savaştan önce **asker kartlarıyla** bölüklerini seçersin ve yanına en çok iki **komutan** alırsın (kampta Ordu → Komutanlar sekmesinden şanla tutulur). Her komutanın bir pasif etkisi ve `N`/`M` ile kullanılan bir yeteneği vardır.

**Düzenler:** Hat, Kare (süvariye karşı), Kol (hızlı yürüyüş), Dağınık (topçuya karşı), Kama (hücum). Komutan modunda `Z` hat, `C` kare, `K` kol, `J` dağınık.

Destek, araç, hava: ikmal arabası, gözetleme balonu, zırhlı otomobil, tank, keşif ve avcı uçağı, zeplin. Ayrıca Kışla'da kendi birliğini tasarlayabilirsin.

## Grafik
Grafik ayarı (Düşük/Orta/Yüksek) sahadaki asker sayısını (500/900/1400), düşman dalgalarının kalabalığını, çim ve ağaç yoğunluğunu, gölgeleri ve parçacık sayısını belirler. Duman, ateş ve toz dokuları kodla üretilir; patlamalarda ışık parlaması, ateş topu, toprak fıskiyesi, fizikli enkaz, şok dalgası, yanık izi ve duman sütunu vardır.

## Kontroller
| Asker (1. şahıs) | Komutan (3. şahıs) |
|---|---|
| `WASD` yürü, `Shift` koş, `C` diz çök | `WASD` yürü, `1–9` manga seç |
| Sol tık ateş, sağ tık nişan, `R` doldur | Sağ tık: mangayı oraya gönder (`Shift` ile koşarak) |
| `Q` süngü/kılıç, `G` el bombası | `G` hücum ya da topa hedef, `H` mevzini tut, `X` geri çekil |
| `T` topçu ateşi, `F` işaret fişeği, `B` borazan | `T` topçu ateşi, `F` fişek, `B` borazan, sol tık tabanca |
| `1/2/3` ana silah / tabanca / yakın silah | `Z/C/K/J` düzen, `N/M` komutan yetenekleri |
| `V` komutana geç, `Tab` taktik harita | `V` askere geç, `Tab` taktik harita, `F1` yardım |

`P` ya da sağ üstteki düğme savaşı duraklatır (ayarlar ve "Savaştan çekil" buradadır).

## Klasörler
- `src/veri/` — ülkeler, silahlar, birlikler (süvari türleri dahil), teknoloji ve üretim ağacı, haritalar, iklim ve hava, hikâye ve kamp olayları
- `src/dunya/` — arazi üretici (9 harita düzeni), gökyüzü, hava durumu, savaş sisi dokusu
- `src/modeller/` — parça parça çizilen (instanced) asker ve at kalabalığı ile pozlar; toplar, makineli, balon, uçak, zeplin, tank, sandal, kamp eşyaları
- `src/savas/` — savaş simülasyonu (yapay zekâ, atış, topçu, moral ve ekmek, dalgalar), oyuncu kontrolleri, parçacık efektleri
- `src/akis.js` — dört aşamalı görev akışı · `src/kamp.js` — kamp ve paneller · `src/menu.js` — menü ve modlar
- `src/sorular/` — Son Tabur'dan gelen soru bankası (`kaynak/`) ve aşamalara göre soru seçimi
- `vendor/three/` — Three.js r188 (MIT)
- `dist/` — derlenmiş oyun (`index.html` + `oyun.js`)
- `tests/` — Playwright ile tarayıcı testleri

## Derleme
```
npm i esbuild        # yalnızca ilk sefer
node build.mjs
```
`build.mjs` soru dosyalarını birleştirir ve oyunu `dist/oyun.js` olarak paketler. Denemek için `dist` klasörünü bir yerel sunucuda açmak yeterli, örneğin `cd dist && python3 -m http.server`.

## Yayın (Cloudflare Workers)
`wrangler.jsonc` Son Tabur ile aynı yapıdadır: `dist/` statik dosya olarak sunulur, `worker.js` ise `/api/yanlis` adresinde Notion yanlış defterini okur. Yanlış defteri sorularının çalışması için Cloudflare'de `NOTION_TOKEN` gizli değişkenini tanımla (istersen `YANLIS_DB` da).
