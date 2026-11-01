// Genera motor/src/historias/mapa-norte-africa.ts (necesita: npm i d3-geo topojson-client world-atlas en una carpeta aparte)
//   node mapa-norte-africa.mjs <salida.ts>
import fs from 'node:fs';
import {geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'));
const land = feature(topo, topo.objects.land);
const W = 1080, H = 1920;
// encuadre: de Marruecos a Túnez, a lo ancho del lienzo
const proj = geoMercator().fitWidth(W, {type: 'MultiPoint', coordinates: [[-7.6, 33], [11.6, 33]]});
const [, yc] = proj([0, 34.6]);
proj.translate([proj.translate()[0], proj.translate()[1] + (880 - yc)]);
proj.clipExtent([[-20, -20], [W + 20, H + 20]]);
const path = geoPath(proj).digits(1);
const P = (lon, lat) => proj([lon, lat]).map((v) => +v.toFixed(1));
const tierra = path(land);
// Catmull-Rom por puntos de paso y remuestreo a distancias iguales
const paso = [[10.10, 35.68], [8.9, 35.6], [7.6, 36.0], [6.61, 36.36], [5.4, 36.19], [3.9, 36.0], [2.3, 35.9], [0.6, 35.4], [-1.31, 34.88], [-2.9, 34.6], [-4.01, 34.21], [-5.0, 34.03]].map(([a, b]) => P(a, b));
const cr = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t ** 3);
const densa = [];
for (let i = 0; i < paso.length - 1; i++) {
  const g = (j) => paso[Math.max(0, Math.min(paso.length - 1, j))];
  for (let s = 0; s < 40; s++) { const t = s / 40; densa.push([0, 1].map((k) => cr(g(i - 1)[k], g(i)[k], g(i + 1)[k], g(i + 2)[k], t))); }
}
densa.push(paso.at(-1));
const acc = [0];
for (let i = 1; i < densa.length; i++) acc.push(acc[i - 1] + Math.hypot(densa[i][0] - densa[i - 1][0], densa[i][1] - densa[i - 1][1]));
const N = 120, ruta = [];
for (let i = 0; i <= N; i++) {
  const L = (acc.at(-1) * i) / N; let j = acc.findIndex((v) => v >= L); j = Math.max(1, j);
  const u = (L - acc[j - 1]) / (acc[j] - acc[j - 1] || 1);
  ruta.push([+(densa[j - 1][0] + (densa[j][0] - densa[j - 1][0]) * u).toFixed(1), +(densa[j - 1][1] + (densa[j][1] - densa[j - 1][1]) * u).toFixed(1)]);
}
// cordilleras (coordenadas reales aproximadas de sus crestas)
const sierras = {
  altoAtlas: [[-9.6, 30.6], [-8.5, 31.0], [-7.5, 31.2], [-6.3, 31.7], [-5.0, 32.2], [-4.0, 32.5], [-2.8, 32.6]],
  atlasMedio: [[-5.8, 32.9], [-5.0, 33.3], [-4.3, 33.7], [-3.8, 34.0]],
  rif: [[-5.6, 35.1], [-4.8, 35.0], [-4.0, 35.0], [-3.2, 35.1]],
  atlasTeliano: [[-1.0, 35.2], [0.5, 35.6], [2.0, 36.1], [3.5, 36.4], [5.0, 36.4], [6.5, 36.5], [8.0, 36.4]],
  atlasSahariano: [[-1.2, 32.8], [0.5, 33.6], [2.0, 34.2], [3.5, 34.6], [5.0, 34.9]],
  aures: [[5.8, 35.1], [6.5, 35.3], [7.3, 35.3], [8.2, 35.2]],
};
const sierrasPx = Object.fromEntries(Object.entries(sierras).map(([k, v]) => [k, v.map(([a, b]) => P(a, b))]));
const lat = (l) => +proj([0, l])[1].toFixed(1);
const out = `// Mapa del norte de África generado con datos reales (Natural Earth 1:50m, proyección Mercator).
// No editar a mano: lo genera un script con d3-geo + world-atlas.
export const TIERRA = ${JSON.stringify(tierra)};
/** Ruta histórica Kairouan → Fez por el interior (Tébessa, Constantina, Tremecén, Taza), 121 puntos equidistantes */
export const RUTA: [number, number][] = ${JSON.stringify(ruta)};
export const SIERRAS: Record<string, [number, number][]> = ${JSON.stringify(sierrasPx)};
export const LUGARES = ${JSON.stringify({
  kairouan: P(10.10, 35.68), fez: P(-5.0, 34.03), tunez: P(10.18, 36.8), tremecen: P(-1.31, 34.88), constantina: P(6.61, 36.36),
  mediterraneo: P(4.2, 38.3), atlantico: P(-7.3, 35.3), sahara: P(2.0, 29.2), andalus: P(-4.5, 37.6),
})};
/** y en pantalla de algunas latitudes (para el degradado de la tierra) */
export const LAT = ${JSON.stringify({l38: lat(38), l36: lat(36), l33: lat(33), l30: lat(30), l26: lat(26)})};
`;
fs.writeFileSync(process.argv[2], out);
console.log('bytes', out.length, 'kairouan', P(10.1, 35.68), 'fez', P(-5, 34.03), 'lat', lat(38), lat(26));
