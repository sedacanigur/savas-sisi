// Savaş kampı (ordugâh): yürünebilir 3D sahne, binalar, karakterler, olaylar ve kamp panelleri.
import * as THREE from "three";
import {motor} from "./motor.js";
import {havaKur} from "./dunya/hava.js";
import {efektKur} from "./savas/efekt.js";
import {Kalabalik, AT_RENKLER} from "./modeller/kalabalik.js";
import * as N from "./modeller/nesneler.js";
import {gurultu, rng} from "./dunya/gurultu.js";
import {HAVALAR, SAATLER, IKLIMLER, HARITALAR} from "./veri/haritalar.js";
import {ULKELER, uniformaOf} from "./veri/ulkeler.js";
import {BIRLIKLER} from "./veri/birlikler.js";
import {SILAHLAR} from "./veri/silahlar.js";
import {TEKNOLOJILER, TEK, KOLLAR, CAGLAR, BINALAR, TASARIM} from "./veri/teknoloji.js";
import {BOLUMLER, OLAYLAR, KARAKTERLER} from "./veri/hikaye.js";
import {KAYNAK, RUTBELER, OYUN_ADI} from "./veri/oyun.js";
import {K, kaydet, birlikTanimi, yeniManga, yeterli, harca, ekle, tekAcik, binaAcik, tekArastirilabilir} from "./kayit.js";
import {UI, el, esc, modal, toast, temizle, acikModalVar, bedelMetin, gecis, onayla} from "./ui/arayuz.js";
import {G, tus, bas, kilitIste, kilitBirak} from "./girdi.js";
import {ses, sesBaslat, ortamSes} from "./ses.js";
import {gorevBaslat} from "./akis.js";

const R = Math.random;
const aciFark = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

// istasyonlar
const IST = [
  {id: "harita", x: 0, z: -26, kim: "selim"}, {id: "ordu", x: -24, z: -14, kim: "demir"}, {id: "harp_okulu", x: 24, z: -14},
  {id: "kisla", x: -32, z: 8, kim: "halit"}, {id: "ahir", x: -22, z: 28}, {id: "tophane", x: 22, z: 26, kim: "kemal"},
  {id: "firin", x: 33, z: 5, kim: "riza"}, {id: "revir", x: 0, z: 34, kim: "nermin"}, {id: "atolye", x: 44, z: -30}, {id: "hangar", x: -46, z: -32},
];

export class Kamp {
  constructor(vitrin = false) {
    this.vitrin = vitrin; const sahne = motor.sahne;
    this.grup = new THREE.Group(); sahne.add(this.grup);
    this.yil = K ? BOLUMLER[Math.min(K.bolum, BOLUMLER.length - 1)].yil : 1866;
    const iklim = IKLIMLER.iliman;
    this.H = havaKur(sahne, {hava: vitrin ? HAVALAR.acik : HAVALAR.bulutlu, saat: vitrin ? SAATLER.aksam : SAATLER.gunduz, iklim});
    this.E = efektKur(sahne, 900); this.E.ruzgar.set(0.6, 0.3); motor.efekt = this.E; this.E.kam = motor.kamera; this.E.zemin = (x, z) => this.yukseklik(x, z);
    this.K = new Kalabalik(sahne, 90, 20);
    this.zeminKur();
    this.yapilarKur();
    this.halkKur();
    this.t = 0; this.yaw = 0; this.pitch = -0.15;
    this.etiketler = [];
  }
  yukseklik(x, z) { return this.n.fbm(x / 90, z / 90, 3) * 2.5 + Math.max(0, Math.hypot(x, z) - 75) * 0.12; }
  zeminKur() {
    this.n = gurultu(77);
    const geo = new THREE.PlaneGeometry(320, 320, 80, 80); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position, renk = new Float32Array(p.count * 3), c = new THREE.Color(), cim = new THREE.Color("#6a7f3e"), toprak = new THREE.Color("#7a6646");
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, this.yukseklik(x, z)); const d = Math.hypot(x, z); c.copy(cim).lerp(toprak, Math.max(0, 1 - d / 42) * 0.7 + this.n(x / 8, z / 8) * 0.15); renk.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute("color", new THREE.BufferAttribute(renk, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({vertexColors: true})); m.receiveShadow = true; this.grup.add(m);
    // ağaç halkası
    const r = rng(5), ag = [];
    for (let i = 0; i < 260; i++) { const a = r() * Math.PI * 2, d = 70 + r() * 80; ag.push([Math.cos(a) * d, Math.sin(a) * d, 0.7 + r() * 0.7]); }
    const gov = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.3, 4, 5).translate(0, 2, 0), N.mat("#5a4330"), ag.length);
    const tepe = new THREE.InstancedMesh(new THREE.ConeGeometry(2.2, 6.5, 7).translate(0, 6, 0), N.mat("#33553a"), ag.length);
    const o = new THREE.Object3D();
    ag.forEach(([x, z, s], i) => { o.position.set(x, this.yukseklik(x, z), z); o.scale.set(s, s, s); o.rotation.y = s * 10; o.updateMatrix(); gov.setMatrixAt(i, o.matrix); tepe.setMatrixAt(i, o.matrix); });
    gov.castShadow = tepe.castShadow = true; this.grup.add(gov, tepe);
  }
  koy(o, x, z, ry = 0) { o.position.set(x, this.yukseklik(x, z), z); o.rotation.y = ry; o.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); this.grup.add(o); return o; }
  yapilarKur() {
    const bayrak = ULKELER.ardicova.bayrak;
    this.sancak = this.koy(N.sancak(bayrak, 9), 3, -2);
    this.koy(N.ates(), 0, 0);
    // harita masası çadırı
    this.koy(N.buyukCadir("#e2d6bb", 9, 7, 4), 0, -28); this.koy(N.masa("harita"), 0, -22.5);
    this.koy(N.buyukCadir("#d8ccb0", 8, 7, 4), -26, -16, 0.6); this.koy(N.sancak(bayrak, 5), -22, -11);
    // harp okulu: taş bina
    const hb = new THREE.Group(); const gb = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 7), N.mat("#b5ab98")); gb.position.y = 2.5; hb.add(gb);
    const cat = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 7.4, 3, 4), N.mat("#8c4a32")); cat.rotation.y = Math.PI / 4; cat.scale.set(1, 1, 0.7); cat.position.y = 6.5; hb.add(cat);
    for (const x of [-3, 0, 3]) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.1), N.mat("#3a4a5a")); p.position.set(x, 3, 3.52); hb.add(p); }
    this.koy(hb, 26, -17, -0.5);
    // kışla: çadır sırası
    for (let i = 0; i < 4; i++) this.koy(N.cadir("#d8ccb0"), -36, -2 + i * 6, Math.PI / 2);
    // ahır
    const ah = new THREE.Group(); const zem = new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 6), N.mat("#6b4a2b")); ah.add(zem);
    for (const x of [-5.8, 5.8]) for (const z of [-2.8, 2.8]) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.4, 0.3), N.mat("#5a3c22")); d.position.set(x, 1.7, z); ah.add(d); }
    const ac = new THREE.Mesh(new THREE.BoxGeometry(13, 0.3, 7), N.mat("#7a5634")); ac.position.y = 3.5; ac.rotation.x = 0.12; ah.add(ac);
    this.koy(ah, -22, 32);
    // tophane
    const tp = ah.clone(); this.koy(tp, 24, 30);
    this.koy(N.top("top"), 20, 30, 0.3); this.koy(N.top("top"), 26, 31, -0.2); this.koy(N.topYigini(), 29, 27);
    // fırın
    this.firin = this.koy(N.firin(), 35, 6, -Math.PI / 2);
    // revir
    this.koy(N.buyukCadir("#f0ebe0", 8, 6, 3.6), 0, 37, Math.PI); this.koy(N.sancak(["#f2f2f2", "#c8102e", "#f2f2f2"], 4), 5, 33);
    // poligon
    for (let i = 0; i < 4; i++) this.koy(N.hedefTahta(), -10 + i * 6, -58);
    // araba ve sandıklar
    this.koy(N.araba(), 12, -6, 0.8); this.koy(N.sandik(), -8, 14); this.koy(N.sandik(), -6.8, 14.6, 0.3);
    // açılabilir binalar
    this.atolyeObj = new THREE.Group(); const at = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 8), N.mat("#7d7466")); at.position.y = 2.25; this.atolyeObj.add(at); const baca = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 4, 8), N.mat("#4a4440")); baca.position.set(3, 6, 0); this.atolyeObj.add(baca);
    this.koy(this.atolyeObj, 46, -32, -0.6);
    this.hangarObj = new THREE.Group(); const hg = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 14, 16, 1, true, 0, Math.PI), N.mat("#8a8574", {side: THREE.DoubleSide})); hg.rotation.z = Math.PI / 2; hg.rotation.y = Math.PI / 2; hg.position.y = 0; this.hangarObj.add(hg);
    this.balon = N.balon(); this.balon.position.set(8, 18, 4); this.balon.scale.set(0.7, 0.7, 0.7); this.hangarObj.add(this.balon);
    this.koy(this.hangarObj, -48, -34, 0.5);
    this.binaGorunurluk();
  }
  binaGorunurluk() { if (!K) { this.atolyeObj.visible = this.hangarObj.visible = true; return; } this.atolyeObj.visible = !!K.tek.atolye; this.hangarObj.visible = !!K.tek.balon; }
  halkKur() {
    const uni = uniformaOf("ardicova", this.yil);
    const C = c => new THREE.Color(c);
    const ceket = C(uni.ceket), pan = C(uni.pantolon), sapkaC = C(uni.sapkaRenk);
    const yeni = (x, z, poz, yon, ek = {}) => ({x, z, y: this.yukseklik(x, z), yon, poz, t: R() * 10, hiz: 0, ceketC: ceket, pantolonC: pan, sapka: uni.sapka, sapkaC, tenC: C(["#d9a77f", "#c99572", "#e1b48e", "#b98563"][(R() * 4) | 0]), kemerC: C("#e9e3d2"), cizmeC: C("#1d1a17"), model: poz === "otur" || poz === "yemek" ? null : "tufek", canta: false, ...ek});
    this.halk = [];
    // ateş başı
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; this.halk.push(yeni(Math.cos(a) * 3.2, Math.sin(a) * 3.2, i % 3 === 0 ? "yemek" : "otur", Math.atan2(-Math.cos(a), -Math.sin(a)))); }
    // nöbetçiler ve talim
    this.halk.push(yeni(-8, -40, "dur", Math.PI), yeni(8, -40, "dur", Math.PI));
    for (let i = 0; i < 6; i++) this.halk.push(yeni(-18 + (i % 3) * 1.6, 0 + Math.floor(i / 3) * 1.6, "yuru", 0, {talim: true, x0: -18 + (i % 3) * 1.6, z0: Math.floor(i / 3) * 1.6}));
    // poligon atıcıları
    for (let i = 0; i < 3; i++) this.halk.push(yeni(-7 + i * 6, -44, "nisan", Math.PI, {poligon: true}));
    // ahırdaki atlar
    for (let i = 0; i < 4; i++) this.halk.push({...yeni(-26 + i * 2.6, 31, "dur", Math.PI / 2), sadeceAt: true, at: {tur: "at", renk: AT_RENKLER[i], hiz: 0, t: R() * 5}});
    // topçular
    this.halk.push(yeni(21, 28, "top", 0.3), yeni(28, 29, "dur", -0.4));
    // karakterler
    this.karakterler = [];
    for (const s of IST) if (s.kim) {
      const k = KARAKTERLER[s.kim]; const dx = -s.x, dz = -s.z, L = Math.hypot(dx, dz);
      const a = yeni(s.x + dx / L * 4.5, s.z + dz / L * 4.5, s.kim === "riza" ? "at" : "dur", Math.atan2(dx, dz), {karakter: s.kim, ceketC: s.kim === "nermin" ? C("#f0ebe0") : s.kim === "riza" ? C("#e8e2d0") : s.kim === "demir" ? C("#1f3a37") : ceket, model: s.kim === "demir" ? "kilic" : null, sapka: s.kim === "nermin" ? "fes" : s.kim === "riza" ? "kalpak" : uni.sapka, sapkaC: s.kim === "nermin" ? C("#f0ebe0") : sapkaC});
      if (s.kim === "nermin") a.sapka = "kask", a.sapkaC = C("#f0ebe0");
      this.halk.push(a); this.karakterler.push({a, s});
    }
    // oyuncu (komutan)
    this.ben = yeni(0, 12, "dur", Math.PI, {model: "kilic", ceketC: C("#1f3a37")});
    if (!this.vitrin) this.halk.push(this.ben);
  }
  // ---------- ekran ----------
  baslat() {
    temizle();
    if (this.vitrin) return;
    sesBaslat(); ortamSes("ates");
    this.ustCiz();
    this.istem = el(`<div class="istem panel" hidden></div>`); UI.appendChild(this.istem);
    this.yardim = el(`<div class="panel" style="position:fixed;bottom:14px;left:14px;padding:8px 12px;font-size:13px;line-height:1.5"><b>Kamp</b> · <span class="kbd">WASD</span> yürü · fare ile bak (ekrana tıkla) · binalara yaklaşınca <span class="kbd">E</span> · <span class="kbd">M</span> harita masası</div>`);
    UI.appendChild(this.yardim);
    this.etiketKur();
    kilitIste();
    if (K.olay) setTimeout(() => this.olayGoster(K.olay), 700);
  }
  ustCiz() {
    document.querySelector(".kamp-ust")?.remove();
    const b = BOLUMLER[Math.min(K.bolum, BOLUMLER.length - 1)];
    const u = el(`<div class="kamp-ust panel"><span class="eyebrow" style="margin-right:8px">${RUTBELER[K.rutbe]} · ${K.bolum >= BOLUMLER.length ? "Sefer tamamlandı" : `${K.bolum + 1}. bölüm · ${b.yil}`}</span>
      ${Object.entries(KAYNAK).map(([k, v]) => `<span class="kaynak" title="${v.ad}">${v.simge} <b>${K.kaynak[k] || 0}</b> <span class="soluk" style="font-size:12px">${v.ad}</span></span>`).join("")}
      ${K.arastirma ? `<span class="cip uyari">Araştırılıyor: ${esc(TEK[K.arastirma.id].ad)}</span>` : ""}
      <button class="btn kucuk" style="margin-left:auto" data-p="harita">Harita Masası (M)</button><button class="btn kucuk menu">Menü</button></div>`);
    u.querySelector("[data-p]").onclick = () => this.panel("harita");
    u.querySelector(".menu").onclick = () => this.cikis();
    UI.prepend(u);
  }
  etiketKur() {
    for (const e of this.etiketler) e.el.remove(); this.etiketler = [];
    for (const s of IST) {
      if (s.id === "atolye" && !K.tek.atolye) continue; if (s.id === "hangar" && !K.tek.balon) continue;
      const k = s.kim ? KARAKTERLER[s.kim] : null;
      const e = el(`<div class="etiket"><b>${esc(BINALAR[s.id].ad)}</b>${k ? `<br>${esc(k.ad)}` : ""}</div>`); UI.appendChild(e);
      this.etiketler.push({el: e, x: s.x, z: s.z, y: 5.5});
    }
  }
  cikis() { kilitBirak(); import("./menu.js").then(m => gecis(() => m.anaMenu())); }
  guncelle(dt) {
    this.t += dt;
    const kam = motor.kamera;
    if (this.vitrin) {
      const a = this.t * 0.05; kam.position.set(Math.cos(a) * 46, 14 + Math.sin(this.t * 0.1) * 2, Math.sin(a) * 46); kam.lookAt(0, 3, 0);
    } else if (!acikModalVar()) {
      const b = this.ben;
      this.yaw -= G.fareDX * 0.0022; this.pitch = Math.max(-0.9, Math.min(0.5, this.pitch - G.fareDY * 0.0022));
      let fx = 0, fz = 0; if (tus("KeyW")) fz += 1; if (tus("KeyS")) fz -= 1; if (tus("KeyA")) fx += 1; if (tus("KeyD")) fx -= 1;
      const L = Math.hypot(fx, fz), hz = tus("ShiftLeft") ? 5 : 2.2;
      if (L) { const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw); const vx = (sy * fz + cy * fx) / L, vz = (cy * fz - sy * fx) / L; b.x += vx * hz * dt; b.z += vz * hz * dt; b.yon += aciFark(b.yon, Math.atan2(vx, vz)) * Math.min(1, dt * 10); b.poz = hz > 3 ? "kos" : "yuru"; b.hiz = hz; }
      else { b.poz = "dur"; b.hiz = 0; }
      const r = Math.hypot(b.x, b.z); if (r > 68) { b.x *= 68 / r; b.z *= 68 / r; }
      b.y = this.yukseklik(b.x, b.z);
      const m = 6.5, cp = Math.cos(this.pitch);
      kam.position.set(b.x - Math.sin(this.yaw) * m * cp, b.y + 2.6 - Math.sin(this.pitch) * m, b.z - Math.cos(this.yaw) * m * cp);
      kam.position.y = Math.max(kam.position.y, this.yukseklik(kam.position.x, kam.position.z) + 0.5);
      kam.lookAt(b.x, b.y + 1.6, b.z);
      // istasyon
      let en = null, ed = 7.5;
      for (const s of IST) { if (s.id === "atolye" && !K.tek.atolye) continue; if (s.id === "hangar" && !K.tek.balon) continue; const d = Math.hypot(s.x - b.x, s.z - b.z); if (d < ed) { ed = d; en = s; } }
      this.yakin = en;
      this.istem.hidden = !en; if (en) this.istem.innerHTML = `<span class="kbd">E</span> ${esc(BINALAR[en.id].ad)} — ${esc(BINALAR[en.id].tanim)}`;
      if (en && bas("KeyE")) this.panel(en.id);
      if (bas("KeyM")) this.panel("harita");
    }
    // halk animasyonu
    for (const a of this.halk) {
      a.t += dt;
      if (a.talim) { const f = Math.floor(a.t / 6) % 2; a.z = a.z0 + (f ? 1 : -1) * ((a.t % 6) - 3) * 0.6 + 2; a.yon = f ? 0 : Math.PI; a.hiz = 1.4; a.y = this.yukseklik(a.x, a.z); }
      if (a.poligon && R() < dt * 0.25) { this.E.namlu(a.x, a.y + 1.45, a.z - 0.9, 0, -1, 1, false); ses("musket", Math.hypot(a.x - kam.position.x, a.z - kam.position.z)); }
      if (a.at) a.at.t += dt;
    }
    this.K.ciz(this.halk);
    // efektler
    if (R() < dt * 30) this.E.ates(0, this.yukseklik(0, 0), 0);
    if (R() < dt * 4) this.E.baca(35, this.yukseklik(35, 6) + 3, 7);
    if (this.atolyeObj.visible && R() < dt * 3) this.E.baca(46 + 2.5, 8, -32 - 1.7);
    this.E.guncelle(dt);
    this.sancak.userData.dalga(this.t, 3);
    this.balon.position.y = 18 + Math.sin(this.t * 0.5) * 0.6;
    this.H.guncelle(dt, kam, this.ben);
    // etiketler
    const v = new THREE.Vector3();
    for (const e of this.etiketler) { v.set(e.x, this.yukseklik(e.x, e.z) + e.y, e.z); const d = v.distanceTo(kam.position); v.project(kam); const g = v.z < 1 && d < 60; e.el.style.display = g ? "" : "none"; if (g) { e.el.style.left = (v.x + 1) / 2 * innerWidth + "px"; e.el.style.top = (1 - v.y) / 2 * innerHeight + "px"; e.el.style.opacity = Math.min(1, (60 - d) / 20); } }
  }
  bitir() {
    for (const e of this.etiketler) e.el.remove();
    this.H.dispose(); this.E.dispose(); this.K.dispose(); motor.sahne.remove(this.grup); ortamSes(null);
    this.grup.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    motor.efekt = null;
  }

  // ---------- olaylar ----------
  olayGoster(id) {
    const o = OLAYLAR[id]; if (!o) { K.olay = null; kaydet(); return; }
    const k = KARAKTERLER[o.kim];
    const m = modal(`<div class="olay-kim"><div class="yuz" style="background:${k.renk}">${esc(k.ad.split(" ").pop()[0])}</div><div><span class="eyebrow">${esc(k.rol)}</span><h2 style="margin:2px 0">${esc(o.baslik)}</h2><span class="soluk">${esc(k.ad)}</span></div></div>
      <p style="font-size:17px;line-height:1.5">${esc(o.metin)}</p><div class="sec" style="display:grid;gap:8px"></div>`, {kapat: false});
    o.secenek.forEach(sc => {
      const yeterliMi = !sc.etki.kaynak || Object.entries(sc.etki.kaynak).every(([kk, v]) => v >= 0 || (K.kaynak[kk] || 0) >= -v);
      const b = el(`<button class="btn" ${yeterliMi ? "" : "disabled"} style="text-align:left">${esc(sc.ad)}</button>`);
      b.onclick = () => {
        const e = sc.etki; if (e.kaynak) ekle(e.kaynak); if (e.kaynak2) ekle(e.kaynak2);
        if (e.moral) { K.moralEk = (K.moralEk || 0) + e.moral; }
        K.olay = null; kaydet(); m.kapat(); this.ustCiz();
        if (e.mesaj) toast(e.mesaj, 4000);
        if (id === "final") toast("Tebrikler! Ana Sefer tamamlandı. Bölümleri Harita Masası'ndan yeniden oynayabilirsin.", 6000);
      };
      m.querySelector(".sec").appendChild(b);
    });
  }

  // ---------- paneller ----------
  panel(id) {
    kilitBirak();
    const f = {harita: this.pHarita, ordu: this.pOrdu, harp_okulu: this.pTek, kisla: this.pUretim, ahir: this.pUretim, tophane: this.pUretim, atolye: this.pUretim, hangar: this.pUretim, firin: this.pFirin, revir: this.pRevir}[id];
    if (f) f.call(this, id);
  }
  sonrakiBolum() { return BOLUMLER[Math.min(K.bolum, BOLUMLER.length - 1)]; }
  pHarita() {
    const tamam = K.bolum >= BOLUMLER.length;
    const b = this.sonrakiBolum();
    const secili = K.ordu.filter(r => r.secili && r.asker > 0);
    const m = modal(`<span class="eyebrow">Harita Masası · Telgrafçı Selim</span><h2>${tamam ? "Sefer tamamlandı" : `${K.bolum + 1}. bölüm: ${esc(b.ad)} (${b.yil})`}</h2>
      ${tamam ? `<p>Bütün bölümler kazanıldı. Dilediğin bölümü yeniden oynayabilirsin:</p>` : `<p style="font-size:17px">${esc(b.brifing)}</p>
      <p class="soluk">${esc(HARITALAR[b.harita].ad)} · ${esc(HAVALAR[b.hava].ad)} · ${esc(SAATLER[b.saat].ad)} · en fazla <b>${b.slot}</b> manga · ${b.dalgalar.length} saldırı dalgası bekleniyor</p>
      <p>Savaşa gidecek: <b>${secili.length}</b> manga ${secili.length > b.slot ? `<span class="cip uyari">ilk ${b.slot} gider</span>` : ""} · Ekmek: <b>${K.kaynak.ekmek}</b> ${K.kaynak.ekmek < Math.min(secili.length, b.slot) ? `<span class="cip kotu">yetersiz! Fırına uğra</span>` : ""}</p>`}
      <div class="tekrar" style="display:flex;gap:6px;flex-wrap:wrap"></div>
      <div class="alt"><button class="btn ordu">Karargâh: mangaları seç</button>${tamam ? "" : `<button class="btn ana git">Sefere çık ⚔</button>`}</div>`);
    if (tamam || K.bolum > 0) BOLUMLER.slice(0, Math.min(K.bolum, BOLUMLER.length)).forEach((x, i) => { const bb = el(`<button class="btn kucuk">${i + 1}. ${esc(x.ad)}</button>`); bb.onclick = () => { m.kapat(); this.sefereCik(x); }; m.querySelector(".tekrar").appendChild(bb); });
    if (!tamam && K.bolum > 0) m.querySelector(".tekrar").insertAdjacentHTML("afterbegin", `<span class="soluk" style="font-size:13px;align-self:center">Önceki bölümleri tekrar oyna:</span>`);
    m.querySelector(".ordu").onclick = () => { m.kapat(); this.pOrdu(); };
    m.querySelector(".git") && (m.querySelector(".git").onclick = () => { m.kapat(); this.sefereCik(b); });
  }
  sefereCik(b) {
    const gorev = {...b, bolumId: b.id, biz: "ardicova", dusman: b.dusman || "demirmark", dusmanAd: ULKELER[b.dusman || "demirmark"].ad};
    kilitBirak();
    gorevBaslat(gorev, {ordu: K.ordu, kalici: true, vazgec: () => kilitIste(), donus: () => { import("./kamp.js").then(m => { const k = new m.Kamp(false); motor.ekran(k); }); }});
  }
  pOrdu() {
    const b = this.sonrakiBolum();
    const ciz = () => {
      const s = K.ordu.filter(r => r.secili && r.asker > 0).length;
      m.querySelector(".govde").innerHTML = `<p>Savaşa gidecek mangaları işaretle (bu bölüm için en fazla <b>${b.slot}</b>; seçili: <b>${s}</b>). Takviye eksik askerleri tamamlar.</p>
        <table class="tablo"><tr><th></th><th>Manga</th><th>Tür</th><th>Asker</th><th>Revir</th><th>Tecrübe</th><th></th></tr>
        ${K.ordu.map((r, i) => { const d = birlikTanimi(r.tur); const eksik = r.boy - r.asker - (r.revir || 0); const bedel = Math.ceil((d.maliyet.altin || 0) / r.boy * eksik);
          return `<tr><td><input type="checkbox" data-i="${i}" ${r.secili ? "checked" : ""} ${r.asker <= 0 ? "disabled" : ""}></td><td><b>${esc(r.ad)}</b></td><td>${esc(d.ad)}</td><td>${r.asker}/${r.boy}</td><td>${r.revir || 0}</td><td>${"★".repeat(Math.min(5, Math.floor((r.tecrube || 0) / 2))) || "—"}</td>
          <td>${eksik > 0 ? `<button class="btn kucuk tk" data-i="${i}" ${K.kaynak.altin < bedel ? "disabled" : ""}>Takviye (${bedel} altın)</button>` : ""} <button class="btn kucuk dg" data-i="${i}">Dağıt</button></td></tr>`; }).join("")}</table>`;
      m.querySelectorAll("input[data-i]").forEach(c => c.onchange = () => { K.ordu[+c.dataset.i].secili = c.checked; kaydet(); ciz(); });
      m.querySelectorAll(".tk").forEach(c => c.onclick = () => { const r = K.ordu[+c.dataset.i]; const d = birlikTanimi(r.tur); const eksik = r.boy - r.asker - (r.revir || 0); const bedel = Math.ceil((d.maliyet.altin || 0) / r.boy * eksik); if (harca({altin: bedel})) { r.asker += eksik; kaydet(); ses("dogru"); ciz(); this.ustCiz(); } });
      m.querySelectorAll(".dg").forEach(c => c.onclick = async () => { const r = K.ordu[+c.dataset.i]; if (await onayla("Manga dağıtılsın mı?", `${esc(r.ad)} dağıtılacak; askerler köylerine döner.`)) { K.ordu.splice(+c.dataset.i, 1); kaydet(); this.pOrdu(); } });
    };
    const m = modal(`<span class="eyebrow">Karargâh · Yüzbaşı Demir</span><h2>Ordu</h2><div class="govde"></div><div class="alt"><button class="btn kpt">Kapat</button><button class="btn ana hrt">Harita Masası →</button></div>`, {sinif: ""});
    m.icerik.style.width = "min(900px,100%)";
    m.querySelector(".kpt").onclick = () => m.kapat(); m.querySelector(".hrt").onclick = () => { m.kapat(); this.pHarita(); };
    ciz();
  }
  pTek() {
    const yil = this.yil;
    const ciz = () => {
      const H = m.querySelector(".govde");
      H.innerHTML = `<p>Bir araştırma bir görev sürer. ${K.arastirma ? `Şu an: <b>${esc(TEK[K.arastirma.id].ad)}</b> (sonraki görevden sonra biter).` : "Şu an araştırma yok."} Çağının çok ilerisindeki teknolojiler kilitli kalır (şimdiki yıl ${yil}).</p>
        <div class="agac"><div></div>${CAGLAR.map((c, i) => `<div class="cag">${c}${i < CAGLAR.length - 1 ? "–" + (CAGLAR[i + 1] - 1) : "+"}</div>`).join("")}
        ${KOLLAR.map(k => `<div class="kol">${esc(k.ad)}</div>${CAGLAR.map((c, i) => `<div>${TEKNOLOJILER.filter(t => t.kol === k.id && t.yil >= c && (i === CAGLAR.length - 1 || t.yil < CAGLAR[i + 1])).map(t => {
          const acik = K.tek[t.id], ar = K.arastirma && K.arastirma.id === t.id, olur = tekArastirilabilir(t) && t.yil <= yil + 4;
          return `<button class="tek ${acik ? "acik" : ar ? "arast" : olur ? "" : "kilit"}" data-t="${t.id}"><b>${esc(t.ad)}</b><small>${t.yil} · ${acik ? "açık" : ar ? "araştırılıyor" : bedelMetin(t.maliyet, KAYNAK)}</small></button>`; }).join("")}</div>`).join("")}`).join("")}</div>
        <div class="detay aciklama" hidden></div>`;
      H.querySelectorAll(".tek").forEach(b => b.onclick = () => {
        const t = TEK[b.dataset.t]; const d = H.querySelector(".detay"); d.hidden = false;
        const onlar = t.on.map(o => `${TEK[o].ad}${K.tek[o] ? " ✓" : ""}`).join(", ");
        const olur = tekArastirilabilir(t) && t.yil <= yil + 4 && !K.arastirma;
        d.innerHTML = `<b>${esc(t.ad)}</b> (${t.yil}) — ${esc(t.aciklama)}<br><span class="soluk">Önkoşul: ${esc(onlar || "yok")} · Bedel: ${bedelMetin(t.maliyet, KAYNAK)}</span><br>
          ${K.tek[t.id] ? "<b>Açık.</b>" : `<button class="btn kucuk ana ars" ${olur && yeterli(t.maliyet) ? "" : "disabled"}>Araştır</button> ${K.arastirma ? "<span class='soluk'>Aynı anda tek araştırma yapılır.</span>" : t.yil > yil + 4 ? "<span class='soluk'>Bu teknoloji için henüz çok erken.</span>" : !yeterli(t.maliyet) ? "<span class='soluk'>Kaynak yetersiz.</span>" : ""}`}`;
        const ars = d.querySelector(".ars"); if (ars) ars.onclick = () => { if (harca(t.maliyet)) { K.arastirma = {id: t.id}; kaydet(); ses("dogru"); toast(`${t.ad} araştırması başladı; bir görev sonra hazır.`); this.ustCiz(); ciz(); } };
      });
    };
    const m = modal(`<span class="eyebrow">Harp Okulu</span><h2>Teknoloji ağacı</h2><div class="govde"></div><div class="alt"><button class="btn kpt">Kapat</button></div>`);
    m.icerik.style.width = "min(1100px,100%)"; m.querySelector(".kpt").onclick = () => m.kapat();
    ciz();
  }
  pUretim(bina) {
    const yil = this.yil;
    const kayitli = Object.entries(K.ozel || {}).filter(([, d]) => d.bina === bina).map(([id]) => id);
    const liste = [...Object.keys(BIRLIKLER).filter(id => BIRLIKLER[id].bina === bina && BIRLIKLER[id].sinif !== "deniz"), ...kayitli];
    const ciz = () => {
      const H = m.querySelector(".govde");
      H.innerHTML = `<div class="uretim">${liste.map(id => {
        const d = birlikTanimi(id); const ok = tekAcik(d.tek) && (d.yil || 0) <= yil + 2; const yet = yeterli(d.maliyet);
        return `<div class="urun"><b>${esc(d.ad)}</b><small>${esc(d.aciklama || "")}</small>
          <small>${d.boy} kişi · can ${d.can} · ${esc(SILAHLAR[d.silah]?.ad || "")}</small><span class="bedel">${bedelMetin(d.maliyet, KAYNAK)}</span>
          ${ok ? `<button class="btn kucuk ${yet ? "ana" : ""} ur" data-id="${id}" ${yet ? "" : "disabled"}>Üret</button>` : `<span class="soluk" style="font-size:12px">${d.tek && !tekAcik(d.tek) ? `Gerekli teknoloji: ${esc(TEK[d.tek]?.ad || d.tek)}` : `${d.yil} yılından sonra`}</span>`}</div>`; }).join("")}</div>`;
      H.querySelectorAll(".ur").forEach(b => b.onclick = () => { const d = birlikTanimi(b.dataset.id); if (harca(d.maliyet)) { const r = yeniManga(b.dataset.id); r.secili = K.ordu.filter(x => x.secili).length < this.sonrakiBolum().slot; K.ordu.push(r); kaydet(); ses("dogru"); toast(`${r.ad} (${d.ad}) orduya katıldı.`); this.ustCiz(); ciz(); } });
    };
    const kim = IST.find(s => s.id === bina)?.kim;
    const m = modal(`<span class="eyebrow">${esc(BINALAR[bina].ad)}${kim ? " · " + esc(KARAKTERLER[kim].ad) : ""}</span><h2>Üretim</h2><p class="soluk">${esc(BINALAR[bina].tanim)}</p><div class="govde"></div>
      <div class="alt">${bina === "kisla" || bina === "ahir" ? `<button class="btn tas">Kendi birliğini tasarla</button>` : ""}<button class="btn kpt">Kapat</button></div>`);
    m.icerik.style.width = "min(980px,100%)"; m.querySelector(".kpt").onclick = () => m.kapat();
    const t = m.querySelector(".tas"); if (t) t.onclick = () => { m.kapat(); this.pTasarim(); };
    ciz();
  }
  pTasarim() {
    const s = {temel: "piyade", silah: "agizdan_tufek", yakin: "sungu", ekipman: new Set(), egitim: new Set(), ad: "Benim Birliğim", renk: "#5a3a6a"};
    const hesap = () => {
      const T = TASARIM.temel.find(x => x.id === s.temel);
      const d = {ad: s.ad || "Özel birlik", sinif: T.sinif, boy: T.boy, can: T.can, hiz: T.hiz, kosu: T.kosu, gorus: T.gorus, silah: s.silah, yakin: s.yakin, moral: 1, ozel: {...(T.ozel || {})}, maliyet: {...T.maliyet}, bina: T.sinif === "suvari" ? "ahir" : "kisla", tek: null, yil: 1860, renk: s.renk, ozelTasarim: true, isabet: 1, dolum: 1, yakinHasar: 1};
      const ekleM = mm => { for (const [k, v] of Object.entries(mm || {})) d.maliyet[k] = (d.maliyet[k] || 0) + v; };
      ekleM(TASARIM.silah.find(x => x.id === s.silah)?.maliyet);
      for (const e of s.ekipman) { const x = TASARIM.ekipman.find(y => y.id === e); ekleM(x.maliyet); const et = x.etki; if (et.can) d.can += et.can; if (et.hiz) { d.hiz += et.hiz; d.kosu += et.hiz * 2; } if (et.gorus) d.gorus += et.gorus; if (et.ikinci) d.ikinci = et.ikinci; if (et.istihkam) d.ozel.istihkam = true; if (et.sancak) d.ozel.sancak = true; if (et.moral) d.moral += et.moral; }
      for (const e of s.egitim) { const x = TASARIM.egitim.find(y => y.id === e); ekleM(x.maliyet); const et = x.etki; if (et.dolum) d.dolum *= et.dolum; if (et.isabet) d.isabet *= et.isabet; if (et.yakinHasar) d.yakinHasar *= et.yakinHasar; if (et.moral) d.moral += et.moral; }
      d.aciklama = `Kendi tasarımın: ${SILAHLAR[d.silah].ad}${d.ikinci ? " + el bombası" : ""}${s.ekipman.size ? ", " + [...s.ekipman].map(e => TASARIM.ekipman.find(y => y.id === e).ad.toLowerCase()).join(", ") : ""}.`;
      return d;
    };
    const ciz = () => {
      const T = TASARIM.temel.find(x => x.id === s.temel);
      const d = hesap();
      const secKutu = (ad, liste, alan, coklu) => `<label>${ad}<div style="display:flex;gap:4px;flex-wrap:wrap">${liste.filter(x => !x.sadece || x.sadece === s.temel).map(x => { const acik = tekAcik(x.tek); const secili = coklu ? s[alan].has(x.id) : s[alan] === x.id; const adi = x.ad || SILAHLAR[x.id]?.ad || x.id; return `<button class="btn kucuk ${secili ? "ana" : ""}" data-a="${alan}" data-v="${x.id}" ${acik ? "" : "disabled"} title="${acik ? "" : "Teknoloji gerekli: " + esc(TEK[x.tek]?.ad || "")}">${esc(adi)}</button>`; }).join("")}</div></label>`;
      m.querySelector(".govde").innerHTML = `<div class="form" style="grid-template-columns:1fr"><label>Ad<input class="ad" value="${esc(s.ad)}" maxlength="28"></label>
        <label>Üniforma rengi<input type="color" class="renk" value="${s.renk}"></label>
        ${secKutu("Temel sınıf", TASARIM.temel, "temel")}${secKutu("Silah", TASARIM.silah, "silah")}${secKutu("Yakın dövüş", TASARIM.yakin.map(x => ({...x, ad: SILAHLAR[x.id].ad})), "yakin")}
        ${secKutu("Ekipman (çoklu)", TASARIM.ekipman, "ekipman", true)}${secKutu("Eğitim (çoklu)", TASARIM.egitim, "egitim", true)}</div>
        <div class="aciklama"><b>${esc(d.ad)}</b> · ${d.boy} kişi · can ${d.can} · hız ${d.hiz.toFixed(1)} · görüş ${d.gorus} m · isabet ×${d.isabet.toFixed(2)} · doldurma ×${d.dolum.toFixed(2)} · moral ×${d.moral.toFixed(2)}<br>
        Bedel: ${bedelMetin(d.maliyet, KAYNAK)}</div>`;
      m.querySelector(".ad").oninput = e => { s.ad = e.target.value; };
      m.querySelector(".renk").oninput = e => { s.renk = e.target.value; };
      m.querySelectorAll("[data-a]").forEach(b => b.onclick = () => {
        const a = b.dataset.a, v = b.dataset.v;
        if (a === "ekipman" || a === "egitim") { s[a].has(v) ? s[a].delete(v) : s[a].add(v); }
        else { s[a] = v; if (a === "temel") { s.silah = v === "ekip" ? "gatling" : v === "suvari" ? "karabina" : "agizdan_tufek"; s.yakin = v === "suvari" ? "kilic" : "sungu"; if (v === "ekip" && !tekAcik("gatling")) s.silah = "agizdan_tufek"; } }
        ciz();
      });
    };
    const m = modal(`<span class="eyebrow">Kışla · Çavuş Halit</span><h2>Kendi birliğini tasarla</h2><div class="govde"></div><div class="alt"><button class="btn kpt">Vazgeç</button><button class="btn ana kyd">Tasarımı kaydet</button></div>`);
    m.icerik.style.width = "min(820px,100%)";
    m.querySelector(".kpt").onclick = () => m.kapat();
    m.querySelector(".kyd").onclick = () => { const d = hesap(); const id = "ozel_" + Date.now().toString(36); K.ozel[id] = d; kaydet(); m.kapat(); toast(`“${d.ad}” tasarımı ${d.bina === "ahir" ? "Ahır" : "Kışla"} üretim listesine eklendi.`, 3500); this.pUretim(d.bina); };
    ciz();
  }
  pFirin() {
    const kap = () => 6 + (K.tek.firin2 ? 4 : 0) + (K.firin - 1) * 4;
    const ciz = () => {
      m.querySelector(".govde").innerHTML = `<p style="font-size:17px">“Teğmenim, aç asker savaşmaz. Her mangaya savaştan önce bir tayın ekmek gerekir; karda ve fırtınada daha fazlası.”</p>
        <table class="tablo"><tr><th>Ekmek</th><th>Un</th><th>Fırın kapasitesi</th><th>Ordu</th></tr><tr><td><b>${K.kaynak.ekmek}</b></td><td>${K.kaynak.un}</td><td>${kap()} / görev (seviye ${K.firin})</td><td>${K.ordu.length} manga</td></tr></table>
        <p class="soluk">Fırın her görevden dönüşte undan kendiliğinden ekmek pişirir. Hemen pişirmek istersen ek odun gerekir.</p>`;
      m.querySelector(".pis").disabled = K.kaynak.un <= 0 || K.kaynak.altin < 10 || K.pistiBu;
      m.querySelector(".un").disabled = K.kaynak.altin < 25;
      m.querySelector(".buy").disabled = K.firin >= 3 || !yeterli({altin: 80 * K.firin, demir: 30 * K.firin});
      m.querySelector(".buy").textContent = K.firin >= 3 ? "Fırın en büyük" : `Fırını büyüt (${80 * K.firin} altın, ${30 * K.firin} demir)`;
    };
    const m = modal(`<span class="eyebrow">Fırın · Aşçı Rıza Usta</span><h2>Ekmek moraldir</h2><div class="govde"></div>
      <div class="alt"><button class="btn un">Un al (25 altın → 10 un)</button><button class="btn pis">Hemen pişir (10 altın)</button><button class="btn buy"></button><button class="btn kpt">Kapat</button></div>`);
    m.querySelector(".kpt").onclick = () => m.kapat();
    m.querySelector(".un").onclick = () => { if (harca({altin: 25})) { ekle({un: 10}); ses("tik"); ciz(); this.ustCiz(); } };
    m.querySelector(".pis").onclick = () => { if (harca({altin: 10})) { const p = Math.min(K.kaynak.un, kap()); K.kaynak.un -= p; K.kaynak.ekmek += p; K.pistiBu = true; kaydet(); ses("dogru"); toast(`${p} ekmek pişti. Fırından mis gibi kokular yükseliyor.`); ciz(); this.ustCiz(); } };
    m.querySelector(".buy").onclick = () => { if (harca({altin: 80 * K.firin, demir: 30 * K.firin})) { K.firin++; kaydet(); ses("dogru"); ciz(); this.ustCiz(); } };
    ciz();
  }
  pRevir() {
    const yar = K.ordu.filter(r => r.revir > 0);
    const m = modal(`<span class="eyebrow">Revir · Sıhhiyeci Nermin</span><h2>Yaralılar</h2>
      ${yar.length ? `<table class="tablo"><tr><th>Manga</th><th>Revirde</th></tr>${yar.map(r => `<tr><td>${esc(r.ad)}</td><td>${r.revir} asker</td></tr>`).join("")}</table><p class="soluk">Revirdekiler bir sonraki görevden sonra mangalarına döner. Savaş sonrası yaralıları sahadan toplarsan hemen dönerler.</p>` : `<p>Revir boş. “Allah daha çok yaralı göstermesin, teğmenim.”</p>`}
      <div class="alt"><button class="btn uret">Sıhhiye ekibi yetiştir</button><button class="btn kpt">Kapat</button></div>`);
    m.querySelector(".kpt").onclick = () => m.kapat(); m.querySelector(".uret").onclick = () => { m.kapat(); this.pUretim("revir"); };
  }
}
