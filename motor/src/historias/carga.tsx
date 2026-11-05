// «No toda paciencia es virtud» (hadiz: «no conviene al creyente humillarse a sí mismo: cargar con una prueba que no puede soportar»)
// UN SOLO MUNDO 2D CONTINUO: un camino de montaña al atardecer. Una silueta sin cara sube con una carga que no para de crecer;
// la cámara la acompaña. Al final suelta la carga, amanece y descansa bajo un árbol.
// Todas las escenas dibujan el MISMO mundo; cada una solo cambia la vista de cámara y termina donde empieza la siguiente.
import React from 'react';
import {H, W, amiri, sans} from '../tema';
import {Halo, Lienzo, ease, easeIO, rnd} from '../dibujos/base';
import {Capa, encuadre} from '../dibujos/camara2d';
import type {FocoEscena} from '../dibujos/camara2d';
import {CREMA, FX, FY, GY, Montanas, ORO, ORO2, Plano, Pueblo, Cielo, mezclaColor, mix, p, vmix} from './tiempo';
import type {Vista} from './tiempo';

const ID = 'carga';
const SIL = '#140f26';
const sm = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
/** Altura del camino en x: sube poco a poco con ondulaciones */
const pathY = (x: number) => GY - 760 * sm((x - 200) / 5400) + 26 * Math.sin(x / 310);
const pendiente = (x: number) => (pathY(x + 12) - pathY(x - 12)) / 24;

const X_SUELTA = 3900; // donde deja la carga
const X_ARBOL = 5750;

// piedras de la carga (posición en la pila, tamaño)
const PIEDRAS = Array.from({length: 10}).map((_, i) => ({
  ox: ((i % 3) - 1) * 46 + (rnd(i + 3) - 0.5) * 16,
  oy: -88 - Math.floor(i / 3) * 34 - (i % 3 === 1 ? 14 : 0) - rnd(i + 7) * 8,
  s: 34 + rnd(i + 1) * 26,
  rot: rnd(i + 9) * 60 - 30,
  col: ['#6a6488', '#7a7498', '#5a5478', '#847ea0'][i % 4],
}));

const Piedra: React.FC<{x: number; y: number; s: number; rot: number; col: string}> = ({x, y, s, rot, col}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={`M${-s},${s * 0.5} L${-s * 0.8},${-s * 0.5} L${-s * 0.1},${-s * 0.85} L${s * 0.8},${-s * 0.5} L${s},${s * 0.45} Z`} fill={col} stroke="#2a2646" strokeWidth={4} strokeLinejoin="round" />
    <path d={`M${-s * 0.8},${-s * 0.5} L${-s * 0.1},${-s * 0.85} L${s * 0.2},${-s * 0.1} Z`} fill="#fff" opacity={0.12} />
  </g>
);

type Pose = 'camina' | 'parado' | 'sentado';

/** La silueta (sin cara) con su carga. Coordenadas locales: pies en (0,0), mira a la derecha */
const Figura: React.FC<{f: number; carga: number; pose: Pose; soltar: number}> = ({f, carga, pose, soltar}) => {
  const lean = pose === 'sentado' ? 4 : 6 + 30 * carga * (1 - soltar);
  const paso = pose === 'camina' ? Math.sin(f * 0.22 * (1 - 0.45 * carga)) : 0;
  const amp = 26 * (1 - 0.4 * carga);
  const cadera: [number, number] = pose === 'sentado' ? [0, -36] : [0, -122 + Math.abs(paso) * 4];
  const pie = (ang: number): [number, number] => [cadera[0] + 122 * Math.sin((ang * Math.PI) / 180), cadera[1] + 122 * Math.cos((ang * Math.PI) / 180)];
  const k = 0.9 + carga * 0.5;
  const n = Math.min(PIEDRAS.length, Math.floor(carga * 9.5));
  const cargado = soltar < 0.45;
  return (
    <g>
      <ellipse cx={0} cy={4} rx={80} ry={10} fill="#000" opacity={0.35} />
      {/* piernas */}
      {pose === 'sentado' ? (
        <path d={`M${cadera[0]},${cadera[1]} L74,-74 L132,-8`} stroke={SIL} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ) : (
        <>
          <line x1={cadera[0]} y1={cadera[1]} x2={pie(-paso * amp)[0]} y2={Math.min(0, pie(-paso * amp)[1])} stroke="#0c0818" strokeWidth={21} strokeLinecap="round" />
          <line x1={cadera[0]} y1={cadera[1]} x2={pie(paso * amp)[0]} y2={Math.min(0, pie(paso * amp)[1])} stroke={SIL} strokeWidth={21} strokeLinecap="round" />
        </>
      )}
      {/* tronco, cabeza, brazos y carga: giran juntos con la inclinación */}
      <g transform={`translate(${cadera[0]} ${cadera[1]}) rotate(${lean})`}>
        {cargado && (
          <g transform={`translate(-66 -62) scale(${k})`}>
            <path d="M-56,-10 C-90,-60 -78,-130 -30,-150 C20,-166 70,-150 78,-96 C86,-44 60,0 14,6 C-14,10 -40,6 -56,-10 Z" fill="#8a6a46" stroke="#4a3622" strokeWidth={5} />
            <path d="M-30,-150 C-6,-168 40,-160 62,-132" stroke="#4a3622" strokeWidth={5} fill="none" />
            <line x1={-20} y1={-40} x2={44} y2={-96} stroke="#4a3622" strokeWidth={4} opacity={0.6} />
            {PIEDRAS.slice(0, n).map((q, i) => (
              <Piedra key={i} x={q.ox * 0.7} y={q.oy + 10} s={q.s * 0.95} rot={q.rot} col={q.col} />
            ))}
          </g>
        )}
        <line x1={0} y1={0} x2={0} y2={-104} stroke={SIL} strokeWidth={40} strokeLinecap="round" />
        <circle cx={8} cy={-146} r={27} fill={SIL} />
        <path d="M-6,-100 L30,-60 L52,-30" stroke={SIL} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {cargado && <path d="M-10,-96 L-44,-72 L-62,-40" stroke="#4a3622" strokeWidth={9} strokeLinecap="round" fill="none" />}
        <path d="M-12,-122 C-4,-170 28,-176 36,-142" fill="none" stroke="#ffcf8a" strokeWidth={3} opacity={0.35} />
      </g>
    </g>
  );
};

/** Pila de piedras ya soltadas, en el suelo */
const PilaSuelta: React.FC<{t: number}> = ({t}) => {
  const y0 = pathY(X_SUELTA);
  const us = Math.min(1, Math.max(0, (t - 0.05) / 0.3));
  const sx = X_SUELTA - 20 - us * 30;
  return (
    <g>
      <g transform={`translate(${sx} ${mix(y0 - 200, pathY(sx) - 30, us * us)}) rotate(${-us * 70})`} opacity={us > 0 || t > 1 ? 1 : 0}>
        <path d="M-56,-10 C-90,-60 -78,-130 -30,-150 C20,-166 70,-150 78,-96 C86,-44 60,0 14,6 C-14,10 -40,6 -56,-10 Z" fill="#8a6a46" stroke="#4a3622" strokeWidth={5} transform="scale(0.8)" />
      </g>
      {PIEDRAS.map((q, i) => {
        const td = 0.1 + i * 0.04;
        const u = Math.min(1, Math.max(0, (t - td) / 0.35));
        const x = X_SUELTA - 110 - (i % 4) * 42 - u * (30 + (i % 3) * 26);
        const yy = mix(y0 - 150 - i * 12, pathY(x) - q.s * 0.4, u * u);
        const alpha = t >= 0 ? 1 : 0;
        return u > 0 || t < 0 ? <g key={i} opacity={alpha}><Piedra x={x} y={yy} s={q.s} rot={q.rot + u * 90} col={q.col} /></g> : null;
      })}
    </g>
  );
};

const Terreno: React.FC<{alba: number; f: number}> = ({alba, f}) => {
  let d = `M-1200,4200 L-1200,${pathY(-1200)}`;
  for (let x = -1200; x <= 7200; x += 40) d += ` L${x},${pathY(x)}`;
  d += ' L7200,4200 Z';
  let borde = `M-1200,${pathY(-1200)}`;
  for (let x = -1200; x <= 7200; x += 40) borde += ` L${x},${pathY(x)}`;
  return (
    <g>
      <defs>
        <linearGradient id="ca-suelo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mezclaColor('#2a2450', '#8a5a62', alba)} />
          <stop offset="0.3" stopColor={mezclaColor('#16132f', '#4a2c3c', alba)} />
          <stop offset="1" stopColor={mezclaColor('#07061a', '#1c0e1c', alba)} />
        </linearGradient>
      </defs>
      <path d={d} fill="url(#ca-suelo)" />
      <path d={borde} fill="none" stroke={mezclaColor('#7a72c0', '#ffd9a0', alba)} strokeWidth={7} opacity={0.55} />
      {/* mojones de piedra a lo largo del camino y matas */}
      {Array.from({length: 11}).map((_, i) => {
        const x = 350 + i * 520;
        const y = pathY(x);
        return (
          <g key={i}>
            <ellipse cx={x} cy={y + 2} rx={36} ry={7} fill="#000" opacity={0.35} />
            <path d={`M${x - 26},${y} l6,-26 h40 l6,26 Z`} fill="#4a4472" />
            <path d={`M${x - 16},${y - 26} l4,-22 h24 l4,22 Z`} fill="#5a548a" />
            <circle cx={x} cy={y - 64} r={12} fill={ORO} opacity={0.4 + 0.5 * (1 - alba) * Math.abs(Math.sin(f * 0.05 + i))} />
          </g>
        );
      })}
      {Array.from({length: 70}).map((_, i) => {
        const x = -600 + i * 112 + rnd(i) * 60;
        const y = pathY(x) + 40 + rnd(i + 2) * 280;
        return <path key={i} d={`M${x - 18},${y} q8,-44 18,-60 q10,16 18,60 Z`} fill={mezclaColor('#1a2440', '#4a3a40', alba)} opacity={0.85} />;
      })}
    </g>
  );
};

/** El árbol del descanso (olivo): copa grande, luz suave */
const Arbol: React.FC<{alba: number; f: number}> = ({alba, f}) => {
  const x = X_ARBOL, y = pathY(X_ARBOL);
  return (
    <g>
      <Halo x={x} y={y - 360} r={520} color="#ffd9a0" o={0.25 + 0.5 * alba} />
      <ellipse cx={x} cy={y + 4} rx={240} ry={24} fill="#000" opacity={0.35} />
      <path d={`M${x - 26},${y} C${x - 20},${y - 120} ${x - 60},${y - 200} ${x - 110},${y - 280} L${x - 70},${y - 290} C${x - 30},${y - 230} ${x - 10},${y - 190} ${x},${y - 170} C${x + 20},${y - 220} ${x + 50},${y - 260} ${x + 100},${y - 300} L${x + 130},${y - 270} C${x + 70},${y - 220} ${x + 40},${y - 130} ${x + 28},${y} Z`} fill="#3a2a30" />
      {[[-110, -330, 170], [10, -400, 200], [120, -340, 160], [-30, -300, 140], [-170, -270, 110], [170, -270, 110]].map(([dx, dy, r], i) => (
        <g key={i}>
          <ellipse cx={x + dx} cy={y + dy} rx={r * 1.15} ry={r * 0.8} fill={mezclaColor('#1d4d4a', '#3f7a60', alba * 0.6)} />
          <ellipse cx={x + dx - r * 0.25} cy={y + dy - r * 0.28} rx={r * 0.75} ry={r * 0.45} fill={mezclaColor('#2a6a60', '#7aa878', alba * 0.6)} opacity={0.6} />
        </g>
      ))}
      {Array.from({length: 16}).map((_, i) => (
        <circle key={i} cx={x - 220 + rnd(i) * 440} cy={y - 220 - rnd(i + 3) * 260} r={3} fill={ORO2} opacity={0.4 + 0.5 * Math.abs(Math.sin(f * 0.06 + i))} />
      ))}
    </g>
  );
};

/** Texto árabe grande que aparece cuando la voz lo dice (en pantalla, sobre la cámara) */
const Arabe: React.FC<{texto: string; sub?: string; e: number; tam?: number}> = ({texto, sub, e, tam = 72}) =>
  e <= 0 ? null : (
    <g opacity={e} transform={`translate(0 ${(1 - e) * 24})`}>
      <rect x={50} y={300} width={W - 100} height={sub ? 230 : 190} rx={sub ? 56 : 95} fill="#10132e" opacity={0.9} />
      <rect x={50} y={300} width={W - 100} height={sub ? 230 : 190} rx={sub ? 56 : 95} fill="none" stroke={ORO} strokeWidth={4} />
      <text x={W / 2} y={sub ? 392 : 422} textAnchor="middle" fontFamily={amiri} fontWeight={700} fontSize={tam} fill={ORO2} direction="rtl">
        {texto}
      </text>
      {sub && (
        <text x={W / 2} y={486} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={40} fill={CREMA}>
          {sub}
        </text>
      )}
    </g>
  );

// ───────────────────────── fábrica de escenas ─────────────────────────
type Estado = {x: number; carga: number; pose: Pose; soltar: number; alba: number};
type Ctx = {f: number; tl: number; t: number; v: Vista; d: number};
type Def = {vista: (t: number) => Vista; estado: (t: number) => Estado; extra?: (c: Ctx, e: Estado) => React.ReactNode};

const semillaDe = (nombre: string) => [...`${ID}-${nombre}`].reduce((a, ch) => a + ch.charCodeAt(0), 0);
const S = 30;
/** Vista que sigue a la figura */
const sigue = (x: number, z: number, dx = 150, dy = 200): Vista => ({c: [x + dx, pathY(x) - dy], z});

const escena = (nombre: string, def: Def, ultimo = false): React.FC<{f: number; d: number}> => {
  const sem = semillaDe(nombre);
  return ({f, d}) => {
    const L = ultimo ? d : Math.max(1, d - 12);
    const t = Math.min(1, f / L);
    const v = def.vista(t);
    const e = def.estado(t);
    const cam = encuadre(f, d, sem, {x: FX, y: FY});
    const comp = `translate(${cam.x} ${cam.y}) scale(${1 / cam.s}) translate(${-FX} ${-FY})`;
    const c: Ctx = {f, tl: f / S, t, v, d};
    const y = pathY(e.x);
    const ang = (Math.atan(pendiente(e.x)) * 180) / Math.PI;
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
              <Terreno alba={e.alba} f={f} />
              <Arbol alba={e.alba} f={f} />
              {e.soltar > 0 || e.x > X_SUELTA ? <PilaSuelta t={e.x > X_SUELTA ? 2 : e.soltar} /> : null}
              <g transform={`translate(${e.x} ${y}) rotate(${ang})`}>
                <Figura f={f} carga={e.soltar > 0 ? e.carga * (1 - Math.min(1, e.soltar * 1.2)) : e.carga} pose={e.pose} soltar={Math.min(1, e.soltar * 1.2)} />
              </g>
              {def.extra?.(c, e)}
            </Plano>
          </g>
        </Capa>
        <Capa z={1}>
          <g transform={comp}>
            <Plano v={v} q={1.25}>
              {Array.from({length: 24}).map((_, i) => {
                const x = -800 + i * 360 + rnd(i) * 120;
                const h = 70 + rnd(i + 2) * 120;
                const yy = pathY(x) + 520;
                return <path key={i} d={`M${x - 60},${yy + 360} Q${x - 40},${yy + 360 - h} ${x},${yy + 330 - h * 1.1} Q${x + 40},${yy + 360 - h} ${x + 60},${yy + 360} Z`} fill={mezclaColor('#0a0818', '#2a1620', e.alba)} />;
              })}
            </Plano>
          </g>
        </Capa>
        <g transform={comp}>{ARABE.get(nombre)?.(c, e)}</g>
      </Lienzo>
    );
  };
};

// texto árabe por escena (se dibuja en pantalla)
const ARABE = new Map<string, (c: Ctx, e: Estado) => React.ReactNode>();
const conArabe = (nombre: string, texto: string, tam = 72, sub?: string, desde = 0.08) => ARABE.set(nombre, (c) => <Arabe texto={texto} sub={sub} tam={tam} e={ease(p(c.t, desde, 0.16))} />);

// ───────────────────────── las escenas ─────────────────────────
const Camino = escena('camino', {
  vista: (t) => vmix(sigue(300, 0.95, 260, 190), sigue(760, 1.1), easeIO(t)),
  estado: (t) => ({x: mix(300, 900, t), carga: 0.08, pose: 'camina', soltar: 0, alba: 0}),
});
const Espera = escena('espera', {
  vista: (t) => vmix(sigue(900, 1.1), {c: [2300, 880], z: 0.5}, easeIO(t)),
  estado: (t) => ({x: mix(900, 1060, t), carga: 0.1, pose: 'camina', soltar: 0, alba: 0}),
});
const Carga1 = escena('carga1', {
  vista: (t) => vmix({c: [2300, 880], z: 0.5}, sigue(1500, 1.0), easeIO(p(t, 0, 0.6))),
  estado: (t) => ({x: mix(1060, 1900, t), carga: mix(0.1, 0.45, t), pose: 'camina', soltar: 0, alba: 0}),
});
const Carga2 = escena('carga2', {
  vista: (t) => vmix(sigue(1900, 1.0), sigue(2500, 1.1), t),
  estado: (t) => ({x: mix(1900, 2500, t), carga: mix(0.45, 0.65, t), pose: 'camina', soltar: 0, alba: 0}),
});
conArabe('carga2', 'لَا يَنْبَغِي لِلْمُؤْمِنِ أَنْ يُذِلَّ نَفْسَهُ', 66);
const Carga3 = escena('carga3', {
  vista: (t) => vmix(sigue(2500, 1.1), sigue(3000, 1.15), t),
  estado: (t) => ({x: mix(2500, 3000, t), carga: mix(0.65, 0.82, t), pose: 'camina', soltar: 0, alba: 0}),
});
conArabe('carga3', 'وَكَيْفَ يُذِلُّ نَفْسَهُ؟', 80);
const Carga4 = escena('carga4', {
  vista: (t) => vmix(sigue(3000, 1.15), sigue(3500, 1.5, 120, 170), easeIO(t)),
  estado: (t) => ({x: mix(3000, 3500, t), carga: mix(0.82, 1.1, t), pose: 'camina', soltar: 0, alba: 0}),
});
conArabe('carga4', 'يَتَحَمَّلُ مِنَ الْبَلَاءِ مَا لَا يُطِيقُ', 64);
const Virtud = escena('virtud', {
  vista: (t) => vmix(sigue(3500, 1.5, 120, 170), sigue(3880, 0.85, 200, 230), easeIO(t)),
  estado: (t) => ({x: mix(3500, 3880, t), carga: 1.1, pose: t > 0.9 ? 'parado' : 'camina', soltar: 0, alba: 0}),
});
conArabe('virtud', 'لَيْسَ كُلُّ صَبْرٍ فَضِيلَةً', 78, 'no toda paciencia es virtud');
const Suelta = escena('suelta', {
  vista: (t) => vmix(sigue(3880, 0.85, 200, 230), sigue(3900, 1.2, 160, 210), easeIO(p(t, 0, 0.8))),
  estado: (t) => ({x: mix(3880, 3900, t), carga: 1.1, pose: t < 0.7 ? 'parado' : 'camina', soltar: easeIO(p(t, 0.12, 0.6)), alba: easeIO(p(t, 0.5, 0.5)) * 0.25}),
});
const Amanece = escena('amanece', {
  vista: (t) => vmix(sigue(3900, 1.2, 160, 210), sigue(4900, 0.75, 260, 230), easeIO(t)),
  estado: (t) => ({x: mix(3900, 4900, easeIO(t)), carga: 0, pose: 'camina', soltar: 1, alba: mix(0.25, 0.85, t)}),
});
const Arbol1 = escena(
  'arbol',
  {
    vista: (t) => vmix(sigue(4900, 0.75, 260, 230), {c: [3500, 760], z: 0.38}, easeIO(p(t, 0.25, 0.75))),
    estado: (t) => {
      const u = easeIO(p(t, 0, 0.55));
      return {x: mix(4900, X_ARBOL - 150, u), carga: 0, pose: t > 0.6 ? 'sentado' : 'camina', soltar: 1, alba: mix(0.85, 1, t)};
    },
    extra: (c) => {
      const a = ease(p(c.t, 0.6, 0.25));
      return (
        <g opacity={a}>
          <rect x={2000} y={300} width={2800} height={400} rx={200} fill="#10132e" opacity={0.9} />
          <rect x={2000} y={300} width={2800} height={400} rx={200} fill="none" stroke={ORO} strokeWidth={12} />
          <text x={3400} y={540} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={150} fill={CREMA}>
            ¿Qué has aguantado demasiado?
          </text>
        </g>
      );
    },
  },
  true,
);

export const CARGA: Record<string, React.FC<{f: number; d: number; k: number; opts: string[]}>> = {
  [`${ID}-camino`]: Camino,
  [`${ID}-espera`]: Espera,
  [`${ID}-carga1`]: Carga1,
  [`${ID}-carga2`]: Carga2,
  [`${ID}-carga3`]: Carga3,
  [`${ID}-carga4`]: Carga4,
  [`${ID}-virtud`]: Virtud,
  [`${ID}-suelta`]: Suelta,
  [`${ID}-amanece`]: Amanece,
  [`${ID}-arbol`]: Arbol1,
};

/** Todas miran al centro de la cámara: el viaje lo hace la vista de mundo */
export const FOCOS_CARGA: Record<string, FocoEscena> = Object.fromEntries(Object.keys(CARGA).map((k) => [k, {x: FX, y: FY}]));
