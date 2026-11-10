// Voz + tiempos de cada palabra.
//   node motor/scripts/voz.mjs videos/<slug>             ElevenLabs → audio.mp3 + words.json
//   node motor/scripts/voz.mjs videos/<slug> --estimar   sin voz, tiempos estimados (gratis)
//   node motor/scripts/voz.mjs videos/<slug> --simular   solo dice cuántos caracteres costaría
//   --forzar  regenera aunque el guion no haya cambiado
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {leerGuion, config, clave} from './guion.mjs';

const dir = path.resolve(process.argv[2] || '');
const flags = new Set(process.argv.slice(3));
if (!process.argv[2] || !fs.existsSync(path.join(dir, 'guion.txt'))) {
  console.log('Uso: node motor/scripts/voz.mjs videos/<slug> [--estimar|--simular|--forzar]');
  process.exit(1);
}
const cfg = config();
const lineas = leerGuion(dir);
// «# voz: <id>» y «# idioma: es» en la cabecera del guion cambian la voz solo para ese vídeo
const v = {...cfg.voz, ...(lineas.voz ? {voice_id: lineas.voz} : {}), ...(lineas.idioma ? {language_code: lineas.idioma} : {}), ...(lineas.velocidad ? {speed: lineas.velocidad} : {}), ...(lineas.estabilidad !== null && lineas.estabilidad !== undefined ? {stability: lineas.estabilidad} : {})};
const texto = lineas.map((l) => l.tts).join('\n'); // con etiquetas de emoción [softly]…
const hash = crypto.createHash('sha1').update(JSON.stringify([texto, v])).digest('hex').slice(0, 12);
const metaF = path.join(dir, 'voz.json');
console.log(`Guion: ${lineas.length} líneas · ${texto.length} caracteres · voz ${v.voice_id} · modelo ${v.model_id}`);

if (flags.has('--simular')) process.exit(0);

const guardar = (palabras, modo, extra = {}) => {
  fs.writeFileSync(path.join(dir, 'words.json'), JSON.stringify(palabras, null, 1));
  fs.writeFileSync(metaF, JSON.stringify({hash, modo, caracteres: texto.length, voz: v.voice_id, modelo: v.model_id, fecha: new Date().toISOString(), ...extra}, null, 2));
  const fin = palabras[palabras.length - 1].e;
  console.log(`OK · ${modo} · ${palabras.length} palabras · ${fin.toFixed(1)} s`);
};

if (flags.has('--estimar')) {
  let t = 0.3;
  const out = [];
  lineas.forEach((l, li) => {
    for (const w of l.words) {
      const d = 0.2 + 0.06 * w.w.length;
      out.push({w: w.w, s: +t.toFixed(3), e: +(t + d).toFixed(3), l: li, key: w.key});
      t += d + 0.04;
    }
    t += 0.45;
  });
  try { fs.unlinkSync(path.join(dir, 'audio.mp3')); } catch {}
  guardar(out, 'estimado');
  process.exit(0);
}

if (!flags.has('--forzar') && fs.existsSync(metaF) && fs.existsSync(path.join(dir, 'audio.mp3'))) {
  const m = JSON.parse(fs.readFileSync(metaF, 'utf8'));
  if (m.hash === hash && m.modo === 'elevenlabs') {
    console.log('OK · la voz ya está generada para este guion (0 caracteres gastados)');
    process.exit(0);
  }
}

const key = clave();
if (!key) {
  console.log('FALLO · falta ELEVENLABS_API_KEY (variable de entorno o archivo .env en la carpeta del proyecto)');
  process.exit(1);
}

const url = `https://api.elevenlabs.io/v1/text-to-speech/${v.voice_id}/with-timestamps?output_format=mp3_44100_128`;
const body = {
  text: texto,
  model_id: v.model_id,
  // solo los ajustes definidos en darija.json (eleven_v4 no admite style)
  voice_settings: Object.fromEntries(
    Object.entries({stability: v.stability, similarity_boost: v.similarity_boost, style: v.style, speed: v.speed, use_speaker_boost: v.use_speaker_boost}).filter(([, x]) => x !== undefined),
  ),
};
if (v.language_code) body.language_code = v.language_code;
const res = await fetch(url, {method: 'POST', headers: {'xi-api-key': key, 'Content-Type': 'application/json'}, body: JSON.stringify(body)});
if (!res.ok) {
  console.log(`FALLO · ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}
const j = await res.json();
fs.writeFileSync(path.join(dir, 'audio.mp3'), Buffer.from(j.audio_base64, 'base64'));
const al = j.alignment || j.normalized_alignment;
const st = al.character_start_times_seconds, en = al.character_end_times_seconds;
const escala = st.length / texto.length;
const idx = (i) => Math.min(st.length - 1, Math.max(0, Math.round(i * escala)));
const out = [];
let pos = 0;
lineas.forEach((l, li) => {
  for (const w of l.words) {
    let a = texto.indexOf(w.w, pos);
    if (a < 0) a = pos;
    const b = a + w.w.length - 1;
    out.push({w: w.w, s: +st[idx(a)].toFixed(3), e: +en[idx(b)].toFixed(3), l: li, key: w.key});
    pos = b + 1;
  }
});
guardar(out, 'elevenlabs');
