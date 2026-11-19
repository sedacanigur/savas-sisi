// Parçacık efektleri: dokulu barut dumanı, namlu alevi, toz, gerçekçi patlama (ateş topu, toprak fıskiyesi,
// enkaz, şok dalgası, yanık izi, ışık parlaması, duman sütunu), sis bombası, az kanlı isabet, su sıçraması.
import * as THREE from "three";

// ---------- kodla üretilen dokular ----------
function tuval(n, ciz) { const c = document.createElement("canvas"); c.width = c.height = n; ciz(c.getContext("2d"), n); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t; }
let DOKU = null;
function dokular() {
  if (DOKU) return DOKU;
  // duman: üst üste binmiş yumuşak bulutçuklar
  const duman = tuval(128, (g, n) => {
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * n * 0.24, x = n / 2 + Math.cos(a) * r, y = n / 2 + Math.sin(a) * r, s = n * (0.1 + Math.random() * 0.17);
      const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, `rgba(255,255,255,${0.16 + Math.random() * 0.12})`); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, n, n);
    }
    const gr = g.createRadialGradient(n / 2, n / 2, n * 0.3, n / 2, n / 2, n / 2); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out"; g.fillStyle = gr; g.fillRect(0, 0, n, n);
  });
  // ateş: sıcak çekirdekli, kenarları dalgalı
  const ates = tuval(64, (g, n) => {
    for (let i = 0; i < 24; i++) { const a = Math.random() * Math.PI * 2, r = Math.random() * n * 0.18, x = n / 2 + Math.cos(a) * r, y = n / 2 + Math.sin(a) * r, s = n * (0.14 + Math.random() * 0.18);
      const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, n, n); }
  });
  // namlu alevi: yıldız
  const parlama = tuval(64, (g, n) => {
    g.translate(n / 2, n / 2);
    for (let i = 0; i < 7; i++) { g.rotate(Math.PI * 2 / 7 + Math.random() * 0.3); const L = n * (0.28 + Math.random() * 0.2); const gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(0, -n * 0.04); g.lineTo(L, 0); g.lineTo(0, n * 0.04); g.fill(); }
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, n * 0.22); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(-n, -n, n * 2, n * 2);
  });
  // yanık izi
  const iz = tuval(128, (g, n) => {
    for (let i = 0; i < 30; i++) { const a = Math.random() * Math.PI * 2, r = Math.random() * n * 0.28, x = n / 2 + Math.cos(a) * r, y = n / 2 + Math.sin(a) * r, s = n * (0.08 + Math.random() * 0.2);
      const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, "rgba(20,16,12,0.5)"); gr.addColorStop(1, "rgba(20,16,12,0)"); g.fillStyle = gr; g.fillRect(0, 0, n, n); }
    for (let i = 0; i < 16; i++) { g.strokeStyle = "rgba(20,16,12,0.35)"; g.lineWidth = 1 + Math.random() * 2; const a = Math.random() * Math.PI * 2; g.beginPath(); g.moveTo(n / 2, n / 2); g.lineTo(n / 2 + Math.cos(a) * n * 0.45, n / 2 + Math.sin(a) * n * 0.45); g.stroke(); }
  });
  DOKU = {duman, ates, parlama, iz};
  return DOKU;
}
export const efektDokulari = () => dokular();

const VS = `
attribute float boy; attribute float alfa; attribute vec3 renk; attribute float don;
varying float vA; varying vec3 vR; varying float vD;
uniform float olcek;
#include <fog_pars_vertex>
void main(){
  vA = alfa; vR = renk; vD = don;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = min(boy * olcek / max(0.1, -mvPosition.z), 900.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const FS = `
uniform sampler2D doku; uniform float golge;
varying float vA; varying vec3 vR; varying float vD;
#include <fog_pars_fragment>
void main(){
  vec2 p = gl_PointCoord - 0.5; float c = cos(vD), s = sin(vD);
  vec2 q = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + 0.5;
  vec4 t = texture2D(doku, q);
  float a = t.a * vA; if (a < 0.004) discard;
  float isik = mix(1.0 - golge, 1.0 + golge * 0.35, 1.0 - gl_PointCoord.y);
  gl_FragColor = vec4(vR * isik * mix(0.85, 1.0, t.r), a);
  #include <fog_fragment>
}`;

class Sistem {
  constructor(sahne, N, {ek = false, doku, golge = 0.3}) {
    this.N = N; this.i = 0;
    const g = new THREE.BufferGeometry();
    this.p = new Float32Array(N * 3); this.v = new Float32Array(N * 3); this.c = new Float32Array(N * 3);
    this.b = new Float32Array(N); this.a = new Float32Array(N); this.d = new Float32Array(N);
    this.yas = new Float32Array(N).fill(1e9); this.omur = new Float32Array(N).fill(1); this.b0 = new Float32Array(N); this.b1 = new Float32Array(N);
    this.a0 = new Float32Array(N); this.yer = new Float32Array(N); this.sur = new Float32Array(N); this.ruz = new Float32Array(N); this.dh = new Float32Array(N);
    this.c0 = new Float32Array(N * 3); this.c1 = new Float32Array(N * 3); this.renkGecis = new Uint8Array(N);
    g.setAttribute("position", new THREE.BufferAttribute(this.p, 3));
    g.setAttribute("renk", new THREE.BufferAttribute(this.c, 3));
    g.setAttribute("boy", new THREE.BufferAttribute(this.b, 1));
    g.setAttribute("alfa", new THREE.BufferAttribute(this.a, 1));
    g.setAttribute("don", new THREE.BufferAttribute(this.d, 1));
    this.mat = new THREE.ShaderMaterial({vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, fog: true,
      blending: ek ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {olcek: {value: 600}, doku: {value: null}, golge: {value: golge}}])});
    this.mat.uniforms.doku.value = doku;
    this.obj = new THREE.Points(g, this.mat); this.obj.frustumCulled = false; this.obj.renderOrder = ek ? 3 : 2;
    sahne.add(this.obj);
  }
  // r,g,b başlangıç rengi; r2.. bitiş rengi (verilmezse aynı)
  ekle(x, y, z, vx, vy, vz, omur, b0, b1, a0, r, gg, bb, yer = 0, sur = 0, ruz = 0, r2, g2, b2) {
    const i = this.i; this.i = (this.i + 1) % this.N;
    this.p[i * 3] = x; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = z;
    this.v[i * 3] = vx; this.v[i * 3 + 1] = vy; this.v[i * 3 + 2] = vz;
    this.c0[i * 3] = r; this.c0[i * 3 + 1] = gg; this.c0[i * 3 + 2] = bb;
    if (r2 !== undefined) { this.c1[i * 3] = r2; this.c1[i * 3 + 1] = g2; this.c1[i * 3 + 2] = b2; this.renkGecis[i] = 1; } else this.renkGecis[i] = 0;
    this.c[i * 3] = r; this.c[i * 3 + 1] = gg; this.c[i * 3 + 2] = bb;
    this.yas[i] = 0; this.omur[i] = omur; this.b0[i] = b0; this.b1[i] = b1; this.a0[i] = a0; this.yer[i] = yer; this.sur[i] = sur; this.ruz[i] = ruz;
    this.d[i] = Math.random() * 6.28; this.dh[i] = (Math.random() - 0.5) * 0.6;
  }
  guncelle(dt, ruzgar) {
    const {p, v, b, a, yas, omur, c, c0, c1} = this;
    for (let i = 0; i < this.N; i++) {
      if (yas[i] >= omur[i]) { if (a[i] !== 0) { a[i] = 0; b[i] = 0; } continue; }
      yas[i] += dt; const t = Math.min(1, yas[i] / omur[i]);
      v[i * 3 + 1] -= this.yer[i] * dt;
      const s = Math.max(0, 1 - this.sur[i] * dt); v[i * 3] *= s; v[i * 3 + 1] *= s; v[i * 3 + 2] *= s;
      p[i * 3] += (v[i * 3] + ruzgar.x * this.ruz[i]) * dt; p[i * 3 + 1] += v[i * 3 + 1] * dt; p[i * 3 + 2] += (v[i * 3 + 2] + ruzgar.y * this.ruz[i]) * dt;
      if (this.zemin && this.yer[i] > 2 && p[i * 3 + 1] < this.zemin(p[i * 3], p[i * 3 + 2])) { v[i * 3] *= 0.3; v[i * 3 + 1] = 0; v[i * 3 + 2] *= 0.3; this.yer[i] = 0; }
      b[i] = this.b0[i] + (this.b1[i] - this.b0[i]) * (1 - (1 - t) * (1 - t));
      a[i] = this.a0[i] * (t < 0.06 ? t / 0.06 : Math.pow(1 - (t - 0.06) / 0.94, 1.4));
      this.d[i] += this.dh[i] * dt;
      if (this.renkGecis[i]) { const k = Math.min(1, t * 3.5); for (let j = 0; j < 3; j++) c[i * 3 + j] = c0[i * 3 + j] + (c1[i * 3 + j] - c0[i * 3 + j]) * k; }
    }
    const g = this.obj.geometry; for (const k of ["position", "alfa", "boy", "renk", "don"]) g.attributes[k].needsUpdate = true;
  }
  yogunluk(x, z, r) { let s = 0; for (let i = 0; i < this.N; i += 2) { if (this.yas[i] >= this.omur[i] || this.a[i] < 0.15) continue; const dx = this.p[i * 3] - x, dz = this.p[i * 3 + 2] - z; if (dx * dx + dz * dz < r * r) s += this.a[i] * this.b[i] * 0.1; } return s; }
  dispose(sahne) { sahne.remove(this.obj); this.obj.geometry.dispose(); this.mat.dispose(); }
}

export function efektKur(sahne, N = 1800) {
  const D = dokular();
  const duman = new Sistem(sahne, Math.round(N * 1.6), {doku: D.duman, golge: 0.35});
  const ates = new Sistem(sahne, Math.round(N / 2), {ek: true, doku: D.ates, golge: 0});
  const parlama = new Sistem(sahne, 160, {ek: true, doku: D.parlama, golge: 0});
  const toz = new Sistem(sahne, N, {doku: D.duman, golge: 0.25});
  const kivilcim = new Sistem(sahne, 500, {ek: true, doku: D.ates, golge: 0});
  const R = Math.random;
  // enkaz parçaları (fizikli küçük taş/toprak parçaları)
  const EN = 260, enkaz = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.16, 0), new THREE.MeshLambertMaterial({color: "#ffffff"}), EN);
  enkaz.frustumCulled = false; enkaz.castShadow = true; enkaz.count = EN; sahne.add(enkaz);
  const ek = Array.from({length: EN}, () => ({x: 0, y: -999, z: 0, vx: 0, vy: 0, vz: 0, t: 99, rx: 0, ry: 0, s: 1}));
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
  for (let i = 0; i < EN; i++) { _m.makeTranslation(0, -999, 0); enkaz.setMatrixAt(i, _m); enkaz.setColorAt(i, _c.set("#5a4a36")); }
  let enI = 0;
  // yanık izleri
  const IZN = 80, izMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({map: D.iz, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, fog: true}), IZN);
  izMesh.frustumCulled = false; izMesh.count = 0; izMesh.renderOrder = 1; sahne.add(izMesh); let izI = 0;
  // şok dalgaları
  const soklar = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({color: "#f4ead0", transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide})); m.visible = false; sahne.add(m); soklar.push({m, t: 9, r: 1}); }
  let sokI = 0;
  // ışık parlamaları (sabit sayıda ışık: shader yeniden derlenmesin)
  const isiklar = []; for (let i = 0; i < 4; i++) { const l = new THREE.PointLight("#ffb46b", 0, 60, 2); sahne.add(l); isiklar.push({l, t: 9, g: 0, s: 0.1}); }
  let isikI = 0;
  let gece = false;
  const E = {
    duman, isik: ates, toz, ruzgar: new THREE.Vector2(), kam: null,
    set gece(g) { gece = g; }, get gece() { return gece; },
    set zemin(f) { E._zemin = f; toz.zemin = f; kivilcim.zemin = f; },
    olcek(h) { for (const s of [duman, ates, parlama, toz, kivilcim]) s.mat.uniforms.olcek.value = h; },
    yakin(x, y, z, r = 200) { const k = E.kam; if (!k) return true; return (k.position.x - x) ** 2 + (k.position.y - y) ** 2 + (k.position.z - z) ** 2 < r * r; },
    flas(x, y, z, guc, sure = 0.12, renk = "#ffb46b") { if (!E.yakin(x, y, z, 120)) return; const L = isiklar[isikI = (isikI + 1) % isiklar.length]; L.l.position.set(x, y, z); L.l.color.set(renk); L.g = guc; L.t = 0; L.s = sure; },
    // ---------- namlu ----------
    namlu(x, y, z, dx, dz, miktar = 1, buyuk = false) {
      const k = buyuk ? 3.2 : 1, yakin = E.yakin(x, y, z, 180);
      parlama.ekle(x + dx * 0.25 * k, y, z + dz * 0.25 * k, dx * 2, 0, dz * 2, 0.06 * (buyuk ? 2 : 1), 0.9 * k, 1.8 * k, 1, 1, 0.82, 0.45);
      if (yakin) { ates.ekle(x + dx * 0.5 * k, y, z + dz * 0.5 * k, dx * 8, 0.3, dz * 8, 0.09 * k, 0.4 * k, 1.1 * k, 0.9, 1, 0.6, 0.2, 0, 3, 0, 0.9, 0.25, 0.05); E.flas(x, y, z, buyuk ? 2500 : 220, buyuk ? 0.18 : 0.07); }
      if (miktar <= 0.05) { if (yakin) duman.ekle(x + dx * 0.4, y, z + dz * 0.4, dx * 1.5, 0.4, dz * 1.5, 1.4, 0.3, 1.2, 0.18, 0.75, 0.75, 0.74, -0.1, 1.5, 0.5); return; }
      // kara barut dumanı: önce ileri fışkırır, sonra büyüyüp asılı kalır ve rüzgârla sürüklenir
      const n = Math.round((buyuk ? 12 : 4) * Math.min(1.6, miktar));
      const g = gece ? 0.42 : 0.86;
      for (let i = 0; i < n; i++) {
        const h = (buyuk ? 14 : 7) * (0.35 + R() * 0.9), sap = (R() - 0.5) * (buyuk ? 2.5 : 1.2);
        const omur = (buyuk ? 20 : 11) + R() * (buyuk ? 12 : 7);
        duman.ekle(x + dx * 0.5, y + (R() - 0.3) * 0.2, z + dz * 0.5, dx * h - dz * sap, 0.25 + R() * 0.45, dz * h + dx * sap, omur, buyuk ? 1.6 : 0.6, (buyuk ? 11 : 4.2) * (0.75 + R() * 0.6), (buyuk ? 0.55 : 0.42) * Math.min(1.3, miktar), g, g * 0.99, g * 0.97, -0.03, 2.2, 0.75);
      }
    },
    // ---------- mermi isabeti ----------
    isabet(x, y, z, tur = "toprak") {
      if (!E.yakin(x, y, z, 150)) return;
      if (tur === "su") { for (let i = 0; i < 6; i++) toz.ekle(x, y, z, (R() - 0.5) * 1.2, 3 + R() * 3, (R() - 0.5) * 1.2, 0.7, 0.25, 0.7, 0.75, 0.85, 0.9, 0.95, 9.8, 0.2); return; }
      if (tur === "asker") { for (let i = 0; i < 3; i++) toz.ekle(x, y, z, (R() - 0.5) * 1.2, 0.4 + R(), (R() - 0.5) * 1.2, 0.3, 0.12, 0.4, 0.55, 0.42, 0.08, 0.08, 3, 1); toz.ekle(x, y, z, 0, 0.3, 0, 0.6, 0.2, 0.7, 0.3, 0.6, 0.55, 0.48); return; }
      if (tur === "metal") { for (let i = 0; i < 6; i++) kivilcim.ekle(x, y, z, (R() - 0.5) * 7, R() * 5, (R() - 0.5) * 7, 0.25, 0.12, 0.05, 1, 1, 0.8, 0.4, 9.8); E.flas(x, y, z, 60, 0.05, "#ffd9a0"); return; }
      for (let i = 0; i < 4; i++) toz.ekle(x, y + 0.05, z, (R() - 0.5) * 1.3, 1.2 + R() * 2.2, (R() - 0.5) * 1.3, 0.6 + R() * 0.4, 0.15, 0.7, 0.75, 0.38, 0.31, 0.23, 7, 0.4);
      toz.ekle(x, y + 0.2, z, 0, 0.4, 0, 1.3, 0.3, 1.4, 0.35, 0.55, 0.5, 0.42, 0, 1, 0.4);
    },
    // ---------- patlama ----------
    patlama(x, y, z, buyukluk = 1, su = false) {
      const b = buyukluk, yakin = E.yakin(x, y, z, 600);
      // ışık ve ateş topu
      E.flas(x, y + 2, z, 9000 * b, 0.35, "#ffa860");
      parlama.ekle(x, y + 1, z, 0, 0, 0, 0.12, 6 * b, 12 * b, 1, 1, 0.85, 0.6);
      if (!su) for (let i = 0; i < 10 * b; i++) { const a = R() * 6.28, s = R() * 4 * b; ates.ekle(x + Math.cos(a) * 0.5, y + 0.5 + R() * b, z + Math.sin(a) * 0.5, Math.cos(a) * s, 2 + R() * 5 * b, Math.sin(a) * s, 0.35 + R() * 0.35, 1.5 * b, (4 + R() * 3) * b, 1, 1, 0.75, 0.35, -1, 2.5, 0, 0.7, 0.18, 0.05); }
      // kıvılcımlar
      if (yakin) for (let i = 0; i < 18 * b; i++) { const a = R() * 6.28, s = 6 + R() * 16; kivilcim.ekle(x, y + 0.5, z, Math.cos(a) * s * 0.6, 6 + R() * 14, Math.sin(a) * s * 0.6, 0.6 + R() * 0.8, 0.25, 0.1, 1, 1, 0.75, 0.35, 9.8, 0.3); }
      // toprak/su fıskiyesi
      for (let i = 0; i < 26 * b; i++) {
        const a = R() * 6.28, s = R() * 7 * b, yuk = 7 + R() * 16 * b;
        if (su) toz.ekle(x, y, z, Math.cos(a) * s * 0.35, yuk * 1.2, Math.sin(a) * s * 0.35, 1.6 + R(), 0.8 * b, 2.2 * b, 0.85, 0.86, 0.91, 0.95, 9.8, 0.25);
        else toz.ekle(x, y, z, Math.cos(a) * s, yuk, Math.sin(a) * s, 1.4 + R() * 1.2, 0.7 * b, (2 + R() * 2) * b, 0.95, 0.27, 0.22, 0.16, 9.8, 0.35, 0.2, 0.42, 0.38, 0.32);
      }
      // yerde yayılan toz halkası
      for (let i = 0; i < 16 * b; i++) { const a = i / (16 * b) * 6.28 + R() * 0.3, s = 8 + R() * 6 * b; toz.ekle(x, y + 0.4, z, Math.cos(a) * s, 0.6 + R(), Math.sin(a) * s, 2.5 + R() * 2, 1.2 * b, 5 * b, 0.55, 0.52, 0.46, 0.38, 0, 1.6, 0.4); }
      // yükselen kara duman sütunu, sonra rüzgârla dağılır
      for (let i = 0; i < 12 * b; i++) { const r = R() * 2 * b; duman.ekle(x + (R() - 0.5) * r, y + 1 + R() * 3 * b, z + (R() - 0.5) * r, (R() - 0.5) * 1.5, 2 + R() * 4 * b, (R() - 0.5) * 1.5, 12 + R() * 10, 2.5 * b, (9 + R() * 6) * b, 0.75, su ? 0.85 : 0.17, su ? 0.87 : 0.15, su ? 0.9 : 0.14, -0.15, 0.5, 0.6); }
      if (!yakin) return;
      // enkaz
      if (!su) for (let i = 0; i < 12 * b; i++) { const e = ek[enI = (enI + 1) % EN]; const a = R() * 6.28, s = 3 + R() * 9; Object.assign(e, {x, y: y + 0.4, z, vx: Math.cos(a) * s, vy: 6 + R() * 12, vz: Math.sin(a) * s, t: 0, rx: R() * 10, ry: R() * 10, s: (0.5 + R() * 1.3) * Math.min(1.4, b)}); enkaz.setColorAt(enI, _c.set(R() < 0.3 ? "#3d3226" : "#6a5840")); }
      enkaz.instanceColor.needsUpdate = true;
      // şok dalgası
      const S = soklar[sokI = (sokI + 1) % soklar.length]; S.m.position.set(x, y + 0.3, z); S.t = 0; S.r = 14 * b; S.m.visible = true;
      // yanık izi / krater
      if (!su) { const i = izI = (izI + 1) % IZN; const r = 3.2 * b * (0.8 + R() * 0.4); _e.set(0, R() * 6.28, 0); _q.setFromEuler(_e); _m.compose(_v.set(x, y + 0.04, z), _q, _s.set(r, 1, r)); izMesh.setMatrixAt(i, _m); izMesh.count = Math.max(izMesh.count, i + 1); izMesh.instanceMatrix.needsUpdate = true; }
    },
    sisBombasi(x, y, z) { for (let i = 0; i < 46; i++) { const a = R() * Math.PI * 2, s = R() * 4; duman.ekle(x, y + 0.5, z, Math.cos(a) * s, 0.4 + R() * 0.6, Math.sin(a) * s, 24 + R() * 12, 4, 17, 0.85, 0.9, 0.9, 0.92, -0.02, 0.35, 0.3); } },
    alev(x, y, z, dx, dz) {
      for (let i = 0; i < 4; i++) { const s = 14 + R() * 6; ates.ekle(x, y, z, dx * s + (R() - 0.5) * 2, 0.5 + R(), dz * s + (R() - 0.5) * 2, 0.9, 0.5, 3.5, 0.95, 1, 0.65 + R() * 0.2, 0.2, -1, 1.2, 0, 0.8, 0.15, 0.03); }
      duman.ekle(x + dx * 12, y + 1, z + dz * 12, dx * 2, 2, dz * 2, 4, 1.5, 6, 0.55, 0.12, 0.11, 0.1, -0.2, 0.5, 0.5);
      E.flas(x + dx * 6, y, z + dz * 6, 600, 0.1, "#ff9040");
    },
    tozKaldir(x, y, z, buyuk = 1) { toz.ekle(x + (R() - 0.5), y + 0.2, z + (R() - 0.5), (R() - 0.5), 0.6 + R() * 0.5, (R() - 0.5), 1.6, 0.6 * buyuk, 2.4 * buyuk, 0.3, 0.6, 0.54, 0.44, 0.2, 1, 0.3); },
    baca(x, y, z) { duman.ekle(x + (R() - 0.5) * 0.3, y, z + (R() - 0.5) * 0.3, 0, 1.2, 0, 7, 0.6, 4.5, 0.4, 0.5, 0.5, 0.52, -0.08, 0.2, 0.4); },
    ates(x, y, z) { ates.ekle(x + (R() - 0.5) * 0.6, y + 0.2, z + (R() - 0.5) * 0.6, 0, 1.2 + R(), 0, 0.6 + R() * 0.3, 0.8, 0.25, 0.9, 1, 0.65, 0.2, -0.5, 0, 0, 0.9, 0.2, 0.04); if (R() < 0.25) duman.ekle(x, y + 1.2, z, 0, 1, 0, 5, 0.5, 3, 0.25, 0.4, 0.4, 0.4, -0.05, 0.2, 0.3); if (R() < 0.1) E.flas(x, y + 1, z, 120, 0.2, "#ff9a4a"); },
    yanan(x, y, z) { ates.ekle(x + (R() - 0.5), y + 0.5, z + (R() - 0.5), 0, 2 + R() * 2, 0, 0.5, 1, 0.4, 0.8, 1, 0.6, 0.2, -1, 0, 0, 0.8, 0.2, 0.05); if (R() < 0.5) duman.ekle(x, y + 2, z, 0, 2, 0, 8, 1, 7, 0.55, 0.13, 0.12, 0.11, -0.1, 0.4, 0.6); },
    guncelle(dt) {
      for (const s of [duman, ates, parlama, toz, kivilcim]) s.guncelle(dt, E.ruzgar);
      // enkaz fiziği
      let degisti = false;
      for (let i = 0; i < EN; i++) {
        const e = ek[i]; if (e.t > 6) continue; e.t += dt; degisti = true;
        e.vy -= 9.8 * dt; e.x += e.vx * dt; e.y += e.vy * dt; e.z += e.vz * dt; e.rx += dt * 8; e.ry += dt * 6;
        const zy = E._zemin ? E._zemin(e.x, e.z) : 0;
        if (e.y < zy + 0.05) { e.y = zy + 0.05; e.vy *= -0.25; e.vx *= 0.5; e.vz *= 0.5; }
        const k = e.t > 5 ? Math.max(0.001, 6 - e.t) : 1;
        _e.set(e.rx, e.ry, 0); _q.setFromEuler(_e); _m.compose(_v.set(e.x, e.y - (e.t > 5 ? (e.t - 5) * 0.2 : 0), e.z), _q, _s.set(e.s * k, e.s * 0.7 * k, e.s * k)); enkaz.setMatrixAt(i, _m);
        if (e.t > 6) { _m.makeTranslation(0, -999, 0); enkaz.setMatrixAt(i, _m); }
      }
      if (degisti) enkaz.instanceMatrix.needsUpdate = true;
      for (const S of soklar) if (S.t < 0.6) { S.t += dt; const k = S.t / 0.6; const r = 1 + S.r * Math.sqrt(k); S.m.scale.set(r, 1, r); S.m.material.opacity = 0.45 * (1 - k); if (S.t >= 0.6) S.m.visible = false; }
      for (const L of isiklar) { if (L.t < L.s) { L.t += dt; L.l.intensity = L.g * Math.max(0, 1 - L.t / L.s) * (0.8 + R() * 0.4); } else L.l.intensity = 0; }
    },
    dumanYogun(x, z, r = 6) { return duman.yogunluk(x, z, r); },
    dispose() {
      for (const s of [duman, ates, parlama, toz, kivilcim]) s.dispose(sahne);
      sahne.remove(enkaz, izMesh); enkaz.geometry.dispose(); izMesh.geometry.dispose();
      for (const S of soklar) { sahne.remove(S.m); S.m.geometry.dispose(); S.m.material.dispose(); }
      for (const L of isiklar) sahne.remove(L.l);
    },
  };
  return E;
}
