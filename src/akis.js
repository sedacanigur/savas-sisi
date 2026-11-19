// Görev akışı: Aşama 1 (konuşlanma) → Aşama 2 (son hazırlık) → Aşama 3 (savaş) → Aşama 4 (ganimet) → kamp
import * as THREE from "three";
import {motor} from "./motor.js";
import {Savas} from "./savas/savas.js";
import {Oyuncu} from "./savas/oyuncu.js";
import {Hud} from "./ui/hud.js";
import {MangaEtiket} from "./ui/etiket.js";
import {UI, el, esc, modal, toast, gecis, soruSor, temizle, acikModalVar} from "./ui/arayuz.js";
import {K, AYAR, kaydet, birlikTanimi, ekle, arastirmaBitir, ayarKaydet} from "./kayit.js";
import {G, tus, bas, kilitBirak, kilitAc} from "./girdi.js";
import {KAYNAK} from "./veri/oyun.js";
import {BIRLIKLER, donem} from "./veri/birlikler.js";
import {HAVALAR, SAATLER} from "./veri/haritalar.js";
import {OLAYLAR, RASTGELE_OLAYLAR, BOLUMLER} from "./veri/hikaye.js";
import {yanlisVar} from "./sorular/soru.js";
import * as N from "./modeller/nesneler.js";
import {ses, sesBaslat, borazan} from "./ses.js";

const R = Math.random;
const ASAMALAR = ["1 · Konuşlanma", "2 · Son hazırlık", "3 · Savaş", "4 · Ganimet"];
function asamaUst(i) { return `<div class="asama-ust panel">${ASAMALAR.map((a, j) => `<span class="${j === i ? "on" : j < i ? "bitti" : ""}">${a}</span>`).join("")}</div>`; }

// Kuşbakışı plan kamerası (Aşama 1, 2)
class PlanKamera {
  constructor(s, x, z, yuk = 150, egim = 0.62) { this.s = s; this.x = x; this.z = z; this.yuk = yuk; this.egim = egim; this.aci = 0; this.hedef = null; }
  guncelle(dt) {
    const k = motor.kamera;
    if (!acikModalVar()) {
      const hz = this.yuk * 0.8 * dt;
      if (tus("KeyW") || tus("ArrowUp")) this.z -= hz; if (tus("KeyS") || tus("ArrowDown")) this.z += hz;
      if (tus("KeyA") || tus("ArrowLeft")) this.x -= hz; if (tus("KeyD") || tus("ArrowRight")) this.x += hz;
      this.yuk = Math.max(40, Math.min(360, this.yuk + G.tekerlek * 12));
    }
    if (this.hedef) { this.x += (this.hedef.x - this.x) * Math.min(1, dt * 2); this.z += (this.hedef.z - this.z) * Math.min(1, dt * 2); if (this.hedef.yuk) this.yuk += (this.hedef.yuk - this.yuk) * Math.min(1, dt * 2); }
    const L = this.s.A.S / 2; this.x = Math.max(-L, Math.min(L, this.x)); this.z = Math.max(-L, Math.min(L, this.z));
    const y = this.s.A.yuzey(this.x, this.z);
    k.position.set(this.x, y + this.yuk, this.z + this.yuk * this.egim);
    k.lookAt(this.x, y, this.z);
    motor.odak = {x: this.x, y, z: this.z};
  }
  zemin() { // fare altındaki zemin noktası
    const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2((G.x / innerWidth) * 2 - 1, -(G.y / innerHeight) * 2 + 1), motor.kamera);
    return this.s.zeminVur(ray.ray.origin, ray.ray.direction, 2000);
  }
}

// Bizim mangaları otomatik yerleştir
function otomatikYerlesim(s) {
  const H = s.A.hedef, bizim = s.mangalar.filter(m => m.taraf === 0 && !m.komutan);
  const piyade = bizim.filter(m => ["piyade", "makineli"].includes(m.sinif) && !m.tanim.ozel?.sihhiye);
  const arka = bizim.filter(m => !piyade.includes(m));
  const onZ = s.harita.tip === "siper" ? null : H.z - 38;
  piyade.forEach((m, i) => {
    const x = H.x + (i - (piyade.length - 1) / 2) * 30;
    const z = onZ === null ? s.A.siperHatti(x) + 0.5 : onZ + Math.abs(i - (piyade.length - 1) / 2) * 4;
    s.yerlestir(m, x, z, Math.PI);
  });
  arka.forEach((m, i) => {
    const yan = i % 2 ? 1 : -1, sira = Math.floor(i / 2);
    let x = H.x + yan * (25 + sira * 30), z = H.z + 6 + sira * 6;
    if (m.atli) { x = H.x + yan * (70 + sira * 20); z = H.z - 10; }
    if (m.tanim.ozel?.balon || m.sinif === "hava") { x = H.x + yan * 40; z = H.z + 30; }
    s.yerlestir(m, x, Math.min(z, s.A.konus.z1 - 4), Math.PI);
  });
}

// ===================================================================
export async function gorevBaslat(gorev, op) {
  // op: {ordu: [kayıt mangaları], kalici: bool, mod, tercih, slot, donus: fn}
  sesBaslat();
  const ctx = {gorev, ...op, rol: AYAR.kamera || "asker", puan: 0, soruKalan: 4, keşif: {}, topcu: 0, fisekEk: 0, ekSlot: 0};
  await gecis(() => {
    temizle();
    if (motor.aktif && motor.aktif.bitir) motor.aktif.bitir(); motor.aktif = null;
    const secili = op.ordu.filter(r => r.secili && r.asker > 0).slice(0, gorev.slot || 5);
    ctx.secili = secili;
    const mangalar = secili.map(r => ({tanim: birlikTanimi(r.tur), x: 0, z: 100, yon: Math.PI, kayit: r}));
    const tek = K.tek || {};
    const s = new Savas(motor, {gorev, mangalar, grafik: motor.grafik(), konserve: !!tek.konserve, topcuHakki: (tek.telgraf ? 1 : 0)});
    s.duraklat = true; ctx.s = s; motor.efekt = s.E; window.__savas = s;
    otomatikYerlesim(s);
    s.gorunurluk(); s.A.sis.u.sisGuc.value = 1;
    for (let i = 0; i < 4; i++) s.gorunurluk();
  });
  asama1(ctx);
}

// ---------------- AŞAMA 1: KONUŞLANMA ----------------
function asama1(ctx) {
  const s = ctx.s, A = s.A;
  const kam = new PlanKamera(s, A.hedef.x, A.hedef.z - 50, 170);
  let secili = null, ok = null;
  const konusAlan = konusCiz(s);
  const bizim = () => s.mangalar.filter(m => m.taraf === 0 && !m.komutan);
  temizle();
  UI.appendChild(el(asamaUst(0)));
  const sol = el(`<div class="yan sol panel"><div><span class="eyebrow">Aşama 1</span><h3>Konuşlanma</h3>
    <p class="ipucu">Bir manga seç, sonra haritada <b>sarı alanda</b> bir yere tıkla. <span class="kbd">Q</span>/<span class="kbd">E</span> yönünü çevirir. <span class="kbd">WASD</span> ve fare tekerleği ile haritada gezin.</p></div>
    <div class="mangalar"></div></div>`);
  const sag = el(`<div class="yan sag panel"><div><span class="eyebrow">İstihbarat</span><h3>${esc(ctx.gorev.ad || s.harita.ad)}</h3>
    <p class="ipucu">${esc(ctx.gorev.brifing || s.harita.tanim)}</p>
    <p class="ipucu"><b>${s.yil}</b> · ${esc(s.hava.ad)} · ${esc(s.saat.ad)} · ${esc(s.iklim.ad)} · Düşman: ${esc(ctx.gorev.dusmanAd || "")}</p></div>
    <div class="puan"><span>Hazırlık puanı<br><span class="ipucu">Her doğru cevap 1 puan</span></span><b class="hp">0</b></div>
    <button class="btn ana soru-btn">İstihbarat raporu oku (soru)</button>
    <div class="secenekler" style="display:grid;gap:6px"></div>
    <div class="kesif ipucu"></div>
    <button class="btn ana ileri" style="margin-top:auto">Aşama 2: Son hazırlık →</button></div>`);
  UI.append(sol, sag);
  const etk = new MangaEtiket(s);
  const ciz = () => {
    const L = sol.querySelector(".mangalar"); L.innerHTML = "";
    bizim().forEach((m, i) => {
      const b = el(`<button class="manga ${m === secili ? "sec" : ""}"><span class="no">${i + 1}</span><span><b>${esc(m.ad)}</b><small>${esc(m.tanim.ad)} · ${m.askerler.length} kişi</small></span>${m.tahkimat ? `<span class="cip iyi">siper</span>` : ""}</button>`);
      b.onclick = () => { secili = m; kam.hedef = {x: m.x, z: m.z}; ciz(); }; L.appendChild(b);
    });
    sag.querySelector(".hp").textContent = ctx.puan;
    const sb = sag.querySelector(".soru-btn"); sb.disabled = ctx.soruKalan <= 0; sb.textContent = ctx.soruKalan > 0 ? `İstihbarat raporu oku (${ctx.soruKalan} soru)` : "Raporların hepsi okundu";
    const S = sag.querySelector(".secenekler"); S.innerHTML = "";
    const sec = (ad, acik, bedel, fn, aktif = true) => { const b = el(`<button class="secenek" ${ctx.puan < bedel || !aktif ? "disabled" : ""}><b>${ad}</b><span class="cip uyari">${bedel} puan</span><span>${acik}</span></button>`); b.onclick = () => { if (ctx.puan < bedel) return; if (fn() !== false) { ctx.puan -= bedel; ses("dogru"); ciz(); } }; S.appendChild(b); };
    for (const k of ["sol", "merkez", "sag"]) if (!ctx.keşif[k]) sec(`Keşif: ${k === "sol" ? "sol kanat" : k === "sag" ? "sağ kanat" : "merkez"}`, "Sis kalkar; o kanattan gelecek düşmanları ve yolunu görürsün.", 1, () => { kesifYap(ctx, k); });
    sec("Tahkimat", secili ? `${secili.ad} için kum torbası siperi: isabet alma şansı düşer, moral daha az sarsılır.` : "Önce bir manga seç.", 1, () => secili ? s.tahkimEt(secili) : false, !!secili && !secili.tahkimat);
    sec("Topçu atış hakkı +1", "Savaşta T tuşu ile istediğin noktaya top ateşi yağdırırsın.", 1, () => { ctx.topcu++; toast(`Topçu atış hakkı: ${ctx.topcu + s.topcuHakki}`); });
    if (s.H.gece) sec("İşaret fişeği +2", "Gece karanlığını aydınlatır, düşmanı görünür kılar.", 1, () => { ctx.fisekEk += 2; });
    const yedek = ctx.ordu.filter(r => !ctx.secili.includes(r) && r.asker > 0);
    if (yedek.length) sec("Ek manga getir", `Yedekten bir manga daha sahaya gelir (${esc(yedek[0].ad)}).`, 2, () => { ekMangaGetir(ctx, yedek[0]); });
    const kesifler = Object.keys(ctx.keşif);
    sag.querySelector(".kesif").innerHTML = kesifler.length ? kesifler.map(k => `<b>${{sol: "Sol kanat", sag: "Sağ kanat", merkez: "Merkez"}[k]}:</b> ${ctx.keşif[k] || "düşman görülmedi"}`).join("<br>") : "Düşmanın hangi kanattan geleceğini henüz bilmiyorsun.";
  };
  ciz();
  sag.querySelector(".soru-btn").onclick = async () => {
    if (ctx.soruKalan <= 0) return; ctx.soruKalan--;
    const ok = await soruSor(1, {baslik: "İstihbarat raporu", odul: "+1 hazırlık puanı", tercih: ctx.tercih});
    if (ok) ctx.puan++; ciz();
  };
  sag.querySelector(".ileri").onclick = () => { motor.ekran(null); konusAlan.removeFromParent(); etk.dispose(); asama2(ctx); };
  motor.ekran({
    guncelle(dt) {
      kam.guncelle(dt); etk.guncelle(motor.kamera, {secili});
      if (secili && !acikModalVar()) {
        if (tus("KeyQ")) s.yerlestir(secili, secili.x, secili.z, secili.yon + dt * 1.5);
        if (tus("KeyE")) s.yerlestir(secili, secili.x, secili.z, secili.yon - dt * 1.5);
      }
      if (G.solTik && G.x > 360 && G.x < innerWidth - 360 && !acikModalVar()) {
        const p = kam.zemin();
        if (p && secili) {
          const k = A.konus;
          if (p.x > k.x0 && p.x < k.x1 && p.z > k.z0 && p.z < k.z1 && !A.derinSu(p.x, p.z)) { s.yerlestir(secili, p.x, p.z, secili.yon); ses("tik"); ciz(); }
          else toast("Mangalar yalnızca sarı konuşlanma alanına yerleşebilir.");
        } else if (p) { // tıklanan yere en yakın mangayı seç
          let en = null, ed = 20; for (const m of bizim()) { const d = Math.hypot(m.x - p.x, m.z - p.z); if (d < ed) { ed = d; en = m; } } if (en) { secili = en; ciz(); }
        }
      }
      for (let i = 1; i <= 9; i++) if (bas("Digit" + i)) { const m = bizim()[i - 1]; if (m) { secili = m; kam.hedef = {x: m.x, z: m.z}; ciz(); } }
      s.E.guncelle(dt); s.H.guncelle(dt, motor.kamera, motor.odak); s.ciz(); s.sancak.userData.dalga(performance.now() / 1000, s.hava.ruzgar);
    },
  });
}
function konusCiz(s) {
  const k = s.A.konus; const g = new THREE.Group();
  const pts = []; const adim = 4;
  const kenar = (x0, z0, x1, z1) => { const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / adim); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; pts.push(new THREE.Vector3(x, s.A.yuzey(x, z) + 0.6, z)); } };
  kenar(k.x0, k.z0, k.x1, k.z0); kenar(k.x1, k.z0, k.x1, k.z1); kenar(k.x1, k.z1, k.x0, k.z1); kenar(k.x0, k.z1, k.x0, k.z0);
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color: "#ffd36b"})));
  s.grup.add(g); return g;
}
function kesifYap(ctx, kanat) {
  const s = ctx.s, rota = s.A.rotalar[kanat];
  for (let i = 0; i < rota.length - 1; i++) s.istihbarat.push({x: rota[i].x, z: rota[i].z, r: 85, t: 999});
  const gelen = (ctx.gorev.dalgalar || []).filter(d => d.kanat === kanat);
  const ad = d => BIRLIKLER[s.turCoz(d.tur)]?.ad || d.tur;
  ctx.keşif[kanat] = gelen.length ? gelen.map(d => `${d.adet} × ${ad(d)} (${Math.round(d.t / 60) || "<1"}. dk)`).join(", ") : (ctx.gorev.sonsuz ? "sürekli saldırı" : "");
  // rota oku
  const pts = []; for (let i = 0; i < rota.length - 1; i++) { const a = rota[i], b = rota[i + 1]; for (let t = 0; t <= 1; t += 0.05) { const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t; pts.push(new THREE.Vector3(x, s.A.yuzey(x, z) + 1, z)); } }
  s.grup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({color: "#ff6b5b", dashSize: 6, gapSize: 4})).computeLineDistances());
  for (let i = 0; i < 4; i++) s.gorunurluk();
  toast(`Keşif kolu döndü: ${ctx.keşif[kanat] || "o kanatta düşman görülmedi."}`, 4200);
}
function ekMangaGetir(ctx, r) {
  const s = ctx.s;
  ctx.secili.push(r);
  const m = s.mangaKur(0, birlikTanimi(r.tur), s.A.hedef.x + (R() - 0.5) * 40, s.A.hedef.z + 15, Math.PI, {kayit: r});
  s.yerlestir(m, m.x, m.z, Math.PI);
  toast(`${r.ad} sahaya geldi.`);
}

// ---------------- AŞAMA 2: SON HAZIRLIK ----------------
function asama2(ctx) {
  const s = ctx.s;
  const bizim = s.mangalar.filter(m => m.taraf === 0 && !m.komutan);
  const kam = new PlanKamera(s, bizim[0] ? bizim[0].x : 0, (bizim[0] ? bizim[0].z : 100) + 4, 26, 1.15);
  let i0 = 0;
  // ekmek dağıtımı
  const tuketim = s.hava.ekmek * (s.iklim.sicaklik === 0 && !K.tek.konserve ? 1.3 : 1);
  ctx.ekmekGerek = Math.ceil(bizim.length * tuketim);
  ctx.ekmekVar = Math.min(K.kaynak.ekmek, ctx.ekmekGerek);
  const tayin = Math.floor(ctx.ekmekVar / tuketim);
  bizim.forEach((m, i) => { m.durum2 = {ekmek: i < tayin, bakim: null, cephane: 1, teftis: false, moralEk: K.moralEk || 0}; s.durumUygula(m, m.durum2); });
  ctx.ekstraTayin = false;
  temizle();
  UI.appendChild(el(asamaUst(1)));
  const sol = el(`<div class="yan sol panel"><div><span class="eyebrow">Aşama 2</span><h3>Son hazırlık</h3>
    <p class="ipucu">Her mangayı teftiş et: doğru cevap verirsen silahlar bakımlı (tutukluk yok), cephane tam ve moral yüksek olur. Yanlışta silahlar aksak kalır. Teftiş etmezsen manga olduğu gibi savaşır.</p></div>
    <div class="ekmek puan"></div><div class="mangalar"></div></div>`);
  const sag = el(`<div class="yan sag panel"><div><span class="eyebrow">Rol</span><h3>Savaşta nasıl oynayacaksın?</h3></div>
    <button class="secenek rol" data-r="asker"><b>Asker (1. şahıs)</b><span>Bir mangada tüfekle savaş. İstediğin an V ile komutana geçebilirsin.</span></button>
    <button class="secenek rol" data-r="komutan"><b>Komutan (3. şahıs)</b><span>Sahada yürüyerek mangalara emir ver. Tab ile taktik harita.</span></button>
    <p class="ipucu">Topçu hakkı: <b>${s.topcuHakki + ctx.topcu}</b>${s.H.gece ? ` · İşaret fişeği: <b>${s.fisek + ctx.fisekEk}</b>` : ""}</p>
    <button class="btn ana basla" style="margin-top:auto">Aşama 3: Savaşa başla! ⚔</button></div>`);
  UI.append(sol, sag);
  const etk = new MangaEtiket(s);
  const rolCiz = () => sag.querySelectorAll(".rol").forEach(b => b.classList.toggle("sec", b.dataset.r === ctx.rol) || (b.style.borderColor = b.dataset.r === ctx.rol ? "var(--pirinc2)" : ""));
  sag.querySelectorAll(".rol").forEach(b => b.onclick = () => { ctx.rol = b.dataset.r; AYAR.kamera = ctx.rol; ayarKaydet(); rolCiz(); });
  rolCiz();
  const ciz = () => {
    const tay = bizim.filter(m => m.ekmek).length;
    sol.querySelector(".ekmek").innerHTML = `<span>Ekmek tayını<br><span class="ipucu">${tay}/${bizim.length} manga tok · stok ${K.kaynak.ekmek} · gereken ${ctx.ekmekGerek}${s.hava.ekmek > 1 ? " (soğuk!)" : ""}</span></span><b>◗ ${tay}/${bizim.length}</b>`;
    if (tay < bizim.length && !ctx.ekstraTayin) { const b = el(`<button class="btn kucuk">Rıza Usta'dan ek tayın (soru)</button>`); b.onclick = async () => { ctx.ekstraTayin = true; const ok = await soruSor(2, {baslik: "Aşevi", odul: "aç kalan mangalara ekmek", tercih: ctx.tercih}); if (ok) { bizim.forEach(m => { if (!m.ekmek) { m.durum2.ekmek = true; s.durumUygula(m, m.durum2); } }); toast("Rıza Usta kazanın dibinden ekmek çıkardı! Herkes tok."); } ciz(); }; sol.querySelector(".ekmek").appendChild(b); }
    const L = sol.querySelector(".mangalar"); L.innerHTML = "";
    bizim.forEach((m, i) => {
      const d = m.durum2;
      const bak = d.bakim === true ? `<span class="cip iyi">bakımlı</span>` : d.bakim === false ? `<span class="cip kotu">aksak</span>` : `<span class="cip">bakım ?</span>`;
      const b = el(`<div class="manga ${i === i0 ? "sec" : ""}"><span class="no">${i + 1}</span><span><b>${esc(m.ad)}</b><small>${esc(m.tanim.ad)} · ${esc(m.silah.ad)}</small></span>
        <button class="btn kucuk tef" ${d.teftis ? "disabled" : ""}>${d.teftis ? "✓" : "Teftiş"}</button>
        <div class="ciplar">${d.ekmek ? `<span class="cip iyi">tok</span>` : `<span class="cip kotu">aç</span>`}${bak}<span class="cip ${d.cephane < 1 ? "uyari" : ""}">cephane %${Math.round(d.cephane * 100)}</span><span class="cip">moral ${Math.round(m.moral)}</span>${m.tahkimat ? `<span class="cip iyi">siper</span>` : ""}</div></div>`);
      b.onclick = e => { i0 = i; kam.hedef = {x: m.x, z: m.z + 4}; if (!e.target.classList.contains("tef")) ciz(); };
      b.querySelector(".tef").onclick = async () => {
        if (d.teftis) return; i0 = i; kam.hedef = {x: m.x, z: m.z + 4};
        const ok = await soruSor(2, {baslik: `Teftiş · ${m.ad}`, odul: "silahlar bakımlı, cephane tam, moral +8", tercih: ctx.tercih});
        d.teftis = true; d.bakim = ok; d.cephane = ok ? 1 : 0.75; d.moralEk = (K.moralEk || 0) + (ok ? 8 : -3); s.durumUygula(m, d); ciz();
      };
      L.appendChild(b);
    });
  };
  ciz();
  sag.querySelector(".basla").onclick = () => {
    const teftissiz = bizim.filter(m => !m.durum2.teftis).length;
    K.kaynak.ekmek = Math.max(0, K.kaynak.ekmek - Math.min(ctx.ekmekGerek, ctx.ekmekVar)); kaydet();
    if (teftissiz) toast(`${teftissiz} manga teftiş edilmeden savaşa giriyor.`);
    motor.ekran(null); etk.dispose(); asama3(ctx);
  };
  motor.ekran({guncelle(dt) {
    kam.guncelle(dt); etk.guncelle(motor.kamera, {secili: bizim[i0]});
    // askerler hazırlık pozunda
    for (const m of bizim) for (const a of m.askerler) { a.t += dt; if (!a.arac) a.poz = m.durum2.teftis ? (m.durum2.bakim ? "selam" : "dur") : "dur"; a.y = s.A.yuzey(a.x, a.z); if (a.at) { a.atli = true; a.poz = "ata"; a.at.t += dt; } }
    s.E.guncelle(dt); s.H.guncelle(dt, motor.kamera, motor.odak); s.ciz(); s.sancak.userData.dalga(performance.now() / 1000, s.hava.ruzgar);
  }});
}

// ---------------- AŞAMA 3: SAVAŞ ----------------
function asama3(ctx) {
  const s = ctx.s;
  temizle();
  s.topcuHakki += ctx.topcu; s.fisek += ctx.fisekEk;
  if (K.tek && K.tek.telefon && s.mangalar.some(m => m.taraf === 0 && m.tanim.ozel?.telefon)) s.topcuHakki += 2;
  s.tahkimatKapak();
  s.A.sis.u.sisGuc.value = 0.8;
  s.duraklat = false;
  for (const m of s.mangalar) if (m.taraf === 0) { m.emir = {tur: "tut"}; for (const a of m.askerler) if (a.at && !m.tanim.ozel?.inip_savasir) a.atli = true; if (m.tanim.ozel?.inip_savasir) for (const a of m.askerler) a.atli = false; }
  const o = new Oyuncu(motor, s, ctx.rol); ctx.o = o;
  const hud = new Hud(motor, s, o); ctx.hud = hud;
  UI.appendChild(el(`<div class="istem panel" id="kilit-istem">Oyuna başlamak için ekrana tıkla · <span class="kbd">Esc</span> fareyi bırakır</div>`));
  borazan("hucum");
  s.mesaj("Savaş başladı! Mevzileri tutun!", "uyari");
  let bitisT = -1;
  motor.savasBitti = (sonuc) => {
    ctx.sonuc = sonuc; bitisT = 4.5;
    hud.buyuk(`${sonuc.zafer ? "ZAFER" : "YENİLGİ"}<br><span style="font-size:20px">${esc(sonuc.neden)}</span>`);
  };
  motor.ekran({
    guncelle(dt) {
      const ki = document.getElementById("kilit-istem"); if (ki) ki.hidden = G.kilitli || o.mod === "taktik" || s.bitti;
      if (bas("Escape") || bas("KeyP")) {}
      o.guncelle(dt);
      motor.odak = o.mod === "asker" && o.asker ? o.asker : s.komutan;
      for (let k = 0; k < (window.__hiz || 1); k++) s.guncelle(dt);
      if (window.__kam) { const c = window.__kam; motor.kamera.position.set(c[0], c[1], c[2]); motor.kamera.lookAt(c[3], c[4], c[5]); }
      hud.guncelle(dt);
      if (bitisT > 0) { bitisT -= dt; if (bitisT <= 0) { hud.buyuk(""); asama4(ctx); } }
    },
    bitir() {},
  });
}

// ---------------- AŞAMA 4: GANİMET ----------------
function asama4(ctx) {
  const s = ctx.s, o = ctx.o, hud = ctx.hud, z = ctx.sonuc.zafer;
  if (o.mod !== "komutan") o.komutanOl();
  o.ganimet = true; s.ganimetModu = true;
  if (s.komutan.olu) { s.komutan.olu = false; s.komutan.can = 80; }
  s.A.sis.u.sisGuc.value = 0.25;
  // düşmanlar çekilir / kaybolur
  for (const a of s.askerler) if (a.taraf === 1 && !a.olu) { a.durum = "gizli"; }
  // sandıklar: düşman ölü kümelerinden
  const yer = s.ist.olumYer.slice(); const sandiklar = [];
  const adet = Math.min(z ? 6 : 3, Math.max(2, Math.ceil(yer.length / 4)));
  for (let i = 0; i < adet; i++) {
    let p = yer.length ? yer.splice((R() * yer.length) | 0, 1)[0] : {x: s.A.hedef.x + (R() - 0.5) * 80, z: s.A.hedef.z - 30 - R() * 60};
    if (!z) p = {x: s.A.hedef.x + (R() - 0.5) * 60, z: s.A.hedef.z + (R() - 0.5) * 40};
    sandiklar.push({x: p.x + (R() - 0.5) * 3, z: p.z + (R() - 0.5) * 3, tur: "sandik"});
  }
  if (yanlisVar() || R() < 0.5) { const p = sandiklar[0] || {x: 0, z: 0}; sandiklar.push({x: p.x + 8, z: p.z - 6, tur: "ozel"}); }
  const yarali = s.ist.bizOlumYer.filter(p => p.yarali).slice(0, 6).map(p => ({...p, tur: "yarali"}));
  const hepsi = [...sandiklar, ...yarali];
  for (const h of hepsi) {
    const y = s.A.yuzey(h.x, h.z);
    if (h.tur === "yarali") { h.obj = N.sancak(["#f2f2f2", "#c8102e", "#f2f2f2"], 2.2); h.obj.scale.set(0.6, 0.6, 0.6); }
    else h.obj = N.sandik(h.tur === "ozel" ? "#5a3a20" : "#7a5634", h.tur === "ozel");
    h.obj.position.set(h.x, y, h.z); s.grup.add(h.obj); h.acik = false;
  }
  ctx.ganimet = {}; ctx.kurtarilan = {}; ctx.kurtarilanSayi = 0;
  hud.q(".silah").hidden = true; hud.q("#minimap").hidden = true; hud.q(".mesajlar").style.top = "12px"; hud.q(".mesajlar").style.right = "370px";
  temizle(); UI.appendChild(hud.k); UI.appendChild(hud.etiket.kok); UI.appendChild(el(asamaUst(3)));
  const sag = el(`<div class="yan sag panel"><div><span class="eyebrow">Aşama 4</span><h3>${z ? "Ganimet ve yaralılar" : "Geri çekilme"}</h3>
    <p class="ipucu">${z ? "Savaş alanında yürü; sandığa ya da yaralıya yaklaşınca <span class='kbd'>E</span>. Her doğru cevap bir sandığı açar ya da bir yaralıyı kurtarır." : "Çekilmeden önce yakındaki sandıkları ve yaralıları topla."} Listeden de seçebilirsin.</p></div>
    <div class="liste mangalar"></div><div class="toplam ipucu"></div>
    <button class="btn ana don" style="margin-top:auto">Kampa dön →</button></div>`);
  UI.appendChild(sag);
  const istem = el(`<div class="istem panel" hidden></div>`); UI.appendChild(istem);
  const ac = async (h) => {
    if (h.acik || acikModalVar()) return;
    const ozel = h.tur === "ozel";
    const ok = await soruSor(4, {baslik: h.tur === "yarali" ? "Yaralı tahliyesi" : ozel ? "Özel ganimet sandığı" : "Ganimet sandığı", odul: h.tur === "yarali" ? "yaralı asker kurtarılır" : ozel ? "büyük ganimet" : "sandık açılır", tercih: ozel ? "yanlis" : ctx.tercih});
    if (ok === null) return;
    h.acik = true;
    if (!ok) { toast(h.tur === "yarali" ? "Yaralıyı taşıyamadık; revire sedyeyle geç ulaşacak." : "Sandığın kilidi açılmadı."); h.obj.traverse(x => { if (x.material) { x.material = x.material.clone(); x.material.color.multiplyScalar(0.5); } }); listeCiz(); return; }
    if (h.tur === "yarali") { ctx.kurtarilanSayi++; if (h.m) ctx.kurtarilan[h.m] = (ctx.kurtarilan[h.m] || 0) + 1; toast("Yaralı kurtarıldı; mangasına dönüyor."); ses("dogru"); h.obj.visible = false; }
    else {
      const g = ganimetCek(ozel, s.yil);
      for (const [k, v] of Object.entries(g)) ctx.ganimet[k] = (ctx.ganimet[k] || 0) + v;
      if (h.obj.userData.kapak) h.obj.userData.kapak.rotation.x = -1.9;
      ses("sandik"); toast("Sandıktan çıkan: " + Object.entries(g).map(([k, v]) => `${KAYNAK[k].simge} ${v} ${KAYNAK[k].ad.toLowerCase()}`).join(" · "));
    }
    listeCiz();
  };
  const listeCiz = () => {
    const L = sag.querySelector(".liste"); L.innerHTML = "";
    hepsi.forEach(h => {
      const d = Math.round(Math.hypot(h.x - s.komutan.x, h.z - s.komutan.z));
      const b = el(`<button class="manga" ${h.acik ? "disabled" : ""}><span class="no">${h.tur === "yarali" ? "✚" : h.tur === "ozel" ? "★" : "▣"}</span><span><b>${h.tur === "yarali" ? "Yaralı asker" : h.tur === "ozel" ? "Özel sandık" : "Ganimet sandığı"}</b><small>${h.acik ? "tamam" : d + " m"}</small></span></button>`);
      b.onclick = () => ac(h); L.appendChild(b);
    });
    sag.querySelector(".toplam").innerHTML = `Toplanan: ${Object.entries(ctx.ganimet).map(([k, v]) => `${KAYNAK[k].simge} ${v}`).join(" · ") || "—"} · Kurtarılan yaralı: ${ctx.kurtarilanSayi}`;
  };
  listeCiz();
  let listeT = 0;
  sag.querySelector(".don").onclick = () => bitirGorev(ctx);
  motor.ekran({guncelle(dt) {
    o.guncelle(dt); motor.odak = s.komutan;
    s.guncelle(dt); hud.guncelle(dt);
    let en = null, ed = 4;
    for (const h of hepsi) if (!h.acik) { const d = Math.hypot(h.x - s.komutan.x, h.z - s.komutan.z); if (d < ed) { ed = d; en = h; } }
    istem.hidden = !en; if (en) istem.innerHTML = `<span class="kbd">E</span> ${en.tur === "yarali" ? "Yaralıyı kurtar" : "Sandığı aç"}`;
    if (en && bas("KeyE")) ac(en);
    listeT -= dt; if (listeT <= 0) { listeT = 0.5; if (!acikModalVar()) listeCiz(); }
  }});
}
function ganimetCek(ozel, yil) {
  const k = ozel ? 3 : 1, r = () => R();
  const g = {altin: Math.round((15 + r() * 25) * k), demir: Math.round((4 + r() * 10) * k), barut: Math.round((4 + r() * 10) * k)};
  if (r() < 0.6) g.un = Math.round((3 + r() * 6) * k);
  if (r() < 0.25) g.at = 1 + Math.round(r() * k);
  if (yil >= 1900 && r() < 0.4) g.yakit = Math.round((3 + r() * 6) * k);
  if (ozel) g.san = 5;
  return g;
}

// ---------------- SONUÇ ----------------
async function bitirGorev(ctx) {
  const s = ctx.s, sn = ctx.sonuc;
  const rapor = sonucUygula(ctx);
  kilitBirak();
  const m = modal(`<span class="eyebrow">Savaş raporu</span><h2>${sn.zafer ? "Zafer" : "Yenilgi"} · ${esc(ctx.gorev.ad || s.harita.ad)}</h2>
    <p>${esc(sn.neden)}</p>
    <table class="tablo"><tr><th>Düşen düşman</th><th>Kayıp</th><th>Kurtarılan yaralı</th><th>Süre</th></tr>
    <tr><td>${sn.dusen}</td><td>${sn.kayip}</td><td>${ctx.kurtarilanSayi}</td><td>${Math.floor(sn.zaman / 60)} dk ${Math.floor(sn.zaman % 60)} sn</td></tr></table>
    ${rapor}
    <div class="alt"><button class="btn ana tamam">${ctx.kalici ? "Kampa dön" : "Ana menüye dön"}</button></div>`, {kapat: false});
  m.querySelector(".tamam").onclick = async () => {
    m.kapat();
    await gecis(() => { if (ctx.hud) ctx.hud.dispose(); if (ctx.o) ctx.o.dispose(); s.dispose(); motor.efekt = null; motor.savasBitti = null; temizle(); ctx.donus && ctx.donus(sn); });
  };
}
function sonucUygula(ctx) {
  const s = ctx.s, sn = ctx.sonuc, z = sn.zafer;
  let html = "";
  if (!ctx.kalici) {
    if (ctx.gorev.skorAnahtar) { const sk = sn.dusen * 10 + (z ? 500 : 0) + (sn.seviye || 0) * 100 - sn.kayip * 3; const eski = +(localStorage.getItem(ctx.gorev.skorAnahtar) || 0); if (sk > eski) localStorage.setItem(ctx.gorev.skorAnahtar, sk); html += `<p>Skor: <b>${sk}</b> (en iyi: ${Math.max(sk, eski)})</p>`; }
    return html;
  }
  // önceki görevin yaralıları revirden döner
  for (const r of K.ordu) { if (r.revir) { r.asker = Math.min(r.boy, r.asker + r.revir); r.revir = 0; } }
  for (const r of ctx.secili) {
    const m = r._m; if (!m) continue;
    const olen = m.kayipSayi;
    const yarali = s.ist.bizOlumYer.filter(p => p.m === r.id && p.yarali).length;
    const kurt = ctx.kurtarilan[r.id] || 0;
    r.asker = Math.max(0, r.asker - olen + kurt);
    r.revir = Math.max(0, yarali - kurt);
    r.tecrube = (r.tecrube || 0) + 1 + (z ? 1 : 0);
  }
  K.ordu = K.ordu.filter(r => r.asker > 0 || r.revir > 0);
  const kazanc = {...ctx.ganimet};
  const b = ctx.gorev.bolumId ? BOLUMLER.find(x => x.id === ctx.gorev.bolumId) : null;
  if (z && b) for (const [k, v] of Object.entries(b.odul || {})) kazanc[k] = (kazanc[k] || 0) + v;
  kazanc.san = (kazanc.san || 0) + Math.round(sn.dusen / 3) + (z ? 10 : 2);
  if (K.tek.demiryolu) { kazanc.altin = (kazanc.altin || 0) + 20; kazanc.un = (kazanc.un || 0) + 10; kazanc.barut = (kazanc.barut || 0) + 6; }
  if (K.tek.at_yetistirme) kazanc.at = (kazanc.at || 0) + 2;
  kazanc.altin = (kazanc.altin || 0) + 30; // maaş/ödenek
  ekle(kazanc);
  // fırın: undan ekmek
  const firin = 6 + (K.tek.firin2 ? 4 : 0) + (K.firin - 1) * 4;
  const pis = Math.min(K.kaynak.un, firin); K.kaynak.un -= pis; K.kaynak.ekmek += pis;
  const arast = arastirmaBitir();
  K.moralEk = 0; K.pistiBu = false;
  K.gorevSayisi++; K.istatistik[z ? "zafer" : "yenilgi"]++; K.istatistik.dusen += sn.dusen; K.istatistik.kayip += sn.kayip;
  K.rutbe = Math.min(7, Math.floor(K.istatistik.zafer / 1.3));
  if (z && b) { K.bolum = Math.max(K.bolum, BOLUMLER.indexOf(b) + 1); K.olay = b.sonra || null; }
  else K.olay = R() < 0.6 ? RASTGELE_OLAYLAR[(R() * RASTGELE_OLAYLAR.length) | 0] : null;
  kaydet();
  html += `<p><b>Kazanç:</b> ${Object.entries(kazanc).filter(([, v]) => v).map(([k, v]) => `${KAYNAK[k].simge} ${v} ${KAYNAK[k].ad.toLowerCase()}`).join(" · ")}</p>
    <p><b>Fırın:</b> ${pis} ekmek pişti (un ${K.kaynak.un} kaldı, ekmek ${K.kaynak.ekmek}).</p>
    ${arast ? `<p><b>Harp Okulu:</b> “${esc(arast)}” araştırması tamamlandı!</p>` : ""}
    <p class="soluk">Revire giden yaralılar bir sonraki görevden sonra mangalarına dönecek.</p>`;
  return html;
}
