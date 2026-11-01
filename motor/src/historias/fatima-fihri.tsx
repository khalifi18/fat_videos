// Escenas a medida: «Fatima al-Fihri y la Qarawiyyin»
import React from 'react';
import {P, W, sans} from '../tema';
import {Cielo, Colinas, EscenaProps, Estrellas, Halo, Lienzo, Polvo, Silueta, Zellige, ease, easeIO, mix, p, rnd} from '../dibujos/base';
import {Luna} from '../dibujos/escenas1';

/** Camello en silueta (mirando a la derecha) */
const Camello: React.FC<{x: number; y: number; s: number; f: number}> = ({x, y, s, f}) => {
  const pata = Math.sin(f * 0.25) * 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={P.silueta}>
      <path d="M-90,-120 C-80,-190 -30,-200 -10,-160 C10,-200 50,-190 60,-140 L90,-160 C110,-200 130,-230 150,-230 C170,-230 175,-210 160,-200 C140,-185 120,-150 110,-110 C100,-90 70,-80 40,-80 L-70,-80 C-90,-85 -95,-100 -90,-120 Z" />
      <rect x={-70} y={-85} width={14} height={85} transform={`rotate(${pata} -63 -85)`} />
      <rect x={-40} y={-85} width={14} height={85} transform={`rotate(${-pata} -33 -85)`} />
      <rect x={30} y={-85} width={14} height={85} transform={`rotate(${-pata} 37 -85)`} />
      <rect x={60} y={-85} width={14} height={85} transform={`rotate(${pata} 67 -85)`} />
      <rect x={-50} y={-215} width={70} height={40} rx={10} fill={P.terracota} />
    </g>
  );
};

const Caravana: React.FC<EscenaProps> = ({f, d}) => {
  const t = f / Math.max(1, d);
  const x = mix(-150, 760, t);
  return (
    <Lienzo>
      <Cielo id="cv-c" colores={P.cieloAtardecer} />
      <Halo x={780} y={880} r={300} color={P.oroClaro} />
      <circle cx={780} cy={900} r={120} fill="#ffe2a8" />
      <Colinas y={960} colores={['#c98a5a', '#a86a44']} f={f} />
      <path d={`M0,1120 C300,1060 700,1180 1080,1100 L1080,1920 L0,1920 Z`} fill="#8a4e30" />
      <path d="M100,1000 C300,980 500,1010 700,990" stroke={P.oroClaro} strokeWidth={4} strokeDasharray="6 14" fill="none" opacity={0.7} />
      <text x={170} y={970} fill={P.crema} fontFamily={sans} fontWeight={700} fontSize={38} opacity={0.85}>Kairouan</text>
      <text x={910} y={970} fill={P.crema} fontFamily={sans} fontWeight={700} fontSize={38} textAnchor="end" opacity={0.85}>Fez</text>
      <Camello x={x} y={1150} s={0.9} f={f} />
      <Camello x={x - 260} y={1160} s={0.8} f={f + 7} />
      <Silueta x={x + 200} y={1150} s={0.75} tipo="mujer" />
      <Polvo f={f} color={P.arena} />
    </Lienzo>
  );
};

const Herencia: React.FC<EscenaProps> = ({f, k}) => {
  const apaga = ease(p(f, 4, 24));
  const abre = easeIO(p(f, k, 22));
  return (
    <Lienzo>
      <Cielo id="he-c" colores={P.interior} />
      {/* ventana con lámpara que se apaga */}
      <path d="M360,760 L360,420 A180,180 0 0 1 720,420 L720,760 Z" fill="#1a1530" />
      <Estrellas f={f} n={14} hasta={300} o={0.6} />
      <path d="M360,760 L360,420 A180,180 0 0 1 720,420 L720,760" fill="none" stroke="#2a1a20" strokeWidth={26} />
      <Halo x={250} y={600} r={200} o={1 - apaga * 0.85} />
      <path d="M220,560 L280,560 L295,600 L270,650 L230,650 L205,600 Z" fill={P.oro} opacity={1 - apaga * 0.7} />
      {/* cofre */}
      <rect x={0} y={1180} width={W} height={740} fill="#24161a" />
      <Halo x={540} y={1060} r={mix(80, 420, abre)} o={abre} />
      <rect x={340} y={1000} width={400} height={200} rx={16} fill={P.madera} />
      <rect x={340} y={1000} width={400} height={30} fill={P.oro} opacity={0.8} />
      <g transform={`rotate(${-70 * abre} 340 1000)`}>
        <path d="M340,1000 C340,920 740,920 740,1000 Z" fill={P.maderaOsc} />
        <path d="M340,1000 C340,940 740,940 740,1000" fill="none" stroke={P.oro} strokeWidth={8} />
      </g>
      {Array.from({length: 14}).map((_, i) => (
        <ellipse key={i} cx={380 + rnd(i) * 320} cy={1000 - 30 * abre - rnd(i + 3) * 40 * abre} rx={22} ry={10} fill={P.oroClaro} opacity={abre} />
      ))}
      <rect x={520} y={1080} width={40} height={50} rx={6} fill={P.oro} />
    </Lienzo>
  );
};

const Planos: React.FC<EscenaProps> = ({f, k}) => {
  const dibuja = ease(p(f, k - 10, 40));
  const monedas = 1 - ease(p(f, k - 10, 20));
  return (
    <Lienzo>
      <Cielo id="pl-c" colores={['#2a1c18', '#4a3020', '#2a1c18']} />
      <g transform="translate(540 760) scale(0.78) translate(-540 -880)">
      <rect x={120} y={500} width={840} height={760} rx={14} fill="#e9d8b8" />
      <rect x={120} y={500} width={840} height={760} rx={14} fill="none" stroke="#b89a70" strokeWidth={6} />
      {/* plano de la mezquita: patio, sala de oración con arcos, alminar */}
      <g fill="none" stroke="#3a5a8a" strokeWidth={6} strokeDasharray={3000} strokeDashoffset={3000 * (1 - dibuja)}>
        <rect x={220} y={600} width={640} height={560} />
        <rect x={360} y={880} width={360} height={240} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${240 + i * 103},780 L${240 + i * 103},640 A51,51 0 0 1 ${342 + i * 103},640 L${342 + i * 103},780`} />
        ))}
        <rect x={760} y={960} width={80} height={80} />
        <circle cx={540} cy={1000} r={40} />
      </g>
      {Array.from({length: 18}).map((_, i) => (
        <ellipse key={i} cx={260 + rnd(i) * 560} cy={640 + rnd(i + 5) * 480} rx={26} ry={12} fill={P.oro} opacity={monedas} />
      ))}
      </g>
      <Polvo f={f} o={0.4} />
    </Lienzo>
  );
};

const Obra: React.FC<EscenaProps> = ({f, d, k}) => {
  const sube = ease(p(f, 0, d * 0.9));
  const luna = ease(p(f, k, 20));
  const muro = 1240 - 260 * sube;
  return (
    <Lienzo>
      <Cielo id="ob-c" colores={P.cieloNoche} />
      <Estrellas f={f} hasta={700} />
      <defs>
        <mask id="ob-m">
          <rect width={W} height={1920} fill="#fff" />
          <circle cx={830} cy={330} r={74} fill="#000" />
        </mask>
      </defs>
      <Halo x={790} y={360} r={200} color={P.oroClaro} o={luna} />
      <circle cx={790} cy={360} r={80} fill="#fff1c9" mask="url(#ob-m)" opacity={luna} />
      {/* muros y arcos que crecen */}
      <rect x={140} y={muro} width={800} height={1240 - muro} fill="#d9c4a6" />
      <clipPath id="ob-clip">
        <rect x={140} y={muro} width={800} height={1240 - muro} />
      </clipPath>
      <g clipPath="url(#ob-clip)">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${190 + i * 150},1240 L${190 + i * 150},1080 A60,60 0 1 1 ${290 + i * 150},1080 L${290 + i * 150},1240 Z`} fill="#3a2a30" />
        ))}
        <Zellige x={140} y={muro} w={800} h={30} id="ob-z" />
      </g>
      {/* alminar */}
      <rect x={780} y={1240 - 520 * sube} width={120} height={520 * sube} fill="#e6d5bb" />
      <rect x={810} y={1240 - 520 * sube - 60 * sube} width={60} height={60 * sube} fill="#e6d5bb" />
      {/* andamio */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={130 + i * 410} y1={1240} x2={130 + i * 410} y2={900} stroke={P.madera} strokeWidth={10} opacity={1 - sube * 0.6} />
      ))}
      <rect x={0} y={1240} width={W} height={700} fill="#1a1322" />
      <Polvo f={f} color={P.arena} o={0.6} />
    </Lienzo>
  );
};

const Sabios: React.FC<EscenaProps> = ({f}) => (
  <Lienzo>
    <Cielo id="sa-c" colores={['#2a1a22', '#5a3a2e', '#2a1a22']} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${60 + i * 250},1000 L${60 + i * 250},620 A110,110 0 1 1 ${280 + i * 250},620 L${280 + i * 250},1000`} fill="none" stroke="#c9a07a" strokeWidth={26} />
    ))}
    <Zellige x={0} y={1000} w={W} h={50} id="sa-z" />
    <rect x={0} y={1050} width={W} height={900} fill="#2a1a18" />
    <Halo x={540} y={1150} r={360} o={0.9} />
    {[[260, 1250, 'hombre'], [430, 1210, 'mujer'], [650, 1210, 'hombre'], [820, 1250, 'mujer']].map(([x, y, t], i) => (
      <Silueta key={i} x={x as number} y={y as number} s={0.62} tipo={t as 'mujer' | 'hombre'} />
    ))}
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${430 + i * 110} ${1160 + Math.sin(f * 0.05 + i) * 4})`}>
        <rect x={-46} y={-30} width={92} height={60} rx={4} fill="#f6e8d2" />
        <line x1={0} y1={-30} x2={0} y2={30} stroke="#b89a70" strokeWidth={4} />
      </g>
    ))}
    <Polvo f={f} />
  </Lienzo>
);

const Texto1956: React.FC<EscenaProps> = ({f, k}) => {
  const ent = ease(p(f, 0, 14));
  const tacha = ease(p(f, k, 14));
  return (
    <Lienzo>
      <Cielo id="an-c" colores={['#14223f', '#2a3a6a', '#14223f']} />
      <text x={540} y={1000} fill={P.crema} fontFamily={sans} fontWeight={800} fontSize={300} textAnchor="middle" opacity={ent}>
        1956
      </text>
      <line x1={180} y1={920} x2={180 + 720 * tacha} y2={900} stroke="#e85c4a" strokeWidth={26} strokeLinecap="round" />
      <text x={540} y={760} fill={P.crema} fontFamily={sans} fontWeight={700} fontSize={56} textAnchor="middle" opacity={0.7 * ent}>
        ¿Marruecos nació en…?
      </text>
    </Lienzo>
  );
};

const MilAnos: React.FC<EscenaProps> = ({f, k}) => {
  const n = Math.round(1160 * ease(p(f, 2, Math.max(20, k))));
  return (
    <Lienzo>
      <Cielo id="mi-c" colores={P.cieloAmanecer} />
      <Halo x={540} y={800} r={460} color={P.oroClaro} />
      {/* puerta de la Qarawiyyin con tejas verdes */}
      <rect x={240} y={760} width={600} height={500} fill="#e6d5bb" />
      <path d="M220,770 L540,640 L860,770 Z" fill="#2f7a5a" />
      {Array.from({length: 10}).map((_, i) => (
        <line key={i} x1={250 + i * 64} y1={765} x2={250 + i * 64} y2={700 + Math.abs(i - 4.5) * 12} stroke="#1d5e44" strokeWidth={6} />
      ))}
      <path d="M430,1260 L430,1050 A110,110 0 1 1 650,1050 L650,1260 Z" fill="#5a2e1e" />
      <path d="M430,1260 L430,1050 A110,110 0 1 1 650,1050 L650,1260" fill="none" stroke={P.turquesa} strokeWidth={14} />
      <rect x={0} y={1260} width={W} height={700} fill="#2a1c22" />
      <text x={540} y={520} fill={P.oro} fontFamily={sans} fontWeight={800} fontSize={150} textAnchor="middle" filter="url(#brillo)">
        +{n.toLocaleString('es-ES')}
      </text>
      <text x={540} y={600} fill={P.crema} fontFamily={sans} fontWeight={700} fontSize={56} textAnchor="middle">
        años
      </text>
    </Lienzo>
  );
};

const Cta: React.FC<EscenaProps> = ({f}) => {
  const lineas = [0, 1, 2].map((i) => ease(p(f, 10 + i * 14, 18)));
  return (
    <Lienzo>
      <Cielo id="ct-c" colores={['#2a1630', '#5a2e5a', '#2a1630']} />
      <Halo x={540} y={820} r={420} color={P.rosa} />
      <g transform={`translate(540 820) scale(${ease(p(f, 0, 14))})`} filter="url(#sombra)">
        <rect x={-340} y={-200} width={680} height={380} rx={60} fill="#fbf3e6" />
        <path d="M-120,176 L-180,280 L-40,176 Z" fill="#fbf3e6" />
        {lineas.map((l, i) => (
          <rect key={i} x={-260} y={-110 + i * 90} width={(i === 2 ? 300 : 520) * l} height={30} rx={15} fill="#c9b49a" />
        ))}
      </g>
      <g transform={`translate(${300 + 420 * lineas[2]} ${740 + Math.sin(f * 0.6) * 6}) rotate(-35)`}>
        <rect x={-12} y={-120} width={24} height={150} rx={6} fill={P.oro} />
        <path d="M-12,30 L12,30 L0,60 Z" fill="#3a2a30" />
      </g>
      <Polvo f={f} color={P.oroClaro} />
    </Lienzo>
  );
};

export const FATIMA_FIHRI: Record<string, React.FC<EscenaProps>> = {
  fes: Luna,
  caravana: Caravana,
  herencia: Herencia,
  planos: Planos,
  obra: Obra,
  sabios: Sabios,
  ano1956: Texto1956,
  milanos: MilAnos,
  cta: Cta,
};
