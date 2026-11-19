// Savaş Sisi — giriş noktası
import {motor} from "./motor.js";
import {anaMenu} from "./menu.js";
import {OYUN_ADI} from "./veri/oyun.js";

document.title = OYUN_ADI;
try {
  anaMenu();
} catch (e) {
  console.error(e);
  document.getElementById("yukleniyor").textContent = "Oyun başlatılamadı: " + e.message;
}
setTimeout(() => document.getElementById("yukleniyor")?.remove(), 250);
window.__motor = motor;
