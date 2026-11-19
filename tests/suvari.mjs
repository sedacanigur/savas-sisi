// Süvari dengesi: 3 düşman süvari bölüğü hat ve kare düzenindeki piyadeye
import {chromium} from "/opt/npm-tools/node_modules/playwright/index.mjs";
const b = await chromium.launch({executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]});
const p = await b.newPage({viewport: {width: 960, height: 540}});
const hatalar = []; p.on("pageerror", e => hatalar.push(e.message + " | " + (e.stack || "").split("\n").slice(1, 3).join(" | ")));
const bekle = ms => p.waitForTimeout(ms);
await p.goto("http://localhost:8765/index.html"); await bekle(1000);
await p.evaluate(() => localStorage.setItem("savassisi-ayar-v1", JSON.stringify({grafik: "dusuk", kamera: "komutan", soru: {tarih: true, lgs: false, yanlis: false}})));
await p.reload(); await bekle(1200);
await p.click("text=Serbest Savunma"); await bekle(300);
await p.selectOption(".modal select.harita", "koy");
await p.$eval(".modal input.yil", e => { e.value = 1866; e.dispatchEvent(new Event("input")); });
await p.click(".modal .basla"); await bekle(700); await p.click(".ordukur .tamam"); await bekle(3500);
await p.click(".ileri"); await bekle(1000); await p.click(".basla"); await bekle(500);
for (const otoKare of [false, true]) {
  await p.evaluate((ok) => { const s = window.__savas; s.dalgalar = []; s.dalgaI = 0;
    for (const a of s.askerler) if (a.taraf === 1) { a.olu = true; a.olumT = 99; }
    for (const m of s.mangalar) if (m.taraf === 0) { m.otoKare = ok; s.dizilisDegistir(m, "hat"); }
    s.ist.suvari = [0, 0]; s._k0 = s.ist.kayip; s._d0 = s.ist.dusen;
    s.dalgaCikar({tur: "kurasiyer", adet: 2, kanat: "merkez"}); s.dalgaCikar({tur: "mizrakli", adet: 1, kanat: "sol"});
    for (const m of s.mangalar) if (m.taraf === 1 && m.atli) { m.x = m.cx = 0; m.z = m.cz = -40; s.formasyon(m, true); }
    window.__hiz = 10; }, otoKare);
  await bekle(40000);
  const d = await p.evaluate(() => { const s = window.__savas; return {kayip: s.ist.kayip - s._k0, dusen: s.ist.dusen - s._d0, suvariOldurdu: s.ist.suvari, diz: s.mangalar.filter(m => m.taraf === 0 && !m.komutan).map(m => m.dizilis).join(","), t: Math.round(s.zaman)}; });
  console.log(otoKare ? "KARE" : "HAT ", JSON.stringify(d));
}
console.log(hatalar.slice(0, 5).join("\n") || "hata yok");
await b.close();
