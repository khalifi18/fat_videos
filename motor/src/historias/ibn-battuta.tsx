// «Ibn Battuta, el viajero marroquí que recorrió medio mundo» (Historia de Marruecos que no te contaron · parte 2)
//
// UN SOLO MUNDO CONTINUO (ver guias/referencia-google-maps.md): todas las escenas son el mismo mapa nocturno del
// Viejo Mundo y la cámara viaja dentro de él (Venecia → Tánger → todo el mapa → La Meca → Delhi → China → Fez).
// Cada escena empieza exactamente donde terminó la anterior.
// - El viaje grande lo lleva la "cámara de mundo" (vista {c, z}) de cada escena.
// - Camara2D añade su movimiento continuo; en la capa del mapa se compensa para que el mapa siga la ruta sin saltos,
//   y las capas de fondo (z=0) y primer plano (z=1, nubes) se desplazan con parallax.
import React from 'react';
import {H, P, W, amiri, sans, serif} from '../tema';
import {Halo, Lienzo, Silueta, ease, easeIO, rnd} from '../dibujos/base';
import {Capa, encuadre} from '../dibujos/camara2d';
import type {FocoEscena} from '../dibujos/camara2d';
import {BORDE, CIUDADES as CI, TIERRA_MUNDO, TRAMOS, WH, WW} from './mapa-mundo-antiguo';

const ID = 'ibn-battuta';
const S = 30;
const FX = W / 2, FY = H * 0.42; // centro de la cámara en pantalla (como Camara2D)
const p = (x: number, a: number, len: number) => Math.min(1, Math.max(0, (x - a) / Math.max(1e-6, len)));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const fmt = (n: number) => Math.round(n).toLocaleString('es-ES');

type Vista = {c: [number, number]; z: number};
type Pt = [number, number];
const vmix = (a: Vista, b: Vista, t: number): Vista => {
  // el zoom se interpola en escala logarítmica (como un vuelo real) y el centro se ajusta para que no "patine"
  const z = Math.exp(mix(Math.log(a.z), Math.log(b.z), t));
  const w = a.z === b.z ? t : (1 / a.z - 1 / z) / (1 / a.z - 1 / b.z);
  return {c: [mix(a.c[0], b.c[0], w), mix(a.c[1], b.c[1], w)], z};
};
/** Vista de todo el viaje */
const TODO: Vista = {c: [3060, 2180], z: 0.19};

/** Posición en un tramo (lista de puntos) para un avance 0–1 */
const enTramo = (pts: Pt[], t: number): Pt => {
  const u = Math.max(0, Math.min(1, t)) * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(u));
  const r = u - i;
  return [mix(pts[i][0], pts[i + 1][0], r), mix(pts[i][1], pts[i + 1][1], r)];
};
const hasta = (pts: Pt[], t: number): Pt[] => {
  const u = Math.max(0, Math.min(1, t)) * (pts.length - 1);
  return [...pts.slice(0, Math.floor(u) + 1), enTramo(pts, t)];
};
/** Avance por un tramo según horarios: cada ciudad (cada 16 puntos) llega en el segundo indicado */
const porHorario = (horas: number[], tl: number) => {
  if (tl <= horas[0]) return 0;
  for (let i = 0; i < horas.length - 1; i++) {
    if (tl <= horas[i + 1]) return (i + easeIO(p(tl, horas[i], horas[i + 1] - horas[i]))) / (horas.length - 1);
  }
  return 1;
};

// ───────────────────────── el mundo ─────────────────────────

/** Mapa nocturno: mar, tierra con costa que brilla, retícula y luces de ciudades */
const Mundo: React.FC<{v: Vista}> = ({v}) => (
  <g transform={`translate(${FX} ${FY}) scale(${v.z}) translate(${-v.c[0]} ${-v.c[1]})`}>
    <defs>
      <linearGradient id="ib-tierra" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={WH}>
        <stop offset="0" stopColor="#2c3266" />
        <stop offset="0.45" stopColor="#30305e" />
        <stop offset="0.75" stopColor="#3a3260" />
        <stop offset="1" stopColor="#2a2f5c" />
      </linearGradient>
      {/* los bordes del mapa se funden con el mar (nunca se ve dónde se corta) */}
      <linearGradient id="ib-fh" gradientUnits="userSpaceOnUse" x1={BORDE.x0} y1="0" x2={BORDE.x1} y2="0">
        <stop offset="0" stopColor="#000" />
        <stop offset="0.12" stopColor="#fff" />
        <stop offset="0.88" stopColor="#fff" />
        <stop offset="1" stopColor="#000" />
      </linearGradient>
      <linearGradient id="ib-fv" gradientUnits="userSpaceOnUse" x1="0" y1={BORDE.y0} x2="0" y2={BORDE.y1}>
        <stop offset="0" stopColor="#000" />
        <stop offset="0.16" stopColor="#fff" />
        <stop offset="0.86" stopColor="#fff" />
        <stop offset="1" stopColor="#000" />
      </linearGradient>
      <mask id="ib-mh" maskUnits="userSpaceOnUse" x={BORDE.x0} y={BORDE.y0} width={BORDE.x1 - BORDE.x0} height={BORDE.y1 - BORDE.y0}>
        <rect x={BORDE.x0} y={BORDE.y0} width={BORDE.x1 - BORDE.x0} height={BORDE.y1 - BORDE.y0} fill="url(#ib-fh)" />
      </mask>
      <mask id="ib-mv" maskUnits="userSpaceOnUse" x={BORDE.x0} y={BORDE.y0} width={BORDE.x1 - BORDE.x0} height={BORDE.y1 - BORDE.y0}>
        <rect x={BORDE.x0} y={BORDE.y0} width={BORDE.x1 - BORDE.x0} height={BORDE.y1 - BORDE.y0} fill="url(#ib-fv)" />
      </mask>
    </defs>
    <g mask="url(#ib-mh)">
    <g mask="url(#ib-mv)">
    {/* retícula (paralelos y meridianos) */}
    {Array.from({length: 38}).map((_, i) => (
      <line key={`m${i}`} x1={BORDE.x0 + i * 240} y1={BORDE.y0} x2={BORDE.x0 + i * 240} y2={BORDE.y1} stroke="#3a4a8a" strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.25} />
    ))}
    {Array.from({length: 28}).map((_, i) => (
      <line key={`p${i}`} x1={BORDE.x0} y1={BORDE.y0 + i * 240} x2={BORDE.x1} y2={BORDE.y0 + i * 240} stroke="#3a4a8a" strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.25} />
    ))}
    {/* costa: resplandor ancho + línea fina */}
    <path d={TIERRA_MUNDO} fill="none" stroke="#4f5fd0" strokeWidth={14} vectorEffect="non-scaling-stroke" opacity={0.18} strokeLinejoin="round" />
    <path d={TIERRA_MUNDO} fill="url(#ib-tierra)" />
    <path d={TIERRA_MUNDO} fill="none" stroke="#8a95f0" strokeWidth={1.6} vectorEffect="non-scaling-stroke" opacity={0.75} strokeLinejoin="round" />
    </g>
    </g>
  </g>
);

/** De coordenadas de mundo a pantalla */
const aPantalla = (v: Vista, [x, y]: Pt): Pt => [FX + (x - v.c[0]) * v.z, FY + (y - v.c[1]) * v.z];

/** Luces de las ciudades (puntitos amarillos que crecen al acercarse) */
const LucesCiudades: React.FC<{v: Vista; f: number}> = ({v, f}) => (
  <g>
    {Object.entries(CI).map(([k, c], i) =>
      Array.from({length: 14}).map((_, j) => {
        const n = i * 31 + j;
        const [x, y] = aPantalla(v, [c[0] + (rnd(n) - 0.5) * 70, c[1] + (rnd(n + 1) - 0.5) * 50]);
        if (x < -40 || x > W + 40 || y < -40 || y > H + 40) return null;
        const r = Math.max(1.2, Math.min(5, v.z * 2.2)) * (0.6 + rnd(n + 2) * 0.8);
        return <circle key={`${k}${j}`} cx={x} cy={y} r={r} fill="#ffd77a" opacity={0.35 + 0.45 * Math.abs(Math.sin(f * 0.04 + n))} />;
      }),
    )}
  </g>
);

/** Ruta que brilla (pantalla), con trazo constante */
const Ruta: React.FC<{v: Vista; pts: Pt[]; color?: string; ancho?: number; o?: number}> = ({v, pts, color = '#ffcf5a', ancho = 7, o = 1}) => {
  if (pts.length < 2) return null;
  const d = pts.map((q, i) => {
    const [x, y] = aPantalla(v, q);
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <g opacity={o}>
      <path d={d} stroke={color} strokeWidth={ancho * 3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.22} filter="url(#difusoS)" />
      <path d={d} stroke={color} strokeWidth={ancho} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke="#fff6dc" strokeWidth={ancho * 0.3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
    </g>
  );
};

/** Punto de posición (como el de los mapas): halo que late + anillo blanco */
const Punto: React.FC<{x: number; y: number; f: number; color?: string}> = ({x, y, f, color = '#ffcf5a'}) => {
  const lat = (f % 45) / 45;
  return (
    <g>
      <circle cx={x} cy={y} r={18 + lat * 50} fill="none" stroke={color} strokeWidth={3} opacity={0.6 * (1 - lat)} />
      <circle cx={x} cy={y} r={30} fill={color} opacity={0.25} />
      <circle cx={x} cy={y} r={15} fill={color} stroke="#fff" strokeWidth={5} />
    </g>
  );
};

/** Rótulo en pastilla, pegado a un punto del mapa; aparece cuando la voz lo nombra */
const Pastilla: React.FC<{x: number; y: number; texto: string; e: number; color?: string; dy?: number; grande?: boolean}> = ({x, y, texto, e, color = '#ffcf5a', dy = -64, grande}) => {
  if (e <= 0) return null;
  const fs = grande ? 42 : 34;
  const w = texto.length * fs * 0.6 + 64;
  return (
    <g transform={`translate(${x} ${y + dy}) scale(${0.7 + 0.3 * e})`} opacity={e}>
      <line x1={0} y1={fs * 0.7} x2={0} y2={-dy - 16} stroke="#fff" strokeWidth={2} opacity={0.6} />
      <rect x={-w / 2} y={-fs * 0.85} width={w} height={fs * 1.6} rx={fs * 0.8} fill="#10132e" opacity={0.88} />
      <rect x={-w / 2} y={-fs * 0.85} width={w} height={fs * 1.6} rx={fs * 0.8} fill="none" stroke={color} strokeWidth={2.5} opacity={0.9} />
      <circle cx={-w / 2 + 28} cy={-fs * 0.05} r={8} fill={color} />
      <text x={12} y={fs * 0.3} fill="#fff" fontFamily={sans} fontWeight={800} fontSize={fs} textAnchor="middle">
        {texto}
      </text>
    </g>
  );
};

/** Nubes de primer plano (parallax) */
const Nubes: React.FC<{f: number; o?: number}> = ({f, o = 0.5}) => (
  <g opacity={o}>
    {Array.from({length: 7}).map((_, i) => {
      const x = ((rnd(i) * (W + 600) + f * (0.6 + rnd(i + 2) * 0.8)) % (W + 600)) - 300;
      const y = 120 + rnd(i + 1) * 1100;
      return <ellipse key={i} cx={x} cy={y} rx={220 + rnd(i + 3) * 200} ry={50 + rnd(i + 4) * 40} fill="#c9d0ff" opacity={0.08} filter="url(#difuso)" />;
    })}
  </g>
);

// ───────────────────────── monumentos (se levantan sobre el mapa) ─────────────────────────
type Mon = React.FC<{s: number; f: number}>;

/** Tánger: muralla con puerta, casas blancas, alminar */
const Tanger: Mon = ({s}) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={6} rx={230} ry={30} fill="#000" opacity={0.35} />
    <rect x={-210} y={-120} width={420} height={120} fill="#c08a52" />
    <rect x={-210} y={-120} width={140} height={120} fill="#000" opacity={0.12} />
    {Array.from({length: 11}).map((_, i) => <rect key={i} x={-206 + i * 38} y={-138} width={20} height={20} fill="#c08a52" />)}
    <path d="M-40,0 L-40,-60 A40,44 0 1 1 40,-60 L40,0 Z" fill="#2a1a14" />
    <path d="M-40,0 L-40,-60 A40,44 0 1 1 40,-60 L40,0" fill="none" stroke="#f0c890" strokeWidth={6} />
    {[[-180, -190, 70, 70], [-100, -175, 50, 55], [-40, -200, 80, 80], [50, -180, 60, 60], [120, -195, 70, 75]].map(([x, y, w, h], i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height={h} fill="#f2ede2" />
        <rect x={x} y={y} width={w * 0.3} height={h} fill="#c9c2d6" opacity={0.5} />
        <rect x={x + w * 0.45} y={y + h * 0.3} width={12} height={16} fill="#ffd77a" />
      </g>
    ))}
    <rect x={150} y={-330} width={56} height={210} fill="#f6efe2" />
    <rect x={150} y={-330} width={56} height={14} fill="#2f8f6a" />
    <rect x={164} y={-372} width={28} height={42} fill="#f6efe2" />
    <path d="M160,-370 Q178,-396 196,-370 Z" fill="#2f8f6a" />
    <rect x={168} y={-290} width={20} height={30} fill="#ffd77a" opacity={0.9} />
  </g>
);
/** Venecia: campanile de San Marcos y cúpulas */
const Venecia: Mon = ({s}) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={6} rx={200} ry={26} fill="#000" opacity={0.35} />
    <rect x={-170} y={-120} width={240} height={120} fill="#d8c8a8" />
    {[-140, -80, -20, 40].map((x, i) => (
      <g key={i}>
        <path d={`M${x - 26},-120 A26,34 0 0 1 ${x + 26},-120 Z`} fill="#8a9a8a" />
        <path d={`M${x - 18},0 L${x - 18},-60 A18,22 0 1 1 ${x + 18},-60 L${x + 18},0 Z`} fill="#3a2a2a" />
      </g>
    ))}
    <rect x={100} y={-380} width={60} height={380} fill="#b0533a" />
    <rect x={100} y={-380} width={18} height={380} fill="#000" opacity={0.15} />
    <rect x={94} y={-410} width={72} height={36} fill="#e8dcc6" />
    <path d="M96,-410 L130,-480 L164,-410 Z" fill="#5f8a6a" />
    <circle cx={130} cy={-488} r={7} fill="#e9c46a" />
  </g>
);
/** La Meca: la Kaaba en su patio */
const Meca: Mon = ({s, f}) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={-10} rx={240} ry={70} fill="#efe9dc" />
    <ellipse cx={0} cy={-10} rx={240} ry={70} fill="none" stroke="#c9bfa8" strokeWidth={6} />
    {Array.from({length: 40}).map((_, i) => {
      const a = (i / 40) * Math.PI * 2 + f * 0.01;
      return <circle key={i} cx={Math.cos(a) * (150 + (i % 3) * 22)} cy={-10 + Math.sin(a) * (44 + (i % 3) * 6)} r={4} fill="#fff" opacity={0.9} />;
    })}
    <path d="M-70,-20 L50,-20 L90,-45 L90,-165 L-30,-165 L-70,-140 Z" fill="#141414" />
    <path d="M50,-20 L90,-45 L90,-165 L50,-140 Z" fill="#000" />
    <path d="M-70,-140 L-30,-165 L90,-165 L50,-140 Z" fill="#2a2a2a" />
    <path d="M-70,-112 L50,-112 L90,-137 L90,-125 L50,-100 L-70,-100 Z" fill="#d9b45a" />
    <Halo x={10} y={-90} r={220} color="#fff2cf" o={0.5} />
  </g>
);
/** El Cairo: las pirámides */
const Cairo: Mon = ({s}) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={6} rx={240} ry={26} fill="#000" opacity={0.3} />
    {[[-110, 210, 0.75], [60, 260, 1], [190, 150, 0.55]].map(([x, h, k], i) => (
      <g key={i}>
        <path d={`M${x - h * 0.8},0 L${x},${-h} L${x + h * 0.8},0 Z`} fill="#d9b06a" />
        <path d={`M${x},${-h} L${x + h * 0.8},0 L${x + h * 0.2},0 Z`} fill="#a87a40" />
      </g>
    ))}
  </g>
);
/** Delhi: el Qutb Minar (torre de arenisca roja con balcones) */
const Delhi: Mon = ({s}) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={6} rx={150} ry={24} fill="#000" opacity={0.35} />
    {[0, 1, 2, 3, 4].map((i) => {
      const y0 = -i * 90, w0 = 70 - i * 9, w1 = 70 - (i + 1) * 9;
      return (
        <g key={i}>
          <path d={`M${-w0},${y0} L${-w1},${y0 - 90} L${w1},${y0 - 90} L${w0},${y0} Z`} fill={i < 3 ? '#b85a3a' : '#e6d8c0'} />
          {Array.from({length: 7}).map((_, j) => (
            <line key={j} x1={-w0 + (j + 0.5) * ((2 * w0) / 7)} y1={y0} x2={-w1 + (j + 0.5) * ((2 * w1) / 7)} y2={y0 - 90} stroke="#7a3a24" strokeWidth={3} opacity={0.6} />
          ))}
          <path d={`M${-w0},${y0} L${-w1},${y0 - 90} L${-w1 * 0.3},${y0 - 90} L${-w0 * 0.3},${y0} Z`} fill="#000" opacity={0.12} />
          <rect x={-w1 - 12} y={y0 - 96} width={(w1 + 12) * 2} height={12} fill="#d9a070" />
        </g>
      );
    })}
    <path d="M-22,-450 Q0,-490 22,-450 Z" fill="#e6d8c0" />
  </g>
);
/** Quanzhou: pagodas de piedra */
const Quanzhou: Mon = ({s}) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={6} rx={230} ry={26} fill="#000" opacity={0.35} />
    {[-110, 110].map((x, k) => (
      <g key={k}>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = -i * 66, w = 70 - i * 9;
          return (
            <g key={i}>
              <rect x={x - w * 0.7} y={y - 52} width={w * 1.4} height={52} fill="#b8b0a0" />
              <rect x={x - w * 0.7} y={y - 52} width={w * 0.4} height={52} fill="#000" opacity={0.12} />
              <rect x={x - 10} y={y - 40} width={20} height={26} fill="#ffd77a" opacity={0.85} />
              <path d={`M${x - w - 14},${y - 52} Q${x},${y - 72} ${x + w + 14},${y - 52} L${x + w},${y - 62} L${x - w},${y - 62} Z`} fill="#6a5a50" />
            </g>
          );
        })}
        <line x1={x} y1={-330} x2={x} y2={-380} stroke="#d9b45a" strokeWidth={6} />
      </g>
    ))}
  </g>
);
/** Fez: alminar de la Qarawiyyin y tejados verdes */
const Fez: Mon = ({s}) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={6} rx={240} ry={28} fill="#000" opacity={0.35} />
    <rect x={-220} y={-110} width={440} height={110} fill="#e8dcc6" />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-200 + i * 85},0 L${-200 + i * 85},-55 A30,32 0 1 1 ${-140 + i * 85},-55 L${-140 + i * 85},0 Z`} fill="#6a4026" />)}
    <path d="M-235,-110 L-205,-160 L205,-160 L235,-110 Z" fill="#2f8f6a" />
    {Array.from({length: 20}).map((_, i) => <line key={i} x1={-200 + i * 21} y1={-158} x2={-222 + i * 23} y2={-112} stroke="#1d5e44" strokeWidth={3} />)}
    <rect x={-60} y={-430} width={100} height={280} fill="#f6f0e2" />
    <rect x={10} y={-430} width={30} height={280} fill="#000" opacity={0.08} />
    <path d="M-35,-280 L-35,-330 A25,28 0 1 1 15,-330 L15,-280 Z" fill="#3a2a2a" opacity={0.7} />
    <rect x={-60} y={-410} width={100} height={14} fill="#2f8f6a" />
    <rect x={-32} y={-490} width={44} height={60} fill="#f6f0e2" />
    <path d="M-40,-488 Q-10,-530 20,-488 Z" fill="#2f8f6a" />
    <line x1={-10} y1={-520} x2={-10} y2={-550} stroke="#d9b45a" strokeWidth={4} />
  </g>
);
/** Junco chino (barco) */
const Junco: React.FC<{x: number; y: number; s: number; f: number}> = ({x, y, s, f}) => (
  <g transform={`translate(${x} ${y + Math.sin(f * 0.15) * 4}) scale(${s})`}>
    <ellipse cx={0} cy={10} rx={110} ry={16} fill="#000" opacity={0.3} />
    <path d="M-110,-10 L110,-10 L80,24 L-90,24 Z" fill="#5a3420" />
    <path d="M-110,-10 L-130,-34 L-96,-14 Z" fill="#5a3420" />
    {[-50, 20, 80].map((m, i) => (
      <g key={i}>
        <line x1={m} y1={-10} x2={m} y2={-150 + i * 20} stroke="#3a2416" strokeWidth={5} />
        <path d={`M${m - 4},${-140 + i * 20} L${m + 54 - i * 8},${-130 + i * 20} L${m + 50 - i * 8},-20 L${m - 4},-20 Z`} fill="#c8623e" />
        {[0, 1, 2, 3].map((j) => <line key={j} x1={m - 4} y1={-120 + i * 20 + j * 26} x2={m + 52 - i * 8} y2={-112 + i * 20 + j * 26} stroke="#7a3a24" strokeWidth={3} />)}
      </g>
    ))}
  </g>
);

/** Escala de un monumento según el zoom */
const escalaMon = (v: Vista, base: number) => base * Math.max(0.35, Math.min(1.4, v.z / 1.6));

/** Monumento pegado a una ciudad: se levanta desde el suelo cuando toca y crece con el zoom */
const Monumento: React.FC<{v: Vista; en: Pt; M: Mon; e: number; f: number; base?: number}> = ({v, en, M, e, f, base = 0.55}) => {
  if (e <= 0) return null;
  const [x, y] = aPantalla(v, en);
  const s = escalaMon(v, base) * ease(e);
  return (
    <g transform={`translate(${x} ${y})`}>
      <Halo x={0} y={-60 * s} r={300 * s} color="#ffd59a" o={0.6 * e} />
      <M s={s} f={f} />
    </g>
  );
};

// ───────────────────────── fábrica de escenas ─────────────────────────
type Ctx = {f: number; tl: number; t: number; v: Vista; d: number};
type Def = {vista: (tl: number, t: number) => Vista; capa: (c: Ctx) => React.ReactNode; fondo?: (c: Ctx) => React.ReactNode};

const semillaDe = (nombre: string) => [...`${ID}/${nombre}`].reduce((a, ch) => a + ch.charCodeAt(0), 0);

const escena = (nombre: string, def: Def): React.FC<{f: number; d: number}> => {
  const sem = semillaDe(nombre);
  return ({f, d}) => {
    const ultimo = nombre === 'cta';
    const L = ultimo ? d : Math.max(1, d - 12); // la siguiente escena empieza 12 fotogramas antes del final
    const t = Math.min(1, f / L);
    const tl = f / S;
    const v = def.vista(tl, t);
    // compensa Camara2D para que el mapa siga exactamente la vista de mundo (sin saltos entre escenas)
    const cam = encuadre(f, d, sem, {x: FX, y: FY});
    const comp = `translate(${cam.x} ${cam.y}) scale(${1 / cam.s}) translate(${-FX} ${-FY})`;
    const c: Ctx = {f, tl, t, v, d};
    return (
      <Lienzo>
        <defs>
          <radialGradient id="ib-mar" cx="0.5" cy="0.4" r="0.8">
            <stop offset="0" stopColor="#16245a" />
            <stop offset="0.6" stopColor="#0c1740" />
            <stop offset="1" stopColor="#070d26" />
          </radialGradient>
        </defs>
        <Capa z={0}>
          <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="url(#ib-mar)" />
          {Array.from({length: 60}).map((_, i) => (
            <circle key={i} cx={rnd(i) * W} cy={rnd(i + 5) * H} r={1 + rnd(i + 9) * 2} fill="#9fb0ff" opacity={0.15 + 0.2 * Math.abs(Math.sin(f * 0.03 + i))} />
          ))}
        </Capa>
        <Capa z={0.5}>
          <g transform={comp}>
            <Mundo v={v} />
            <LucesCiudades v={v} f={f} />
            {def.fondo?.(c)}
            {def.capa(c)}
          </g>
        </Capa>
        <Capa z={1}>
          <g transform={comp}>
            <Nubes f={f + sem} o={Math.max(0.35, Math.min(1, 0.6 / v.z))} />
          </g>
        </Capa>
      </Lienzo>
    );
  };
};

// vistas encadenadas: cada escena termina donde empieza la siguiente
const V_VENECIA: Vista = {c: CI.venecia, z: 1.25};
const V_TANGER: Vista = {c: CI.tanger, z: 1.25};
const V_TANGER_CERCA: Vista = {c: [CI.tanger[0] + 10, CI.tanger[1] - 40], z: 2.3};
const V_MECA: Vista = {c: CI.meca, z: 0.55};
const V_DELHI_LEJOS: Vista = {c: CI.delhi, z: 0.45};
const V_DELHI: Vista = {c: [CI.delhi[0], CI.delhi[1] - 60], z: 2.3};
const V_QUANZHOU: Vista = {c: CI.quanzhou, z: 0.6};
const V_FEZ: Vista = {c: [CI.fez[0], CI.fez[1] - 60], z: 2.3};
const V_FINAL: Vista = {c: [CI.fez[0] + 60, CI.fez[1] - 180], z: 1.4};

const H_RUTA = [0.6, 2.3, 3.0, 3.7, 4.05, 4.35, 4.8, 5.4]; // La Meca, Egipto, Siria, Bagdad, Tabriz, Persia, Kabul, India
const H_CHINA = [0.3, 0.8, 1.15, 1.45, 1.8, 2.1, 2.5]; // Delhi → Calicut → Maldivas → Ceilán → Chittagong → Sumatra → China
const SALIDA_PARTE = 3.3; // en salida: hasta aquí bajamos a Tánger; luego la cámara sigue el camino hasta La Meca

/** Todo lo recorrido hasta ahora (para que la ruta no desaparezca al cambiar de escena) */
const Recorrido: React.FC<{v: Vista; tramos: string[]; o?: number}> = ({v, tramos, o = 1}) => (
  <>
    {tramos.map((k) => (
      <Ruta key={k} v={v} pts={TRAMOS[k]} o={o} ancho={6} />
    ))}
  </>
);

// 1 · tanja: todos conocen a Marco Polo (Venecia, brillante)… ¿y a Ibn Battuta? (Tánger)
const Tanja = escena('tanja', {
  vista: (tl, t) => vmix(V_VENECIA, V_TANGER, easeIO(p(tl, 1.4, 3.2))),
  capa: ({v, tl, f}) => {
    const [vx, vy] = aPantalla(v, CI.venecia);
    const [tx, ty] = aPantalla(v, CI.tanger);
    return (
      <>
        <Monumento v={v} en={CI.venecia} M={Venecia} e={p(tl, 0, 0.6)} f={f} base={0.85} />
        <Pastilla x={vx} y={vy} texto="Marco Polo" e={ease(p(tl, 0.7, 0.4))} color="#7ab8ff" dy={-(500 * escalaMon(v, 0.85) + 40)} grande />
        <Monumento v={v} en={CI.tanger} M={Tanger} e={p(tl, 3.0, 0.8)} f={f} base={0.85} />
        <Pastilla x={tx} y={ty} texto="¿Ibn Battuta?" e={ease(p(tl, 3.9, 0.4))} dy={-(390 * escalaMon(v, 0.85) + 40)} grande />
      </>
    );
  },
});

// 2 · giro: la cámara sube y compara las dos rutas
const Giro = escena('giro', {
  vista: (tl, t) => vmix(V_TANGER, TODO, easeIO(p(tl, 0, 2.2))),
  capa: ({v, tl, f}) => {
    const marco = easeIO(p(tl, 0.6, 1.4));
    const ibn = easeIO(p(tl, 1.8, 2.0));
    const [px, py] = aPantalla(v, CI.pekin);
    const [kx, ky] = aPantalla(v, CI.kilwa);
    return (
      <>
        <Monumento v={v} en={CI.tanger} M={Tanger} e={1 - p(tl, 0, 0.8)} f={f} base={0.85} />
        <Ruta v={v} pts={hasta(TRAMOS.marco, marco)} color="#7ab8ff" ancho={5} />
        {['salida', 'ruta', 'china', 'africa', 'norte', 'vuelta', 'extra'].map((k) => (
          <Ruta key={k} v={v} pts={hasta(TRAMOS[k], ibn)} ancho={6} />
        ))}
        <Pastilla x={px} y={py} texto="Marco Polo" e={ease(p(tl, 1.4, 0.4))} color="#7ab8ff" dy={-50} />
        <Pastilla x={kx} y={ky} texto="Ibn Battuta" e={ease(p(tl, 3.0, 0.4))} dy={70} grande />
      </>
    );
  },
});

// 3 · salida: bajamos a Tánger en 1325 (sale por la puerta) y la cámara le sigue hasta La Meca
const Salida = escena('salida', {
  vista: (tl) => {
    if (tl < SALIDA_PARTE) return vmix(TODO, V_TANGER_CERCA, easeIO(p(tl, 0, 2.6)));
    const a = porHorario([SALIDA_PARTE + 0.2, 6.4], tl);
    const cab = enTramo(TRAMOS.salida, a);
    const k = easeIO(p(tl, SALIDA_PARTE, 1.4));
    return {c: [mix(V_TANGER_CERCA.c[0], cab[0], k), mix(V_TANGER_CERCA.c[1], cab[1], k)], z: Math.exp(mix(Math.log(2.3), Math.log(0.55), easeIO(p(tl, SALIDA_PARTE, 3.0))))};
  },
  capa: ({v, tl, f}) => {
    const a = porHorario([SALIDA_PARTE + 0.2, 6.4], tl);
    const cab = aPantalla(v, enTramo(TRAMOS.salida, a));
    const [tx, ty] = aPantalla(v, CI.tanger);
    const [mx, my] = aPantalla(v, CI.meca);
    const camina = easeIO(p(tl, 2.0, 1.6));
    const sMon = escalaMon(v, 0.85);
    return (
      <>
        <Monumento v={v} en={CI.tanger} M={Tanger} e={p(tl, 1.4, 0.8)} f={f} base={0.85} />
        {/* Ibn Battuta sale solo por la puerta, con su bastón y su hatillo */}
        {tl < SALIDA_PARTE + 0.6 && (
          <g transform={`translate(${tx + camina * 260 * sMon} ${ty + 4})`} opacity={Math.min(p(tl, 1.8, 0.3), 1 - p(tl, SALIDA_PARTE, 0.6))}>
            <Silueta x={0} y={0} s={0.32 * sMon} tipo="hombre" color="#1a1020" borde="#ffd59a" />
            <line x1={34 * sMon} y1={0} x2={46 * sMon} y2={-160 * sMon} stroke="#1a1020" strokeWidth={6 * sMon} />
          </g>
        )}
        <Pastilla x={tx} y={ty} texto="1325 · 21 años" e={ease(p(tl, 0.4, 0.4)) * (1 - p(tl, SALIDA_PARTE + 0.4, 0.4))} dy={-(390 * sMon + 40)} grande />
        <Ruta v={v} pts={hasta(TRAMOS.salida, a)} />
        {a > 0 && a < 1 && <Punto x={cab[0]} y={cab[1]} f={f} />}
        <Monumento v={v} en={CI.meca} M={Meca} e={p(tl, 5.6, 0.8)} f={f} base={0.75} />
        <Pastilla x={mx} y={my} texto="La Meca" e={ease(p(tl, 5.8, 0.4))} dy={60} />
      </>
    );
  },
});

// 4 · ruta: de La Meca no vuelve… Egipto, Siria, Persia, India
const ETAPAS: [string, string, number][] = [
  ['cairo', 'Egipto', 2.3],
  ['damasco', 'Siria', 3.0],
  ['isfahan', 'Persia', 4.35],
  ['delhi', 'India', 5.4],
];
const RutaE = escena('ruta', {
  vista: (tl) => {
    const cab = enTramo(TRAMOS.ruta, porHorario(H_RUTA, tl));
    const k = easeIO(p(tl, 0, 1.2));
    return {c: [mix(V_MECA.c[0], cab[0], k), mix(V_MECA.c[1], cab[1], k)], z: mix(0.55, 0.45, easeIO(p(tl, 0, 5.5)))};
  },
  capa: ({v, tl, f}) => {
    const a = porHorario(H_RUTA, tl);
    const cab = aPantalla(v, enTramo(TRAMOS.ruta, a));
    return (
      <>
        <Recorrido v={v} tramos={['salida']} />
        <Monumento v={v} en={CI.meca} M={Meca} e={1} f={f} base={0.75} />
        <Ruta v={v} pts={hasta(TRAMOS.ruta, a)} />
        <Monumento v={v} en={CI.cairo} M={Cairo} e={p(tl, 2.1, 0.6)} f={f} base={0.75} />
        {ETAPAS.map(([c, n, h]) => {
          const [x, y] = aPantalla(v, CI[c]);
          return <Pastilla key={c} x={x} y={y} texto={n} e={ease(p(tl, h - 0.15, 0.35))} dy={c === 'cairo' ? 70 : -70} grande={c === 'delhi'} />;
        })}
        {a < 1 && <Punto x={cab[0]} y={cab[1]} f={f} />}
      </>
    );
  },
});

// 5 · delhi: bajamos a Delhi, se levanta el Qutb Minar: juez del sultán
const DelhiE = escena('delhi', {
  vista: (tl, t) => vmix(V_DELHI_LEJOS, V_DELHI, easeIO(t)),
  capa: ({v, tl, f}) => {
    const [x, y] = aPantalla(v, CI.delhi);
    return (
      <>
        <Recorrido v={v} tramos={['salida', 'ruta']} />
        <Monumento v={v} en={CI.delhi} M={Delhi} e={p(tl, 0.2, 0.9)} f={f} base={0.8} />
        <Pastilla x={x} y={y} texto="Juez · قاضي" e={ease(p(tl, 1.5, 0.35))} dy={-(500 * escalaMon(v, 0.8) + 40)} grande />
      </>
    );
  },
});

// 6 · china: la cámara sale de Delhi y sigue al junco por el mar hasta China
const China = escena('china', {
  vista: (tl, t) => {
    const cab = enTramo(TRAMOS.china, porHorario(H_CHINA, tl));
    const k = easeIO(p(tl, 0, 1.0));
    return {c: [mix(V_DELHI.c[0], cab[0], k), mix(V_DELHI.c[1], cab[1], k)], z: Math.exp(mix(Math.log(2.3), Math.log(0.6), easeIO(p(tl, 0, 1.6))))};
  },
  capa: ({v, tl, f}) => {
    const a = porHorario(H_CHINA, tl);
    const cab = aPantalla(v, enTramo(TRAMOS.china, a));
    const [qx, qy] = aPantalla(v, CI.quanzhou);
    return (
      <>
        <Recorrido v={v} tramos={['salida', 'ruta']} />
        <Monumento v={v} en={CI.delhi} M={Delhi} e={1 - p(tl, 0.6, 0.6)} f={f} base={0.8} />
        <Ruta v={v} pts={hasta(TRAMOS.china, a)} />
        {a > 0.08 && <Junco x={cab[0]} y={cab[1] - 10} s={0.55} f={f} />}
        <Monumento v={v} en={CI.quanzhou} M={Quanzhou} e={p(tl, 2.2, 0.7)} f={f} base={0.75} />
        <Pastilla x={qx} y={qy} texto="China" e={ease(p(tl, 2.3, 0.35))} dy={70} grande />
      </>
    );
  },
});

// 7 · contador: la cámara se aleja hasta ver todo el viaje; corren los kilómetros
const Contador = escena('contador', {
  vista: (tl, t) => vmix(V_QUANZHOU, TODO, easeIO(p(tl, 0, 2.6))),
  capa: ({v, tl}) => {
    const resto = easeIO(p(tl, 0.8, 2.6));
    const km = 120000 * easeIO(p(tl, 2.2, 2.3));
    return (
      <>
        <Recorrido v={v} tramos={['salida', 'ruta', 'china']} />
        {['vuelta', 'africa', 'norte', 'extra'].map((k) => (
          <Ruta key={k} v={v} pts={hasta(TRAMOS[k], resto)} ancho={6} />
        ))}
        <g opacity={ease(p(tl, 0.3, 0.5))}>
          <text x={W / 2} y={360} fill="#fff6e6" fontFamily={sans} fontWeight={800} fontSize={58} textAnchor="middle">
            ≈ 30 años de viaje
          </text>
        </g>
        <g opacity={ease(p(tl, 2.0, 0.4))}>
          <text x={W / 2} y={500} fill={P.oro} fontFamily={sans} fontWeight={800} fontSize={124} textAnchor="middle" filter="url(#brillo)">
            {km >= 119999 ? '+120.000 km' : `${fmt(km)} km`}
          </text>
        </g>
      </>
    );
  },
});

// 8 · rihla: la cámara vuela de vuelta a Fez y se abre el libro
const Rihla = escena('rihla', {
  vista: (tl, t) => vmix(TODO, V_FEZ, easeIO(p(tl, 0, 2.2))),
  capa: ({v, tl, f}) => {
    const abre = easeIO(p(tl, 2.2, 0.9));
    const [x, y] = aPantalla(v, CI.fez);
    return (
      <>
        <Recorrido v={v} tramos={['salida', 'ruta', 'china', 'vuelta', 'africa', 'norte']} o={0.8} />
        <Monumento v={v} en={CI.fez} M={Fez} e={p(tl, 1.2, 0.8)} f={f} base={0.75} />
        <Pastilla x={x} y={y} texto="Fez" e={ease(p(tl, 0.3, 0.4)) * (1 - abre)} dy={70} grande />
        {abre > 0 && <Libro x={W / 2} y={FY + 180} e={abre} f={f} />}
      </>
    );
  },
});

/** El libro de la Rihla abriéndose, con el título en árabe */
const Libro: React.FC<{x: number; y: number; e: number; f: number}> = ({x, y, e, f}) => (
  <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * e})`} opacity={Math.min(1, e * 2)}>
    <Halo x={0} y={-40} r={420} color="#ffd59a" o={e} />
    <ellipse cx={0} cy={150} rx={360} ry={40} fill="#000" opacity={0.45} />
    {/* tapas */}
    <path d="M0,130 L-340,150 L-340,-170 L0,-190 Z" fill="#6a2a1e" />
    <path d="M0,130 L340,150 L340,-170 L0,-190 Z" fill="#6a2a1e" />
    {/* páginas: la derecha se abre */}
    <path d="M0,120 L-320,138 L-320,-160 L0,-178 Z" fill="#f4e8cc" />
    <g transform={`scale(${mix(-1, 1, e)} 1)`}>
      <path d="M0,120 L320,138 L320,-160 L0,-178 Z" fill="#f8eed6" />
      <path d="M0,120 L60,124 L60,-174 L0,-178 Z" fill="#000" opacity={0.08} />
    </g>
    <line x1={0} y1={-178} x2={0} y2={120} stroke="#b89a6a" strokeWidth={4} />
    {e > 0.6 && (
      <g opacity={p(e, 0.6, 0.4)}>
        <text x={-160} y={-60} fill="#7a2a1e" fontFamily={amiri} fontSize={84} textAnchor="middle" direction="rtl">
          الرحلة
        </text>
        <rect x={-260} y={-30} width={200} height={3} fill="#c4a87a" />
        {Array.from({length: 6}).map((_, i) => (
          <rect key={i} x={-290 + (i % 2) * 20} y={0 + i * 20} width={240 - (i % 2) * 20} height={6} rx={3} fill="#c4a87a" opacity={0.7} />
        ))}
        {Array.from({length: 9}).map((_, i) => (
          <rect key={i} x={40 + (i % 3) * 8} y={-140 + i * 28} width={250 - (i % 3) * 16} height={7} rx={3} fill="#c4a87a" opacity={0.7} />
        ))}
        {/* mapa dibujado en la página */}
        <path d="M60,90 C120,60 170,110 230,70 S290,90 300,80" stroke="#7a2a1e" strokeWidth={4} fill="none" strokeDasharray="6 8" />
      </g>
    )}
  </g>
);

// 9 · cta: sobre el Mediterráneo, las opciones de la próxima historia
const OPCIONES = ['La batalla de los Tres Reyes', 'Yusuf ibn Tashfin y Marrakech', 'Tariq ibn Ziyad y el estrecho'];
const Cta = escena('cta', {
  vista: (tl, t) => vmix(V_FEZ, V_FINAL, easeIO(t)),
  capa: ({v, tl, f}) => (
    <>
      <Recorrido v={v} tramos={['salida', 'vuelta']} o={0.6} />
      <Monumento v={v} en={CI.fez} M={Fez} e={1} f={f} base={0.75 * Math.max(0.67, 1 - tl * 0.12)} />
      <g opacity={ease(p(tl, 0.1, 0.5))}>
        <rect x={130} y={258} width={820} height={100} rx={50} fill="#10132e" opacity={0.85} />
        <text x={W / 2} y={326} fill="#fff6e6" fontFamily={serif} fontSize={58} textAnchor="middle">
          ¿La próxima historia?
        </text>
      </g>
      {OPCIONES.map((o, i) => {
        const e = ease(p(tl, 1.6 + i * 0.5, 0.45));
        const y = 450 + i * 130;
        return (
          <g key={i} opacity={e} transform={`translate(${(1 - e) * 60} ${y})`}>
            <rect x={110} y={-48} width={860} height={100} rx={50} fill="#10132e" opacity={0.9} />
            <rect x={110} y={-48} width={860} height={100} rx={50} fill="none" stroke="#ffcf5a" strokeWidth={2.5} />
            <circle cx={168} cy={2} r={30} fill="#ffcf5a" />
            <text x={168} y={15} fill="#10132e" fontFamily={sans} fontWeight={800} fontSize={34} textAnchor="middle">
              {i + 1}
            </text>
            <text x={220} y={15} fill="#fff" fontFamily={sans} fontWeight={800} fontSize={36}>
              {o}
            </text>
          </g>
        );
      })}
    </>
  ),
});

export const IBN_BATTUTA: Record<string, React.FC<{f: number; d: number; k: number; opts: string[]}>> = {
  [`${ID}/tanja`]: Tanja,
  [`${ID}/giro`]: Giro,
  [`${ID}/salida`]: Salida,
  [`${ID}/ruta`]: RutaE,
  [`${ID}/delhi`]: DelhiE,
  [`${ID}/china`]: China,
  [`${ID}/contador`]: Contador,
  [`${ID}/rihla`]: Rihla,
  [`${ID}/cta`]: Cta,
};

/** Todas miran al centro de la cámara: el viaje lo hace la vista de mundo */
export const FOCOS_IBN_BATTUTA: Record<string, FocoEscena> = Object.fromEntries(Object.keys(IBN_BATTUTA).map((k) => [k, {x: FX, y: FY}]));
