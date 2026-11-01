import React from 'react';
import {C, SUB_Y, sans} from './tema';
import {back, prog} from './util';

const MAX_PAL = 7;
const MAX_CAR = 40;
// Un trozo nunca termina en una de estas (se pasan al trozo siguiente)
const DEBILES = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'lo', 'y', 'o', 'a', 'al', 'que', 'en', 'un', 'una', 'para', 'por', 'con', 'no', 'te', 'se', 'me', 'tu', 'su', 'mi', 'es', 'muy', 'más', 'sin', 'como', 'cuando', 'pero', 'si']);
const limpia = (w: string) => w.toLowerCase().replace(/[^a-záéíóúñü]/g, '');

/** Parte el subtítulo en español en trozos cortos. *palabra* = clave (en oro). */
export const trozosEs = (es: string, maxPal = MAX_PAL, maxCar = MAX_CAR) => {
  const toks: {w: string; key: boolean}[] = [];
  let dentro = false;
  for (const tok of es.split(/\s+/).filter(Boolean)) {
    let t = tok;
    let key = dentro;
    if (t.startsWith('*')) {
      key = true;
      dentro = true;
      t = t.slice(1);
    }
    if (t.includes('*')) {
      key = true;
      dentro = false;
      t = t.replace(/\*/g, '');
    }
    if (t) toks.push({w: t, key});
  }
  const out: {w: string; key: boolean}[][] = [];
  let cur: {w: string; key: boolean}[] = [];
  for (const w of toks) {
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
    const corte = cur.length && (cur.length >= maxPal || len > maxCar);
    if (corte) {
      // no dejar colgando "de", "la", "y"…: se mueven al trozo nuevo
      const pasa: {w: string; key: boolean}[] = [];
      while (cur.length > 1 && DEBILES.has(limpia(cur[cur.length - 1].w))) pasa.unshift(cur.pop()!);
      out.push(cur);
      cur = pasa;
    }
    cur.push(w);
    // corta también tras puntuación fuerte
    if (/[.,:;?!…]$/.test(w.w) && cur.length >= 3) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

/** Subtítulo de una línea: los trozos se reparten a lo largo de la voz de esa línea */
export const Subtitulo: React.FC<{es: string; ini: number; fin: number; frame: number; fps: number; centro?: boolean}> = ({es, ini, fin, frame, fps, centro}) => {
  // centro = formato POV: frase grande en el centro de la pantalla
  const grupos = centro ? trozosEs(es, 10, 52) : trozosEs(es);
  if (!grupos.length) return null;
  const total = grupos.reduce((a, g) => a + g.reduce((b, w) => b + w.w.length + 1, 0), 0);
  const t = frame / fps;
  let acc = ini;
  let gi = 0;
  let inicioG = ini;
  grupos.forEach((g, i) => {
    const dur = ((fin - ini) * g.reduce((b, w) => b + w.w.length + 1, 0)) / total;
    if (t >= acc - 0.05) {
      gi = i;
      inicioG = acc;
    }
    acc += dur;
  });
  const g = grupos[gi];
  const pop = back(prog(frame, Math.round(inicioG * fps) - 2, 7));
  return (
    <div style={{position: 'absolute', left: 80, right: centro ? 80 : 150, top: centro ? 760 : SUB_Y - 120, height: centro ? 420 : 240, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 800,
          fontSize: centro ? 80 : 68,
          lineHeight: 1.18,
          textAlign: 'center',
          color: C.crema,
          transform: `scale(${0.88 + 0.12 * pop})`,
          opacity: Math.min(1, pop * 1.6),
          textShadow: '0 3px 4px rgba(0,0,0,0.7), 0 0 28px rgba(0,0,0,0.55)',
        }}
      >
        {g.map((w, i) => (
          <span key={i} style={{color: w.key ? C.oro : C.crema}}>
            {w.w}{' '}
          </span>
        ))}
      </div>
    </div>
  );
};
