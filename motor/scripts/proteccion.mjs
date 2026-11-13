// Vídeo «protección»: una persona real (clip de vídeo libre) dentro de una esfera de luz, con el texto y la voz.
//   node motor/scripts/proteccion.mjs videos/<slug>   (--hoja para vista previa)
// La carpeta lleva: original.mp4 (el clip), guion.txt + audio.mp3 + words.json (voz), musica/*.mp3 y proteccion.json
// {inicio, recorteX (0-1: centro del recorte horizontal), burbuja:{cx,cy,r}, amanecer (s), portada (s)}
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {leerGuion, raiz} from './guion.mjs';

const dir = path.resolve(process.argv[2] || '');
const args = process.argv.slice(3);
const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'proteccion.json'), 'utf8'));
const motor = path.join(raiz, 'motor');
const pub = path.join(motor, 'public');
const out = path.join(dir, 'out');
fs.mkdirSync(out, {recursive: true});
fs.mkdirSync(path.join(pub, 'sobrevideo'), {recursive: true});
const lineas = leerGuion(dir);
const w = JSON.parse(fs.readFileSync(path.join(dir, 'words.json'), 'utf8'));
const L = lineas.map((l, i) => {
  const ws = w.filter((x) => x.l === i);
  return {ar: l.busqueda === 'texto' ? l.texto : null, es: l.es, t: ws[0].s, fin: ws[ws.length - 1].e};
});
const duracion = w[w.length - 1].e + 1.8;
const dOrig = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(dir, 'original.mp4')]).toString().trim()) - (cfg.inicio || 0);
const lento = Math.max(1, duracion / dOrig);
// el clip es horizontal: se recorta una franja de 640 px que contenga a la persona, se pone en el centro y el resto se rellena con
// el mismo clip muy desenfocado y oscuro (así la persona se ve entera y no hace falta recortarla)
const x0 = Math.max(0, Math.min(640, cfg.x0 ?? 120));
const fondo = path.join(pub, 'sobrevideo', 'fondo.mp4');
const fc = [
  `[0:v]split=2[a][b]`,
  `[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:4,eq=brightness=-0.18:saturation=0.8[bg]`,
  `[b]crop=640:720:${x0}:0,scale=1080:1215:flags=lanczos,unsharp=5:5:0.7[fg]`,
  `[bg][fg]overlay=0:(H-h)/2,setpts=${lento.toFixed(4)}*PTS,fps=30,setsar=1[v]`,
].join(';');
execFileSync('ffmpeg', ['-v', 'error', '-y', ...(cfg.inicio ? ['-ss', String(cfg.inicio)] : []), '-i', path.join(dir, 'original.mp4'), '-filter_complex', fc, '-map', '[v]',
  '-t', String(duracion), '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', fondo]);
const props = {video: 'sobrevideo/fondo.mp4', duracion, lineas: L, firma: 'Fatima Andalussi', burbuja: cfg.burbuja, amanecer: cfg.amanecer};
const chromiumOptions = {gl: process.env.REMOTION_GL || 'angle'};
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.join(motor, 'src', 'index.ts'), publicDir: pub});
const composition = await selectComposition({serveUrl, id: 'Proteccion', inputProps: props, chromiumOptions, browserExecutable});
const still = (seg, output, scale = 1) => renderStill({chromiumOptions, browserExecutable, composition, serveUrl, frame: Math.min(composition.durationInFrames - 1, Math.round(seg * 30)), output, inputProps: props, scale, imageFormat: 'jpeg', jpegQuality: 92});
if (args.includes('--hoja')) {
  const hd = path.join(out, 'hoja');
  fs.mkdirSync(hd, {recursive: true});
  const ts = L.map((l) => (l.t + l.fin) / 2);
  ts.push(duracion - 1.2);
  for (let i = 0; i < ts.length; i++) await still(ts[i], path.join(hd, `h_${i}.jpg`), 0.3);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(hd, 'h_%d.jpg'), '-vf', `tile=${ts.length}x1:padding=6:color=white`, '-frames:v', '1', path.join(out, 'hoja.jpg')]);
  console.log('OK · hoja');
} else {
  await still(cfg.portada ?? (L[2]?.t ?? 4) + 0.6, path.join(out, 'portada.jpg'));
  await renderMedia({chromiumOptions, browserExecutable, composition, serveUrl, codec: 'h264', crf: 14, concurrency: 1, outputLocation: path.join(out, 'video.mp4'), inputProps: props, muted: true});
  console.log(`OK · ${duracion.toFixed(1)} s → ${path.join(out, 'video.mp4')}`);
}
