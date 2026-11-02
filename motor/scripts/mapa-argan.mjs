// Genera motor/src/historias/mapa-argan.ts: Marruecos + España, Francia y Bélgica (Natural Earth 1:10m, Mercator).
// Sin fronteras (solo tierra). Uso (en una carpeta con d3-geo, topojson-client y world-atlas): node mapa-argan.mjs <salida.ts>
import fs from 'node:fs';
import {geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-10m.json'));
const land = feature(topo, topo.objects.land);
const WW = 2000;
const proj = geoMercator().fitWidth(WW, {type: 'MultiPoint', coordinates: [[-14, 40], [9, 40]]});
const [, y0] = proj([0, 52]);
proj.translate([proj.translate()[0], proj.translate()[1] - y0]); // y = 0 en la latitud 52
const [, yMax] = proj([0, 26]);
const BORDE = {x0: -1400, y0: -1600, x1: WW + 1400, y1: Math.round(yMax) + 1300};
proj.clipExtent([[BORDE.x0, BORDE.y0], [BORDE.x1, BORDE.y1]]);
const path = geoPath(proj).digits(1);
// la Antártida, recortada, sale como un rectángulo que lo tapa todo: se quita cualquier polígono que cubra el encuadre entero
const rect = (BORDE.x1 - BORDE.x0) * (BORDE.y1 - BORDE.y0);
const geom = land.features[0].geometry;
const tierra = {type: 'MultiPolygon', coordinates: geom.coordinates.filter((poly) => geoPath(proj).area({type: 'Polygon', coordinates: poly}) < rect * 0.95)};
const P = (lon, lat) => proj([lon, lat]).map((v) => +v.toFixed(1));
const C = {
  agadir: [-9.6, 30.42], essaouira: [-9.77, 31.51], taroudant: [-8.88, 30.47], tiznit: [-9.73, 29.7],
  marrakech: [-7.99, 31.63], casablanca: [-7.59, 33.57], fez: [-5.0, 34.03], tanger: [-5.8, 35.77],
  madrid: [-3.7, 40.42], paris: [2.35, 48.86], bruselas: [4.35, 50.85], barcelona: [2.17, 41.39],
};
// Arganeraie (zona aproximada del bosque de arganes: Esauira – Tiznit, hasta Taroudant)
const zona = [[-9.85, 31.75], [-9.3, 31.8], [-8.8, 31.35], [-8.35, 30.85], [-8.2, 30.45], [-8.5, 30.0], [-9.0, 29.6], [-9.5, 29.35], [-9.95, 29.55], [-9.75, 30.0], [-9.7, 30.6], [-9.9, 31.1]];
const cr = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t ** 3);
const zp = zona.map(([a, b]) => P(a, b));
const dz = [];
for (let i = 0; i < zp.length; i++) {
  const g = (j) => zp[(j + zp.length) % zp.length];
  for (let s = 0; s < 8; s++) dz.push([0, 1].map((k) => +cr(g(i - 1)[k], g(i)[k], g(i + 1)[k], g(i + 2)[k], s / 8).toFixed(1)));
}
const curva = (pts, per = 20) => {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const g = (j) => pts[Math.max(0, Math.min(pts.length - 1, j))];
    for (let s = 0; s < per; s++) out.push([0, 1].map((k) => +cr(g(i - 1)[k], g(i)[k], g(i + 1)[k], g(i + 2)[k], s / per).toFixed(1)));
  }
  out.push(pts.at(-1));
  return out;
};
const ciudades = Object.fromEntries(Object.entries(C).map(([k, v]) => [k, P(...v)]));
// rutas del aceite hacia Europa (con una curva por el mar)
const R = (pts) => curva(pts.map(([a, b]) => P(a, b)));
const rutas = {
  madrid: R([C.agadir, [-10.2, 33.0], [-7.5, 36.2], C.madrid]),
  paris: R([C.agadir, [-11.0, 34.0], [-10.0, 40.0], [-5.5, 45.6], C.paris]),
  bruselas: R([C.agadir, [-11.8, 34.5], [-11.5, 42.0], [-5.0, 48.6], [1.5, 50.6], C.bruselas]),
};
const out = `// Marruecos y el sur de Europa con datos reales (Natural Earth 1:10m, Mercator). Sin fronteras.
// No editar a mano: lo genera motor/scripts/mapa-argan.mjs
export const MW = ${WW};
export const MH = ${Math.round(yMax)};
export const BORDE = ${JSON.stringify(BORDE)};
export const TIERRA = ${JSON.stringify(path(tierra))};
/** Zona del bosque de arganes (aproximada) */
export const ZONA: [number, number][] = ${JSON.stringify(dz)};
export const CIUDADES: Record<string, [number, number]> = ${JSON.stringify(ciudades)};
export const RUTAS: Record<string, [number, number][]> = ${JSON.stringify(rutas)};
`;
fs.writeFileSync(process.argv[2], out);
console.log('bytes', out.length, ciudades.agadir, ciudades.bruselas, 'MH', Math.round(yMax));
