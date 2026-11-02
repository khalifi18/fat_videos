// «Argán, el oro de Marruecos» (cosas de casa que no te contaron)
//
// UN SOLO MUNDO CONTINUO (ver guias/referencia-google-maps.md), con tres niveles de zoom que encajan:
//   MAPA  (Marruecos y Europa, datos reales) → al acercarse a la Arganeraie se "aterriza" en
//   CAMPO (el bosque de arganes visto de lado: cabras en los árboles, la cooperativa) → por la puerta se entra en
//   CASA  (la cooperativa por dentro: la rha, las mujeres, el diploma de la UNESCO).
// El paso de un nivel a otro es siempre un zoom que sigue en la misma dirección mientras se funden las capas.
// Cada escena empieza exactamente donde terminó la anterior. Camara2D se compensa en las capas del mundo
// (el viaje lo hace la vista de mundo) y da parallax al fondo (z=0) y al primer plano (z=1).
import React from 'react';
import {H, W, amiri, sans, serif} from '../tema';
import {Halo, Lienzo, Silueta, ease, easeIO, rnd} from '../dibujos/base';
import {Capa, encuadre} from '../dibujos/camara2d';
import type {FocoEscena} from '../dibujos/camara2d';
import {BORDE, CIUDADES as CI, RUTAS, TIERRA, ZONA} from './mapa-argan';

const ID = 'argan';
const S = 30;
const FX = W / 2, FY = H * 0.42;
const p = (x: number, a: number, len: number) => Math.min(1, Math.max(0, (x - a) / Math.max(1e-6, len)));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

type Pt = [number, number];
type Vista = {c: Pt; z: number};
const vmix = (a: Vista, b: Vista, t: number): Vista => {
  const z = Math.exp(mix(Math.log(a.z), Math.log(b.z), t));
  const w = a.z === b.z ? t : (1 / a.z - 1 / z) / (1 / a.z - 1 / b.z);
  return {c: [mix(a.c[0], b.c[0], w), mix(a.c[1], b.c[1], w)], z};
};
const tf = (v: Vista) => `translate(${FX} ${FY}) scale(${v.z}) translate(${-v.c[0]} ${-v.c[1]})`;
const aPantalla = (v: Vista, [x, y]: Pt): Pt => [FX + (x - v.c[0]) * v.z, FY + (y - v.c[1]) * v.z];

// ───────────────────────── MAPA ─────────────────────────
const ZC: Pt = [414, 2521]; // centro de la Arganeraie
const M_ARBOL: Pt = [418, 2516]; // dónde está el argán de la primera escena
const M_CABRAS: Pt = [396, 2540];
const M_COOP: Pt = [430, 2530];

// puntos de árboles dentro de la zona (rejilla con algo de azar)
const dentro = (x: number, y: number) => {
  let c = false;
  for (let i = 0, j = ZONA.length - 1; i < ZONA.length; j = i++) {
    const [xi, yi] = ZONA[i], [xj, yj] = ZONA[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const PUNTOS_ZONA: Pt[] = (() => {
  const out: Pt[] = [];
  let n = 0;
  for (let y = 2380; y < 2660; y += 3.2) {
    for (let x = 330; x < 500; x += 3.2) {
      n++;
      const px = x + (rnd(n) - 0.5) * 2.6, py = y + (rnd(n + 7) - 0.5) * 2.6;
      if (dentro(px, py) && rnd(n + 3) > 0.25) out.push([px, py]);
    }
  }
  return out;
})();
const ZONA_D = ZONA.map((q, i) => `${i ? 'L' : 'M'}${q[0]},${q[1]}`).join(' ') + ' Z';

const Mapa: React.FC<{v: Vista}> = ({v}) => {
  // árboles de la zona: solo los que caen en pantalla, en coordenadas de pantalla (tamaño estable)
  const r = Math.max(1.2, Math.min(18, v.z * 1.25));
  return (
    <g>
      <g transform={tf(v)}>
        <defs>
          <linearGradient id="ar-tierra" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="2969">
            <stop offset="0" stopColor="#a9b07a" />
            <stop offset="0.45" stopColor="#c8a86e" />
            <stop offset="0.8" stopColor="#d4a868" />
            <stop offset="1" stopColor="#dcb47a" />
          </linearGradient>
          <linearGradient id="ar-fh" gradientUnits="userSpaceOnUse" x1={BORDE.x0} y1="0" x2={BORDE.x1} y2="0">
            <stop offset="0" stopColor="#000" />
            <stop offset="0.14" stopColor="#fff" />
            <stop offset="0.86" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <linearGradient id="ar-fv" gradientUnits="userSpaceOnUse" x1="0" y1={BORDE.y0} x2="0" y2={BORDE.y1}>
            <stop offset="0" stopColor="#000" />
            <stop offset="0.14" stopColor="#fff" />
            <stop offset="0.86" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id="ar-mh" maskUnits="userSpaceOnUse" x={BORDE.x0} y={BORDE.y0} width={BORDE.x1 - BORDE.x0} height={BORDE.y1 - BORDE.y0}>
            <rect x={BORDE.x0} y={BORDE.y0} width={BORDE.x1 - BORDE.x0} height={BORDE.y1 - BORDE.y0} fill="url(#ar-fh)" />
          </mask>
          <mask id="ar-mv" maskUnits="userSpaceOnUse" x={BORDE.x0} y={BORDE.y0} width={BORDE.x1 - BORDE.x0} height={BORDE.y1 - BORDE.y0}>
            <rect x={BORDE.x0} y={BORDE.y0} width={BORDE.x1 - BORDE.x0} height={BORDE.y1 - BORDE.y0} fill="url(#ar-fv)" />
          </mask>
        </defs>
        <g mask="url(#ar-mh)">
          <g mask="url(#ar-mv)">
            {/* olas suaves en el mar: líneas paralelas a la costa */}
            <path d={TIERRA} fill="none" stroke="#9fd6e0" strokeWidth={40} vectorEffect="non-scaling-stroke" opacity={0.08} strokeLinejoin="round" />
            <path d={TIERRA} fill="none" stroke="#9fd6e0" strokeWidth={16} vectorEffect="non-scaling-stroke" opacity={0.16} strokeLinejoin="round" />
            <path d={TIERRA} fill="url(#ar-tierra)" />
            <path d={TIERRA} fill="none" stroke="#fff8e6" strokeWidth={2} vectorEffect="non-scaling-stroke" opacity={0.9} strokeLinejoin="round" />
            {/* la Arganeraie */}
            <path d={ZONA_D} fill="#6f9a4a" opacity={0.45} />
            <path d={ZONA_D} fill="none" stroke="#3f6a2a" strokeWidth={2.5} strokeDasharray="10 8" vectorEffect="non-scaling-stroke" opacity={0.8} />
          </g>
        </g>
      </g>
      {PUNTOS_ZONA.map((q, i) => {
        const [x, y] = aPantalla(v, q);
        if (x < -30 || x > W + 30 || y < -30 || y > H + 30) return null;
        const rr = r * (0.75 + rnd(i) * 0.5);
        return (
          <g key={i}>
            <ellipse cx={x + rr * 0.3} cy={y + rr * 0.5} rx={rr} ry={rr * 0.45} fill="#5a4a20" opacity={0.25} />
            <circle cx={x} cy={y} r={rr} fill={i % 3 ? '#3f6a2a' : '#4f7a33'} />
            <circle cx={x - rr * 0.3} cy={y - rr * 0.3} r={rr * 0.45} fill="#7aa34a" opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
};

// ───────────────────────── CAMPO (vista lateral) ─────────────────────────
const GY = 1150; // línea del suelo
const DOOR: Pt = [4400, 1010];
/** capa con su propio parallax dentro del campo: q < 1 se mueve menos (está más lejos) */
const tfq = (v: Vista, q: number, ref: Pt = [2600, GY]): Vista => ({
  c: [ref[0] + (v.c[0] - ref[0]) * q, ref[1] + (v.c[1] - ref[1]) * q],
  z: Math.pow(v.z, 0.5 + 0.5 * q),
});

/** Argán: tronco corto y retorcido que se abre en varias ramas, copa ancha y aplastada, frutos amarillos */
const Argan: React.FC<{x: number; y: number; s?: number; sem?: number; f?: number}> = ({x, y, s = 1, sem = 0, f = 0}) => {
  const sway = Math.sin(f * 0.03 + sem) * 0.6;
  const ramas = [-1.05, -0.6, -0.15, 0.3, 0.75, 1.1];
  const matas = Array.from({length: 56}).map((_, j) => {
    const th = rnd(sem * 13 + j) * Math.PI * 2;
    const rr = Math.sqrt(rnd(sem * 17 + j + 1));
    return {x: Math.cos(th) * rr * 330, y: -300 + Math.sin(th) * rr * 120, r: 52 + rnd(sem * 7 + j) * 46};
  }).sort((a, b) => a.y - b.y);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={20} cy={8} rx={380} ry={42} fill="#5a3a1e" opacity={0.3} />
      {/* ramas retorcidas */}
      {ramas.map((a, i) => {
        const L = 230 + rnd(sem + i) * 70;
        const ex = Math.sin(a) * L * 1.2, ey = -Math.cos(a) * L * 0.75 - 110;
        const mx = ex * 0.25 + (rnd(sem + i + 7) - 0.5) * 90, my = -120 - rnd(sem + i + 3) * 40;
        return (
          <g key={i}>
            <path d={`M${-10 + i * 4},-120 Q${mx},${my} ${ex},${ey}`} stroke="#4a2e1c" strokeWidth={30 - Math.abs(a) * 9} fill="none" strokeLinecap="round" />
            <path d={`M${-10 + i * 4},-120 Q${mx},${my} ${ex},${ey}`} stroke="#7a5236" strokeWidth={10 - Math.abs(a) * 3} fill="none" strokeLinecap="round" opacity={0.7} transform="translate(-5 -3)" />
          </g>
        );
      })}
      {/* tronco */}
      <path d="M-58,4 C-40,-30 -62,-70 -38,-120 C-28,-150 -10,-160 0,-160 C14,-160 34,-148 40,-118 C56,-72 40,-30 66,4 Z" fill="#5a3822" />
      <path d="M-20,0 C-10,-40 -26,-80 -10,-140" stroke="#3a2214" strokeWidth={6} fill="none" opacity={0.8} />
      <path d="M22,0 C30,-40 16,-70 24,-120" stroke="#8a6040" strokeWidth={5} fill="none" opacity={0.7} />
      {/* copa */}
      <g transform={`rotate(${sway} 0 -160)`}>
        {matas.map((m, j) => <circle key={`o${j}`} cx={m.x} cy={m.y + 18} r={m.r} fill="#243c1c" />)}
        {matas.map((m, j) => <circle key={`m${j}`} cx={m.x} cy={m.y} r={m.r * 0.92} fill={j % 4 === 0 ? '#34522a' : '#3d5e2c'} />)}
        {matas.filter((m) => m.y < -300).map((m, j) => <circle key={`l${j}`} cx={m.x - m.r * 0.25} cy={m.y - m.r * 0.3} r={m.r * 0.5} fill="#5f8438" opacity={0.8} />)}
        {matas.filter((_, j) => j % 2 === 0).map((m, j) => <circle key={`b${j}`} cx={m.x - m.r * 0.35} cy={m.y - m.r * 0.45} r={m.r * 0.18} fill="#a9c46a" opacity={0.7} />)}
        {Array.from({length: 18}).map((_, j) => {
          const th = rnd(sem * 5 + j + 40) * Math.PI * 2;
          const rr = Math.sqrt(rnd(sem * 3 + j + 50)) * 0.95;
          return <ellipse key={`f${j}`} cx={Math.cos(th) * rr * 320} cy={-290 + Math.sin(th) * rr * 120} rx={7} ry={9} fill={j % 3 ? '#cdb44a' : '#b08a34'} stroke="#6a5a1e" strokeWidth={1.5} />;
        })}
      </g>
    </g>
  );
};
/** altura de la copa (borde de arriba) en la x relativa de un árbol de escala 1 */
const topeCopa = (dx: number) => -300 - 120 * Math.sqrt(Math.max(0, 1 - (dx / 340) ** 2)) + 26;

/** Cabra de lado (mira a la derecha). come: baja la cabeza */
const Cabra: React.FC<{x: number; y: number; s?: number; color?: string; mancha?: string; flip?: boolean; come?: number}> = ({x, y, s = 1, color = '#f1ebe0', mancha = '#6a4a32', flip, come = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    {/* patas */}
    {[-42, -26, 30, 44].map((lx, i) => (
      <g key={i}>
        <path d={`M${lx},-58 L${lx + (i % 2 ? 3 : -3)},-24 L${lx + (i % 2 ? 1 : -1)},0`} stroke={i < 2 ? '#3a2a1e' : mancha} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x={lx - 6} y={-6} width={12} height={7} rx={2} fill="#1e140c" />
      </g>
    ))}
    {/* cuerpo */}
    <path d="M-72,-80 C-74,-108 -40,-118 0,-116 C40,-116 62,-108 66,-86 C70,-64 52,-50 20,-48 L-36,-48 C-62,-48 -72,-60 -72,-80 Z" fill={color} />
    <path d="M-40,-114 C-20,-100 -10,-70 -26,-50 L-36,-48 C-62,-48 -72,-60 -72,-80 C-74,-104 -56,-114 -40,-114 Z" fill={mancha} opacity={0.85} />
    <path d="M-72,-88 C-82,-100 -84,-110 -78,-116" stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" />
    {/* cuello y cabeza */}
    <g transform={`rotate(${come * 38} 52 -100)`}>
      <path d="M44,-104 C56,-122 66,-140 78,-150 L96,-134 C84,-122 72,-104 62,-86 Z" fill={color} />
      <path d="M74,-156 C86,-164 104,-160 116,-146 C124,-136 122,-126 112,-124 C100,-122 86,-128 76,-136 Z" fill={color} />
      <path d="M80,-156 C70,-176 52,-182 40,-176" stroke="#4a3a2a" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M86,-158 C80,-182 62,-192 48,-188" stroke="#5a4a36" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M78,-144 C66,-142 58,-136 54,-130 C64,-130 72,-134 80,-138 Z" fill={mancha} />
      <path d="M106,-126 L104,-108 L98,-124 Z" fill="#8a7a66" />
      <circle cx={98} cy={-146} r={3} fill="#1a120a" />
    </g>
  </g>
);

/** Cooperativa: casa de tapial, puerta azul abierta con luz cálida, cartel en árabe */
const Cooperativa: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={10} rx={460} ry={40} fill="#5a3a1e" opacity={0.25} />
    <rect x={-380} y={-400} width={760} height={400} fill="#c98b5a" />
    <rect x={-380} y={-400} width={260} height={400} fill="#000" opacity={0.08} />
    {Array.from({length: 40}).map((_, i) => (
      <ellipse key={i} cx={-360 + rnd(i) * 720} cy={-380 + rnd(i + 3) * 360} rx={8 + rnd(i + 5) * 22} ry={3 + rnd(i + 6) * 5} fill="#a86a3e" opacity={0.35} />
    ))}
    {Array.from({length: 13}).map((_, i) => <rect key={i} x={-376 + i * 60} y={-430} width={34} height={32} fill="#c98b5a" />)}
    <rect x={-390} y={-404} width={780} height={12} fill="#a86a3e" />
    {/* ventanas */}
    {[-260, 260].map((wx, i) => (
      <g key={i}>
        <rect x={wx - 40} y={-300} width={80} height={90} rx={6} fill="#3a2418" />
        <rect x={wx - 32} y={-292} width={64} height={74} fill="#ffcf8a" opacity={0.55 + 0.1 * Math.sin(f * 0.1 + i)} />
        {[-16, 0, 16].map((g) => <line key={g} x1={wx + g} y1={-292} x2={wx + g} y2={-218} stroke="#3a2418" strokeWidth={5} />)}
      </g>
    ))}
    {/* puerta abierta */}
    <path d="M-95,0 L-95,-190 A95,95 0 0 1 95,-190 L95,0 Z" fill="#ffd9a0" />
    <path d="M-95,0 L-95,-190 A95,95 0 0 1 95,-190 L95,0 Z" fill="url(#ar-puerta)" />
    <path d="M-95,0 L-95,-190 A95,95 0 0 1 0,-285 L0,0 Z" fill="#2f6f8f" transform="translate(-95 0) scale(0.32 1) translate(95 0)" />
    <path d="M-95,0 L-95,-190 A95,95 0 0 1 95,-190 L95,0" fill="none" stroke="#e6c79a" strokeWidth={14} />
    {/* cartel */}
    <rect x={-210} y={-370} width={420} height={70} rx={10} fill="#f6ead2" stroke="#7a4b33" strokeWidth={6} />
    <text x={0} y={-322} fill="#5a3422" fontFamily={amiri} fontWeight={700} fontSize={44} textAnchor="middle">
      تعاونية أركان
    </text>
    {/* frutos secándose en una manta */}
    <rect x={150} y={-14} width={210} height={26} rx={6} fill="#b84a3a" />
    {Array.from({length: 30}).map((_, i) => <ellipse key={i} cx={162 + rnd(i + 9) * 186} cy={-12 + rnd(i + 4) * 14} rx={7} ry={9} fill={i % 3 ? '#d6a840' : '#9a6a2a'} />)}
    <Silueta x={-330} y={0} s={0.62} tipo="mujer" color="#6a2f4a" />
  </g>
);

const ARBOLES: {x: number; y: number; s: number; sem: number}[] = [
  {x: 260, y: GY - 60, s: 0.5, sem: 1},
  {x: 760, y: GY - 30, s: 0.68, sem: 2},
  {x: 2140, y: GY - 50, s: 0.6, sem: 4},
  {x: 3660, y: GY - 55, s: 0.55, sem: 7},
  {x: 3950, y: GY - 30, s: 0.66, sem: 8},
  {x: 4980, y: GY - 45, s: 0.62, sem: 9},
  {x: 1500, y: GY, s: 1.0, sem: 3}, // el argán protagonista
  {x: 2700, y: GY + 10, s: 0.95, sem: 5}, // cabras A
  {x: 3220, y: GY - 5, s: 0.85, sem: 6}, // cabras B
];

const Campo: React.FC<{v: Vista; f: number; luz?: number}> = ({v, f, luz = 0}) => {
  const lejos = tfq(v, 0.35), medio = tfq(v, 0.65);
  const cielo = (
    <g>
      <defs>
        <linearGradient id="ar-cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f86c0" />
          <stop offset="0.45" stopColor="#9cc0d8" />
          <stop offset="0.75" stopColor="#f2d2a6" />
          <stop offset="1" stopColor="#f6c98e" />
        </linearGradient>
        <linearGradient id="ar-suelo" gradientUnits="userSpaceOnUse" x1="0" y1={GY - 40} x2="0" y2={GY + 900}>
          <stop offset="0" stopColor="#c99a62" />
          <stop offset="0.4" stopColor="#b07a48" />
          <stop offset="1" stopColor="#8a5a34" />
        </linearGradient>
        <radialGradient id="ar-puerta" cx="0.5" cy="0.7" r="0.7">
          <stop offset="0" stopColor="#fff1c8" />
          <stop offset="1" stopColor="#e8a050" />
        </radialGradient>
      </defs>
      <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="url(#ar-cielo)" />
    </g>
  );
  const sol = aPantalla(lejos, [3000, 420]);
  return (
    <g>
      {cielo}
      <Halo x={sol[0]} y={sol[1]} r={420} color="#fff0c8" o={0.7} />
      <circle cx={sol[0]} cy={sol[1]} r={70} fill="#fff6dc" opacity={0.9} />
      {/* montañas del Anti-Atlas (lejos) */}
      <g transform={tf(lejos)}>
        {[0, 1].map((k) => {
          let d = `M-3000,${GY}`;
          for (let x = -3000; x <= 9000; x += 80) d += ` L${x},${GY - 260 + k * 120 - 140 * Math.sin(x / (520 + k * 200) + k) - 70 * Math.sin(x / 190 + k * 3)}`;
          d += ` L9000,${GY + 200} L-3000,${GY + 200} Z`;
          return <path key={k} d={d} fill={k ? '#c99a86' : '#b79aa6'} opacity={k ? 0.95 : 0.85} />;
        })}
      </g>
      {/* lomas (medio) */}
      <g transform={tf(medio)}>
        {(() => {
          let d = `M-3000,${GY}`;
          for (let x = -3000; x <= 9000; x += 60) d += ` L${x},${GY - 70 - 50 * Math.sin(x / 400 + 1) - 22 * Math.sin(x / 130)}`;
          d += ` L9000,${GY + 300} L-3000,${GY + 300} Z`;
          return <path d={d} fill="#c9a074" />;
        })()}
        {Array.from({length: 26}).map((_, i) => {
          const x = -800 + i * 330 + rnd(i) * 120;
          return <Argan key={i} x={x} y={GY - 60 - 40 * Math.sin(x / 400 + 1)} s={0.22 + rnd(i + 2) * 0.08} sem={20 + i} f={f} />;
        })}
        <rect x={-3000} y={GY - 200} width={12000} height={300} fill="#f2d2a6" opacity={0.18} />
      </g>
      {/* suelo y árboles cercanos */}
      <g transform={tf(v)}>
        <path d={`M-3000,${GY - 20} ${Array.from({length: 120}).map((_, i) => `L${-3000 + i * 100},${GY - 20 - 14 * Math.sin(i * 0.7)}`).join(' ')} L9000,${GY + 3000} L-3000,${GY + 3000} Z`} fill="url(#ar-suelo)" />
        {Array.from({length: 140}).map((_, i) => (
          <ellipse key={i} cx={-1000 + rnd(i) * 7000} cy={GY + 10 + rnd(i + 1) * 700} rx={6 + rnd(i + 2) * 18} ry={3 + rnd(i + 3) * 7} fill={i % 2 ? '#8a5a34' : '#d8b07a'} opacity={0.6} />
        ))}
        {Array.from({length: 60}).map((_, i) => {
          const x = -600 + rnd(i + 30) * 6400, y = GY - 4 + rnd(i + 31) * 120;
          return <path key={i} d={`M${x - 14},${y} Q${x - 10},${y - 26} ${x - 2},${y - 32} M${x},${y} Q${x + 2},${y - 30} ${x + 10},${y - 36} M${x + 12},${y} Q${x + 14},${y - 22} ${x + 22},${y - 26}`} stroke="#8a8a3a" strokeWidth={3} fill="none" opacity={0.7} />;
        })}
        {ARBOLES.map((a, i) => <Argan key={i} {...a} f={f} />)}
        <Halo x={1500} y={GY - 300} r={500} color="#fff2c0" o={0.35 * luz} />
        {/* cabras subidas a los árboles */}
        {[
          {a: 7, dx: -170, s: 0.95, color: '#f1ebe0', mancha: '#6a4a32', flip: false, fase: 0},
          {a: 7, dx: 60, s: 0.9, color: '#3a2a20', mancha: '#1e140c', flip: true, fase: 1.3},
          {a: 7, dx: 230, s: 0.85, color: '#c89a6a', mancha: '#f1ebe0', flip: false, fase: 2.1},
          {a: 8, dx: -120, s: 0.9, color: '#f1ebe0', mancha: '#3a2a20', flip: true, fase: 0.7},
          {a: 8, dx: 140, s: 0.85, color: '#8a5a3a', mancha: '#f1ebe0', flip: false, fase: 2.6},
        ].map((g, i) => {
          const A = ARBOLES[g.a];
          const y = A.y + topeCopa(g.dx) * A.s;
          return <Cabra key={i} x={A.x + g.dx * A.s} y={y} s={g.s * A.s} color={g.color} mancha={g.mancha} flip={g.flip} come={0.5 + 0.5 * Math.sin(f * 0.12 + g.fase)} />;
        })}
        {/* una que sube por una rama y dos abajo */}
        <Cabra x={2700 - 120 + Math.min(40, f * 0.6)} y={GY - 200 - Math.min(40, f * 0.6) * 0.6} s={0.8} color="#e8e0d0" mancha="#7a5a3a" come={0} />
        <Cabra x={2950} y={GY + 40} s={0.85} color="#2e241c" mancha="#c89a6a" flip come={0.6 + 0.4 * Math.sin(f * 0.1)} />
        <Cabra x={3420} y={GY + 30} s={0.8} color="#f1ebe0" mancha="#8a5a3a" come={0.6 + 0.4 * Math.sin(f * 0.1 + 2)} />
        <Cooperativa x={4400} y={GY} f={f} />
      </g>
    </g>
  );
};

// ───────────────────────── CASA (la cooperativa por dentro) ─────────────────────────
const SUELO = 1250;
const RHA: Pt = [1040, 1190];
const MARCO: Pt = [1720, 430];

/** Mujer sentada en el suelo, de lado (mira a la derecha). mano: dónde está la mano (relativa) */
const Sentada: React.FC<{x: number; y: number; s?: number; ropa: string; panuelo: string; mano: Pt; mano2?: Pt}> = ({x, y, s = 1, ropa, panuelo, mano, mano2}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={20} cy={4} rx={170} ry={22} fill="#000" opacity={0.25} />
    {mano2 && <path d={`M10,-215 Q${(10 + mano2[0]) / 2 - 10},${(mano2[1] - 215) / 2 + 40} ${mano2[0]},${mano2[1]}`} stroke="#5a2a3e" strokeWidth={32} fill="none" strokeLinecap="round" opacity={0.9} />}
    {mano2 && <circle cx={mano2[0]} cy={mano2[1]} r={15} fill="#b57a58" />}
    <path d="M-128,0 C-134,-90 -104,-180 -66,-228 C-44,-258 28,-260 44,-226 C66,-178 84,-120 156,-46 C170,-26 160,0 136,0 Z" fill={ropa} />
    <path d="M-128,0 C-134,-90 -104,-180 -66,-228 C-60,-150 -70,-60 -40,0 Z" fill="#000" opacity={0.18} />
    <path d="M30,-60 C80,-70 130,-60 156,-46" stroke="#000" strokeWidth={5} fill="none" opacity={0.15} />
    {/* cabeza con pañuelo */}
    <path d="M14,-322 C40,-326 60,-306 60,-282 C60,-258 44,-242 24,-242 C10,-242 2,-256 2,-278 Z" fill="#c48a64" />
    <path d="M44,-286 C52,-284 58,-280 60,-274" stroke="#a8704e" strokeWidth={3} fill="none" />
    <path d="M-52,-232 C-70,-282 -54,-344 -4,-352 C34,-356 58,-338 62,-308 C44,-318 26,-322 12,-318 C0,-296 2,-262 26,-238 C4,-224 -30,-222 -52,-232 Z" fill={panuelo} />
    <path d="M-52,-232 C-70,-282 -54,-344 -4,-352 C-30,-322 -38,-272 -16,-226 Z" fill="#000" opacity={0.14} />
    <path d="M12,-318 C0,-296 2,-262 26,-238" stroke="#000" strokeWidth={4} fill="none" opacity={0.15} />
    <path d={`M24,-218 Q${(24 + mano[0]) / 2 + 10},${(mano[1] - 218) / 2 + 50} ${mano[0]},${mano[1]}`} stroke={ropa} strokeWidth={34} fill="none" strokeLinecap="round" />
    <circle cx={mano[0]} cy={mano[1]} r={16} fill="#c48a64" />
  </g>
);

/** Rha: molino de piedra; la de arriba gira con su mango de madera */
const Rha: React.FC<{x: number; y: number; a: number}> = ({x, y, a}) => {
  const hx = Math.cos(a) * 100, hy = Math.sin(a) * 26;
  const delante = Math.sin(a) > 0;
  const mango = (
    <g>
      <line x1={hx} y1={-70 + hy} x2={hx} y2={-170 + hy} stroke="#5a3822" strokeWidth={16} strokeLinecap="round" />
      <line x1={hx - 3} y1={-74 + hy} x2={hx - 3} y2={-166 + hy} stroke="#8a6040" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={60} rx={200} ry={40} fill="#000" opacity={0.3} />
      {/* piedra de abajo con su canal */}
      <path d="M-170,0 L-170,40 A170,44 0 0 0 170,40 L170,0 Z" fill="#7a7068" />
      <ellipse cx={0} cy={0} rx={170} ry={44} fill="#968a80" />
      <path d="M150,20 L240,46 L236,66 L146,44 Z" fill="#7a7068" />
      <path d="M150,24 C190,36 220,46 238,56" stroke="#4a2a18" strokeWidth={12} fill="none" strokeLinecap="round" />
      {/* piedra de arriba */}
      {!delante && mango}
      <path d="M-130,-30 L-130,-70 A130,34 0 0 1 130,-70 L130,-30 A130,34 0 0 1 -130,-30 Z" fill="#8a7e74" />
      <ellipse cx={0} cy={-70} rx={130} ry={34} fill="#a89c90" />
      <ellipse cx={0} cy={-70} rx={22} ry={8} fill="#4a2a18" />
      {Array.from({length: 12}).map((_, i) => <circle key={i} cx={-110 + rnd(i) * 220} cy={-40 + rnd(i + 2) * 14} r={2 + rnd(i + 4) * 3} fill="#5a5048" opacity={0.6} />)}
      {/* la pasta marrón que sale entre las piedras */}
      <path d="M-120,-4 C-60,8 60,8 130,-6" stroke="#4a2a18" strokeWidth={10} fill="none" opacity={0.9} />
      {delante && mango}
    </g>
  );
};

/** Cuenco de barro con aceite dorado */
const Cuenco: React.FC<{x: number; y: number; s?: number; f: number; lleno?: number}> = ({x, y, s = 1, f, lleno = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={44} rx={110} ry={16} fill="#000" opacity={0.3} />
    <path d="M-100,0 C-96,40 -60,56 0,56 C60,56 96,40 100,0 Z" fill="#a8582e" />
    <path d="M-100,0 C-96,40 -60,56 0,56 C-40,40 -70,20 -76,0 Z" fill="#000" opacity={0.18} />
    <ellipse cx={0} cy={0} rx={100} ry={24} fill="#c86a38" />
    <ellipse cx={0} cy={4} rx={86} ry={18} fill="#e8a83a" opacity={lleno} />
    <ellipse cx={-26} cy={0} rx={30} ry={5} fill="#fff2b0" opacity={0.7 * lleno * (0.7 + 0.3 * Math.sin(f * 0.1))} />
  </g>
);

/** Cesta de frutos de argán */
const Cesta: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={140} ry={18} fill="#000" opacity={0.3} />
    {Array.from({length: 34}).map((_, i) => (
      <ellipse key={i} cx={-100 + rnd(i + 60) * 200} cy={-120 - rnd(i + 61) * 50 * Math.sin(Math.PI * (0.15 + rnd(i + 60) * 0.7))} rx={14} ry={18} fill={i % 3 ? '#d6a840' : '#9a6a2a'} stroke="#6a4a1a" strokeWidth={2} />
    ))}
    <path d="M-130,-110 L-110,0 L110,0 L130,-110 Z" fill="#b8884a" />
    {Array.from({length: 6}).map((_, i) => <line key={i} x1={-128 + i * 2} y1={-100 + i * 18} x2={128 - i * 2} y2={-100 + i * 18} stroke="#7a5a2a" strokeWidth={5} />)}
    {Array.from({length: 9}).map((_, i) => <line key={`v${i}`} x1={-120 + i * 30} y1={-110} x2={-104 + i * 26} y2={0} stroke="#8a6a32" strokeWidth={3} />)}
  </g>
);

/** Botella de aceite de argán */
const Botella: React.FC<{x: number; y: number; s?: number; brillo?: number}> = ({x, y, s = 1, brillo = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Halo x={0} y={-90} r={170} color="#ffd270" o={0.7 * brillo} />
    <ellipse cx={0} cy={4} rx={56} ry={10} fill="#000" opacity={0.3} />
    <path d="M-48,0 L-48,-120 C-48,-150 -20,-160 -16,-190 L-16,-226 L16,-226 L16,-190 C20,-160 48,-150 48,-120 L48,0 Z" fill="#e8a628" />
    <path d="M-48,0 L-48,-120 C-48,-150 -20,-160 -16,-190 L-16,-226 L-4,-226 L-4,-190 C-8,-160 -30,-150 -30,-120 L-30,0 Z" fill="#fff0b0" opacity={0.35} />
    <rect x={-20} y={-252} width={40} height={30} rx={5} fill="#5a3822" />
    <rect x={-40} y={-100} width={80} height={56} rx={6} fill="#f6ead2" />
    <text x={0} y={-62} fill="#5a3422" fontFamily={amiri} fontWeight={700} fontSize={30} textAnchor="middle">
      أركان
    </text>
  </g>
);

const Casa: React.FC<{v: Vista; f: number; marco?: number}> = ({v, f, marco = 0}) => {
  const golpe = Math.abs(Math.sin(f * 0.22));
  const a = f * 0.09;
  const mango: Pt = [RHA[0] + Math.cos(a) * 100, RHA[1] - 170 + Math.sin(a) * 26];
  const gota = (f % 24) / 24;
  return (
    <g transform={tf(v)}>
      <defs>
        <linearGradient id="ar-pared" gradientUnits="userSpaceOnUse" x1="0" y1="-900" x2="0" y2={SUELO}>
          <stop offset="0" stopColor="#6a3e28" />
          <stop offset="0.5" stopColor="#a8683e" />
          <stop offset="1" stopColor="#c48450" />
        </linearGradient>
        <linearGradient id="ar-rayo" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#fff2c8" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff2c8" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-6000} y={-6000} width={14000} height={SUELO + 6000} fill="url(#ar-pared)" />
      {Array.from({length: 50}).map((_, i) => (
        <ellipse key={i} cx={-800 + rnd(i) * 4000} cy={-500 + rnd(i + 1) * 1600} rx={30 + rnd(i + 2) * 60} ry={10 + rnd(i + 3) * 18} fill="#7a4a2a" opacity={0.18} />
      ))}
      <rect x={-6000} y={SUELO - 60} width={14000} height={60} fill="#7a4428" />
      <rect x={-6000} y={SUELO} width={14000} height={7000} fill="#5a3420" />
      {/* alfombra */}
      <rect x={520} y={SUELO + 10} width={1400} height={260} fill="#9a2e2a" />
      <rect x={540} y={SUELO + 26} width={1360} height={228} fill="none" stroke="#e6b45a" strokeWidth={8} />
      {Array.from({length: 14}).map((_, i) => (
        <polygon key={i} points={`${600 + i * 95},${SUELO + 140} ${640 + i * 95},${SUELO + 90} ${680 + i * 95},${SUELO + 140} ${640 + i * 95},${SUELO + 190}`} fill={i % 2 ? '#1d3e5e' : '#e6b45a'} opacity={0.85} />
      ))}
      {/* ventana con rayo de luz */}
      <rect x={180} y={180} width={240} height={320} rx={120} fill="#3a2214" />
      <rect x={196} y={196} width={208} height={290} rx={104} fill="#ffe7b0" />
      {[260, 340].map((g) => <line key={g} x1={g} y1={200} x2={g} y2={486} stroke="#3a2214" strokeWidth={8} />)}
      <line x1={196} y1={340} x2={404} y2={340} stroke="#3a2214" strokeWidth={8} />
      <polygon points={`200,300 404,360 1400,${SUELO + 200} 700,${SUELO + 260}`} fill="url(#ar-rayo)" />
      {Array.from({length: 26}).map((_, i) => {
        const t = (rnd(i) + f * 0.002 * (1 + rnd(i + 1))) % 1;
        return <circle key={i} cx={mix(300, 1100, t) + rnd(i + 2) * 200} cy={mix(380, SUELO, t) - rnd(i + 3) * 200} r={2 + rnd(i + 4) * 3} fill="#fff2c8" opacity={0.5} />;
      })}
      {/* estante con botellas */}
      <rect x={2050} y={700} width={420} height={20} fill="#5a3822" />
      {[2110, 2200, 2290, 2380].map((bx, i) => <Botella key={i} x={bx} y={700} s={0.42} brillo={0.3} />)}
      {/* el diploma de la UNESCO */}
      <g transform={`translate(${MARCO[0]} ${MARCO[1]})`}>
        <Halo x={0} y={0} r={360} color="#ffe2a0" o={0.6 * marco} />
        <rect x={-170} y={-130} width={340} height={260} fill="#5a3822" />
        <rect x={-150} y={-110} width={300} height={220} fill="#f6ead2" />
        <text x={0} y={-50} fill="#2a4a7a" fontFamily={sans} fontWeight={800} fontSize={40} textAnchor="middle">
          UNESCO
        </text>
        <line x1={-100} y1={-24} x2={100} y2={-24} stroke="#c9a36a" strokeWidth={3} />
        <text x={0} y={18} fill="#5a3422" fontFamily={serif} fontSize={26} textAnchor="middle">
          Patrimonio
        </text>
        <text x={0} y={50} fill="#5a3422" fontFamily={serif} fontSize={26} textAnchor="middle">
          de la Humanidad
        </text>
        <text x={0} y={90} fill="#a8762e" fontFamily={sans} fontWeight={800} fontSize={26} textAnchor="middle">
          2014
        </text>
        <circle cx={110} cy={80} r={22} fill="#c8423a" />
      </g>
      {/* la mujer de la rha */}
      <Cuenco x={RHA[0] + 300} y={RHA[1] + 80} s={0.9} f={f} />
      {/* gota de aceite del canal al cuenco */}
      <ellipse cx={RHA[0] + 280} cy={RHA[1] + 66 + gota * 40} rx={7} ry={10} fill="#f2b630" opacity={1 - gota} />
      <Rha x={RHA[0]} y={RHA[1]} a={a} />
      <Sentada x={RHA[0] - 280} y={SUELO + 40} s={1.25} ropa="#7a2f52" panuelo="#efe3cf" mano={[(mango[0] - (RHA[0] - 280)) / 1.25, (mango[1] - (SUELO + 40)) / 1.25 - 60]} />
      {/* la mujer que parte los frutos con una piedra */}
      <rect x={1560} y={SUELO - 30} width={130} height={40} rx={14} fill="#8a8078" />
      <ellipse cx={1625} cy={SUELO - 36} rx={13} ry={17} fill="#9a6a2a" />
      {golpe < 0.15 && Array.from({length: 5}).map((_, i) => <circle key={i} cx={1625 + (rnd(i + Math.floor(f / 14)) - 0.5) * 70} cy={SUELO - 50 - rnd(i + 3) * 30} r={4} fill="#6a4a1a" />)}
      <Sentada x={1420} y={SUELO + 40} s={1.2} ropa="#2f5e78" panuelo="#e8c07a" mano={[(1625 - 1420) / 1.2, (SUELO - 60 - golpe * 120 - (SUELO + 40)) / 1.2]} />
      <ellipse cx={1625} cy={SUELO - 70 - golpe * 120} rx={28} ry={18} fill="#6a625a" />
      <Cesta x={1900} y={SUELO + 30} s={0.9} />
    </g>
  );
};

// ───────────────────────── superposiciones (en pantalla) ─────────────────────────
const Pastilla: React.FC<{x: number; y: number; texto: string; e: number; color?: string; dy?: number; grande?: boolean}> = ({x, y, texto, e, color = '#ffcf5a', dy = -64, grande}) => {
  if (e <= 0) return null;
  const fs = grande ? 42 : 34;
  const w = texto.length * fs * 0.6 + 64;
  return (
    <g transform={`translate(${x} ${y + dy}) scale(${0.7 + 0.3 * e})`} opacity={e}>
      <line x1={0} y1={fs * 0.7} x2={0} y2={-dy - 16} stroke="#fff" strokeWidth={2} opacity={0.8} />
      <circle cx={0} cy={-dy} r={9} fill={color} stroke="#fff" strokeWidth={3} />
      <rect x={-w / 2} y={-fs * 0.85} width={w} height={fs * 1.6} rx={fs * 0.8} fill="#1e140e" opacity={0.88} />
      <rect x={-w / 2} y={-fs * 0.85} width={w} height={fs * 1.6} rx={fs * 0.8} fill="none" stroke={color} strokeWidth={2.5} opacity={0.9} />
      <circle cx={-w / 2 + 28} cy={-fs * 0.05} r={8} fill={color} />
      <text x={12} y={fs * 0.3} fill="#fff" fontFamily={sans} fontWeight={800} fontSize={fs} textAnchor="middle">
        {texto}
      </text>
    </g>
  );
};
const Tarjeta: React.FC<{y: number; e: number; titulo: string; sub?: string}> = ({y, e, titulo, sub}) => {
  if (e <= 0) return null;
  return (
    <g opacity={e} transform={`translate(0 ${(1 - e) * -30})`}>
      <rect x={110} y={y} width={860} height={sub ? 170 : 110} rx={40} fill="#1e140e" opacity={0.88} />
      <rect x={110} y={y} width={860} height={sub ? 170 : 110} rx={40} fill="none" stroke="#ffcf5a" strokeWidth={3} />
      <text x={W / 2} y={y + 74} fill="#fff6e6" fontFamily={serif} fontSize={56} textAnchor="middle">
        {titulo}
      </text>
      {sub && (
        <text x={W / 2} y={y + 135} fill="#ffcf5a" fontFamily={sans} fontWeight={800} fontSize={38} textAnchor="middle">
          {sub}
        </text>
      )}
    </g>
  );
};

/** Ruta del aceite (pantalla) */
const Ruta: React.FC<{v: Vista; pts: Pt[]; t: number}> = ({v, pts, t}) => {
  if (t <= 0) return null;
  const n = Math.max(2, Math.ceil(pts.length * t));
  const d = pts.slice(0, n).map((q, i) => {
    const [x, y] = aPantalla(v, q);
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <g>
      <path d={d} stroke="#ffcf5a" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.25} filter="url(#difusoS)" />
      <path d={d} stroke="#ffcf5a" strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray="2 16" />
    </g>
  );
};

// ───────────────────────── fábrica de escenas ─────────────────────────
type Capas = {mapa?: [Vista, number]; campo?: [Vista, number]; casa?: [Vista, number]};
type Ctx = {f: number; tl: number; t: number; d: number; c: Capas};
type Def = {capas: (t: number, tl: number) => Capas; encima?: (c: Ctx) => React.ReactNode; luz?: (t: number) => number; marco?: (t: number) => number};
const semillaDe = (nombre: string) => [...`${ID}/${nombre}`].reduce((a, ch) => a + ch.charCodeAt(0), 0);

const escena = (nombre: string, def: Def): React.FC<{f: number; d: number}> => {
  const sem = semillaDe(nombre);
  return ({f, d}) => {
    const L = nombre === 'cta' ? d : Math.max(1, d - 12);
    const t = Math.min(1, f / L);
    const tl = f / S;
    const c = def.capas(t, tl);
    const cam = encuadre(f, d, sem, {x: FX, y: FY});
    const comp = `translate(${cam.x} ${cam.y}) scale(${1 / cam.s}) translate(${-FX} ${-FY})`;
    const abs = f + sem * 3; // las animaciones (cabras, rha) no se reinician de golpe entre escenas
    const zCampo = c.campo?.[0].z ?? 1;
    return (
      <Lienzo>
        <Capa z={0}>
          <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="#2a7896" />
          <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="#123e5a" opacity={0.35} />
        </Capa>
        <Capa z={0.5}>
          <g transform={comp}>
            {c.mapa && c.mapa[1] > 0 && (
              <g opacity={c.mapa[1]}>
                <Mapa v={c.mapa[0]} />
              </g>
            )}
            {c.campo && c.campo[1] > 0 && (
              <g opacity={c.campo[1]}>
                <Campo v={c.campo[0]} f={abs} luz={def.luz?.(t) ?? 0} />
              </g>
            )}
            {c.casa && c.casa[1] > 0 && (
              <g opacity={c.casa[1]}>
                <Casa v={c.casa[0]} f={abs} marco={def.marco?.(t) ?? 0} />
              </g>
            )}
            {def.encima?.({f, tl, t, d, c})}
          </g>
        </Capa>
        <Capa z={1}>
          <g transform={comp}>
            {/* hojitas y polvo dorado de primer plano */}
            {(c.campo?.[1] ?? 0) + (c.casa?.[1] ?? 0) > 0 &&
              Array.from({length: 12}).map((_, i) => {
                const x = ((rnd(i) * (W + 400) + f * (0.8 + rnd(i + 2))) % (W + 400)) - 200;
                const y = 200 + rnd(i + 1) * 1300 + Math.sin(f * 0.05 + i) * 30;
                const o = Math.max(c.campo?.[1] ?? 0, c.casa?.[1] ?? 0) * 0.6 * Math.min(1, zCampo);
                return i % 2 ? (
                  <ellipse key={i} cx={x} cy={y} rx={9} ry={4} fill="#6f9440" opacity={o} transform={`rotate(${f * 2 + i * 40} ${x} ${y})`} />
                ) : (
                  <circle key={i} cx={x} cy={y} r={3 + rnd(i + 5) * 3} fill="#ffe7a8" opacity={o * 0.8} />
                );
              })}
          </g>
        </Capa>
      </Lienzo>
    );
  };
};

// vistas encadenadas
const C_ARBOL_A: Vista = {c: [1500, 900], z: 1.3};
const C_ARBOL_B: Vista = {c: [1500, 880], z: 0.95};
const C_ARBOL_LEJOS: Vista = {c: [1500, 820], z: 0.32};
const M_CERCA_ARBOL: Vista = {c: M_ARBOL, z: 14};
const M_SUS: Vista = {c: [470, 2430], z: 2.1};
const M_CERCA_CABRAS: Vista = {c: M_CABRAS, z: 14};
const C_CABRAS_LEJOS: Vista = {c: [2960, 830], z: 0.45};
const C_CABRAS: Vista = {c: [2960, 880], z: 1.05};
const C_PUERTA: Vista = {c: DOOR, z: 7};
const K_LEJOS: Vista = {c: [1180, 860], z: 0.32};
const K_TODO: Vista = {c: [1180, 900], z: 0.78};
const K_RHA: Vista = {c: [RHA[0] + 40, RHA[1] - 60], z: 1.75};
const K_MARCO: Vista = {c: [MARCO[0], MARCO[1] - 50], z: 1.3};
const K_MARCO_LEJOS: Vista = {c: [MARCO[0], MARCO[1] - 50], z: 0.45};
const M_CERCA_COOP: Vista = {c: M_COOP, z: 16};
const M_EUROPA: Vista = {c: [990, 1320], z: 0.4};
const M_FINAL: Vista = {c: [1000, 1300], z: 0.44};

// 1 · arbol: un argán solo, al sol de la tarde
const Arbol = escena('arbol', {
  capas: (t) => ({campo: [vmix(C_ARBOL_A, C_ARBOL_B, easeIO(t)), 1]}),
  luz: (t) => ease(p(t, 0.2, 0.5)),
  encima: ({c, tl}) => {
    const v = c.campo![0];
    const [x, y] = aPantalla(v, [1500, GY - 430]);
    return <Pastilla x={x} y={y} texto="Argán · أركان" e={ease(p(tl, 1.2, 0.5))} dy={-80} grande />;
  },
});

// 2 · mapa: subimos al cielo y aparece dónde está: el Sus, entre Agadir y Esauira
const MapaE = escena('mapa', {
  capas: (t) => ({
    campo: [vmix(C_ARBOL_B, C_ARBOL_LEJOS, easeIO(p(t, 0, 0.3))), 1 - p(t, 0.1, 0.12)],
    mapa: [vmix(M_CERCA_ARBOL, M_SUS, easeIO(t)), p(t, 0.1, 0.12)],
  }),
  luz: () => 1,
  encima: ({c, t}) => {
    const v = c.mapa![0];
    const [zx, zy] = aPantalla(v, [440, 2470]);
    const ag = aPantalla(v, CI.agadir), es = aPantalla(v, CI.essaouira);
    return (
      <>
        <Pastilla x={zx + 120} y={zy} texto="Bosque de arganes" e={ease(p(t, 0.45, 0.2))} color="#9ccf6a" dy={-90} />
        <Pastilla x={ag[0]} y={ag[1]} texto="Agadir" e={ease(p(t, 0.6, 0.15))} dy={-70} />
        <Pastilla x={es[0]} y={es[1]} texto="Esauira" e={ease(p(t, 0.72, 0.15))} dy={-70} />
      </>
    );
  },
});

// 3 · maaz: bajamos otra vez al bosque… y hay cabras subidas a los árboles
const Maaz = escena('maaz', {
  capas: (t) => ({
    mapa: [vmix(M_SUS, M_CERCA_CABRAS, easeIO(p(t, 0, 0.36))), 1 - p(t, 0.2, 0.16)],
    campo: [vmix(C_CABRAS_LEJOS, C_CABRAS, ease(p(t, 0.2, 0.8))), p(t, 0.2, 0.16)],
  }),
  encima: ({c, t}) => {
    const v = c.mapa![0];
    const ag = aPantalla(v, CI.agadir), es = aPantalla(v, CI.essaouira);
    const o = 1 - p(t, 0, 0.2);
    return (
      <>
        <Pastilla x={ag[0]} y={ag[1]} texto="Agadir" e={o} dy={-70} />
        <Pastilla x={es[0]} y={es[1]} texto="Esauira" e={o} dy={-70} />
      </>
    );
  },
});

// 4 · mra: la cámara va hasta la cooperativa y entra por la puerta: las mujeres trabajando
const Mra = escena('mra', {
  capas: (t) => ({
    campo: [vmix(C_CABRAS, C_PUERTA, easeIO(p(t, 0, 0.55))), 1 - p(t, 0.42, 0.14)],
    casa: [vmix(K_LEJOS, K_TODO, easeIO(p(t, 0.42, 0.58))), p(t, 0.42, 0.14)],
  }),
  encima: ({c, t}) => {
    if (!c.casa || c.casa[1] <= 0) return null;
    const v = c.casa[0];
    const [x, y] = aPantalla(v, [1180, 700]);
    return <Pastilla x={x} y={y} texto="Cooperativa de mujeres" e={ease(p(t, 0.62, 0.15))} color="#e79a8f" dy={-40} />;
  },
});

// 5 · rha: de cerca, el molino de piedra gira y sale el aceite
const RhaE = escena('rha', {
  capas: (t) => ({casa: [vmix(K_TODO, K_RHA, easeIO(t)), 1]}),
});

// 6 · unesco: la cámara sube a la pared: el diploma
const Unesco = escena('unesco', {
  capas: (t) => ({casa: [vmix(K_RHA, K_MARCO, easeIO(p(t, 0, 0.62))), 1]}),
  marco: (t) => ease(p(t, 0.35, 0.3)),
  encima: ({t}) => <Tarjeta y={180} e={ease(p(t, 0.55, 0.15))} titulo="Patrimonio de la Humanidad" sub="UNESCO · 2014" />,
});

// 7 · oro: salimos de la casa hasta ver Europa; el aceite viaja y brilla como el oro
const DESTINOS: [string, string][] = [['madrid', 'Madrid'], ['paris', 'París'], ['bruselas', 'Bruselas']];
const Oro = escena('oro', {
  capas: (t) => ({
    casa: [vmix(K_MARCO, K_MARCO_LEJOS, easeIO(p(t, 0, 0.3))), 1 - p(t, 0.05, 0.22)],
    mapa: [vmix(M_CERCA_COOP, M_EUROPA, easeIO(p(t, 0, 0.75))), p(t, 0.05, 0.22)],
  }),
  encima: ({c, t}) => {
    const v = c.mapa![0];
    return (
      <>
        {DESTINOS.map(([k], i) => <Ruta key={k} v={v} pts={RUTAS[k]} t={ease(p(t, 0.45 + i * 0.08, 0.35))} />)}
        {DESTINOS.map(([k, nombre], i) => {
          const e = ease(p(t, 0.72 + i * 0.07, 0.15));
          const [x, y] = aPantalla(v, CI[k]);
          return (
            <g key={k}>
              {e > 0 && <Botella x={x} y={y + 20} s={0.45 * e} />}
              <Pastilla x={x} y={y} texto={nombre} e={e} dy={-150} />
            </g>
          );
        })}
      </>
    );
  },
});

// 8 · cta: Europa con las botellas y la pregunta
const OPCIONES = ['En la comida', 'En el pelo', '¡Las dos cosas!'];
const Cta = escena('cta', {
  capas: (t) => ({mapa: [vmix(M_EUROPA, M_FINAL, easeIO(t)), 1]}),
  encima: ({c, tl}) => {
    const v = c.mapa![0];
    return (
      <>
        {DESTINOS.map(([k]) => <Ruta key={k} v={v} pts={RUTAS[k]} t={1} />)}
        {DESTINOS.map(([k, nombre]) => {
          const [x, y] = aPantalla(v, CI[k]);
          return (
            <g key={k} opacity={1 - ease(p(tl, 0.2, 0.5)) * 0.6}>
              <Botella x={x} y={y + 20} s={0.45} />
              <Pastilla x={x} y={y} texto={nombre} e={1} dy={-150} />
            </g>
          );
        })}
        <g opacity={ease(p(tl, 0.1, 0.5))}>
          <rect x={110} y={250} width={860} height={110} rx={55} fill="#1e140e" opacity={0.9} />
          <text x={W / 2} y={322} fill="#fff6e6" fontFamily={serif} fontSize={54} textAnchor="middle">
            ¿Cómo lo usáis en casa?
          </text>
        </g>
        {OPCIONES.map((o, i) => {
          const e = ease(p(tl, 1.2 + i * 0.45, 0.4));
          const y = 450 + i * 130;
          return (
            <g key={i} opacity={e} transform={`translate(${(1 - e) * 60} ${y})`}>
              <rect x={110} y={-48} width={860} height={100} rx={50} fill="#1e140e" opacity={0.92} />
              <rect x={110} y={-48} width={860} height={100} rx={50} fill="none" stroke="#ffcf5a" strokeWidth={2.5} />
              <circle cx={168} cy={2} r={30} fill="#ffcf5a" />
              <text x={168} y={15} fill="#1e140e" fontFamily={sans} fontWeight={800} fontSize={34} textAnchor="middle">
                {i + 1}
              </text>
              <text x={220} y={15} fill="#fff" fontFamily={sans} fontWeight={800} fontSize={38}>
                {o}
              </text>
            </g>
          );
        })}
      </>
    );
  },
});

export const ARGAN: Record<string, React.FC<{f: number; d: number; k: number; opts: string[]}>> = {
  [`${ID}/arbol`]: Arbol,
  [`${ID}/mapa`]: MapaE,
  [`${ID}/maaz`]: Maaz,
  [`${ID}/mra`]: Mra,
  [`${ID}/rha`]: RhaE,
  [`${ID}/unesco`]: Unesco,
  [`${ID}/oro`]: Oro,
  [`${ID}/cta`]: Cta,
};

export const FOCOS_ARGAN: Record<string, FocoEscena> = Object.fromEntries(Object.keys(ARGAN).map((k) => [k, {x: FX, y: FY}]));
