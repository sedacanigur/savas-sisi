#!/usr/bin/env node
// Savaş Sisi — derleme. Kullanım:  node build.mjs   (gerekirse önce: npm i esbuild)
// 1) Son Tabur'dan gelen soru dosyalarını tek bir ES modülünde birleştirir (src/sorular/banka.gen.js)
// 2) Oyunu esbuild ile tek bir küçültülmüş dosyada paketler (dist/oyun.js) ve dist/index.html'i yazar
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const req = createRequire(import.meta.url);
let esbuild;
for (const p of ["esbuild", "/opt/npm-tools/node_modules/esbuild"]) { try { esbuild = req(p); break; } catch (e) {} }
if (!esbuild) { console.error("esbuild bulunamadı: npm i esbuild"); process.exit(1); }

// ---- 1. soru bankası ----
const K = path.join(ROOT, "src/sorular/kaynak");
const oku = f => fs.readFileSync(path.join(K, f), "utf8");
const yanlis = oku("yanlis_konular.js");
let banka = `// OTOMATİK ÜRETİLDİ (build.mjs) — düzenleme: src/sorular/kaynak/
function store(k, v){ try{ if(v==null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function load(k){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; }catch(e){ return null; } }
`;
for (const f of ["questions.js", "questions2.js", "questions3.js", "lgs_core.js", "lgs_tr.js", "lgs_mat.js", "lgs_fen.js", "lgs_ink.js", "lgs_din.js"]) banka += `\n// ---- ${f} ----\n` + oku(f);
banka += "\n" + yanlis;
banka = banka.replace(/sontabur-/g, "savassisi-");
banka += `\nexport {Q, LQ, LGS_SUBJ, LGS_TOPIC, setIslenen, topicAllowed, subjOf, normTR};\n`;
fs.writeFileSync(path.join(ROOT, "src/sorular/banka.gen.js"), banka);

// ---- 2. paket ----
fs.mkdirSync(path.join(ROOT, "dist"), {recursive: true});
await esbuild.build({
  entryPoints: [path.join(ROOT, "src/main.js")],
  bundle: true, minify: true, format: "esm", target: "es2020", legalComments: "none",
  outfile: path.join(ROOT, "dist/oyun.js"),
  alias: {three: path.join(ROOT, "vendor/three/three.module.js")},
  logLevel: "warning",
});
const html = fs.readFileSync(path.join(ROOT, "src/index.html"), "utf8")
  .replace("<!--OYUN-->", `<script type="module" src="./oyun.js?v=${Date.now().toString(36)}"></script>`);
fs.writeFileSync(path.join(ROOT, "dist/index.html"), html);
const kb = f => (fs.statSync(path.join(ROOT, f)).size / 1024).toFixed(0) + " KB";
console.log("dist/index.html ·", "dist/oyun.js", kb("dist/oyun.js"));
