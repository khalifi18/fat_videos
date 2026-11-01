// Elementos para el formato hikma: un dibujo pequeño que flota sobre el fondo de color.
// Se dibujan centrados en (0,0) y caben en un círculo de radio ~150.
import React from 'react';
import {P} from '../tema';

export const ELEMENTOS: Record<string, (f: number) => React.ReactNode> = {
  luna: () => (
    <g>
      <defs>
        <mask id="el-luna">
          <rect x={-200} y={-200} width={400} height={400} fill="#fff" />
          <circle cx={48} cy={-34} r={110} fill="#000" />
        </mask>
      </defs>
      <circle r={125} fill="#fff1c9" mask="url(#el-luna)" />
      <circle cx={95} cy={60} r={8} fill="#fff1c9" />
    </g>
  ),
  estrella: (f) => (
    <g transform={`rotate(${f * 0.2})`}>
      <rect x={-95} y={-95} width={190} height={190} fill={P.oro} />
      <rect x={-95} y={-95} width={190} height={190} fill={P.oro} transform="rotate(45)" />
      <rect x={-62} y={-62} width={124} height={124} fill={P.turquesaOsc} />
      <rect x={-62} y={-62} width={124} height={124} fill={P.turquesaOsc} transform="rotate(45)" />
      <circle r={36} fill={P.crema} />
    </g>
  ),
  te: (f) => (
    <g>
      <path d="M-70,120 L-90,-90 L90,-90 L70,120 Z" fill="rgba(255,255,255,0.18)" stroke="#fff" strokeOpacity={0.6} strokeWidth={5} />
      <path d="M-73,120 L-86,-40 L86,-40 L73,120 Z" fill="#b5651d" opacity={0.9} />
      <path d="M-84,-20 L84,-20 M-80,30 L80,30" stroke={P.oro} strokeWidth={7} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${-25 + i * 25},-110 C${-45 + i * 25 + Math.sin(f * 0.08 + i) * 16},-160 ${-5 + i * 25},-190 ${-25 + i * 25 + Math.sin(f * 0.06 + i) * 18},-240`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.35} strokeLinecap="round" />
      ))}
    </g>
  ),
  vela: (f) => {
    const fl = 1 + 0.06 * Math.sin(f * 0.7);
    return (
      <g>
        <rect x={-50} y={-30} width={100} height={170} rx={12} fill="#f6e8d2" />
        <line x1={0} y1={-30} x2={0} y2={-52} stroke="#2b2025" strokeWidth={5} />
        <g transform={`translate(0 -48) scale(${fl})`}>
          <path d="M0,0 C26,-22 20,-70 0,-110 C-20,-70 -26,-22 0,0 Z" fill={P.oro} />
          <path d="M0,-4 C14,-18 11,-46 0,-70 C-11,-46 -14,-18 0,-4 Z" fill="#fffbe8" />
        </g>
      </g>
    );
  },
  hoja: (f) => (
    <g transform={`rotate(${-20 + Math.sin(f * 0.04) * 6})`}>
      <path d="M0,140 C-120,40 -100,-100 0,-150 C100,-100 120,40 0,140 Z" fill={P.verde} />
      <path d="M0,140 L0,-130 M0,40 L-50,-10 M0,-20 L45,-70 M0,90 L50,40" stroke="#a8d08a" strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  ),
  corazon: (f) => (
    <g transform={`scale(${1 + 0.04 * Math.sin(f * 0.2)})`}>
      <path d="M0,110 C-200,-30 -120,-210 0,-100 C120,-210 200,-30 0,110 Z" fill={P.terracota} />
      <path d="M0,-100 L-26,-50 L20,-12 L-16,30 L10,66 L0,110" stroke={P.oro} strokeWidth={7} fill="none" strokeLinejoin="round" />
    </g>
  ),
  llave: () => (
    <g transform="rotate(-35)">
      <circle cx={0} cy={-80} r={58} fill="none" stroke={P.oro} strokeWidth={20} />
      <rect x={-10} y={-24} width={20} height={190} fill={P.oro} />
      <rect x={10} y={110} width={44} height={18} fill={P.oro} />
      <rect x={10} y={140} width={30} height={18} fill={P.oro} />
    </g>
  ),
  arco: () => (
    <g>
      <path d="M-110,150 L-110,-10 A120,120 0 1 1 110,-10 L110,150" fill="none" stroke={P.oro} strokeWidth={14} />
      <path d="M-80,150 L-80,-10 A90,90 0 1 1 80,-10 L80,150 Z" fill={P.oroClaro} opacity={0.3} />
    </g>
  ),
  pajaro: (f) => {
    const ala = Math.sin(f * 0.5) * 30;
    return (
      <g>
        <ellipse cx={0} cy={0} rx={70} ry={46} fill={P.oro} />
        <circle cx={56} cy={-36} r={34} fill={P.oro} />
        <circle cx={66} cy={-40} r={5} fill="#2a1a10" />
        <path d="M86,-40 L118,-30 L86,-22 Z" fill={P.terracota} />
        <path d="M-60,-4 L-120,-32 L-110,16 Z" fill="#d99a3a" />
        <g transform={`rotate(${-ala} -6 -14)`}>
          <path d="M-6,-14 C-46,-110 16,-140 46,-94 C34,-62 16,-30 -6,-14 Z" fill={P.oroClaro} />
        </g>
      </g>
    );
  },
};

/** Fondos de color de la hikma (o un color hex en el guion) */
export const COLORES: Record<string, [string, string]> = {
  noche: ['#141a33', '#2a2350'],
  terracota: ['#7a3424', '#c8623e'],
  verde: ['#163a32', '#2f6b5a'],
  arena: ['#8a6a4a', '#c9a77e'],
  azul: ['#14304f', '#2f5f8f'],
  rosa: ['#5a2a3a', '#a85a6a'],
  ciruela: ['#2a1630', '#5a2e5a'],
};
