// Escenas a medida: «El taller del mâalem» — collage de cartulina con las fotos pegadas
import React from 'react';
import {staticFile} from 'remotion';
import {sans} from '../tema';
import {EscenaProps, Lienzo, ease, easeIO, mix, p, rnd} from '../dibujos/base';
import type {FocoEscena} from '../dibujos/camara2d';

const FOTO = {maalem: 'fotos/maalem.jpg', jalloul: 'fotos/jalloul.jpg', hossa: 'fotos/hossa.jpg'} as const;
type Quien = keyof typeof FOTO | 'ola';

const KRAFT = ['#c79a63', '#b8884f'];
const tinta = '#3a2412';
const ROJO = '#d6402f';

/** Fondo de cartón corrugado con costura de hilo y grano */
const Carton: React.FC<{tono?: number}> = ({tono = 0}) => (
  <g>
    <defs>
      <linearGradient id="tm-carton" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={KRAFT[0]} />
        <stop offset="1" stopColor={KRAFT[1]} />
      </linearGradient>
      <filter id="tm-papel" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.4" numOctaves="3" seed={4 + tono} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0 0.08  0 0 0 0.75 -0.3" />
      </filter>
    </defs>
    <rect width={1080} height={1920} fill="url(#tm-carton)" />
    <rect width={1080} height={1920} filter="url(#tm-papel)" opacity={0.55} />
    {Array.from({length: 48}).map((_, i) => (
      <line key={i} x1={0} x2={1080} y1={i * 40 + 20} y2={i * 40 + 20} stroke="#7a5430" strokeWidth={2} opacity={0.14} />
    ))}
    <rect x={36} y={36} width={1008} height={1848} rx={14} fill="none" stroke="#fff4dc" strokeWidth={5} strokeDasharray="26 18" opacity={0.7} />
  </g>
);

const Cinta: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
  <rect x={x - 70} y={y - 22} width={140} height={44} fill="#f3e2a0" opacity={0.82} transform={`rotate(${rot} ${x} ${y})`} />
);

/** Foto recortada y pegada: borde de papel, cinta, sombra y etiqueta con el nombre */
const Foto: React.FC<{
  quien: keyof typeof FOTO;
  x: number;
  y: number;
  w?: number;
  rot?: number;
  esc?: number;
  nombre?: string;
  f: number;
  temblor?: number;
  op?: number;
}> = ({quien, x, y, w = 600, rot = 0, esc = 1, nombre, f, temblor = 0, op = 1}) => {
  const h = (w * 5) / 4;
  const b = 20;
  const sm = Math.floor(f / 3) % 2 ? 1 : -1; // movimiento «stop motion» a saltos
  const r = rot + sm * temblor * 2.2;
  const dx = sm * temblor * 7;
  const id = `tm-foto-${quien}-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g opacity={op} transform={`translate(${x + dx} ${y}) rotate(${r}) scale(${esc})`}>
      <rect x={-w / 2 - b + 8} y={-h / 2 - b + 16} width={w + 2 * b} height={h + 2 * b} fill="#000" opacity={0.28} filter="url(#difusoS)" />
      <rect x={-w / 2 - b} y={-h / 2 - b} width={w + 2 * b} height={h + 2 * b} fill="#fffaf0" />
      <clipPath id={id}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} />
      </clipPath>
      <image href={staticFile(FOTO[quien])} x={-w / 2} y={-h / 2} width={w} height={h} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id})`} />
      <Cinta x={-w / 2 + 40} y={-h / 2 - b} rot={-32} />
      <Cinta x={w / 2 - 40} y={-h / 2 - b} rot={28} />
      {nombre && <Etiqueta texto={nombre} x={0} y={h / 2 + b + 6} />}
    </g>
  );
};

const Etiqueta: React.FC<{texto: string; x: number; y: number; ancho?: number}> = ({texto, x, y, ancho}) => {
  const w = ancho ?? Math.max(260, texto.length * 44 + 70);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M${-w / 2},-4 h${w} v76 h${-w} z`} fill="#fff4d6" stroke="#8a5a2b" strokeWidth={5} />
      <circle cx={-w / 2 + 26} cy={34} r={9} fill="#8a5a2b" />
      <text x={12} y={52} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={46} fill={tinta}>
        {texto}
      </text>
    </g>
  );
};

/** Bocadillo de cómic de papel con picos (grito) */
const Grito: React.FC<{x: number; y: number; texto: string; f: number; a: number; s?: number; color?: string}> = ({x, y, texto, f, a, s = 1, color = ROJO}) => {
  const e = ease(p(f, a, 8));
  if (e <= 0) return null;
  const pico = Math.floor(f / 3) % 2;
  const pts = Array.from({length: 24})
    .map((_, i) => {
      const ang = (i / 24) * Math.PI * 2;
      const r = (i % 2 ? 150 : 205) + (pico ? 8 : -6) * rnd(i);
      return `${Math.cos(ang) * r * 1.35},${Math.sin(ang) * r * 0.85}`;
    })
    .join(' ');
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.4 + 0.6 * e)}) rotate(${pico ? -4 : 4})`} opacity={e}>
      <polygon points={pts} fill="#000" opacity={0.25} transform="translate(8 14)" />
      <polygon points={pts} fill="#fff6dc" stroke={color} strokeWidth={9} strokeLinejoin="round" />
      <text y={22} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={texto.length > 6 ? 64 : 90} fill={color}>
        {texto}
      </text>
    </g>
  );
};

/** Maniquí de cartulina (Ola) */
const Maniqui: React.FC<{x: number; y: number; s?: number; f: number; nombre?: boolean; op?: number}> = ({x, y, s = 1, f, nombre = true, op = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <ellipse cx={8} cy={480} rx={190} ry={26} fill="#000" opacity={0.25} />
    <rect x={-10} y={330} width={20} height={150} fill="#7a4b24" />
    <path d="M-60,480 h120 l-14,-26 h-92 z" fill="#5d3a1b" />
    <path d="M-120,-30 q0,-50 60,-60 h120 q60,10 60,60 l-22,330 h-196 z" fill="#f0e2c0" stroke="#8a5a2b" strokeWidth={6} />
    <path d="M-95,40 h190 M-100,120 h200 M-104,200 h208" stroke="#d6402f" strokeWidth={5} strokeDasharray="14 10" fill="none" />
    <rect x={-22} y={-130} width={44} height={50} fill="#e3d0a3" stroke="#8a5a2b" strokeWidth={5} />
    <circle cx={0} cy={-150} r={20} fill="#c98b3a" stroke="#8a5a2b" strokeWidth={5} />
    <path d="M-2,-190 q-16,-26 0,-40 q16,14 0,40" fill="#c98b3a" stroke="#8a5a2b" strokeWidth={4} />
    <path d="M-120,-30 q-40,40 -34,120 M120,-30 q40,40 34,120" stroke="#8a5a2b" strokeWidth={6} fill="none" />
    {/* cinta métrica colgada */}
    <path d="M-60,-85 q-20,150 80,300" stroke="#fff4d6" strokeWidth={22} fill="none" />
    <path d="M-60,-85 q-20,150 80,300" stroke="#3a2412" strokeWidth={22} fill="none" strokeDasharray="3 14" opacity={0.7} />
    {nombre && <Etiqueta texto="Ola" x={0} y={520} />}
  </g>
);

const Carrete: React.FC<{x: number; y: number; r?: number; s?: number}> = ({x, y, r = 0, s = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-46} y={-50} width={92} height={18} rx={5} fill="#7a4b24" />
    <rect x={-46} y={32} width={92} height={18} rx={5} fill="#7a4b24" />
    <rect x={-38} y={-32} width={76} height={64} fill="#e0524a" />
    {[-20, -6, 8, 22].map((yy) => (
      <line key={yy} x1={-38} x2={38} y1={yy} y2={yy + 6} stroke="#a82e28" strokeWidth={4} />
    ))}
  </g>
);

const Estrella: React.FC<{x: number; y: number; r: number; rot?: number; color?: string}> = ({x, y, r, rot = 0, color = '#ffe08a'}) => (
  <polygon
    transform={`translate(${x} ${y}) rotate(${rot})`}
    points={Array.from({length: 8}).map((_, i) => `${Math.cos((i / 8) * 6.2832) * (i % 2 ? r * 0.42 : r)},${Math.sin((i / 8) * 6.2832) * (i % 2 ? r * 0.42 : r)}`).join(' ')}
    fill={color}
    stroke="#c98a1c"
    strokeWidth={4}
  />
);

/** Entrada con rebote desde arriba */
const cae = (f: number, a: number) => {
  const t = p(f, a, 16);
  const rebote = t < 1 ? 0 : Math.max(0, Math.sin((f - a - 16) * 0.5) * Math.exp(-(f - a - 16) * 0.14)) * 22;
  return mix(-900, 0, ease(t)) - rebote;
};

// ───────────────────────── escenas ─────────────────────────

const Entra: React.FC<EscenaProps> = ({f}) => (
  <Lienzo>
    <Carton />
    <text x={540} y={290} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={74} fill="#fff4dc" stroke={tinta} strokeWidth={2}>
      TALLER DE COSTURA
    </text>
    <Foto quien="maalem" x={540} y={730 + cae(f, 0)} w={620} rot={-3} esc={1 + 0.03 * Math.sin(f * 0.9)} nombre="El mâalem" f={f} temblor={f > 16 ? 1 : 0} />
    <Grito x={820} y={560} texto="¡¡¡!!!" f={f} a={18} s={1.05} />
    <Carrete x={170} y={1500} r={f * 3} s={1.3} />
    <Carrete x={930} y={1580} r={-f * 2} />
  </Lienzo>
);

const OlaEsc: React.FC<EscenaProps> = ({f, d, k}) => {
  const mudo = ease(p(f, k, 10));
  const rueda = f * 6;
  return (
    <Lienzo>
      <Carton tono={1} />
      <Foto quien="maalem" x={250} y={560} w={420} rot={-6} f={f} temblor={1} />
      <Grito x={700} y={400} texto="¡¡OLA!!" f={f} a={4} s={1.05} />
      <Maniqui x={650} y={1080} s={1.25} f={f} />
      {/* el hilo rueda por el suelo */}
      <Carrete x={mix(120, 520, easeIO(p(f, 0, d)))} y={1620} r={rueda} s={1.2} />
      <path d={`M${mix(120, 520, easeIO(p(f, 0, d)))},1620 q-120,40 -220,0`} stroke="#e0524a" strokeWidth={6} fill="none" strokeDasharray="12 8" />
      {/* silencio del maniquí */}
      <g opacity={mudo} transform="translate(860 800)">
        <path d="M-70,-50 h140 q20,0 20,20 v50 q0,20 -20,20 h-60 l-30,34 v-34 h-30 q-20,0 -20,-20 v-50 q0,-20 20,-20 z" fill="#fff6dc" stroke="#8a5a2b" strokeWidth={6} />
        <text y={14} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={70} fill={tinta}>
          …
        </text>
      </g>
    </Lienzo>
  );
};

/** Red de pesca de cuerda que cae sobre Jalloul */
const Red: React.FC<{y: number; x: number; ancho: number; alto: number; o: number}> = ({y, x, ancho, alto, o}) => {
  const n = 7;
  return (
    <g opacity={o} stroke="#4a2f14" strokeWidth={7} fill="none" strokeLinecap="round">
      {Array.from({length: n + 1}).map((_, i) => (
        <path key={`v${i}`} d={`M${x + (i * ancho) / n},${y} q${i % 2 ? 14 : -14},${alto / 2} 0,${alto}`} />
      ))}
      {Array.from({length: n + 1}).map((_, i) => (
        <path key={`h${i}`} d={`M${x},${y + (i * alto) / n} q${ancho / 2},${i % 2 ? 16 : -16} ${ancho},0`} />
      ))}
      {Array.from({length: n + 1}).map((_, i) =>
        Array.from({length: n + 1}).map((__, j) => <circle key={`${i}-${j}`} cx={x + (i * ancho) / n} cy={y + (j * alto) / n} r={6} fill="#4a2f14" stroke="none" />),
      )}
    </g>
  );
};

const JalloulEsc: React.FC<EscenaProps> = ({f, k}) => {
  const baja = easeIO(p(f, k - 14, 14));
  return (
    <Lienzo>
      <Carton tono={2} />
      <Foto quien="maalem" x={820} y={420} w={340} rot={8} f={f} temblor={1} />
      <Grito x={380} y={330} texto="¡¡JALLOUL!!" f={f} a={2} s={0.95} />
      <Foto quien="jalloul" x={540} y={1060} w={620} rot={2} nombre="Jalloul" f={f} temblor={f > k ? 0.8 : 0.2} />
      <Red x={190} y={mix(-700, 700, baja)} ancho={700} alto={720} o={baja > 0 ? 1 : 0} />
      {/* peces de cartulina */}
      {[0, 1, 2].map((i) => {
        const e = ease(p(f, k + 6 + i * 4, 12));
        return (
          <g key={i} transform={`translate(${200 + i * 300} ${1600 + Math.sin(f * 0.2 + i) * 14}) scale(${e})`}>
            <ellipse rx={64} ry={32} fill={['#4aa0c8', '#e89a3c', '#6bbf8a'][i]} stroke={tinta} strokeWidth={5} />
            <polygon points="56,0 100,-32 100,32" fill={['#4aa0c8', '#e89a3c', '#6bbf8a'][i]} stroke={tinta} strokeWidth={5} />
            <circle cx={-34} cy={-6} r={6} fill={tinta} />
          </g>
        );
      })}
    </Lienzo>
  );
};

const HossaEsc: React.FC<EscenaProps> = ({f, k}) => {
  const despierta = ease(p(f, k, 8));
  return (
    <Lienzo>
      <Carton tono={3} />
      <Foto quien="maalem" x={250} y={450} w={360} rot={-8} f={f} temblor={1} />
      <Grito x={720} y={380} texto="¡¡HOSSA!!" f={f} a={2} s={0.9} />
      <Foto quien="hossa" x={560} y={1050} w={640} rot={mix(-9, 2, despierta)} nombre="Hossa" f={f} temblor={despierta > 0.5 ? 1.2 : 0} />
      {/* Zzz que suben */}
      {[0, 1, 2].map((i) => {
        const t = ((f * 0.02 + i / 3) % 1) * (1 - despierta);
        return (
          <text key={i} x={860 + i * 20} y={900 - t * 420} fontFamily={sans} fontWeight={800} fontSize={90 - i * 14} fill="#fff4dc" stroke={tinta} strokeWidth={3} opacity={Math.sin(t * Math.PI)}>
            Z
          </text>
        );
      })}
      <g opacity={despierta} transform="translate(800 1260)">
        <Estrella x={0} y={0} r={90} rot={f * 4} />
        <text y={20} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={70} fill={ROJO}>
          ¡!
        </text>
      </g>
    </Lienzo>
  );
};

const Sudor: React.FC<{x: number; y: number; f: number; i: number}> = ({x, y, f, i}) => {
  const t = ((f * 0.03 + i * 0.37) % 1);
  return <path transform={`translate(${x} ${y + t * 60})`} d="M0,-26 q-18,28 0,40 q18,-12 0,-40" fill="#8fd3f4" stroke="#2b7fa8" strokeWidth={4} opacity={1 - t} />;
};

const Silencio: React.FC<EscenaProps> = ({f}) => (
  <Lienzo>
    <Carton tono={4} />
    <text x={540} y={290} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={80} fill="#fff4dc" stroke={tinta} strokeWidth={2}>
      …
    </text>
    <Foto quien="jalloul" x={300} y={760} w={420} rot={-4} f={f} temblor={0.4} />
    <Foto quien="hossa" x={780} y={760} w={420} rot={4} f={f} temblor={0.4} />
    <Sudor x={470} y={520} f={f} i={0} />
    <Sudor x={950} y={520} f={f} i={1} />
    <Maniqui x={120} y={1380} s={0.38} f={f} nombre={false} />
    {/* máquina de coser asustada */}
    <g transform={`translate(${620 + (Math.floor(f / 2) % 2 ? 6 : -6)} 1380)`}>
      <ellipse cx={0} cy={210} rx={290} ry={24} fill="#000" opacity={0.25} />
      <rect x={-250} y={120} width={500} height={80} rx={18} fill="#cfd6dc" stroke={tinta} strokeWidth={6} />
      <path d="M-230,120 v-190 q0,-60 60,-60 h300 q60,0 60,60 v40 h-90 v150 z" fill="#e8edf0" stroke={tinta} strokeWidth={6} />
      <circle cx={210} cy={-40} r={42} fill="#aab4bb" stroke={tinta} strokeWidth={6} />
      <rect x={-26} y={-20} width={14} height={150} fill="#9aa4ab" stroke={tinta} strokeWidth={4} />
      <circle cx={-120} cy={-30} r={20} fill="#fff" stroke={tinta} strokeWidth={5} />
      <circle cx={-20} cy={-30} r={20} fill="#fff" stroke={tinta} strokeWidth={5} />
      <circle cx={-114} cy={-26} r={8} fill={tinta} />
      <circle cx={-14} cy={-26} r={8} fill={tinta} />
      <path d="M-120,30 q50,-26 100,0" stroke={tinta} strokeWidth={6} fill="none" />
      <Sudor x={-190} y={-70} f={f} i={2} />
    </g>
  </Lienzo>
);

const ClienteEsc: React.FC<EscenaProps> = ({f}) => (
  <Lienzo>
    <Carton tono={5} />
    {/* rayos de sol de papel */}
    <g transform="translate(540 820)">
      {Array.from({length: 14}).map((_, i) => (
        <polygon key={i} points="0,0 -60,-760 60,-760" fill="#ffe9a8" opacity={0.5} transform={`rotate(${(i * 360) / 14 + f * 0.6})`} />
      ))}
    </g>
    <Foto quien="maalem" x={540} y={760} w={640} rot={2 * Math.sin(f * 0.08)} esc={1 + 0.02 * Math.sin(f * 0.2)} nombre="El mâalem" f={f} />
    <g transform="translate(540 270)">
      <path d="M-290,-50 h580 q16,0 16,16 v90 q0,16 -16,16 h-250 l-30,40 l-30,-40 h-270 q-16,0 -16,-16 v-90 q0,-16 16,-16 z" fill="#fff6dc" stroke="#8a5a2b" strokeWidth={6} />
      <text y={36} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={54} fill={tinta}>
        ¡Buenos días, señor!
      </text>
    </g>
    {[0, 1, 2, 3, 4].map((i) => (
      <Estrella key={i} x={110 + i * 215} y={1480 + 50 * Math.sin(f * 0.1 + i)} r={50 + 10 * (i % 2)} rot={f * 3 + i * 20} />
    ))}
  </Lienzo>
);

const CtaEsc: React.FC<EscenaProps> = ({f}) => (
  <Lienzo>
    <Carton tono={6} />
    <Foto quien="maalem" x={300} y={560} w={380} rot={-5} f={f} temblor={0.4} />
    <Foto quien="jalloul" x={780} y={560} w={380} rot={5} f={f} temblor={0.4} />
    <Foto quien="hossa" x={300} y={1180} w={380} rot={4} f={f} temblor={0.4} />
    <Maniqui x={800} y={1000} s={0.55} f={f} nombre={false} />
    <g transform={`translate(540 ${870 + Math.sin(f * 0.12) * 10}) rotate(-4)`}>
      <polygon points="-250,-70 250,-70 250,90 60,90 20,140 0,90 -250,90" fill="#fff6dc" stroke={ROJO} strokeWidth={8} strokeLinejoin="round" />
      <text y={36} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={66} fill={ROJO}>
        ¿Tu jefe?
      </text>
    </g>
  </Lienzo>
);

export const TALLER_MAALEM: Record<string, React.FC<EscenaProps>> = {
  entra: Entra,
  ola: OlaEsc,
  jalloul: JalloulEsc,
  hossa: HossaEsc,
  silencio: Silencio,
  cliente: ClienteEsc,
  tujefe: CtaEsc,
};

export const FOCOS_TALLER_MAALEM: Record<string, FocoEscena> = {
  entra: {x: 540, y: 800},
  ola: {x: 540, y: 900},
  jalloul: {x: 540, y: 950},
  hossa: {x: 540, y: 950},
  silencio: {x: 540, y: 950},
  cliente: {x: 540, y: 850},
  tujefe: {x: 540, y: 850},
};
