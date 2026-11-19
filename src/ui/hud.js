// Savaş göstergeleri: bilgi, mini harita (savaş sisi ile), manga kartları, mesajlar, silah, nişangâh.
import {esc, el} from "./arayuz.js";
import {bas} from "../girdi.js";
import {MangaEtiket} from "./etiket.js";
import {DIZILIS} from "../savas/savas.js";

export class Hud {
  constructor(motor, savas, oyuncu) {
    this.s = savas; this.o = oyuncu; this.motor = motor;
    this.k = el(`<div id="hud">
      <div class="hasar"></div><div class="durbun" hidden></div>
      <div class="ust"><div class="bilgi panel"></div></div>
      <div class="ilerleme panel" hidden><div>SANCAK TEHLİKEDE</div><div class="cubuk"><i></i></div></div>
      <canvas id="minimap" width="210" height="210"></canvas>
      <div class="mesajlar"></div>
      <div class="kartlar"></div><div class="komutanlar"></div>
      <div class="silah panel"></div>
      <div class="nisangah"></div><div class="tik"></div>
      <div class="yardim panel" hidden></div>
      <div class="buyuk" hidden></div>
    </div>`);
    document.getElementById("ui").appendChild(this.k);
    this.q = s => this.k.querySelector(s);
    this.mm = this.q("#minimap").getContext("2d");
    this.t = 0; this.yardimAcik = true; this.yardimT = 14;
    motor.onMesaj = (t, tur) => this.mesaj(t, tur);
    motor.isabetIsareti = (oldu) => { const n = this.q(".nisangah"); n.classList.add("isabet"); clearTimeout(this._it); this._it = setTimeout(() => n.classList.remove("isabet"), oldu ? 260 : 120); };
    motor.durbun = d => { this.q(".durbun").hidden = !d; };
    this.kartlarKur();
    this.etiket = new MangaEtiket(savas);
    this.komutanKur();
    motor.yeniManga = () => this.kartlarKur();
  }
  komutanKur() {
    const k = this.q(".komutanlar"); k.innerHTML = "";
    this.s.yardimci.forEach((Y, i) => {
      const b = el(`<button class="kbtn"><span class="kyuz" style="background:${Y.k.renk}">${esc(Y.k.ini)}</span><span><b>${esc(Y.y.ad)}</b><span class="dur">${esc(Y.k.ad)}</span> · <span class="kbd">${i ? "M" : "N"}</span></span><i class="bek"></i></button>`);
      b.onclick = () => this.s.yetenek(i, this.o.hedefNokta, this.o.seciliManga()); b.title = Y.y.aciklama; k.appendChild(b); Y._btn = b;
    });
  }
  mesaj(t, tur = "bilgi") {
    const k = this.q(".mesajlar"); const m = el(`<div class="mesaj ${tur}">${esc(t)}</div>`); k.prepend(m);
    while (k.children.length > 6) k.lastChild.remove();
    setTimeout(() => m.remove(), 7000);
  }
  kartlarKur() {
    const k = this.q(".kartlar"); k.innerHTML = "";
    this.o.bizMangalar().forEach((m, i) => { const c = el(`<button class="kart"><b>${i + 1} · ${esc(m.ad)}</b><span class="d"></span><div class="cubuk"><i></i></div><div class="cubuk moral"><i></i></div></button>`); c.onclick = () => this.o.sec(i); k.appendChild(c); m._kart = c; });
  }
  guncelle(dt) {
    const s = this.s, o = this.o;
    this.t -= dt;
    // hasar flaşı ve sarsıntı
    this.motor.hasarFlas = Math.max(0, (this.motor.hasarFlas || 0) - dt * 1.2);
    this.q(".hasar").style.opacity = this.motor.hasarFlas;
    this.motor.sarsinti = Math.max(0, (this.motor.sarsinti || 0) - dt * 1.5);
    if (o.mod === "asker" || s.bitti && !o.ganimet) this.etiket.gizle(); else this.etiket.guncelle(this.motor.kamera, {dus: o.mod === "taktik", secili: o.seciliManga()});
    if (bas("F1") || bas("Slash")) { this.yardimAcik = !this.yardimAcik; this.yardimT = 999; }
    this.yardimT -= dt;
    if (this.t > 0) return; this.t = 0.12;
    // üst bilgi
    const kalan = s.sonsuz ? `Dalga ${s.sonsuzSeviye}` : (s.dalgaI < s.dalgalar.length ? `Sonraki saldırı: ${Math.max(0, Math.ceil(s.dalgalar[s.dalgaI].t - s.zaman))} sn` : `Son saldırı yolda`);
    const dk = Math.floor(s.zaman / 60), sn = Math.floor(s.zaman % 60);
    this.q(".bilgi").innerHTML = `<b>${esc(s.g.ad || s.harita.ad)}</b> <span class="mono soluk">${s.yil}</span><br>
      ${esc(s.hava.ad)} · ${esc(s.saat.ad)} · ${esc(s.iklim.ad)}<br>
      <span class="mono">${String(dk).padStart(2, "0")}:${String(sn).padStart(2, "0")}</span> · ${kalan}<br>
      Düşen düşman <b style="font-size:14px">${s.ist.dusen}</b> · Kaybımız ${s.ist.kayip}<br>
      Topçu hakkı <b style="font-size:14px">${s.topcuHakki}</b>${s.H.gece ? ` · Fişek ${s.fisek}` : ""}`;
    // ele geçirme
    const il = this.q(".ilerleme"); il.hidden = s.hedefIlerleme <= 0; il.querySelector("i").style.width = s.hedefIlerleme + "%";
    // kartlar
    const sec = o.seciliManga();
    for (const m of o.bizMangalar()) {
      const c = m._kart; if (!c) continue;
      const canli = m.askerler.filter(a => !a.olu).length;
      c.classList.toggle("sec", m === sec); c.classList.toggle("bozuk", m.bozuk); c.classList.toggle("yok", !canli);
      const emir = m.bozuk ? "BOZUK" : {tut: "mevzide", git: "ilerliyor", hucum: "HÜCUM", geri: "çekiliyor", kac: "kaçıyor"}[m.emir.tur] || "";
      c.querySelector(".d").textContent = `${canli} kişi · ${(m.top || m.mg) ? emir : (DIZILIS[m.dizilis] || DIZILIS.hat).ad.toLowerCase() + " · " + emir}`;
      const ics = c.querySelectorAll(".cubuk i");
      ics[0].style.width = (canli / Math.max(1, m.baslangicBoy) * 100) + "%"; ics[1].style.width = Math.max(0, m.moral) + "%";
    }
    // yardımcı komutanlar
    for (const Y of this.s.yardimci) { const b = Y._btn; if (!b) continue; b.disabled = Y.a.olu || s.bitti; b.classList.toggle("hazir", Y.hazir <= 0 && !Y.a.olu); b.querySelector(".bek").style.width = (Y.hazir > 0 ? 100 - Y.hazir / Y.y.bekleme * 100 : 100) + "%"; b.querySelector(".dur").textContent = Y.a.olu ? "yaralandı" : Y.hazir > 0 ? `${Math.ceil(Y.hazir)} sn` : "hazır"; }
    // silah
    const sw = this.q(".silah");
    if (o.mod === "asker" && o.asker && !o.asker.olu) {
      const a = o.asker, w = a.silahW || a.manga.silah;
      const durum = a.tutuk > 0 ? "TUTUKLUK" : a.dolum > 0 ? "dolduruluyor…" : "";
      sw.hidden = false;
      sw.innerHTML = `<span class="eyebrow">${esc(w.ad)}</span><br><b>${o.vmTip === "kilic" ? "⚔" : `${Math.max(0, a.sarjor)} / ${a.mermi}`}</b><br><span class="mono soluk">${durum}${o.bombalar ? ` · bomba ${o.bombalar}` : ""} · can ${Math.max(0, Math.round(a.can))}</span>`;
    } else if (o.mod === "komutan") {
      sw.hidden = false;
      sw.innerHTML = `<span class="eyebrow">Komutan</span><br><b>${sec ? esc(sec.ad) : "—"}</b><br><span class="mono soluk">${sec ? `${sec.tanim.ad} · moral ${Math.round(sec.moral)}` : ""}</span>`;
    } else sw.hidden = true;
    this.q(".nisangah").hidden = o.mod === "taktik" || o.oluT > 0 || o.durbun;
    // yardım
    const y = this.q(".yardim"); y.hidden = !(this.yardimAcik && this.yardimT > 0) || s.bitti;
    if (!y.hidden) y.innerHTML = o.mod === "asker"
      ? `<b>Asker</b> · <span class="kbd">WASD</span> yürü · <span class="kbd">Shift</span> koş · <span class="kbd">C</span> diz çök · <span class="kbd">Sol tık</span> ateş · <span class="kbd">Sağ tık</span> nişan · <span class="kbd">R</span> doldur · <span class="kbd">1</span>/<span class="kbd">2</span>/<span class="kbd">3</span> tüfek/tabanca/kılıç · <span class="kbd">Q</span> süngü · <span class="kbd">G</span> bomba · <span class="kbd">T</span> topçu · <span class="kbd">F</span> fişek · <span class="kbd">B</span> borazan · <span class="kbd">V</span> komutana geç · <span class="kbd">Tab</span> taktik harita · <span class="kbd">F1</span> yardım`
      : `<b>Komutan</b> · <span class="kbd">1–9</span> manga seç · <span class="kbd">Sağ tık</span> oraya git (<span class="kbd">Shift</span> koşarak) · <span class="kbd">G</span> hücum / top hedefi · <span class="kbd">H</span> mevzini tut · <span class="kbd">X</span> geri çekil · düzen: <span class="kbd">Z</span> hat <span class="kbd">C</span> kare <span class="kbd">K</span> kol <span class="kbd">J</span> dağınık · <span class="kbd">T</span> topçu ateşi · <span class="kbd">F</span> fişek · <span class="kbd">B</span> borazan · <span class="kbd">Sol tık</span> tabanca · <span class="kbd">V</span> askere geç · <span class="kbd">Tab</span> taktik harita · <span class="kbd">F1</span> yardım`;
    const tk = this.q(".tik"); tk.textContent = o.mod === "taktik" ? "" : (o.mod === "komutan" && sec ? sec.ad : "");
    this.miniHarita();
  }
  miniHarita() {
    const s = this.s, c = this.mm, W = 210, S = s.A.S, k = W / S;
    const P = (x, z) => [(x + S / 2) * k, (z + S / 2) * k];
    // zemin: sis dokusundan
    if (!this._img) this._img = c.createImageData(96, 96);
    const v = s.A.sis.veri, img = this._img.data;
    for (let i = 0; i < 96 * 96; i++) { const g = v[i] / 255; img[i * 4] = 40 + 60 * g; img[i * 4 + 1] = 44 + 70 * g; img[i * 4 + 2] = 34 + 40 * g; img[i * 4 + 3] = 255; }
    if (!this._tmp) { this._tmp = document.createElement("canvas"); this._tmp.width = this._tmp.height = 96; }
    this._tmp.getContext("2d").putImageData(this._img, 0, 0);
    c.imageSmoothingEnabled = true; c.drawImage(this._tmp, 0, 0, W, W);
    // su
    if (s.A.suSeviye !== null && !this._su) { this._su = []; for (let j = 0; j < 52; j++) for (let i = 0; i < 52; i++) { const x = (i + 0.5) / 52 * S - S / 2, z = (j + 0.5) / 52 * S - S / 2; if (s.A.suda(x, z)) this._su.push([i, j]); } }
    if (this._su) { c.fillStyle = "rgba(70,120,150,.6)"; for (const [i, j] of this._su) c.fillRect(i * W / 52, j * W / 52, W / 52 + 0.5, W / 52 + 0.5); }
    // hedef
    const [hx, hz] = P(s.A.hedef.x, s.A.hedef.z);
    c.strokeStyle = "#e0bf6a"; c.lineWidth = 1.5; c.beginPath(); c.arc(hx, hz, s.A.hedef.r * k, 0, 7); c.stroke();
    // birlikler
    for (const m of s.mangalar) {
      if (m.cx === undefined || m.yokOldu) continue;
      if (m.taraf === 1 && !m.askerler.some(a => a.gorunur && !a.olu)) continue;
      const [x, z] = P(m.cx, m.cz);
      c.fillStyle = m.taraf === 0 ? (m.bozuk ? "#e0bf6a" : m.komutan ? "#fff" : "#7fd3ff") : "#ff6b5b";
      if (m.atli) { c.beginPath(); c.moveTo(x, z - 4); c.lineTo(x + 4, z + 3); c.lineTo(x - 4, z + 3); c.fill(); }
      else if (m.top || m.mg) { c.beginPath(); c.arc(x, z, 3.5, 0, 7); c.fill(); }
      else c.fillRect(x - 3, z - 3, 6, 6);
      if (m === this.o.seciliManga()) { c.strokeStyle = "#fff"; c.strokeRect(x - 5, z - 5, 10, 10); }
    }
    // oyuncu
    const a = this.o.mod === "asker" ? this.o.asker : s.komutan;
    if (a) { const [x, z] = P(a.x, a.z); c.save(); c.translate(x, z); c.rotate(-(this.o.yaw) + Math.PI); c.fillStyle = "#fff"; c.beginPath(); c.moveTo(0, -6); c.lineTo(4, 4); c.lineTo(-4, 4); c.fill(); c.restore(); }
  }
  buyuk(m) { const b = this.q(".buyuk"); b.innerHTML = m; b.hidden = !m; }
  dispose() { this.k.remove(); this.etiket.dispose(); this.motor.onMesaj = null; }
}
