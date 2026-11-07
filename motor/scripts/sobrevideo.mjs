// Pone frases encima de un vídeo ya hecho, dejándolo tal cual (con su sonido).
//   node motor/scripts/sobrevideo.mjs videos/<slug>        → out/video.mp4 + out/portada.jpg
//   node motor/scripts/sobrevideo.mjs videos/<slug> --hoja → out/hoja.jpg
// La carpeta lleva: original.mp4 y sobrevideo.json {corte (s), nombre:{ar,es,t}, bloques:[{ar:[..],es,t}], firma?}
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {raiz} from './guion.mjs';

const dir = path.resolve(process.argv[2] || '');
if (!process.argv[2] || !fs.existsSync(path.join(dir, 'sobrevideo.json'))) {
  console.log('Uso: node motor/scripts/sobrevideo.mjs videos/<slug> [--hoja]  (falta sobrevideo.json)');
  process.exit(1);
}
const args = process.argv.slice(3);
const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'sobrevideo.json'), 'utf8'));
const motor = path.join(raiz, 'motor');
const pub = path.join(motor, 'public');
const out = path.join(dir, 'out');
fs.mkdirSync(out, {recursive: true});
fs.mkdirSync(path.join(pub, 'sobrevideo'), {recursive: true});
const duracion = cfg.corte;
const fondo = path.join(pub, 'sobrevideo', 'fondo.mp4');
execFileSync('ffmpeg', [
  '-v', 'error', '-y', '-i', path.join(dir, 'original.mp4'), '-t', String(duracion),
  '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,setsar=1',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', fondo,
]);
const props = {video: 'sobrevideo/fondo.mp4', duracion, nombre: cfg.nombre, bloques: cfg.bloques, firma: cfg.firma || 'Fatima Andalussi'};
const chromiumOptions = {gl: process.env.REMOTION_GL || 'angle'};
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.join(motor, 'src', 'index.ts'), publicDir: pub});
const composition = await selectComposition({serveUrl, id: 'SobreVideo', inputProps: props, chromiumOptions, browserExecutable});
const still = (seg, output, scale = 1) => renderStill({chromiumOptions, browserExecutable, composition, serveUrl, frame: Math.min(composition.durationInFrames - 1, Math.round(seg * 30)), output, inputProps: props, scale, imageFormat: 'jpeg', jpegQuality: 92});
if (args.includes('--hoja')) {
  const hd = path.join(out, 'hoja');
  fs.mkdirSync(hd, {recursive: true});
  const ts = [0.4, 1.6, 3.2, 5.4, 7.8, duracion - 1.5];
  for (let i = 0; i < ts.length; i++) await still(ts[i], path.join(hd, `h_${i}.jpg`), 0.3);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(hd, 'h_%d.jpg'), '-vf', 'tile=6x1:padding=6:color=white', '-frames:v', '1', path.join(out, 'hoja.jpg')]);
  console.log(`OK · hoja → ${path.join(out, 'hoja.jpg')}`);
} else {
  await still(cfg.portada ?? duracion - 1.5, path.join(out, 'portada.jpg'));
  await renderMedia({chromiumOptions, browserExecutable, composition, serveUrl, codec: 'h264', crf: 18, audioCodec: 'aac', outputLocation: path.join(out, 'video.mp4'), inputProps: props});
  console.log(`OK · ${duracion.toFixed(1)} s → ${path.join(out, 'video.mp4')} + portada.jpg`);
}
