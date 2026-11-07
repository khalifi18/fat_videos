// Escenas a medida: «La historia del profeta Yusuf» — siluetas sin cara (los profetas no se representan), objetos y paisaje
import React from 'react';
import {amiri, sans, serif} from '../tema';
import {Cielo, EscenaProps, Estrellas, FondoVideoCtx, Halo, Lienzo, Polvo, Silueta, ease, easeIO, mix, p, rnd} from '../dibujos/base';
import type {FocoEscena} from '../dibujos/camara2d';

const ORO = '#f2c165';
const ORO2 = '#ffe3a0';
const CREMA = '#fbf3e6';
const ROJO = '#c8382c';
const NOCHE = ['#070b1f', '#14224a', '#2a3a6b'];
const ATARDECER = ['#2b1a3d', '#8a3f4f', '#e08a4a', '#f6c06b'];
const ARENA = ['#d9a85f', '#b8843f', '#8c5f2b'];
const SIL = '#120d1c';

/** Cielo del cuento; con vídeo de fondo se vuelve semitransparente */
const Sky: React.FC<{id: string; c: string[]}> = ({id, c}) => {
  const v = React.useContext(FondoVideoCtx);
  return <Cielo id={id} colores={c} o={v ? 0.62 : 1} />;
};

const Dunas: React.FC<{y: number; f?: number; col?: string[]}> = ({y, f = 0, col = ARENA}) => (
  <g>
    {col.map((c, i) => {
      const yy = y + i * 90;
      let d = `M0,${yy}`;
      for (let x = 0; x <= 1080; x += 40) d += ` L${x},${yy - 55 * Math.sin(x / (230 + i * 70) + i * 1.7) - 18 * Math.sin(x / 90 + i)}`;
      d += ' L1080,1920 L0,1920 Z';
      return <path key={i} d={d} fill={c} transform={`translate(${Math.sin(f * 0.01 + i) * 6} 0)`} />;
    })}
  </g>
);

const Estrella: React.FC<{x: number; y: number; r: number; rot?: number; c?: string; o?: number}> = ({x, y, r, rot = 0, c = ORO2, o = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
    <polygon
      points={Array.from({length: 10}).map((_, i) => `${Math.cos((i / 10) * 6.2832 - 1.5708) * (i % 2 ? r * 0.45 : r)},${Math.sin((i / 10) * 6.2832 - 1.5708) * (i % 2 ? r * 0.45 : r)}`).join(' ')}
      fill={c}
    />
  </g>
);

const Luna: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <g transform={`translate(${x} ${y})`}>
    <Halo x={0} y={0} r={r * 1.6} color="#cfe0ff" o={0.8} />
    <circle r={r} fill="#eef3ff" />
    <circle r={r} cx={r * 0.38} cy={-r * 0.12} fill="#14224a" opacity={0.85} />
  </g>
);

const Sol: React.FC<{x: number; y: number; r: number; f: number}> = ({x, y, r, f}) => (
  <g transform={`translate(${x} ${y})`}>
    <Halo x={0} y={0} r={r * 2} color={ORO} />
    {Array.from({length: 12}).map((_, i) => (
      <polygon key={i} points={`0,${-r * 1.15} ${r * 0.14},${-r * 1.55} ${-r * 0.14},${-r * 1.55}`} fill={ORO} transform={`rotate(${i * 30 + f * 0.4})`} />
    ))}
    <circle r={r} fill={ORO2} stroke={ORO} strokeWidth={6} />
  </g>
);

const Camello: React.FC<{x: number; y: number; s?: number; f?: number}> = ({x, y, s = 1, f = 0}) => {
  const paso = Math.sin(f * 0.25) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={SIL}>
      <path d="M-90,-70 q-10,-60 40,-60 q20,-40 50,-10 q40,-10 60,20 q40,-10 50,30 l-10,40 h-190 z" />
      <path d="M90,-90 q30,-40 56,-100 q14,-12 28,0 l14,12 q10,14 -4,22 l-30,14 q-22,46 -40,78 z" />
      {[-70, -40, 40, 70].map((lx, i) => (
        <rect key={i} x={lx - 7} y={-30} width={14} height={90 + (i % 2 ? paso : -paso)} rx={6} />
      ))}
    </g>
  );
};

const Vaca: React.FC<{x: number; y: number; s?: number; gorda: boolean}> = ({x, y, s = 1, gorda}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={gorda ? 60 : 50} ry={gorda ? 38 : 20} fill={gorda ? '#6b3a22' : '#8a7f72'} />
    <circle cx={gorda ? 62 : 52} cy={-8} r={gorda ? 20 : 15} fill={gorda ? '#6b3a22' : '#8a7f72'} />
    {[-30, -10, 14, 34].map((lx, i) => (
      <rect key={i} x={lx - 4} y={gorda ? 24 : 12} width={8} height={26} fill={gorda ? '#4d2a18' : '#6a6055'} />
    ))}
    {!gorda && [-26, -14, 0, 12, 24].map((rx, i) => <path key={i} d={`M${rx},-14 q-3,12 0,26`} stroke="#4f463c" strokeWidth={3} fill="none" />)}
  </g>
);

const Pie: React.FC<{t: string; y?: number; c?: string; s?: number}> = ({t, y = 1000, c = CREMA, s = 54}) => (
  <text x={540} y={y} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={s} fill={c} stroke="#00000066" strokeWidth={2}>
    {t}
  </text>
);

const Tunica: React.FC<{x: number; y: number; s?: number; rot?: number; sangre?: boolean}> = ({x, y, s = 1, rot = 0, sangre = false}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-60,-120 L-140,-80 L-110,-20 L-70,-45 L-80,150 L80,150 L70,-45 L110,-20 L140,-80 L60,-120 Q0,-90 -60,-120 Z" fill="#f3ead8" stroke="#c9b98f" strokeWidth={5} />
    {sangre &&
      [[-30, -10, 22], [20, 30, 30], [-10, 70, 18], [40, -30, 14], [-45, 50, 12]].map(([sx, sy, r], i) => (
        <g key={i}>
          <circle cx={sx} cy={sy} r={r} fill={ROJO} opacity={0.9} />
          <path d={`M${sx},${sy} q4,${r + 14} 0,${r + 30}`} stroke={ROJO} strokeWidth={6} strokeLinecap="round" fill="none" />
        </g>
      ))}
  </g>
);

// ───────────────────────── escenas ─────────────────────────

const Suenyo: React.FC<EscenaProps> = ({f, k, d}) => {
  const baja = easeIO(p(f, k, 30));
  const girar = f * 0.012;
  return (
    <Lienzo>
      <Sky id="yu-s1" c={NOCHE} />
      <Estrellas f={f} n={60} hasta={700} o={0.7} />
      <Dunas y={1380} f={f} col={['#1b1830', '#120f24']} />
      {/* once estrellas, sol y luna alrededor del niño */}
      {Array.from({length: 11}).map((_, i) => {
        const a = (i / 11) * Math.PI * 2 + girar;
        const R = mix(360, 130, baja);
        return <Estrella key={i} x={540 + Math.cos(a) * R} y={mix(700, 1100, baja * 0.6) + Math.sin(a) * R * 0.55} r={mix(44, 28, baja)} rot={f * 2} />;
      })}
      <Sol x={mix(250, 400, baja)} y={mix(560, 940, baja)} r={mix(60, 40, baja)} f={f} />
      <Luna x={mix(830, 690, baja)} y={mix(560, 940, baja)} r={mix(60, 40, baja)} />
      <Silueta x={540} y={1300} s={0.95} tipo="nino" color={SIL} />
      <Halo x={540} y={1150} r={160} color={ORO} o={0.5 * baja} />
      <Polvo f={f} n={20} />
    </Lienzo>
  );
};

const Hermanos: React.FC<EscenaProps> = ({f}) => {
  const lat = Math.sin(f * 0.1) * 4;
  return (
    <Lienzo>
      <Sky id="yu-s2" c={['#1a1030', '#4a1a35', '#8a3a3a']} />
      <Dunas y={1250} f={f} col={['#3a2030', '#241224']} />
      {/* los hermanos, con aura roja */}
      <Halo x={300} y={1050} r={330} color="#c8382c" o={0.55 + 0.15 * Math.sin(f * 0.15)} />
      {Array.from({length: 5}).map((_, i) => (
        <Silueta key={i} x={110 + i * 105} y={1330 - (i % 2) * 30 + lat * (i % 2 ? 1 : -1)} s={0.55} tipo="hombre" color={SIL} />
      ))}
      {/* padre con halo dorado, y Yusuf */}
      <Halo x={800} y={1000} r={260} color={ORO} o={0.7} />
      <Silueta x={850} y={1330} s={0.95} tipo="hombre" color={SIL} />
      <Silueta x={700} y={1330} s={0.8} tipo="nino" color={SIL} />
      <g transform={`translate(770 ${760 + Math.sin(f * 0.1) * 8})`}>
        <path d="M0,40 C-60,-10 -50,-60 0,-30 C50,-60 60,-10 0,40 Z" fill="#f2c165" />
      </g>
    </Lienzo>
  );
};

const Pozo: React.FC<{f: number; k: number; d: number}> = ({f, k}) => {
  const cae = easeIO(p(f, k, 24));
  return (
    <Lienzo>
      <Sky id="yu-s3" c={ATARDECER} />
      <Sol x={800} y={600} r={70} f={f} />
      <Dunas y={1120} f={f} />
      {/* pozo de piedra */}
      <g transform="translate(540 1230)">
        <ellipse cx={0} cy={30} rx={250} ry={50} fill="#000" opacity={0.3} />
        <rect x={-210} y={-120} width={420} height={150} fill="#7a6a58" />
        {Array.from({length: 10}).map((_, i) => (
          <rect key={i} x={-210 + i * 42} y={-120 + (i % 2) * 50} width={40} height={50} fill={i % 2 ? '#8c7b67' : '#6d5e4c'} stroke="#3d3328" strokeWidth={3} />
        ))}
        <ellipse cx={0} cy={-120} rx={210} ry={50} fill="#1a1410" stroke="#8c7b67" strokeWidth={14} />
        <ellipse cx={0} cy={-114} rx={170} ry={34} fill="#05030a" />
      </g>
      {/* niño que cae al pozo */}
      <g opacity={1 - ease(p(f, k + 14, 12))}>
        <Silueta x={540} y={mix(900, 1190, cae)} s={mix(0.7, 0.35, cae)} tipo="nino" color={SIL} />
      </g>
      {/* hermanos mirando desde el borde */}
      {[170, 300, 780, 910].map((x, i) => (
        <Silueta key={x} x={x} y={1400 + (i % 2) * 20} s={0.6} tipo="hombre" color={SIL} />
      ))}
    </Lienzo>
  );
};

const TunicaEsc: React.FC<EscenaProps> = ({f, k}) => {
  const sangre = ease(p(f, k - 10, 14));
  return (
    <Lienzo>
      <Sky id="yu-s4" c={['#150c1e', '#3b1a2a', '#6b2a2a']} />
      <Halo x={540} y={760} r={380} color="#c8382c" o={0.35} />
      <g transform={`translate(0 ${Math.sin(f * 0.08) * 8})`}>
        <Tunica x={540} y={780} s={2.1} rot={Math.sin(f * 0.05) * 3} sangre={sangre > 0.4} />
      </g>
      <Silueta x={190} y={1430} s={0.75} tipo="hombre" color={SIL} />
      <Silueta x={890} y={1430} s={0.75} tipo="hombre" color={SIL} />
      {/* lobo lejano */}
      <g transform="translate(540 1350)" fill={SIL}>
        <path d="M-60,0 q10,-40 50,-40 q20,-24 44,-6 q30,0 40,20 l-6,26 h-130 z" />
        <path d="M60,-30 l30,-30 l6,26 z" />
      </g>
    </Lienzo>
  );
};

const Caravana: React.FC<EscenaProps> = ({f, d}) => {
  const t = (f / Math.max(1, d)) * 700;
  return (
    <Lienzo>
      <Sky id="yu-s5" c={ATARDECER} />
      <Sol x={820} y={640} r={80} f={f} />
      <Dunas y={1060} f={f} />
      {[0, 1, 2, 3].map((i) => (
        <Camello key={i} x={-300 + i * 330 + t} y={1230 + (i % 2) * 20} s={0.85} f={f + i * 7} />
      ))}
      <Polvo f={f} n={30} color="#f0c88a" />
    </Lienzo>
  );
};

const Casa: React.FC<EscenaProps> = ({f, k}) => {
  const e = ease(p(f, k - 20, 30));
  return (
    <Lienzo>
      <Sky id="yu-s6" c={['#1a1030', '#3a2260', '#7a4a6a']} />
      <Estrellas f={f} n={40} hasta={500} o={0.5} />
      {/* palacio: columnas y arco */}
      {[140, 340, 740, 940].map((x) => (
        <g key={x}>
          <rect x={x - 38} y={560} width={76} height={760} fill="#d8c7a1" />
          <rect x={x - 52} y={540} width={104} height={34} fill="#b79f73" />
          <rect x={x - 52} y={1300} width={104} height={34} fill="#b79f73" />
        </g>
      ))}
      <path d="M340,1320 V860 a200,200 0 0 1 400,0 V1320 Z" fill="#0d0814" />
      <Halo x={540} y={1000} r={300} color={ORO} o={0.8 * e} />
      <path d="M340,1320 V860 a200,200 0 0 1 400,0 V1320 Z" fill="none" stroke={ORO} strokeWidth={10} />
      <rect x={100} y={1334} width={880} height={40} fill="#b79f73" />
      {/* Yusuf corre hacia la puerta */}
      <Silueta x={mix(170, 520, e)} y={1330} s={0.95} tipo="hombre" color={SIL} />
      <Silueta x={900} y={1330} s={0.8} tipo="mujer" color={SIL} o={1 - e * 0.5} />
    </Lienzo>
  );
};

const Carcel: React.FC<EscenaProps> = ({f}) => {
  const marcas = Math.min(24, Math.floor(f / 4));
  return (
    <Lienzo>
      <Sky id="yu-s7" c={['#05070f', '#0e1530', '#1c2748']} />
      <Luna x={760} y={500} r={80} />
      <Estrellas f={f} n={50} hasta={600} o={0.6} />
      <rect x={0} y={900} width={1080} height={1020} fill="#0b0b14" />
      <Silueta x={380} y={1500} s={0.9} tipo="hombre" color="#1b1a2a" borde="#2a2a40" />
      {/* barrotes */}
      {Array.from({length: 7}).map((_, i) => (
        <rect key={i} x={110 + i * 140} y={300} width={22} height={1100} rx={10} fill="#3a3b4c" />
      ))}
      <rect x={90} y={300} width={900} height={36} rx={10} fill="#4a4b5e" />
      <rect x={90} y={1380} width={900} height={36} rx={10} fill="#4a4b5e" />
      {/* marcas de los años */}
      <g stroke={CREMA} strokeWidth={6} strokeLinecap="round" opacity={0.85}>
        {Array.from({length: marcas}).map((_, i) => {
          const g = Math.floor(i / 5), r = i % 5;
          const bx = 700 + (g % 3) * 90, by = 1180 + Math.floor(g / 3) * 70;
          return r < 4 ? <line key={i} x1={bx + r * 14} y1={by} x2={bx + r * 14} y2={by + 50} /> : <line key={i} x1={bx - 8} y1={by + 36} x2={bx + 52} y2={by + 10} />;
        })}
      </g>
    </Lienzo>
  );
};

const ReySueno: React.FC<EscenaProps> = ({f, k}) => {
  const come = ease(p(f, k, 20));
  return (
    <Lienzo>
      <Sky id="yu-s8" c={['#1b1740', '#3d3a78', '#8a7ab0']} />
      <Estrellas f={f} n={40} hasta={400} o={0.5} />
      <Pie t="SIETE y SIETE" y={430} c={ORO} s={64} />
      {Array.from({length: 7}).map((_, i) => (
        <Vaca key={`g${i}`} x={120 + (i % 4) * 230 + (i > 3 ? 110 : 0)} y={600 + Math.floor(i / 4) * 120} gorda s={1.15} />
      ))}
      {Array.from({length: 7}).map((_, i) => {
        const x = 110 + (i % 4) * 230 + (i > 3 ? 110 : 0);
        return <Vaca key={`f${i}`} x={mix(x + 400, x, ease(p(f, 4 + i * 3, 20)))} y={900 + Math.floor(i / 4) * 110} gorda={false} s={1.15} />;
      })}
      <g opacity={come}>
        <path d="M200,1150 H880" stroke={ROJO} strokeWidth={10} strokeLinecap="round" />
        <Pie t="7 años de abundancia · 7 de hambre" y={1130} s={38} c={CREMA} />
      </g>
    </Lienzo>
  );
};

const Espiga: React.FC<{x: number; y: number; s?: number; f?: number}> = ({x, y, s = 1, f = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(f * 0.05 + x) * 3})`}>
    <path d="M0,0 V-170" stroke="#b8923f" strokeWidth={6} />
    {Array.from({length: 7}).map((_, i) => (
      <g key={i}>
        <ellipse cx={-14} cy={-170 + i * 18} rx={9} ry={18} fill="#e6bf55" transform={`rotate(-30 -14 ${-170 + i * 18})`} />
        <ellipse cx={14} cy={-170 + i * 18} rx={9} ry={18} fill="#e6bf55" transform={`rotate(30 14 ${-170 + i * 18})`} />
      </g>
    ))}
  </g>
);

const Almacen: React.FC<EscenaProps> = ({f}) => (
  <Lienzo>
    <Sky id="yu-s9" c={['#3a2a1a', '#8a5a2a', '#d9a05a']} />
    <Halo x={540} y={800} r={380} color={ORO} o={0.5} />
    {/* pila de sacos */}
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const fila = i < 3 ? 0 : 1;
      const x = fila ? 330 + (i - 3) * 210 : 230 + (i % 3) * 310;
      const e = ease(p(f, i * 6, 14));
      return (
        <g key={i} transform={`translate(${x} ${(fila ? 1030 : 1250) + (1 - e) * -200})`} opacity={e}>
          <path d="M-100,0 Q-120,-130 -60,-190 H60 Q120,-130 100,0 Z" fill="#c9a36a" stroke="#8a6a35" strokeWidth={6} />
          <rect x={-70} y={-190} width={140} height={26} rx={10} fill="#8a6a35" />
        </g>
      );
    })}
    {[120, 270, 810, 960].map((x, i) => (
      <Espiga key={x} x={x} y={1330 + (i % 2) * 30} s={1.5} f={f} />
    ))}
    <Silueta x={540} y={800} s={0.7} tipo="hombre" color={SIL} />
  </Lienzo>
);

const Reencuentro: React.FC<EscenaProps> = ({f}) => {
  const llegan = ease(p(f, 0, 30));
  return (
    <Lienzo>
      <Sky id="yu-s10" c={ATARDECER} />
      <Dunas y={1180} f={f} />
      {/* Yusuf en lo alto, de pie */}
      <rect x={410} y={1060} width={260} height={30} fill="#6a4a2a" />
      <Halo x={540} y={780} r={260} color={ORO} o={0.7} />
      <Silueta x={540} y={1060} s={0.95} tipo="hombre" color={SIL} />
      {/* los hermanos llegan en fila */}
      {Array.from({length: 5}).map((_, i) => (
        <Silueta key={i} x={mix(-100, 120 + i * 190, llegan)} y={1400 + (i % 2) * 24} s={0.65} tipo="hombre" color={SIL} />
      ))}
      <text x={540} y={560} textAnchor="middle" fontFamily={serif} fontWeight={700} fontSize={200} fill={CREMA} opacity={0.0}>
        ?
      </text>
      {/* ? sobre los hermanos: no lo reconocen */}
      <text x={540} y={1180} textAnchor="middle" fontFamily={serif} fontWeight={700} fontSize={110} fill={CREMA} opacity={0.85 * ease(p(f, 40, 14))}>
        ? ? ?
      </text>
    </Lienzo>
  );
};

const Paloma: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => {
  const ala = Math.sin(f * 0.3) * 18;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-70,10 Q-30,-20 20,-10 Q60,-30 90,-60 Q80,-10 40,20 Q0,40 -70,10 Z" fill="#fbf3e6" />
      <path d={`M-10,-10 Q-30,${-80 - ala} 30,${-90 - ala} Q20,-40 20,-10 Z`} fill="#eae0cc" />
      <circle cx={80} cy={-48} r={4} fill="#120d1c" />
    </g>
  );
};

const Perdon: React.FC<EscenaProps> = ({f}) => (
  <Lienzo>
    <Sky id="yu-s11" c={['#2a1f4a', '#a8607a', '#f2b87a']} />
    <Halo x={540} y={760} r={420} color={ORO2} o={0.9} />
    <Silueta x={420} y={1380} s={1.05} tipo="hombre" color={SIL} />
    <Silueta x={700} y={1380} s={0.85} tipo="hombre" color={SIL} />
    <g transform={`translate(540 ${700 + Math.sin(f * 0.1) * 10})`}>
      <path d="M0,90 C-130,-10 -110,-120 0,-60 C110,-120 130,-10 0,90 Z" fill="#e2563f" stroke="#fff3e0" strokeWidth={8} />
    </g>
    <Paloma x={300} y={560 + Math.sin(f * 0.1) * 14} s={1.2} f={f} />
    <Paloma x={800} y={500 + Math.sin(f * 0.1 + 2) * 14} s={0.9} f={f + 5} />
  </Lienzo>
);

const Vista: React.FC<EscenaProps> = ({f, k}) => {
  const vuela = easeIO(p(f, 0, k + 10));
  const luz = ease(p(f, k + 6, 20));
  return (
    <Lienzo>
      <Sky id="yu-s12" c={['#1a1a3a', '#4a3a6a', '#d9a05a']} />
      {/* rayos de luz al recuperar la vista */}
      <g transform="translate(540 1000)" opacity={0.7 * luz}>
        {Array.from({length: 16}).map((_, i) => (
          <polygon key={i} points="0,0 -50,-760 50,-760" fill={ORO2} opacity={0.45} transform={`rotate(${i * 22.5 + f * 0.5})`} />
        ))}
      </g>
      <Halo x={540} y={1000} r={300} color={ORO2} o={luz} />
      <Silueta x={540} y={1400} s={1.05} tipo="hombre" color={SIL} />
      <Tunica x={mix(100, 540, vuela)} y={mix(500, 1010, vuela)} s={1.05} rot={mix(-25, 0, vuela)} />
      {Array.from({length: 9}).map((_, i) => (
        <Estrella key={i} x={140 + rnd(i) * 800} y={380 + rnd(i + 4) * 500} r={14 + rnd(i + 7) * 14} rot={f * 3} o={luz} />
      ))}
    </Lienzo>
  );
};

const Reloj: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => {
  const giro = (f * 2) % 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-70,-110 H70 L12,0 L70,110 H-70 L-12,0 Z" fill="none" stroke={ORO} strokeWidth={10} strokeLinejoin="round" />
      <path d="M-50,-100 H50 L8,-20 H-8 Z" fill={ORO2} opacity={0.4 + 0.6 * (1 - (f % 90) / 90)} />
      <path d="M-8,20 L8,20 L50,100 H-50 Z" fill={ORO2} opacity={0.4 + 0.6 * ((f % 90) / 90)} />
      <line x1={0} y1={-110} x2={0} y2={110} stroke={ORO2} strokeWidth={0} transform={`rotate(${giro})`} />
    </g>
  );
};

const Leccion: React.FC<EscenaProps> = ({f}) => {
  const a = ease(p(f, 0, 14));
  const b = ease(p(f, 14, 14));
  return (
    <Lienzo>
      <Sky id="yu-s13" c={['#14224a', '#4a3a6a', '#e0a060']} />
      <Estrellas f={f} n={40} hasta={500} o={0.5} />
      <g opacity={a} transform={`translate(0 ${(1 - a) * 80})`}>
        <Reloj x={300} y={640} f={f} />
        <text x={300} y={830} textAnchor="middle" fontFamily={amiri} fontWeight={700} fontSize={78} fill={ORO}>
          الصبر
        </text>
        <text x={300} y={890} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={40} fill={CREMA}>
          paciencia
        </text>
      </g>
      <g opacity={b} transform={`translate(0 ${(1 - b) * 80})`}>
        <Paloma x={780} y={660 + Math.sin(f * 0.1) * 10} s={1.5} f={f} />
        <text x={780} y={830} textAnchor="middle" fontFamily={amiri} fontWeight={700} fontSize={78} fill={ORO}>
          السماح
        </text>
        <text x={780} y={890} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={40} fill={CREMA}>
          perdón
        </text>
      </g>
      <Polvo f={f} n={22} />
    </Lienzo>
  );
};

const Pregunta: React.FC<EscenaProps> = ({f}) => {
  const e = ease(p(f, 0, 12));
  return (
    <Lienzo>
      <Sky id="yu-s14" c={NOCHE} />
      <Estrellas f={f} n={80} hasta={900} />
      <Luna x={850} y={420} r={70} />
      <g transform={`translate(540 ${760 + Math.sin(f * 0.1) * 8}) scale(${0.6 + 0.4 * e})`} opacity={e}>
        <path d="M-380,-190 h760 q40,0 40,40 v280 q0,40 -40,40 h-300 l-90,110 l-20,-110 h-350 q-40,0 -40,-40 v-280 q0,-40 40,-40 z" fill="#fff6dc" stroke={ORO} strokeWidth={8} />
        <text y={20} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={84} fill="#14224a">
          ¿Qué profeta
        </text>
        <text y={125} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={84} fill="#c8382c">
          quieres ahora?
        </text>
      </g>
    </Lienzo>
  );
};

const Padre: React.FC<EscenaProps> = ({f}) => {
  const llama = 1 + 0.06 * Math.sin(f * 0.35);
  return (
    <Lienzo>
      <Sky id="yu-s15" c={['#05070f', '#101a38', '#1f2b4f']} />
      <Estrellas f={f} n={60} hasta={700} o={0.6} />
      <Luna x={820} y={470} r={64} />
      <Dunas y={1300} f={f} col={['#1d1a33', '#13102a']} />
      {/* tienda */}
      <path d="M180,1380 L540,880 L900,1380 Z" fill="#2a2038" stroke="#4a3a5e" strokeWidth={6} />
      <path d="M440,1380 L540,1120 L640,1380 Z" fill="#0a0612" />
      {/* vela y halo cálido */}
      <Halo x={700} y={1280} r={260 * llama} color={ORO} o={0.8} />
      <rect x={690} y={1290} width={20} height={70} rx={4} fill="#f3ead8" />
      <ellipse cx={700} cy={1276} rx={9 * llama} ry={18 * llama} fill={ORO2} />
      {/* el padre, sentado, con la cabeza baja */}
      <Silueta x={470} y={1390} s={0.8} tipo="hombre" color={SIL} />
      <Polvo f={f} n={14} />
    </Lienzo>
  );
};

const Hambre: React.FC<EscenaProps> = ({f, d}) => {
  const t = (f / Math.max(1, d)) * 500;
  const grietas = [[80, 1300, 260, 1380], [300, 1450, 520, 1380], [560, 1520, 760, 1440], [800, 1340, 980, 1420], [150, 1600, 400, 1560], [620, 1650, 900, 1590]];
  return (
    <Lienzo>
      <Sky id="yu-s16" c={['#4a2a1a', '#a85a2a', '#f0b060']} />
      <Sol x={540} y={620} r={110} f={f} />
      <rect x={0} y={1200} width={1080} height={720} fill="#8c5f2b" />
      <rect x={0} y={1200} width={1080} height={30} fill="#a8743a" />
      {grietas.map(([x1, y1, x2, y2], i) => (
        <path key={i} d={`M${x1},${y1} L${(x1 + x2) / 2},${y1 + 25} L${x2},${y2}`} stroke="#3a2412" strokeWidth={8} fill="none" strokeLinecap="round" />
      ))}
      {[0, 1].map((i) => (
        <Camello key={i} x={-250 + i * 330 + t} y={1270} s={0.7} f={f + i * 9} />
      ))}
      {/* sacos vacíos */}
      {[760, 900].map((x) => (
        <path key={x} d={`M${x - 60},1500 Q${x - 80},1400 ${x - 30},1360 H${x + 30} Q${x + 80},1400 ${x + 60},1500 Z`} fill="#b8975a" stroke="#6a4a22" strokeWidth={5} />
      ))}
    </Lienzo>
  );
};

const Copa: React.FC<EscenaProps> = ({f, k}) => {
  const e = ease(p(f, 0, 14));
  const luz = ease(p(f, k, 16));
  return (
    <Lienzo>
      <Sky id="yu-s17" c={['#1a1030', '#4a2a50', '#8a5a4a']} />
      <Halo x={540} y={800} r={360} color={ORO} o={0.4 + 0.5 * luz} />
      <g transform={`translate(540 ${760 + (1 - e) * -300}) scale(${1.5 + 0.06 * Math.sin(f * 0.15)})`}>
        <path d="M-90,-130 H90 Q96,10 40,60 V110 H90 V140 H-90 V110 H-40 V60 Q-96,10 -90,-130 Z" fill={ORO} stroke="#b98420" strokeWidth={8} strokeLinejoin="round" />
        <ellipse cx={0} cy={-130} rx={90} ry={18} fill="#ffe3a0" />
        <path d="M-60,-100 Q-60,0 -20,40" stroke="#fff3c0" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
      </g>
      {/* saco con la copa dentro y el hermano pequeño */}
      <path d="M180,1500 Q150,1380 220,1320 H340 Q410,1380 380,1500 Z" fill="#b8975a" stroke="#6a4a22" strokeWidth={6} />
      <Silueta x={760} y={1500} s={0.8} tipo="nino" color={SIL} />
      <Silueta x={900} y={1500} s={0.85} tipo="hombre" color={SIL} />
      <text x={540} y={1060} textAnchor="middle" fontFamily={serif} fontWeight={700} fontSize={120} fill={CREMA} opacity={0.8 * luz}>
        ?
      </text>
    </Lienzo>
  );
};

export const YUSUF: Record<string, React.FC<EscenaProps>> = {
  suenyo: Suenyo,
  hermanos: Hermanos,
  pozo: Pozo as React.FC<EscenaProps>,
  tunica: TunicaEsc,
  camellos: Caravana,
  palacio: Casa,
  carcel: Carcel,
  reysueno: ReySueno,
  almacen: Almacen,
  reencuentro: Reencuentro,
  perdon: Perdon,
  vista: Vista,
  leccion: Leccion,
  ypregunta: Pregunta,
  padre: Padre,
  hambre: Hambre,
  copa: Copa,
};

export const FOCOS_YUSUF: Record<string, FocoEscena> = {
  suenyo: {x: 540, y: 950},
  hermanos: {x: 540, y: 1050},
  pozo: {x: 540, y: 1100},
  tunica: {x: 540, y: 850},
  camellos: {x: 540, y: 1100},
  palacio: {x: 540, y: 1000},
  carcel: {x: 540, y: 950},
  reysueno: {x: 540, y: 900},
  almacen: {x: 540, y: 1000},
  reencuentro: {x: 540, y: 1000},
  perdon: {x: 540, y: 950},
  vista: {x: 540, y: 1000},
  leccion: {x: 540, y: 740},
  ypregunta: {x: 540, y: 760},
  padre: {x: 540, y: 1050},
  hambre: {x: 540, y: 1000},
  copa: {x: 540, y: 900},
};
