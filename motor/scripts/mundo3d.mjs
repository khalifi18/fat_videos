// Renderiza solo un mundo 3D (sin texto ni voz) como vídeo de fondo: videos/<slug>/original.mp4
//   node motor/scripts/mundo3d.mjs videos/<slug> <mundo> <plano> <segundos>
//   ej.: node motor/scripts/mundo3d.mjs videos/bosque-3d otono caminar 16
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {raiz} from './guion.mjs';

const [d, mundo, plano, seg] = process.argv.slice(2);
if (!d || !mundo || !plano || !seg) {
  console.log('Uso: node motor/scripts/mundo3d.mjs videos/<slug> <mundo> <plano> <segundos>');
  process.exit(1);
}
const dir = path.resolve(d);
fs.mkdirSync(dir, {recursive: true});
const motor = path.join(raiz, 'motor');
const props = {mundo, tramos: [{plano, t: 0}], duracion: Number(seg)};
const chromiumOptions = {gl: process.env.REMOTION_GL || 'angle'};
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.join(motor, 'src', 'index.ts'), publicDir: path.join(motor, 'public')});
const composition = await selectComposition({serveUrl, id: 'SoloMundo', inputProps: props, chromiumOptions, browserExecutable});
if (process.argv.includes('--foto')) {
  const {renderStill} = await import('@remotion/renderer');
  await renderStill({chromiumOptions, browserExecutable, composition, serveUrl, frame: 90, output: path.join(dir, 'foto.jpg'), inputProps: props, imageFormat: 'jpeg', jpegQuality: 90, scale: 0.4});
  console.log('OK · foto.jpg');
} else {
  await renderMedia({chromiumOptions, browserExecutable, composition, serveUrl, codec: 'h264', crf: 17, outputLocation: path.join(dir, 'original.mp4'), inputProps: props, muted: true});
  console.log(`OK · ${seg} s → ${path.join(dir, 'original.mp4')}`);
}
