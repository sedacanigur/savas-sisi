// Motor: WebGL çizici, sahne, kamera ve aktif ekranın döngüsü.
import * as THREE from "three";
import {G, kareSonu} from "./girdi.js";
import {GRAFIK} from "./veri/oyun.js";
import {AYAR} from "./kayit.js";

const tuval = document.getElementById("sahne");
G.tuval = tuval;
const renderer = new THREE.WebGLRenderer({canvas: tuval, antialias: true, powerPreference: "high-performance"});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.type = THREE.PCFShadowMap;
const sahne = new THREE.Scene();
const kamera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.05, 2600);
sahne.add(kamera);

export const motor = {
  renderer, sahne, kamera, aktif: null, odak: null, sarsinti: 0, hasarFlas: 0, birinciSahis: false,
  grafik() { return GRAFIK[AYAR.grafik] || GRAFIK.orta; },
  ayarUygula() {
    const g = this.grafik();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2) * g.piksel);
    renderer.shadowMap.enabled = g.golge;
    renderer.setSize(innerWidth, innerHeight, false);
  },
  ekran(e) { if (this.aktif && this.aktif.bitir) this.aktif.bitir(); this.aktif = e; this.odak = null; if (e && e.baslat) e.baslat(); },
};
motor.ayarUygula();
addEventListener("resize", () => { kamera.aspect = innerWidth / innerHeight; kamera.updateProjectionMatrix(); motor.ayarUygula(); });

let son = performance.now(), fpsT = 0, kare = 0;
motor.fps = 60;
function dongu(t) {
  requestAnimationFrame(dongu);
  const dt = Math.min(0.1, (t - son) / 1000); son = t;
  kare++; fpsT += dt; if (fpsT > 1) { motor.fps = kare / fpsT; kare = 0; fpsT = 0; }
  if (motor.aktif && motor.aktif.guncelle) motor.aktif.guncelle(dt);
  // parçacık ölçeği ekran yüksekliğine göre
  if (motor.efekt) motor.efekt.olcek(renderer.domElement.height / Math.tan(kamera.fov * Math.PI / 360) * 0.5);
  renderer.render(sahne, kamera);
  kareSonu();
}
requestAnimationFrame(dongu);
