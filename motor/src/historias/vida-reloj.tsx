// Escenas a medida: «La vida es un reloj» — reloj, etapas de la vida, reloj de arena, tumba (siluetas sin cara, sin copiar a nadie)
import React from 'react';
import {amiri, sans} from '../tema';
import {Cielo, EscenaProps, Estrellas, FondoVideoCtx, Halo, Lienzo, Polvo, Silueta, ease, p, rnd} from '../dibujos/base';
import type {FocoEscena} from '../dibujos/camara2d';

const ORO = '#f2c165';
const ORO2 = '#ffe3a0';
const CREMA = '#fbf3e6';
const NOCHE = ['#070b1f', '#14224a', '#2a3a6b'];
const ATARDECER = ['#2b1a3d', '#8a3f4f', '#e08a4a', '#f6c06b'];
const SIL = '#120d1c';

const Sky: React.FC<{id: string; c: string[]}> = ({id, c}) => {
  const v = React.useContext(FondoVideoCtx);
  return <Cielo id={id} colores={c} o={v ? 0.62 : 1} />;
};

const Titulo: React.FC<{ar: string; es?: string; y: number; o?: number}> = ({ar, es, y, o = 1}) => (
  <g opacity={o}>
    <text x={540} y={y} textAnchor="middle" fontFamily={amiri} fontWeight={700} fontSize={110} fill={ORO} stroke="#00000066" strokeWidth={2}>
      {ar}
    </text>
    {es && (
      <text x={540} y={y + 70} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={46} fill={CREMA} stroke="#00000066" strokeWidth={2}>
        {es}
      </text>
    )}
  </g>
);

const Esfera: React.FC<{x: number; y: number; r: number; f: number; vel?: number}> = ({x, y, r, f, vel = 4}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 18} fill={ORO} opacity={0.9} />
    <circle r={r} fill="#fff6e0" />
    {Array.from({length: 12}).map((_, i) => (
      <line key={i} x1={0} y1={-r + 14} x2={0} y2={-r + (i % 3 === 0 ? 52 : 34)} stroke={SIL} strokeWidth={i % 3 === 0 ? 12 : 7} strokeLinecap="round" transform={`rotate(${i * 30})`} />
    ))}
    <line x1={0} y1={0} x2={0} y2={-r * 0.82} stroke={SIL} strokeWidth={9} strokeLinecap="round" transform={`rotate(${f * vel})`} />
    <line x1={0} y1={0} x2={0} y2={-r * 0.52} stroke={SIL} strokeWidth={16} strokeLinecap="round" transform={`rotate(${f * vel / 12})`} />
    <circle r={16} fill={SIL} />
  </g>
);

const HoraVida: React.FC<EscenaProps> = ({f}) => {
  const e = ease(p(f, 0, 14));
  return (
    <Lienzo>
      <Sky id="vr-s1" c={ATARDECER} />
      <Halo x={540} y={640} r={520} color={ORO} o={0.35} />
      <g transform={`translate(0 ${(1 - e) * 80})`} opacity={e}>
        <Esfera x={540} y={620} r={330} f={f} />
        {Array.from({length: 10}).map((_, i) => {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          return <Silueta key={i} x={540 + Math.cos(a) * 470} y={640 + Math.sin(a) * 470 + 120} s={0.28} tipo={i % 3 === 0 ? 'nino' : i % 3 === 1 ? 'hombre' : 'mujer'} color={SIL} o={0.85} />;
        })}
      </g>
      <Titulo ar="الدنيا ساعة" y={1040} o={ease(p(f, 10, 14))} />
      <Polvo f={f} n={24} />
    </Lienzo>
  );
};

const Etapas: React.FC<EscenaProps> = ({f}) => {
  const pasos = [
    {t: 'nino' as const, s: 0.55, x: 170, n: 'bebé'},
    {t: 'nino' as const, s: 0.8, x: 400, n: ''},
    {t: 'hombre' as const, s: 1.05, x: 650, n: ''},
    {t: 'hombre' as const, s: 0.95, x: 890, n: 'anciano'},
  ];
  return (
    <Lienzo>
      <Sky id="vr-s2" c={ATARDECER} />
      <Halo x={540} y={500} r={600} color={ORO} o={0.25} />
      <line x1={60} y1={1100} x2={1020} y2={1100} stroke={SIL} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
      {pasos.map((s, i) => {
        const e = ease(p(f, 4 + i * 12, 14));
        return (
          <g key={i} opacity={e} transform={`translate(0 ${(1 - e) * 60})`}>
            <Silueta x={s.x} y={1090} s={s.t === 'nino' ? s.s * 1.3 : s.s * 1.25} tipo={s.t} color={SIL} />
            {i === 3 && <line x1={s.x + 70} y1={1090} x2={s.x + 95} y2={760} stroke={SIL} strokeWidth={10} strokeLinecap="round" />}
          </g>
        );
      })}
      <path d="M170,640 Q540,420 890,640" fill="none" stroke={ORO} strokeWidth={8} strokeDasharray="6 22" strokeLinecap="round" opacity={0.9} />
      <circle cx={170 + 720 * p(f, 0, 70)} cy={640 - 4 * 220 * (p(f, 0, 70) * (1 - p(f, 0, 70)))} r={22} fill={ORO2} />
      <Polvo f={f} n={20} />
    </Lienzo>
  );
};

const Arena: React.FC<EscenaProps> = ({f, d}) => {
  const t = p(f, 8, Math.max(30, d - 20));
  const e = ease(p(f, 0, 14));
  return (
    <Lienzo>
      <Sky id="vr-s3" c={NOCHE} />
      <Estrellas f={f} n={60} hasta={700} o={0.6} />
      <Halo x={540} y={640} r={460} color={ORO} o={0.3} />
      <g transform={`translate(540 600) scale(${2.4 * (0.8 + 0.2 * e)})`} opacity={e}>
        <path d="M-70,-110 H70 L12,0 L70,110 H-70 L-12,0 Z" fill="#ffffff14" stroke={ORO} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M-${50 * (1 - t) + 6},-100 H${50 * (1 - t) + 6} L${8 * (1 - t) + 2},${-100 + 80 * (1 - t) + 4} H-${8 * (1 - t) + 2} Z`} fill={ORO2} opacity={1 - t * 0.2} />
        <path d={`M-${8 + 42 * t},${100 - 80 * t} L${8 + 42 * t},${100 - 80 * t} L50,100 H-50 Z`} fill={ORO2} />
        <line x1={0} y1={0} x2={0} y2={100 - 80 * t} stroke={ORO2} strokeWidth={2.5} />
        <line x1={-86} y1={-118} x2={86} y2={-118} stroke={ORO} strokeWidth={10} strokeLinecap="round" />
        <line x1={-86} y1={118} x2={86} y2={118} stroke={ORO} strokeWidth={10} strokeLinecap="round" />
      </g>
      <Titulo ar="دوام الحال من المحال" y={1030} o={ease(p(f, 12, 14))} />
      <Polvo f={f} n={26} />
    </Lienzo>
  );
};

const Poder: React.FC<EscenaProps> = ({f, d}) => {
  const t = p(f, 16, Math.max(20, d - 24));
  return (
    <Lienzo>
      <Sky id="vr-s4" c={ATARDECER} />
      <g opacity={1 - t} transform={`translate(0 ${t * 60})`}>
        <path d="M290,520 L360,360 L450,470 L540,330 L630,470 L720,360 L790,520 Z" fill={ORO} stroke="#8a5a1a" strokeWidth={8} strokeLinejoin="round" transform={`translate(0 ${Math.sin(f * 0.1) * 6})`} />
        <rect x={290} y={520} width={500} height={50} rx={10} fill={ORO2} stroke="#8a5a1a" strokeWidth={8} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${210 + i * 165} ${760 + (i % 2) * 40}) rotate(${Math.sin(f * 0.08 + i) * 8})`}>
            <circle r={62} fill={ORO} stroke="#8a5a1a" strokeWidth={8} />
            <circle r={42} fill="none" stroke="#8a5a1a" strokeWidth={5} />
          </g>
        ))}
      </g>
      {Array.from({length: 40}).map((_, i) => {
        const y = 560 + t * (260 + rnd(i) * 400) + rnd(i + 4) * 60;
        return <circle key={i} cx={260 + rnd(i + 9) * 560} cy={y} r={3 + rnd(i + 1) * 5} fill={ORO2} opacity={t * (1 - t) * 2.2} />;
      })}
      <Titulo ar="كلّ شيء يزول" es="todo pasa" y={990} o={ease(p(f, 20, 14))} />
    </Lienzo>
  );
};

const Tumba: React.FC<EscenaProps> = ({f, d}) => {
  const t = ease(p(f, 16, Math.max(20, d - 30)));
  return (
    <Lienzo>
      <Sky id="vr-s5" c={NOCHE} />
      <Estrellas f={f} n={80} hasta={800} />
      <Halo x={540} y={600 - t * 120} r={150 + t * 260} color={ORO} o={0.15 + 0.6 * t} />
      <path d="M0,980 Q540,900 1080,980 L1080,1920 L0,1920 Z" fill="#0b0f22" />
      <path d="M0,1050 Q540,980 1080,1050 L1080,1920 L0,1920 Z" fill="#070a18" />
      <g transform="translate(540 990)">
        <path d="M-120,0 V-190 a120,120 0 0 1 240,0 V0 Z" fill="#20284a" stroke="#3a4670" strokeWidth={8} />
        <path d="M-60,-170 H60 M0,-230 V-110" stroke="#5a6aa0" strokeWidth={10} strokeLinecap="round" opacity={0.7} transform="translate(0 40)" />
      </g>
      <g opacity={t} transform={`translate(540 ${640 - t * 120})`}>
        <path d="M-90,-60 H90 V70 H-90 Z M0,-60 V70" fill="#fff6e0" stroke={ORO} strokeWidth={8} strokeLinejoin="round" />
        <text y={20} x={-45} textAnchor="middle" fontFamily={amiri} fontWeight={700} fontSize={50} fill="#14224a">
          عمل
        </text>
      </g>
      <Titulo ar="غير عملك" y={1100} o={ease(p(f, 24, 14))} />
    </Lienzo>
  );
};

const Cierre: React.FC<EscenaProps> = ({f}) => {
  const e = ease(p(f, 0, 14));
  const a = ease(p(f, 14, 16));
  return (
    <Lienzo>
      <Sky id="vr-s6" c={['#14224a', '#8a3f4f', '#f6c06b']} />
      <Halo x={540} y={620} r={520} color={ORO} o={0.2 + 0.5 * a} />
      <g opacity={e} transform={`translate(540 600) scale(${0.9 + 0.1 * e}) translate(-540 -600)`}>
        <Esfera x={540} y={600} r={300} f={f} vel={2} />
      </g>
      <g opacity={a} transform={`translate(0 ${(1 - a) * 40})`}>
        <Silueta x={540} y={1010} s={1.2} tipo="hombre" color={SIL} />
      </g>
      <Titulo ar="فاجعلها طاعة" y={1150} o={a} />
      <Polvo f={f} n={24} />
    </Lienzo>
  );
};

const Enviar: React.FC<EscenaProps> = ({f}) => {
  const e = ease(p(f, 0, 12));
  const v = p(f, 12, 40);
  return (
    <Lienzo>
      <Sky id="vr-s7" c={NOCHE} />
      <Estrellas f={f} n={80} hasta={900} />
      <Silueta x={230} y={1010} s={1.1} tipo="mujer" color={SIL} borde="#5a6aa0" />
      <Silueta x={850} y={1010} s={1.1} tipo="hombre" color={SIL} borde="#5a6aa0" />
      <g transform={`translate(${230 + 620 * ease(v)} ${620 - 150 * Math.sin(Math.PI * v)}) scale(${0.7 + 0.5 * e})`} opacity={e}>
        <path d="M0,40 C-120,-40 -70,-130 0,-70 C70,-130 120,-40 0,40 Z" fill="#ff5a6a" stroke={CREMA} strokeWidth={8} />
      </g>
      <text x={540} y={1090} textAnchor="middle" fontFamily={amiri} fontWeight={700} fontSize={90} fill={ORO} stroke="#00000066" strokeWidth={2} opacity={ease(p(f, 20, 14))}>
        صيفطها لواحد
      </text>
    </Lienzo>
  );
};

export const VIDA_RELOJ: Record<string, React.FC<EscenaProps>> = {
  horavida: HoraVida,
  etapas: Etapas,
  arena: Arena,
  poder: Poder,
  tumba: Tumba,
  cierre: Cierre,
  enviar: Enviar,
};

export const FOCOS_VIDA_RELOJ: Record<string, FocoEscena> = {
  horavida: {x: 540, y: 700},
  etapas: {x: 540, y: 900},
  arena: {x: 540, y: 700},
  poder: {x: 540, y: 700},
  tumba: {x: 540, y: 900},
  cierre: {x: 540, y: 800},
  enviar: {x: 540, y: 800},
};
