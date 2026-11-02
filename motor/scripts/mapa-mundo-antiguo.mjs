// Genera motor/src/historias/mapa-mundo-antiguo.ts: el Viejo Mundo (de Marruecos a China) en coordenadas de "mundo"
import fs from 'node:fs';
import {geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'));
const land = feature(topo, topo.objects.land);
const WW = 6000;
const proj = geoMercator().fitWidth(WW, {type: 'MultiPoint', coordinates: [[-22, 20], [132, 20]]});
const [, y0] = proj([0, 62]);
proj.translate([proj.translate()[0], proj.translate()[1] - y0]); // y = 0 en la latitud 62
const [, yMax] = proj([0, -14]);
const [, yFondo] = proj([0, -40]);
proj.clipExtent([[-1400, -1600], [WW + 1400, yFondo]]); // más allá del viaje: los bordes se funden con una máscara
const path = geoPath(proj).digits(0);
const P = (lon, lat) => proj([lon, lat]).map((v) => Math.round(v));
const C = {
  tanger: [-5.8, 35.77], venecia: [12.33, 45.44], tlemcen: [-1.31, 34.88], tunez: [10.18, 36.8], alejandria: [29.92, 31.2],
  cairo: [31.24, 30.04], damasco: [36.29, 33.51], medina: [39.61, 24.47], meca: [39.83, 21.42], bagdad: [44.36, 33.31],
  tabriz: [46.29, 38.08], isfahan: [51.67, 32.65], kabul: [69.2, 34.55], delhi: [77.21, 28.61], calicut: [75.78, 11.25],
  maldivas: [73.5, 4.17], ceilan: [79.86, 6.93], chittagong: [91.8, 22.35], sumatra: [95.32, 5.55], quanzhou: [118.59, 24.9],
  fez: [-5.0, 34.03], tombuctu: [-3.0, 16.77], granada: [-3.6, 37.18], acre: [35.08, 32.92], ormuz: [56.45, 27.1],
  kashgar: [75.99, 39.47], pekin: [116.4, 39.9], mogadiscio: [45.34, 2.04], kilwa: [39.51, -8.96], constantinopla: [28.98, 41.01],
  crimea: [34.1, 44.95], bujara: [64.42, 39.77], estambul: [28.98, 41.01],
};
const cities = Object.fromEntries(Object.entries(C).map(([k, v]) => [k, P(...v)]));
// tramos de la ruta de Ibn Battuta (por ciudades) y de Marco Polo
const T = (names) => names.map((n) => cities[n]);
const smooth = (pts, per = 16) => {
  const cr = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t ** 3);
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const g = (j) => pts[Math.max(0, Math.min(pts.length - 1, j))];
    for (let s = 0; s < per; s++) out.push([0, 1].map((k) => Math.round(cr(g(i - 1)[k], g(i)[k], g(i + 1)[k], g(i + 2)[k], s / per))));
  }
  out.push(pts.at(-1));
  return out;
};
const tramos = {
  salida: smooth(T(['tanger', 'tlemcen', 'tunez', 'alejandria', 'cairo', 'medina', 'meca'])),
  ruta: smooth(T(['meca', 'cairo', 'damasco', 'bagdad', 'tabriz', 'isfahan', 'kabul', 'delhi'])),
  china: smooth(T(['delhi', 'calicut', 'maldivas', 'ceilan', 'chittagong', 'sumatra', 'quanzhou'])),
  vuelta: smooth(T(['quanzhou', 'sumatra', 'calicut', 'ormuz', 'bagdad', 'damasco', 'cairo', 'tunez', 'fez'])),
  extra: smooth(T(['fez', 'granada', 'fez', 'tombuctu', 'fez'])),
  africa: smooth(T(['meca', 'mogadiscio', 'kilwa', 'ormuz'])),
  norte: smooth(T(['damasco', 'constantinopla', 'crimea', 'bujara', 'kabul'])),
  marco: smooth(T(['venecia', 'acre', 'ormuz', 'kashgar', 'pekin'])),
};
const out = `// Mapa del Viejo Mundo (Natural Earth 1:50m, Mercator) en coordenadas de mundo (ancho ${WW}).
// No editar a mano: lo genera un script con d3-geo + world-atlas.
export const WW = ${WW};
export const WH = ${Math.round(yMax)};
export const BORDE = {x0: -1400, y0: -1600, x1: ${WW + 1400}, y1: ${Math.round(yFondo)}};
export const TIERRA_MUNDO = ${JSON.stringify(path(land))};
export const CIUDADES: Record<string, [number, number]> = ${JSON.stringify(cities)};
export const TRAMOS: Record<string, [number, number][]> = ${JSON.stringify(tramos)};
`;
fs.writeFileSync(process.argv[2], out);
console.log('bytes', out.length, 'WH', Math.round(yMax), cities.tanger, cities.quanzhou, cities.delhi);
