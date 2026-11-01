// Render del vídeo.
//   node motor/scripts/render.mjs videos/<slug>            → out/video.mp4 + out/portada.jpg
//   node motor/scripts/render.mjs videos/<slug> --hoja     → out/hoja.jpg (un fotograma por frase, para revisar)
//   node motor/scripts/render.mjs videos/<slug> --still 4.2 → out/still.png (un instante, en segundos)
//   node motor/scripts/render.mjs videos/<slug> --portada   → solo out/portada.jpg
// Antes: voz.mjs (voz y tiempos) y stock.mjs (clips).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {leerGuion, config, raiz} from './guion.mjs';

const dir = path.resolve(process.argv[2] || '');
const args = process.argv.slice(3);
if (!process.argv[2] || !fs.existsSync(path.join(dir, 'guion.txt'))) {
  console.log('Uso: node motor/scripts/render.mjs videos/<slug> [--hoja|--still S|--portada]');
  process.exit(1);
}
const FPS = 30;
const motor = path.join(raiz, 'motor');
const pub = path.join(motor, 'public');
const slug = path.basename(dir);
const out = path.join(dir, 'out');
fs.mkdirSync(out, {recursive: true});
const cfg = config();
const lineas = leerGuion(dir);
const fallo = (m) => {
  console.log(`FALLO · ${m}`);
  process.exit(1);
};
const wf = path.join(dir, 'words.json');
if (!fs.existsSync(wf)) fallo('falta words.json: ejecuta antes voz.mjs');
const palabras = JSON.parse(fs.readFileSync(wf, 'utf8'));
const total = lineas.reduce((a, l) => a + l.words.length, 0);
if (palabras.length !== total) fallo(`el texto en darija cambió (${total} palabras, words.json tiene ${palabras.length}): vuelve a ejecutar voz.mjs`);
const cj = path.join(dir, 'clips.json');
const cjson = fs.existsSync(cj) ? JSON.parse(fs.readFileSync(cj, 'utf8')) : {};
const modo = lineas.formato;
const pov = modo === 'pov';

const finVoz = palabras[palabras.length - 1].e;
const duracion = finVoz + 0.3 + 2.4; // voz + respiro + cierre
const durF = Math.ceil(duracion * FPS);
const tiempos = lineas.map((_, i) => {
  const ws = palabras.filter((w) => w.l === i);
  return {ini: ws[0].s, fin: ws[ws.length - 1].e};
});
const desde = (i) => (i === 0 ? 0 : Math.round(tiempos[i].ini * FPS) - 4);
const hasta = (i) => (i === lineas.length - 1 ? durF : desde(i + 1) + 8);

// Prepara un clip: vertical 1080×1920, 30 fps, sin audio, de la duración pedida (en bucle si hace falta)
const cdir = path.join(pub, 'clips', slug);
fs.mkdirSync(cdir, {recursive: true});
const preparar = (archivo, seg, nombre) => {
  const dst = path.join(cdir, `${nombre}.mp4`);
  const meta = `${dst}.txt`;
  const firma = `${archivo}|${seg}`;
  if (!fs.existsSync(dst) || !fs.existsSync(meta) || fs.readFileSync(meta, 'utf8') !== firma) {
    execFileSync('ffmpeg', [
      '-v', 'error', '-y', '-stream_loop', '-1', '-i', path.join(dir, 'clips', archivo), '-t', seg,
      '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1',
      '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', dst,
    ]);
    fs.writeFileSync(meta, firma);
  }
  return `clips/${slug}/${nombre}.mp4`;
};

let planos;
if (modo === 'hikma') {
  planos = [];
} else if (modo === 'historia' && lineas.mundo) {
  planos = []; // mundo 3D continuo: la cámara va al plano de cada línea
} else if (modo === 'historia') {
  // un dibujo por línea; el momento clave cae al 40 % de la frase
  planos = lineas.map((l, i) => {
    const a = desde(i), b = hasta(i);
    if (l.busqueda === 'texto') return {texto: l.texto, a, b};
    const [escena, ...opts] = (l.busqueda || 'luna').split(/\s+/);
    const k = Math.round((tiempos[i].ini + 0.4 * (tiempos[i].fin - tiempos[i].ini)) * FPS) - a;
    return {texto: '', escena, opts, k, a, b};
  });
} else if (pov) {
  // Formato POV: 1–2 clips de fondo que cubren todo el vídeo
  const fondos = (cjson.fondo || []).filter((f) => f?.clip);
  if (!fondos.length || fondos.length < Math.min(2, lineas.fondo.length)) fallo('faltan clips de fondo: ejecuta stock.mjs');
  const n = fondos.length;
  planos = fondos.map((f, k) => {
    const a = Math.round((k * durF) / n);
    const b = k === n - 1 ? durF : Math.round(((k + 1) * durF) / n) + 12;
    return {texto: '', a, b, clip: preparar(f.clip.archivo, ((b - a) / FPS + 0.4).toFixed(2), `fondo-${k}`)};
  });
} else {
  // Formato clips: uno por línea; [=] alarga el plano anterior
  const clips = cjson.lineas || [];
  const planosLineas = [];
  lineas.forEach((l, i) => {
    if (l.busqueda === '=' && planosLineas.length) planosLineas[planosLineas.length - 1].hasta = i;
    else planosLineas.push({desde: i, hasta: i});
  });
  planos = planosLineas.map(({desde: li, hasta: lf}) => {
    const a = desde(li), b = hasta(lf);
    const l = lineas[li];
    if (l.busqueda === 'texto') return {texto: l.texto, clip: null, a, b};
    const c = clips[li]?.clip;
    if (!c || clips[li].busqueda !== l.busqueda) fallo(`línea ${li + 1} sin clip: ejecuta stock.mjs`);
    return {texto: l.texto, a, b, clip: preparar(c.archivo, ((b - a) / FPS + 0.4).toFixed(2), String(li).padStart(2, '0'))};
  });
}
const lineasProps = lineas.map((l, i) => ({
  es: l.es,
  ini: tiempos[i].ini,
  fin: tiempos[i].fin,
  arabe: (pov || modo === 'hikma' || (modo === 'historia' && lineas.mundo)) && l.busqueda === 'texto' ? l.texto : null,
}));

const props = {audio: null, modo, firma: cfg.firma, cierre: cfg.cierre, finVoz, duracion, lineas: lineasProps, planos, pov: pov || modo === 'hikma' ? lineas.pov || '' : null, color: lineas.color, elemento: lineas.elemento};
if (modo === 'historia') props.historia = path.basename(dir);
if (modo === 'historia' && lineas.mundo) {
  props.mundo = lineas.mundo;
  let previo = 'general';
  props.tramos = lineas.map((l, i) => {
    const pl = (l.busqueda || 'general').split(/\s+/)[0];
    if (pl !== 'texto') previo = pl; // en el refrán/aleya la cámara sigue donde estaba
    return {plano: previo, t: i === 0 ? 0 : Math.max(0, tiempos[i].ini - 0.2)};
  });
}
// 3D: WebGL por software si no hay GPU (REMOTION_GL=angle | swangle | swiftshader)
const chromiumOptions = {gl: process.env.REMOTION_GL || 'angle'};
// En la nube se usa el Chromium ya instalado (REMOTION_BROWSER lo pone setup.sh)
const browserExecutable = process.env.REMOTION_BROWSER || null;
const audio = path.join(dir, 'audio.mp3');
if (fs.existsSync(audio)) {
  fs.mkdirSync(path.join(pub, 'audio'), {recursive: true});
  fs.copyFileSync(audio, path.join(pub, 'audio', `${slug}.mp3`));
  props.audio = `audio/${slug}.mp3`;
} else {
  console.log('AVISO · sin audio.mp3: vídeo mudo con tiempos estimados');
}

const serveUrl = await bundle({entryPoint: path.join(motor, 'src', 'index.ts'), publicDir: pub});
const composition = await selectComposition({serveUrl, id: 'Video', inputProps: props, chromiumOptions, browserExecutable});

const still = async (frame, output, extra = {}, scale = 1) =>
  renderStill({
    chromiumOptions,
    browserExecutable,
    composition: {...composition, props: {...composition.props, ...extra}},
    serveUrl,
    frame: Math.min(composition.durationInFrames - 1, Math.max(0, Math.round(frame))),
    output,
    inputProps: {...props, ...extra},
    scale,
    imageFormat: output.endsWith('.png') ? 'png' : 'jpeg',
    jpegQuality: 90,
  });
const portada = () => still(Math.min(desde(1) - 2, FPS * 1.2), path.join(out, 'portada.jpg'), {portada: true});

if (args.includes('--hoja')) {
  const hd = path.join(out, 'hoja');
  fs.mkdirSync(hd, {recursive: true});
  for (const f of fs.readdirSync(hd)) fs.unlinkSync(path.join(hd, f));
  const frames = lineas.map((_, i) => (tiempos[i].ini + tiempos[i].fin) / 2 * FPS);
  frames.push(composition.durationInFrames - 10);
  for (let i = 0; i < frames.length; i++) await still(frames[i], path.join(hd, `h_${String(i).padStart(2, '0')}.jpg`), {}, 0.3);
  const cols = 4, rows = Math.ceil(frames.length / cols);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(hd, 'h_%02d.jpg'), '-vf', `tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', path.join(out, 'hoja.jpg')]);
  console.log(`OK · hoja con ${frames.length} fotogramas → ${path.join(out, 'hoja.jpg')}`);
} else if (args.includes('--portada')) {
  await portada();
  console.log(`OK · ${path.join(out, 'portada.jpg')}`);
} else if (args.includes('--rango')) {
  // render parcial para máquinas lentas: --rango 0-299 → out/parte-0000.mp4 (luego se unen con ffmpeg concat)
  const [a, b] = args[args.indexOf('--rango') + 1].split('-').map(Number);
  const fin = Math.min(b, composition.durationInFrames - 1);
  await renderMedia({chromiumOptions, browserExecutable, concurrency: 1, composition, serveUrl, codec: 'h264', crf: 18, audioCodec: 'aac', frameRange: [a, fin], outputLocation: path.join(out, `parte-${String(a).padStart(4, '0')}.mp4`), inputProps: props});
  console.log(`OK · fotogramas ${a}-${fin} de ${composition.durationInFrames}`);
} else if (args.includes('--still')) {
  const s = parseFloat(args[args.indexOf('--still') + 1]);
  await still(s * FPS, path.join(out, 'still.png'));
  console.log(`OK · ${path.join(out, 'still.png')}`);
} else {
  let ult = -1;
  await renderMedia({
    chromiumOptions,
    browserExecutable,
    composition,
    serveUrl,
    codec: 'h264',
    crf: 18,
    audioCodec: 'aac',
    outputLocation: path.join(out, 'video.mp4'),
    inputProps: props,
    onProgress: ({progress}) => {
      const p = Math.floor(progress * 10);
      if (p !== ult) {
        ult = p;
        process.stdout.write(`${p * 10}% `);
      }
    },
  });
  await portada();
  console.log(`\nOK · ${(composition.durationInFrames / FPS).toFixed(1)} s → ${path.join(out, 'video.mp4')} + portada.jpg`);
}
