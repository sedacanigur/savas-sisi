/* ---------- Yanlış defteri: işlenmiş konular (Son Tabur yanlis.js'ten) ---------- */
const ISLENEN_KEY = "sontabur-islenen-v1";
const ALWAYS_ON = ["t6","t7","t11"];
const TOPIC_ALIAS = {
  t1:["fiilimsi","isim fiil","sifat fiil","zarf fiil"], t2:["ogeler","cumlenin ogeleri","ozne","yuklem","nesne","tumlec"],
  t3:["cati","fiilde cati","etken","edilgen","catı"], t4:["cumle turleri","cumle cesitleri","cumle yapisi"], t5:["yazim","noktalama","imla"],
  t6:["sozcukte anlam","cumlede anlam","soz grubunda anlam","deyim","atasozu","anlam bilgisi"], t7:["paragraf","paragrafta anlam","ana dusunce","metin yorumlama"],
  t8:["soz sanatlari","benzetme","kisilestirme"], t9:["metin turleri","yazi turleri"], t10:["anlatim bozuklu"], t11:["sozel mantik","gorsel okuma","mantik"],
  m1:["carpanlar","katlar","ebob","ekok","asal carpan"], m2:["uslu"], m3:["karekok"], m4:["veri analizi","veri","grafik"], m5:["olasilik"],
  m6:["cebirsel","ozdeslik","carpanlara ayirma"], m7:["dogrusal denklem","denklem","egim","dogrusal iliski"], m8:["esitsizlik"], m9:["ucgen","pisagor"],
  m10:["eslik","benzerlik"], m11:["donusum","oteleme","yansima"], m12:["geometrik cisim","prizma","silindir","piramit","koni"],
  f1:["mevsim","iklim"], f2:["dna","genetik","kalitim","mutasyon","adaptasyon","biyoteknoloji"], f3:["basinc"],
  f4:["madde ve endustri","periyodik","asit","baz","kimyasal tepkime","maddenin isi"], f5:["basit makine","kaldirac","makara"],
  f6:["enerji donusum","besin zinciri","fotosentez","solunum","madde dongu","cevre bilimi"], f7:["elektrik yuk","elektriklenme","elektrik enerjisi"],
  i1:["kahraman doguyor"], i2:["milli uyanis","bagimsizlik yolunda","mondros","cemiyet","kongre"], i3:["milli bir destan","istiklal ya olum","kurtulus savasi","sakarya","buyuk taarruz","lozan"],
  i4:["ataturkculuk","cagdaslasan"], i5:["demokratiklesme","cok partili"], i6:["dis politika"], i7:["olumu ve sonrasi","ataturk un olumu"],
  d1:["kader"], d2:["zekat","sadaka"], d3:["din ve hayat"], d4:["muhammed","ornekligi"], d5:["kuran","kur an"]
};
function normTR(s){
  return String(s||"").toLocaleLowerCase("tr").replace(/ı/g,"i").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ö/g,"o").replace(/ç/g,"c")
    .replace(/[âà]/g,"a").replace(/[îì]/g,"i").replace(/[ûù]/g,"u").replace(/^\s*\d+\s*[.)-]?\s*(unite)?\s*/,"").replace(/[^a-z0-9]+/g," ").trim();
}
function subjOf(ders){
  const d = normTR(ders);
  if(/mat/.test(d)) return "mat";
  if(/inkilap|tarih|ataturk/.test(d)) return "ink";   // "Atatürkçülük" Türkçe sanılmasın diye önce bakılır
  if(/\bdin\b|din kultur/.test(d)) return "din";
  if(/fen/.test(d)) return "fen";
  if(/turkce/.test(d)) return "tr";
  return null;   // İngilizce gibi bankada olmayan dersler
}
function matchTopic(sid, konu){
  const subj = LGS_SUBJ.find(s=>s.id===sid); if(!subj) return null;
  const k = normTR(konu); if(!k) return null;
  let best = null, bs = 0;
  subj.topics.forEach(([t, name])=>{
    const n = normTR(name);
    let sc = 0;
    if(k===n) sc = 4;
    else if(k.includes(n) || (n.includes(k) && k.length>=5)) sc = 3;
    else {
      // takma ad kelime başında geçmeli; birden çok konu eşleşirse daha uzun (daha belirgin) takma ad kazanır
      const al = (TOPIC_ALIAS[t]||[]).filter(a=>(" "+k).includes(" "+a) || (a.includes(k) && k.length>=5)).reduce((m,a)=>Math.max(m,a.length),0);
      if(al) sc = 2 + al/100;
    }
    if(!sc){
      const stop = new Set(["ve","ile","bir","in","un","nin","nun"]);
      const kw = k.split(" ").filter(w=>w.length>2 && !stop.has(w)), nw = new Set(n.split(" "));
      const hit = kw.filter(w=>nw.has(w)).length;
      if(kw.length && hit/kw.length >= 0.6) sc = 1;
    }
    if(sc>bs){ bs = sc; best = t; }
  });
  return best;
}
function setIslenen(rows){
  const topics = new Set(), unmatched = [];
  rows.forEach(r=>{
    const sid = subjOf(r.ders);
    if(!sid){ unmatched.push(`${r.ders} · ${r.konu}`); return; }
    const parts = [r.konu, ...String(r.konu).split(/[,;\/]/)].map(x=>x.trim()).filter(Boolean);
    const found = [...new Set(parts.map(x=>matchTopic(sid, x)).filter(Boolean))];
    if(found.length) found.forEach(t=>topics.add(t)); else unmatched.push(`${r.ders} · ${r.konu}`);
  });
  store(ISLENEN_KEY, {at:Date.now(), topics:[...topics], unmatched:[...new Set(unmatched)]});
}
const islenen = () => load(ISLENEN_KEY);
function topicAllowed(t){
  if(ALWAYS_ON.includes(t)) return true;
  const i = islenen();
  if(!i) return true;   // yanlış defteri henüz hiç okunamadı: kısıtlama yok (ayarlarda uyarı gösterilir)
  return i.topics.includes(t);
}
