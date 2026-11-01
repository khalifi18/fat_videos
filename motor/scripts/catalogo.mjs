// Hoja con todas las escenas dibujadas (antes y después del momento clave), para revisarlas.
//   node motor/scripts/catalogo.mjs [escena1,escena2…]   → catalogo.jpg en la raíz del proyecto
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {raiz} from './guion.mjs';

const motor = path.join(raiz, 'motor');
const lista = (process.argv[2] || 'puerta,arbol,arbol:raices,semilla,camino,vela,luna,te,madre,pajaro,lluvia,corazon,casa,mar,reloj,gente:hablan').split(',');
const tmp = path.join(motor, '.catalogo');
fs.rmSync(tmp, {recursive: true, force: true});
fs.mkdirSync(tmp, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(motor, 'src', 'index.ts'), publicDir: path.join(motor, 'public')});
let n = 0;
for (const item of lista) {
  const [escena, ...opts] = item.split(':');
  const inputProps = {escena, opts, k: 45, d: 150};
  const composition = await selectComposition({serveUrl, id: 'Escena', inputProps});
  for (const frame of [30, 110]) {
    await renderStill({composition, serveUrl, frame, inputProps, output: path.join(tmp, `c_${String(n++).padStart(2, '0')}.jpg`), imageFormat: 'jpeg', scale: 0.25});
  }
}
const cols = 8, rows = Math.ceil(n / cols);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(tmp, 'c_%02d.jpg'), '-vf', `tile=${cols}x${rows}:padding=4:color=white`, '-frames:v', '1', path.join(raiz, 'catalogo.jpg')]);
console.log(`OK · ${lista.length} escenas → catalogo.jpg`);
