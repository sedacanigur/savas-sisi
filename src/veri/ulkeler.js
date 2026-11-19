// Gerçek ve kurgusal ülkeler. Üniforma renkleri ve başlık dönemle değişir.
// sapka: kepi | fes | kalpak | sivri | kask | enveriye | sapka
const U = (yil, ceket, pantolon, sapka, sapkaRenk) => ({yil, ceket, pantolon, sapka, sapkaRenk});

export const ULKELER = {
  // ---- kurgusal ----
  ardicova: {ad: "Ardıçova", kurgu: true, bayrak: ["#1f5a4a", "#e9e2c8", "#1f5a4a"], amblem: "#c9a33a",
    tanim: "Dağlar ve ardıç ormanları arasında küçük bir sınır ülkesi. Hikâyede bizim tarafımız.",
    uniforma: [U(1860, "#2c5d57", "#cfc7ad", "kepi", "#1d3a37"), U(1880, "#2a4f4c", "#5b5a52", "kalpak", "#3b2e22"), U(1912, "#5f6a4a", "#59604a", "kask", "#4f5840")]},
  demirmark: {ad: "Demirmark İmparatorluğu", kurgu: true, bayrak: ["#2d2f36", "#b8b9bd", "#8e1b1b"], amblem: "#d6d6d6",
    tanim: "Kuzeyin sanayileşmiş, genişlemeci imparatorluğu. Hikâyede saldıran taraf.",
    uniforma: [U(1860, "#3c4250", "#2b2e35", "sivri", "#1b1c20"), U(1885, "#4a4f57", "#30333a", "sivri", "#1b1c20"), U(1912, "#5d6058", "#4b4d47", "kask", "#474a44")]},
  karayaka: {ad: "Karayaka Emirliği", kurgu: true, bayrak: ["#b1782b", "#f1e6c8", "#6d2e1f"], amblem: "#6d2e1f",
    tanim: "Güneyin çöl emirliği; deve süvarisi ve hızlı akıncılarıyla ünlü.",
    uniforma: [U(1860, "#d8c7a0", "#efe6cf", "fes", "#8e2a22"), U(1912, "#b9a476", "#a99569", "sapka", "#a99569")]},
  // ---- gerçek ----
  osmanli: {ad: "Osmanlı Devleti", bayrak: ["#c8102e", "#c8102e", "#c8102e"], amblem: "#ffffff",
    tanim: "1860'larda Nizam askerleri fes ve lacivert ceketle, 1914'te haki üniforma ve kabalak (enveriye) ile.",
    uniforma: [U(1860, "#26314f", "#26314f", "fes", "#b3261e"), U(1909, "#7d7550", "#6f6846", "enveriye", "#6e6a4a")]},
  fransa: {ad: "Fransa", bayrak: ["#1f3d8c", "#f2f2f2", "#c8102e"], amblem: "#c9a33a",
    tanim: "Kırmızı pantolon ve kepi; 1915'ten sonra 'ufuk mavisi' ve Adrian kaskı.",
    uniforma: [U(1860, "#233a7a", "#b3261e", "kepi", "#b3261e"), U(1915, "#7a8ea6", "#7a8ea6", "kask", "#6b7d93")]},
  prusya: {ad: "Prusya / Almanya", bayrak: ["#1a1a1a", "#f2f2f2", "#c8102e"], amblem: "#c9a33a",
    tanim: "Sivri tepeli Pickelhaube miğfer; 1910'dan sonra feldgrau, 1916'da Stahlhelm.",
    uniforma: [U(1860, "#1f2a44", "#1a1a1a", "sivri", "#121212"), U(1910, "#6f7466", "#5f6358", "sivri", "#4d5045"), U(1916, "#6f7466", "#5f6358", "kask", "#5c6153")]},
  britanya: {ad: "Britanya", bayrak: ["#1f3d8c", "#f2f2f2", "#c8102e"], amblem: "#f2f2f2",
    tanim: "Kırmızı ceketler (redcoat), 1900'lerden itibaren haki ve Brodie kaskı.",
    uniforma: [U(1860, "#b3261e", "#1b1f2a", "kepi", "#1b1f2a"), U(1900, "#8a7a52", "#7d6f4b", "sapka", "#7d6f4b"), U(1916, "#8a7a52", "#7d6f4b", "kask", "#6c6247")]},
  rusya: {ad: "Rusya", bayrak: ["#f2f2f2", "#1f3d8c", "#c8102e"], amblem: "#c9a33a",
    tanim: "Koyu yeşil ceket ve kalpak; 1910'larda haki gimnastyorka.",
    uniforma: [U(1860, "#1e3b2c", "#1a1f1a", "kalpak", "#222222"), U(1907, "#8d8a62", "#5e5c45", "kepi", "#7b7856")]},
  avusturya: {ad: "Avusturya-Macaristan", bayrak: ["#c8102e", "#f2f2f2", "#c8102e"], amblem: "#c9a33a",
    tanim: "Beyaz ceketli piyade; sonra 'kurt grisi' ve kepi.",
    uniforma: [U(1860, "#e8e4d8", "#2f4f7f", "kepi", "#1b1b1b"), U(1909, "#7f8a8a", "#6b7575", "kepi", "#6b7575")]},
};

export function uniformaOf(ulkeId, yil) {
  const u = ULKELER[ulkeId] || ULKELER.ardicova;
  let s = u.uniforma[0];
  for (const x of u.uniforma) if (yil >= x.yil) s = x;
  return s;
}

export const OYUNCU_ULKE = "ardicova";
