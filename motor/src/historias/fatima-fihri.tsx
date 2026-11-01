// Escenas a medida: «Fatima al-Fihri y la Qarawiyyin»
import React from 'react';
import {P, W, sans, serif} from '../tema';
import {LAT, LUGARES, RUTA, SIERRAS, TIERRA} from './mapa-norte-africa';
import {Cielo, EscenaProps, Estrellas, Halo, Lienzo, Polvo, Silueta, Zellige, ease, easeIO, mix, p, rnd} from '../dibujos/base';
import type {FocoEscena} from '../dibujos/camara2d';
import {Luna} from '../dibujos/escenas1';

/** Posición de la caravana en la ruta real (t de 0 a 1) */
export const enRuta = (t: number) => {
  const u = Math.max(0, Math.min(1, t)) * (RUTA.length - 1);
  const i = Math.min(RUTA.length - 2, Math.floor(u));
  const r = u - i;
  return {x: RUTA[i][0] + (RUTA[i + 1][0] - RUTA[i][0]) * r, y: RUTA[i][1] + (RUTA[i + 1][1] - RUTA[i][1]) * r};
};
export const viaje = (f: number, d: number) => easeIO(p(f, 8, d * 0.8));
const linea = (pts: number[][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');

/** Mapa del norte de África con la costa real, cordilleras y la ruta Kairouan → Fez (vista desde arriba) */
export const Caravana: React.FC<EscenaProps> = ({f, d}) => {
  const t = viaje(f, d);
  const pos = enRuta(t);
  const pos2 = enRuta(t + 0.01);
  const ang = (Math.atan2(pos2.y - pos.y, pos2.x - pos.x) * 180) / Math.PI;
  const hecho = RUTA.slice(0, Math.max(1, Math.floor(t * (RUTA.length - 1))) + 1);
  const llega = ease(p(f, d * 0.85, 14));
  const L = LUGARES;
  const etiqueta = {fontFamily: sans, fontWeight: 700} as const;
  return (
    <Lienzo>
      <defs>
        <linearGradient id="mp-mar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#123a56" />
          <stop offset="45%" stopColor="#1f5574" />
          <stop offset="100%" stopColor="#174663" />
        </linearGradient>
        <linearGradient id="mp-tierra" gradientUnits="userSpaceOnUse" x1="0" y1={LAT.l38} x2="0" y2={LAT.l26}>
          <stop offset="0%" stopColor="#7d8a52" />
          <stop offset="28%" stopColor="#8f9258" />
          <stop offset="48%" stopColor="#b8a067" />
          <stop offset="70%" stopColor="#d9b97f" />
          <stop offset="100%" stopColor="#e6c890" />
        </linearGradient>
        <filter id="mp-relieve" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="4" seed="7" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.9 -0.25" />
        </filter>
        <clipPath id="mp-clip">
          <path d={TIERRA} />
        </clipPath>
      </defs>
      {/* mar */}
      <rect width={W} height={1920} fill="url(#mp-mar)" />
      {Array.from({length: 14}).map((_, i) => (
        <path
          key={i}
          d={`M${rnd(i) * W + Math.sin(f * 0.04 + i) * 12},${120 + rnd(i + 2) * 560} q18,-9 36,0 q18,9 36,0`}
          stroke="#5f93b0"
          strokeWidth={3}
          fill="none"
          opacity={0.35}
        />
      ))}
      {/* aguas poco profundas junto a la costa */}
      <path d={TIERRA} fill="none" stroke="#4f97b4" strokeWidth={34} strokeLinejoin="round" opacity={0.35} filter="url(#difusoS)" />
      <path d={TIERRA} fill="none" stroke="#7fbfd2" strokeWidth={10} strokeLinejoin="round" opacity={0.45} />
      {/* tierra con relieve */}
      <path d={TIERRA} fill="url(#mp-tierra)" />
      <g clipPath="url(#mp-clip)">
        <rect width={W} height={1920} filter="url(#mp-relieve)" opacity={0.55} />
        {/* cordilleras: sombra ancha + cresta */}
        {Object.values(SIERRAS).map((s, i) => (
          <g key={i}>
            <path d={linea(s)} stroke="#4e3a22" strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.28} filter="url(#difusoS)" />
            <path d={linea(s)} stroke="#6b5434" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.55} filter="url(#difusoS)" />
            <path d={linea(s)} stroke="#efe2c4" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.5} transform="translate(-3 -4)" />
          </g>
        ))}
      </g>
      <path d={TIERRA} fill="none" stroke="#efe3c6" strokeWidth={2.5} strokeLinejoin="round" opacity={0.8} />
      {/* nombres */}
      <text x={L.mediterraneo[0]} y={L.mediterraneo[1]} fill="#bcd8e6" fontFamily={serif} fontStyle="italic" fontSize={44} textAnchor="middle" letterSpacing={3}>
        Mar Mediterráneo
      </text>
      <text x={L.andalus[0]} y={L.andalus[1]} fill="#3a2a1a" {...etiqueta} fontSize={26} textAnchor="middle" opacity={0.7} letterSpacing={2}>
        AL-ÁNDALUS
      </text>
      <text x={L.sahara[0]} y={L.sahara[1]} fill="#7a5a34" {...etiqueta} fontSize={58} textAnchor="middle" opacity={0.55} letterSpacing={22}>
        SAHARA
      </text>
      {/* ruta: entera punteada, y recorrida en terracota */}
      <path d={linea(RUTA)} stroke="#4a3220" strokeWidth={5} strokeDasharray="2 14" strokeLinecap="round" fill="none" opacity={0.7} />
      <path d={linea([...hecho, [pos.x, pos.y]])} stroke="#2a1608" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.35} />
      <path d={linea([...hecho, [pos.x, pos.y]])} stroke={P.terracota} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* ciudades del camino */}
      {[L.constantina, L.tremecen].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={7} fill="#3a2418" stroke="#f6ecd6" strokeWidth={3} opacity={0.85} />
      ))}
      {[
        {c: L.kairouan, n: 'Kairouan', dx: 0, dy: 62, r: 16, col: '#5a3a28'},
        {c: L.fez, n: 'Fez', dx: 0, dy: -36, r: 16 + 12 * llega, col: P.oro},
      ].map(({c, n, dx, dy, r, col}, i) => (
        <g key={i}>
          <circle cx={c[0]} cy={c[1]} r={r + 8} fill="#000" opacity={0.25} />
          <circle cx={c[0]} cy={c[1]} r={r} fill={col} stroke="#fff6e6" strokeWidth={5} />
          <text x={c[0] + dx} y={c[1] + dy} fill="#fff6e6" stroke="#2a1608" strokeWidth={8} paintOrder="stroke" {...etiqueta} fontWeight={800} fontSize={42} textAnchor={i === 0 ? 'end' : 'middle'}>
            {n}
          </text>
        </g>
      ))}
      {/* la caravana vista desde arriba: tres camellos en fila con su sombra */}
      <g transform={`translate(${pos.x} ${pos.y}) rotate(${ang}) scale(0.8)`}>
        <Halo x={0} y={0} r={80} color={P.oroClaro} o={0.55} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${-i * 44} ${Math.sin(f * 0.4 + i) * 2.5})`}>
            <ellipse cx={4} cy={6} rx={24} ry={11} fill="#000" opacity={0.25} />
            <ellipse cx={0} cy={0} rx={22} ry={11} fill="#8a5a34" />
            <ellipse cx={-6} cy={0} rx={8} ry={7} fill="#6a4020" />
            <path d="M18,0 L28,-2 L28,2 Z" fill="#8a5a34" />
            <circle cx={29} cy={0} r={6} fill="#8a5a34" />
            {i === 0 && <rect x={-7} y={-8} width={14} height={16} rx={4} fill={P.terracota} />}
          </g>
        ))}
      </g>
      <Polvo f={f} color={P.arena} o={0.35} />
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

/** Hacia dónde mira la cámara en cada escena (la cámara se mueve siempre alrededor de este punto) */
export const FOCOS_FATIMA_FIHRI: Record<string, FocoEscena> = {
  caravana: (f, d) => enRuta(viaje(f, d)),
  herencia: {x: 540, y: 1000},
  planos: {x: 540, y: 760},
  obra: {x: 680, y: 960},
  sabios: {x: 540, y: 1000},
  cta: {x: 540, y: 820},
};
