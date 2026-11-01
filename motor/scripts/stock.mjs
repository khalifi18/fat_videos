// Clips de vídeo gratis (Mixkit, solo "Stock Video Free License") para cada línea del guion.
//   node motor/scripts/stock.mjs videos/<slug>            busca y descarga un clip por línea
//   node motor/scripts/stock.mjs videos/<slug> --otro 3   cambia el clip de la línea 3 (en formato POV: el fondo 1 o 2)
// Guarda clips/raw-<id>.mp4, clips.json (elección y candidatos) y out/creditos.txt.
import fs from 'node:fs';
import path from 'node:path';
import {leerGuion} from './guion.mjs';

const dir = path.resolve(process.argv[2] || '');
const args = process.argv.slice(3);
if (!process.argv[2] || !fs.existsSync(path.join(dir, 'guion.txt'))) {
  console.log('Uso: node motor/scripts/stock.mjs videos/<slug> [--otro N]');
  process.exit(1);
}
const UA = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,*/*',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
};
const BASE = 'https://mixkit.co';
const lineas = leerGuion(dir);
if (lineas.formato === 'historia' || lineas.formato === 'hikma') {
  console.log(`OK · el formato ${lineas.formato} no usa clips (0 descargas)`);
  process.exit(0);
}
const cdir = path.join(dir, 'clips');
fs.mkdirSync(cdir, {recursive: true});
fs.mkdirSync(path.join(dir, 'out'), {recursive: true});
const jf = path.join(dir, 'clips.json');
const estado = fs.existsSync(jf) ? JSON.parse(fs.readFileSync(jf, 'utf8')) : {};
// Formato POV: 1–2 clips de fondo para todo el vídeo (# fondo:). Formato clips: uno por línea.
const K = lineas.fondo ? 'fondo' : 'lineas';
const objetivos = lineas.fondo ? lineas.fondo.slice(0, 2).map((q) => ({busqueda: q})) : lineas;
estado[K] ??= [];

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
// Con calma: Mixkit corta (429) si se le piden muchas páginas seguidas
const get = async (url) => {
  for (let intento = 0; intento < 4; intento++) {
    await espera(1200);
    const r = await fetch(url, {headers: UA});
    if (r.status === 429) {
      console.log('  (Mixkit pide esperar… 30 s)');
      await espera(30000);
      continue;
    }
    return r.ok ? r.text() : '';
  }
  return '';
};
const slugQ = (q) => q.trim().replace(/\s+/g, '-');

// Sin personas: se descartan clips cuyo título nombra a alguien
const PERSONAS = /(^|-)(man|men|woman|women|girl|girls|boy|boys|person|people|couple|child|children|kid|kids|baby|face|portrait|family|friends|lady|guy|businessman|bride|groom|mother|father|student|worker|model|dancer)(-|$)/;

async function candidatos(q) {
  const s = slugQ(q);
  const urls = [
    `${BASE}/free-stock-video/${s}/?orientation=vertical`,
    `${BASE}/free-stock-video/${s}/`,
    `${BASE}/free-stock-video/discover/${s}/?orientation=vertical`,
    `${BASE}/free-stock-video/discover/${s}/`,
  ];
  const out = [];
  for (const url of urls) {
    if (out.length >= 8) break;
    const html = await get(url);
    for (const m of html.matchAll(/href="\/free-stock-video\/([a-z0-9-]+-(\d+))\/"/g)) {
      if (out.find((c) => c.id === m[2]) || PERSONAS.test(m[1])) continue;
      out.push({slug: m[1], id: m[2], vertical: url.includes('vertical')});
    }
  }
  // primero los que nombran la búsqueda en el título, y los verticales
  const palabras = q.split(/\s+/);
  const puntos = (c) => (palabras.some((p) => c.slug.includes(p)) ? 2 : 0) + (c.vertical ? 1 : 0);
  return out.map((c, i) => ({c, i})).sort((a, b) => puntos(b.c) - puntos(a.c) || a.i - b.i).map((x) => x.c);
}

async function descargar(c) {
  const html = await get(`${BASE}/free-stock-video/${c.slug}/`);
  if (!/Stock Video Free License/.test(html)) return null; // solo licencia libre
  const urls = [...html.matchAll(/https:\/\/assets\.mixkit\.co\/[^"']+?-(\d+)\.mp4/g)].map((m) => ({u: m[0], h: +m[1]}));
  if (!urls.length) return null;
  urls.sort((a, b) => b.h - a.h);
  const best = urls.find((x) => x.h <= 1080) || urls[0];
  const f = path.join(cdir, `raw-${c.id}.mp4`);
  if (!fs.existsSync(f)) {
    const r = await fetch(best.u, {headers: UA});
    if (!r.ok) return null;
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  const titulo = (html.match(/<title>([^<|]+)/) || [, c.slug])[1].trim();
  return {id: c.id, archivo: path.basename(f), titulo, url: `${BASE}/free-stock-video/${c.slug}/`};
}

const usados = () => new Set(estado[K].filter(Boolean).map((l) => l.clip?.id));
const otro = args.includes('--otro') ? +args[args.indexOf('--otro') + 1] - 1 : -1;
let fallos = 0;

for (let i = 0; i < objetivos.length; i++) {
  const q = objetivos[i].busqueda;
  if (q === 'texto' || q === '=') {
    estado[K][i] = {busqueda: q, candidatos: [], idx: -1, clip: null};
    console.log(`${i + 1}. [${q}] → ${q === '=' ? 'sigue el clip anterior' : 'tarjeta de texto'}`);
    continue;
  }
  let e = estado[K][i];
  const cambiaQ = !e || e.busqueda !== q;
  if (!cambiaQ && i !== otro && e.clip) continue;
  if (cambiaQ || !e.candidatos.length) e = estado[K][i] = {busqueda: q, candidatos: await candidatos(q), idx: -1, clip: null};
  const ya = usados();
  let ok = null;
  for (let j = e.idx + 1; j < e.candidatos.length && !ok; j++) {
    const c = e.candidatos[j];
    if (ya.has(c.id)) continue;
    ok = await descargar(c);
    e.idx = j;
  }
  fs.writeFileSync(jf, JSON.stringify(estado, null, 1)); // se guarda por línea: si se corta, sigue donde iba
  if (ok) {
    e.clip = ok;
    fs.writeFileSync(jf, JSON.stringify(estado, null, 1));
    console.log(`${i + 1}. [${q}] → ${ok.titulo}`);
  } else {
    fallos++;
    console.log(`${i + 1}. [${q}] → SIN CLIP (prueba otra búsqueda de 1–2 palabras en inglés)`);
  }
}
estado[K].length = objetivos.length;
fs.writeFileSync(jf, JSON.stringify(estado, null, 1));
fs.writeFileSync(
  path.join(dir, 'out', 'creditos.txt'),
  'Vídeos: Mixkit (Stock Video Free License)\n' + estado[K].filter((l) => l?.clip).map((l) => `- ${l.clip.titulo}: ${l.clip.url}`).join('\n') + '\n',
);
console.log(fallos ? `FALLO · ${fallos} líneas sin clip` : `OK · ${objetivos.length} clips${lineas.fondo ? ' de fondo' : ''}`);
