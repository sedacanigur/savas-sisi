// Kalabalık çizici: askerler ve atlar parça parça (instanced) çizilir, pozlar kodla hesaplanır.
// Bir asker ~15 parça; bütün askerler için toplam birkaç düzine çizim çağrısı yapılır.
import * as THREE from "three";

// ---------- yardımcılar ----------
export function birlestir(geos) {
  const ps = [], ns = [];
  for (let g of geos) { g = g.index ? g.toNonIndexed() : g; ps.push(g.attributes.position.array); ns.push(g.attributes.normal.array); }
  const n = ps.reduce((a, p) => a + p.length, 0), P = new Float32Array(n), N = new Float32Array(n);
  let o = 0; for (let i = 0; i < ps.length; i++) { P.set(ps[i], o); N.set(ns[i], o); o += ps[i].length; }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(P, 3)); g.setAttribute("normal", new THREE.BufferAttribute(N, 3)); return g;
}
const kutu = (w, h, d, x = 0, y = 0, z = 0) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
const sil = (rt, rb, h, x = 0, y = 0, z = 0, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s).translate(x, y, z);

// Parça geometrileri (merkezleri eklem noktasına göre) — yuvarlak hatlı, az üçgenli
const kap = (r, L, y = 0, rs = 7) => new THREE.CapsuleGeometry(r, L, 2, rs).translate(0, y, 0);
const yas = (rt, rb, h, x, y, z, sx = 1, sz = 1, s = 9) => new THREE.CylinderGeometry(rt, rb, h, s).scale(sx, 1, sz).translate(x, y, z);
const GEO = {
  // ceket: aşağı doğru daralan gövde, omuz yuvarlakları ve etek
  govde: birlestir([yas(0.215, 0.175, 0.5, 0, 0.29, 0, 1, 0.64), new THREE.CapsuleGeometry(0.075, 0.33, 2, 7).rotateZ(Math.PI / 2).translate(0, 0.5, 0).scale(1, 1, 0.9), yas(0.19, 0.235, 0.2, 0, 0.0, 0, 1, 0.72), yas(0.075, 0.085, 0.08, 0, 0.58, 0, 1, 0.9, 8)]),
  kalca: yas(0.185, 0.175, 0.2, 0, 0, 0, 1, 0.72),
  bas: birlestir([new THREE.IcosahedronGeometry(0.112, 1).scale(0.92, 1.08, 1).translate(0, 0.13, 0), new THREE.ConeGeometry(0.022, 0.06, 4).rotateX(Math.PI / 2).translate(0, 0.11, 0.105), kutu(0.13, 0.04, 0.03, 0, 0.065, 0.085)]),
  ustKol: kap(0.058, 0.2, -0.15),
  altKol: kap(0.05, 0.19, -0.135),
  el: birlestir([kutu(0.07, 0.085, 0.06, 0, -0.04, 0.005), kutu(0.025, 0.05, 0.03, 0.035, -0.03, 0.03)]),
  uyluk: kap(0.078, 0.3, -0.23),
  baldir: kap(0.063, 0.24, -0.17),
  cizme: birlestir([yas(0.068, 0.062, 0.22, 0, -0.32, 0, 1, 1, 8), kutu(0.105, 0.07, 0.25, 0, -0.43, 0.05)]),
  kemer: birlestir([yas(0.2, 0.2, 0.06, 0, 0.04, 0, 1.03, 0.7, 12), kutu(0.045, 0.66, 0.015, 0, 0.3, 0.12).rotateZ(0), kutu(0.045, 0.66, 0.015, 0, 0.3, -0.12)]),
  canta: birlestir([kutu(0.3, 0.3, 0.13, 0, 0.3, -0.19), new THREE.CylinderGeometry(0.065, 0.065, 0.38, 8).rotateZ(Math.PI / 2).translate(0, 0.5, -0.19), kutu(0.1, 0.12, 0.06, -0.15, 0.06, 0.1)]),
};
// çapraz kayışlar: göğüste X
GEO.kemer = birlestir([yas(0.2, 0.2, 0.06, 0, 0.04, 0, 1.03, 0.7, 12),
  new THREE.BoxGeometry(0.042, 0.62, 0.014).rotateZ(0.62).translate(0, 0.31, 0.118), new THREE.BoxGeometry(0.042, 0.62, 0.014).rotateZ(-0.62).translate(0, 0.31, 0.118),
  new THREE.BoxGeometry(0.042, 0.62, 0.014).rotateZ(0.62).translate(0, 0.31, -0.118), kutu(0.1, 0.07, 0.05, 0.12, 0.06, 0.13)]);
const SAPKA = {
  kepi: birlestir([sil(0.098, 0.118, 0.13, 0, 0.065, 0, 12).translate(0, 0, -0.01), new THREE.CylinderGeometry(0.1, 0.1, 0.012, 12, 1, false, -Math.PI / 2, Math.PI).scale(1, 1, 0.9).translate(0, 0.003, 0.06), sil(0.12, 0.12, 0.02, 0, 0.012, 0, 12)]).rotateX(-0.14),
  fes: sil(0.085, 0.112, 0.17, 0, 0.085, 0, 10),
  kalpak: birlestir([new THREE.IcosahedronGeometry(0.13, 1).scale(1, 1.1, 1).translate(0, 0.09, 0)]),
  sivri: birlestir([new THREE.SphereGeometry(0.135, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.ConeGeometry(0.025, 0.12, 6).translate(0, 0.19, 0), kutu(0.2, 0.012, 0.08, 0, 0, 0.12)]),
  kask: birlestir([new THREE.SphereGeometry(0.15, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), sil(0.19, 0.19, 0.015, 0, 0.0, 0, 12)]),
  enveriye: birlestir([sil(0.12, 0.125, 0.1, 0, 0.05, 0, 10), new THREE.SphereGeometry(0.12, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.4, 1).translate(0, 0.1, 0)]),
  sapka: birlestir([sil(0.2, 0.2, 0.02, 0, 0.0, 0, 12), sil(0.11, 0.12, 0.11, 0, 0.06, 0, 10)]),
};
// Silah modelleri: dipçik/kabza başlangıç, ileri +Z
const SILAH = {
  tufek: birlestir([kutu(0.06, 0.12, 0.42, 0, -0.03, -0.12), kutu(0.04, 0.05, 0.75, 0, 0, 0.45), kutu(0.02, 0.02, 0.32, 0, 0.01, 0.98)]),
  karabina: birlestir([kutu(0.06, 0.11, 0.36, 0, -0.03, -0.1), kutu(0.04, 0.05, 0.55, 0, 0, 0.35)]),
  keskin: birlestir([kutu(0.06, 0.12, 0.42, 0, -0.03, -0.12), kutu(0.04, 0.05, 0.8, 0, 0, 0.48), sil(0.025, 0.025, 0.28, 0, 0.07, 0.25, 6).rotateX(Math.PI / 2)]),
  tabanca: birlestir([kutu(0.04, 0.12, 0.06, 0, -0.05, 0), kutu(0.035, 0.05, 0.2, 0, 0.02, 0.1)]),
  kilic: birlestir([kutu(0.08, 0.03, 0.03, 0, 0, 0), kutu(0.02, 0.05, 0.85, 0, 0, 0.45)]),
  mizrak: birlestir([kutu(0.035, 0.035, 2.9, 0, 0, 0.8), new THREE.ConeGeometry(0.04, 0.25, 4).rotateX(Math.PI / 2).translate(0, 0, 2.35)]),
  hm: birlestir([kutu(0.06, 0.12, 0.3, 0, -0.03, -0.1), kutu(0.07, 0.08, 0.5, 0, 0, 0.3), sil(0.06, 0.06, 0.07, 0, -0.06, 0.15, 10)]),
  alev: birlestir([kutu(0.06, 0.08, 0.3, 0, 0, 0), kutu(0.04, 0.04, 0.8, 0, 0.02, 0.45)]),
  sancak: birlestir([kutu(0.04, 0.04, 2.6, 0, 0, 0.9), kutu(0.02, 0.6, 0.85, 0, -0.3, 1.8)]),
};
// at parçaları (yuvarlak hatlı)
const AT = {
  govde: birlestir([new THREE.CapsuleGeometry(0.33, 0.95, 3, 9).rotateX(Math.PI / 2).scale(0.88, 1, 1), new THREE.SphereGeometry(0.34, 9, 7).scale(0.9, 1, 1).translate(0, 0.02, 0.55), new THREE.SphereGeometry(0.33, 9, 7).scale(0.95, 0.95, 0.9).translate(0, 0.04, -0.6)]),
  boyun: birlestir([new THREE.CapsuleGeometry(0.15, 0.55, 2, 8).scale(0.85, 1, 1.15).translate(0, 0.36, 0), kutu(0.05, 0.55, 0.12, 0, 0.42, -0.14)]),
  bas: birlestir([new THREE.CylinderGeometry(0.085, 0.13, 0.56, 8).rotateX(Math.PI / 2).scale(0.9, 1.1, 1).translate(0, -0.02, 0.24), new THREE.ConeGeometry(0.04, 0.14, 4).translate(0.07, 0.17, 0.02), new THREE.ConeGeometry(0.04, 0.14, 4).translate(-0.07, 0.17, 0.02)]),
  ustBacak: kap(0.085, 0.36, -0.26, 7),
  altBacak: birlestir([kap(0.05, 0.4, -0.26, 6), new THREE.CylinderGeometry(0.06, 0.075, 0.09, 8).translate(0, -0.53, 0.01)]),
  kuyruk: birlestir([new THREE.CapsuleGeometry(0.06, 0.45, 2, 6).translate(0, -0.3, 0), new THREE.ConeGeometry(0.09, 0.3, 6).rotateX(Math.PI).translate(0, -0.6, 0)]),
  eyer: birlestir([kutu(0.62, 0.1, 0.62, 0, 0, 0), kutu(0.66, 0.34, 0.05, 0, -0.2, 0.15), kutu(0.3, 0.12, 0.1, 0, 0.08, 0.27), kutu(0.3, 0.1, 0.08, 0, 0.06, -0.28)]),
  horguc: new THREE.SphereGeometry(0.32, 8, 6).scale(1, 0.8, 1.2),
  motor: birlestir([kutu(0.3, 0.35, 1.3, 0, 0.55, 0), new THREE.TorusGeometry(0.3, 0.07, 6, 12).rotateY(Math.PI / 2).translate(0, 0.3, 0.68), new THREE.TorusGeometry(0.3, 0.07, 6, 12).rotateY(Math.PI / 2).translate(0, 0.3, -0.68), kutu(0.6, 0.05, 0.05, 0, 1.0, 0.5)]),
};

const R2D = Math.PI / 180;
// ---------- pozlar ----------
// Her poz: kalca (yükseklik), egim (gövde), sO/solO: omuz [pitch, roll], sD/solD: dirsek, sK/solK: kalça [pitch, roll], sDz/solDz: diz,
// silah: gövde uzayında [x,y,z, rx,ry,rz] ya da "el"
function poz(p, a) {
  const t = a.t || 0, hiz = a.hiz || 0;
  const P = {kalca: 0.93, egim: 0, bas: 0, basY: 0, sO: [0, -0.08], sD: -0.15, solO: [0, 0.08], solD: -0.15, sK: [0, 0.02], sDz: 0.05, solK: [0, -0.02], solDz: 0.05, silah: null, kok: 0, kokY: 0};
  const nefes = Math.sin(t * 1.7) * 0.02;
  const yurume = (f, gen) => { const s = Math.sin(t * f), c = Math.cos(t * f); P.sK[0] = -s * gen; P.solK[0] = s * gen; P.sDz = Math.max(0, c) * gen * 1.3 + 0.05; P.solDz = Math.max(0, -c) * gen * 1.3 + 0.05; P.kalca = 0.93 - Math.abs(c) * 0.03 * gen * 3; return s; };
  const port = () => { P.silah = [0.0, 0.32, 0.22, -0.9, 0.35, 0.7]; P.sO = [-0.5, -0.25]; P.sD = -1.2; P.solO = [-0.9, 0.25]; P.solD = -0.9; };
  switch (p) {
    case "dur": default:
      P.egim = nefes; P.silah = [0.24, 0.05, 0.12, -1.57, 0, 0]; P.sO = [-0.05, -0.12]; P.sD = -0.5; break;
    case "yuru": { const s = yurume(hiz * 3.4 + 4, 0.45); port(); P.egim = 0.06; P.kokY = s * 0.05; break; }
    case "kos": { yurume(hiz * 2.4 + 5, 0.75); port(); P.egim = 0.22; break; }
    case "hucum": { yurume(hiz * 2.4 + 5, 0.8); P.egim = 0.3; P.silah = [0.12, 0.08, 0.28, -0.12, 0, 0]; P.sO = [-0.3, -0.2]; P.sD = -1.2; P.solO = [-1.1, 0.3]; P.solD = -0.35; break; }
    case "nisan": P.egim = 0.05; P.silah = [0.13, 0.46, 0.08, -(a.nisan || 0), 0, 0]; P.sO = [-1.1, -0.35]; P.sD = -0.9; P.solO = [-1.45, 0.4]; P.solD = -0.25; P.bas = 0.12; P.basY = 0.15; P.solK = [0.25, -0.05]; P.sK = [-0.2, 0.05]; break;
    case "diz": P.kalca = 0.52; P.egim = 0.1; P.silah = [0.13, 0.46, 0.08, -(a.nisan || 0), 0, 0]; P.sO = [-1.1, -0.35]; P.sD = -0.9; P.solO = [-1.45, 0.4]; P.solD = -0.3; P.bas = 0.12; P.basY = 0.15;
      P.solK = [-1.45, -0.08]; P.solDz = 1.5; P.sK = [0.25, 0.1]; P.sDz = 1.6; break;
    case "doldur": { const c = Math.sin(t * 6); P.egim = 0.08; P.silah = [0.1, 0.0, 0.3, -1.45, 0, 0.1]; P.solO = [-0.7, 0.25]; P.solD = -1.0; P.sO = [-2.2 + c * 0.35, -0.2]; P.sD = -0.6 - c * 0.3; P.bas = 0.3; break; }
    case "diz_doldur": { const c = Math.sin(t * 6); P.kalca = 0.52; P.egim = 0.15; P.silah = [0.1, 0.05, 0.32, -0.6, 0, 0.1]; P.solO = [-0.8, 0.25]; P.solD = -0.9; P.sO = [-0.9 + c * 0.2, -0.2]; P.sD = -1.2 - c * 0.3;
      P.solK = [-1.45, -0.08]; P.solDz = 1.5; P.sK = [0.25, 0.1]; P.sDz = 1.6; P.bas = 0.3; break; }
    case "olu": { const k = Math.min(1, a.olum || 0); const yon = a.yon2 > 0.5 ? 1 : -1; P.kok = yon * k * 1.52; P.egim = -yon * k * 0.2; P.sO = [k * -2.6 * (yon > 0 ? 0.3 : 1), -0.5 * k]; P.solO = [k * -2.2, 0.6 * k]; P.sK = [-0.3 * k, 0.1]; P.solK = [0.2 * k, -0.15]; P.silah = null; break; }
    case "ata": P.kalca = 1.68; P.egim = 0.05 + Math.sin(t * 9) * 0.03 * Math.min(1, hiz / 4); P.sK = [-1.25, 0.32]; P.solK = [-1.25, -0.32]; P.sDz = 1.3; P.solDz = 1.3; P.solO = [-0.6, 0.2]; P.solD = -0.9; P.sO = [-0.4, -0.15]; P.sD = -0.8; P.silah = "el"; P.elRx = 0.6; break;
    case "ata_hucum": P.kalca = 1.68; P.egim = 0.35; P.sK = [-1.25, 0.32]; P.solK = [-1.25, -0.32]; P.sDz = 1.3; P.solDz = 1.3; P.solO = [-0.6, 0.2]; P.solD = -0.9; P.sO = [-1.35, -0.1]; P.sD = -0.15; P.silah = "el"; P.elRx = 0.15; break;
    case "ata_nisan": P.kalca = 1.68; P.egim = 0.08; P.sK = [-1.25, 0.32]; P.solK = [-1.25, -0.32]; P.sDz = 1.3; P.solDz = 1.3; P.silah = [0.13, 0.46, 0.08, -(a.nisan || 0), 0, 0]; P.sO = [-1.1, -0.35]; P.sD = -0.9; P.solO = [-1.45, 0.4]; P.solD = -0.25; break;
    case "otur": P.kalca = 0.42; P.sK = [-1.5, 0.15]; P.solK = [-1.5, -0.15]; P.sDz = 1.4; P.solDz = 1.4; P.sO = [-0.5, -0.1]; P.sD = -1.2; P.solO = [-0.5, 0.1]; P.solD = -1.2; P.egim = 0.15 + nefes; P.silah = null; break;
    case "yemek": { P.kalca = 0.42; P.sK = [-1.5, 0.15]; P.solK = [-1.5, -0.15]; P.sDz = 1.4; P.solDz = 1.4; const c = (Math.sin(t * 1.4) + 1) / 2; P.sO = [-0.6 - c * 0.6, -0.1]; P.sD = -1.6 - c * 0.6; P.solO = [-0.5, 0.1]; P.solD = -1.3; P.egim = 0.2; P.silah = null; break; }
    case "selam": P.silah = [0.24, 0.05, 0.12, -1.57, 0, 0]; P.sO = [-0.05, -0.12]; P.sD = -0.5; P.solO = [-0.2, 0.9]; P.solD = -2.4; P.egim = -0.03; break;
    case "sevin": { const c = Math.sin(t * 8); P.sO = [-2.9, -0.3 + c * 0.1]; P.solO = [-2.9, 0.3 - c * 0.1]; P.sD = -0.2; P.solD = -0.2; P.silah = "el"; P.elRx = -0.2; P.kalca = 0.93 + Math.max(0, c) * 0.08; break; }
    case "top": { const c = Math.sin(t * 3); P.egim = 0.35; P.kalca = 0.85; P.sO = [-1.3 + c * 0.3, -0.1]; P.solO = [-1.3 + c * 0.3, 0.1]; P.sD = -0.2; P.solD = -0.2; P.sK = [-0.4, 0.05]; P.solK = [0.3, -0.05]; P.sDz = 0.3; P.silah = null; break; }
    case "makineli": P.kalca = 0.5; P.egim = 0.3; P.sO = [-1.2, -0.2]; P.solO = [-1.2, 0.2]; P.sD = -0.4; P.solD = -0.4; P.solK = [-1.45, -0.1]; P.solDz = 1.5; P.sK = [-1.45, 0.1]; P.sDz = 1.5; P.silah = null; break;
    case "at": { const c = Math.sin(t * 7); P.egim = 0.25; P.sO = [-2.4 - c * 0.4, -0.2]; P.sD = -0.3; P.solO = [-0.3, 0.2]; P.solD = -0.4; P.silah = null; break; }
    case "kaz": { const c = Math.sin(t * 4); P.egim = 0.5 + c * 0.15; P.kalca = 0.85; P.sO = [-1 - c * 0.4, -0.1]; P.solO = [-1 - c * 0.4, 0.1]; P.sD = -0.4; P.solD = -0.4; P.silah = null; break; }
  }
  return P;
}

// ---------- çizici ----------
const TEN = new THREE.Color("#d9a77f"), DERI = new THREE.Color("#3b2a1c"), GRI = new THREE.Color("#777"), SG1 = new THREE.Color(), SG2 = new THREE.Color(), CELIK = new THREE.Color("#b9bec4"), AHSAP = new THREE.Color("#4a3828");
const _m = new THREE.Matrix4(), _r = new THREE.Matrix4(), _t = new THREE.Matrix4(), _e = new THREE.Euler(), _c = new THREE.Color();
const kok = new THREE.Matrix4(), pel = new THREE.Matrix4(), gov = new THREE.Matrix4(), j1 = new THREE.Matrix4(), j2 = new THREE.Matrix4(), el = new THREE.Matrix4(), tmpM = new THREE.Matrix4();
function eklem(ust, out, x, y, z, rx, ry, rz) { out.copy(ust).multiply(_t.makeTranslation(x, y, z)); if (rx || ry || rz) { _e.set(rx, ry, rz, "YXZ"); out.multiply(_r.makeRotationFromEuler(_e)); } return out; }

export class Kalabalik {
  constructor(sahne, kapasite = 200, atKapasite = 60) {
    this.sahne = sahne; this.kap = kapasite; this.atKap = atKapasite;
    const mat = new THREE.MeshLambertMaterial({color: "#ffffff"});
    this.mat = mat;
    const mk = (geo, n, golge = true) => { const m = new THREE.InstancedMesh(geo, mat, n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; m.castShadow = golge; m.count = 0; m.setColorAt(0, _c.set("#fff")); sahne.add(m); return m; };
    this.P = {};
    for (const k of ["govde", "kalca", "bas", "canta", "kemer"]) this.P[k] = mk(GEO[k], kapasite);
    for (const k of ["ustKol", "altKol", "uyluk", "baldir", "el", "cizme"]) this.P[k] = mk(GEO[k], kapasite * 2);
    this.S = {}; for (const k in SAPKA) this.S[k] = mk(SAPKA[k], kapasite, false);
    this.W = {}; for (const k in SILAH) this.W[k] = mk(SILAH[k], kapasite, false);
    this.A = {}; for (const k of ["govde", "boyun", "bas", "kuyruk", "eyer", "horguc", "motor"]) this.A[k] = mk(AT[k], atKapasite);
    for (const k of ["ustBacak", "altBacak"]) this.A[k] = mk(AT[k], atKapasite * 4);
    this.tum = [...Object.values(this.P), ...Object.values(this.S), ...Object.values(this.W), ...Object.values(this.A)];
  }
  dispose() { for (const m of this.tum) { this.sahne.remove(m); m.geometry.dispose(); } this.mat.dispose(); }
  _yaz(m, M, renk) { const i = m.count++; m.setMatrixAt(i, M); m.setColorAt(i, renk); }
  // liste: {x,y,z,yon,poz,t,hiz,nisan,olum,yon2, ceket,pantolon,sapka,sapkaRenk,silah,canta, at:{tur,renk,hiz,t,olum}, solgun}
  ciz(liste) {
    for (const m of this.tum) m.count = 0;
    for (const a of liste) {
      if (this.P.govde.count >= this.kap) break;
      if (a.at && this.A.govde.count < this.atKap) this._at(a);
      if (!a.sadeceAt) this._asker(a);
    }
    for (const m of this.tum) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
  }
  _asker(a) {
    const p = poz(a.poz, a);
    const ten = a.tenC || TEN, deri = DERI;
    let ceket = a.ceketC, pan = a.pantolonC;
    if (a.solgun) { ceket = SG1.copy(ceket).lerp(GRI, a.solgun); pan = SG2.copy(pan).lerp(GRI, a.solgun); }
    kok.makeTranslation(a.x, a.y, a.z); kok.multiply(_r.makeRotationY(a.yon || 0));
    if (p.kok) { kok.multiply(_t.makeTranslation(0, 0.05, 0)).multiply(_r.makeRotationX(p.kok)); }
    if (p.kokY) kok.multiply(_r.makeRotationZ(p.kokY));
    eklem(kok, pel, 0, p.kalca, 0, 0, 0, 0);
    this._yaz(this.P.kalca, pel, pan);
    eklem(pel, gov, 0, 0.08, 0, p.egim, p.basY * 0.3, 0);
    this._yaz(this.P.govde, gov, ceket);
    if (a.canta !== false) this._yaz(this.P.canta, gov, deri);
    if (a.kemerC) this._yaz(this.P.kemer, gov, a.kemerC);
    eklem(gov, j1, 0, 0.62, 0, p.bas, p.basY, 0);
    this._yaz(this.P.bas, j1, ten);
    const sapka = this.S[a.sapka]; if (sapka) { eklem(j1, j2, 0, 0.23, 0, 0, 0, 0); this._yaz(sapka, j2, a.sapkaC || DERI); }
    // kollar
    for (const s of [1, -1]) {
      const O = s > 0 ? p.sO : p.solO, D = s > 0 ? p.sD : p.solD;
      eklem(gov, j1, s * 0.255, 0.5, 0, O[0], 0, s * Math.abs(O[1]) * -Math.sign(O[1] || 1) * (s > 0 ? 1 : -1));
      this._yaz(this.P.ustKol, j1, ceket);
      eklem(j1, j2, 0, -0.3, 0, D, 0, 0);
      this._yaz(this.P.altKol, j2, ceket);
      eklem(j2, j1, 0, -0.26, 0, 0, 0, 0); this._yaz(this.P.el, j1, ten);
      if (s > 0) el.copy(j2).multiply(_t.makeTranslation(0, -0.3, 0.02));
    }
    // bacaklar
    for (const s of [1, -1]) {
      const K = s > 0 ? p.sK : p.solK, Dz = s > 0 ? p.sDz : p.solDz;
      eklem(pel, j1, s * 0.1, -0.06, 0, K[0], 0, K[1]);
      this._yaz(this.P.uyluk, j1, pan);
      eklem(j1, j2, 0, -0.46, 0, Dz, 0, 0);
      this._yaz(this.P.baldir, j2, pan);
      this._yaz(this.P.cizme, j2, a.cizmeC || deri);
    }
    // silah
    const w = this.W[a.model];
    if (w && p.silah) {
      if (p.silah === "el") { tmpM.copy(el).multiply(_r.makeRotationX(-Math.PI / 2 + (p.elRx || 0))); }
      else { const s = p.silah; eklem(gov, tmpM, s[0], s[1], s[2], s[3], s[4], s[5]); }
      this._yaz(w, tmpM, a.model === "kilic" || a.model === "mizrak" ? CELIK : (a.model === "sancak" ? a.ceketC : AHSAP));
    }
  }
  _at(a) {
    const h = a.at, t = h.t || 0, hz = h.hiz || 0;
    if (!h.renkC) { h.renkC = new THREE.Color(h.renk || "#6b4a2e"); h.koyuC = h.renkC.clone().multiplyScalar(0.6); }
    const govR = h.renkC, koyu = h.koyuC;
    const deve = h.tur === "deve", motor = h.tur === "motor";
    kok.makeTranslation(a.x, a.y, a.z); kok.multiply(_r.makeRotationY(a.yon || 0));
    if (motor) { this._yaz(this.A.motor, kok, h.renkC || (h.renkC = new THREE.Color("#33363a"))); return; }
    const olum = Math.min(1, h.olum || 0);
    if (olum) kok.multiply(_t.makeTranslation(0, 0, 0)).multiply(_r.makeRotationZ(olum * 1.45));
    const yuk = deve ? 1.6 : 1.27;
    const f = hz > 5 ? 9 : hz > 0.5 ? 5 : 0, gen = hz > 5 ? 0.75 : hz > 0.5 ? 0.35 : 0;
    const bob = f ? Math.abs(Math.sin(t * f)) * 0.08 * gen : Math.sin(t * 1.3) * 0.01;
    eklem(kok, pel, 0, yuk + bob, 0, f ? Math.sin(t * f) * 0.04 * gen : 0, 0, 0);
    this._yaz(this.A.govde, pel, govR);
    this._yaz(this.A.eyer, eklem(pel, j1, 0, 0.34, 0.05, 0, 0, 0), DERI);
    if (deve) this._yaz(this.A.horguc, eklem(pel, j1, 0, 0.35, -0.35, 0, 0, 0), govR);
    eklem(pel, j1, 0, 0.18, 0.72, -0.55 + (f ? Math.sin(t * f) * 0.12 : Math.sin(t * 0.7) * 0.05), 0, 0);
    this._yaz(this.A.boyun, j1, govR);
    eklem(j1, j2, 0, 0.72, 0.05, 0.9 + (deve ? -0.2 : 0), 0, 0);
    this._yaz(this.A.bas, j2, govR);
    eklem(pel, j1, 0, 0.2, -0.85, 0.5 + (f ? Math.sin(t * f * 2) * 0.2 : 0), 0, 0);
    this._yaz(this.A.kuyruk, j1, koyu);
    const bac = [[0.19, 0.62, 0], [-0.19, 0.62, 0.5], [0.19, -0.62, 0.25], [-0.19, -0.62, 0.75]];
    for (const [bx, bz, faz] of bac) {
      const ph = t * f + faz * Math.PI * 2;
      const u = f ? Math.sin(ph) * 0.65 * gen : 0, d = f ? Math.max(0, Math.cos(ph)) * 1.1 * gen : 0;
      eklem(pel, j1, bx, -0.22, bz, u - (olum ? 0.6 : 0), 0, 0);
      this._yaz(this.A.ustBacak, j1, govR);
      eklem(j1, j2, 0, -0.52, 0, (bz > 0 ? -d : d), 0, 0);
      this._yaz(this.A.altBacak, j2, koyu);
    }
  }
}

export const AT_RENKLER = ["#6b4a2e", "#4a3220", "#8a6440", "#2b2420", "#a8a29a", "#7a5634", "#d9d2c5"];
