// Formato «carta» (frase escrita en una hoja, sin voz).
//   node motor/scripts/carta.mjs videos/<slug>            → out/video.mp4 + out/portada.jpg
//   node motor/scripts/carta.mjs videos/<slug> --fotos 2,5,9 → out/fotos.jpg
// Lee videos/<slug>/carta.json: {"lineas": [{"ar": "...", "es": "..."}]}
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {config, raiz} from './guion.mjs';

const dir = path.resolve(process.argv[2] || '');
const args = process.argv.slice(3);
const out = path.join(dir, 'out');
fs.mkdirSync(out, {recursive: true});
const cfg = config();
const carta = JSON.parse(fs.readFileSync(path.join(dir, 'carta.json'), 'utf8'));
const props = {firma: cfg.firma, cierre: cfg.cierre, lineas: carta.lineas};
const motor = path.join(raiz, 'motor');
const chromiumOptions = {gl: process.env.REMOTION_GL || 'angle'};
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.join(motor, 'src', 'index.ts'), publicDir: path.join(motor, 'public')});
const composition = await selectComposition({serveUrl, id: 'Carta', inputProps: props, chromiumOptions, browserExecutable});
const still = (frame, output, extra = {}, scale = 1) =>
  renderStill({chromiumOptions, browserExecutable, composition, serveUrl, frame: Math.min(composition.durationInFrames - 1, Math.round(frame)), output, inputProps: {...props, ...extra}, scale, imageFormat: 'jpeg', jpegQuality: 90});

if (args.includes('--fotos')) {
  const ts = args[args.indexOf('--fotos') + 1].split(',').map(Number);
  const hd = path.join(out, 'fotos');
  fs.rmSync(hd, {recursive: true, force: true});
  fs.mkdirSync(hd);
  for (let i = 0; i < ts.length; i++) await still(ts[i] * 30, path.join(hd, `f_${String(i).padStart(2, '0')}.jpg`), {}, 0.35);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(hd, 'f_%02d.jpg'), '-vf', `tile=${Math.min(4, ts.length)}x${Math.ceil(ts.length / 4)}:padding=6:color=white`, '-frames:v', '1', path.join(out, 'fotos.jpg')]);
  console.log(`OK · fotos.jpg (${(composition.durationInFrames / 30).toFixed(1)} s)`);
} else {
  if (!args.includes('--portada')) {
    const mudo = path.join(out, 'mudo.mp4');
    await renderMedia({chromiumOptions, browserExecutable, composition, serveUrl, codec: 'h264', crf: 18, outputLocation: mudo, inputProps: props, muted: true});
    // pista de audio silenciosa: algunas apps rechazan vídeos sin audio
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', mudo, '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest', '-c:v', 'copy', '-c:a', 'aac', path.join(out, 'video.mp4')]);
    fs.unlinkSync(mudo);
  }
  await still(0, path.join(out, 'portada.jpg'), {portada: true});
  console.log(`OK · ${(composition.durationInFrames / 30).toFixed(1)} s → out/video.mp4 + portada.jpg`);
}
