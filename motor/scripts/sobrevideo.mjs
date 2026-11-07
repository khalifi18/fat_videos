// Pone frases encima de un vídeo ya hecho, dejándolo tal cual (con su sonido).
//   node motor/scripts/sobrevideo.mjs videos/<slug>        → out/video.mp4 + out/portada.jpg
//   node motor/scripts/sobrevideo.mjs videos/<slug> --hoja → out/hoja.jpg
// La carpeta lleva: original.mp4 y sobrevideo.json {corte (s), nombre:{ar,es,t}, bloques:[{ar:[..],es,t}], firma?}
// Con voz (voz.mjs → audio.mp3 + words.json) y sync:true: nombre = línea 0 de la voz, bloque i = línea i+1; el vídeo se
// ralentiza lo justo para durar lo que dura la voz, el sonido original se quita y se mezcla la voz con la música
// (primera .mp3 de videos/<slug>/musica/, por ejemplo de Mixkit, que es libre de derechos).
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
const RETRASO = 0.6; // la voz empieza un poco después
const vozF = path.join(dir, 'audio.mp3');
const wordsF = path.join(dir, 'words.json');
const conVoz = !!cfg.sync && fs.existsSync(vozF) && fs.existsSync(wordsF);
const mdir = path.join(dir, 'musica');
const musica = fs.existsSync(mdir) ? fs.readdirSync(mdir).filter((x) => x.endsWith('.mp3')).map((x) => path.join(mdir, x))[0] : null;
let duracion = cfg.corte;
let nombre = cfg.nombre;
let bloques = cfg.bloques;
if (conVoz) {
  const w = JSON.parse(fs.readFileSync(wordsF, 'utf8'));
  const ini = (l) => w.find((x) => x.l === l).s + RETRASO;
  nombre = {...cfg.nombre, t: ini(0)};
  bloques = cfg.bloques.map((b, i) => ({...b, t: ini(i + 1)}));
  duracion = w[w.length - 1].e + RETRASO + 1.8;
}
const lento = Math.max(1, duracion / cfg.corte); // ralentiza el vídeo si la voz dura más que el vídeo
const fondo = path.join(pub, 'sobrevideo', 'fondo.mp4');
execFileSync('ffmpeg', [
  '-v', 'error', '-y', ...(cfg.inicio ? ['-ss', String(cfg.inicio)] : []), '-i', path.join(dir, 'original.mp4'), '-t', String(cfg.corte),
  '-vf', `scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,unsharp=5:5:0.7,setpts=${lento.toFixed(4)}*PTS,fps=30,setsar=1`,
  '-t', String(duracion),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', ...(conVoz ? ['-an'] : ['-c:a', 'aac', '-b:a', '192k']), fondo,
]);
const props = {video: 'sobrevideo/fondo.mp4', duracion, nombre, bloques, firma: cfg.firma || 'Fatima Andalussi'};
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
  if (!conVoz) {
    await renderMedia({chromiumOptions, browserExecutable, composition, serveUrl, codec: 'h264', crf: 18, audioCodec: 'aac', outputLocation: path.join(out, 'video.mp4'), inputProps: props});
  } else {
    const mudo = path.join(out, 'mudo.mp4');
    await renderMedia({chromiumOptions, browserExecutable, composition, serveUrl, codec: 'h264', crf: 18, outputLocation: mudo, inputProps: props, muted: true});
    const ent = ['-i', mudo, '-i', vozF];
    const pistas = [`[1:a]adelay=${Math.round(RETRASO * 1000)}:all=1,volume=1.0[v]`];
    if (musica) {
      ent.push('-stream_loop', '-1', '-i', musica);
      pistas.push(`[2:a]volume=0.2,afade=t=in:d=1.2,afade=t=out:st=${(duracion - 2).toFixed(2)}:d=2[m]`);
    }
    const mezcla = pistas.map((q) => q.slice(q.lastIndexOf('['))).join('');
    execFileSync('ffmpeg', ['-v', 'error', '-y', ...ent, '-filter_complex', `${pistas.join(';')};${mezcla}amix=inputs=${pistas.length}:normalize=0:duration=longest[a]`, '-map', '0:v', '-map', '[a]', '-t', String(duracion), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', path.join(out, 'video.mp4')]);
    fs.unlinkSync(mudo);
  }
  console.log(`OK · ${duracion.toFixed(1)} s → ${path.join(out, 'video.mp4')} + portada.jpg`);
}
