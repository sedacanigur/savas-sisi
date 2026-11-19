// Toplar, makineli tüfekler, balon, uçak, zeplin, tank, zırhlı araba, sandal, araba, çadır, sandık, sancak, kamp eşyaları.
import * as THREE from "three";

const MC = {};
export const mat = (c, opt) => { const k = c + (opt ? JSON.stringify(opt) : ""); return MC[k] || (MC[k] = new THREE.MeshLambertMaterial({color: c, ...(opt || {})})); };
const box = (w, h, d, c) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
const cyl = (rt, rb, h, c, s = 10) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), mat(c));
const at = (p, o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; p.add(o); return o; };
const tekerlek = (r, c = "#4a3424") => { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.12, 6, 16), mat(c)); g.add(t); for (let i = 0; i < 6; i++) { const s = box(0.04, r * 2, 0.04, c); s.rotation.z = i * Math.PI / 6; g.add(s); } g.add(cyl(r * 0.18, r * 0.18, 0.15, c).rotateX(Math.PI / 2)); g.rotation.y = Math.PI / 2; return g; };

export function top(tur = "top", renk = "#3b3f45") {
  const g = new THREE.Group(); const ahsap = "#5a4330";
  if (tur === "roket") {
    for (const [x, z, r] of [[0, -0.5, 0], [-0.45, 0.35, 2.1], [0.45, 0.35, -2.1]]) at(g, box(0.05, 1.7, 0.05, ahsap), x * 0.8, 0.75, z * 0.8, 0.35 * Math.cos(r), 0, 0.35 * Math.sin(r));
    const n = new THREE.Group(); n.position.set(0, 1.35, 0); g.add(n); n.rotation.x = -0.45;
    at(n, cyl(0.08, 0.08, 1.8, "#4a4a4a", 8), 0, 0, 0.3, Math.PI / 2); at(n, new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.25, 8), mat("#8a3a2a")), 0, 0, 1.3, Math.PI / 2);
    for (let i = 0; i < 5; i++) at(g, cyl(0.06, 0.06, 1.1, "#7a5a3a", 6), -0.9 + i * 0.12, 0.08, -0.9, 0, 0, Math.PI / 2);
    g.userData.namlu = n; return g;
  }
  if (tur === "dag" || tur === "agir") {
    const k = tur === "dag" ? 0.68 : 1.55;
    const t = top("top", renk); t.scale.set(k, k, k); g.add(t); g.userData.namlu = t.userData.namlu;
    if (tur === "agir") { t.userData.namlu.rotation.x = -0.5; at(g, box(3.4, 0.25, 4.2, "#5a4a36"), 0, 0.12, -0.6); }
    return g;
  }
  const govde = new THREE.Group(); g.add(govde);
  const nam = tur === "obus" ? cyl(0.17, 0.22, 1.5, renk) : tur === "havan" ? cyl(0.1, 0.12, 0.9, renk) : cyl(0.1, 0.16, 2.1, renk);
  if (tur === "havan") {
    at(g, box(0.6, 0.06, 0.6, "#444"), 0, 0.03, 0);
    const n = new THREE.Group(); n.position.set(0, 0.12, 0); n.rotation.x = -0.85; g.add(n); at(n, nam, 0, 0.45, 0); g.userData.namlu = n; return g;
  }
  at(govde, box(0.25, 0.22, 2.1, ahsap), 0, 0.42, -0.85, -0.25);
  const n = new THREE.Group(); n.position.set(0, 0.78, 0.15); govde.add(n);
  at(n, nam, 0, 0, tur === "obus" ? 0.45 : 0.7, Math.PI / 2); at(n, cyl(0.2, 0.2, 0.3, renk), 0, 0, -0.25, Math.PI / 2);
  n.rotation.x = tur === "obus" ? -0.6 : -0.04; g.userData.namlu = n;
  if (tur !== "agir") for (const s of [-1, 1]) { const t = tekerlek(0.6); t.position.set(s * 0.55, 0.6, 0.1); govde.add(t); }
  at(govde, box(0.9, 0.3, 0.06, renk), 0, 0.95, 0.35); // kalkan
  return g;
}
export function makineli(tur = "maxim") {
  const g = new THREE.Group(); const c = "#2f3236";
  if (tur === "gatling") {
    for (const s of [-1, 1]) { const t = tekerlek(0.55); t.position.set(s * 0.5, 0.55, 0); g.add(t); }
    const n = new THREE.Group(); n.position.set(0, 0.95, 0); g.add(n);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; at(n, cyl(0.03, 0.03, 1.1, "#8a7a52", 6), Math.cos(a) * 0.08, Math.sin(a) * 0.08, 0.45, Math.PI / 2); }
    at(n, box(0.3, 0.3, 0.4, "#8a7a52"), 0, 0, -0.1); at(n, box(0.04, 0.25, 0.04, c), 0.2, 0, -0.2);
    g.userData.namlu = n; return g;
  }
  at(g, box(0.06, 0.06, 0.9, c), 0, 0.15, -0.3, 0.2); at(g, box(0.06, 0.06, 0.7, c), 0.3, 0.15, 0.1, 0, 0.6); at(g, box(0.06, 0.06, 0.7, c), -0.3, 0.15, 0.1, 0, -0.6);
  const n = new THREE.Group(); n.position.set(0, 0.42, 0); g.add(n);
  at(n, box(0.16, 0.18, 0.6, c), 0, 0, 0); at(n, cyl(0.07, 0.07, 0.65, "#5d6146"), 0, 0.02, 0.55, Math.PI / 2); at(n, cyl(0.025, 0.025, 0.3, c), 0, 0.02, 0.95, Math.PI / 2);
  at(n, box(0.5, 0.35, 0.04, c), 0, 0.15, 0.2); // kalkan
  g.userData.namlu = n; return g;
}
export function balon(renk = "#c9b48a") {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(5, 18, 14), mat(renk)); b.scale.set(1, 1.15, 1); b.position.y = 0; b.castShadow = true; g.add(b);
  for (let i = 0; i < 8; i++) { const s = new THREE.Mesh(new THREE.TorusGeometry(5.02, 0.04, 4, 30, Math.PI), mat("#6b5a3a")); s.rotation.y = i * Math.PI / 8; s.scale.set(1, 1.15, 1); g.add(s); }
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.6; const c = box(0.03, 4, 0.03, "#5a4a30"); c.position.set(Math.cos(a) * 1.2, -6.5, Math.sin(a) * 1.2); c.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); g.add(c); }
  at(g, box(1.4, 1.1, 1.4, "#7a5a36"), 0, -8.6, 0);
  g.userData.ip = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -9, 0), new THREE.Vector3(0, -70, 0)]), new THREE.LineBasicMaterial({color: "#3a3a3a"}));
  g.add(g.userData.ip);
  return g;
}
export function ucak(renk = "#8a7a52", isaret = "#c8102e") {
  const g = new THREE.Group();
  at(g, box(0.9, 0.9, 5.5, renk), 0, 0, 0); at(g, box(0.6, 0.6, 1.4, renk), 0, 0.05, -3.2);
  for (const y of [-0.45, 1.05]) at(g, box(9, 0.08, 1.5, renk), 0, y, 0.8);
  for (const s of [-1, 1]) for (const x of [1.6, 3.8]) at(g, box(0.06, 1.5, 0.06, "#4a3424"), s * x, 0.3, 0.8);
  at(g, box(3, 0.06, 1, renk), 0, 0.3, -3.5); at(g, box(0.06, 1.1, 1, renk), 0, 0.85, -3.6);
  for (const s of [-1, 1]) at(g, new THREE.Mesh(new THREE.CircleGeometry(0.45, 12), mat(isaret)), s * 3.6, 1.1, 0.8, -Math.PI / 2);
  const p = new THREE.Group(); p.position.set(0, 0, 2.85); g.add(p); at(p, box(0.15, 2.4, 0.08, "#4a3424"), 0, 0, 0); g.userData.pervane = p;
  for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.1, 6, 12), mat("#222")); t.position.set(s * 0.9, -1.3, 1.6); t.rotation.y = Math.PI / 2; g.add(t); at(g, box(0.05, 0.9, 0.05, "#333"), s * 0.6, -0.95, 1.6, 0, 0, s * 0.4); }
  return g;
}
export function zeplin(renk = "#9a9a8a") {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), mat(renk)); b.scale.set(6, 6, 32); g.add(b);
  at(g, box(2, 1.6, 8, "#5a5040"), 0, -6.6, 2);
  for (const r of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) { const f = box(0.2, 5, 6, renk); f.position.set(Math.cos(r) * 4.5, Math.sin(r) * 4.5, -28); f.rotation.z = r; g.add(f); }
  return g;
}
export function tank(renk = "#6a6a4a") {
  const g = new THREE.Group();
  const yan = new THREE.Shape(); yan.moveTo(-4, 0.3); yan.lineTo(-3.2, 2.4); yan.lineTo(2.6, 2.4); yan.lineTo(4.2, 0.6); yan.lineTo(3.6, 0); yan.lineTo(-3.4, 0); yan.closePath();
  const geo = new THREE.ExtrudeGeometry(yan, {depth: 0.9, bevelEnabled: false}); geo.rotateY(Math.PI / 2);
  for (const s of [-1, 1]) { const m = new THREE.Mesh(geo, mat(renk)); m.position.set(s > 0 ? 1.0 : -1.9, 0, 0); m.castShadow = true; g.add(m); }
  at(g, box(2, 1.6, 5, renk), 0, 1.3, 0.2); at(g, box(1.2, 0.9, 1.4, renk), 0, 2.4, 0.4);
  for (const s of [-1, 1]) { at(g, box(0.9, 0.9, 1.4, renk), s * 2.15, 1.3, 0.6); at(g, cyl(0.1, 0.12, 1.4, "#333"), s * 2.55, 1.4, 1.3, Math.PI / 2); }
  const iz = new THREE.Group(); g.add(iz); g.userData.palet = iz;
  for (let i = 0; i < 22; i++) for (const s of [-1, 1]) { const p = box(0.95, 0.12, 0.3, "#3a3630"); p.position.set(s * 1.45, 0.06, -3.3 + i * 0.32); iz.add(p); }
  at(g, cyl(0.1, 0.1, 1, "#333"), 0.5, 2.8, -1.8);
  return g;
}
export function zirhliAraba(renk = "#5f6a4a") {
  const g = new THREE.Group();
  at(g, box(1.9, 1.4, 4.6, renk), 0, 1.3, 0); at(g, box(1.8, 0.9, 1.2, renk), 0, 1.1, 2.6);
  const kule = new THREE.Group(); kule.position.set(0, 2.2, -0.4); g.add(kule); at(kule, cyl(0.75, 0.8, 0.7, renk, 10), 0, 0, 0); at(kule, cyl(0.07, 0.07, 1, "#2b2b2b"), 0, 0.05, 0.8, Math.PI / 2);
  g.userData.kule = kule;
  for (const [x, z] of [[-1, 1.8], [1, 1.8], [-1, -1.6], [1, -1.6]]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 14), mat("#222")); t.rotation.z = Math.PI / 2; t.position.set(x, 0.5, z); g.add(t); }
  return g;
}
export function sandal(renk = "#6b4a2b") {
  const g = new THREE.Group();
  at(g, box(1.8, 0.5, 6, renk), 0, 0.3, 0); at(g, box(1.6, 0.1, 5.6, "#4a3220"), 0, 0.5, 0);
  at(g, new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.4, 4), mat(renk)), 0, 0.3, 3.6, Math.PI / 2, Math.PI / 4);
  for (const s of [-1, 1]) for (const z of [-1.5, 0, 1.5]) at(g, box(0.06, 0.06, 2.2, "#8a6a40"), s * 1.3, 0.6, z, 0, 0, s * 0.4);
  return g;
}
export function araba(renk = "#6b4a2b", ortu = "#d8ccb0") {
  const g = new THREE.Group();
  at(g, box(1.6, 0.6, 3.2, renk), 0, 1, 0);
  const o = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 3, 12, 1, true, 0, Math.PI), mat(ortu, {side: THREE.DoubleSide})); o.rotation.set(0, 0, 0); o.rotation.x = Math.PI / 2; o.rotation.z = Math.PI / 2; o.position.y = 1.3; g.add(o);
  for (const [x, z] of [[-0.85, 1], [0.85, 1], [-0.85, -1.1], [0.85, -1.1]]) { const t = tekerlek(0.55); t.position.set(x, 0.55, z); g.add(t); }
  at(g, box(0.08, 0.08, 2.5, renk), 0.3, 0.8, 2.6); at(g, box(0.08, 0.08, 2.5, renk), -0.3, 0.8, 2.6);
  return g;
}
export function cadir(renk = "#d8ccb0", buyuk = 1) {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 2.6 * buyuk, 2.6 * buyuk, 4, 1), mat(renk)); c.rotation.y = Math.PI / 4; c.scale.set(1, 1, 1.5); c.position.y = 1.3 * buyuk; c.castShadow = c.receiveShadow = true; g.add(c);
  at(g, box(0.06, 3.2 * buyuk, 0.06, "#5a4330"), 0, 1.4 * buyuk, 0);
  return g;
}
export function buyukCadir(renk = "#e2d6bb", w = 8, d = 6, h = 3.6) {
  const g = new THREE.Group();
  at(g, box(w, h * 0.55, d, renk), 0, h * 0.27, 0);
  const cat = new THREE.Mesh(new THREE.CylinderGeometry(0.02, w * 0.72, h * 0.6, 4, 1), mat(renk)); cat.rotation.y = Math.PI / 4; cat.scale.set(1, 1, d / w); cat.position.y = h * 0.55 + h * 0.3; cat.castShadow = true; g.add(cat);
  at(g, box(1.4, h * 0.45, 0.05, "#5a4330"), 0, h * 0.22, d / 2 + 0.01);
  return g;
}
export function sandik(renk = "#7a5634", altin = false) {
  const g = new THREE.Group();
  at(g, box(1, 0.6, 0.65, renk), 0, 0.3, 0);
  const kap = new THREE.Group(); kap.position.set(0, 0.6, -0.32); g.add(kap); at(kap, box(1.02, 0.12, 0.67, renk), 0, 0.06, 0.32);
  g.userData.kapak = kap;
  for (const x of [-0.4, 0.4]) at(g, box(0.06, 0.62, 0.67, altin ? "#d4af37" : "#3a3a3a"), x, 0.3, 0);
  if (altin) at(g, box(0.15, 0.15, 0.05, "#d4af37"), 0, 0.5, 0.34);
  return g;
}
export function sancak(bayrak = ["#1f5a4a", "#e9e2c8", "#1f5a4a"], boy = 6) {
  const g = new THREE.Group();
  at(g, cyl(0.05, 0.06, boy, "#4a3424", 6), 0, boy / 2, 0);
  at(g, new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), mat("#c9a33a")), 0, boy + 0.05, 0);
  const geo = new THREE.PlaneGeometry(2.4, 1.6, 12, 3); geo.translate(1.2, 0, 0);
  const renk = new Float32Array(geo.attributes.position.count * 3); const cs = bayrak.map(c => new THREE.Color(c));
  for (let i = 0; i < geo.attributes.position.count; i++) { const y = geo.attributes.position.getY(i); const k = y > 0.27 ? 0 : y < -0.27 ? 2 : 1; renk.set([cs[k].r, cs[k].g, cs[k].b], i * 3); }
  geo.setAttribute("color", new THREE.BufferAttribute(renk, 3));
  const kumas = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({vertexColors: true, side: THREE.DoubleSide})); kumas.position.set(0.05, boy - 0.9, 0); g.add(kumas);
  g.userData.kumas = kumas; g.userData.taban = geo.attributes.position.array.slice();
  g.userData.dalga = (t, ruzgar = 4) => { const p = geo.attributes.position, b = g.userData.taban; for (let i = 0; i < p.count; i++) { const x = b[i * 3]; p.array[i * 3 + 2] = Math.sin(x * 2.2 - t * (2 + ruzgar * 0.3)) * 0.18 * x; } p.needsUpdate = true; };
  return g;
}
export function ates() { const g = new THREE.Group(); for (let i = 0; i < 5; i++) at(g, cyl(0.07, 0.07, 1.1, "#4a3220", 5), 0, 0.12, 0, Math.PI / 2, i * Math.PI / 5); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; at(g, new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), mat("#777")), Math.cos(a) * 0.75, 0.08, Math.sin(a) * 0.75); } return g; }
export function firin() {
  const g = new THREE.Group();
  const k = new THREE.Mesh(new THREE.SphereGeometry(1.7, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat("#a0522d")); k.scale.set(1, 0.9, 1.2); g.add(k); k.castShadow = true;
  at(g, box(0.8, 0.7, 0.1, "#2a1a10"), 0, 0.4, 2.0); at(g, cyl(0.25, 0.3, 2, "#8a4a2a"), 0, 2, -1);
  for (let i = 0; i < 6; i++) at(g, box(0.5, 0.2, 0.3, "#d9a55a"), -1.2 + (i % 3) * 0.4, 0.9 + Math.floor(i / 3) * 0.22, 2.6);
  at(g, box(1.6, 0.8, 0.8, "#6b4a2b"), -0.8, 0.4, 2.6);
  return g;
}
export function masa(ustune = "harita") {
  const g = new THREE.Group(); at(g, box(2.4, 0.08, 1.4, "#6b4a2b"), 0, 0.9, 0); for (const [x, z] of [[-1.1, -0.6], [1.1, -0.6], [-1.1, 0.6], [1.1, 0.6]]) at(g, box(0.08, 0.9, 0.08, "#5a3c22"), x, 0.45, z);
  if (ustune === "harita") { at(g, box(2, 0.01, 1.2, "#e3d6b0"), 0, 0.95, 0); at(g, box(0.4, 0.02, 0.3, "#8a5a3a"), 0.4, 0.96, 0.2); }
  return g;
}
export function kumTorbasi(uz = 4, kat = 2) {
  const g = new THREE.Group(); const geo = new THREE.BoxGeometry(0.8, 0.32, 0.5);
  for (let k = 0; k < kat; k++) for (let x = -uz / 2; x < uz / 2; x += 0.78) { const m = new THREE.Mesh(geo, mat("#a8956b")); m.position.set(x + (k % 2) * 0.39, 0.16 + k * 0.3, 0); m.rotation.y = (Math.random() - 0.5) * 0.15; m.castShadow = true; g.add(m); }
  return g;
}
export function ekmek() { const m = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), mat("#c88a3e")); m.scale.set(1.6, 0.8, 1); return m; }
export function topYigini() { const g = new THREE.Group(); for (let i = 0; i < 10; i++) at(g, new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), mat("#2b2b2b")), (i % 4) * 0.25 - 0.4, 0.12 + Math.floor(i / 4) * 0.2, (i % 2) * 0.2); return g; }
export function hedefTahta() { const g = new THREE.Group(); at(g, box(0.1, 1.6, 0.1, "#5a4330"), 0, 0.8, 0); const t = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), mat("#e8e0c8")); t.position.set(0, 1.4, 0.06); g.add(t); for (const [r, c] of [[0.35, "#b3261e"], [0.2, "#e8e0c8"], [0.08, "#b3261e"]]) { const h = new THREE.Mesh(new THREE.CircleGeometry(r, 16), mat(c)); h.position.set(0, 1.4, 0.07 + (0.5 - r) * 0.01); g.add(h); } return g; }
