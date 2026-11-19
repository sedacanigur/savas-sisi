// Oyuncu kontrolü: 1. şahıs asker, 3. şahıs komutan, taktik harita ve ganimet yürüyüşü.
import * as THREE from "three";
import {G, tus, bas, kilitIste, kilitBirak} from "../girdi.js";
import {SILAHLAR} from "../veri/silahlar.js";
import {ses, borazan} from "../ses.js";
import {AYAR} from "../kayit.js";

const R = Math.random;
const aciFark = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

export class Oyuncu {
  constructor(motor, savas, rol) {
    this.motor = motor; this.s = savas; this.kam = motor.kamera;
    this.mod = rol === "asker" ? "asker" : "komutan";
    this.yaw = Math.PI; this.pitch = -0.05; this.secili = 0; this.diz = false; this.nisan = false;
    this.geriTep = 0; this.sallanma = 0; this.oluT = 0; this.bombalar = 0; this.kilicT = 0;
    this.isaret = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.2, 24), new THREE.MeshBasicMaterial({color: "#ffd36b", transparent: true, opacity: 0.8, depthTest: false}));
    this.isaret.rotation.x = -Math.PI / 2; this.isaret.renderOrder = 10; savas.grup.add(this.isaret);
    this.secimHalka = new THREE.Mesh(new THREE.RingGeometry(6, 6.6, 32), new THREE.MeshBasicMaterial({color: "#7fd3ff", transparent: true, opacity: 0.55, depthTest: false}));
    this.secimHalka.rotation.x = -Math.PI / 2; this.secimHalka.renderOrder = 10; savas.grup.add(this.secimHalka);
    this.viewmodel = this.vmKur(); this.kam.add(this.viewmodel);
    this.tak = {x: 0, z: 40, yuk: 190};
    this.ganimet = false;
    this.bizMangalar = () => this.s.mangalar.filter(m => m.taraf === 0 && !m.komutan);
    savas.motor.oyuncuDustu = () => this.dustu();
    savas.motor.komutanDustu = () => { if (this.mod !== "asker") this.dustu(); else this.s.mesaj("Komutanınız yaralandı! Karargâh sarsıldı.", "kotu"); };
    savas.motor.oyuncuHasar = (m) => { this.motor.hasarFlas = Math.min(1, (this.motor.hasarFlas || 0) + m / 80); };
    if (this.mod === "asker") this.askerSec(); else this.komutanOl();
    kilitIste();
  }
  // ---------- kurulum ----------
  vmKur() {
    const g = new THREE.Group(); const M = c => new THREE.MeshLambertMaterial({color: c});
    const ceket = this.s.uniBiz.ceket, ten = M("#d9a77f"), kol = M(ceket);
    this.vmKol = new THREE.Group(); g.add(this.vmKol);
    // sağ kol: dipçiğin altından ekrana doğru, sol el: ön kundakta
    const sag = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.075, 0.3), kol); sag.position.set(0.2, -0.24, -0.12); sag.rotation.set(0.35, -0.25, 0); this.vmKol.add(sag);
    const sagEl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.08), ten); sagEl.position.set(0.17, -0.19, -0.27); this.vmKol.add(sagEl);
    const sol = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.34), kol); sol.position.set(0.02, -0.26, -0.36); sol.rotation.set(0.5, 0.45, 0); this.vmKol.add(sol);
    const solEl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.09), ten); solEl.position.set(0.11, -0.17, -0.52); this.vmKol.add(solEl);
    this.vmSilahlar = {};
    const ahsap = M("#5a3c22"), celik = M("#3a3c40");
    const tf = new THREE.Group();
    const dip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.085, 0.3), ahsap); dip.position.set(0, -0.025, 0.06); dip.rotation.x = -0.12; tf.add(dip);
    const kun = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.045, 0.62), ahsap); kun.position.set(0, 0, -0.38); tf.add(kun);
    const nl = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.75, 6), celik); nl.rotation.x = Math.PI / 2; nl.position.set(0, 0.03, -0.55); tf.add(nl);
    const arpacik = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.02, 0.01), celik); arpacik.position.set(0, 0.05, -0.9); tf.add(arpacik);
    const gez = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.018, 0.01), celik); gez.position.set(0, 0.045, -0.12); tf.add(gez);
    const sg = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.016, 0.26), M("#a8adb3")); sg.position.set(0, 0.012, -1.03); tf.add(sg);
    tf.position.set(0.16, -0.17, -0.2); tf.rotation.y = 0.04; this.vmSilahlar.tufek = tf; g.add(tf);
    const tb = new THREE.Group(); const tb1 = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.09, 0.05), ahsap); tb1.rotation.x = 0.25; tb.add(tb1); const tb2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.18), celik); tb2.position.set(0, 0.045, -0.08); tb.add(tb2);
    tb.position.set(0.17, -0.17, -0.36); this.vmSilahlar.tabanca = tb; g.add(tb);
    const kl = new THREE.Group(); const k1 = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.04, 0.8), M("#c3c8cd")); k1.position.z = -0.42; kl.add(k1); const k2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.025), M("#c9a33a")); kl.add(k2);
    kl.position.set(0.22, -0.22, -0.3); kl.rotation.set(0.7, -0.15, 0); this.vmSilahlar.kilic = kl; g.add(kl);
    this.namluNokta = new THREE.Object3D(); this.namluNokta.position.set(0.16, -0.14, -1.2); g.add(this.namluNokta);
    g.visible = false;
    g.traverse(o => { if (o.isMesh) { o.renderOrder = 20; o.material.depthTest = true; } });
    return g;
  }
  vmGoster() {
    const a = this.asker; if (!a) return;
    const tip = a.model === "kilic" || a.model === "mizrak" ? "kilic" : a.model === "tabanca" ? "tabanca" : "tufek";
    this.vmTip = tip;
    for (const [k, o] of Object.entries(this.vmSilahlar)) o.visible = k === tip;
    this.vmKol.visible = tip !== "kilic";
  }
  askerSec(oncelik) {
    const s = this.s;
    const uygun = m => !m.yokOldu && !m.top && !m.mg && !m.bozuk && ["piyade", "suvari"].includes(m.tanim.sinif) && s.canlilar(m).some(a => !a.arac);
    let m = oncelik && uygun(oncelik) ? oncelik : null;
    if (!m) { const L = this.bizMangalar().filter(uygun); const sec = L[this.secili] || L[0]; m = sec; }
    if (!m) { this.s.mesaj("Kontrol edilecek asker kalmadı; komutan olarak devam.", "uyari"); this.komutanOl(); return false; }
    const canli = s.canlilar(m).filter(a => !a.arac).sort((p, q) => p.slot - q.slot);
    const a = canli[Math.min(canli.length - 1, Math.floor(Math.min(5, canli.length) / 2))];
    if (this.asker) this.asker.oyuncu = false;
    this.asker = a; a.oyuncu = true; a.silahW = m.silah; s.oyuncuAsker = a; this.mod = "asker"; this.motor.birinciSahis = true;
    this.yaw = a.yon; this.pitch = -0.02; this.diz = false;
    this.bombalar = m.tanim.ikinci === "el_bombasi" ? 3 : 0;
    this.viewmodel.visible = true; this.vmGoster(); s.komutan.oyuncu = false;
    this.kam.fov = 70; this.kam.updateProjectionMatrix();
    this.s.mesaj(`${m.ad} içinde bir asker olarak savaşıyorsun.`, "bilgi");
    return true;
  }
  komutanOl() {
    if (this.asker) { this.asker.oyuncu = false; this.asker = null; }
    this.s.oyuncuAsker = this.s.komutan; this.s.komutan.oyuncu = true; this.mod = "komutan"; this.motor.birinciSahis = false;
    this.viewmodel.visible = false; this.kam.fov = 60; this.kam.updateProjectionMatrix();
    this.yaw = this.s.komutan.yon;
    kilitIste();
  }
  dustu() {
    if (this.s.bitti) return;
    this.oluT = 3.5; this.viewmodel.visible = false;
    this.motor.onMesaj && this.motor.onMesaj(this.mod === "asker" ? "Vuruldun! Başka bir askerin gözünden devam edeceksin…" : "Komutan yaralandı! Sedyeyle karargâha taşınıyorsun…", "kotu");
  }
  // ---------- seçim ----------
  seciliManga() { const L = this.bizMangalar(); return L[Math.min(this.secili, L.length - 1)]; }
  sec(i) { const L = this.bizMangalar(); if (i < L.length) { this.secili = i; ses("tik"); } }

  // ---------- güncelleme ----------
  guncelle(dt) {
    const s = this.s;
    const hs = 0.0022 * AYAR.hassasiyet * (this.nisan ? 0.45 : 1) * (this.durbun ? 0.3 : 1);
    if (this.mod !== "taktik") { this.yaw -= G.fareDX * hs; this.pitch = Math.max(-1.3, Math.min(1.2, this.pitch - G.fareDY * hs)); }
    // sayı tuşları: manga seçimi
    for (let i = 1; i <= 9; i++) if (bas("Digit" + i)) this.sec(i - 1);
    if (this.oluT > 0) {
      this.oluT -= dt;
      this.kam.position.y += dt * 0.6;
      if (this.oluT <= 0) {
        if (this.mod === "asker") { if (!this.askerSec(this.asker && this.asker.manga)) {} }
        else { const k = s.komutan; k.olu = false; k.can = 80; k.x = s.A.hedef.x + 6; k.z = s.A.hedef.z + 16; for (const m of s.mangalar) if (m.taraf === 0) m.moral -= 8; s.mesaj("Komutan yarasını sardı ve sahaya döndü.", "uyari"); }
      }
      this.isaret.visible = false; return;
    }
    if (!s.bitti || this.ganimet) {
      if (bas("KeyV") && !this.ganimet) { if (this.mod === "asker") this.komutanOl(); else this.askerSec(this.seciliManga()); }
      if (bas("Tab") && !this.ganimet) { if (this.mod === "taktik") { this.mod = "komutan"; kilitIste(); } else { if (this.mod === "asker") this.komutanOl(); this.mod = "taktik"; kilitBirak(); const k = s.komutan; this.tak.x = k.x; this.tak.z = k.z - 60; } }
    }
    if (this.mod === "asker") this.askerKontrol(dt);
    else if (this.mod === "komutan") this.komutanKontrol(dt);
    else this.taktikKontrol(dt);
    // seçili manga halkası
    const m = this.seciliManga();
    if (m && !m.yokOldu && m.cx !== undefined && !this.ganimet && this.mod !== "asker") { this.secimHalka.visible = true; this.secimHalka.position.set(m.cx, s.A.yuzey(m.cx, m.cz) + 0.3, m.cz); const r = m.atli ? 1.5 : 1; this.secimHalka.scale.set(r, r, r); }
    else this.secimHalka.visible = false;
  }
  hareket(dt, a, hiz) {
    const s = this.s;
    let fx = 0, fz = 0;
    if (tus("KeyW")) fz += 1; if (tus("KeyS")) fz -= 1; if (tus("KeyA")) fx += 1; if (tus("KeyD")) fx -= 1;
    const L = Math.hypot(fx, fz);
    if (L > 0) {
      const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
      const vx = (sy * fz + cy * fx) / L, vz = (cy * fz - sy * fx) / L;
      const st = hiz * dt * s.hava.hiz * (s.A.suda(a.x, a.z) ? 0.5 : 1);
      const nx = a.x + vx * st, nz = a.z + vz * st, lim = s.A.S / 2 - 4;
      if (!s.A.derinSu(nx, nz) && Math.abs(nx) < lim && Math.abs(nz) < lim) { a.x = nx; a.z = nz; }
      a.hiz = hiz; this.sallanma += dt * hiz * 2.2;
    } else a.hiz = 0;
    a.y = s.A.yuzey(a.x, a.z);
    return L > 0;
  }
  askerKontrol(dt) {
    const s = this.s, a = this.asker; if (!a || a.olu) return;
    const m = a.manga, w = a.silahW || m.silah, yakin = SILAHLAR[m.tanim.yakin];
    if (bas("KeyC") || bas("ControlLeft")) this.diz = !this.diz;
    const kosuyor = tus("ShiftLeft") && !this.nisan && !this.diz;
    let hiz = a.atli ? (kosuyor ? m.tanim.kosu : m.tanim.hiz * 1.6) : (kosuyor ? 4.2 : this.diz ? 1.1 : 1.9);
    const hareketli = this.hareket(dt, a, hiz);
    if (hareketli && this.diz && kosuyor) this.diz = false;
    a.yon = this.yaw; a.poz = a.atli ? "ata" : this.diz ? "diz" : hareketli ? (kosuyor ? "kos" : "yuru") : "nisan";
    if (a.at) { a.at.hiz = a.atli ? a.hiz : 0; a.at.t += dt; }
    if (a.atli && a.at && a.at.tur === "motor") a.y -= 0.75;
    // kamera
    const goz = a.atli ? 2.55 : this.diz ? 1.05 : 1.62;
    const bob = hareketli ? Math.sin(this.sallanma) * (kosuyor ? 0.06 : 0.03) : 0;
    const sars = (this.motor.sarsinti || 0);
    this.kam.position.set(a.x, a.y + goz + bob + (R() - 0.5) * sars * 0.3, a.z);
    this.kam.rotation.set(this.pitch + this.geriTep + (R() - 0.5) * sars * 0.05, this.yaw + Math.PI, 0, "YXZ");
    this.geriTep = Math.max(0, this.geriTep - dt * 1.8);
    // nişan / dürbün
    this.nisan = G.sag && this.vmTip !== "kilic";
    const durbun = this.nisan && w.durbun;
    if (durbun !== this.durbun) { this.durbun = durbun; this.motor.durbun && this.motor.durbun(durbun); }
    const fov = durbun ? 70 / w.durbun : this.nisan ? 46 : 70;
    if (Math.abs(this.kam.fov - fov) > 0.5) { this.kam.fov += (fov - this.kam.fov) * Math.min(1, dt * 12); this.kam.updateProjectionMatrix(); }
    // viewmodel
    const vm = this.viewmodel; const t = s.zaman;
    let vx = this.nisan ? -0.16 : 0, vy = this.nisan ? 0.075 : 0, vz = this.nisan ? 0.05 : 0, rx = 0, rz = 0;
    vy += Math.sin(t * 1.6) * 0.004 + (hareketli ? Math.abs(Math.sin(this.sallanma)) * -0.02 : 0); vx += hareketli ? Math.cos(this.sallanma) * 0.012 : 0;
    vz += this.geriTep * 0.6; rx += this.geriTep * 1.2;
    if (a.dolum > 0 && this.vmTip !== "kilic") { const k = Math.min(1, a.dolum * 2, (w.dolum - a.dolum) * 2); vy -= 0.18 * k; rx += 0.9 * k; rz -= 0.3 * k; this.vmKol.children[1].position.y = -0.19 + Math.sin(t * 9) * 0.05 * k; }
    if (this.kilicT > 0) { this.kilicT -= dt; const k = this.kilicT / 0.4; rx += -1.4 * Math.sin(k * Math.PI); rz += 0.6 * Math.sin(k * Math.PI); }
    vm.position.set(vx, vy, vz); vm.rotation.set(rx, 0, rz); vm.visible = !durbun;
    // ateş
    a.tutuk = Math.max(0, (a.tutuk || 0) - dt);
    if (this.vmTip === "kilic") { if (G.solBas && this.kilicT <= 0) this.yakinSaldir(a, yakin || SILAHLAR.kilic); }
    else if (G.sol && (w.tur !== "makineli" ? G.solBas : true)) this.ateset(a, w);
    if (bas("KeyR") && a.sarjor < w.sarjor && a.dolum <= 0) { a.dolum = w.dolum; a.sarjor = 0; }
    if (bas("KeyQ") && yakin) this.yakinSaldir(a, yakin);
    if (bas("KeyG") && this.bombalar > 0) { const h = this.ileriNokta(30); this.bombalar--; s.bombaAt(a, h.x, h.z, SILAHLAR.el_bombasi); s.mesaj(`El bombası! (${this.bombalar} kaldı)`, "bilgi"); }
    this.ortakTuslar(a);
    this.isaret.visible = false;
  }
  ileriNokta(maks = 300) {
    const d = new THREE.Vector3(); this.kam.getWorldDirection(d);
    const z = this.s.zeminVur(this.kam.position, d, maks);
    return z || {x: this.kam.position.x + d.x * maks, z: this.kam.position.z + d.z * maks, y: 0};
  }
  ortakTuslar(a) {
    const s = this.s;
    if (bas("KeyT")) { const p = this.ileriNokta(1400); s.topcuAtesi(p.x, p.z); }
    if (bas("KeyF")) { const p = this.ileriNokta(160); s.fisekAt(p.x, p.z); }
    if (bas("KeyB")) { borazan("hucum"); for (const m of this.bizMangalar()) if (!m.bozuk && m.cx !== undefined && Math.hypot(m.cx - a.x, m.cz - a.z) < 40) m.moral = Math.min(m.moralMax, m.moral + 6); s.mesaj("Borazan çaldı: yakındaki mangaların morali yükseldi.", "iyi"); this.borazanT = 30; }
  }
  ateset(a, w) {
    const s = this.s;
    if (a.dolum > 0 || a.tutuk > 0) return;
    if (a.sarjor <= 0) { a.dolum = w.dolum; return; }
    if (a.mermi <= 0) { s.mesaj("Cephane bitti!", "uyari"); return; }
    if (w.aralik > 0.3 && this.sonAtis && s.zaman - this.sonAtis < w.aralik) return;
    if (w.tur === "makineli" && this.sonAtis && s.zaman - this.sonAtis < w.aralik) return;
    this.sonAtis = s.zaman;
    // tutukluk (yağmur, bakım)
    const m = a.manga;
    let tut = w.tutukluk * (s.hava.yagis === "yagmur" ? w.yagmur * s.hava.tutukluk / 3 + 1 : 1) * (m.bakim === true ? 0.25 : m.bakim === false ? 2.2 : 1);
    if (R() < tut) { a.tutuk = 3; s.mesaj("Tüfek tutukluk yaptı! (bekle)", "uyari"); ses("tik"); return; }
    a.sarjor--; a.mermi--; a.atisT = s.zaman;
    if (a.sarjor <= 0) a.dolum = w.dolum * 0.9;
    this.geriTep += w.tur === "makineli" ? 0.012 : 0.06;
    const d = new THREE.Vector3(); this.kam.getWorldDirection(d);
    const sap = (1 - w.isabet) * 0.045 * (this.nisan ? 0.35 : 1) * (this.diz ? 0.7 : 1) * (a.hiz > 0.5 ? 2 : 1) * (s.hava.isabet < 1 ? 1.2 : 1);
    d.x += (R() - 0.5) * sap; d.y += (R() - 0.5) * sap; d.z += (R() - 0.5) * sap; d.normalize();
    // keskin nişancı: rüzgâr
    const o = this.kam.position.clone();
    const hit = s.isinVur(o, d, 0, w.menzil * 1.5);
    const zemin = s.zeminVur(o, d, w.menzil * 1.5);
    const np = new THREE.Vector3(); this.namluNokta.getWorldPosition(np);
    s.E.namlu(np.x, np.y, np.z, d.x, d.z, w.duman * 0.8 + 0.1, false);
    ses(w.ses, 0, 0.9);
    if (hit && (!zemin || hit.t < zemin.t)) {
      const h = hit.a; const yy = o.y + d.y * hit.t;
      const kafa = !h.arac && !h.atli && yy - h.y > (h.poz === "diz" ? 0.9 : 1.5);
      let dmg = w.hasar * (0.85 + R() * 0.3) * (kafa ? 2 : 1) * (1 - Math.max(0, hit.t / w.menzil - 0.8));
      s.hasar(h, dmg, a, "mermi");
      s.E.isabet(o.x + d.x * hit.t, yy, o.z + d.z * hit.t, h.arac ? "metal" : "asker");
      this.motor.isabetIsareti && this.motor.isabetIsareti(h.olu);
      if (h.olu && !h.arac) s.mesaj(kafa ? "Tam isabet!" : "Düşman askeri düştü.", "iyi");
      h.manga.moral -= 1;
    } else if (zemin) s.E.isabet(zemin.x, zemin.y, zemin.z, s.A.suda(zemin.x, zemin.z) ? "su" : "toprak");
  }
  yakinSaldir(a, w) {
    const s = this.s; this.kilicT = 0.4; ses("kilic", 0);
    const d = new THREE.Vector3(); this.kam.getWorldDirection(d); d.y = 0; d.normalize();
    let en = null, ed = w.menzil + (a.atli ? 1.5 : 0.8);
    for (const b of s.askerler) { if (b.olu || b.taraf === 0 || b.arac) continue; const dx = b.x - a.x, dz = b.z - a.z, dd = Math.hypot(dx, dz); if (dd > ed) continue; if ((dx * d.x + dz * d.z) / (dd + 1e-6) < 0.5) continue; en = b; ed = dd; }
    if (en) { s.hasar(en, w.hasar * (a.atli && a.hiz > 4 ? 1.5 : 1) * (0.9 + R() * 0.3), a, "yakin"); s.E.isabet(en.x, en.y + 1.1, en.z, "asker"); en.manga.moral -= 3; this.motor.isabetIsareti && this.motor.isabetIsareti(en.olu); }
  }
  komutanKontrol(dt) {
    const s = this.s, a = s.komutan; if (!a || a.olu) return;
    const kos = tus("ShiftLeft");
    const hareketli = this.hareket(dt, a, kos ? 4.6 : 2);
    if (hareketli) a.yon += aciFark(a.yon, this.yaw) * Math.min(1, dt * 10);
    a.poz = hareketli ? (kos ? "kos" : "yuru") : (this.borazanT > 0 ? "selam" : "dur");
    this.borazanT = Math.max(0, (this.borazanT || 0) - dt);
    // kamera: omuz üstü
    const mesafe = 6.2, yuk = 2.3, omuz = 0.9;
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    let kx = a.x - sy * mesafe * cp + cy * omuz, kz = a.z - cy * mesafe * cp - sy * omuz, ky = a.y + yuk - sp * mesafe;
    ky = Math.max(ky, s.A.yuzey(kx, kz) + 0.6);
    const sars = this.motor.sarsinti || 0;
    this.kam.position.set(kx + (R() - 0.5) * sars * 0.4, ky, kz);
    this.kam.rotation.set(this.pitch * 0.9 - 0.12, this.yaw + Math.PI, 0, "YXZ");
    // nişan noktası
    const p = this.ileriNokta(700);
    this.isaret.visible = !!p && !this.ganimet; if (p) this.isaret.position.set(p.x, (p.y ?? s.A.yuzey(p.x, p.z)) + 0.25, p.z);
    this.hedefNokta = p;
    if (this.ganimet) return;
    // emirler
    const m = this.seciliManga();
    if (G.sagBas && m && p) { s.emirVer(m, {tur: "git", x: p.x, z: p.z, kos: tus("ShiftLeft")}); s.mesaj(`${m.ad}: ilerle!`, "bilgi"); ses("tik"); }
    if (bas("KeyG") && m) { if (m.top) { m.top.hedefNokta = p ? {x: p.x, z: p.z} : null; s.mesaj(`${m.ad}: hedef belirlendi.`, "bilgi"); } else { s.emirVer(m, {tur: "hucum"}); s.mesaj(`${m.ad}: HÜCUM!`, "iyi"); } }
    if (bas("KeyH") && m) { s.emirVer(m, {tur: "tut"}); if (m.top) m.top.hedefNokta = null; s.mesaj(`${m.ad}: mevzini tut, serbest atış.`, "bilgi"); }
    if (bas("KeyX") && m) { s.emirVer(m, {tur: "geri"}); s.mesaj(`${m.ad}: geri çekil!`, "uyari"); }
    if (G.solBas) this.ateset(a, SILAHLAR.tabanca);
    if (bas("KeyQ")) this.yakinSaldir(a, SILAHLAR.kilic);
    this.ortakTuslar(a);
  }
  taktikKontrol(dt) {
    const s = this.s, T = this.tak;
    const hz = T.yuk * 0.9 * dt;
    if (tus("KeyW")) T.z -= hz; if (tus("KeyS")) T.z += hz; if (tus("KeyA")) T.x -= hz; if (tus("KeyD")) T.x += hz;
    T.yuk = Math.max(60, Math.min(420, T.yuk + G.tekerlek * 18));
    const L = s.A.S / 2; T.x = Math.max(-L, Math.min(L, T.x)); T.z = Math.max(-L, Math.min(L, T.z));
    this.kam.position.set(T.x, T.yuk, T.z + T.yuk * 0.55);
    this.kam.lookAt(T.x, 0, T.z);
    // fare ile seçim ve emir
    const ray = new THREE.Raycaster(); const v = new THREE.Vector2((G.x / innerWidth) * 2 - 1, -(G.y / innerHeight) * 2 + 1);
    ray.setFromCamera(v, this.kam);
    const p = s.zeminVur(ray.ray.origin, ray.ray.direction, 1500);
    this.isaret.visible = !!p; if (p) this.isaret.position.set(p.x, p.y + 0.3, p.z);
    if (G.solTik) {
      // ekran uzayında en yakın manga
      let en = -1, ed = 40;
      this.bizMangalar().forEach((m, i) => { if (m.yokOldu || m.cx === undefined) return; const q = new THREE.Vector3(m.cx, s.A.yuzey(m.cx, m.cz), m.cz).project(this.kam); const sx = (q.x + 1) / 2 * innerWidth, sy = (1 - q.y) / 2 * innerHeight; const d = Math.hypot(sx - G.x, sy - G.y); if (d < ed) { ed = d; en = i; } });
      if (en >= 0) this.sec(en);
    }
    const m = this.seciliManga();
    if (G.sagTik && p && m) { s.emirVer(m, {tur: "git", x: p.x, z: p.z, kos: tus("ShiftLeft")}); ses("tik"); }
    if (bas("KeyG") && m) { if (m.top && p) m.top.hedefNokta = {x: p.x, z: p.z}; else s.emirVer(m, {tur: "hucum"}); }
    if (bas("KeyH") && m) s.emirVer(m, {tur: "tut"});
    if (bas("KeyX") && m) s.emirVer(m, {tur: "geri"});
    if (bas("KeyT") && p) s.topcuAtesi(p.x, p.z);
    if (bas("KeyF") && p) s.fisekAt(p.x, p.z);
  }
  dispose() { this.kam.remove(this.viewmodel); kilitBirak(); this.kam.fov = 60; this.kam.updateProjectionMatrix(); }
}
