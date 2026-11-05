// «La vida es un reloj» — UN SOLO MUNDO 2D CONTINUO (como el vídeo de Ibn Battuta): una noche marroquí vista de lado, de
// izquierda a derecha = el paso del tiempo: la torre del reloj → el muro con las 3.640 semanas de una vida → el reloj de
// arena y las monedas → la tumba con la luz de las obras → vuelta a la torre al amanecer.
// Todas las escenas dibujan el MISMO mundo; cada una solo cambia la vista de cámara {c, z} y termina donde empieza la siguiente.
// Capas con parallax: cielo, montañas lejanas, pueblo, mundo principal, primer plano.
import React from 'react';
import {H, W, amiri, sans} from '../tema';
import {Halo, Lienzo, ease, easeIO, rnd} from '../dibujos/base';
import {Capa, encuadre} from '../dibujos/camara2d';
import type {FocoEscena} from '../dibujos/camara2d';

const ID = 'tiempo';
const FX = W / 2, FY = H * 0.42;
const p = (x: number, a: number, len: number) => Math.min(1, Math.max(0, (x - a) / Math.max(1e-6, len)));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const fmt = (n: number) => Math.round(n).toLocaleString('es-ES');

type Vista = {c: [number, number]; z: number};
const vmix = (a: Vista, b: Vista, t: number, dip = 0): Vista => {
  const z = Math.exp(mix(Math.log(a.z), Math.log(b.z), t)) * (1 - dip * Math.sin(Math.PI * t));
  return {c: [mix(a.c[0], b.c[0], t), mix(a.c[1], b.c[1], t)], z};
};

// ───────────────────────── el mundo (coordenadas de mundo) ─────────────────────────
const GY = 1500; // suelo
const TX = 600; // torre
const PX0 = 1400, CELDA = 35, COLS = 70, FILAS = 52; // muro: 70 años (columnas) × 52 semanas (filas) = 3.640
const PY0 = GY - FILAS * CELDA - 40;
const PW = COLS * CELDA, PH = FILAS * CELDA;
const HX = 4500; // reloj de arena
const MX = 5800; // tumba

const ORO = '#ffcf6a', ORO2 = '#ffe3a0', CREMA = '#fbf3e6';

const mezclaColor = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((x, i) => Math.round(mix(x, pb[i], t)).toString(16).padStart(2, '0')).join('');
};

/** Capa con parallax: q<1 lejos (se mueve menos), q=1 mundo principal, q>1 primer plano */
const Plano: React.FC<{v: Vista; q: number; children: React.ReactNode}> = ({v, q, children}) => {
  const z = q === 1 ? v.z : Math.pow(v.z, q);
  return <g transform={`translate(${FX} ${FY}) scale(${z}) translate(${-v.c[0] * q} ${-v.c[1]})`}>{children}</g>;
};

const Cielo: React.FC<{alba: number; f: number}> = ({alba, f}) => (
  <g>
    <defs>
      <linearGradient id="ti-cielo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={mezclaColor('#080c2a', '#3c3a7a', alba)} />
        <stop offset="0.5" stopColor={mezclaColor('#1d2860', '#c96a78', alba)} />
        <stop offset="0.82" stopColor={mezclaColor('#4b4284', '#ffb070', alba)} />
        <stop offset="1" stopColor={mezclaColor('#2a2252', '#ffd9a0', alba)} />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#ti-cielo)" />
    <g opacity={1 - alba * 0.95}>
      {Array.from({length: 90}).map((_, i) => (
        <circle key={i} cx={rnd(i) * W} cy={rnd(i + 5) * H * 0.75} r={1 + rnd(i + 9) * 2.4} fill="#fff6e0" opacity={0.25 + 0.7 * Math.abs(Math.sin(f * 0.04 + i * 1.7))} />
      ))}
    </g>
    {/* luna y sol */}
    <g opacity={1 - alba}>
      <circle cx={850} cy={250} r={190} fill="#ffe9b8" opacity={0.1} />
      <circle cx={850} cy={250} r={64} fill="#fff3d2" />
      <circle cx={872} cy={236} r={58} fill="#0c123a" opacity={0.0} />
    </g>
    <g opacity={alba}>
      <circle cx={330} cy={1180 - alba * 520} r={360} fill="#ffd9a0" opacity={0.35} />
      <circle cx={330} cy={1180 - alba * 520} r={110} fill="#fff1c9" />
    </g>
  </g>
);

const Montanas: React.FC<{alba: number}> = ({alba}) => {
  const cap = (base: number, amp: number, fr: number, ph: number) => {
    let d = `M-1600,${GY + 400}`;
    for (let x = -1600; x <= 4200; x += 60) d += ` L${x},${base - amp * (0.5 + 0.5 * Math.sin(x / fr + ph)) - amp * 0.35 * Math.sin(x / (fr * 0.37) + ph * 2)}`;
    return d + ` L4200,${GY + 400} Z`;
  };
  return (
    <g>
      <path d={cap(GY - 330, 330, 520, 1)} fill={mezclaColor('#2b2556', '#9a5a78', alba)} />
      <path d={cap(GY - 180, 230, 380, 4)} fill={mezclaColor('#231e49', '#7a4a66', alba)} />
    </g>
  );
};

const Pueblo: React.FC<{alba: number; f: number}> = ({alba, f}) => (
  <g>
    {Array.from({length: 46}).map((_, i) => {
      const x = -900 + i * 118 + rnd(i) * 40;
      const w = 80 + rnd(i + 3) * 90, h = 70 + rnd(i + 4) * 150;
      return (
        <g key={i}>
          <rect x={x} y={GY - 30 - h} width={w} height={h + 30} fill={mezclaColor('#1b1a40', '#5a3a58', alba)} />
          {rnd(i + 6) < 0.6 && <rect x={x + w * 0.35} y={GY - h * 0.7} width={14} height={22} fill={ORO2} opacity={(0.5 + 0.4 * Math.sin(f * 0.05 + i)) * (1 - alba)} />}
          {rnd(i + 8) < 0.5 && <rect x={x + w * 0.6} y={GY - h * 0.4} width={14} height={22} fill={ORO2} opacity={(0.4 + 0.4 * Math.sin(f * 0.04 + i * 2)) * (1 - alba)} />}
        </g>
      );
    })}
    {[600, 1700, 2600].map((x, i) => (
      <g key={'m' + i}>
        <rect x={x} y={GY - 360} width={46} height={360} fill={mezclaColor('#201c4a', '#6a4060', alba)} />
        <rect x={x - 6} y={GY - 380} width={58} height={22} fill={mezclaColor('#201c4a', '#6a4060', alba)} />
        <circle cx={x + 23} cy={GY - 410} r={14} fill={ORO} opacity={1 - alba * 0.4} />
      </g>
    ))}
  </g>
);

const Farola: React.FC<{x: number; f: number; luz: number}> = ({x, f, luz}) => (
  <g>
    <Halo x={x} y={GY - 250} r={170} color="#ffd27a" o={0.55 * luz} />
    <rect x={x - 5} y={GY - 230} width={10} height={236} fill="#120e22" />
    <path d={`M${x - 22},${GY - 262} h44 l-8,34 h-28 z`} fill="#120e22" />
    <rect x={x - 14} y={GY - 258} width={28} height={26} fill={ORO2} opacity={0.6 + 0.4 * luz * (0.8 + 0.2 * Math.sin(f * 0.1 + x))} />
  </g>
);

/** Torre del reloj marroquí con tejado verde */
const Torre: React.FC<{f: number; alba: number; vel?: number}> = ({f, alba, vel = 4}) => {
  const x = TX, top = 580;
  const luzV = 1 - alba * 0.6;
  return (
    <g>
      <Halo x={x} y={840} r={560} color="#ffd9a0" o={0.35 * luzV} />
      <ellipse cx={x} cy={GY + 6} rx={300} ry={26} fill="#000" opacity={0.4} />
      <defs>
        <linearGradient id="ti-torre" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e4c294" />
          <stop offset="0.6" stopColor="#c99d6e" />
          <stop offset="1" stopColor="#8e6a4e" />
        </linearGradient>
        <linearGradient id="ti-teja" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3aa07a" />
          <stop offset="0.55" stopColor="#23785a" />
          <stop offset="1" stopColor="#164d3c" />
        </linearGradient>
      </defs>
      <rect x={x - 190} y={top} width={380} height={GY - top} fill="url(#ti-torre)" />
      <rect x={x - 215} y={top - 28} width={430} height={36} fill="#a67a54" />
      <rect x={x - 215} y={top + 8} width={430} height={10} fill="#6a4a38" opacity={0.6} />
      {/* banda de zellige */}
      {Array.from({length: 19}).map((_, i) => (
        <rect key={i} x={x - 190 + i * 20} y={top + 40} width={18} height={18} fill={['#2f7a8a', '#d6a14a', '#c24a3a', '#f4eadb'][i % 4]} />
      ))}
      {/* tejado verde (pirámide) */}
      <path d={`M${x - 250},${top - 28} L${x},${top - 330} L${x + 250},${top - 28} Z`} fill="url(#ti-teja)" />
      <path d={`M${x},${top - 330} L${x + 250},${top - 28} L${x + 90},${top - 28} Z`} fill="#0e3a2c" opacity={0.45} />
      <rect x={x - 6} y={top - 400} width={12} height={80} fill="#c9983a" />
      <circle cx={x} cy={top - 410} r={22} fill={ORO} />
      <Halo x={x} y={top - 410} r={90} color="#ffd27a" o={0.5} />
      {/* ventanas con luz */}
      {[1010, 1200].map((y) => [-95, 95].map((dx) => (
        <g key={`${y}${dx}`}>
          <path d={`M${x + dx - 34},${y + 90} V${y + 30} a34,34 0 0 1 68,0 V${y + 90} Z`} fill={mezclaColor('#ffd27a', '#8a6a5a', alba * 0.5)} />
          <path d={`M${x + dx - 34},${y + 90} V${y + 30} a34,34 0 0 1 68,0 V${y + 90}`} fill="none" stroke="#6a4a38" strokeWidth={6} />
        </g>
      )))}
      <path d={`M${x - 70},${GY} V${GY - 160} a70,70 0 0 1 140,0 V${GY} Z`} fill="#2a1a30" />
      <path d={`M${x - 70},${GY} V${GY - 160} a70,70 0 0 1 140,0 V${GY}`} fill="none" stroke="#f0c890" strokeWidth={8} />
      {/* esfera */}
      <circle cx={x} cy={840} r={172} fill="#c9983a" />
      <circle cx={x} cy={840} r={152} fill="#fff4dc" />
      {Array.from({length: 12}).map((_, i) => (
        <line key={i} x1={x} y1={840 - 150} x2={x} y2={840 - (i % 3 === 0 ? 112 : 128)} stroke="#1a1530" strokeWidth={i % 3 === 0 ? 12 : 6} strokeLinecap="round" transform={`rotate(${i * 30} ${x} 840)`} />
      ))}
      <line x1={x} y1={840} x2={x} y2={840 - 128} stroke="#1a1530" strokeWidth={9} strokeLinecap="round" transform={`rotate(${f * vel} ${x} 840)`} />
      <line x1={x} y1={840} x2={x} y2={840 - 84} stroke="#1a1530" strokeWidth={15} strokeLinecap="round" transform={`rotate(${(f * vel) / 12} ${x} 840)`} />
      <circle cx={x} cy={840} r={13} fill="#c9983a" />
    </g>
  );
};

/** El muro de semanas: 70 columnas (años) × 52 filas (semanas). Se enciende de izquierda a derecha */
const Muro: React.FC<{f: number; reveladas: number; vividas: number}> = ({f, reveladas, vividas}) => {
  const lit = Math.floor(COLS * FILAS * reveladas);
  const corte = Math.floor(vividas);
  const oro: string[] = [], pasado: string[] = [], oscuro: string[] = [], ahora: string[] = [], chispa: string[] = [];
  for (let i = 0; i < COLS * FILAS; i++) {
    const c = Math.floor(i / FILAS), r = i % FILAS;
    const d = `M${PX0 + c * CELDA + 3},${PY0 + r * CELDA + 3}h${CELDA - 6}v${CELDA - 6}h${-(CELDA - 6)}z`;
    if (i >= lit) oscuro.push(d);
    else if (c < corte) pasado.push(d);
    else if (c === corte && vividas > 0 && vividas < 30) ahora.push(d);
    else {
      oro.push(d);
      if ((i * 7919 + Math.floor(f / 8)) % 61 === 0) chispa.push(d);
    }
  }
  return (
    <g>
      <Halo x={PX0 + PW / 2} y={PY0 + PH / 2} r={PW * 0.55} color="#ffcf6a" o={0.28 * reveladas} />
      <rect x={PX0 - 34} y={PY0 - 34} width={PW + 68} height={PH + 68} rx={26} fill="#120e2a" stroke="#c9983a" strokeWidth={8} />
      <rect x={PX0 - 18} y={PY0 - 18} width={PW + 36} height={PH + 36} rx={14} fill="none" stroke="#6a5028" strokeWidth={4} />
      <path d={oscuro.join('')} fill="#1c2248" />
      <path d={pasado.join('')} fill="#35406e" />
      <path d={oro.join('')} fill={ORO} />
      <path d={chispa.join('')} fill="#fff4d0" />
      <path d={ahora.join('')} fill="#8fd8ff" />
      {/* postes del muro */}
      {[PX0 + 120, PX0 + PW - 120].map((x) => (
        <rect key={x} x={x - 12} y={GY - 40} width={24} height={44} fill="#3a2a1a" />
      ))}
    </g>
  );
};

/** Pastilla redonda con número/texto (mundo) */
const Pastilla: React.FC<{x: number; y: number; w: number; h: number; e: number; children: React.ReactNode}> = ({x, y, w, h, e, children}) =>
  e <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * e})`} opacity={e}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="#10132e" opacity={0.9} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="none" stroke={ORO} strokeWidth={6} />
      {children}
    </g>
  );

/** Reloj de arena grande: s = 0 (todo arriba) … 1 (todo abajo) */
const RelojArena: React.FC<{f: number; s: number; e: number}> = ({f, s, e}) => {
  const cx = HX, cy = GY - 470;
  const vidrio = 'M-170,-380 L170,-380 C170,-200 30,-60 14,0 C30,60 170,200 170,380 L-170,380 C-170,200 -30,60 -14,0 C-30,-60 -170,-200 -170,-380 Z';
  const nivelTop = -20 - 340 * (1 - s); // la arena de arriba baja
  const alto = 330 * s; // monte de abajo
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.9 + 0.1 * e})`} opacity={e}>
      <Halo x={0} y={0} r={620} color="#ffcf6a" o={0.38} />
      <ellipse cx={0} cy={470} rx={330} ry={30} fill="#000" opacity={0.4} />
      <defs>
        <clipPath id="ti-clip">
          <path d={vidrio} />
        </clipPath>
        <linearGradient id="ti-vidrio" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#bfe0ff" stopOpacity={0.35} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={0.08} />
          <stop offset="1" stopColor="#bfe0ff" stopOpacity={0.3} />
        </linearGradient>
        <linearGradient id="ti-arena" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffdd8a" />
          <stop offset="0.5" stopColor="#ffcf6a" />
          <stop offset="1" stopColor="#d9a040" />
        </linearGradient>
        <linearGradient id="ti-madera" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8723a" />
          <stop offset="1" stopColor="#5a3a1e" />
        </linearGradient>
      </defs>
      <path d={vidrio} fill="#1a2250" opacity={0.55} />
      <g clipPath="url(#ti-clip)">
        <rect x={-180} y={nivelTop} width={360} height={Math.max(0, -nivelTop - 8)} fill="url(#ti-arena)" />
        <path d={`M-200,382 L-200,${380 - alto * 0.35} Q0,${380 - alto * 1.25} 200,${380 - alto * 0.35} L200,382 Z`} fill="url(#ti-arena)" />
        {s > 0.001 && s < 0.97 && <rect x={-6} y={-8} width={12} height={380 - alto * 0.95} fill="#ffe3a0" />}
        {s < 0.97 && Array.from({length: 8}).map((_, i) => (
          <circle key={i} cx={Math.sin(f * 0.3 + i * 2) * 5} cy={((f * 9 + i * 45) % 340) + 10} r={4} fill="#fff1c0" />
        ))}
      </g>
      <path d={vidrio} fill="url(#ti-vidrio)" stroke="#e4f0ff" strokeWidth={5} opacity={0.9} />
      <rect x={-215} y={-420} width={430} height={44} rx={10} fill="url(#ti-madera)" />
      <rect x={-215} y={376} width={430} height={44} rx={10} fill="url(#ti-madera)" />
      {[-196, 196].map((x) => (
        <rect key={x} x={x - 9} y={-376} width={18} height={752} fill="url(#ti-madera)" />
      ))}
    </g>
  );
};

/** Monedas: pilas doradas y una que gira */
const Monedas: React.FC<{f: number; e: number}> = ({f, e}) => (
  <g opacity={e} transform={`translate(0 ${(1 - e) * 40})`}>
    <Halo x={4120} y={GY - 60} r={240} color="#ffcf6a" o={0.45} />
    {[[4030, 5], [4110, 8], [4190, 4], [4075, 3]].map(([x, n], i) => (
      <g key={i}>
        {Array.from({length: n}).map((_, k) => (
          <g key={k}>
            <ellipse cx={x} cy={GY - 12 - k * 15} rx={52} ry={14} fill="#a8741e" />
            <ellipse cx={x} cy={GY - 20 - k * 15} rx={52} ry={14} fill={ORO} stroke="#8a5a14" strokeWidth={3} />
            <ellipse cx={x} cy={GY - 20 - k * 15} rx={32} ry={7} fill="none" stroke="#b8821e" strokeWidth={3} />
          </g>
        ))}
      </g>
    ))}
    {/* moneda que vuela y vuelve */}
    <g transform={`translate(${4300 + Math.sin(f * 0.07) * 40} ${GY - 330 + Math.sin(f * 0.14) * 24})`}>
      <ellipse rx={Math.abs(Math.cos(f * 0.12)) * 46 + 4} ry={46} fill={ORO} stroke="#8a5a14" strokeWidth={4} />
    </g>
  </g>
);

const Tumba: React.FC<{f: number; luz: number}> = ({f, luz}) => {
  const x = MX;
  return (
    <g>
      <Halo x={x} y={GY - 520} r={560} color="#ffd27a" o={0.7 * luz} />
      <ellipse cx={x} cy={GY + 4} rx={330} ry={26} fill="#000" opacity={0.4} />
      <path d={`M${x - 330},${GY} Q${x},${GY - 210} ${x + 330},${GY} Z`} fill="#241f46" />
      <path d={`M${x - 330},${GY} Q${x},${GY - 210} ${x + 330},${GY}`} fill="none" stroke="#3a3466" strokeWidth={6} />
      {/* lápida con arco de herradura */}
      <path d={`M${x - 92},${GY - 90} V${GY - 330} a92,92 0 0 1 184,0 V${GY - 90} Z`} fill="#9a97b6" />
      <path d={`M${x - 92},${GY - 90} V${GY - 330} a92,92 0 0 1 184,0 V${GY - 90} Z`} fill="none" stroke="#c9c6e0" strokeWidth={6} />
      <path d={`M${x - 52},${GY - 130} V${GY - 320} a52,52 0 0 1 104,0 V${GY - 130} Z`} fill="none" stroke="#6a678a" strokeWidth={4} />
      <rect x={x - 130} y={GY - 100} width={260} height={30} rx={8} fill="#7a77a0" />
      {/* cipreses */}
      {[-300, -240, 300].map((dx, i) => (
        <path key={i} d={`M${x + dx},${GY} C${x + dx - 50},${GY - 200} ${x + dx - 26},${GY - 520 - i * 50} ${x + dx},${GY - 640 - i * 50} C${x + dx + 26},${GY - 520 - i * 50} ${x + dx + 50},${GY - 200} ${x + dx},${GY} Z`} fill={i === 1 ? '#10302c' : '#163a34'} />
      ))}
      {/* libro de luz: las obras */}
      <g transform={`translate(${x} ${GY - 560 - luz * 90 + Math.sin(f * 0.07) * 10}) scale(${0.3 + 0.7 * luz})`} opacity={luz}>
        {Array.from({length: 12}).map((_, i) => (
          <line key={i} x1={0} y1={0} x2={0} y2={-220} stroke="#ffe3a0" strokeWidth={5} opacity={0.35} strokeLinecap="round" transform={`rotate(${i * 30 + f * 0.6})`} />
        ))}
        <path d="M0,60 L-190,76 L-190,-92 L0,-104 Z" fill="#f4e8cc" />
        <path d="M0,60 L190,76 L190,-92 L0,-104 Z" fill="#fbf0d8" />
        <path d="M-200,80 L0,64 L0,-108 L-200,-96 Z" fill="none" stroke="#7a2a1e" strokeWidth={8} />
        <path d="M200,80 L0,64 L0,-108 L200,-96 Z" fill="none" stroke="#7a2a1e" strokeWidth={8} />
        <text x={-95} y={-6} textAnchor="middle" fontFamily={amiri} fontWeight={700} fontSize={84} fill="#7a2a1e">
          عمل
        </text>
        {Array.from({length: 5}).map((_, i) => (
          <rect key={i} x={30} y={-70 + i * 26} width={130 - (i % 2) * 24} height={7} rx={3} fill="#c4a87a" />
        ))}
      </g>
    </g>
  );
};

/** Primer plano oscuro con parallax: cipreses y matas */
const Primer: React.FC<{alba: number}> = ({alba}) => (
  <g>
    {Array.from({length: 26}).map((_, i) => {
      const x = -800 + i * 330 + rnd(i) * 120;
      const h = 90 + rnd(i + 2) * 120;
      return <path key={i} d={`M${x - 60},${GY + 360} Q${x - 40},${GY + 360 - h} ${x},${GY + 330 - h * 1.1} Q${x + 40},${GY + 360 - h} ${x + 60},${GY + 360} Z`} fill={mezclaColor('#0a0818', '#2a1620', alba)} />;
    })}
  </g>
);

const Suelo: React.FC<{alba: number}> = ({alba}) => (
  <g>
    <defs>
      <linearGradient id="ti-suelo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={mezclaColor('#23224a', '#6a4458', alba)} />
        <stop offset="0.25" stopColor={mezclaColor('#13122e', '#3a2438', alba)} />
        <stop offset="1" stopColor={mezclaColor('#07061a', '#1a0e1c', alba)} />
      </linearGradient>
    </defs>
    <rect x={-2400} y={GY} width={9600} height={6000} fill="url(#ti-suelo)" />
    <path d={`M-2400,${GY + 70} Q1500,${GY + 40} 3200,${GY + 80} T8000,${GY + 60}`} fill="none" stroke={mezclaColor('#3a3a78', '#a86a70', alba)} strokeWidth={5} opacity={0.5} />
  </g>
);

// ───────────────────────── fábrica de escenas ─────────────────────────
type Estado = {alba: number; reveladas: number; vividas: number; arena: number; luzTumba: number; relojE: number; monedasE: number};
type Ctx = {f: number; tl: number; t: number; v: Vista; d: number};
type Def = {vista: (t: number, tl: number) => Vista; estado: (t: number, tl: number) => Partial<Estado>; extra?: (c: Ctx, e: Estado) => React.ReactNode};

const BASE: Estado = {alba: 0, reveladas: 0, vividas: 0, arena: 0.03, luzTumba: 0, relojE: 0, monedasE: 0};
const semillaDe = (nombre: string) => [...`${ID}-${nombre}`].reduce((a, ch) => a + ch.charCodeAt(0), 0);
const S = 30;

const escena = (nombre: string, def: Def, ultimo = false): React.FC<{f: number; d: number}> => {
  const sem = semillaDe(nombre);
  return ({f, d}) => {
    const L = ultimo ? d : Math.max(1, d - 12);
    const t = Math.min(1, f / L);
    const tl = f / S;
    const v = def.vista(t, tl);
    const e: Estado = {...BASE, ...def.estado(t, tl)};
    const cam = encuadre(f, d, sem, {x: FX, y: FY});
    const comp = `translate(${cam.x} ${cam.y}) scale(${1 / cam.s}) translate(${-FX} ${-FY})`;
    const c: Ctx = {f, tl, t, v, d};
    return (
      <Lienzo>
        <Capa z={0}>
          <Cielo alba={e.alba} f={f} />
        </Capa>
        <Capa z={0.5}>
          <g transform={comp}>
            <Plano v={v} q={0.22}>
              <Montanas alba={e.alba} />
            </Plano>
            <Plano v={v} q={0.5}>
              <Pueblo alba={e.alba} f={f} />
            </Plano>
            <Plano v={v} q={1}>
              <Suelo alba={e.alba} />
              {[250, 1050, 3400, 3980, 5000, 6300].map((x) => (
                <Farola key={x} x={x} f={f} luz={1 - e.alba * 0.7} />
              ))}
              <Torre f={f} alba={e.alba} />
              <Muro f={f} reveladas={e.reveladas} vividas={e.vividas} />
              <Monedas f={f} e={e.monedasE} />
              <RelojArena f={f} s={e.arena} e={e.relojE} />
              <Tumba f={f} luz={e.luzTumba} />
              {def.extra?.(c, e)}
            </Plano>
          </g>
        </Capa>
        <Capa z={1}>
          <g transform={comp}>
            <Plano v={v} q={1.25}>
              <Primer alba={e.alba} />
            </Plano>
          </g>
        </Capa>
      </Lienzo>
    );
  };
};

// vistas encadenadas: cada escena termina donde empieza la siguiente
const V_RELOJ0: Vista = {c: [TX + 60, 860], z: 1.1};
const V_RELOJ1: Vista = {c: [TX, 830], z: 1.35};
const V_PUEBLO: Vista = {c: [1900, 760], z: 0.5};
const V_MURO: Vista = {c: [PX0 + PW / 2, PY0 + PH / 2 - 470], z: 0.37};
const V_30: Vista = {c: [PX0 + 15 * CELDA, PY0 + PH / 2 - 270], z: 0.62};
const V_ARENA: Vista = {c: [HX - 140, GY - 470], z: 0.85};
const V_ARENA2: Vista = {c: [HX, GY - 450], z: 1.05};
const V_TUMBA: Vista = {c: [MX, GY - 330], z: 0.9};
const V_TORRE: Vista = {c: [TX, 830], z: 0.95};
const V_TODO: Vista = {c: [3200, 640], z: 0.18};

const Reloj = escena('reloj', {
  vista: (t) => vmix(V_RELOJ0, V_RELOJ1, easeIO(t)),
  estado: () => ({}),
});
const Colina = escena('colina', {
  vista: (t) => vmix(V_RELOJ1, V_PUEBLO, easeIO(t)),
  estado: () => ({}),
});
const Semanas = escena('semanas', {
  vista: (t) => vmix(V_PUEBLO, V_MURO, easeIO(p(t, 0, 0.55))),
  estado: (t) => ({reveladas: easeIO(p(t, 0.12, 0.62))}),
  extra: (c, e) => (
    <>
      <Pastilla x={PX0 + PW / 2} y={PY0 - 330} w={1900} h={440} e={ease(p(c.t, 0.5, 0.2)) * (1 - p(c.t, 0.97, 0.03))}>
        <text x={-250} y={90} fill={ORO2} fontFamily={sans} fontWeight={800} fontSize={290} textAnchor="middle">
          3.640
        </text>
        <text x={560} y={76} fill={CREMA} fontFamily={sans} fontWeight={800} fontSize={130} textAnchor="middle">
          semanas
        </text>
      </Pastilla>
    </>
  ),
});
const Treinta = escena('treinta', {
  vista: (t) => vmix(V_MURO, V_30, easeIO(p(t, 0, 0.5))),
  estado: (t) => ({reveladas: 1, vividas: 30 * easeIO(p(t, 0.2, 0.6))}),
  extra: (c, e) => {
    const x0 = PX0, x1 = PX0 + 30 * CELDA;
    const a = ease(p(c.t, 0.55, 0.2));
    return (
      <g opacity={a}>
        <path d={`M${x0},${PY0 - 70} v-30 H${x1} v30`} fill="none" stroke="#8fd8ff" strokeWidth={9} strokeLinejoin="round" />
        <Pastilla x={(x0 + x1) / 2} y={PY0 - 290} w={1350} h={320} e={a}>
          <text x={-230} y={72} fill="#bfe6ff" fontFamily={sans} fontWeight={800} fontSize={210} textAnchor="middle">
            1.560
          </text>
          <text x={340} y={52} fill={CREMA} fontFamily={sans} fontWeight={800} fontSize={88} textAnchor="middle">
            ya vividas
          </text>
        </Pastilla>
      </g>
    );
  },
});
const Arena = escena('arena', {
  vista: (t) => vmix(V_30, V_ARENA, easeIO(p(t, 0, 0.6)), 0.35),
  estado: (t) => ({reveladas: 1, vividas: 30, relojE: ease(p(t, 0.35, 0.3)), monedasE: ease(p(t, 0.45, 0.3)), arena: 0.03 + 0.4 * p(t, 0.35, 0.65)}),
});
const Espada = escena('espada', {
  vista: (t) => vmix(V_ARENA, V_ARENA2, easeIO(t)),
  estado: (t) => ({reveladas: 1, vividas: 30, relojE: 1, monedasE: 1, arena: 0.43 + 0.37 * t}),
  extra: (c) => {
    const a = ease(p(c.t, 0.18, 0.2));
    return (
      <g opacity={a} transform={`translate(0 ${(1 - a) * 30})`}>
        <rect x={HX - 560} y={GY - 1010} width={1120} height={200} rx={100} fill="#10132e" opacity={0.9} />
        <rect x={HX - 560} y={GY - 1010} width={1120} height={200} rx={100} fill="none" stroke={ORO} strokeWidth={6} />
        <text x={HX} y={GY - 880} textAnchor="middle" fontFamily={amiri} fontWeight={700} fontSize={84} fill={ORO2} direction="rtl">
          الْوَقْتُ كَالسَّيْفِ، إِنْ لَمْ تَقْطَعْهُ قَطَعَكَ
        </text>
      </g>
    );
  },
});
const TumbaE = escena('tumba', {
  vista: (t) => vmix(V_ARENA2, V_TUMBA, easeIO(p(t, 0, 0.6)), 0.35),
  estado: (t) => ({reveladas: 1, vividas: 30, relojE: 1, monedasE: 1, arena: 0.8, luzTumba: ease(p(t, 0.5, 0.35))}),
});
const Amanecer = escena('amanecer', {
  vista: (t) => vmix(V_TUMBA, V_TORRE, easeIO(p(t, 0, 0.8)), 0.85),
  estado: (t) => ({reveladas: 1, vividas: 30, relojE: 1, monedasE: 1, arena: 0.8, luzTumba: 1, alba: easeIO(p(t, 0.15, 0.7))}),
  extra: (c) => {
    const a = ease(p(c.t, 0.72, 0.2));
    return (
      <g opacity={a}>
        <rect x={TX + 270} y={700} width={560} height={150} rx={75} fill="#10132e" opacity={0.9} />
        <rect x={TX + 270} y={700} width={560} height={150} rx={75} fill="none" stroke={ORO} strokeWidth={5} />
        <text x={TX + 550} y={800} textAnchor="middle" fontFamily={amiri} fontWeight={700} fontSize={82} fill={ORO2}>
          فاجعلها طاعة
        </text>
      </g>
    );
  },
});
const Cta = escena(
  'cta',
  {
    vista: (t) => vmix(V_TORRE, V_TODO, easeIO(p(t, 0, 0.7))),
    estado: () => ({reveladas: 1, vividas: 30, relojE: 1, monedasE: 1, arena: 0.8, luzTumba: 1, alba: 1}),
    extra: (c) => {
      const a = ease(p(c.t, 0.55, 0.25));
      return (
        <g opacity={a}>
          <rect x={800} y={-300} width={4800} height={520} rx={260} fill="#10132e" opacity={0.9} />
          <rect x={800} y={-300} width={4800} height={520} rx={260} fill="none" stroke={ORO} strokeWidth={16} />
          <text x={3200} y={-40} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={260} fill={CREMA}>
            ¿Qué vas a hacer esta semana?
          </text>
        </g>
      );
    },
  },
  true,
);

export const TIEMPO: Record<string, React.FC<{f: number; d: number; k: number; opts: string[]}>> = {
  [`${ID}-reloj`]: Reloj,
  [`${ID}-colina`]: Colina,
  [`${ID}-semanas`]: Semanas,
  [`${ID}-treinta`]: Treinta,
  [`${ID}-arena`]: Arena,
  [`${ID}-espada`]: Espada,
  [`${ID}-tumba`]: TumbaE,
  [`${ID}-amanecer`]: Amanecer,
  [`${ID}-cta`]: Cta,
};

/** Todas miran al centro de la cámara: el viaje lo hace la vista de mundo */
export const FOCOS_TIEMPO: Record<string, FocoEscena> = Object.fromEntries(Object.keys(TIEMPO).map((k) => [k, {x: FX, y: FY}]));
