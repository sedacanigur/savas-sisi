// Savaş simülasyonu: mangalar, askerler, yapay zekâ, atış, yakın dövüş, topçu, makineli, araçlar,
// moral ve ekmek, savaş sisi, dalgalar, zafer/yenilgi.
import * as THREE from "three";
import {araziKur} from "../dunya/arazi.js";
import {havaKur} from "../dunya/hava.js";
import {efektKur} from "./efekt.js";
import {Kalabalik, AT_RENKLER} from "../modeller/kalabalik.js";
import * as N from "../modeller/nesneler.js";
import {SILAHLAR, silah} from "../veri/silahlar.js";
import {BIRLIKLER, donem} from "../veri/birlikler.js";
import {IKLIMLER, HAVALAR, SAATLER, HARITALAR} from "../veri/haritalar.js";
import {ULKELER, uniformaOf} from "../veri/ulkeler.js";
import {ses, borazan, ortamSes} from "../ses.js";
import {clamp, rng} from "../dunya/gurultu.js";

const R = Math.random;
const d2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;
const uzak = (a, b) => Math.sqrt(d2(a, b));
const aci = (dx, dz) => Math.atan2(dx, dz);
const aciFark = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
const MODEL = {tufek: "tufek", karabina: "karabina", keskin: "keskin", tabanca: "tabanca", hm: "hm", alev: "alev"};
let ID = 1;

export class Savas {
  constructor(motor, cfg) {
    this.motor = motor; this.cfg = cfg; const g = this.g = cfg.gorev; const sahne = motor.sahne;
    this.harita = HARITALAR[g.harita] || HARITALAR.tepe;
    this.iklim = IKLIMLER[g.iklim || this.harita.iklim];
    this.hava = HAVALAR[g.hava || "acik"]; this.saat = SAATLER[g.saat || "gunduz"];
    this.yil = g.yil || 1866; this.biz = g.biz || "ardicova"; this.dusman = g.dusman || "demirmark";
    const gr = cfg.grafik;
    this.seed = g.seed || ((Math.random() * 1e9) | 0);
    this.A = araziKur(sahne, {tip: this.harita.tip, iklim: this.iklim, seed: this.seed, seg: gr.arazi, agacSayisi: gr.agac});
    this.H = havaKur(sahne, {hava: this.hava, saat: this.saat, iklim: this.iklim});
    this.E = efektKur(sahne, gr.parcacik); this.E.gece = this.H.gece; this.E.ruzgar.copy(this.H.ruzgar);
    this.K = new Kalabalik(sahne, gr.asker + 40, Math.max(40, gr.asker >> 1));
    this.grup = new THREE.Group(); sahne.add(this.grup);
    this.askerler = []; this.mangalar = []; this.mermiler = []; this.araclar = []; this.sandallar = [];
    this.zaman = 0; this.bitti = false; this.sonuc = null; this.duraklat = false;
    this.ist = {dusen: 0, kayip: 0, yarali: 0, olumYer: [], bizOlumYer: [], dusmanManga: 0, kacan: 0};
    this.mesajlar = []; this.hedefIlerleme = 0; this.dalgaI = 0; this.sonDusmanT = 0;
    this.topcuHakki = cfg.topcuHakki || 0; this.fisek = this.H.gece ? 3 + (cfg.fisekEk || 0) : (cfg.fisekEk || 0);
    this.ruzgar = this.H.ruzgar;
    this.uniBiz = uniformaOf(this.biz, this.yil); this.uniDus = uniformaOf(this.dusman, this.yil);
    this.istihbarat = (cfg.istihbarat || []).map(z => ({...z, t: 999}));
    this.dalgalar = (g.dalgalar || []).slice().sort((a, b) => a.t - b.t);
    this.sonsuz = !!g.sonsuz; this.sonsuzSeviye = 0;
    // bizim sancak
    this.sancak = N.sancak(ULKELER[this.biz].bayrak, 7);
    const hy = this.A.yukseklik(this.A.hedef.x, this.A.hedef.z);
    this.sancak.position.set(this.A.hedef.x, hy, this.A.hedef.z); this.grup.add(this.sancak);
    // ölü mermi örnekleri
    this.mermiMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 6, 4), N.mat("#1e1e1e"), 96); this.mermiMesh.frustumCulled = false; this.mermiMesh.count = 0; this.grup.add(this.mermiMesh);
    // görünürlük
    this._gorT = 0; this._dusT = 0;
    this.gorusCarpan = this.hava.gorus * this.saat.gorus * 0.8;
    // bizim mangalar
    for (const m of cfg.mangalar || []) this.mangaKur(0, m.tanim, m.x, m.z, m.yon ?? Math.PI, {kayit: m.kayit, durum: m.durum});
    // komutan (oyuncunun 3. şahıs karakteri)
    const kx = this.A.hedef.x + 6, kz = this.A.hedef.z + 14;
    this.karargah = this.mangaKur(0, {...BIRLIKLER.sihhiyeci, ad: "Karargâh", boy: 1, silah: "tabanca", yakin: "kilic", can: 140, moral: 1.5, gorus: 220, sinif: "piyade", ozel: {komutan: true}}, kx, kz, Math.PI, {komutan: true});
    this.komutan = this.karargah.askerler[0]; this.komutan.komutan = true; this.komutan.model = "kilic"; this.komutan.canta = false;
    this.komutan.ceketC = new THREE.Color(ULKELER[this.biz].bayrak[0]).lerp(new THREE.Color("#111"), 0.3);
    // ortam
    ortamSes(this.hava.yagis === "yagmur" ? "yagmur" : this.hava.ruzgar >= 6 ? "ruzgar" : null);
    this.H.onSimsek = () => ses("boom", 400, 0.6);
  }

  // ---------------- kurulum ----------------
  mangaKur(taraf, tanim, x, z, yon, op = {}) {
    const uni = taraf === 0 ? this.uniBiz : this.uniDus;
    const ulke = ULKELER[taraf === 0 ? this.biz : this.dusman];
    const kayit = op.kayit, durum = op.durum || {};
    const boy = taraf === 0 && kayit ? Math.max(1, kayit.asker) : tanim.boy;
    const w = silah(tanim.silah);
    const m = {id: ID++, taraf, tanim, kayit, ad: kayit ? kayit.ad : tanim.ad, askerler: [], x, z, yon, hx: x, hz: z, baslangic: {x, z},
      emir: {tur: "tut"}, ai: "ilerle", aiT: 0, rota: null, rotaI: 0, kanat: op.kanat || "merkez",
      moral: 0, moralMax: 100, bozuk: false, bakim: durum.bakim ?? null, cephane: durum.cephane ?? 1, ekmek: durum.ekmek ?? true,
      tahkimat: false, sonKayip: -99, sonHucumSok: -99, atli: !!(tanim.ozel && tanim.ozel.atli), sinif: tanim.sinif, silah: w,
      hedefManga: null, gorunur: false, gorulduT: -99, sonGorulen: null, sancakli: !!(tanim.ozel && tanim.ozel.sancak), secili: false, komutan: !!op.komutan,
      kayipSayi: 0, baslangicBoy: boy, isi: 0, asiri: 0};
    // moral: ekmek ve hava
    const ekmekMax = m.ekmek ? 100 : (this.cfg.konserve ? 75 : 60);
    m.moralMax = ekmekMax; m.moral = clamp((m.ekmek ? 82 : 52) * (tanim.moral || 1) + this.hava.moral + (durum.moralEk || 0), 25, 100);
    if (taraf === 1) { m.moralMax = 100; m.moral = Math.min(100, 88 * (tanim.moral || 1) + this.hava.moral * 0.5); }
    // top / makineli / balon / araç nesnesi
    if (tanim.ozel && tanim.ozel.top) {
      const tur = w.model === "obus" ? "obus" : w.model === "havan" ? "havan" : "top";
      m.top = {obj: N.top(tur, taraf === 0 ? "#3b3f45" : "#2f2f2f"), dolum: 3 + R() * 4, hedef: null, x, z, yon, kurulu: !m.atli && !(tanim.ozel.atli)};
      m.top.obj.position.set(x, this.A.yukseklik(x, z), z); m.top.obj.rotation.y = yon; this.grup.add(m.top.obj);
    }
    if (tanim.sinif === "makineli") {
      m.mg = {obj: N.makineli(w.model === "gatling" ? "gatling" : "maxim"), x, z, yon, sarjor: w.sarjor, dolum: 0, aralik: 0};
      m.mg.obj.position.set(x, this.A.yukseklik(x, z), z); m.mg.obj.rotation.y = yon; this.grup.add(m.mg.obj);
    }
    const aracTur = tanim.ozel && (tanim.ozel.arac || (tanim.ozel.balon ? "balon" : null));
    // askerler
    const sapka = this.sapkaOf(tanim, uni);
    const ceketC = new THREE.Color(tanim.renk || uni.ceket), panC = new THREE.Color(uni.pantolon), sapkaC = new THREE.Color(tanim.ozel && tanim.ozel.zirh && tanim.sinif === "suvari" ? "#9aa0a6" : uni.sapkaRenk);
    if (taraf === 1 && m.atli) ceketC.offsetHSL(0, 0, 0.05);
    const tenler = ["#d9a77f", "#c99572", "#e1b48e", "#b98563", "#a6714f"];
    const adet = aracTur ? 1 : boy;
    for (let i = 0; i < adet; i++) {
      const a = {id: ID++, taraf, manga: m, x: x + (R() - 0.5) * 4, z: z + (R() - 0.5) * 4, y: 0, yon, vx: 0, vz: 0, can: tanim.can, maxCan: tanim.can,
        durum: "dur", poz: "dur", t: R() * 10, hiz: 0, nisan: 0, olum: 0, yon2: R(), olu: false, olumT: 0, dolum: R() * 2, sarjor: w.sarjor,
        mermi: Math.round((tanim.sinif === "topcu" ? 999 : 60) * m.cephane), tutuk: 0, nisanT: 0, hedef: null, hedefT: R(), yakinT: 0, atisT: -99, kazT: 0,
        slot: i, model: this.modelOf(tanim, w, i), canta: tanim.sinif === "piyade" && !(tanim.ozel && (tanim.ozel.komutan || tanim.ozel.sancak) && i === 0),
        ceketC, pantolonC: panC, sapka, sapkaC, tenC: new THREE.Color(tenler[(R() * tenler.length) | 0]), at: null, atli: false, bombaT: 15 + R() * 20, ilkDarbe: true, sapan: 0,
        yarali: false, oyuncu: false};
      if (tanim.ozel && tanim.ozel.sancak && i === 0) a.model = "sancak";
      if (m.atli || (tanim.ozel && tanim.ozel.motor && tanim.sinif === "suvari")) {
        a.atli = true; a.at = {tur: tanim.ozel.deve ? "deve" : tanim.ozel.motor ? "motor" : "at", renk: tanim.ozel.deve ? "#c2a372" : AT_RENKLER[(R() * AT_RENKLER.length) | 0], hiz: 0, t: R() * 5, olum: 0};
        a.can += 40; a.maxCan = a.can;
      }
      if (aracTur) this.aracKur(a, aracTur, taraf);
      if (m.top && i > 0) a.model = null;
      if (m.mg) a.model = null;
      m.askerler.push(a); this.askerler.push(a);
    }
    this.mangalar.push(m);
    if (taraf === 0 && kayit) Object.defineProperty(kayit, "_m", {value: m, enumerable: false, configurable: true, writable: true});
    this.formasyon(m, true);
    return m;
  }
  sapkaOf(tanim, uni) {
    if (tanim.ozel && tanim.ozel.zirh && tanim.sinif === "suvari") return "kask";
    if (tanim.id === "akinci" || tanim.id === "mizrakli") return uni.sapka === "kask" ? "kask" : "kalpak";
    if (tanim.ozel && tanim.ozel.deve) return "sapka";
    return uni.sapka;
  }
  modelOf(tanim, w, i) {
    if (tanim.ozel && tanim.ozel.komutan) return "kilic";
    if (tanim.yakin === "mizrak" && tanim.sinif === "suvari") return "mizrak";
    if (tanim.sinif === "suvari" && tanim.yakin === "kilic" && !(tanim.ozel && tanim.ozel.inip_savasir)) return i % 3 === 0 ? "karabina" : "kilic";
    return MODEL[w.model] || (w.tur === "tabanca" ? "tabanca" : "tufek");
  }
  aracKur(a, tur, taraf) {
    let obj;
    if (tur === "balon") obj = N.balon(); else if (tur === "ucak") obj = N.ucak(taraf === 0 ? "#8a7a52" : "#5f6a6f", taraf === 0 ? "#1f5a4a" : "#2d2f36");
    else if (tur === "zeplin") obj = N.zeplin(); else if (tur === "tank") obj = N.tank(taraf === 0 ? "#6a6a4a" : "#56574e"); else obj = N.zirhliAraba(taraf === 0 ? "#5f6a4a" : "#4d5048");
    a.arac = obj; a.aracTur = tur; this.grup.add(obj); this.araclar.push(a);
    a.zirh = tur === "tank" ? 2 : tur === "zirhli" ? 1 : 0;
    a.ucusAci = R() * 6; a.ucusR = 140 + R() * 60;
  }
  // manga dizilişi: askerlerin yuva noktaları
  formasyon(m, isinla) {
    const n = m.askerler.length; if (!n) return;
    const sira = m.atli ? Math.min(6, n) : m.sinif === "topcu" || m.sinif === "makineli" ? n : Math.min(n, Math.max(4, Math.ceil(n / 2)));
    const ara = m.atli ? 2.6 : m.sinif === "topcu" ? 1.6 : (m.taraf === 1 && m.ai === "ilerle" ? 1.4 : 1.6);
    const sx = Math.cos(m.yon), sz = -Math.sin(m.yon), ix = Math.sin(m.yon), iz = Math.cos(m.yon);
    let k = 0;
    for (const a of m.askerler) {
      if (a.olu) continue;
      let ox, oz;
      if (m.top) { const yer = [[0, -1.8], [-1.3, -0.4], [1.3, -0.4], [-0.8, -2.8], [0.8, -2.8]][k % 5]; ox = yer[0]; oz = yer[1]; }
      else if (m.mg) { const yer = [[0, -0.9], [-0.9, -0.6], [0.9, -1.4]][k % 3]; ox = yer[0]; oz = yer[1]; }
      else { const c = k % sira, s = Math.floor(k / sira); ox = (c - (sira - 1) / 2) * ara + (s % 2) * 0.4; oz = -s * (m.atli ? 3.2 : 1.6); }
      a.yx = m.x + sx * ox + ix * oz; a.yz = m.z + sz * ox + iz * oz;
      if (isinla) { a.x = a.yx; a.z = a.yz; a.y = this.A.yuzey(a.x, a.z); a.yon = m.yon; }
      k++;
    }
  }

  // Aşama 1/2: yerleştirme, durum ve tahkimat
  yerlestir(m, x, z, yon = m.yon) {
    m.x = x; m.z = z; m.yon = yon; m.baslangic = {x, z}; m.git = null;
    this.formasyon(m, true);
    if (m.top) { m.top.x = x; m.top.z = z; m.top.obj.position.set(x, this.A.yukseklik(x, z), z); m.top.obj.rotation.y = yon; }
    if (m.mg) { m.mg.x = x; m.mg.z = z; m.mg.obj.position.set(x, this.A.yukseklik(x, z), z); m.mg.obj.rotation.y = yon; }
    for (const a of m.askerler) if (a.arac) { a.x = x; a.z = z; a.y = this.A.yuzey(x, z); a.yon = yon; if (a.aracTur === "balon") a.y += 55; this.aracCiz(a, 0); }
    if (m.torba) { m.torba.position.set(x + Math.sin(yon) * 2.5, this.A.yukseklik(x, z), z + Math.cos(yon) * 2.5); m.torba.rotation.y = yon; }
  }
  durumUygula(m, durum) {
    Object.assign(m, {bakim: durum.bakim ?? m.bakim, cephane: durum.cephane ?? m.cephane, ekmek: durum.ekmek ?? m.ekmek});
    m.moralMax = m.ekmek ? 100 : (this.cfg.konserve ? 75 : 60);
    m.moral = clamp((m.ekmek ? 82 : 52) * (m.tanim.moral || 1) + this.hava.moral + (durum.moralEk || 0), 25, m.moralMax);
    for (const a of m.askerler) a.mermi = Math.round((m.tanim.sinif === "topcu" ? 999 : 60) * m.cephane);
  }
  tahkimEt(m) {
    if (m.tahkimat) return false;
    m.tahkimat = true;
    const boy = m.askerler.length;
    m.torba = N.kumTorbasi(Math.max(6, boy * 1.3), 2); this.grup.add(m.torba);
    this.yerlestir(m, m.x, m.z, m.yon);
    return true;
  }
  tahkimatKapak() { for (const m of this.mangalar) if (m.taraf === 0 && m.tahkimat) this.A.kapakEkle(m.x, m.z, Math.max(5, m.askerler.length * 0.8), 0.5); }

  // ---------------- dalgalar ----------------
  turCoz(tur) {
    if (BIRLIKLER[tur]) return tur;
    const d = donem(this.yil);
    switch (tur) {
      case "piyade": return d.piyade; case "hafif": return d.hafif; case "suvari": return d.suvari[(R() * d.suvari.length) | 0];
      case "top": return d.top; case "mg": return d.mg || d.piyade; case "agir": return d.agir || d.top; case "arac": return d.arac || (this.yil >= 1912 ? "zirhli_araba" : d.suvari[0]);
    }
    return d.piyade;
  }
  dalgaCikar(dl) {
    const tur = this.turCoz(dl.tur), tanim = {...BIRLIKLER[tur], id: tur};
    const G = (this.A.cikarma && dl.cikarma) ? this.A.cikarma[dl.kanat] : this.A.giris[dl.kanat] || this.A.giris.merkez;
    for (let i = 0; i < dl.adet; i++) {
      const ofs = (i - (dl.adet - 1) / 2) * (tanim.atli || tanim.sinif === "suvari" ? 30 : 24) + (R() - 0.5) * 8;
      let x = G.x + ofs, z = G.z - R() * 15;
      if (this.harita.tip === "gecit") x = G.x + ofs * 0.4;
      const m = this.mangaKur(1, tanim, x, z, 0, {kanat: dl.kanat});
      m.rota = (this.A.rotalar[dl.kanat] || this.A.rotalar.merkez).map(p => ({x: p.x + ofs * (1 - p.z / 300) * 0.5, z: p.z}));
      m.rotaI = 1; m.ai = "ilerle"; m.yon = 0;
      if (dl.cikarma && this.A.cikarma) this.sandalaBindir(m, x, G.z);
      this.ist.dusmanManga++;
    }
    const kanatAd = {sol: "sol kanatta", sag: "sağ kanatta", merkez: "merkezde"}[dl.kanat] || "";
    const turAd = BIRLIKLER[tur].ad;
    this.mesaj(`Gözcü: ${dl.adet} ${turAd} ${kanatAd}!`, "uyari");
  }
  sandalaBindir(m, x, plajZ) {
    const s = N.sandal(); const sz = -255; s.position.set(x, 0, sz); s.rotation.y = 0; this.grup.add(s);
    const sd = {obj: s, x, z: sz, hedefZ: plajZ - 5, m, vardi: false};
    m.sandal = sd; m.ai = "sandal"; this.sandallar.push(sd);
    m.askerler.forEach((a, i) => { a.x = x + ((i % 2) - 0.5) * 0.9; a.z = sz + (Math.floor(i / 2) - 2.5) * 0.9; a.durum = "sandal"; });
  }
  sonsuzDalga() {
    const L = ++this.sonsuzSeviye; const kanat = ["sol", "merkez", "sag"][(R() * 3) | 0];
    const tur = L % 5 === 0 ? "top" : L % 4 === 0 ? "suvari" : L % 7 === 0 ? "mg" : R() < 0.3 ? "hafif" : "piyade";
    this.dalgaCikar({tur, adet: 1 + Math.floor(L / 3), kanat});
    if (L % 6 === 0 && this.yil >= 1915) this.dalgaCikar({tur: "arac", adet: 1, kanat: "merkez"});
  }

  mesaj(t, tur = "bilgi") { this.mesajlar.unshift({t, tur, z: this.zaman}); this.mesajlar.length = Math.min(this.mesajlar.length, 7); this.motor.onMesaj && this.motor.onMesaj(t, tur); }

  // ---------------- ana döngü ----------------
  guncelle(dt) {
    if (this.duraklat) { this.ciz(); return; }
    dt = Math.min(dt, 0.05);
    this.zaman += dt;
    // dalgalar
    if (this.sonsuz) { if (this.zaman > 4 + this.sonsuzSeviye * 38) this.sonsuzDalga(); }
    else while (this.dalgaI < this.dalgalar.length && this.zaman >= this.dalgalar[this.dalgaI].t) this.dalgaCikar(this.dalgalar[this.dalgaI++]);
    // sandallar
    for (const s of this.sandallar) if (!s.vardi) {
      s.z += 6 * dt; s.obj.position.set(s.x, Math.sin(this.zaman * 2 + s.x) * 0.15 - 0.15, s.z); s.obj.rotation.z = Math.sin(this.zaman * 1.5 + s.x) * 0.04;
      s.m.askerler.forEach((a, i) => { a.x = s.x + ((i % 2) - 0.5) * 0.9; a.z = s.z + (Math.floor(i / 2) - 2) * 0.9; a.y = 0.3; a.poz = "otur"; a.yon = 0; });
      if (s.z >= s.hedefZ) { s.vardi = true; s.m.ai = "ilerle"; s.m.x = s.x; s.m.z = s.z + 6; s.m.askerler.forEach(a => { a.durum = "dur"; }); this.formasyon(s.m, false); }
    }
    // görünürlük ve sis
    this._gorT -= dt; if (this._gorT <= 0) { this._gorT = 0.3; this.gorunurluk(); }
    // mangalar
    for (const m of this.mangalar) this.mangaGuncelle(m, dt);
    // askerler
    for (const a of this.askerler) this.askerGuncelle(a, dt);
    // mermiler
    this.mermiGuncelle(dt);
    // ölüleri temizle
    this._temizT = (this._temizT || 0) - dt;
    if (this._temizT <= 0) { this._temizT = 2; this.temizle(); }
    // hedef bölgesi
    this.hedefKontrol(dt);
    this.E.guncelle(dt);
    this.sancak.userData.dalga(this.zaman, this.hava.ruzgar);
    this.H.guncelle(dt, this.motor.kamera, this.motor.odak);
    this.ciz();
  }

  ciz() {
    // Kalabalık listesi (görünür askerler)
    const L = this._liste || (this._liste = []); L.length = 0;
    const kam = this.motor.kamera.position, gizle = this.motor.birinciSahis ? this.oyuncuAsker : null;
    for (const a of this.askerler) {
      if (a.arac || a === gizle || a.durum === "gizli") continue;
      if (a.taraf === 1 && !a.gorunur && !a.olu && !this.bitti && !window.__hepsi) continue;
      if (a.olu && a.olumT > 30) continue;
      a.solgun = a.olu ? Math.min(0.6, a.olumT / 30) : 0;
      a.uzk = (a.x - kam.x) ** 2 + (a.z - kam.z) ** 2;
      L.push(a);
    }
    if (L.length > this.K.kap) L.sort((p, q) => p.uzk - q.uzk);
    this.K.ciz(L);
    // araç nesneleri görünürlüğü
    for (const a of this.araclar) a.arac.visible = a.taraf === 0 || a.gorunur || a.olu || this.bitti || !!window.__hepsi;
    for (const m of this.mangalar) { if (m.taraf === 1) { const v = m.askerler.some(a => a.gorunur) || this.bitti; if (m.top) m.top.obj.visible = v; if (m.mg) m.mg.obj.visible = v; } }
    // top mermileri
    let c = 0; const M = new THREE.Matrix4();
    for (const b of this.mermiler) if (b.gor && c < 96) { M.makeTranslation(b.x, b.y, b.z); this.mermiMesh.setMatrixAt(c++, M); }
    this.mermiMesh.count = c; this.mermiMesh.instanceMatrix.needsUpdate = true;
  }

  // ---------------- görünürlük / savaş sisi ----------------
  gozlemciler(taraf) {
    const L = [];
    for (const m of this.mangalar) {
      if (m.taraf !== taraf) continue;
      const canli = m.askerler.filter(a => !a.olu); if (!canli.length) continue;
      let r = m.tanim.gorus * this.gorusCarpan;
      for (const a of canli) if (a.arac && (a.aracTur === "balon" || a.aracTur === "ucak" || a.aracTur === "zeplin")) r = m.tanim.gorus * Math.max(0.6, this.hava.gorus);
      // ortalama konum + birkaç asker
      L.push({x: m.x, z: m.z, r});
      for (let i = 0; i < canli.length; i += 3) L.push({x: canli[i].x, z: canli[i].z, r: r * 0.85});
    }
    if (taraf === 0 && this.oyuncuAsker && !this.oyuncuAsker.olu) L.push({x: this.oyuncuAsker.x, z: this.oyuncuAsker.z, r: 190 * this.gorusCarpan + 30});
    return L;
  }
  gorunurluk() {
    for (const taraf of [0, 1]) {
      const G = this.gozlemciler(taraf), karsi = 1 - taraf;
      for (const a of this.askerler) {
        if (a.taraf !== karsi) continue;
        if (a.olu) { a.gorunur = a.gorunur && a.olumT < 3; continue; }
        if (a.durum === "sandal") { a.gorunur = taraf === 1 || uzak(a, this.A.hedef) < 300 * this.gorusCarpan; continue; }
        const kap = a.arac ? 0 : this.A.kapak(a.x, a.z);
        let k = 1 - kap * 0.45; if (this.zaman - a.atisT < 3 && a.manga.silah.duman > 0.3) k *= 1.6; if (a.atli) k *= 1.25; if (a.arac) k *= 1.6;
        if (this.H.gece) k *= 1 + this.H.fisekAydinlik(a.x, a.z) * 1.6;
        let gor = false;
        for (const o of G) { const r = o.r * k; if ((a.x - o.x) ** 2 + (a.z - o.z) ** 2 < r * r) { gor = true; break; } }
        if (!gor && taraf === 0) for (const z of this.istihbarat) if (z.t > 0 && (a.x - z.x) ** 2 + (a.z - z.z) ** 2 < z.r * z.r) { gor = true; break; }
        if (taraf === 0) a.gorunur = gor; else a.bize = gor; // a.bize: düşman bu bizim askeri görüyor mu
        if (gor) a.manga.gorulduT = this.zaman;
      }
    }
    // sis dokusu (bizim görüş)
    const S = this.A.sis, n = S.boy, boy = this.A.S, G = this.gozlemciler(0);
    for (const z of this.istihbarat) if (z.t > 0) G.push(z);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = (i + 0.5) / n * boy - boy / 2, z = (j + 0.5) / n * boy - boy / 2;
      let v = 0;
      for (const o of G) { const d = Math.sqrt((x - o.x) ** 2 + (z - o.z) ** 2); const k = clamp((o.r - d) / 25 + 0.5, 0, 1); if (k > v) { v = k; if (v >= 1) break; } }
      const eski = S.veri[j * n + i]; const hedef = Math.max(v * 255, Math.min(eski, 60));
      S.veri[j * n + i] = Math.round(eski + (hedef - eski) * 0.5);
    }
    S.tex.needsUpdate = true;
  }
  gorulebilir(gozcu, hedef) { return gozcu.taraf === 0 ? hedef.gorunur || hedef.taraf === 0 : hedef.bize || hedef.taraf === 1; }

  // ---------------- manga yapay zekâsı ----------------
  canlilar(m) { return m.askerler.filter(a => !a.olu); }
  mangaGuncelle(m, dt) {
    const canli = this.canlilar(m);
    if (!canli.length) { if (!m.yokOldu) { m.yokOldu = true; if (m.taraf === 0 && !m.komutan) this.mesaj(`${m.ad} yok oldu.`, "kotu"); } return; }
    // merkez: canlı askerlerin ortalaması (araç/top için kendi konumu)
    m.cx = canli.reduce((s, a) => s + a.x, 0) / canli.length; m.cz = canli.reduce((s, a) => s + a.z, 0) / canli.length;
    // moral
    const yakinKomutan = this.komutan && !this.komutan.olu && m.taraf === 0 && (this.komutan.x - m.cx) ** 2 + (this.komutan.z - m.cz) ** 2 < 35 * 35;
    m.komutanYakin = yakinKomutan;
    if (this.zaman - m.sonKayip > 6) m.moral = Math.min(m.moralMax, m.moral + dt * (0.8 + (yakinKomutan ? 1.2 : 0) + (m.bozuk ? 1.5 : 0)));
    if (!m.bozuk && m.moral < 20 && !m.tanim.ozel?.komutan && !m.top && !(m.tanim.sinif === "arac" || m.tanim.sinif === "hava" || m.tanim.sinif === "destek")) {
      m.bozuk = true; m.emir = {tur: "kac"}; m.ai = "kac";
      this.mesaj(m.taraf === 0 ? `${m.ad} bozuldu, geri kaçıyor!` : `Düşman ${m.tanim.ad} bozuldu!`, m.taraf === 0 ? "kotu" : "iyi");
      // çevredeki dostların morali
      for (const o of this.mangalar) if (o !== m && o.taraf === m.taraf && (o.cx - m.cx) ** 2 + (o.cz - m.cz) ** 2 < 50 * 50) o.moral -= 6;
    }
    if (m.bozuk && m.moral > 48) {
      const dusmanYakin = this.mangalar.some(o => o.taraf !== m.taraf && o.cx !== undefined && !o.bozuk && (o.cx - m.cx) ** 2 + (o.cz - m.cz) ** 2 < 60 * 60 && this.canlilar(o).length);
      if (!dusmanYakin) { m.bozuk = false; m.emir = {tur: "tut"}; m.ai = "ilerle"; m.x = m.cx; m.z = m.cz; this.mesaj(m.taraf === 0 ? `${m.ad} toparlandı.` : `Düşman ${m.tanim.ad} yeniden toplandı.`, m.taraf === 0 ? "iyi" : "uyari"); if (m.taraf === 0) borazan("toplan"); }
    }
    // hedef manga seçimi (en yakın görünür düşman manga)
    m.hedefT = (m.hedefT || 0) - dt;
    if (m.hedefT <= 0) {
      m.hedefT = 0.8 + R() * 0.4;
      let en = null, ed = 1e12;
      for (const o of this.mangalar) {
        if (o.taraf === m.taraf || o.cx === undefined) continue;
        const cl = o.askerler.filter(a => !a.olu && this.gorulebilir(m.askerler[0], a) && a.durum !== "sandal");
        if (!cl.length) continue;
        const dd = (o.cx - m.cx) ** 2 + (o.cz - m.cz) ** 2;
        if (o.tanim.sinif === "hava" && !m.silah.havaya) continue;
        if (dd < ed) { ed = dd; en = o; }
      }
      m.hedefManga = en; m.hedefMes = Math.sqrt(ed);
    }
    if (m.taraf === 1) this.dusmanAI(m, dt); else this.bizimAI(m, dt);
    // hareket: manga noktası hedefe yürür
    if (m.git) {
      const dx = m.git.x - m.x, dz = m.git.z - m.z, d = Math.hypot(dx, dz);
      const hz = this.mangaHiz(m) * (m.kos ? 1 : 1);
      if (d > 0.5) {
        const st = Math.min(d, hz * dt);
        let nx = m.x + dx / d * st, nz = m.z + dz / d * st;
        if (this.A.derinSu(nx, nz) && !this.A.derinSu(m.x, m.z) && !m.tanim.ozel?.yuzer) { nx = m.x; nz = m.z; m.git = null; }
        m.x = nx; m.z = nz; m.yon = aci(dx, dz); m.hareket = true;
      } else { m.git = null; m.hareket = false; }
      this.formasyon(m, false);
    } else m.hareket = false;
    // sıhhiye ve ikmal
    if (m.tanim.ozel && (m.tanim.ozel.sihhiye || m.tanim.ozel.ikmal)) {
      m.destekT = (m.destekT || 0) - dt;
      if (m.destekT <= 0) {
        m.destekT = 7;
        if (m.tanim.ozel.sihhiye) {
          const y = this.askerler.find(a => a.olu && a.yarali && a.taraf === m.taraf && !a.kalkti && a.olumT < 28 && (a.x - m.cx) ** 2 + (a.z - m.cz) ** 2 < 30 * 30);
          if (y) { y.olu = false; y.kalkti = true; y.can = y.maxCan * 0.4; y.olum = 0; y.olumT = 0; y.yarali = false; y.manga.kayipSayi--; this.ist.yarali--; this.ist.kayip--; y.manga.moral += 4;
            const i = this.ist.bizOlumYer.findIndex(p => Math.abs(p.x - y.x) < 0.01 && Math.abs(p.z - y.z) < 0.01); if (i >= 0) this.ist.bizOlumYer.splice(i, 1);
            if (R() < 0.5) this.mesaj(`Sıhhiyeciler bir yaralıyı ayağa kaldırdı.`, "iyi"); }
        }
        if (m.tanim.ozel.ikmal) for (const o of this.mangalar) if (o.taraf === m.taraf && o.cx !== undefined && (o.cx - m.cx) ** 2 + (o.cz - m.cz) ** 2 < 35 * 35) for (const a of o.askerler) if (!a.olu) a.mermi = Math.max(a.mermi, 40);
      }
    }
    // top ve makineli nesneleri
    if (m.top) this.topGuncelle(m, dt, canli);
    if (m.mg) this.mgGuncelle(m, dt, canli);
  }
  mangaHiz(m) {
    const t = m.tanim; let h = m.kos ? t.kosu : t.hiz;
    let k = this.hava.hiz; if (this.hava.camur && (m.atli || m.top)) k *= 0.8;
    if (this.iklim.sicaklik === 2 && m.atli && !t.ozel?.deve) k *= 0.85;
    if (m.taraf === 1 && m.ai === "ilerle") h *= 1.0;
    if (m.top && !m.atli) h = Math.min(h, 1.3);
    const yer = this.A.suda(m.x, m.z) ? 0.5 : 1;
    return h * k * yer;
  }
  emirVer(m, emir) {
    if (!m || m.taraf !== 0 || m.yokOldu) return;
    if (m.bozuk) { this.mesaj(`${m.ad} bozuk, emir dinlemiyor!`, "kotu"); return; }
    m.emir = emir; m.git = null; m.kos = false;
    if (emir.tur === "git") { m.git = {x: emir.x, z: emir.z}; m.kos = !!emir.kos; if (m.top) m.top.kurulu = false; }
    if (emir.tur === "geri") { m.git = {...m.baslangic}; m.kos = true; }
    if (emir.tur === "hucum") { m.kos = true; m.hucumT = 0; borazan("hucum"); }
    if (emir.tur === "tut") { m.x = m.cx ?? m.x; m.z = m.cz ?? m.z; this.formasyon(m, false); }
  }
  bizimAI(m, dt) {
    if (m.komutan) return;
    const e = m.emir;
    if (m.bozuk) { // geri kaç
      m.git = {x: m.cx + (R() - 0.5) * 10, z: Math.min(this.A.S / 2 - 10, m.cz + 30)}; m.kos = true; return;
    }
    if (e.tur === "git" && !m.git) { m.emir = {tur: "tut"}; if (m.top) m.top.kurulu = true; }
    if (e.tur === "geri" && !m.git) m.emir = {tur: "tut"};
    if (e.tur === "hucum") {
      m.hucumT += dt;
      if (!m.hedefManga || m.hucumT > 40) { m.emir = {tur: "tut"}; m.x = m.cx; m.z = m.cz; m.kos = false; this.formasyon(m, false); }
    }
    // süvari kendiliğinden: yakına gelen düşmana (topçu ya da bozuk) hücum
    if (m.atli && e.tur === "tut" && m.hedefManga && m.hedefMes < 90 && !m.tanim.ozel?.inip_savasir && (m.hedefManga.top || m.hedefManga.bozuk || m.hedefManga.mg || m.hedefMes < 45)) {
      m.emir = {tur: "hucum"}; m.kos = true; m.hucumT = 0; this.mesaj(`${m.ad} hücuma kalktı!`, "iyi"); ses("at", 40);
    }
    // ejder: hareket ederken atlı, dururken iner
    if (m.tanim.ozel?.inip_savasir) {
      const atta = m.hareket || e.tur === "hucum";
      for (const a of m.askerler) if (a.at && !a.olu && !a.arac) a.atli = atta;
    }
    // keşif uçağı
    for (const a of m.askerler) if (a.arac && a.aracTur !== "balon") this.ucusGuncelle(a, dt, 0);
  }
  dusmanAI(m, dt) {
    m.aiT += dt;
    if (m.ai === "sandal") return;
    if (m.ai === "kac") { m.git = {x: m.cx, z: -this.A.S / 2 - 30}; m.kos = true; return; }
    const H = m.hedefManga, mes = m.hedefMes || 1e9, menzil = m.silah.menzil;
    const sonraki = () => { if (!m.rota) return; const p = m.rota[Math.min(m.rotaI, m.rota.length - 1)]; m.git = {x: p.x, z: p.z}; if (Math.hypot(p.x - m.x, p.z - m.z) < 6 && m.rotaI < m.rota.length - 1) m.rotaI++; };
    const sinif = m.tanim.sinif;
    for (const a of m.askerler) if (a.arac && a.aracTur !== "balon" && (a.aracTur === "ucak" || a.aracTur === "zeplin")) { this.ucusGuncelle(a, dt, 1); return; }
    if (m.top || sinif === "makineli") {
      // kurulacak yer: hedefe göre menzilin ~%55'i
      const hd = Math.hypot(this.A.hedef.x - m.x, this.A.hedef.z - m.z);
      const kurMes = Math.min(menzil * 0.55, sinif === "makineli" ? 230 : 420);
      if (m.ai === "ilerle") { if (hd > kurMes && !(H && mes < menzil * 0.6)) { sonraki(); m.kos = false; } else { m.ai = "kur"; m.git = null; m.aiT = 0; if (m.top) m.top.kurulu = true; m.yon = aci(this.A.hedef.x - m.x, this.A.hedef.z - m.z); this.formasyon(m, false); } }
      return;
    }
    if (sinif === "suvari") {
      if (m.ai === "hucum") {
        m.kos = true;
        if (!H || m.aiT > 26 || (m.kayipSayi / m.baslangicBoy > 0.5)) { m.ai = "toparlan"; m.aiT = 0; m.kos = true; m.git = {x: m.cx + (R() - 0.5) * 60, z: m.cz - 90}; }
        return;
      }
      if (m.ai === "toparlan") { if (!m.git || m.aiT > 14) { m.ai = "ilerle"; m.aiT = 0; } return; }
      if (H && mes < 150 && !m.tanim.ozel?.inip_savasir) { m.ai = "hucum"; m.aiT = 0; m.kos = true; ses("at", 60); this.mesaj("Düşman süvarisi hücuma kalktı!", "uyari"); return; }
      if (m.tanim.ozel?.inip_savasir && H && mes < menzil * 0.8) { m.ai = "ates"; m.aiT = 0; m.git = null; m.askerler.forEach(a => { if (!a.arac) a.atli = false; }); return; }
      if (m.ai === "ates") { if (!H || mes > menzil || m.aiT > 30) { m.ai = "ilerle"; m.askerler.forEach(a => { if (a.at) a.atli = true; }); } return; }
      sonraki(); m.kos = mes < 260; return;
    }
    if (sinif === "arac") {
      sonraki(); m.kos = false;
      // arıza
      if (m.tanim.ozel?.arac === "tank" && R() < dt * 0.01 && !m.ariza) { m.ariza = 15 + R() * 15; this.mesaj("Bir düşman tankı arızalandı!", "iyi"); }
      if (m.ariza) { m.ariza -= dt; m.git = null; if (m.ariza <= 0) m.ariza = 0; }
      return;
    }
    // piyade: ilerle → dur, ateş et → ilerle; yakında süngü hücumu
    if (m.ai === "hucum") { m.kos = true; m.git = H ? {x: H.cx, z: H.cz} : null; if (!H || m.aiT > 25) { m.ai = "ilerle"; m.aiT = 0; } return; }
    if (H && mes < 38 && m.moral > 55 && m.aiT > 3) { m.ai = "hucum"; m.aiT = 0; return; }
    if (m.ai === "ates") {
      m.git = null;
      const sure = 20 + (m.silah.dolum > 8 ? 14 : 0);
      if (!H || mes > menzil * 1.05 || m.aiT > sure) { m.ai = "ilerle"; m.aiT = 0; }
      return;
    }
    if (H && mes < menzil * (m.silah.sarjor > 1 ? 0.92 : 0.88) && m.aiT > 4) { m.ai = "ates"; m.aiT = 0; m.git = null; m.x = m.cx; m.z = m.cz; m.yon = aci(H.cx - m.cx, H.cz - m.cz); this.formasyon(m, false); return; }
    sonraki(); m.kos = false;
    if (m.rota && m.rotaI >= m.rota.length - 1 && !m.git) m.git = {x: this.A.hedef.x + (R() - 0.5) * 20, z: this.A.hedef.z + (R() - 0.5) * 20};
  }
  ucusGuncelle(a, dt, taraf) {
    const cx = taraf === 0 ? 0 : 0, cz = taraf === 0 ? -40 : 60;
    a.ucusAci += dt * (a.aracTur === "zeplin" ? 0.04 : 0.18);
    const r = a.ucusR;
    a.x = cx + Math.cos(a.ucusAci) * r; a.z = cz + Math.sin(a.ucusAci) * r; a.y = a.aracTur === "zeplin" ? 140 : 90 + Math.sin(a.ucusAci * 3) * 6;
    a.yon = a.ucusAci + Math.PI; a.manga.x = a.x; a.manga.z = a.z;
  }

  // ---------------- asker ----------------
  askerGuncelle(a, dt) {
    a.t += dt;
    if (a.olu) { a.olumT += dt; a.olum = Math.min(1, a.olumT * 1.8); if (a.at) a.at.olum = Math.min(1, a.olumT * 1.2); a.y = this.A.yuzey(a.x, a.z); a.poz = "olu"; if (a.arac) this.aracCiz(a, dt); return; }
    if (a.durum === "sandal" || a.durum === "gizli") return;
    if (a.oyuncu) { this.atisGuncelle(a, dt, true); return; }
    const m = a.manga;
    if (a.arac) { this.aracAsker(a, dt); return; }
    a.tutuk = Math.max(0, a.tutuk - dt);
    // hedef seçimi
    a.hedefT -= dt;
    if (a.hedefT <= 0) {
      a.hedefT = 0.7 + R() * 0.6; a.hedef = null;
      const H = m.hedefManga;
      if (H) {
        const cl = H.askerler.filter(b => !b.olu && b.durum !== "sandal" && this.gorulebilir(a, b));
        if (cl.length) {
          // en yakın birkaç kişiden rastgele
          cl.sort((p, q) => d2(a, p) - d2(a, q)); a.hedef = cl[Math.min(cl.length - 1, (R() * 3) | 0)];
        }
      }
    }
    const h = a.hedef && !a.hedef.olu ? a.hedef : null;
    const w = m.silah, yakinW = SILAHLAR[m.tanim.yakin] || null;
    const hucum = (m.taraf === 0 && m.emir.tur === "hucum") || (m.taraf === 1 && m.ai === "hucum");
    // hedef nokta
    let tx = a.yx ?? a.x, tz = a.yz ?? a.z;
    if (hucum && h) { tx = h.x; tz = h.z; }
    if (m.bozuk) { tx = a.yx; tz = a.yz; }
    const dx = tx - a.x, dz = tz - a.z, d = Math.hypot(dx, dz);
    let hz = 0;
    const kos = m.kos || hucum || d > 8;
    if (d > (hucum ? 1.2 : 0.5) && !(m.ariza)) {
      hz = (kos ? m.tanim.kosu : m.tanim.hiz) * this.hava.hiz * (this.A.suda(a.x, a.z) ? 0.5 : 1);
      if (d > 3 && !hucum) hz *= 1.15; // yuvaya yetiş
      if (a.atli && !kos) hz = Math.max(hz, 2.5);
      const st = Math.min(d, hz * dt);
      const nx = a.x + dx / d * st, nz = a.z + dz / d * st;
      if (!this.A.derinSu(nx, nz) || this.A.derinSu(a.x, a.z)) { a.x = nx; a.z = nz; }
      a.yon += aciFark(a.yon, aci(dx, dz)) * Math.min(1, dt * 8);
    }
    a.hiz = hz; a.y = this.A.yuzey(a.x, a.z) - (a.at && a.atli && a.at.tur === "motor" ? 0.75 : 0) + (a.at && a.atli && a.at.tur === "deve" ? 0.35 : 0);
    if (a.at) { a.at.hiz = a.atli ? hz : 0; a.at.t += dt; }
    // yakın dövüş
    a.yakinT = Math.max(0, a.yakinT - dt);
    if (h && yakinW && !m.bozuk) {
      const hd = Math.sqrt(d2(a, h));
      const ym = yakinW.menzil + (a.atli ? 1 : 0) + (h.atli ? 0.8 : 0);
      if (hd < ym && (hucum || hd < 2.2)) {
        a.yon = aci(h.x - a.x, h.z - a.z);
        if (a.yakinT <= 0) {
          a.yakinT = yakinW.aralik * (0.8 + R() * 0.4);
          let p = yakinW.isabet * (a.atli && a.hiz > 4 ? 1.3 : 1) * (h.atli && !a.atli ? 0.8 : 1);
          if (R() < p) {
            let dmg = yakinW.hasar * (a.ilkDarbe && yakinW.ilkDarbe ? yakinW.ilkDarbe : 1) * (a.atli && a.hiz > 4 ? 1.4 : 1) * (m.tanim.yakinHasar || 1);
            this.hasar(h, dmg * (0.8 + R() * 0.4), a, "yakin");
            if (a.atli && a.hiz > 4 && this.zaman - h.manga.sonHucumSok > 8) { h.manga.moral -= 12; h.manga.sonHucumSok = this.zaman; }
            this.E.isabet(h.x, h.y + 1.1, h.z, "asker");
          }
          a.ilkDarbe = false;
          if (this.yakinKamera(a)) ses("kilic", this.kamUzak(a));
        }
        a.poz = a.atli ? "ata_hucum" : "hucum"; if (a.atli) a.poz = "ata_hucum";
        return;
      }
    }
    if (!hucum) a.ilkDarbe = true;
    // el bombası
    a.bombaT -= dt;
    if (h && m.tanim.ikinci === "el_bombasi" && a.bombaT <= 0 && !m.bozuk) {
      const hd = Math.sqrt(d2(a, h));
      if (hd < 28 && hd > 8 && (this.A.kapak(h.x, h.z) > 0.2 || h.arac)) { a.bombaT = 18 + R() * 12; this.bombaAt(a, h.x + (R() - 0.5) * 3, h.z + (R() - 0.5) * 3, SILAHLAR.el_bombasi); a.poz = "at"; return; }
    }
    // alev silahı
    if (m.silah.tur === "alev" && h) {
      const hd = Math.sqrt(d2(a, h));
      if (hd < m.silah.menzil) {
        a.yon = aci(h.x - a.x, h.z - a.z); a.poz = "nisan"; a.alevT = (a.alevT || 0) - dt;
        if (a.alevT <= 0) { a.alevT = 0.15; this.E.alev(a.x + Math.sin(a.yon), a.y + 1.2, a.z + Math.cos(a.yon), Math.sin(a.yon), Math.cos(a.yon)); ses("alev", this.kamUzak(a));
          for (const b of h.manga.askerler) if (!b.olu && Math.hypot(b.x - h.x, b.z - h.z) < 4) this.hasar(b, m.silah.hasar * 0.3, a, "alev");
          h.manga.moral -= 0.6; }
        return;
      }
    }
    // ateş
    const atis = this.atisGuncelle(a, dt, false, h, hz > 0.3);
    // poz
    if (a.atli) a.poz = hucum && hz > 3 ? "ata_hucum" : (atis === "nisan" ? "ata_nisan" : "ata");
    else if (m.top) a.poz = m.top.kurulu ? (a.slot === 0 ? "top" : (a.slot < 3 ? "dur" : "diz")) : (hz > 0.3 ? "yuru" : "dur");
    else if (m.mg) a.poz = m.mg.obj && hz < 0.3 ? "makineli" : (hz > 0.3 ? "yuru" : "dur");
    else if (m.bozuk) a.poz = "kos";
    else if (hz > 0.3) a.poz = hucum ? "hucum" : kos ? "kos" : "yuru";
    else if (atis === "nisan") a.poz = this.dizCoker(a) ? "diz" : "nisan";
    else if (atis === "doldur") a.poz = this.dizCoker(a) ? "diz_doldur" : "doldur";
    else if (m.tanim.ozel?.istihkam && m.emir.tur === "tut" && !h && this.zaman < 60) a.poz = "kaz";
    else a.poz = "dur";
    if (a.poz === "kaz") { a.kazT += dt; if (a.kazT > 10 && !m.kazdi) { m.kazdi = true; this.A.kapakEkle(m.x, m.z, 14, 0.4); for (const o of this.mangalar) if (o.taraf === 0 && Math.hypot(o.x - m.x, o.z - m.z) < 30) this.A.kapakEkle(o.x, o.z, 8, 0.35); const tb = N.kumTorbasi(10, 2); tb.position.set(m.x + Math.sin(m.yon) * 3, this.A.yukseklik(m.x, m.z), m.z + Math.cos(m.yon) * 3); tb.rotation.y = m.yon; this.grup.add(tb); } }
  }
  dizCoker(a) { const w = a.manga.silah; return a.manga.taraf === 0 ? (w.dolum < 10 || a.manga.tahkimat) : (w.dolum < 10 && a.manga.ai === "ates"); }
  yakinKamera(a) { return this.kamUzak(a) < 160; }
  kamUzak(a) { const k = this.motor.kamera.position; return Math.sqrt((a.x - k.x) ** 2 + (a.z - k.z) ** 2 + (a.y - k.y) ** 2); }

  // tüfek ateşi: dolum, nişan, isabet; dönüş: "nisan" | "doldur" | null
  atisGuncelle(a, dt, oyuncu, h, hareket) {
    const m = a.manga, w = oyuncu ? (a.silahW || m.silah) : m.silah;
    if (w.tur === "top" || (m.mg && !oyuncu)) return null;
    if (a.dolum > 0) {
      const hiz = (m.tanim.dolum || 1) * (a.durum === "diz" ? 0.9 : 1);
      a.dolum -= dt / hiz;
      if (a.dolum <= 0) { a.sarjor = w.sarjor; a.dolum = 0; }
      if (!oyuncu) return a.dolum > 0 && w.dolum > 2 ? "doldur" : null;
    }
    if (oyuncu) return null;
    if (!h || a.tutuk > 0 || a.mermi <= 0) { a.nisanT = 0; return null; }
    if (hareket && !(a.atli && (w.tur === "tufek" || w.tur === "tabanca"))) { a.nisanT = 0; return null; }
    if (m.bozuk) return null;
    const mes = Math.sqrt(d2(a, h));
    if (mes > w.menzil) { a.nisanT = 0; return null; }
    a.yon += aciFark(a.yon, aci(h.x - a.x, h.z - a.z)) * Math.min(1, dt * 6);
    a.nisan = Math.atan2((h.y - a.y), mes) * 0.5;
    a.nisanT += dt;
    if (a.nisanT < 0.7 + R() * 0.6 + (w.durbun ? 1.2 : 0)) return "nisan";
    // ateş!
    a.nisanT = 0; a.atisT = this.zaman;
    // tutukluk
    let tut = w.tutukluk * (this.hava.yagis === "yagmur" ? w.yagmur * this.hava.tutukluk / 3 + 1 : 1) * (m.bakim === true ? 0.25 : m.bakim === false ? 2.2 : 1);
    if (R() < tut) { a.tutuk = 6 + R() * 6; if (m.taraf === 0 && this.zaman - (m.tutukMesaj || -99) > 45 && R() < 0.3) { m.tutukMesaj = this.zaman; this.mesaj(`${m.ad}: tüfekler tutukluk yapıyor!`, "uyari"); } return "nisan"; }
    a.mermi--; a.sarjor--;
    if (a.sarjor <= 0) a.dolum = w.dolum * (0.85 + R() * 0.3);
    this.namluEfekt(a, w);
    // isabet
    let p = w.isabet * (1 - 0.65 * Math.pow(mes / w.menzil, 1.5)) * this.hava.isabet * (m.tanim.isabet || 1);
    p *= 1 - this.A.kapak(h.x, h.z) * (h.manga.tahkimat && h.taraf === 0 ? 1.1 : 0.9);
    if (h.atli) p *= 1.25; if (h.hiz > 2) p *= 0.85; if (a.atli) p *= 0.7;
    p *= 0.7 + 0.3 * clamp(m.moral / 100, 0, 1);
    if (h.oyuncu) p *= 0.55;
    if (this.H.gece) p *= 0.75 + this.H.fisekAydinlik(h.x, h.z) * 0.25;
    if (R() < p) { this.hasar(h, w.hasar * (0.7 + R() * 0.6), a, "mermi"); if (this.kamUzak(h) < 90) this.E.isabet(h.x, h.y + 1.1, h.z, h.arac ? "metal" : "asker"); }
    else if (this.kamUzak(h) < 90) { const mx = h.x + (R() - 0.5) * 3, mz = h.z + (R() - 0.5) * 3; this.E.isabet(mx, this.A.yuzey(mx, mz), mz, this.A.suda(mx, mz) ? "su" : "toprak"); }
    if (h.oyuncu && R() < 0.5) ses("vizilti", 2);
    return "nisan";
  }
  namluEfekt(a, w) {
    const dx = Math.sin(a.yon), dz = Math.cos(a.yon);
    const yuk = a.atli ? 2.2 : (a.poz === "diz" ? 1.0 : 1.45);
    const ku = this.kamUzak(a);
    if (ku < 260) this.E.namlu(a.x + dx * 0.9, a.y + yuk, a.z + dz * 0.9, dx, dz, w.duman + 0.15, false);
    ses(w.ses, ku);
  }

  // ---------------- topçu ----------------
  topGuncelle(m, dt, canli) {
    const T = m.top, w = m.silah;
    // top manga noktasını izler
    T.x += (m.x - T.x) * Math.min(1, dt * 2); T.z += (m.z - T.z) * Math.min(1, dt * 2);
    T.obj.position.set(T.x, this.A.yukseklik(T.x, T.z), T.z);
    const ekip = canli.filter(a => !a.arac).length;
    if (!ekip) return;
    let H = m.hedefManga;
    if (m.taraf === 0 && T.hedefNokta) H = null;
    const hedefYer = T.hedefNokta || (H ? {x: H.cx, z: H.cz} : null);
    if (!hedefYer || !T.kurulu || m.hareket) { T.obj.rotation.y += aciFark(T.obj.rotation.y, m.yon) * Math.min(1, dt * 2); return; }
    const mes = Math.hypot(hedefYer.x - T.x, hedefYer.z - T.z);
    if (mes > w.menzil) { if (m.taraf === 1 && !m.git) { m.ai = "ilerle"; } return; }
    const ya = aci(hedefYer.x - T.x, hedefYer.z - T.z);
    T.obj.rotation.y += aciFark(T.obj.rotation.y, ya) * Math.min(1, dt * 1.5); m.yon = T.obj.rotation.y;
    T.dolum -= dt * Math.min(1, ekip / 3);
    if (T.dolum > 0) return;
    T.dolum = w.dolum * (m.bakim === false ? 1.3 : 1) * (0.85 + R() * 0.3);
    if (R() < w.tutukluk * (m.bakim === true ? 0.3 : 1)) { T.dolum += 10; return; }
    const ax = T.x + Math.sin(ya) * 2, az = T.z + Math.cos(ya) * 2, ay = this.A.yukseklik(T.x, T.z) + 1;
    this.E.namlu(ax, ay, az, Math.sin(ya), Math.cos(ya), w.duman, true);
    ses(w.ses, this.kamUzak({x: T.x, y: ay, z: T.z}), 1.2);
    T.obj.userData.namlu && (T.obj.userData.namlu.position.z = -0.3);
    setTimeout(() => { if (T.obj.userData.namlu) T.obj.userData.namlu.position.z = 0.15; }, 250);
    // misket: yakındaki piyadeye
    if (w.misket && mes < 140 && H) { this.misket(m, T.x, T.z, ya, w); return; }
    // görüş yardımı: balon / gözcü / telefon isabeti artırır
    const goz = this.mangalar.some(o => o.taraf === m.taraf && !o.yokOldu && o.tanim.ozel && (o.tanim.ozel.balon || o.tanim.ozel.telefon || o.tanim.ozel.gozcu));
    const sapma = (1 - w.isabet) * mes * 0.12 * (goz ? 0.6 : 1) * (m.taraf === 0 ? 1 : 1.1);
    const hx = hedefYer.x + (R() - 0.5) * 2 * sapma, hz = hedefYer.z + (R() - 0.5) * 2 * sapma;
    this.mermiAt(ax, ay, az, hx, hz, w, m.taraf, w.egik);
  }
  misket(m, x, z, ya, w) {
    for (const a of this.askerler) {
      if (a.taraf === m.taraf || a.olu || a.durum === "sandal") continue;
      const dx = a.x - x, dz = a.z - z, d = Math.hypot(dx, dz); if (d > 140) continue;
      if (Math.abs(aciFark(ya, aci(dx, dz))) > 0.2) continue;
      if (a.arac) continue;
      if (R() < 0.45 * (1 - d / 160) * (1 - this.A.kapak(a.x, a.z) * 0.7)) this.hasar(a, 70, null, "misket");
    }
    for (let i = 0; i < 10; i++) { const r = 20 + R() * 100, aa = ya + (R() - 0.5) * 0.35, px = x + Math.sin(aa) * r, pz = z + Math.cos(aa) * r; this.E.isabet(px, this.A.yuzey(px, pz), pz); }
  }
  mermiAt(x, y, z, hx, hz, w, taraf, egik, gor = true) {
    const hy = this.A.yuzey(hx, hz);
    const dx = hx - x, dz = hz - z, d = Math.hypot(dx, dz);
    const sure = egik ? Math.max(3, d / 90) : Math.max(0.6, d / 260);
    const vy = (hy - y + 0.5 * 9.8 * sure * sure) / sure;
    this.mermiler.push({x, y, z, vx: dx / sure, vy, vz: dz / sure, t: 0, w, taraf, gor, iz: w.duman > 1});
  }
  mermiGuncelle(dt) {
    for (let i = this.mermiler.length - 1; i >= 0; i--) {
      const b = this.mermiler[i]; b.t += dt;
      b.vy -= 9.8 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
      if (b.iz && R() < 0.3) this.E.duman.ekle(b.x, b.y, b.z, 0, 0, 0, 1.5, 0.3, 1, 0.3, 0.7, 0.7, 0.7, 0, 0, 0);
      const zy = this.A.yuzey(b.x, b.z);
      if (b.y <= zy || b.t > 20) { this.mermiler.splice(i, 1); this.patla(b.x, Math.max(zy, b.y), b.z, b.w, b.taraf); }
    }
  }
  patla(x, y, z, w, taraf) {
    const su = this.A.suda(x, z);
    const alan = w.alan || 5, buy = clamp(alan / 6, 0.5, 1.8);
    this.E.patlama(x, y, z, buy, su);
    const ku = this.kamUzak({x, y, z});
    ses(alan > 5 ? "boom" : "boom_s", ku);
    if (ku < 40) this.motor.sarsinti = Math.max(this.motor.sarsinti || 0, (1 - ku / 40) * 0.6);
    if (w.tur === "sis") { this.E.sisBombasi(x, y, z); return; }
    for (const a of this.askerler) {
      if (a.olu || a.durum === "sandal") continue;
      const d = Math.hypot(a.x - x, a.z - z, (a.y - y) * 0.5);
      if (d > alan) continue;
      if (a.arac) { if ((w.delme || 0) >= (a.zirh || 0)) this.hasar(a, w.hasar * (1 - d / alan) * (a.zirh ? 0.8 : 1), null, "patlama"); else if (this.kamUzak(a) < 120) this.E.isabet(a.x, a.y + 1.5, a.z, "metal"); continue; }
      const kap = w.egik ? this.A.kapak(a.x, a.z) * 0.2 : this.A.kapak(a.x, a.z) * 0.6;
      this.hasar(a, w.hasar * (1 - d / alan) * (1 - kap) * (0.7 + R() * 0.6), null, "patlama");
    }
    for (const m of this.mangalar) if (m.cx !== undefined && (m.cx - x) ** 2 + (m.cz - z) ** 2 < (alan * 3) ** 2) { m.moral -= 4 * (m.tahkimat ? 0.6 : 1); m.sonKayip = this.zaman; }
  }
  mgGuncelle(m, dt, canli) {
    const G = m.mg, w = m.silah;
    G.x = m.x; G.z = m.z; G.obj.position.set(G.x, this.A.yukseklik(G.x, G.z), G.z);
    const ekip = canli.length; if (!ekip) return;
    m.isi = Math.max(0, m.isi - dt * (w.isinma ? 6 : 10)); if (m.asiri > 0) { m.asiri -= dt; return; }
    const H = m.hedefManga; if (!H || m.hareket || (m.taraf === 1 && m.ai !== "kur")) { G.obj.rotation.y += aciFark(G.obj.rotation.y, m.yon) * Math.min(1, dt * 2); return; }
    const cl = H.askerler.filter(a => !a.olu && this.gorulebilir(m.askerler[0], a) && a.durum !== "sandal");
    if (!cl.length) return;
    const h = cl[(R() * cl.length) | 0]; const mes = Math.sqrt(d2(G, h)); if (mes > w.menzil) return;
    const ya = aci(h.x - G.x, h.z - G.z); G.obj.rotation.y += aciFark(G.obj.rotation.y, ya) * Math.min(1, dt * 4); m.yon = G.obj.rotation.y;
    for (const a of canli) a.yon = ya;
    if (G.dolum > 0) { G.dolum -= dt; if (G.dolum <= 0) G.sarjor = w.sarjor; return; }
    G.aralik -= dt; if (G.aralik > 0) return;
    G.aralik = w.aralik * (1 + (3 - ekip) * 0.3);
    if (R() < w.tutukluk * (m.bakim === true ? 0.3 : m.bakim === false ? 2 : 1)) { m.asiri = 5; this.mesaj(m.taraf === 0 ? `${m.ad}: makineli tutukluk yaptı!` : "Düşman makinelisi sustu!", m.taraf === 0 ? "uyari" : "iyi"); return; }
    G.sarjor--; if (G.sarjor <= 0) G.dolum = w.dolum;
    m.isi += 1; if (w.isinma && m.isi > 120) { m.asiri = 8; if (m.taraf === 0) this.mesaj(`${m.ad}: namlu ısındı, soğutuluyor.`, "uyari"); }
    const dx = Math.sin(ya), dz = Math.cos(ya), y = this.A.yukseklik(G.x, G.z) + 0.5;
    if (this.kamUzak(G) < 220 && R() < 0.5) this.E.namlu(G.x + dx * 1.1, y, G.z + dz * 1.1, dx, dz, w.duman + 0.1, false);
    ses(w.ses, this.kamUzak({x: G.x, y, z: G.z}));
    let p = w.isabet * (1 - 0.6 * Math.pow(mes / w.menzil, 1.4)) * this.hava.isabet * (1 - this.A.kapak(h.x, h.z) * 0.85) * (h.atli ? 1.5 : 1);
    if (h.arac && h.zirh) { if (this.kamUzak(h) < 100) this.E.isabet(h.x, h.y + 1.5, h.z, "metal"); return; }
    if (R() < p) this.hasar(h, w.hasar * (0.8 + R() * 0.4), m.askerler[0], "mermi");
    else if (this.kamUzak(h) < 100) { const mx = h.x + (R() - 0.5) * 4, mz = h.z + (R() - 0.5) * 4; this.E.isabet(mx, this.A.yuzey(mx, mz), mz); }
    if (h.atli && this.zaman - h.manga.sonHucumSok > 3) { h.manga.moral -= 2; }
  }

  // ---------------- araçlar ----------------
  aracAsker(a, dt) {
    const m = a.manga;
    if (a.aracTur === "balon") { a.y = this.A.yukseklik(m.x, m.z) + 55 + Math.sin(this.zaman * 0.4) * 1.5; a.x = m.x; a.z = m.z; this.aracCiz(a, dt); return; }
    if (a.aracTur === "ucak" || a.aracTur === "zeplin") { this.aracCiz(a, dt); this.ucakSaldir(a, dt); return; }
    // kara aracı: manga noktasını izler
    const dx = m.x - a.x, dz = m.z - a.z, d = Math.hypot(dx, dz);
    const hz = m.tanim.hiz * this.hava.hiz * (m.ariza ? 0 : 1);
    if (d > 0.5) { const st = Math.min(d, hz * dt); a.x += dx / d * st; a.z += dz / d * st; a.yon += aciFark(a.yon, aci(dx, dz)) * Math.min(1, dt * 1.5); a.hiz = hz; } else a.hiz = 0;
    a.y = this.A.yuzey(a.x, a.z);
    this.aracCiz(a, dt);
    // ateş
    const H = m.hedefManga; a.dolum -= dt;
    if (H && a.dolum <= 0) {
      const cl = H.askerler.filter(b => !b.olu && this.gorulebilir(a, b)); if (!cl.length) return;
      const h = cl[(R() * cl.length) | 0]; const mes = Math.sqrt(d2(a, h)); const w = m.silah;
      if (mes > w.menzil) return;
      if (w.tur === "top") { a.dolum = w.dolum * (0.8 + R() * 0.4); const ya = aci(h.x - a.x, h.z - a.z); this.E.namlu(a.x + Math.sin(ya) * 3, a.y + 1.6, a.z + Math.cos(ya) * 3, Math.sin(ya), Math.cos(ya), w.duman, true); ses("cannon", this.kamUzak(a)); const sap = mes * 0.06; this.mermiAt(a.x, a.y + 1.6, a.z, h.x + (R() - 0.5) * sap, h.z + (R() - 0.5) * sap, w, m.taraf, false); }
      else { a.dolum = w.aralik * 3; this.E.namlu(a.x + Math.sin(a.yon) * 2, a.y + 2.2, a.z + Math.cos(a.yon) * 2, Math.sin(a.yon), Math.cos(a.yon), 0.3, false); ses(w.ses, this.kamUzak(a)); if (R() < w.isabet * (1 - this.A.kapak(h.x, h.z) * 0.8)) this.hasar(h, w.hasar, a, "mermi"); }
      if (a.aracTur === "zirhli" && a.arac.userData.kule) a.arac.userData.kule.rotation.y = aciFark(a.yon, aci(h.x - a.x, h.z - a.z));
    }
  }
  ucakSaldir(a, dt) {
    const m = a.manga; if (a.aracTur === "ucak" && m.tanim.id === "avci_ucagi") {
      a.dolum -= dt; if (a.dolum > 0) return; a.dolum = 2.5;
      // altındaki düşman askerlerini taciz et
      for (const b of this.askerler) if (b.taraf !== a.taraf && !b.olu && !b.arac && Math.hypot(b.x - a.x, b.z - a.z) < 30 && R() < 0.25) { this.hasar(b, 35, a, "mermi"); this.E.isabet(b.x, b.y + 1, b.z); }
    }
    if (a.aracTur === "zeplin") { a.dolum -= dt; if (a.dolum <= 0) { a.dolum = 9; this.mermiAt(a.x, a.y - 8, a.z, a.x + (R() - 0.5) * 20, a.z + (R() - 0.5) * 20, SILAHLAR.obus, a.taraf, false); } }
  }
  aracCiz(a, dt) {
    const o = a.arac;
    o.position.set(a.x, a.y, a.z); o.rotation.y = a.yon;
    if (a.aracTur === "ucak") { o.rotation.z = a.taraf === 0 ? 0.35 : -0.35; o.rotation.y = a.yon - Math.PI / 2; if (o.userData.pervane) o.userData.pervane.rotation.z += dt * 40; }
    if (a.aracTur === "zeplin") o.rotation.y = a.yon - Math.PI / 2;
    if (a.aracTur === "balon") { o.position.y = a.y; o.rotation.y = Math.sin(this.zaman * 0.2) * 0.3; }
    if (a.olu) { o.rotation.z = Math.min(0.3, a.olumT * 0.2); if (a.aracTur === "ucak" || a.aracTur === "zeplin" || a.aracTur === "balon") { a.y = Math.max(this.A.yuzey(a.x, a.z), a.y - dt * 25); o.position.y = a.y; } if (R() < 0.3) this.E.duman.ekle(a.x, a.y + 2, a.z, 0, 2, 0, 6, 1, 6, 0.6, 0.15, 0.14, 0.13, -0.1, 0.4, 0.5); }
  }

  // ---------------- hasar ve ölüm ----------------
  hasar(a, miktar, kaynak, tur) {
    if (a.olu || miktar <= 0) return;
    if (a.oyuncu && this.motor.oyuncuHasar) this.motor.oyuncuHasar(miktar, kaynak);
    if (a.arac && a.zirh && tur === "mermi") return;
    a.can -= miktar;
    if (a.atli && a.at && a.can > 0 && a.can < 60 && R() < 0.3 && !a.arac) { a.atli = false; a.at = null; } // atı vuruldu
    if (a.can > 0) return;
    a.olu = true; a.olumT = 0; a.yon2 = R();
    const m = a.manga;
    m.kayipSayi++; m.sonKayip = this.zaman;
    let kayipEtki = (m.taraf === 1 ? 62 : 85) / Math.max(4, m.baslangicBoy);
    if (this.sancakYakin(m)) kayipEtki *= 0.55;
    if (m.komutanYakin) kayipEtki *= 0.75;
    m.moral -= kayipEtki;
    if (a.taraf === 1) { this.ist.dusen++; this.ist.olumYer.push({x: a.x, z: a.z}); }
    else {
      this.ist.kayip++;
      if (!a.arac && R() < 0.45 && !a.komutan) { a.yarali = true; this.ist.yarali++; }
      this.ist.bizOlumYer.push({x: a.x, z: a.z, yarali: a.yarali, m: m.kayit ? m.kayit.id : null});
    }
    if (a.arac) { this.E.patlama(a.x, a.y + 1, a.z, 1.4); ses("boom", this.kamUzak(a)); this.mesaj(a.taraf === 1 ? `Düşman ${m.tanim.ad} yok edildi!` : `${m.ad} kaybedildi!`, a.taraf === 1 ? "iyi" : "kotu"); }
    if (a.komutan && this.motor.komutanDustu) this.motor.komutanDustu();
    if (a.oyuncu && this.motor.oyuncuDustu) this.motor.oyuncuDustu();
  }
  sancakYakin(m) { return this.mangalar.some(o => o.taraf === m.taraf && o.sancakli && !o.yokOldu && o.cx !== undefined && (o.cx - m.cx) ** 2 + (o.cz - m.cz) ** 2 < 40 * 40); }

  temizle() {
    // çok eski ölüleri ve haritadan çıkan kaçakları sil
    for (let i = this.askerler.length - 1; i >= 0; i--) {
      const a = this.askerler[i];
      if (a.olu && a.olumT > 32 && !a.arac) { this.askerler.splice(i, 1); const k = a.manga.askerler.indexOf(a); if (k >= 0) a.manga.askerler.splice(k, 1); }
      else if (!a.olu && a.taraf === 1 && a.z < -this.A.S / 2 - 15) { a.olu = true; a.olumT = 99; this.ist.kacan++; const k = a.manga.askerler.indexOf(a); if (k >= 0) a.manga.askerler.splice(k, 1); this.askerler.splice(i, 1); }
    }
    for (const s of this.sandallar) if (s.vardi && !s.gitti) { s.gitti = true; }
  }

  // ---------------- zafer / yenilgi ----------------
  hedefKontrol(dt) {
    if (this.bitti) return;
    const H = this.A.hedef;
    let biz = 0, onlar = 0;
    for (const a of this.askerler) {
      if (a.olu || a.durum === "sandal" || a.arac && (a.aracTur === "balon" || a.aracTur === "ucak")) continue;
      if ((a.x - H.x) ** 2 + (a.z - H.z) ** 2 > H.r * H.r) continue;
      if (a.taraf === 0) biz++; else if (!a.manga.bozuk) onlar++;
    }
    if (onlar > 0 && biz === 0) this.hedefIlerleme = Math.min(100, this.hedefIlerleme + dt * (3 + Math.min(onlar, 10) * 0.8));
    else if (biz > 0) this.hedefIlerleme = Math.max(0, this.hedefIlerleme - dt * 6);
    if (this.hedefIlerleme >= 100) return this.bitir(false, "Düşman sancağımızı ele geçirdi.");
    // bizden savaşabilen kalmadı mı
    const bizCanli = this.mangalar.filter(m => m.taraf === 0 && !m.komutan && !m.yokOldu && !m.bozuk && this.canlilar(m).length);
    if (!bizCanli.length && this.mangalar.some(m => m.taraf === 0 && !m.komutan)) { this._hepsiT = (this._hepsiT || 0) + dt; if (this._hepsiT > 12) return this.bitir(false, "Ordumuz dağıldı."); } else this._hepsiT = 0;
    // zafer
    const dusmanCanli = this.askerler.some(a => a.taraf === 1 && !a.olu && !a.manga.bozuk);
    const bitmisDalga = !this.sonsuz && this.dalgaI >= this.dalgalar.length;
    if (bitmisDalga && !dusmanCanli && this.zaman > 10) { this._zaferT = (this._zaferT || 0) + dt; if (this._zaferT > 5) return this.bitir(true, "Düşman geri püskürtüldü!"); } else this._zaferT = 0;
    if (!this.sonsuz && this.g.sure && this.zaman > this.g.sure && bitmisDalga) { for (const m of this.mangalar) if (m.taraf === 1 && !m.bozuk) { m.bozuk = true; m.ai = "kac"; } return this.bitir(true, "Mevzi tutuldu, düşman çekiliyor!"); }
  }
  bitir(zafer, neden) {
    if (this.bitti) return;
    this.bitti = true; this.sonuc = {zafer, neden, zaman: this.zaman, ...this.ist, seviye: this.sonsuzSeviye};
    borazan(zafer ? "zafer" : "yenilgi");
    for (const a of this.askerler) if (!a.olu && a.taraf === 0) a.poz = zafer ? "sevin" : "dur";
    this.motor.savasBitti && this.motor.savasBitti(this.sonuc);
  }

  // ---------------- oyuncu yardımcıları ----------------
  // ışın: kameradan; asker silindirleri ile kesişim
  isinVur(o, d, taraf, menzil) {
    let en = null, et = menzil;
    for (const a of this.askerler) {
      if (a.olu || a.taraf === taraf || a.durum === "sandal" && false) continue;
      const boy = a.arac ? (a.aracTur === "balon" ? 0 : 2.6) : a.atli ? 2.6 : (a.poz === "diz" || a.poz === "diz_doldur" ? 1.15 : 1.8);
      const r = a.arac ? (a.aracTur === "tank" ? 2.6 : 1.8) : a.atli ? 0.8 : 0.38;
      const cy = a.arac && a.aracTur === "balon" ? a.y : a.y + boy / 2;
      const cyR = a.arac && a.aracTur === "balon" ? 6 : null;
      // en yakın nokta (ışın-nokta) yaklaşımı
      const px = a.x - o.x, py = cy - o.y, pz = a.z - o.z;
      const t = px * d.x + py * d.y + pz * d.z; if (t < 0 || t > et) continue;
      const qx = o.x + d.x * t - a.x, qy = o.y + d.y * t - cy, qz = o.z + d.z * t - a.z;
      if (cyR ? qx * qx + qy * qy + qz * qz < cyR * cyR : (qx * qx + qz * qz < r * r && Math.abs(qy) < boy / 2)) { en = a; et = t; }
    }
    return en ? {a: en, t: et} : null;
  }
  zeminVur(o, d, menzil = 900) {
    let t = 0.5; let onceki = o.y - this.A.yuzey(o.x, o.z);
    while (t < menzil) {
      const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
      const h = y - this.A.yuzey(x, z);
      if (h < 0) { const tt = t - (1 - Math.max(0, onceki) / (onceki - h + 1e-6)) * (t < 30 ? 0.5 : 2); return {x: o.x + d.x * tt, y: o.y + d.y * tt, z: o.z + d.z * tt, t: tt}; }
      onceki = h; t += t < 30 ? 0.5 : 2;
    }
    return null;
  }
  topcuAtesi(x, z) {
    if (this.topcuHakki <= 0) { this.mesaj("Topçu atış hakkı kalmadı.", "uyari"); return false; }
    this.topcuHakki--;
    const w = SILAHLAR[this.yil >= 1897 ? "seri_top" : this.yil >= 1870 ? "celik_top" : "agizdan_top"];
    this.mesaj("Topçu ateşi istendi! Siper alın!", "iyi");
    for (let i = 0; i < 7; i++) setTimeout(() => { if (this.bitti && !this.ganimetModu) return; const hx = x + (R() - 0.5) * 30, hz = z + (R() - 0.5) * 30; this.mermiAt(hx - 60, 160, this.A.S / 2, hx, hz, w, 0, true, true); }, 1500 + i * 500 + R() * 300);
    return true;
  }
  fisekAt(x, z) {
    if (this.fisek <= 0) { this.mesaj("İşaret fişeği kalmadı.", "uyari"); return; }
    this.fisek--; this.H.fisekAt(x, z, this.A.yuzey(x, z)); ses("puf", 5);
  }
  bombaAt(a, hx, hz, w) {
    const y = a.y + 1.6;
    this.mermiAt(a.x, y, a.z, hx, hz, w, a.taraf, true);
  }

  dispose() {
    const s = this.motor.sahne;
    this.A.dispose(); this.H.dispose(); this.E.dispose(); this.K.dispose();
    s.remove(this.grup);
    ortamSes(null);
  }
}
