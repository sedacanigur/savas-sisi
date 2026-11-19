// Denge testi: hızlandırılmış savaş, kayıp oranları ve süvari etkisi
import {chromium} from "/opt/npm-tools/node_modules/playwright/index.mjs";
const [harita = "tepe", yil = "1866", sure = "60"] = process.argv.slice(2);
const b = await chromium.launch({executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]});
const p = await b.newPage({viewport: {width: 960, height: 540}});
const hatalar = []; p.on("pageerror", e => hatalar.push(e.message + " | " + (e.stack || "").split("\n").slice(1, 3).join(" | ")));
const bekle = ms => p.waitForTimeout(ms);
await p.goto("http://localhost:8765/index.html"); await bekle(1000);
await p.evaluate(() => localStorage.setItem("savassisi-ayar-v1", JSON.stringify({grafik: "dusuk", kamera: "komutan", soru: {tarih: true, lgs: false, yanlis: false}})));
await p.reload(); await bekle(1200);
await p.click("text=Serbest Savunma"); await bekle(300);
await p.selectOption(".modal select.harita", harita);
await p.$eval(".modal input.yil", (e, v) => { e.value = v; e.dispatchEvent(new Event("input")); }, yil);
await p.click(".modal .basla"); await bekle(700); await p.click(".ordukur .tamam"); await bekle(3500);
await p.click(".ileri"); await bekle(1000); await p.click(".basla"); await bekle(500);
await p.evaluate(() => { window.__hiz = 10; });
for (let i = 0; i < 6; i++) {
  await bekle(+sure * 1000 / 6);
  const d = await p.evaluate(() => { const s = window.__savas; const t = (f) => s.askerler.filter(f).length;
    return {t: Math.round(s.zaman), dusen: s.ist.dusen, kayip: s.ist.kayip, yarali: s.ist.yarali, biz: t(a => a.taraf === 0 && !a.olu), dus: t(a => a.taraf === 1 && !a.olu), bozuk: s.mangalar.filter(m => m.bozuk).map(m => m.taraf + ":" + m.tanim.id).join(","), diz: s.mangalar.filter(m => m.taraf === 0 && !m.komutan).map(m => m.dizilis).join(","), bitti: s.bitti, fps: window.__motor.fps.toFixed(1)}; });
  console.log(JSON.stringify(d)); if (d.bitti) break;
}
console.log(hatalar.slice(0, 5).join("\n") || "hata yok");
await b.close();
