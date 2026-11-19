/* ---------- LGS soru bankası: dersler, konular, 10'lu bloklar, tekrarsız seçim ---------- */
const LGS_SUBJ = [
  {id:"tr", name:"Türkçe", cat:"Türkçe", lgsN:20, goal:"Hedef: en az 17 net", goalNet:17, topics:[
    ["t1","Fiilimsiler"],["t2","Cümlenin Ögeleri"],["t3","Fiilde Çatı"],["t4","Cümle Türleri"],
    ["t5","Yazım Kuralları ve Noktalama"],["t6","Sözcükte ve Cümlede Anlam"],["t7","Paragrafta Anlam"],
    ["t8","Söz Sanatları"],["t9","Metin Türleri"],["t10","Anlatım Bozuklukları"],["t11","Sözel Mantık ve Görsel Okuma"]]},
  {id:"mat", name:"Matematik", cat:"Matematik", lgsN:20, goal:"Hedef: en az 15 net", goalNet:15, topics:[
    ["m1","1. Çarpanlar ve Katlar"],["m2","2. Üslü İfadeler"],["m3","3. Kareköklü İfadeler"],["m4","4. Veri Analizi"],
    ["m5","5. Basit Olayların Olma Olasılığı"],["m6","6. Cebirsel İfadeler ve Özdeşlikler"],["m7","7. Doğrusal Denklemler"],["m8","8. Eşitsizlikler"],
    ["m9","9. Üçgenler"],["m10","10. Eşlik ve Benzerlik"],["m11","11. Dönüşüm Geometrisi"],["m12","12. Geometrik Cisimler"]]},
  {id:"fen", name:"Fen Bilimleri", cat:"Fen", lgsN:20, goal:"Hedef: fulle yakın (18+ net)", goalNet:18, topics:[
    ["f1","1. Mevsimler ve İklim"],["f2","2. DNA ve Genetik Kod"],["f3","3. Basınç"],["f4","4. Madde ve Endüstri"],
    ["f5","5. Basit Makineler"],["f6","6. Enerji Dönüşümleri ve Çevre Bilimi"],["f7","7. Elektrik Yükleri ve Elektrik Enerjisi"]]},
  {id:"ink", name:"T.C. İnkılap Tarihi ve Atatürkçülük", cat:"İnkılap", lgsN:10, goal:"Hedef: full (10 net)", goalNet:10, topics:[
    ["i1","1. Bir Kahraman Doğuyor"],["i2","2. Millî Uyanış: Bağımsızlık Yolunda Atılan Adımlar"],["i3","3. Millî Bir Destan: Ya İstiklal Ya Ölüm!"],
    ["i4","4. Atatürkçülük ve Çağdaşlaşan Türkiye"],["i5","5. Demokratikleşme Çabaları"],["i6","6. Atatürk Dönemi Türk Dış Politikası"],["i7","7. Atatürk'ün Ölümü ve Sonrası"]]},
  {id:"din", name:"Din Kültürü ve Ahlak Bilgisi", cat:"Din", lgsN:10, goal:"Hedef: full (10 net)", goalNet:10, topics:[
    ["d1","1. Kader İnancı"],["d2","2. Zekât ve Sadaka"],["d3","3. Din ve Hayat"],["d4","4. Hz. Muhammed'in Örnekliği"],["d5","5. Kur'an-ı Kerim ve Özellikleri"]]}
];
const LGS_CATS = LGS_SUBJ.map(s=>s.cat);
const LGS_TOPIC = {}; LGS_SUBJ.forEach(s=>s.topics.forEach(([id,name])=>LGS_TOPIC[id] = {id, name, s:s.id}));
const LQ = [];
function lgsHash(str){ let h = 5381; for(let i=0;i<str.length;i++) h = ((h<<5) + h + str.charCodeAt(i)) >>> 0; return h.toString(36); }
function LGS_ADD(sid, rows){
  const subj = LGS_SUBJ.find(s=>s.id===sid);
  rows.forEach(r=>{
    const [t, text, opts, ans, exp, lvl] = r;
    const q = [subj.cat, text, opts, ans, exp, Math.max(2, lvl||2)];
    const item = {id: sid + "-" + lgsHash(text), s:sid, t, q};
    q.lgs = item; LQ.push(item);
  });
}

/* ---------- ayarlar: soru türü (LGS / Tarih) ve kapalı konular ---------- */
const QCFG_KEY = "sontabur-sorular-v2", LGSST_KEY = "sontabur-lgs-durum-v1";
function qcfg(){ const c = load(QCFG_KEY) || {}; return {mode: c.mode==="tarih" ? "tarih" : "lgs", off: c.off || {}}; }
function qcfgSave(c){ store(QCFG_KEY, c); }
const qMode = () => qcfg().mode;
function lgsTopicsOn(sid){ const off = qcfg().off; return LGS_SUBJ.find(s=>s.id===sid).topics.map(t=>t[0]).filter(t=>!off[t] && LQ.some(x=>x.t===t)); }
function lgsState(){ const s = load(LGSST_KEY) || {}; return {seen:s.seen||{}, wrong:s.wrong||{}, blk:s.blk||null, recent:s.recent||[], hist:s.hist||{}}; }
function lgsSave(st){ store(LGSST_KEY, st); }

/* 10 soruluk ders blokları: Türkçe → Fen → İnkılap → Din → … (yalnızca açık konular) */
function lgsNext(W){
  const st = lgsState();
  const subs = LGS_SUBJ.filter(s=>lgsTopicsOn(s.id).length);
  if(!subs.length) return null;
  let b = st.blk;
  if(!b || b.left<=0 || !subs.some(s=>s.id===b.s)){
    const i = b ? LGS_SUBJ.findIndex(s=>s.id===b.s) : -1;
    let nx = null;
    for(let k=1;k<=LGS_SUBJ.length;k++){ const c = LGS_SUBJ[(i+k+LGS_SUBJ.length)%LGS_SUBJ.length]; if(subs.includes(c)){ nx = c; break; } }
    b = {s:nx.id, left:10, n:0};
  }
  const on = new Set(lgsTopicsOn(b.s));
  const cand = LQ.filter(x=>x.s===b.s && on.has(x.t));
  const recent = st.recent;
  const wrongC = cand.filter(x=>st.wrong[x.id] && !recent.includes(x.id));
  let pick;
  if(wrongC.length && Math.random() < 0.25) pick = wrongC[Math.floor(Math.random()*wrongC.length)];
  else {
    let un = cand.filter(x=>!st.seen[x.id]);
    if(!un.length){ cand.forEach(x=>{ delete st.seen[x.id]; }); un = cand.filter(x=>!recent.includes(x.id)); if(!un.length) un = cand; }
    // konuları dengeli dağıt: önce rastgele bir konu, sonra o konudan zorluk ağırlıklı bir soru
    const tops = [...new Set(un.map(x=>x.t))];
    const tp = tops[Math.floor(Math.random()*tops.length)];
    un = un.filter(x=>x.t===tp);
    const w = W || {2:1,3:1};
    const tot = un.reduce((a,x)=>a + (w[x.q[5]]||1), 0);
    let r = Math.random()*tot; pick = un[0];
    for(const x of un){ r -= (w[x.q[5]]||1); if(r<=0){ pick = x; break; } }
  }
  st.seen[pick.id] = 1;
  st.recent = [pick.id, ...recent.filter(i=>i!==pick.id)].slice(0, 40);
  b.left--; b.n++; st.blk = b;
  lgsSave(st);
  pick.blockN = b.n;
  return pick;
}
function lgsResult(item, ok){
  if(!item) return;
  const st = lgsState();
  if(ok) delete st.wrong[item.id]; else st.wrong[item.id] = 1;
  const h = st.hist[item.s] || [];
  h.push(ok?1:0); st.hist[item.s] = h.slice(-60);
  lgsSave(st);
}
/* son cevaplara göre net tahmini (LGS: 3 yanlış 1 doğruyu götürür, boş bırakma yok sayıldı) */
function lgsNetEst(sid){
  const s = LGS_SUBJ.find(x=>x.id===sid), h = lgsState().hist[sid] || [];
  if(h.length < 10) return null;
  const p = h.reduce((a,b)=>a+b,0) / h.length;
  const n = s.lgsN, d = p*n, y = n - d;
  return {n: h.length, pct: Math.round(p*100), net: Math.max(0, d - y/3)};
}
/* günlük meydan okuma: herkes için aynı LGS soruları (tüm konulardan, 10'lu bloklar) */
function lgsDaily(r){
  const out = [];
  LGS_SUBJ.forEach(s=>{
    const pool = LQ.map((x,i)=>i).filter(i=>LQ[i].s===s.id);
    for(let k=0;k<10 && pool.length;k++) out.push(pool.splice(Math.floor(r()*pool.length),1)[0]);
  });
  return out;
}
