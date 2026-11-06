// «لا تشكي من الأيام» — poema de confianza en Allah. UN SOLO MUNDO 2D CONTINUO: una barca con un farol cruza el mar de noche,
// deja atrás el puerto, ve un faro lejano y amanece. La cámara viaja con la barca de izquierda a derecha.
// Todas las escenas dibujan el MISMO mundo; cada una solo cambia la vista de cámara y termina donde empieza la siguiente.
import React from 'react';
import {H, W, amiri, sans} from '../tema';
import {Halo, Lienzo, ease, easeIO, rnd} from '../dibujos/base';
import {Capa, encuadre} from '../dibujos/camara2d';
import type {FocoEscena} from '../dibujos/camara2d';
import {CREMA, FX, FY, ORO, ORO2, Plano, mezclaColor, mix, p, vmix} from './tiempo';
import type {Vista} from './tiempo';

const ID = 'mar';
const SY = 1300; // línea de mar
const X_FARO = 5500;
const X_PUERTO = 250;

const sm = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

// ───────────────────────── cielo ─────────────────────────
type Cielo = {dia: number; alba: number; hora: number};

const CieloMar: React.FC<{c: Cielo; f: number}> = ({c, f}) => {
  const {dia, alba, hora} = c;
  const a = (k: number) => {
    const noche = ['#070a28', '#16205a', '#3a3478', '#5a4a8a'][k];
    const diaC = ['#3c86d0', '#78b8ea', '#b8dcf0', '#f2e2c0'][k];
    const albaC = ['#3c3a7a', '#c96a78', '#ffb070', '#ffe0a8'][k];
    return mezclaColor(mezclaColor(noche, albaC, alba), diaC, dia);
  };
  const ang = hora * Math.PI * 2; // 0 = amanecer a la izquierda, π/2 = mediodía
  const sx = 540 - Math.cos(ang) * 420, sy = 1180 - Math.sin(ang) * 900;
  const lx = 540 + Math.cos(ang) * 420, ly = 1180 + Math.sin(ang) * 900;
  const luna = 1 - dia;
  return (
    <g>
      <defs>
        <linearGradient id="mr-cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a(0)} />
          <stop offset="0.45" stopColor={a(1)} />
          <stop offset="0.75" stopColor={a(2)} />
          <stop offset="1" stopColor={a(3)} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="url(#mr-cielo)" />
      <g opacity={(1 - dia) * (1 - alba * 0.9)}>
        {Array.from({length: 90}).map((_, i) => (
          <circle key={i} cx={rnd(i) * W} cy={rnd(i + 5) * H * 0.62} r={1 + rnd(i + 9) * 2.4} fill="#fff6e0" opacity={0.25 + 0.7 * Math.abs(Math.sin(f * 0.04 + i * 1.7))} />
        ))}
      </g>
      {ly < 1250 && (
        <g opacity={luna}>
          <circle cx={lx} cy={ly} r={180} fill="#ffe9b8" opacity={0.12} />
          <circle cx={lx} cy={ly} r={62} fill="#fff3d2" />
        </g>
      )}
      {sy < 1250 && (
        <g opacity={Math.max(dia, alba)}>
          <circle cx={sx} cy={sy} r={340} fill="#ffe0a0" opacity={0.32} />
          <circle cx={sx} cy={sy} r={96} fill="#fff1c9" />
        </g>
      )}
    </g>
  );
};

// ───────────────────────── el mundo ─────────────────────────
const Islas: React.FC<{c: Cielo}> = ({c}) => (
  <g>
    {[[-300, 520, 130], [1100, 700, 90], [2300, 420, 110], [3500, 800, 80], [4700, 520, 120], [6000, 640, 100]].map(([x, w, h], i) => (
      <path key={i} d={`M${x - w},${SY} Q${x - w * 0.4},${SY - h} ${x},${SY - h * 1.1} Q${x + w * 0.5},${SY - h * 0.8} ${x + w},${SY} Z`} fill={mezclaColor(mezclaColor('#1c1e4a', '#8a5a78', c.alba), '#5a8ab0', c.dia)} />
    ))}
  </g>
);

const Olas: React.FC<{f: number; c: Cielo; calma: number; capa: number}> = ({f, c, calma, capa}) => {
  const amp = (14 + capa * 6) * (1 - 0.6 * calma);
  const col = mezclaColor(mezclaColor(['#10173f', '#0d1336', '#0a0f2c'][capa], ['#7a5a7a', '#5a3a62', '#3a2a50'][capa], c.alba), ['#2a6a9a', '#235a88', '#1c4a74'][capa], c.dia);
  let d = `M-1500,${SY + 3000}`;
  for (let x = -1500; x <= 7500; x += 50) d += ` L${x},${SY + 90 + capa * 120 + amp * Math.sin(x / (110 + capa * 40) + f * 0.05 * (1 + capa * 0.3) + capa * 2) + amp * 0.5 * Math.sin(x / 47 + f * 0.09)}`;
  d += ' L7500,' + (SY + 3000) + ' Z';
  return <path d={d} fill={col} />;
};

const Mar: React.FC<{f: number; c: Cielo; calma: number}> = ({f, c, calma}) => (
  <g>
    <defs>
      <linearGradient id="mr-mar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={mezclaColor(mezclaColor('#26306a', '#c0687a', c.alba), '#5aa0d0', c.dia)} />
        <stop offset="0.25" stopColor={mezclaColor(mezclaColor('#10173f', '#6a4468', c.alba), '#2a6a9a', c.dia)} />
        <stop offset="1" stopColor={mezclaColor(mezclaColor('#050820', '#2a1a40', c.alba), '#123a64', c.dia)} />
      </linearGradient>
    </defs>
    <rect x={-1500} y={SY} width={9000} height={3200} fill="url(#mr-mar)" />
    {/* destellos de luz sobre el agua */}
    {Array.from({length: 90}).map((_, i) => {
      const x = -800 + rnd(i) * 7600, y = SY + 30 + rnd(i + 3) * 380;
      return <rect key={i} x={x} y={y} width={30 + rnd(i + 5) * 80} height={3} rx={1.5} fill="#fff3d2" opacity={(0.12 + 0.4 * Math.abs(Math.sin(f * 0.05 + i * 2))) * (0.4 + c.alba * 0.6 + c.dia * 0.4)} />;
    })}
    <Olas f={f} c={c} calma={calma} capa={0} />
    <Olas f={f} c={c} calma={calma} capa={1} />
  </g>
);

const Puerto: React.FC<{f: number; luces: number; c: Cielo}> = ({f, luces, c}) => (
  <g>
    <Halo x={X_PUERTO} y={SY - 160} r={620} color="#ffd9a0" o={0.35 * luces} />
    <rect x={-600} y={SY - 30} width={1500} height={60} fill="#2a2038" />
    {Array.from({length: 17}).map((_, i) => {
      const x = -520 + i * 78 + rnd(i) * 20;
      const w = 60 + rnd(i + 2) * 40, h = 70 + rnd(i + 4) * 130;
      return (
        <g key={i}>
          <rect x={x} y={SY - 30 - h} width={w} height={h} fill={mezclaColor('#1d1a3c', '#4a3450', c.alba)} />
          <rect x={x + w * 0.3} y={SY - 30 - h * 0.6} width={12} height={20} fill={ORO2} opacity={luces * (0.55 + 0.35 * Math.sin(f * 0.06 + i))} />
        </g>
      );
    })}
    {/* alminar */}
    <rect x={X_PUERTO + 120} y={SY - 330} width={44} height={300} fill={mezclaColor('#201c48', '#5a3a58', c.alba)} />
    <rect x={X_PUERTO + 112} y={SY - 350} width={60} height={22} fill={mezclaColor('#201c48', '#5a3a58', c.alba)} />
    <circle cx={X_PUERTO + 142} cy={SY - 384} r={14} fill={ORO} opacity={0.4 + 0.6 * luces} />
    {/* farolas del muelle */}
    {[-120, 180, 460, 720].map((x, i) => (
      <g key={i}>
        <Halo x={x} y={SY - 130} r={150} color="#ffd27a" o={0.55 * luces} />
        <rect x={x - 4} y={SY - 130} width={8} height={104} fill="#120e22" />
        <rect x={x - 12} y={SY - 150} width={24} height={26} fill={ORO2} opacity={0.5 + 0.5 * luces} />
      </g>
    ))}
    {/* barcas amarradas */}
    {[[-250, 0.7], [560, 0.55]].map(([x, s], i) => (
      <g key={i} transform={`translate(${x} ${SY + 40}) scale(${s})`}>
        <path d="M-120,0 C-90,50 90,50 140,-10 L150,-40 L-130,-30 Z" fill="#2a1c1c" />
        <line x1={0} y1={-30} x2={0} y2={-210} stroke="#2a1c1c" strokeWidth={8} />
      </g>
    ))}
  </g>
);

const Faro: React.FC<{f: number; luz: number; c: Cielo}> = ({f, luz, c}) => {
  const x = X_FARO;
  const base = SY + 20;
  const parpadeo = 0.75 + 0.25 * Math.sin(f * 0.12);
  return (
    <g>
      {/* rayos de luz sobre el mar */}
      <defs>
        <linearGradient id="mr-haz" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff0c0" stopOpacity={0.5} />
          <stop offset="1" stopColor="#fff0c0" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g opacity={luz * parpadeo * (1 - c.dia)}>
        <path d={`M${x},${base - 470} L${x - 2600},${base - 560} L${x - 2600},${base - 200} Z`} fill="url(#mr-haz)" />
        <path d={`M${x},${base - 470} L${x + 2000},${base - 520} L${x + 2000},${base - 280} Z`} fill="url(#mr-haz)" opacity={0.35} />
      </g>
      <Halo x={x} y={base - 470} r={420} color="#ffe3a0" o={0.8 * luz} />
      {/* roca */}
      <path d={`M${x - 420},${base + 30} Q${x - 300},${base - 90} ${x - 160},${base - 120} L${x + 190},${base - 110} Q${x + 330},${base - 60} ${x + 460},${base + 30} Z`} fill={mezclaColor('#1c1a38', '#4a3a50', c.alba)} />
      <path d={`M${x - 160},${base - 120} L${x + 190},${base - 110} L${x + 120},${base - 70} L${x - 100},${base - 80} Z`} fill="#fff" opacity={0.1} />
      {/* torre */}
      <path d={`M${x - 76},${base - 100} L${x - 46},${base - 430} L${x + 46},${base - 430} L${x + 76},${base - 100} Z`} fill={mezclaColor('#e6dcd0', '#f4e4d0', c.alba)} />
      <path d={`M${x - 66},${base - 190} L${x - 60},${base - 240} L${x + 60},${base - 240} L${x + 66},${base - 190} Z`} fill="#b8403a" />
      <path d={`M${x - 52},${base - 320} L${x - 48},${base - 366} L${x + 48},${base - 366} L${x + 52},${base - 320} Z`} fill="#b8403a" />
      <path d={`M${x + 20},${base - 100} L${x + 46},${base - 430} L${x + 76},${base - 100} Z`} fill="#000" opacity={0.15} />
      <rect x={x - 64} y={base - 442} width={128} height={16} rx={4} fill="#3a3248" />
      {/* cuarto de la lámpara */}
      <rect x={x - 38} y={base - 500} width={76} height={60} fill={mezclaColor('#ffe3a0', '#ffd27a', 0.5)} opacity={0.35 + 0.65 * luz} />
      <rect x={x - 38} y={base - 500} width={76} height={60} fill="none" stroke="#3a3248" strokeWidth={5} />
      <path d={`M${x - 52},${base - 500} L${x},${base - 560} L${x + 52},${base - 500} Z`} fill="#b8403a" />
      <circle cx={x} cy={base - 566} r={10} fill="#3a3248" />
    </g>
  );
};

type Pose = {x: number; giro: number};

const Barca: React.FC<{x: number; f: number; luz: number; giro: number; c: Cielo}> = ({x, f, luz, giro, c}) => {
  const bob = Math.sin(f * 0.09) * 8;
  const rot = Math.sin(f * 0.07) * 3 + giro;
  const y = SY + 70 + bob;
  return (
    <g>
      {/* reflejo del farol en el agua */}
      <g opacity={0.5 * luz}>
        <path d={`M${x + 160},${y + 40} L${x + 120},${y + 360} L${x + 210},${y + 360} Z`} fill="#ffd27a" opacity={0.25} />
      </g>
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <ellipse cx={0} cy={44} rx={190} ry={12} fill="#000" opacity={0.25} />
        {/* mástil y vela latina */}
        <line x1={-10} y1={-30} x2={-10} y2={-330} stroke="#3a2418" strokeWidth={9} strokeLinecap="round" />
        <path d={`M-10,-320 C80,-230 120,-120 150,-50 L-10,-50 Z`} fill={mezclaColor('#d9cdb6', '#fff0d8', c.alba * 0.6 + c.dia * 0.5)} stroke="#a89878" strokeWidth={3} />
        <path d={`M-10,-320 C40,-240 70,-150 90,-50 L-10,-50 Z`} fill="#000" opacity={0.1} />
        <path d={`M-10,-290 L-120,-60 L-10,-50 Z`} fill={mezclaColor('#c9bda6', '#f2e2c8', c.alba * 0.6 + c.dia * 0.5)} stroke="#a89878" strokeWidth={3} />
        {/* casco */}
        <path d="M-170,-34 C-150,50 120,52 190,-46 L198,-62 L-176,-56 Z" fill="#4a2c1e" />
        <path d="M-170,-34 C-150,50 120,52 190,-46" fill="none" stroke="#7a4a32" strokeWidth={5} />
        <path d="M-160,-48 H190" stroke="#c9983a" strokeWidth={5} />
        <path d="M-120,-10 C-60,10 60,12 150,-18" stroke="#2a1810" strokeWidth={3} fill="none" opacity={0.6} />
        {/* farol en la proa */}
        <line x1={178} y1={-62} x2={178} y2={-150} stroke="#2a1810" strokeWidth={6} />
        <path d="M178,-150 q36,0 36,24" stroke="#2a1810" strokeWidth={5} fill="none" />
        <rect x={198} y={-128} width={26} height={34} rx={5} fill={ORO2} opacity={0.4 + 0.6 * luz} stroke="#2a1810" strokeWidth={3} />
        <Halo x={211} y={-112} r={230} color="#ffd27a" o={0.9 * luz * (0.85 + 0.15 * Math.sin(f * 0.2))} />
        {/* timonel: silueta sin cara */}
        <g transform="translate(-110 -56)">
          <line x1={0} y1={0} x2={0} y2={-64} stroke="#140f26" strokeWidth={30} strokeLinecap="round" />
          <circle cx={4} cy={-92} r={19} fill="#140f26" />
          <line x1={-6} y1={-50} x2={-48} y2={-34} stroke="#140f26" strokeWidth={12} strokeLinecap="round" />
        </g>
        <line x1={-176} y1={-52} x2={-98} y2={-26} stroke="#2a1810" strokeWidth={9} strokeLinecap="round" />
      </g>
    </g>
  );
};

const Aves: React.FC<{f: number; o: number; x0: number}> = ({f, o, x0}) =>
  o <= 0 ? null : (
    <g opacity={o}>
      {Array.from({length: 7}).map((_, i) => {
        const x = x0 + i * 150 + ((f * 3 + i * 40) % 300) - 150;
        const y = SY - 640 - i * 36 + Math.sin(f * 0.1 + i) * 14;
        const w = 30 + Math.sin(f * 0.25 + i * 1.7) * 18;
        return <path key={i} d={`M${x - 40},${y + w * 0.2} Q${x - 18},${y - w} ${x},${y} Q${x + 18},${y - w} ${x + 40},${y + w * 0.2}`} stroke="#1a1430" strokeWidth={6} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );

/** Verso en árabe en pantalla (aparece cuando lo dice la voz) */
const Verso: React.FC<{texto: string; e: number}> = ({texto, e}) => {
  if (e <= 0) return null;
  const tam = Math.max(50, Math.min(86, 940 / (texto.length * 0.33)));
  return (
    <g opacity={e} transform={`translate(0 ${(1 - e) * 24})`}>
      <rect x={50} y={300} width={W - 100} height={200} rx={100} fill="#10132e" opacity={0.9} />
      <rect x={50} y={300} width={W - 100} height={200} rx={100} fill="none" stroke={ORO} strokeWidth={4} />
      <text x={W / 2} y={430} textAnchor="middle" fontFamily={amiri} fontWeight={700} fontSize={tam} fill={ORO2} direction="rtl">
        {texto}
      </text>
    </g>
  );
};

// ───────────────────────── fábrica de escenas ─────────────────────────
type Estado = {x: number; giro: number; cielo: Cielo; luzFaro: number; luzPuerto: number; calma: number; aves: number};
type Ctx = {f: number; tl: number; t: number; v: Vista; d: number};
type Def = {vista: (t: number) => Vista; estado: (t: number) => Estado; verso?: string; extra?: (c: Ctx, e: Estado) => React.ReactNode};

const semillaDe = (nombre: string) => [...`${ID}-${nombre}`].reduce((a, ch) => a + ch.charCodeAt(0), 0);
const sigue = (x: number, z: number, dx = 120, dy = 170): Vista => ({c: [x + dx, SY - dy], z});
const NOCHE: Cielo = {dia: 0, alba: 0, hora: 0.62};

const escena = (nombre: string, def: Def, ultimo = false): React.FC<{f: number; d: number}> => {
  const sem = semillaDe(nombre);
  return ({f, d}) => {
    const L = ultimo ? d : Math.max(1, d - 12);
    const t = Math.min(1, f / L);
    const v = def.vista(t);
    const e = def.estado(t);
    const cam = encuadre(f, d, sem, {x: FX, y: FY});
    const comp = `translate(${cam.x} ${cam.y}) scale(${1 / cam.s}) translate(${-FX} ${-FY})`;
    const c: Ctx = {f, tl: f / 30, t, v, d};
    return (
      <Lienzo>
        <Capa z={0}>
          <CieloMar c={e.cielo} f={f} />
        </Capa>
        <Capa z={0.5}>
          <g transform={comp}>
            <Plano v={v} q={0.25}>
              <Islas c={e.cielo} />
            </Plano>
            <Plano v={v} q={1}>
              <Mar f={f} c={e.cielo} calma={e.calma} />
              <Puerto f={f} luces={e.luzPuerto} c={e.cielo} />
              <Faro f={f} luz={e.luzFaro} c={e.cielo} />
              <Barca x={e.x} f={f} luz={1 - e.cielo.dia * 0.8} giro={e.giro} c={e.cielo} />
              <Aves f={f} o={e.aves} x0={e.x + 300} />
              {def.extra?.(c, e)}
            </Plano>
            <Plano v={v} q={1.2}>
              <Olas f={f + 40} c={e.cielo} calma={e.calma} capa={2} />
            </Plano>
          </g>
        </Capa>
        <g transform={comp}>{def.verso ? <Verso texto={def.verso} e={ease(p(t, 0.05, 0.14))} /> : null}</g>
      </Lienzo>
    );
  };
};

// vistas encadenadas: cada escena termina donde empieza la siguiente
const Dias = escena('dias', {
  vista: (t) => vmix(sigue(500, 0.8, 200, 180), sigue(1500, 1.0), easeIO(t)),
  estado: (t) => ({x: mix(500, 1500, t), giro: 0, cielo: {dia: sm(Math.sin(t * Math.PI * 2 - 0.4) * 1.6 + 0.2), alba: 0, hora: mix(0.62, 1.62, t)}, luzFaro: 0, luzPuerto: 1, calma: 0, aves: 0}),
  verso: 'لَا تَشْكِي مِنَ الْأَيَّامِ فَلَيْسَ لَهَا بَدِيلُ',
});
const PuertoE = escena('puerto', {
  vista: (t) => vmix(sigue(1500, 1.0), {c: [1300, SY - 260], z: 0.6}, easeIO(t)),
  estado: (t) => ({x: mix(1500, 2500, t), giro: 0, cielo: NOCHE, luzFaro: 0, luzPuerto: 1 - sm(p(t, 0.15, 0.8)), calma: 0, aves: 0}),
  verso: 'وَلَا تَبْكِي عَلَى الدُّنْيَا مَا دَامَ آخِرُهَا الرَّحِيلُ',
});
const FaroE = escena('faro', {
  vista: (t) => vmix({c: [1300, SY - 260], z: 0.6}, {c: [X_FARO - 800, SY - 330], z: 0.5}, easeIO(p(t, 0, 0.7))),
  estado: (t) => ({x: mix(2500, 3500, t), giro: 0, cielo: NOCHE, luzFaro: ease(p(t, 0.35, 0.3)), luzPuerto: 0, calma: 0, aves: 0}),
  verso: 'وَاجْعَلْ ثِقَتَكَ بِاللَّهِ لَيْسَ لَهَا مَثِيلُ',
});
const Timon = escena('timon', {
  vista: (t) => vmix({c: [X_FARO - 800, SY - 330], z: 0.5}, sigue(4000, 1.45, 160, 150), easeIO(t)),
  estado: (t) => ({x: mix(3500, 4300, t), giro: -4 * sm(p(t, 0.2, 0.6)), cielo: NOCHE, luzFaro: 1, luzPuerto: 0, calma: 0.1, aves: 0}),
  verso: 'وَتَوَكَّلْ عَلَى اللهِ حَقَّ التَّوَكُّلِ',
});
const Amanecer = escena('amanecer', {
  vista: (t) => vmix(sigue(4000, 1.45, 160, 150), sigue(4800, 0.6, 520, 260), easeIO(t)),
  estado: (t) => ({x: mix(4300, 5000, t), giro: 0, cielo: {dia: 0, alba: sm(t * 1.1), hora: mix(0.62, 1.0, sm(t))}, luzFaro: 1 - 0.3 * t, luzPuerto: 0, calma: sm(t), aves: sm(p(t, 0.5, 0.4))}),
  verso: 'فَإِنَّهُ عَلَى كُلِّ شَيْءٍ وَكِيلُ',
});
const Final = escena(
  'final',
  {
    vista: (t) => vmix(sigue(4800, 0.6, 520, 260), {c: [3000, SY - 450], z: 0.19}, easeIO(p(t, 0, 0.75))),
    estado: (t) => ({x: mix(5000, 5120, t), giro: 0, cielo: {dia: 0, alba: 1, hora: 1.0}, luzFaro: 0.6, luzPuerto: 0, calma: 1, aves: 1}),
    extra: (c) => {
      const a = ease(p(c.t, 0.55, 0.25));
      return (
        <g opacity={a}>
          <rect x={900} y={SY - 1700} width={4200} height={520} rx={260} fill="#10132e" opacity={0.9} />
          <rect x={900} y={SY - 1700} width={4200} height={520} rx={260} fill="none" stroke={ORO} strokeWidth={14} />
          <text x={3000} y={SY - 1400} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={190} fill={CREMA}>
            ¿Para quién es hoy este recuerdo?
          </text>
        </g>
      );
    },
  },
  true,
);

export const MAR: Record<string, React.FC<{f: number; d: number; k: number; opts: string[]}>> = {
  [`${ID}-dias`]: Dias,
  [`${ID}-puerto`]: PuertoE,
  [`${ID}-faro`]: FaroE,
  [`${ID}-timon`]: Timon,
  [`${ID}-amanecer`]: Amanecer,
  [`${ID}-final`]: Final,
};

export const FOCOS_MAR: Record<string, FocoEscena> = Object.fromEntries(Object.keys(MAR).map((k) => [k, {x: FX, y: FY}]));
