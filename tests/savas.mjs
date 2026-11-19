// Savaş testi: hızlandırılmış savaş, farklı anlarda ekran görüntüsü. Kullanım: node tests/savas.mjs harita saat hava yil rol
import {chromium} from "/opt/npm-tools/node_modules/playwright/index.mjs";
const [harita = "tepe", saat = "gunduz", hava = "acik", yil = "1870", rol = "komutan"] = process.argv.slice(2);
const b = await chromium.launch({executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]});
const p = await b.newPage({viewport: {width: 1280, height: 720}});
const hatalar = [];
p.on("pageerror", e => hatalar.push("pageerror: " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 5).join("\n")));
p.on("console", m => { if (m.type() === "error" && !m.text().includes("404")) hatalar.push(m.text()); });
const bekle = ms => p.waitForTimeout(ms);
await p.goto("http://localhost:8765/index.html"); await bekle(2000);
await p.evaluate(() => { localStorage.setItem("savassisi-ayar-v1", JSON.stringify({grafik: "dusuk", kamera: "komutan", soru: {tarih: true, lgs: true, yanlis: false}})); });
await p.reload(); await bekle(2000);
await p.click("text=Serbest Savunma"); await bekle(300);
await p.selectOption(".modal select.harita", harita); await p.selectOption(".modal select.saat", saat); await p.selectOption(".modal select.hava", hava);
await p.$eval(".modal input.yil", (e, v) => { e.value = v; e.dispatchEvent(new Event("input")); }, yil);
await p.click(".modal .basla"); await bekle(700); if (await p.$(".ordukur .tamam")) { await p.click(".ordukur .tamam"); } await bekle(4500);
await p.click(".ileri"); await bekle(1500);
await p.click(`.rol[data-r="${rol}"]`); await p.click(".basla"); await bekle(1000);
await p.evaluate(() => window.__hiz = 6);
for (let i = 1; i <= 5; i++) {
  await bekle(9000);
  const d = await p.evaluate(() => { const s = window.__savas; return s ? {t: Math.round(s.zaman), dusen: s.ist.dusen, kayip: s.ist.kayip, asker: s.askerler.filter(a => !a.olu).length, bitti: s.bitti} : null; });
  console.log(i, JSON.stringify(d));
  await p.screenshot({path: `/tmp/sv_${i}.png`});
  if (d && d.bitti) break;
}
console.log(hatalar.slice(0, 10).join("\n") || "hata yok");
await b.close();
