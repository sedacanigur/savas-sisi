// Klavye ve fare girişi, fare kilidi (pointer lock)
export const G = {
  tus: new Set(), basildi: new Set(), fareDX: 0, fareDY: 0, sol: false, sag: false, solBas: false, sagBas: false, tekerlek: 0,
  kilitli: false, x: 0, y: 0, tuval: null, kilitIzin: false, solTik: false, sagTik: false,
};
const engel = new Set(["Space", "Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
const yazimAlani = e => e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT");
addEventListener("keydown", e => {
  if (yazimAlani(e)) return;
  if (!G.tus.has(e.code)) G.basildi.add(e.code);
  G.tus.add(e.code);
  if (engel.has(e.code) || (G.kilitli && /^(Key|Digit)/.test(e.code))) e.preventDefault();
});
addEventListener("keyup", e => G.tus.delete(e.code));
addEventListener("blur", () => { G.tus.clear(); G.sol = G.sag = false; });
addEventListener("mousemove", e => { G.x = e.clientX; G.y = e.clientY; if (G.kilitli) { G.fareDX += e.movementX; G.fareDY += e.movementY; } });
addEventListener("mousedown", e => {
  if (e.target !== G.tuval && !G.kilitli) return;
  if (e.button === 0) { G.sol = true; G.solBas = true; G.solTik = true; }
  if (e.button === 2) { G.sag = true; G.sagBas = true; G.sagTik = true; }
  if (G.kilitIzin && !G.kilitli && e.target === G.tuval) G.tuval.requestPointerLock?.();
});
addEventListener("mouseup", e => { if (e.button === 0) G.sol = false; if (e.button === 2) G.sag = false; });
addEventListener("contextmenu", e => { if (e.target === G.tuval || G.kilitli) e.preventDefault(); });
addEventListener("wheel", e => { if (G.kilitli || e.target === G.tuval) G.tekerlek += Math.sign(e.deltaY); }, {passive: true});
document.addEventListener("pointerlockchange", () => { G.kilitli = document.pointerLockElement === G.tuval; });
export const tus = c => G.tus.has(c);
export const bas = c => G.basildi.has(c);
export function kareSonu() { G.basildi.clear(); G.fareDX = 0; G.fareDY = 0; G.solBas = false; G.sagBas = false; G.tekerlek = 0; G.solTik = false; G.sagTik = false; }
export function kilitAc() { if (document.pointerLockElement) document.exitPointerLock(); }
export function kilitIste() { G.kilitIzin = true; }
export function kilitBirak() { G.kilitIzin = false; kilitAc(); }
