// Savaş Sisi — Cloudflare Worker (Son Tabur 1800 ile aynı yanlış defteri servisi)
// /api/yanlis : Notion'daki yanlış defterini okur ve oyuna soru listesi olarak verir.
// Diğer bütün istekler dist/ içindeki statik dosyalara gider.
//
// Gerekli gizli değişken (Cloudflare → Settings → Variables and Secrets):
//   NOTION_TOKEN  : Notion entegrasyon anahtarı (secret)
// İsteğe bağlı:
//   YANLIS_DB     : Yanlış defteri veritabanının ID'si. Verilmezse entegrasyonun
//                   görebildiği veritabanları arasında adında "yanlış" geçen seçilir.

const NOTION = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const COL = { soru: "Soru PDF", dogru: "Doğru Cevap", verdigim: "Verdiğim Cevap", ders: "Ders" };
const LETTERS = "ABCDE";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/yanlis") return yanlis(env);
    return env.ASSETS.fetch(request);
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function notion(env, path, body) {
  const res = await fetch(NOTION + path, {
    method: body ? "POST" : "GET",
    headers: {
      authorization: `Bearer ${env.NOTION_TOKEN}`,
      "notion-version": NOTION_VERSION,
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Notion ${res.status}: ${data.message || "bilinmeyen hata"}`);
  return data;
}

const plain = rt => (rt || []).map(t => t.plain_text || "").join("").trim();

function titleOf(db) {
  return plain(db.title) || "";
}

async function findDb(env) {
  if (env.YANLIS_DB) return env.YANLIS_DB.replace(/-/g, "").match(/[0-9a-f]{32}/i)?.[0] || env.YANLIS_DB;
  const r = await notion(env, "/search", { filter: { property: "object", value: "database" }, page_size: 50 });
  const dbs = r.results || [];
  const norm = s => s.toLocaleLowerCase("tr").replace(/ı/g, "i");
  const hit = dbs.find(d => norm(titleOf(d)).includes("yanlis")) ||
              dbs.find(d => d.properties && d.properties[COL.soru] && d.properties[COL.dogru]) ||
              dbs[0];
  if (!hit) throw new Error("Entegrasyon hiçbir veritabanını göremiyor. Veritabanında ⋯ → Connections kısmından entegrasyonu ekle.");
  return hit.id;
}

// Herhangi bir Notion özelliğinden düz metin çıkar.
function text(p) {
  if (!p) return "";
  switch (p.type) {
    case "select": return p.select?.name || "";
    case "status": return p.status?.name || "";
    case "multi_select": return (p.multi_select || []).map(o => o.name).join(", ");
    case "rich_text": return plain(p.rich_text);
    case "title": return plain(p.title);
    case "number": return p.number == null ? "" : String(p.number);
    case "formula": {
      const f = p.formula || {};
      return f.string ?? (f.number != null ? String(f.number) : "");
    }
    default: return "";
  }
}

// "C", "c", "C şıkkı", "3" → 2 (sıfırdan başlayan şık sırası). Tanınmazsa -1.
function letterIndex(v) {
  const s = String(v || "").trim().toLocaleUpperCase("tr");
  if (!s) return -1;
  const m = s.match(/^[^A-ZÇĞİÖŞÜ0-9]*([A-E])(?![A-ZÇĞİÖŞÜ])/);
  if (m) return LETTERS.indexOf(m[1]);
  const n = s.match(/^\D*([1-5])\b/);
  if (n) return +n[1] - 1;
  return -1;
}

function fileOf(p) {
  if (!p || p.type !== "files") return null;
  const f = (p.files || [])[0];
  if (!f) return null;
  const url = f.type === "external" ? f.external?.url : f.file?.url;
  return url ? { url, name: f.name || "" } : null;
}

// Sütunda dosya yoksa sayfanın içindeki ilk görsel/PDF bloğuna bak.
async function fileFromBlocks(env, pageId) {
  const r = await notion(env, `/blocks/${pageId}/children?page_size=50`);
  for (const b of r.results || []) {
    const v = b[b.type];
    if (["image", "pdf", "file"].includes(b.type) && v) {
      const url = v.type === "external" ? v.external?.url : v.file?.url;
      if (url) return { url, name: v.name || "" };
    }
  }
  return null;
}

// Konu: her ders için ayrı bir "konu" sütunu var, satırda yalnızca biri dolu.
// Hiçbiri dolu değilse başlıktaki "Konu - Ders" biçiminden alınır.
function konuOf(P) {
  for (const [name, p] of Object.entries(P)) {
    if (!/konu/i.test(name) || p.type === "title") continue;
    const v = text(p);
    if (v) return v;
  }
  const t = Object.values(P).find(p => p.type === "title");
  const title = t ? text(t) : "";
  const i = title.lastIndexOf(" - ");
  return (i > 0 ? title.slice(0, i) : title).trim();
}

const isPdf = f => /\.pdf($|\?)/i.test(new URL(f.url).pathname) || /\.pdf$/i.test(f.name);

async function yanlis(env) {
  if (!env.NOTION_TOKEN) return json({ error: "NOTION_TOKEN tanımlı değil. Cloudflare'de gizli değişken olarak ekle." }, 500);
  try {
    const db = await findDb(env);
    const pages = [];
    let cursor;
    do {
      const r = await notion(env, `/databases/${db}/query`, { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) });
      pages.push(...(r.results || []));
      cursor = r.has_more ? r.next_cursor : null;
    } while (cursor && pages.length < 1000);

    // İşlenmiş konular: yanlış defterindeki her satır (soru fotoğrafı olmasa bile) bir ders+konu bildirir.
    const seen = new Map();
    for (const pg of pages) {
      const P = pg.properties || {};
      const ders = text(P[COL.ders]), konu = konuOf(P);
      if (!ders || !konu) continue;
      const k = ders + "\u0000" + konu;
      seen.set(k, { ders, konu, n: (seen.get(k)?.n || 0) + 1 });
    }
    const topics = [...seen.values()];

    const skipped = [];
    const questions = (await Promise.all(pages.map(async pg => {
      const P = pg.properties || {};
      const ans = letterIndex(text(P[COL.dogru]));
      if (ans < 0) { skipped.push("doğru cevap yok"); return null; }
      let file = fileOf(P[COL.soru]);
      if (!file) { try { file = await fileFromBlocks(env, pg.id); } catch (e) {} }
      if (!file) { skipped.push("soru fotoğrafı yok"); return null; }
      const prevRaw = text(P[COL.verdigim]);
      const prev = letterIndex(prevRaw);
      return {
        id: pg.id,
        img: file.url,
        pdf: isPdf(file),
        ans,
        prev: prev >= 0 ? LETTERS[prev] : (prevRaw || ""),
        ders: text(P[COL.ders]),
        konu: konuOf(P),
      };
    }))).filter(Boolean);

    return json({ questions, topics, total: pages.length, skipped: skipped.length, at: Date.now() });
  } catch (e) {
    return json({ error: String(e.message || e) }, 502);
  }
}
