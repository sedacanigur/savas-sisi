// Gökyüzü, ışık, sahne sisi, yağmur/kar, şimşek ve işaret fişekleri.
import * as THREE from "three";

export function havaKur(sahne, {hava, saat, iklim, gecePuslu = false}) {
  const grup = new THREE.Group(); sahne.add(grup);
  const ufukRenk = new THREE.Color(saat.gok[0]), tepeRenk = new THREE.Color(saat.gok[1]);
  // bulut/hava gökyüzünü griye çeker
  const gri = new THREE.Color("#8f969c");
  ufukRenk.lerp(gri, hava.bulut * 0.55); tepeRenk.lerp(gri.clone().multiplyScalar(saat.isik), hava.bulut * 0.6);
  if (hava.yagis === "kar") { ufukRenk.lerp(new THREE.Color("#c9cfd5"), 0.4); }
  const gok = new THREE.Mesh(new THREE.SphereGeometry(1400, 24, 12), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {u: {value: ufukRenk}, t: {value: tepeRenk}},
    vertexShader: "varying vec3 p; void main(){ p = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader: "uniform vec3 u; uniform vec3 t; varying vec3 p; void main(){ float h = normalize(p).y; gl_FragColor = vec4(mix(u, t, smoothstep(-0.05, 0.5, h)), 1.0); }",
  }));
  gok.renderOrder = -10; grup.add(gok);
  // sis
  sahne.fog = new THREE.FogExp2(ufukRenk.clone(), hava.sisYog * (saat.gunes < 0 ? 1.5 : 1));
  sahne.background = ufukRenk.clone();
  // ışıklar
  const L = saat.isik * (1 - hava.bulut * 0.35);
  const hemi = new THREE.HemisphereLight(tepeRenk.clone().lerp(new THREE.Color("#ffffff"), 0.5), new THREE.Color(iklim.zemin[0]).multiplyScalar(0.6), 0.55 * L + 0.15);
  grup.add(hemi);
  const gunes = new THREE.DirectionalLight(saat.renk, 1.6 * L);
  const yuk = Math.max(8, Math.abs(saat.gunes)) * Math.PI / 180;
  const gunesYon = new THREE.Vector3(Math.cos(yuk) * 0.6, Math.sin(yuk), Math.cos(yuk) * 0.8).normalize();
  gunes.castShadow = true;
  gunes.shadow.mapSize.set(2048, 2048);
  const sc = gunes.shadow.camera; sc.left = -90; sc.right = 90; sc.top = 90; sc.bottom = -90; sc.near = 1; sc.far = 500;
  gunes.shadow.bias = -0.0008; gunes.shadow.normalBias = 0.6;
  grup.add(gunes, gunes.target);
  // gece: ay ışığı ve yıldızlar
  if (saat.gunes < 0) {
    const yp = []; for (let i = 0; i < 900; i++) { const t = Math.random() * Math.PI * 2, f = Math.random() * 1.3; yp.push(Math.cos(t) * Math.cos(f) * 1300, Math.sin(f) * 1300 + 30, Math.sin(t) * Math.cos(f) * 1300); }
    const yg = new THREE.BufferGeometry(); yg.setAttribute("position", new THREE.Float32BufferAttribute(yp, 3));
    if (hava.bulut < 0.8) grup.add(new THREE.Points(yg, new THREE.PointsMaterial({color: "#dfe6ff", size: 2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 * (1 - hava.bulut)})));
  }
  // yağış
  let yagis = null; const YN = hava.yagis === "kar" ? 5000 : 7000;
  if (hava.yagis) {
    const p = new Float32Array(YN * 3); for (let i = 0; i < YN; i++) { p[i * 3] = (Math.random() - 0.5) * 120; p[i * 3 + 1] = Math.random() * 60; p[i * 3 + 2] = (Math.random() - 0.5) * 120; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const m = hava.yagis === "kar"
      ? new THREE.PointsMaterial({color: "#ffffff", size: 0.18, transparent: true, opacity: 0.9, depthWrite: false})
      : new THREE.PointsMaterial({color: "#aeb9c6", size: 0.09, transparent: true, opacity: 0.6, depthWrite: false});
    yagis = new THREE.Points(g, m); yagis.frustumCulled = false; grup.add(yagis);
  }
  const ruzgar = new THREE.Vector2(Math.cos(1.1), Math.sin(1.1)).multiplyScalar(hava.ruzgar);
  // fişekler
  const fisekler = [];
  const fisekMat = new THREE.MeshBasicMaterial({color: "#fff3c4"});
  const fisekGeo = new THREE.SphereGeometry(0.35, 8, 6);
  let simsekT = 0, simsekBekle = 6 + Math.random() * 10;
  const H = {
    gunes, hemi, ruzgar, grup, gece: saat.gunes < 0, temelIsik: hemi.intensity,
    fisekAt(x, z, yer) {
      const isik = new THREE.PointLight("#fff1c0", 0, 260, 1.2);
      const top = new THREE.Mesh(fisekGeo, fisekMat);
      const f = {x, z, y: yer + 4, vy: 38, t: 0, isik, top}; isik.position.set(x, f.y, z); top.position.copy(isik.position);
      grup.add(isik, top); fisekler.push(f);
    },
    guncelle(dt, kamera, odak) {
      gok.position.copy(kamera.position);
      const o = odak || kamera.position;
      gunes.position.set(o.x + gunesYon.x * 200, o.y + gunesYon.y * 200, o.z + gunesYon.z * 200);
      gunes.target.position.set(o.x, o.y, o.z);
      if (yagis) {
        const p = yagis.geometry.attributes.position, hz = hava.yagis === "kar" ? 3 : 26;
        for (let i = 0; i < YN; i++) {
          let y = p.array[i * 3 + 1] - hz * dt; let x = p.array[i * 3] + ruzgar.x * dt * (hava.yagis === "kar" ? 0.6 : 0.25) + (hava.yagis === "kar" ? Math.sin(y + i) * 0.4 * dt : 0); let z = p.array[i * 3 + 2] + ruzgar.y * dt * 0.25;
          if (y < 0) { y += 60; x = (Math.random() - 0.5) * 120; z = (Math.random() - 0.5) * 120; }
          p.array[i * 3] = x; p.array[i * 3 + 1] = y; p.array[i * 3 + 2] = z;
        }
        p.needsUpdate = true; yagis.position.set(kamera.position.x, kamera.position.y - 20, kamera.position.z);
        if (hava.yagis === "yagmur") { yagis.position.x -= 0; }
      }
      // fırtınada şimşek
      if (hava.ruzgar >= 10) {
        simsekBekle -= dt;
        if (simsekBekle < 0) { simsekT = 0.25; simsekBekle = 5 + Math.random() * 12; H.onSimsek && H.onSimsek(); }
        if (simsekT > 0) { simsekT -= dt; hemi.intensity = H.temelIsik + (Math.random() > 0.4 ? 1.4 : 0.2); } else hemi.intensity = H.temelIsik;
      }
      for (let i = fisekler.length - 1; i >= 0; i--) {
        const f = fisekler[i]; f.t += dt;
        if (f.vy > 0) { f.y += f.vy * dt; f.vy -= 20 * dt; } else f.y -= 2.2 * dt;
        const g = f.t < 1.2 ? f.t / 1.2 : Math.max(0, 1 - (f.t - 9) / 3);
        f.isik.intensity = 900 * g; f.isik.position.set(f.x, f.y, f.z); f.top.position.copy(f.isik.position);
        if (f.t > 12) { grup.remove(f.isik, f.top); fisekler.splice(i, 1); }
      }
    },
    fisekAydinlik(x, z) { let m = 0; for (const f of fisekler) if (f.t > 1) { const d = Math.hypot(f.x - x, f.z - z); m = Math.max(m, 1 - d / 110); } return Math.max(0, m); },
    dispose() { sahne.remove(grup); sahne.fog = null; grup.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); },
  };
  return H;
}
