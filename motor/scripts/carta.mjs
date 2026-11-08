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
const props = {firma: cfg.firma, cierre: cfg.cierre, lineas: carta.lineas, fondo: carta.fondo || 'mesa', escala: carta.escala || 1};
// Con voz (voz.mjs → audio.mp3 + words.json): cada palabra aparece cuando se dice.
const RETRASO = 0.5; // la voz empieza medio segundo después
const vozF = path.join(dir, 'audio.mp3');
const conVoz = fs.existsSync(vozF) && fs.existsSync(path.join(dir, 'words.json'));
if (conVoz) {
  const w = JSON.parse(fs.readFileSync(path.join(dir, 'words.json'), 'utf8'));
  props.tiempos = carta.lineas.map((_, i) => w.filter((x) => x.l === i).map((x) => x.s + RETRASO));
  props.tiempos.forEach((t, i) => {
    const n = carta.lineas[i].ar.split(/\s+/).length;
    if (t.length !== n) throw new Error(`línea ${i + 1}: ${n} palabras en carta.json y ${t.length} en la voz`);
  });
  props.finVoz = w[w.length - 1].e + RETRASO;
}
// Música de fondo opcional: la primera .mp3 de videos/<slug>/musica/
const mdir = path.join(dir, 'musica');
const musica = fs.existsSync(mdir) ? fs.readdirSync(mdir).filter((x) => x.endsWith('.mp3')).map((x) => path.join(mdir, x))[0] : null;
const motor = path.join(raiz, 'motor');
const chromiumOptions = {gl: process.env.REMOTION_GL || 'angle'};
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.join(motor, 'src', 'index.ts'), publicDir: path.join(motor, 'public')});
const composition = await selectComposition({serveUrl, id: 'Carta', inputProps: props, chromiumOptions, browserExecutable});
const still = (frame, output, extra = {}, scale = 1) =>
  renderStill({chromiumOptions, browserExecutable, composition: {...composition, props: {...composition.props, ...extra}}, serveUrl, frame: Math.min(composition.durationInFrames - 1, Math.round(frame)), output, inputProps: {...props, ...extra}, scale, imageFormat: 'jpeg', jpegQuality: 90});

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
    await renderMedia({chromiumOptions, browserExecutable, composition, serveUrl, codec: 'h264', crf: 12, outputLocation: mudo, inputProps: props, muted: true});
    const dur = composition.durationInFrames / 30;
    const ent = ['-i', mudo];
    // Sonido cuidado: la voz va limpia (filtro de graves y compresor suave); la música baja sola mientras habla la voz
    // (sidechain) y sube un poco en las pausas; al final se iguala el volumen (-14 LUFS, como piden TikTok e Instagram).
    let filtro;
    if (conVoz) {
      ent.push('-i', vozF);
      if (musica) {
        ent.push('-i', musica);
        filtro = [
          `[1:a]adelay=${RETRASO * 1000}:all=1,highpass=f=70,acompressor=threshold=-21dB:ratio=3:attack=5:release=140,volume=1.0,asplit=2[v1][v2]`,
          `[2:a]volume=0.30,afade=t=in:d=1.2,afade=t=out:st=${(dur - 2.2).toFixed(2)}:d=2.2[m0]`,
          `[m0][v2]sidechaincompress=threshold=0.03:ratio=9:attack=25:release=450:makeup=1[m]`,
          `[v1][m]amix=inputs=2:normalize=0:duration=longest,apad,loudnorm=I=-14:TP=-1.5:LRA=7[a]`,
        ].join(';');
      } else {
        filtro = `[1:a]adelay=${RETRASO * 1000}:all=1,highpass=f=70,acompressor=threshold=-21dB:ratio=3:attack=5:release=140,apad,loudnorm=I=-14:TP=-1.5:LRA=7[a]`;
      }
    } else if (musica) {
      ent.push('-i', musica);
      filtro = `[1:a]volume=0.6,afade=t=in:d=0.8,afade=t=out:st=${(dur - 2).toFixed(2)}:d=2,apad[a]`;
    } else {
      ent.push('-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo'); // pista muda: algunas apps rechazan vídeos sin audio
    }
    execFileSync('ffmpeg', ['-v', 'error', '-y', ...ent, ...(filtro ? ['-filter_complex', filtro, '-map', '0:v', '-map', '[a]'] : ['-map', '0:v', '-map', '1:a']), '-t', String(dur), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', path.join(out, 'video.mp4')]);
    fs.unlinkSync(mudo);
  }
  await still(0, path.join(out, 'portada.jpg'), {portada: true});
  console.log(`OK · ${(composition.durationInFrames / 30).toFixed(1)} s → out/video.mp4 + portada.jpg`);
}
