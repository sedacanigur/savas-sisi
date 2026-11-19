// Patlama ve duman yakın çekim testi
import {chromium} from "/opt/npm-tools/node_modules/playwright/index.mjs";
const b = await chromium.launch({executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]});
const p = await b.newPage({viewport: {width: 1280, height: 720}});
p.on("pageerror", e => console.log("ERR", e.message));
const bekle = ms => p.waitForTimeout(ms);
await p.goto("http://localhost:8765/index.html"); await bekle(1200);
await p.evaluate(() => localStorage.setItem("savassisi-ayar-v1", JSON.stringify({grafik: "orta", kamera: "komutan", soru: {tarih: true, lgs: false, yanlis: false}})));
await p.reload(); await bekle(1500);
await p.click("text=Serbest Savunma"); await bekle(300);
await p.selectOption(".modal select.harita", process.argv[2] || "tepe"); await p.selectOption(".modal select.saat", process.argv[3] || "gunduz");
await p.click(".modal .basla"); await bekle(4000);
await p.click(".ileri"); await bekle(1200); await p.click(".basla"); await bekle(800);
// kamera: 1. bölüğün arkasından ileriye
await p.evaluate(() => { const s = window.__savas; const m = s.mangalar.find(m => m.taraf === 0 && !m.komutan); const y = s.A.yuzey(m.x, m.z + 9);
  window.__kam = [m.x + 6, y + 2.2, m.z + 9, m.x - 4, y + 2, m.z - 40]; window.__test = {m}; });
await bekle(600);
// tüm manga yaylım ateşi
await p.evaluate(() => { const s = window.__savas, m = window.__test.m; for (const a of m.askerler) { a.poz = "nisan"; a.yon = Math.PI; s.namluEfekt(a, m.silah); } });
await bekle(250); await p.screenshot({path: "/tmp/pt_yaylim0.png"});
await bekle(1500); await p.screenshot({path: "/tmp/pt_yaylim1.png"});
// patlamalar
await p.evaluate(() => { const s = window.__savas, m = window.__test.m; for (const [dx, dz, b] of [[-10, -35, 1.4], [12, -50, 1]]) { const x = m.x + dx, z = m.z + dz; s.E.patlama(x, s.A.yuzey(x, z), z, b); } });
await bekle(120); await p.screenshot({path: "/tmp/pt_pat0.png"});
await bekle(500); await p.screenshot({path: "/tmp/pt_pat1.png"});
await bekle(2500); await p.screenshot({path: "/tmp/pt_pat2.png"});
// askerlere yakından bak
await p.evaluate(() => { const s = window.__savas, m = window.__test.m; const a = m.askerler[3]; window.__kam = [a.x + 2.2, a.y + 1.6, a.z - 3.2, a.x, a.y + 1.1, a.z]; });
await bekle(800); await p.screenshot({path: "/tmp/pt_asker.png"});
await b.close();
