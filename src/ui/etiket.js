// Manga etiketleri: plan, komutan ve taktik görünümlerinde mangaların üstünde ad ve durum.
import * as THREE from "three";
import {esc} from "./arayuz.js";

export class MangaEtiket {
  constructor(savas) { this.s = savas; this.el = new Map(); this.v = new THREE.Vector3(); this.kok = document.createElement("div"); document.getElementById("ui").appendChild(this.kok); }
  guncelle(kamera, {dost = true, dus = false, secili = null, sirala = null} = {}) {
    const s = this.s, gor = new Set();
    const bizim = s.mangalar.filter(m => m.taraf === 0 && !m.komutan);
    for (const m of s.mangalar) {
      if (m.yokOldu) continue;
      const biz = m.taraf === 0;
      if (biz && (!dost || m.komutan)) continue;
      if (!biz && (!dus || !m.askerler.some(a => a.gorunur && !a.olu))) continue;
      const x = m.cx ?? m.x, z = m.cz ?? m.z;
      this.v.set(x, s.A.yuzey(x, z) + (m.atli ? 4.5 : 3.4), z);
      const d = this.v.distanceTo(kamera.position);
      this.v.project(kamera);
      if (this.v.z > 1 || Math.abs(this.v.x) > 1.05 || Math.abs(this.v.y) > 1.05 || d > 700) continue;
      gor.add(m.id);
      let e = this.el.get(m.id);
      if (!e) { e = document.createElement("div"); e.className = "etiket"; this.kok.appendChild(e); this.el.set(m.id, e); }
      e.className = "etiket " + (biz ? "dost" : "dus") + (m === secili ? " sec" : "");
      const no = biz ? bizim.indexOf(m) + 1 : "";
      const html = biz ? `<b>${no}</b> ${esc(m.ad)}${m.bozuk ? " · <span style='color:#f0a39a'>BOZUK</span>" : ""}` : `${esc(m.tanim.ad)}${m.bozuk ? " · kaçıyor" : ""}`;
      if (e._h !== html) { e.innerHTML = html; e._h = html; }
      e.style.left = ((this.v.x + 1) / 2 * innerWidth) + "px"; e.style.top = ((1 - this.v.y) / 2 * innerHeight) + "px";
      e.style.display = "";
    }
    for (const [id, e] of this.el) if (!gor.has(id)) e.style.display = "none";
  }
  gizle() { for (const e of this.el.values()) e.style.display = "none"; }
  dispose() { this.kok.remove(); this.el.clear(); }
}
