// Tohumlu rastgele sayı ve değer gürültüsü (arazi için)
export function rng(seed) {
  let a = seed >>> 0 || 1;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

export function gurultu(seed) {
  const r = rng(seed), P = new Uint8Array(512), G = new Float32Array(256);
  for (let i = 0; i < 256; i++) { P[i] = i; G[i] = r() * 2 - 1; }
  for (let i = 255; i > 0; i--) { const j = r() * (i + 1) | 0; [P[i], P[j]] = [P[j], P[i]]; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  const f = t => t * t * (3 - 2 * t);
  const v = (x, z) => G[P[(P[x & 255] + z) & 511]];
  const n2 = (x, z) => {
    const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = f(xf), w = f(zf);
    const a = v(xi, zi), b = v(xi + 1, zi), c = v(xi, zi + 1), d = v(xi + 1, zi + 1);
    return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
  };
  n2.fbm = (x, z, o = 4) => { let s = 0, a = 1, fr = 1, t = 0; for (let i = 0; i < o; i++) { s += a * n2(x * fr, z * fr); t += a; a *= 0.5; fr *= 2; } return s / t; };
  n2.ridge = (x, z, o = 4) => { let s = 0, a = 1, fr = 1, t = 0; for (let i = 0; i < o; i++) { s += a * (1 - Math.abs(n2(x * fr, z * fr))); t += a; a *= 0.5; fr *= 2; } return s / t; };
  return n2;
}

export const ss = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
