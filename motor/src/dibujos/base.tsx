// Piezas comunes de los dibujos: lienzo, filtros, cielos, colinas, siluetas sin cara, partículas.
import React from 'react';
import {H, P, W} from '../tema';
import {clamp} from '../util';

export type EscenaProps = {
  f: number; // fotograma local (0 = empieza la escena)
  d: number; // duración de la escena en fotogramas
  k: number; // fotograma local del momento clave (el cambio importante)
  opts: string[]; // opciones del guion: [puerta cierra]
};

/** true cuando la escena va sobre un clip de vídeo de fondo (historia con «[escena | búsqueda]») */
export const FondoVideoCtx = React.createContext(false);

export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIO = (t: number) => {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const p = (f: number, a: number, len: number) => clamp((f - a) / Math.max(1, len));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Lienzo con filtros compartidos y grano de papel por encima */
export const Lienzo: React.FC<{children: React.ReactNode; grano?: boolean}> = ({children, grano = true}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    <defs>
      <filter id="brillo" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="22" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="difuso" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="30" />
      </filter>
      <filter id="difusoS" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" />
      </filter>
      <filter id="sombra" x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="22" stdDeviation="20" floodColor="#000" floodOpacity="0.45" />
      </filter>
      <filter id="grano" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.07" />
        </feComponentTransfer>
      </filter>
      <radialGradient id="vineta" cx="50%" cy="42%" r="78%">
        <stop offset="55%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
      </radialGradient>
    </defs>
    {children}
    <rect width={W} height={H} fill="url(#vineta)" />
    {grano && <rect width={W} height={H} filter="url(#grano)" />}
  </svg>
);

/** Degradado vertical a pantalla completa */
export const Cielo: React.FC<{id: string; colores: string[]; o?: number}> = ({id, colores, o = 1}) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        {colores.map((c, i) => (
          <stop key={i} offset={`${(i / (colores.length - 1)) * 100}%`} stopColor={c} />
        ))}
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id})`} opacity={o} />
  </>
);

/** Estrellas que parpadean */
export const Estrellas: React.FC<{f: number; n?: number; hasta?: number; o?: number}> = ({f, n = 70, hasta = 900, o = 1}) => (
  <g opacity={o}>
    {Array.from({length: n}).map((_, i) => (
      <circle key={i} cx={rnd(i) * W} cy={80 + rnd(i + 99) * hasta} r={1.5 + rnd(i + 7) * 3} fill="#fff6e0" opacity={0.25 + 0.75 * Math.abs(Math.sin(f * 0.05 + i * 1.7))} />
    ))}
  </g>
);

/** Luz cálida (círculo difuminado) */
export const Halo: React.FC<{x: number; y: number; r: number; color?: string; o?: number}> = ({x, y, r, color = P.oro, o = 1}) => {
  const id = `halo-${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity={0.6} />
          <stop offset="0.35" stopColor={color} stopOpacity={0.28} />
          <stop offset="0.7" stopColor={color} stopOpacity={0.07} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 1.3} fill={`url(#${id})`} opacity={o} />
    </>
  );
};

/** Colinas en capas (perspectiva atmosférica) */
export const Colinas: React.FC<{y: number; colores: string[]; f?: number}> = ({y, colores, f = 0}) => (
  <g>
    {colores.map((c, i) => {
      const yy = y + i * 70;
      const fase = i * 1.3;
      let d = `M0,${yy}`;
      for (let x = 0; x <= W; x += 60) d += ` L${x},${yy - 40 * Math.sin(x / (260 + i * 80) + fase) - 25 * Math.sin(x / 120 + fase * 2)}`;
      d += ` L${W},${H} L0,${H} Z`;
      return <path key={i} d={d} fill={c} transform={`translate(${Math.sin(f * 0.004 + i) * 4} 0)`} />;
    })}
  </g>
);

/** Silueta sin cara. tipo: mujer (con pañuelo y chilaba), hombre, nino */
export const Silueta: React.FC<{x: number; y: number; s?: number; tipo?: 'mujer' | 'hombre' | 'nino'; color?: string; borde?: string; o?: number}> = ({
  x,
  y,
  s = 1,
  tipo = 'mujer',
  color = P.silueta,
  borde,
  o = 1,
}) => {
  const formas: Record<string, string> = {
    mujer:
      'M0,-336 C24,-336 40,-318 40,-296 C40,-282 36,-272 46,-262 C64,-246 74,-238 80,-216 C96,-150 104,-70 122,0 L-122,0 C-104,-70 -96,-150 -80,-216 C-74,-238 -64,-246 -46,-262 C-36,-272 -40,-282 -40,-296 C-40,-318 -24,-336 0,-336 Z',
    hombre:
      'M0,-338 C22,-338 36,-320 36,-298 C36,-280 28,-268 22,-262 C52,-256 78,-244 84,-214 C94,-150 92,-70 90,0 L-90,0 C-92,-70 -94,-150 -84,-214 C-78,-244 -52,-256 -22,-262 C-28,-268 -36,-280 -36,-298 C-36,-320 -22,-338 0,-338 Z',
    nino: 'M0,-196 C17,-196 28,-183 28,-167 C28,-155 22,-148 18,-144 C38,-140 52,-130 56,-110 C62,-70 64,-30 70,0 L-70,0 C-64,-30 -62,-70 -56,-110 C-52,-130 -38,-140 -18,-144 C-22,-148 -28,-155 -28,-167 C-28,-183 -17,-196 0,-196 Z',
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <path d={formas[tipo]} fill={color} stroke={borde} strokeWidth={borde ? 4 / s : 0} />
    </g>
  );
};

/** Polvo dorado flotando */
export const Polvo: React.FC<{f: number; n?: number; o?: number; color?: string}> = ({f, n = 26, o = 1, color = P.oroClaro}) => (
  <g opacity={o}>
    {Array.from({length: n}).map((_, i) => {
      const y = (rnd(i) * H - f * (0.5 + rnd(i + 3)) + H * 4) % H;
      return <circle key={i} cx={rnd(i + 11) * W + Math.sin(f * 0.02 + i) * 16} cy={y} r={1.5 + rnd(i + 5) * 3.5} fill={color} opacity={0.15 + 0.35 * rnd(i + 8)} />;
    })}
  </g>
);

/** Banda de azulejo (zellige) simplificado */
export const Zellige: React.FC<{x: number; y: number; w: number; h: number; id: string}> = ({x, y, w, h, id}) => (
  <>
    <defs>
      <pattern id={id} width={h} height={h} patternUnits="userSpaceOnUse" x={x} y={y}>
        <rect width={h} height={h} fill={P.turquesaOsc} />
        <polygon points={`${h / 2},${h * 0.08} ${h * 0.92},${h / 2} ${h / 2},${h * 0.92} ${h * 0.08},${h / 2}`} fill={P.turquesa} />
        <rect x={h * 0.3} y={h * 0.3} width={h * 0.4} height={h * 0.4} fill={P.crema} transform={`rotate(45 ${h / 2} ${h / 2})`} />
        <circle cx={h / 2} cy={h / 2} r={h * 0.09} fill={P.oro} />
      </pattern>
    </defs>
    <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
  </>
);
