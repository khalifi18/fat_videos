// Escenas a medida: «Fatima al-Fihri y la Qarawiyyin»
import React from 'react';
import {P, W, sans} from '../tema';
import {Cielo, EscenaProps, Estrellas, Halo, Lienzo, Polvo, Silueta, Zellige, ease, easeIO, mix, p, rnd} from '../dibujos/base';
import type {FocoEscena} from '../dibujos/camara2d';
import {Luna} from '../dibujos/escenas1';

/** Ruta Kairouan → Fez sobre el mapa (vista desde arriba). Kairouan al este (derecha), Fez al oeste. */
const RUTA = {a: {x: 900, y: 860}, c1: {x: 720, y: 700}, c2: {x: 420, y: 1040}, b: {x: 190, y: 900}};
const enRuta = (t: number) => {
  const {a, c1, c2, b} = RUTA;
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
  };
};
const viaje = (f: number, d: number) => easeIO(p(f, 8, d * 0.8));

const Caravana: React.FC<EscenaProps> = ({f, d}) => {
  const t = viaje(f, d);
  const pos = enRuta(t);
  const pos2 = enRuta(Math.min(1, t + 0.01));
  const ang = (Math.atan2(pos2.y - pos.y, pos2.x - pos.x) * 180) / Math.PI;
  const {a, c1, c2, b} = RUTA;
  const llega = ease(p(f, d * 0.85, 14));
  return (
    <Lienzo>
      {/* tierra */}
      <rect width={W} height={1920} fill="#e8d3a9" />
      {Array.from({length: 40}).map((_, i) => (
        <circle key={i} cx={rnd(i) * W} cy={600 + rnd(i + 9) * 1000} r={30 + rnd(i + 4) * 80} fill="#dcc193" opacity={0.5} />
      ))}
      {/* mar Mediterráneo arriba, con olas */}
      <path d="M0,0 L1080,0 L1080,620 C980,660 900,600 820,640 C700,700 600,600 470,640 C350,680 260,610 150,650 C90,670 40,640 0,660 Z" fill="#5d8fa8" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${100 + i * 190 + Math.sin(f * 0.05 + i) * 10},${420 + (i % 2) * 70} q20,-12 40,0 q20,12 40,0`} stroke="#9cc3d4" strokeWidth={5} fill="none" />
      ))}
      <text x={540} y={575} fill="#e8f2f6" fontFamily={sans} fontWeight={700} fontSize={32} textAnchor="middle" opacity={0.85} letterSpacing={6}>
        MAR MEDITERRÁNEO
      </text>
      {/* montañas del Atlas */}
      {Array.from({length: 9}).map((_, i) => {
        const x = 230 + i * 70, y = 1000 + Math.sin(i) * 30;
        return <path key={i} d={`M${x - 40},${y} L${x},${y - 60} L${x + 40},${y} Z`} fill="#b8936a" stroke="#9a7650" strokeWidth={3} />;
      })}
      {/* ruta: punteada completa y dibujada hasta la caravana */}
      <path d={`M${a.x},${a.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${b.x},${b.y}`} stroke="#8a6a48" strokeWidth={6} strokeDasharray="4 18" strokeLinecap="round" fill="none" opacity={0.6} />
      <path d={`M${a.x},${a.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${b.x},${b.y}`} stroke={P.terracota} strokeWidth={10} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} />
      {/* ciudades */}
      {[
        {...a, n: 'Kairouan', anc: 'end', dy: 80},
        {...b, n: 'Fez', anc: 'middle', dy: -40},
      ].map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={i === 1 ? 20 + 14 * llega : 20} fill={i === 1 ? P.oro : '#6a4a3a'} stroke="#fff6e6" strokeWidth={6} />
          <text x={c.anc === 'end' ? c.x + 40 : c.x} y={c.y + c.dy} fill="#3a2418" fontFamily={sans} fontWeight={800} fontSize={44} textAnchor={c.anc}>
            {c.n}
          </text>
        </g>
      ))}
      {/* la caravana vista desde arriba: tres camellos en fila */}
      <g transform={`translate(${pos.x} ${pos.y}) rotate(${ang})`}>
        <Halo x={0} y={0} r={90} color={P.oroClaro} o={0.7} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${-i * 46} ${Math.sin(f * 0.4 + i) * 3})`}>
            <ellipse cx={0} cy={0} rx={22} ry={12} fill="#7a4a2a" />
            <ellipse cx={-8} cy={0} rx={8} ry={8} fill="#5a341c" />
            <circle cx={20} cy={0} r={7} fill="#7a4a2a" />
            {i === 0 && <rect x={-6} y={-9} width={14} height={18} rx={4} fill={P.terracota} />}
          </g>
        ))}
      </g>
      <Polvo f={f} color={P.arena} o={0.5} />
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
