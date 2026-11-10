// Pone la voz (y música) de Fatima sobre un vídeo que ya lleva su texto escrito, sin tocar el resto del vídeo (queda con su marca original).
//   node motor/scripts/vozsobre.mjs videos/<slug>
// Lleva: original.mp4, guion.txt + audio.mp3 + words.json (una línea por frase escrita), musica/*.mp3, vozsobre.json {corte, inicio:[seg de cada frase], inicioVideo?}
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2] || '');
const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'vozsobre.json'), 'utf8'));
const out = path.join(dir, 'out');
fs.mkdirSync(out, {recursive: true});
const w = JSON.parse(fs.readFileSync(path.join(dir, 'words.json'), 'utf8'));
const mdir = path.join(dir, 'musica');
const musica = fs.existsSync(mdir) ? fs.readdirSync(mdir).filter((x) => x.endsWith('.mp3')).map((x) => path.join(mdir, x))[0] : null;
const lineas = [...new Set(w.map((x) => x.l))];
const dur = cfg.corte;
const ent = ['-ss', String(cfg.inicioVideo || 0), '-i', path.join(dir, 'original.mp4'), '-i', path.join(dir, 'audio.mp3')];
if (musica) ent.push('-stream_loop', '-1', '-i', musica);
const partes = lineas.map((l, k) => {
  const ws = w.filter((x) => x.l === l);
  const a = Math.max(0, ws[0].s - 0.05), b = ws[ws.length - 1].e + 0.08;
  return `[1:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS,adelay=${Math.round(cfg.inicio[k] * 1000)}:all=1[l${k}]`;
});
const mezclaVoz = `${lineas.map((_, k) => `[l${k}]`).join('')}amix=inputs=${lineas.length}:normalize=0:duration=longest,highpass=f=70,acompressor=threshold=-21dB:ratio=3:attack=5:release=140,apad,asplit=2[v1][v2]`;
const fil = [
  `[0:v]scale=1080:1920:flags=lanczos,unsharp=5:5:0.6,drawbox=x=465:y=1782:w=150:h=5:color=0xf2c165:t=fill,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='Fatima Andalussi':fontcolor=white@0.93:fontsize=50:x=(w-text_w)/2:y=1700:shadowcolor=black@0.7:shadowx=2:shadowy=2,fps=30,setsar=1[v]`,
  ...partes,
  mezclaVoz,
];
if (musica) {
  fil.push(`[2:a]volume=0.55,afade=t=in:d=1.2,afade=t=out:st=${(dur - 2.2).toFixed(2)}:d=2.2[m0]`, `[m0][v2]sidechaincompress=threshold=0.03:ratio=10:attack=25:release=700:makeup=1[m]`, `[v1][m]amix=inputs=2:normalize=0:duration=longest,apad,loudnorm=I=-14:TP=-1.5:LRA=7[a]`);
} else {
  fil.push(`[v1]loudnorm=I=-14:TP=-1.5:LRA=7[a]`);
}
execFileSync('ffmpeg', ['-v', 'error', '-y', ...ent, '-filter_complex', fil.join(';'), '-map', '[v]', '-map', '[a]', '-t', String(dur), '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', path.join(out, 'video.mp4')]);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(out, 'video.mp4'), '-ss', String(cfg.portada ?? 5.8), '-frames:v', '1', '-q:v', '2', path.join(out, 'portada.jpg')]);
console.log(`OK · ${dur.toFixed(1)} s → ${path.join(out, 'video.mp4')}`);
