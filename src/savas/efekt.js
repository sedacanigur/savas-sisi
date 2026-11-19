// Parçacık efektleri: barut dumanı, namlu alevi, toz, patlama, sis bombası, az kanlı isabet, su sıçraması.
import * as THREE from "three";

const VS = `
attribute float boy; attribute float alfa; attribute vec3 renk;
varying float vA; varying vec3 vR;
uniform float olcek;
#include <fog_pars_vertex>
void main(){
  vA = alfa; vR = renk;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = boy * olcek / max(0.1, -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const FS = `
varying float vA; varying vec3 vR;
#include <fog_pars_fragment>
void main(){
  vec2 c = gl_PointCoord - 0.5; float d = length(c);
  if(d > 0.5) discard;
  float a = vA * smoothstep(0.5, 0.15, d);
  gl_FragColor = vec4(vR, a);
  #include <fog_fragment>
}`;

class Sistem {
  constructor(sahne, N, ek) {
    this.N = N; this.i = 0;
    const g = new THREE.BufferGeometry();
    this.p = new Float32Array(N * 3); this.v = new Float32Array(N * 3); this.c = new Float32Array(N * 3);
    this.b = new Float32Array(N); this.a = new Float32Array(N);
    this.yas = new Float32Array(N).fill(1e9); this.omur = new Float32Array(N).fill(1); this.b0 = new Float32Array(N); this.b1 = new Float32Array(N);
    this.a0 = new Float32Array(N); this.yer = new Float32Array(N); this.sur = new Float32Array(N); this.ruz = new Float32Array(N);
    g.setAttribute("position", new THREE.BufferAttribute(this.p, 3));
    g.setAttribute("renk", new THREE.BufferAttribute(this.c, 3));
    g.setAttribute("boy", new THREE.BufferAttribute(this.b, 1));
    g.setAttribute("alfa", new THREE.BufferAttribute(this.a, 1));
    this.mat = new THREE.ShaderMaterial({vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, fog: true,
      blending: ek ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {olcek: {value: 600}}])});
    this.obj = new THREE.Points(g, this.mat); this.obj.frustumCulled = false; this.obj.renderOrder = ek ? 3 : 2;
    sahne.add(this.obj);
  }
  ekle(x, y, z, vx, vy, vz, omur, b0, b1, a0, r, gg, bb, yer = 0, sur = 0, ruz = 0) {
    const i = this.i; this.i = (this.i + 1) % this.N;
    this.p[i * 3] = x; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = z;
    this.v[i * 3] = vx; this.v[i * 3 + 1] = vy; this.v[i * 3 + 2] = vz;
    this.c[i * 3] = r; this.c[i * 3 + 1] = gg; this.c[i * 3 + 2] = bb;
    this.yas[i] = 0; this.omur[i] = omur; this.b0[i] = b0; this.b1[i] = b1; this.a0[i] = a0; this.yer[i] = yer; this.sur[i] = sur; this.ruz[i] = ruz;
  }
  guncelle(dt, ruzgar) {
    const {p, v, b, a, yas, omur} = this;
    for (let i = 0; i < this.N; i++) {
      if (yas[i] >= omur[i]) { if (a[i] !== 0) { a[i] = 0; b[i] = 0; } continue; }
      yas[i] += dt; const t = Math.min(1, yas[i] / omur[i]);
      v[i * 3 + 1] -= this.yer[i] * dt;
      const s = Math.max(0, 1 - this.sur[i] * dt); v[i * 3] *= s; v[i * 3 + 1] *= s; v[i * 3 + 2] *= s;
      p[i * 3] += (v[i * 3] + ruzgar.x * this.ruz[i]) * dt; p[i * 3 + 1] += v[i * 3 + 1] * dt; p[i * 3 + 2] += (v[i * 3 + 2] + ruzgar.y * this.ruz[i]) * dt;
      b[i] = this.b0[i] + (this.b1[i] - this.b0[i]) * Math.sqrt(t);
      a[i] = this.a0[i] * (t < 0.08 ? t / 0.08 : 1 - (t - 0.08) / 0.92);
    }
    const g = this.obj.geometry; g.attributes.position.needsUpdate = true; g.attributes.alfa.needsUpdate = true; g.attributes.boy.needsUpdate = true; g.attributes.renk.needsUpdate = true;
  }
  // yarıçap içindeki duman yoğunluğu (görüşü keser)
  yogunluk(x, z, r) { let s = 0; for (let i = 0; i < this.N; i++) { if (this.yas[i] >= this.omur[i] || this.a[i] < 0.15) continue; const dx = this.p[i * 3] - x, dz = this.p[i * 3 + 2] - z; if (dx * dx + dz * dz < r * r) s += this.a[i] * this.b[i] * 0.05; } return s; }
  dispose(sahne) { sahne.remove(this.obj); this.obj.geometry.dispose(); this.mat.dispose(); }
}

export function efektKur(sahne, N = 1800) {
  const duman = new Sistem(sahne, N, false), isik = new Sistem(sahne, Math.round(N / 3), true), toz = new Sistem(sahne, Math.round(N / 2), false);
  const R = Math.random;
  let gece = false;
  const E = {
    duman, isik, toz,
    set gece(g) { gece = g; }, ruzgar: new THREE.Vector2(),
    olcek(h) { for (const s of [duman, isik, toz]) s.mat.uniforms.olcek.value = h * 0.9; },
    namlu(x, y, z, dx, dz, miktar = 1, buyuk = false) {
      // alev
      const k = buyuk ? 3 : 1;
      isik.ekle(x + dx * 0.4, y, z + dz * 0.4, dx * 4, 0, dz * 4, 0.07 * k, 1.2 * k, 2.2 * k, 1, 1, 0.75, 0.35);
      isik.ekle(x + dx * 0.8, y, z + dz * 0.8, dx * 6, 0, dz * 6, 0.05 * k, 0.6 * k, 1.4 * k, 0.9, 1, 0.9, 0.6);
      // barut dumanı
      const n = Math.round(miktar * (buyuk ? 10 : 3));
      const g = gece ? 0.55 : 0.88;
      for (let i = 0; i < n; i++) {
        const h = (buyuk ? 4 : 1.6) * (0.6 + R());
        duman.ekle(x + dx * 0.6, y, z + dz * 0.6, dx * h + (R() - 0.5), 0.3 + R() * 0.5, dz * h + (R() - 0.5), (buyuk ? 9 : 5) + R() * 4, buyuk ? 2 : 0.8, (buyuk ? 9 : 3.6) * (0.8 + R() * 0.5), 0.55 * miktar, g, g, g * 1.02, -0.05, 1.4, 0.6);
      }
    },
    isabet(x, y, z, tur = "toprak") {
      if (tur === "su") { for (let i = 0; i < 5; i++) toz.ekle(x, y, z, (R() - 0.5) * 1.5, 2 + R() * 3, (R() - 0.5) * 1.5, 0.6, 0.3, 0.6, 0.7, 0.85, 0.9, 0.95, 9.8, 0.2); return; }
      if (tur === "asker") { for (let i = 0; i < 3; i++) toz.ekle(x, y, z, (R() - 0.5) * 1.2, 0.5 + R(), (R() - 0.5) * 1.2, 0.35, 0.15, 0.45, 0.6, 0.45, 0.1, 0.1, 3, 1); return; }
      if (tur === "metal") { for (let i = 0; i < 4; i++) isik.ekle(x, y, z, (R() - 0.5) * 6, R() * 4, (R() - 0.5) * 6, 0.15, 0.2, 0.1, 1, 1, 0.8, 0.4, 9.8); return; }
      for (let i = 0; i < 4; i++) toz.ekle(x, y + 0.1, z, (R() - 0.5) * 1.6, 1 + R() * 2, (R() - 0.5) * 1.6, 0.5 + R() * 0.4, 0.25, 0.9, 0.7, 0.42, 0.35, 0.26, 7, 0.5);
    },
    patlama(x, y, z, buyukluk = 1, su = false) {
      const b = buyukluk;
      isik.ekle(x, y + 1, z, 0, 2, 0, 0.18, 4 * b, 14 * b, 1, 1, 0.7, 0.3);
      isik.ekle(x, y + 1.5, z, 0, 3, 0, 0.3, 3 * b, 9 * b, 0.8, 1, 0.45, 0.15);
      for (let i = 0; i < 18 * b; i++) {
        const a = R() * Math.PI * 2, s = 3 + R() * 9;
        if (su) toz.ekle(x, y, z, Math.cos(a) * s * 0.3, 8 + R() * 12, Math.sin(a) * s * 0.3, 1.4, 0.6, 1.4, 0.8, 0.85, 0.92, 0.97, 9.8, 0.2);
        else toz.ekle(x, y, z, Math.cos(a) * s, 4 + R() * 10, Math.sin(a) * s, 1 + R() * 0.8, 0.5, 1.2, 0.95, 0.3, 0.25, 0.18, 9.8, 0.3);
      }
      for (let i = 0; i < 9 * b; i++) duman.ekle(x + (R() - 0.5) * 3, y + 1 + R() * 2, z + (R() - 0.5) * 3, (R() - 0.5) * 2, 1.5 + R() * 2, (R() - 0.5) * 2, 8 + R() * 6, 3 * b, 12 * b, 0.7, 0.26, 0.24, 0.22, -0.1, 0.8, 0.5);
    },
    sisBombasi(x, y, z) {
      for (let i = 0; i < 40; i++) { const a = R() * Math.PI * 2, s = R() * 4; duman.ekle(x, y + 0.5, z, Math.cos(a) * s, 0.4 + R() * 0.6, Math.sin(a) * s, 22 + R() * 10, 4, 16, 0.85, 0.9, 0.9, 0.92, -0.02, 0.35, 0.3); }
    },
    alev(x, y, z, dx, dz) {
      for (let i = 0; i < 3; i++) { const s = 14 + R() * 6; isik.ekle(x, y, z, dx * s + (R() - 0.5) * 2, 0.5 + R(), dz * s + (R() - 0.5) * 2, 0.9, 0.6, 3.5, 0.9, 1, 0.55 + R() * 0.2, 0.15, -1, 1.2); }
      duman.ekle(x + dx * 12, y + 1, z + dz * 12, dx * 2, 2, dz * 2, 3, 1.5, 5, 0.5, 0.15, 0.13, 0.12, -0.2, 0.5, 0.5);
    },
    tozKaldir(x, y, z, buyuk = 1) { toz.ekle(x + (R() - 0.5), y + 0.2, z + (R() - 0.5), (R() - 0.5), 0.6 + R() * 0.5, (R() - 0.5), 1.4, 0.6 * buyuk, 2 * buyuk, 0.35, 0.6, 0.52, 0.4, 0.2, 1, 0.3); },
    baca(x, y, z) { duman.ekle(x + (R() - 0.5) * 0.3, y, z + (R() - 0.5) * 0.3, 0, 1.2, 0, 6, 0.6, 4, 0.4, 0.55, 0.55, 0.57, -0.08, 0.2, 0.4); },
    ates(x, y, z) { isik.ekle(x + (R() - 0.5) * 0.6, y + 0.2, z + (R() - 0.5) * 0.6, 0, 1.4 + R(), 0, 0.5 + R() * 0.3, 0.7, 0.2, 0.9, 1, 0.5 + R() * 0.3, 0.12, -0.5); if (R() < 0.3) duman.ekle(x, y + 1, z, 0, 1, 0, 4, 0.5, 2.5, 0.25, 0.4, 0.4, 0.4, -0.05, 0.2, 0.3); },
    guncelle(dt) { duman.guncelle(dt, E.ruzgar); isik.guncelle(dt, E.ruzgar); toz.guncelle(dt, E.ruzgar); },
    dumanYogun(x, z, r = 6) { return duman.yogunluk(x, z, r); },
    dispose() { duman.dispose(sahne); isik.dispose(sahne); toz.dispose(sahne); },
  };
  return E;
}
