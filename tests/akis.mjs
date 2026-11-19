// Akış testi: Serbest Savunma → Aşama 1 → 2 → 3 (savaş) ekran görüntüleri ve hatalar
import {chromium} from "/opt/npm-tools/node_modules/playwright/index.mjs";
const b = await chromium.launch({executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]});
const p = await b.newPage({viewport: {width: 1366, height: 768}});
const hatalar = [];
p.on("pageerror", e => hatalar.push("pageerror: " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 5).join("\n")));
p.on("console", m => { if (m.type() === "error") hatalar.push(m.type() + ": " + m.text()); });
const harita = process.argv[2] || "tepe", saat = process.argv[3] || "gunduz", hava = process.argv[4] || "acik", yil = process.argv[5] || "1870";
const bekle = ms => p.waitForTimeout(ms);
await p.goto("http://localhost:8765/index.html"); await bekle(2500);
await p.click("text=Serbest Savunma"); await bekle(400);
await p.selectOption(".modal select.harita", harita); await p.selectOption(".modal select.saat", saat); await p.selectOption(".modal select.hava", hava);
await p.$eval(".modal input.yil", (e, v) => { e.value = v; e.dispatchEvent(new Event("input")); }, yil);
await p.click(".modal .basla"); await bekle(700); if (await p.$(".ordukur .tamam")) { await p.click(".ordukur .tamam"); } await bekle(5000);
await p.screenshot({path: "/tmp/s_a1.png"});
await p.click(".soru-btn"); await bekle(500);
await p.screenshot({path: "/tmp/s_soru.png"});
await p.click(".sik >> nth=0"); await bekle(300); await p.click(".devam"); await bekle(300);
// keşif (puan varsa)
const k = await p.$(".secenek:not([disabled])"); if (k) { await k.click(); await bekle(800); }
await p.screenshot({path: "/tmp/s_a1b.png"});
await p.click(".ileri"); await bekle(2500);
await p.screenshot({path: "/tmp/s_a2.png"});
await p.click(".tef >> nth=0"); await bekle(400); await p.click(".sik >> nth=1"); await bekle(200); await p.click(".devam"); await bekle(300);
await p.click(".basla"); await bekle(1500);
await p.screenshot({path: "/tmp/s_a3_0.png"});
await bekle(25000);
await p.screenshot({path: "/tmp/s_a3_fps.png"});
await p.keyboard.press("KeyV"); await bekle(3000);
await p.screenshot({path: "/tmp/s_a3_tps.png"});
await p.keyboard.press("Tab"); await bekle(3000);
await p.screenshot({path: "/tmp/s_a3_tak.png"});
const fps = await p.evaluate(() => window.__motor.fps);
console.log("fps", fps.toFixed(1));
console.log(hatalar.slice(0, 12).join("\n") || "hata yok");
await b.close();
