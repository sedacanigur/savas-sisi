// Kamp görüntüsü
import {chromium} from "/opt/npm-tools/node_modules/playwright/index.mjs";
const b = await chromium.launch({executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]});
const p = await b.newPage({viewport: {width: 1280, height: 720}});
p.on("pageerror", e => console.log("ERR", e.message, (e.stack || "").split("\n").slice(0, 3).join(" | ")));
const bekle = ms => p.waitForTimeout(ms);
await p.goto("http://localhost:8765/index.html"); await bekle(1000);
await p.evaluate(() => { localStorage.clear(); localStorage.setItem("savassisi-ayar-v1", JSON.stringify({grafik: "orta"})); });
await p.reload(); await bekle(1500);
await p.click("text=Ana Sefer"); await bekle(3500);
await p.click(".modal .btn"); await bekle(600);
const acilar = [[0, 30, -0.35], [2.3, 0, -0.25], [-2.2, -10, -0.3], [3.14, 50, -0.2]];
for (let i = 0; i < acilar.length; i++) {
  await p.evaluate(([yaw, z, pt]) => { const k = window.__motor.aktif; k.ben.x = 0; k.ben.z = z; k.yaw = yaw; k.pitch = pt; }, acilar[i]);
  await bekle(1200); await p.screenshot({path: `/tmp/kp_${i}.png`});
}
await p.evaluate(() => window.__motor.aktif.panel("ordu")); await bekle(600); await p.screenshot({path: "/tmp/kp_ordu.png"});
await b.close();
