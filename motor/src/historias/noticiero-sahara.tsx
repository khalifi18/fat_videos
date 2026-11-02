// Escenas a medida: «MINURSO, 30 de octubre de 2026» — estilo noticiero (sin personas ni imágenes falsas)
import React from 'react';
import {sans, serif} from '../tema';
import {EscenaProps, Lienzo, ease, easeIO, mix, p} from '../dibujos/base';
import type {FocoEscena} from '../dibujos/camara2d';

const AZUL = ['#0a1930', '#143055'];
const ROJO = '#e2392b';
const VERDE = '#1f8a56';
const ORO = '#f2c165';
const CREMA = '#fbf3e6';

const Fondo: React.FC<{f: number}> = ({f}) => (
  <g>
    <defs>
      <linearGradient id="ns-fondo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={AZUL[0]} />
        <stop offset="1" stopColor={AZUL[1]} />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#ns-fondo)" />
    {Array.from({length: 20}).map((_, i) => (
      <line key={`h${i}`} x1={0} x2={1080} y1={i * 100} y2={i * 100} stroke="#8fb4e8" strokeWidth={1.5} opacity={0.08} />
    ))}
    {Array.from({length: 12}).map((_, i) => (
      <line key={`v${i}`} y1={0} y2={1920} x1={i * 100} x2={i * 100} stroke="#8fb4e8" strokeWidth={1.5} opacity={0.08} />
    ))}
    {/* barras de noticiero */}
    <rect x={0} y={1640} width={1080} height={8} fill={ROJO} />
    <rect x={0} y={1648} width={1080} height={70} fill="#06101f" />
    <text x={(1080 - ((f * 3) % 2200)) + 1080} y={1698} fontFamily={sans} fontWeight={800} fontSize={34} fill={CREMA} opacity={0.85}>
      MINURSO · CONSEJO DE SEGURIDAD · 30 OCTUBRE 2026 · MINURSO · CONSEJO DE SEGURIDAD · 30 OCTUBRE 2026 ·
    </text>
  </g>
);

const UltimaHora: React.FC<{f: number}> = ({f}) => (
  <g transform="translate(130 290)">
    <rect width={330} height={64} rx={6} fill={ROJO} />
    <circle cx={34} cy={32} r={11} fill="#fff" opacity={Math.floor(f / 15) % 2 ? 1 : 0.35} />
    <text x={58} y={44} fontFamily={sans} fontWeight={800} fontSize={34} fill="#fff">
      ÚLTIMA HORA
    </text>
  </g>
);

const Texto: React.FC<{x: number; y: number; t: string; s?: number; c?: string; w?: number; a?: 'start' | 'middle'}> = ({x, y, t, s = 44, c = CREMA, w = 800, a = 'middle'}) => (
  <text x={x} y={y} textAnchor={a} fontFamily={sans} fontWeight={800} fontSize={s} fill={c} style={{maxWidth: w}}>
    {t}
  </text>
);

/** Sello de goma */
const Sello: React.FC<{x: number; y: number; t: string; rot?: number; e: number; c?: string; s?: number}> = ({x, y, t, rot = -8, e, c = ROJO, s = 1}) => {
  if (e <= 0) return null;
  const w = t.length * 38 + 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (1.8 - 0.8 * e)})`} opacity={Math.min(1, e * 1.6)}>
      <rect x={-w / 2} y={-52} width={w} height={104} rx={12} fill="none" stroke={c} strokeWidth={9} />
      <rect x={-w / 2 + 10} y={-42} width={w - 20} height={84} rx={8} fill="none" stroke={c} strokeWidth={3} />
      <text y={20} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={58} fill={c}>
        {t}
      </text>
    </g>
  );
};

const Doc: React.FC<{x: number; y: number; w?: number; h?: number; titulo: string; sub?: string; rot?: number; lineas?: number}> = ({x, y, w = 400, h = 540, titulo, sub, rot = 0, lineas = 7}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={10} fill="#000" opacity={0.3} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#f7f3ea" />
    <rect x={-w / 2} y={-h / 2} width={w} height={86} rx={10} fill="#1c3b6b" />
    <text y={-h / 2 + 56} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={36} fill="#fff">
      {titulo}
    </text>
    {sub && (
      <text y={-h / 2 + 140} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={30} fill="#1c3b6b">
        {sub}
      </text>
    )}
    {Array.from({length: lineas}).map((_, i) => (
      <rect key={i} x={-w / 2 + 40} y={-h / 2 + 180 + i * 42} width={w - 80 - (i % 3) * 50} height={14} rx={7} fill="#c9c2b2" />
    ))}
  </g>
);

// ───────────────────────── escenas ─────────────────────────

const Fecha: React.FC<EscenaProps> = ({f, k}) => {
  const e = ease(p(f, 0, 14));
  const flip = ease(p(f, 6, 14));
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <g transform={`translate(540 ${690 + (1 - e) * -500}) rotate(${(1 - e) * -8})`}>
        <rect x={-330 + 10} y={-330 + 16} width={660} height={700} rx={26} fill="#000" opacity={0.35} />
        <rect x={-330} y={-330} width={660} height={700} rx={26} fill="#fbf7ee" />
        <path d="M-330,-304 a26,26 0 0 1 26,-26 h608 a26,26 0 0 1 26,26 v140 h-660 z" fill={ROJO} />
        <text y={-210} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={64} fill="#fff" letterSpacing={6}>
          OCTUBRE 2026
        </text>
        {[-230, 230].map((x) => (
          <circle key={x} cx={x} cy={-330} r={16} fill="#2a2a2a" />
        ))}
        <text y={110} textAnchor="middle" fontFamily={serif} fontWeight={700} fontSize={320} fill={AZUL[0]} transform={`scale(1 ${mix(0.05, 1, flip)})`}>
          30
        </text>
        <text y={250} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={72} fill={AZUL[1]}>
          VIERNES
        </text>
      </g>
      <Sello x={690} y={1080} t="DÍA HISTÓRICO" e={ease(p(f, k, 8))} s={0.9} />
    </Lienzo>
  );
};

const Consejo: React.FC<EscenaProps> = ({f, k}) => {
  const seats = Array.from({length: 15}).map((_, i) => {
    const a = Math.PI * (0.08 + (0.84 * i) / 14);
    return {x: 540 - Math.cos(a) * 380, y: 800 - Math.sin(a) * 300};
  });
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <Texto x={540} y={420} t="CONSEJO DE SEGURIDAD" s={58} c={ORO} />
      <Texto x={540} y={480} t="15 miembros · votación del 30 de octubre" s={34} c="#bcd0ee" />
      {seats.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`} opacity={ease(p(f, i * 1.2, 8))}>
          <circle r={40} fill="#1c3b6b" stroke="#8fb4e8" strokeWidth={5} />
          <circle r={14} fill="#8fb4e8" />
        </g>
      ))}
      <Doc x={540} y={900} w={440} h={400} titulo="MINURSO" sub="Prórroga del mandato" rot={-2} lineas={4} />
      <Sello x={540} y={940} t="NO PRORROGADA" e={ease(p(f, k, 8))} rot={-10} s={0.95} />
    </Lienzo>
  );
};

const Proyectos: React.FC<EscenaProps> = ({f, k}) => (
  <Lienzo>
    <Fondo f={f} />
    <UltimaHora f={f} />
    <Texto x={540} y={430} t="DOS PROYECTOS" s={58} c={ORO} />
    <Doc x={300} y={760} w={400} h={500} titulo="Proyecto" sub="Estados Unidos" rot={-3} />
    <Doc x={780} y={760} w={400} h={500} titulo="Proyecto" sub="Rusia" rot={3} />
    {[300, 780].map((x, i) => {
      const e = ease(p(f, k + i * 14, 8));
      return (
        <g key={x} opacity={e} transform={`translate(${x} 780) scale(${1.5 - 0.5 * e})`}>
          <path d="M-120,-120 L120,120 M120,-120 L-120,120" stroke={ROJO} strokeWidth={34} strokeLinecap="round" />
        </g>
      );
    })}
    <Sello x={540} y={1100} t="NINGUNO ADOPTADO" e={ease(p(f, k + 30, 8))} rot={-4} s={0.82} />
  </Lienzo>
);

const Anos: React.FC<EscenaProps> = ({f, d}) => {
  const t = easeIO(p(f, 4, d * 0.6));
  const n = Math.round(35 * t);
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <text x={540} y={760} textAnchor="middle" fontFamily={serif} fontWeight={700} fontSize={400} fill={CREMA}>
        {n}
      </text>
      <Texto x={540} y={860} t="AÑOS DE MISIÓN" s={64} c={ORO} />
      {/* línea de tiempo 1991 → 2026 */}
      <line x1={140} x2={940} y1={990} y2={990} stroke="#3e5f93" strokeWidth={14} strokeLinecap="round" />
      <line x1={140} x2={140 + 800 * t} y1={990} y2={990} stroke={ORO} strokeWidth={14} strokeLinecap="round" />
      <circle cx={140} cy={990} r={22} fill={ORO} />
      <circle cx={140 + 800 * t} cy={990} r={26} fill={CREMA} stroke={ORO} strokeWidth={8} />
      <Texto x={140} y={1080} t="1991" s={46} a="middle" />
      <Texto x={940} y={1080} t="2026" s={46} a="middle" />
    </Lienzo>
  );
};

const Comunicado: React.FC<EscenaProps> = ({f}) => {
  const e = ease(p(f, 0, 14));
  const lineas = ['«…un paso de gran significado', 'hacia el cierre definitivo', 'del expediente del Sáhara', 'marroquí en la ONU.»'];
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <g transform={`translate(540 ${700 + (1 - e) * 400})`} opacity={e}>
        <rect x={-440 + 10} y={-400 + 16} width={880} height={800} rx={14} fill="#000" opacity={0.3} />
        <rect x={-440} y={-400} width={880} height={800} rx={14} fill="#f7f3ea" />
        <rect x={-440} y={-400} width={880} height={150} rx={14} fill={ROJO} />
        <text y={-340} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={32} fill="#fff" opacity={0.9}>
          COMUNICADO
        </text>
        <text y={-282} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={48} fill="#fff">
          GABINETE REAL · 30 OCT
        </text>
        {lineas.map((l, i) => (
          <text key={i} x={0} y={-120 + i * 84} textAnchor="middle" fontFamily={serif} fontWeight={700} fontSize={52} fill={AZUL[0]} opacity={ease(p(f, 10 + i * 8, 10))}>
            {l}
          </text>
        ))}
        <line x1={-340} x2={340} y1={290} y2={290} stroke="#c9c2b2" strokeWidth={3} />
        <text y={348} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={30} fill="#6a6a6a">
          Fuente: prensa marroquí (Akhbarona)
        </text>
      </g>
    </Lienzo>
  );
};

const Autonomia: React.FC<EscenaProps> = ({f}) => {
  const ondea = (x: number) => Math.sin(f * 0.18 + x * 0.012) * 14;
  const xs = Array.from({length: 21}).map((_, i) => i * 28);
  const b = (dy: number) => xs.map((x, i) => `${i ? 'L' : 'M'}${x},${ondea(x) + dy}`).join(' ');
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <g transform="translate(240 470)">
        <path d={`${b(0)} L560,${ondea(560) + 380} ${xs.map((x) => x).reverse().map((x) => `L${x},${ondea(x) + 380}`).join(' ')} Z`} fill="#c1272d" />
        <g transform={`translate(280 ${190 + ondea(280)})`}>
          <path d="M0,-90 L26,-28 L90,-24 L40,16 L56,80 L0,44 L-56,80 L-40,16 L-90,-24 L-26,-28 Z" fill="none" stroke={VERDE} strokeWidth={12} strokeLinejoin="round" />
        </g>
        <rect x={-14} y={-20} width={16} height={520} fill="#cfd6dc" />
      </g>
      <Texto x={540} y={990} t="INICIATIVA DE AUTONOMÍA" s={48} c={ORO} />
      <Texto x={540} y={1060} t="bajo soberanía marroquí" s={42} />
    </Lienzo>
  );
};

const Matiz: React.FC<EscenaProps> = ({f, k}) => {
  const a = ease(p(f, 0, 12));
  const b = ease(p(f, k, 12));
  return (
    <Lienzo>
      <Fondo f={f} />
      <UltimaHora f={f} />
      <g opacity={a} transform={`translate(0 ${(1 - a) * 80 - 80})`}>
        <rect x={110} y={420} width={860} height={330} rx={22} fill="#3a1218" stroke={ROJO} strokeWidth={6} />
        <circle cx={220} cy={585} r={62} fill={ROJO} />
        <path d="M195,560 L245,610 M245,560 L195,610" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
        <Texto x={310} y={560} t="NO es un fallo" s={52} a="start" />
        <Texto x={310} y={625} t="definitivo de la ONU" s={52} a="start" />
        <Texto x={310} y={690} t="sobre la soberanía" s={44} a="start" c="#f0b8b0" />
      </g>
      <g opacity={b} transform={`translate(0 ${(1 - b) * 80 - 80})`}>
        <rect x={110} y={830} width={860} height={330} rx={22} fill="#0d2e22" stroke={VERDE} strokeWidth={6} />
        <circle cx={220} cy={995} r={62} fill={VERDE} />
        <path d="M190,995 L212,1020 L252,968" stroke="#fff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Texto x={310} y={970} t="SÍ es una" s={52} a="start" />
        <Texto x={310} y={1035} t="nueva etapa" s={52} a="start" />
        <Texto x={310} y={1100} t="política y diplomática" s={44} a="start" c="#b8e8cc" />
      </g>
    </Lienzo>
  );
};

const Pregunta: React.FC<EscenaProps> = ({f}) => {
  const e = ease(p(f, 0, 12));
  return (
    <Lienzo>
      <Fondo f={f} />
      <g transform={`translate(540 ${620 + Math.sin(f * 0.1) * 8}) scale(${0.6 + 0.4 * e})`} opacity={e}>
        <path d="M-380,-190 h760 q40,0 40,40 v280 q0,40 -40,40 h-300 l-90,110 l-20,-110 h-350 q-40,0 -40,-40 v-280 q0,-40 40,-40 z" fill="#fff6dc" stroke={ORO} strokeWidth={8} />
        <text y={30} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={96} fill={AZUL[0]}>
          ¿Y tú, qué
        </text>
        <text y={140} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={96} fill={ROJO}>
          piensas?
        </text>
      </g>
      <g opacity={ease(p(f, 20, 12))}>
        <Texto x={540} y={1040} t="Fuentes" s={36} c={ORO} />
        <Texto x={540} y={1090} t="The Arab Weekly · Yabiladi · Akhbarona" s={32} c="#bcd0ee" />
        <Texto x={540} y={1136} t="WSRW · Atalayar" s={32} c="#bcd0ee" />
      </g>
    </Lienzo>
  );
};

export const NOTICIERO_SAHARA: Record<string, React.FC<EscenaProps>> = {
  fecha: Fecha,
  consejo: Consejo,
  proyectos: Proyectos,
  anos: Anos,
  comunicado: Comunicado,
  autonomia: Autonomia,
  matiz: Matiz,
  pregunta: Pregunta,
};

export const FOCOS_NOTICIERO_SAHARA: Record<string, FocoEscena> = {
  fecha: {x: 540, y: 760},
  consejo: {x: 540, y: 800},
  proyectos: {x: 540, y: 880},
  anos: {x: 540, y: 880},
  comunicado: {x: 540, y: 820},
  autonomia: {x: 540, y: 780},
  matiz: {x: 540, y: 800},
  pregunta: {x: 540, y: 760},
};
