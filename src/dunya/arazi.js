// Arazi üretici: yükseklik, renk, su, ağaçlar, kayalar, evler, duvarlar, siperler, tel örgü,
// siper (kapak) haritası, rota noktaları ve savaş sisi dokusu.
import * as THREE from "three";
import {gurultu, rng, ss, clamp} from "./gurultu.js";
import {birlestir} from "../modeller/kalabalik.js";

// çim tutamı dokusu (kodla)
let CIM = null;
function cimDoku() {
  if (CIM) return CIM;
  const c = document.createElement("canvas"); c.width = 64; c.height = 64; const g = c.getContext("2d");
  for (let i = 0; i < 26; i++) { const x = 6 + Math.random() * 52, h = 24 + Math.random() * 38, e = (Math.random() - 0.5) * 18; const l = 150 + Math.random() * 105;
    g.strokeStyle = `rgb(${l},${l},${l})`; g.lineWidth = 1.5 + Math.random() * 1.8; g.beginPath(); g.moveTo(x, 64); g.quadraticCurveTo(x + e * 0.3, 64 - h * 0.6, x + e, 64 - h); g.stroke(); }
  CIM = new THREE.CanvasTexture(c); CIM.colorSpace = THREE.SRGBColorSpace; CIM.generateMipmaps = false; CIM.minFilter = THREE.LinearFilter; return CIM;
}
const DETAY_GLSL = `
float hs(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hs(i), hs(i+vec2(1,0)), f.x), mix(hs(i+vec2(0,1)), hs(i+vec2(1,1)), f.x), f.y); }
`;

export const S = 520, YARI = S / 2;
const KG = 130; // kapak ızgarası (4 m)

export function araziKur(sahne, {tip = "tepe", iklim, seed = 1, seg = 128, agacSayisi = 520, kamp = false, cimSayisi = 8000}) {
  const n = gurultu(seed), r = rng(seed * 7 + 3);
  const A = {tip, S, suSeviye: null, hedef: {x: 0, z: 140, r: 22}, konus: {x0: -150, x1: 150, z0: 40, z1: 180},
    giris: {sol: {x: -150, z: -245}, merkez: {x: 0, z: -245}, sag: {x: 150, z: -245}}, rotalar: {}, cikarma: null,
    siperHatti: null, teller: [], evler: [], duvarlar: [], tabyalar: [], kopru: null, sig: null, grup: new THREE.Group()};
  if (tip === "siper") seg = Math.max(seg, 220);
  const ozel = []; // yükseklik değiştiriciler
  // ---------- düzen ----------
  const yol = z => 10 * Math.sin(z / 70) + 4 * Math.sin(z / 23);
  let derinSu = null;
  switch (tip) {
    case "tepe": A.hedef = {x: 0, z: 95, r: 24}; A.konus = {x0: -160, x1: 160, z0: 40, z1: 175}; break;
    case "gecit": A.hedef = {x: 0, z: 130, r: 22}; A.konus = {x0: -70, x1: 70, z0: 30, z1: 175};
      A.giris = {sol: {x: -40, z: -245}, merkez: {x: 0, z: -245}, sag: {x: 40, z: -245}}; break;
    case "kopru": A.hedef = {x: 0, z: 120, r: 24}; A.suSeviye = 0; A.konus = {x0: -170, x1: 170, z0: 30, z1: 175};
      A.kopru = {x: 0, z: -10, uz: 40, gen: 7}; A.sig = {x: 150, z: -10, r: 16}; break;
    case "koy": A.hedef = {x: 0, z: 110, r: 26}; A.konus = {x0: -160, x1: 160, z0: 50, z1: 175}; break;
    case "vaha": A.hedef = {x: 0, z: 135, r: 26}; A.suSeviye = 0.4; A.konus = {x0: -170, x1: 170, z0: 50, z1: 180}; break;
    case "kale": A.hedef = {x: 0, z: 140, r: 22}; A.konus = {x0: -150, x1: 150, z0: 40, z1: 180}; break;
    case "kiyi": A.hedef = {x: 0, z: 110, r: 24}; A.suSeviye = 0; A.konus = {x0: -170, x1: 170, z0: -10, z1: 170};
      A.cikarma = {sol: {x: -120, z: -64}, merkez: {x: 0, z: -64}, sag: {x: 120, z: -64}};
      A.giris = {sol: {x: -120, z: -64}, merkez: {x: 0, z: -64}, sag: {x: 120, z: -64}}; break;
    case "siper": A.hedef = {x: 0, z: 110, r: 30}; A.konus = {x0: -180, x1: 180, z0: 70, z1: 175}; break;
    case "kamp": A.hedef = {x: 0, z: 120, r: 30}; A.konus = {x0: -150, x1: 150, z0: 60, z1: 180}; break;
  }
  const siperZ = x => 84 + 5 * Math.sin(x / 9) * (Math.abs(((x / 18) % 2) - 1) > 0.5 ? 1 : -1) + 3 * Math.sin(x / 40);
  if (tip === "siper") A.siperHatti = siperZ;
  const nehirZ = x => -10 + 12 * Math.sin(x / 60);
  // Kale ve köy nesneleri
  if (tip === "kale") {
    A.duvarlar.push(...duvarKare(0, 140, 74, 54, 5, 2.2, 10));
    A.tabyalar.push({x: -95, z: 55, r: 15}, {x: 95, z: 55, r: 15}, {x: 0, z: 40, r: 13});
    A.evler.push({x: -15, z: 150, w: 10, d: 8, h: 6}, {x: 18, z: 152, w: 12, d: 9, h: 7});
  }
  if (tip === "koy") {
    const yer = [[0, 108], [-22, 118], [24, 116], [-35, 95], [36, 92], [-10, 132], [14, 136], [-48, 125], [52, 128], [0, 84]];
    for (const [x, z] of yer) A.evler.push({x: x + (r() - 0.5) * 4, z: z + (r() - 0.5) * 4, w: 7 + r() * 5, d: 6 + r() * 4, h: 4 + r() * 2, a: (r() - 0.5) * 0.6});
    for (let i = 0; i < 9; i++) { const x = -90 + i * 22 + r() * 6, z = 70 + r() * 10; A.duvarlar.push({x, z, w: 14 + r() * 6, d: 0.7, h: 1.2, a: (r() - 0.5) * 0.3}); }
  }
  if (tip === "kamp") for (let i = 0; i < 18; i++) A.evler.push({cadir: true, x: -60 + (i % 6) * 24 + r() * 4, z: 105 + Math.floor(i / 6) * 20 + r() * 4, w: 5, d: 6, h: 3.4});
  if (tip === "siper") {
    for (const zz of [52, -132]) for (let x = -230; x < 230; x += 8) if (r() > 0.12) A.teller.push({x, z: zz + Math.sin(x / 13) * 3 + (r() - 0.5) * 2});
  }
  // ---------- yükseklik ----------
  function h(x, z) {
    let y = 3 + 5 * n.fbm(x / 140, z / 140, 4) + 1.2 * n.fbm(x / 25, z / 25, 2);
    switch (tip) {
      case "tepe": y += 16 * Math.exp(-(((z - 85) / 55) ** 2)) - 5 * ss(-50, -240, z) + 10 * ss(140, 250, Math.abs(x)) * n.fbm(x / 60, z / 60, 2) ; break;
      case "gecit": { const c = 12 * Math.sin(z / 90); const d = Math.abs(x - c); y += 62 * ss(55, 175, d) * (0.8 + 0.4 * n.fbm(x / 50, z / 50, 3)) + 10 * Math.exp(-(((z - 95) / 45) ** 2)) * (1 - ss(40, 90, d)); break; }
      case "kopru": { y = 2.2 + 2 * n.fbm(x / 120, z / 120, 3) + 0.6 * n.fbm(x / 20, z / 20, 2) + 6 * ss(30, 200, z); const d = Math.abs(z - nehirZ(x));
        let bed = -2.4; if (Math.abs(x - 150) < 18) bed = -0.35; y = y * ss(5, 22, d) + bed * (1 - ss(5, 22, d)); break; }
      case "koy": y += 4 * Math.exp(-(((z - 105) / 70) ** 2)); break;
      case "vaha": { y = 3 + 9 * n.ridge(x / 90, z / 70, 3) + 3 * n.fbm(x / 30, z / 30, 2); const d = Math.hypot(x, z - 155); y = y * ss(14, 45, d) + (-1.5) * (1 - ss(14, 45, d)) + 1.5 * ss(14, 30, d) * (1 - ss(30, 45, d)); break; }
      case "kale": { y += 5 * Math.exp(-(((z - 140) / 60) ** 2));
        for (const t of A.tabyalar) { const d = Math.hypot(x - t.x, z - t.z); y += 2.6 * Math.exp(-(((d - t.r) / 3) ** 2)) + 1.2 * (d < t.r ? 1 : 0); } break; }
      case "kiyi": y = -9 + 36 * ss(-150, 130, z) + 5 * n.fbm(x / 70, z / 70, 3) * ss(-120, -60, z) + 3 * n.fbm(x / 20, z / 20, 2) * ss(-90, -40, z); break;
      case "siper": { y = 3 + 2 * n.fbm(x / 160, z / 160, 3) + 3 * ss(-60, 140, z);
        const d = Math.abs(z - siperZ(x)); y -= 1.9 * (1 - ss(1.6, 3.2, d)); y += 0.6 * Math.exp(-(((z - siperZ(x) + 4.2) / 1.3) ** 2));
        const d2 = Math.abs(z - (-170 + 4 * Math.sin(x / 11))); y -= 1.7 * (1 - ss(1.6, 3.2, d2));
        const cn = n(x / 9 + 100, z / 9 - 40); if (z > -150 && z < 60 && cn > 0.55) y -= (cn - 0.55) * 7; break; }
      case "kamp": y = 2 + 2 * n.fbm(x / 160, z / 160, 3); break;
    }
    // yol izi (hafif)
    return y;
  }
  // ---------- ızgara ----------
  const N = seg + 1, H = new Float32Array(N * N), adim = S / seg;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) H[j * N + i] = h(-YARI + i * adim, -YARI + j * adim);
  A.yukseklik = (x, z) => {
    const fx = clamp((x + YARI) / adim, 0, seg - 0.001), fz = clamp((z + YARI) / adim, 0, seg - 0.001);
    const i = fx | 0, j = fz | 0, u = fx - i, v = fz - j;
    const a = H[j * N + i], b = H[j * N + i + 1], c = H[(j + 1) * N + i], d = H[(j + 1) * N + i + 1];
    // PlaneGeometry üçgen bölünmesine uygun
    return (u + v < 1) ? a + (b - a) * u + (c - a) * v : d + (c - d) * (1 - u) + (b - d) * (1 - v);
  };
  A.yuzey = (x, z) => { let y = A.yukseklik(x, z); if (A.kopru && Math.abs(x - A.kopru.x) < A.kopru.gen / 2 && Math.abs(z - nehirZ(x)) < A.kopru.uz / 2) y = Math.max(y, 1.3); return y; };
  A.derinSu = (x, z) => A.suSeviye !== null && A.yuzey(x, z) < A.suSeviye - 0.8;
  A.suda = (x, z) => A.suSeviye !== null && A.yuzey(x, z) < A.suSeviye - 0.05;
  // rotalar (kanat → noktalar)
  const H0 = A.hedef;
  const rota = (...p) => p.map(([x, z]) => ({x, z}));
  for (const k of ["sol", "merkez", "sag"]) A.rotalar[k] = rota([A.giris[k].x, A.giris[k].z], [A.giris[k].x * 0.6, -60], [A.giris[k].x * 0.35, 40], [H0.x, H0.z]);
  if (tip === "kopru") {
    A.rotalar.sol = rota([-150, -245], [-60, -70], [0, -40], [0, 20], [-10, 80], [H0.x, H0.z]);
    A.rotalar.merkez = rota([0, -245], [0, -40], [0, 20], [0, 80], [H0.x, H0.z]);
    A.rotalar.sag = rota([150, -245], [150, -40], [150, 30], [70, 90], [H0.x, H0.z]);
  }
  if (tip === "gecit") for (const k of ["sol", "merkez", "sag"]) A.rotalar[k] = rota([A.giris[k].x, -245], [A.giris[k].x * 0.8, -80], [A.giris[k].x * 0.6, 40], [H0.x, H0.z]);
  if (tip === "kiyi") for (const k of ["sol", "merkez", "sag"]) A.rotalar[k] = rota([A.cikarma[k].x, A.cikarma[k].z], [A.cikarma[k].x * 0.8, -20], [A.cikarma[k].x * 0.4, 50], [H0.x, H0.z]);

  // ---------- mesh ----------
  const geo = new THREE.PlaneGeometry(S, S, seg, seg); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, renk = new Float32Array(pos.count * 3);
  const Z = iklim.zemin.map(c => new THREE.Color(c)), T = new THREE.Color(iklim.toprak), tmp = new THREE.Color();
  const kum = new THREE.Color("#cdb88a"), kar = new THREE.Color("#f4f6f8"), kaya = new THREE.Color("#7f7c74"), camur = new THREE.Color("#4e4030");
  for (let k = 0; k < pos.count; k++) {
    const x = pos.getX(k), z = pos.getZ(k), i = Math.round((x + YARI) / adim), j = Math.round((z + YARI) / adim), y = H[j * N + i];
    pos.setY(k, y);
    const e = n.fbm(x / 30 + 50, z / 30, 3), e2 = n(x / 6, z / 6);
    tmp.copy(Z[0]).lerp(Z[1], clamp(0.5 + e, 0, 1)).lerp(Z[2], clamp(e2 * 0.5 + 0.2, 0, 0.6));
    // eğim → kaya
    const gx = (H[j * N + Math.min(i + 1, seg)] - H[j * N + Math.max(i - 1, 0)]) / (2 * adim), gz = (H[Math.min(j + 1, seg) * N + i] - H[Math.max(j - 1, 0) * N + i]) / (2 * adim);
    const egim = Math.hypot(gx, gz);
    tmp.lerp(kaya, ss(0.45, 1.1, egim) * 0.8);
    if (iklim.sicaklik === 0 || (tip === "gecit" && y > 30)) tmp.lerp(kar, ss(0.9, 0.4, egim) * (iklim.sicaklik === 0 ? 0.7 : ss(30, 50, y)));
    // yol
    const yolX = yol(z);
    if (tip !== "siper" && tip !== "kiyi" && tip !== "vaha" && Math.abs(x - yolX) < 3.5 && z > -250 && z < A.hedef.z + 30) tmp.lerp(T, 0.55);
    if (A.suSeviye !== null) { const w = y - A.suSeviye; if (w < 2.5) tmp.lerp(tip === "vaha" ? kum : (tip === "kiyi" ? kum : camur), ss(2.5, 0.2, w) * 0.85); }
    if (tip === "siper") { if (z > -165 && z < 70) tmp.lerp(camur, 0.55 + 0.3 * e); const d = Math.abs(z - siperZ(x)); if (d < 4.5) tmp.lerp(T, 0.8); }
    if (tip === "kiyi" && z < -30 && z > -70) tmp.lerp(kum, 0.8 * ss(-30, -45, z));
    if (A.tabyalar.length) for (const t of A.tabyalar) { const d = Math.hypot(x - t.x, z - t.z); if (Math.abs(d - t.r) < 4) tmp.lerp(T, 0.6); }
    renk[k * 3] = tmp.r; renk[k * 3 + 1] = tmp.g; renk[k * 3 + 2] = tmp.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(renk, 3));
  geo.computeVertexNormals();
  // savaş sisi dokusu
  const SN = 96, sisVeri = new Uint8Array(SN * SN).fill(255);
  const sisTex = new THREE.DataTexture(sisVeri, SN, SN, THREE.RedFormat, THREE.UnsignedByteType);
  sisTex.magFilter = THREE.LinearFilter; sisTex.minFilter = THREE.LinearFilter; sisTex.needsUpdate = true;
  const sisU = {sisTex: {value: sisTex}, sisGuc: {value: 0}, sisBoy: {value: S}, zaman: {value: 0}};
  const mat = new THREE.MeshLambertMaterial({vertexColors: true});
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, sisU);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vDunya;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvDunya = (modelMatrix * vec4(transformed,1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vDunya; uniform sampler2D sisTex; uniform float sisGuc; uniform float sisBoy;" + DETAY_GLSL)
      .replace("#include <color_fragment>", `#include <color_fragment>
        vec2 dp = vDunya.xz;
        float d1 = vn(dp * 0.9), d2 = vn(dp * 3.3), d3 = vn(dp * 0.07), d4 = vn(dp * 0.25 + 17.0);
        diffuseColor.rgb *= 0.8 + 0.18 * d1 + 0.1 * d2 + 0.1 * d4;
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.12, 1.05, 0.82), smoothstep(0.55, 0.9, d3) * 0.6);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.85, 0.92, 0.8), smoothstep(0.6, 0.95, d4) * 0.5);`)
      .replace("#include <dithering_fragment>", `#include <dithering_fragment>
        float g = texture2D(sisTex, vDunya.xz / sisBoy + 0.5).r;
        float s = (1.0 - g) * sisGuc;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.42,0.45,0.5) * (0.35 + 0.4*gl_FragColor.rgb), s);`);
  };
  const zemin = new THREE.Mesh(geo, mat); zemin.receiveShadow = true; zemin.name = "zemin";
  A.grup.add(zemin); A.zemin = zemin;
  A.sis = {veri: sisVeri, boy: SN, tex: sisTex, u: sisU};
  // su
  if (A.suSeviye !== null) {
    const suGeo = tip === "vaha" ? new THREE.CircleGeometry(48, 40) : new THREE.PlaneGeometry(S * 1.6, S * 1.6);
    suGeo.rotateX(-Math.PI / 2);
    const su = new THREE.Mesh(suGeo, new THREE.MeshPhongMaterial({color: tip === "kiyi" ? "#2f6f8f" : (tip === "vaha" ? "#3f8f9f" : "#4b6a5a"), transparent: true, opacity: 0.82, shininess: 90, specular: "#8fb4c8"}));
    su.position.set(0, A.suSeviye, tip === "vaha" ? 155 : 0); A.grup.add(su); A.su = su;
  }
  // kenarda ufuk
  const ufuk = new THREE.Mesh(new THREE.RingGeometry(S * 0.7, S * 3, 32, 1), new THREE.MeshLambertMaterial({color: Z[0].clone().multiplyScalar(0.8)}));
  ufuk.rotation.x = -Math.PI / 2; ufuk.position.y = tip === "kiyi" ? -1 : 0.5; if (tip !== "kiyi") A.grup.add(ufuk);

  // ---------- kapak (siper) ızgarası ----------
  const KP = new Float32Array(KG * KG), kh = S / KG;
  A.kapakEkle = (x, z, rr, v) => {
    const i0 = Math.max(0, Math.floor((x - rr + YARI) / kh)), i1 = Math.min(KG - 1, Math.floor((x + rr + YARI) / kh));
    const j0 = Math.max(0, Math.floor((z - rr + YARI) / kh)), j1 = Math.min(KG - 1, Math.floor((z + rr + YARI) / kh));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const cx = -YARI + (i + 0.5) * kh, cz = -YARI + (j + 0.5) * kh; if (Math.hypot(cx - x, cz - z) <= rr + kh * 0.5) KP[j * KG + i] = Math.max(KP[j * KG + i], v); }
  };
  A.kapak = (x, z) => { const i = clamp(Math.floor((x + YARI) / kh), 0, KG - 1), j = clamp(Math.floor((z + YARI) / kh), 0, KG - 1); return KP[j * KG + i]; };

  // ---------- nesneler ----------
  const M = (c) => new THREE.MeshLambertMaterial({color: c});
  const tasMat = M("#9a948a"), duvarMat = M("#b5ab98"), catiMat = M("#8c4a32"), ahsapMat = M("#6b4a2b"), cadirMat = M("#d8ccb0");
  for (const e of A.evler) {
    const y = A.yukseklik(e.x, e.z);
    const g = new THREE.Group(); g.position.set(e.x, y, e.z); g.rotation.y = e.a || 0;
    if (e.cadir) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.01, e.w * 0.6, e.h, 4, 1), cadirMat); c.rotation.y = Math.PI / 4; c.position.y = e.h / 2; c.scale.set(1, 1, e.d / e.w); g.add(c);
    } else {
      const b = new THREE.Mesh(new THREE.BoxGeometry(e.w, e.h, e.d), duvarMat); b.position.y = e.h / 2 - 0.3; b.castShadow = b.receiveShadow = true; g.add(b);
      const cat = new THREE.Mesh(new THREE.CylinderGeometry(0.01, e.w * 0.75, 2.6, 4, 1), catiMat); cat.rotation.y = Math.PI / 4; cat.scale.set(1, 1, e.d / e.w); cat.position.y = e.h + 1; cat.castShadow = true; g.add(cat);
      const kapi = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 0.1), ahsapMat); kapi.position.set(0, 0.7, e.d / 2 + 0.03); g.add(kapi);
    }
    A.grup.add(g);
    A.kapakEkle(e.x, e.z, Math.max(e.w, e.d) * 0.7 + 2, 0.5);
  }
  for (const d of A.duvarlar) {
    const y = A.yukseklik(d.x, d.z);
    const m = new THREE.Mesh(new THREE.BoxGeometry(d.w, d.h, d.d), d.h > 2 ? tasMat : duvarMat);
    m.position.set(d.x, y + d.h / 2 - 0.4, d.z); m.rotation.y = d.a || 0; m.castShadow = m.receiveShadow = true; A.grup.add(m);
    const L = Math.max(d.w, d.d); for (let t = -L / 2; t <= L / 2; t += 3) { const c = Math.cos(d.a || 0), s = Math.sin(d.a || 0); const px = d.w > d.d ? d.x + t * c : d.x + t * s, pz = d.w > d.d ? d.z - t * s : d.z + t * c; A.kapakEkle(px, pz, 3.5, d.h > 2 ? 0.6 : 0.45); }
  }
  for (const t of A.tabyalar) A.kapakEkle(t.x, t.z, t.r + 3, 0.5);
  if (A.kopru) {
    const k = A.kopru; const g = new THREE.Group(); g.position.set(k.x, 0, nehirZ(k.x));
    const deck = new THREE.Mesh(new THREE.BoxGeometry(k.gen, 0.5, k.uz), ahsapMat); deck.position.y = 1.2; deck.castShadow = deck.receiveShadow = true; g.add(deck);
    for (let i = -2; i <= 2; i++) for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 0.4), ahsapMat); p.position.set(sx * k.gen / 2, -0.6, i * k.uz / 5); g.add(p); const kor = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, k.uz / 5), ahsapMat); kor.position.set(sx * (k.gen / 2 - 0.1), 1.9, i * k.uz / 5); g.add(kor); }
    A.grup.add(g);
  }
  if (tip === "siper") {
    // kum torbaları siper önünde
    const tor = [];
    for (let x = -240; x < 240; x += 1.6) tor.push([x, siperZ(x) - 3.4]);
    for (let x = -240; x < 240; x += 1.6) tor.push([x, -170 + 4 * Math.sin(x / 11) + 3.4]);
    const tm = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.45, 0.8), M("#a8956b"), tor.length * 2);
    const o = new THREE.Object3D(); let c = 0;
    for (const [x, z] of tor) for (let k = 0; k < 2; k++) { o.position.set(x + (k ? 0.75 : 0), A.yukseklik(x, z) + 0.25 + k * 0.42, z); o.rotation.set(0, (Math.random() - 0.5) * 0.2, 0); o.updateMatrix(); tm.setMatrixAt(c++, o.matrix); }
    tm.castShadow = true; A.grup.add(tm);
    for (let x = -240; x < 240; x += 3) A.kapakEkle(x, siperZ(x), 2.6, 0.65);
  }
  if (A.teller.length) {
    const kaz = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 1.4, 0.12), ahsapMat, A.teller.length);
    const o = new THREE.Object3D(); const pts = [];
    A.teller.forEach((t, i) => { const y = A.yukseklik(t.x, t.z); o.position.set(t.x, y + 0.6, t.z); o.rotation.set((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3); o.updateMatrix(); kaz.setMatrixAt(i, o.matrix); t.y = y; });
    for (let i = 0; i < A.teller.length - 1; i++) { const a = A.teller[i], b = A.teller[i + 1]; if (Math.abs(a.x - b.x) > 10) continue; for (const yy of [0.4, 0.8, 1.15]) pts.push(a.x, a.y + yy, a.z, b.x, b.y + yy + (Math.random() - 0.5) * 0.2, b.z); pts.push(a.x, a.y + 0.3, a.z, b.x, b.y + 1.1, b.z); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    A.grup.add(kaz, new THREE.LineSegments(lg, new THREE.LineBasicMaterial({color: "#3a3a3a"})));
  }
  // ---------- ağaçlar ve kayalar ----------
  const agaclar = [];
  const yogun = iklim.agacYogun * (tip === "siper" ? 0.25 : tip === "vaha" ? 0.5 : 1);
  const hedefSayi = Math.round(agacSayisi * yogun);
  for (let d = 0; agaclar.length < hedefSayi && d < hedefSayi * 12; d++) {
    const x = (r() - 0.5) * S * 0.98, z = (r() - 0.5) * S * 0.98;
    const orman = n.fbm(x / 80 + 300, z / 80, 3);
    if (tip === "vaha") { const dd = Math.hypot(x, z - 155); if (dd > 60 || dd < 20) continue; }
    else if (orman < 0.05 && r() > 0.12) continue;
    if (A.suSeviye !== null && A.yukseklik(x, z) < A.suSeviye + 0.6) continue;
    if (Math.hypot(x - A.hedef.x, z - A.hedef.z) < A.hedef.r + 14) continue;
    if (tip !== "siper" && tip !== "kiyi" && Math.abs(x - yol(z)) < 6) continue;
    if (A.evler.some(e => Math.hypot(e.x - x, e.z - z) < 10)) continue;
    if (tip === "kale" && Math.abs(x) < 45 && Math.abs(z - 140) < 35) continue;
    if (tip === "siper" && Math.abs(z - siperZ(x)) < 6) continue;
    if (tip === "gecit" && A.yukseklik(x, z) > 45) continue;
    agaclar.push({x, z, s: 0.7 + r() * 0.7, t: r()});
  }
  if (agaclar.length) {
    const tur = iklim.agac;
    const govGeo = new THREE.CylinderGeometry(0.18, 0.3, 1, 5); govGeo.translate(0, 0.5, 0);
    let tepeGeo;
    if (tur === "cam") { tepeGeo = birlestir([new THREE.ConeGeometry(2.4, 3.6, 8).translate(0, 3.6, 0), new THREE.ConeGeometry(1.9, 3.2, 8).translate(0, 5.3, 0), new THREE.ConeGeometry(1.3, 2.8, 8).translate(0, 7, 0)]); }
    else if (tur === "palmiye") { const yap = []; for (let i = 0; i < 7; i++) yap.push(new THREE.BoxGeometry(0.5, 0.06, 3.2).translate(0, 0, 1.6).rotateX(0.35).rotateY(i / 7 * Math.PI * 2)); tepeGeo = birlestir(yap).translate(0, 6.6, 0); }
    else if (tur === "cali") { tepeGeo = birlestir([new THREE.IcosahedronGeometry(1.2, 1).translate(0, 1.0, 0), new THREE.IcosahedronGeometry(0.9, 1).translate(0.8, 0.8, 0.3)]); }
    else { tepeGeo = birlestir([new THREE.IcosahedronGeometry(2.2, 1).translate(0, 5, 0), new THREE.IcosahedronGeometry(1.7, 1).translate(1.3, 5.9, 0.4), new THREE.IcosahedronGeometry(1.6, 1).translate(-1.2, 5.6, -0.6), new THREE.IcosahedronGeometry(1.4, 1).translate(0.2, 6.8, -0.3)]); }
    const gov = new THREE.InstancedMesh(govGeo, M("#5a4330"), agaclar.length), tepe = new THREE.InstancedMesh(tepeGeo, new THREE.MeshLambertMaterial({color: "#ffffff"}), agaclar.length);
    const o = new THREE.Object3D(), c = new THREE.Color();
    const yb = {cam: "#2f4f35", palmiye: "#5f7a2f", cali: "#5d6a3a", yaprak: "#4f6f32"}[tur] || "#4f6f32";
    agaclar.forEach((a, i) => {
      const y = A.yukseklik(a.x, a.z) - 0.2;
      o.position.set(a.x, y, a.z); o.rotation.set(0, a.t * 6, 0);
      o.scale.set(a.s, tur === "cali" ? 0.6 : (tur === "palmiye" ? 7 * a.s : 4 * a.s), a.s); o.updateMatrix(); gov.setMatrixAt(i, o.matrix);
      o.scale.set(a.s, a.s * (0.9 + a.t * 0.3), a.s); o.updateMatrix(); tepe.setMatrixAt(i, o.matrix);
      c.set(yb).offsetHSL((a.t - 0.5) * 0.05, 0, (a.t - 0.5) * 0.12); if (iklim.sicaklik === 0) c.lerp(new THREE.Color("#e8eef2"), 0.35 * a.t); tepe.setColorAt(i, c);
      A.kapakEkle(a.x, a.z, 2.2, 0.25);
    });
    gov.castShadow = tepe.castShadow = true; tepe.receiveShadow = true;
    A.grup.add(gov, tepe);
  }
  A.agaclar = agaclar;
  const kayalar = [];
  for (let i = 0; i < 140 * iklim.kayaYogun; i++) { const x = (r() - 0.5) * S * 0.95, z = (r() - 0.5) * S * 0.95; if (A.suSeviye !== null && A.yukseklik(x, z) < A.suSeviye + 0.3) continue; if (Math.hypot(x - A.hedef.x, z - A.hedef.z) < 20) continue; kayalar.push({x, z, s: 0.5 + r() * 1.8}); }
  if (kayalar.length) {
    const km = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), M(iklim.sicaklik === 2 ? "#a88e6a" : "#8a867d"), kayalar.length);
    const o = new THREE.Object3D();
    kayalar.forEach((k, i) => { o.position.set(k.x, A.yukseklik(k.x, k.z) + k.s * 0.2, k.z); o.rotation.set(r() * 3, r() * 3, r() * 3); o.scale.set(k.s * 1.3, k.s * 0.8, k.s); o.updateMatrix(); km.setMatrixAt(i, o.matrix); if (k.s > 1) A.kapakEkle(k.x, k.z, k.s + 1, 0.3); });
    km.castShadow = true; km.receiveShadow = true; A.grup.add(km);
  }
  // ---------- çim tutamları ----------
  const cimRenk = iklim.cim;
  if (cimRenk && cimSayisi > 0) {
    const n2 = tip === "vaha" ? cimSayisi * 0.2 : cimSayisi;
    const geo = birlestir([new THREE.PlaneGeometry(0.8, 0.45).translate(0, 0.22, 0), new THREE.PlaneGeometry(0.8, 0.45).translate(0, 0.22, 0).rotateY(Math.PI / 2)]);
    geo.setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0], 2));
    const nr = geo.attributes.normal; for (let i = 0; i < nr.count; i++) nr.setXYZ(i, 0, 1, 0); // zemin gibi aydınlansın
    const cm = new THREE.MeshLambertMaterial({map: cimDoku(), alphaTest: 0.45, side: THREE.DoubleSide});
    cm.onBeforeCompile = sh => { sh.uniforms.zaman = sisU.zaman; sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform float zaman;").replace("#include <begin_vertex>", `#include <begin_vertex>
      vec4 wp = instanceMatrix * vec4(0.0,0.0,0.0,1.0); float sal = sin(zaman * 1.7 + wp.x * 0.3 + wp.z * 0.2) * 0.12 * position.y; transformed.x += sal; transformed.z += sal * 0.6;`); };
    const cim = new THREE.InstancedMesh(geo, cm, Math.round(n2)); const o = new THREE.Object3D(), c = new THREE.Color(); let k = 0;
    for (let d = 0; k < n2 && d < n2 * 4; d++) {
      const x = (r() - 0.5) * S * 0.96, z = (r() - 0.5) * S * 0.96;
      if (A.suSeviye !== null && A.yukseklik(x, z) < A.suSeviye + 0.3) continue;
      if (tip === "vaha" && Math.hypot(x, z - 155) > 70) continue;
      if (tip === "siper" && z > -165 && z < 70 && r() < 0.8) continue;
      if (n.fbm(x / 40, z / 40 + 80, 2) < -0.25) continue;
      o.position.set(x, A.yukseklik(x, z) - 0.05, z); o.rotation.set(0, r() * 3, 0); const sc = 0.6 + r() * 0.9; o.scale.set(sc, sc * (0.7 + r() * 0.6), sc); o.updateMatrix(); cim.setMatrixAt(k, o.matrix);
      c.set(cimRenk).offsetHSL((r() - 0.5) * 0.04, (r() - 0.5) * 0.1, (r() - 0.5) * 0.1 + 0.04); cim.setColorAt(k, c); k++;
    }
    cim.count = k; cim.receiveShadow = true; A.grup.add(cim);
  }
  sahne.add(A.grup);
  A.dispose = () => { sahne.remove(A.grup); A.grup.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()); }); sisTex.dispose(); };
  return A;
}

function duvarKare(cx, cz, w, d, h, kal, kapi) {
  const L = [];
  L.push({x: cx, z: cz + d / 2, w, d: kal, h}); // güney
  L.push({x: cx - w / 2, z: cz, w: kal, d, h}); L.push({x: cx + w / 2, z: cz, w: kal, d, h});
  const p = (w - kapi) / 2; // kuzey kapılı
  L.push({x: cx - w / 2 + p / 2, z: cz - d / 2, w: p, d: kal, h}); L.push({x: cx + w / 2 - p / 2, z: cz - d / 2, w: p, d: kal, h});
  return L;
}
