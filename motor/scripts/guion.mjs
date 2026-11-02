// Lee videos/<slug>/guion.txt
//
// # formato: historia | hikma | leccion   (si falta: pov si hay "# fondo:", si no leccion)
//   historia → [escena opciones] darija | español      (dibujos; ver guias/escenas.md)
//   hikma    → # pov: …  # color: ciruela  # elemento: luna   y líneas  darija | español
//   leccion  → [búsqueda en inglés] darija | español    (un clip por frase)
//
// FORMATO POV con vídeo de fondo:
//   # pov: POV: el día que entendí este refrán…     ← texto fijo arriba durante todo el vídeo
//   # fondo: rain, candle                           ← 1–2 búsquedas en inglés: clips lentos de fondo para todo el vídeo
//   frase en darija | frase en español con *clave*  ← la frase en español sale grande en el centro
//   [texto] الما والشطابة حتى لقاع البحر | "Agua y escoba…"   ← refrán/aleya: el árabe también sale en grande
//   Etiquetas de voz dentro de la darija: [short pause] [warmly]… (no salen en pantalla)
//
// FORMATO CLIPS (antiguo, si no hay "# fondo:"): [búsqueda] al principio de cada línea = un clip por frase.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function leerGuion(dir) {
  const raw = fs.readFileSync(path.join(dir, 'guion.txt'), 'utf8');
  const filas = raw.split(/\r?\n/).map((l) => l.trim());
  const cab = (k) => {
    const f = filas.find((l) => new RegExp(`^#\\s*${k}\\s*:`, 'i').test(l));
    return f ? f.replace(new RegExp(`^#\\s*${k}\\s*:\\s*`, 'i'), '').trim() : null;
  };
  const lista = (s) => (s ? s.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean) : null);
  const fondo = lista(cab('fondo'));
  const pov = cab('pov');
  const formato = (cab('formato') || (fondo ? 'pov' : 'leccion')).toLowerCase().split(/\s/)[0].replace('hikmah', 'hikma');
  const centrado = formato === 'hikma' || formato === 'pov';
  const ambiente = lista(cab('ambiente')) || ['sunset', 'ocean', 'clouds', 'rain', 'candle'];

  const lineas = [];
  let n = 0;
  for (let l of filas) {
    if (!l || l.startsWith('#')) continue;
    let busqueda = '';
    let fondoClip = '';
    const m = l.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (m) {
      const b = m[1].trim().toLowerCase();
      // en hikma/pov solo [texto] es especial; cualquier otra [..] inicial es una etiqueta de voz
      if (!centrado || b === 'texto') {
        busqueda = b;
        // historia: «[escena | búsqueda en inglés]» pone un clip de vídeo de fondo detrás de la escena
        if (formato === 'historia' && b.includes('|')) [busqueda, fondoClip] = b.split('|').map((x) => x.trim());
        l = m[2];
      }
    }
    if (formato === 'leccion') {
      if (!busqueda) busqueda = ambiente[n++ % ambiente.length];
      if (busqueda === '=' && !lineas.length) busqueda = ambiente[n++ % ambiente.length];
    }
    const [darija, es = ''] = l.split('|').map((x) => x.trim());
    // Etiquetas de emoción (eleven_v4): van a ElevenLabs pero no a pantalla ni a las palabras.
    const tts = darija.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
    const words = tts
      .replace(/\[[^\]]*\]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => ({w, key: false}));
    lineas.push({busqueda, fondo: fondoClip, texto: words.map((w) => w.w).join(' '), tts, words, es});
  }
  if (!lineas.length) throw new Error('guion.txt está vacío');
  lineas.formato = formato;
  lineas.fondo = formato === 'pov' ? fondo : null;
  lineas.pov = pov;
  lineas.color = cab('color');
  lineas.elemento = (cab('elemento') || '').toLowerCase() || null;
  lineas.mundo = (cab('mundo') || '').toLowerCase() || null;
  return lineas;
}

export const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function config() {
  return JSON.parse(fs.readFileSync(path.join(raiz, 'darija.json'), 'utf8'));
}

export function clave() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const env = path.join(raiz, '.env');
  if (fs.existsSync(env)) {
    for (const l of fs.readFileSync(env, 'utf8').split(/\r?\n/)) {
      const m = l.match(/^\s*ELEVENLABS_API_KEY\s*=\s*"?([^"\s]+)"?/);
      if (m) return m[1];
    }
  }
  return null;
}
