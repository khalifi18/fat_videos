// Mezcla la voz con la música de un vídeo ya montado (out/video.mp4 solo con voz): la música baja sola cuando habla la voz
// y se iguala el volumen final (-14 LUFS). Música: la primera .mp3 de videos/<slug>/musica/.
//   node motor/scripts/mezclar.mjs videos/<slug>
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.argv[2] || '');
const out = path.join(dir, 'out');
const video = path.join(out, 'video.mp4');
const voz = path.join(dir, 'audio.mp3');
const mdir = path.join(dir, 'musica');
const musica = fs.existsSync(mdir) ? fs.readdirSync(mdir).filter((x) => x.endsWith('.mp3')).map((x) => path.join(mdir, x))[0] : null;
if (!fs.existsSync(video) || !fs.existsSync(voz) || !musica) {
  console.log('Uso: node motor/scripts/mezclar.mjs videos/<slug>  (hace falta out/video.mp4, audio.mp3 y musica/*.mp3)');
  process.exit(1);
}
const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video]).toString().trim());
const tmp = path.join(out, 'con-musica.mp4');
const filtro = [
  `[1:a]highpass=f=70,acompressor=threshold=-21dB:ratio=3:attack=5:release=140,asplit=2[v1][v2]`,
  `[2:a]volume=0.30,afade=t=in:d=1.2,afade=t=out:st=${(dur - 2.2).toFixed(2)}:d=2.2[m0]`,
  `[m0][v2]sidechaincompress=threshold=0.03:ratio=9:attack=25:release=450:makeup=1[m]`,
  `[v1][m]amix=inputs=2:normalize=0:duration=longest,apad,loudnorm=I=-14:TP=-1.5:LRA=7[a]`,
].join(';');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', video, '-i', voz, '-stream_loop', '-1', '-i', musica, '-filter_complex', filtro, '-map', '0:v', '-map', '[a]', '-t', String(dur), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', tmp]);
fs.renameSync(tmp, video);
console.log(`OK · voz + música mezcladas (${dur.toFixed(1)} s) → ${video}`);
