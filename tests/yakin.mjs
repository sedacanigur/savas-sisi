// Çatışmayı yakından görüntüle: düşmanın en yoğun olduğu yere kamera
import {chromium} from "/opt/npm-tools/node_modules/playwright/index.mjs";
const [harita = "tepe", saat = "gunduz", hava = "acik", yil = "1870", sure = "40"] = process.argv.slice(2);
const b = await chromium.launch({executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]});
const p = await b.newPage({viewport: {width: 1280, height: 720}});
const hatalar = [];
p.on("pageerror", e => hatalar.push("pageerror: " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 5).join("\n")));
const bekle = ms => p.waitForTimeout(ms);
await p.goto("http://localhost:8765/index.html"); await bekle(1500);
await p.evaluate(() => { localStorage.setItem("savassisi-ayar-v1", JSON.stringify({grafik: "dusuk", kamera: "komutan", soru: {tarih: true, lgs: true, yanlis: false}})); });
await p.reload(); await bekle(1500);
await p.click("text=Serbest Savunma"); await bekle(300);
await p.selectOption(".modal select.harita", harita); await p.selectOption(".modal select.saat", saat); await p.selectOption(".modal select.hava", hava);
await p.$eval(".modal input.yil", (e, v) => { e.value = v; e.dispatchEvent(new Event("input")); }, yil);
await p.click(".modal .basla"); await bekle(4000);
await p.click(".ileri"); await bekle(1200); await p.click(".basla"); await bekle(800);
await p.evaluate(() => window.__hiz = 6);
await bekle(+sure * 1000);
await p.evaluate(() => window.__hiz = 1);
for (let i = 0; i < 3; i++) {
  const c = await p.evaluate((i) => { const s = window.__savas; let e = s.askerler.filter(a => a.taraf === 1 && !a.olu && a.gorunur && !a.arac && a.durum !== "sandal"); if (!e.length) { window.__hepsi = true; e = s.askerler.filter(a => a.taraf === 1 && !a.olu && a.durum !== "gizli"); } const bz = s.askerler.filter(a => a.taraf === 0 && !a.olu && !a.arac && !a.komutan);
    if (!e.length) return {yok: true, t: s.zaman, toplam: s.askerler.filter(a => a.taraf === 1 && !a.olu).length, sandal: s.askerler.filter(a => a.durum === "sandal").length, dalga: s.dalgaI, dusen: s.ist.dusen, kayip: s.ist.kayip, bitti: s.bitti, ornek: s.askerler.filter(a => a.taraf === 1 && !a.olu).slice(0, 3).map(a => [Math.round(a.x), Math.round(a.z), a.durum, a.manga.ai])}; e.sort((p, q) => q.z - p.z); const h = e[0];
    let en = bz[0], ed = 1e9; for (const a of bz) { const d = (a.x - h.x) ** 2 + (a.z - h.z) ** 2; if (d < ed) { ed = d; en = a; } }
    const mx = (h.x + en.x) / 2, mz = (h.z + en.z) / 2; const y = s.A.yuzey(mx, mz); const L = Math.sqrt(ed);
    const yan = i % 2 ? 1 : -1;
    const kx = en.x + (h.x - en.x) * 0.25 + yan * 14, kz = en.z + (h.z - en.z) * 0.25 + 10;
    return {k: [kx, s.A.yuzey(kx, kz) + 4.5, kz, h.x, h.y + 1, h.z], n: e.length, t: s.zaman, dusen: s.ist.dusen, kayip: s.ist.kayip, L};
  }, i);
  console.log(JSON.stringify(c));
  if (c && c.k) await p.evaluate(k => window.__kam = k, c.k);
  await bekle(2500); await p.screenshot({path: `/tmp/yk_${i}.png`});
  await bekle(3000);
}
console.log(hatalar.slice(0, 8).join("\n") || "hata yok");
await b.close();
