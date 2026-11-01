// Escenas a medida: «Marruecos no nació en 1956» (serie Historia de Marruecos que no te contaron)
// Cada escena muestra exactamente lo que dice la frase. Coordenadas en el lienzo 1080×1920;
// lo importante va entre y≈200 y y≈1150 (debajo van los subtítulos).
import React from 'react';
import {H, P, W, sans, serif} from '../tema';
import {Cielo, EscenaProps, Estrellas, Halo, Lienzo, Polvo, Silueta, Zellige, ease, easeIO, mix, rnd} from '../dibujos/base';
import type {FocoEscena} from '../dibujos/camara2d';
import {Caravana, enRuta, viaje} from './fatima-fihri';

/** 0→1 entre a y a+len (sirve con segundos o fracciones; el p de base no admite len < 1) */
const p = (x: number, a: number, len: number) => Math.min(1, Math.max(0, (x - a) / Math.max(1e-6, len)));

const S = 30; // fotogramas por segundo: los tiempos se escriben en segundos (f / S)
const seg = (f: number) => f / S;
const fmt = (n: number) => Math.round(n).toLocaleString('es-ES');

// ───────────────────────── piezas comunes ─────────────────────────

/** Mesa de madera con vetas y una lámpara cálida */
const Mesa: React.FC<{id: string}> = ({id}) => (
  <>
    <defs>
      <linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#4a2c1c" />
        <stop offset="0.5" stopColor="#3a2216" />
        <stop offset="1" stopColor="#24140c" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id}-m)`} />
    {Array.from({length: 22}).map((_, i) => {
      const y = 40 + i * 88 + rnd(i) * 30;
      return (
        <path
          key={i}
          d={`M-20,${y} C260,${y - 30 + rnd(i + 1) * 60} 640,${y + 30 - rnd(i + 2) * 60} 1100,${y + rnd(i + 3) * 30}`}
          stroke={i % 3 ? '#5a3826' : '#2a170e'}
          strokeWidth={2 + rnd(i + 4) * 5}
          fill="none"
          opacity={0.55}
        />
      );
    })}
    <Halo x={260} y={240} r={760} color="#ffcf8a" o={0.75} />
  </>
);

/** El acta de nacimiento de "Marruecos · 1956" (escenas 1 y 2) */
const Acta: React.FC<{escrito: number; fecha: number; sello: number; f: number}> = ({escrito, fecha, sello, f}) => {
  const linea = (i: number) => ease(p(escrito * 5, i, 1));
  const golpe = sello > 0 ? 1 + 0.6 * Math.max(0, 1 - sello * 3) : 0;
  const temblor = sello > 0 && sello < 0.25 ? Math.sin(f * 3) * 6 : 0;
  return (
    <g transform={`translate(${temblor} 0)`}>
      <defs>
        <linearGradient id="m56-papel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7ecd4" />
          <stop offset="0.6" stopColor="#efdfbd" />
          <stop offset="1" stopColor="#ddc69a" />
        </linearGradient>
        <radialGradient id="m56-mancha" cx="0.8" cy="0.85" r="0.5">
          <stop offset="0" stopColor="#b8935c" stopOpacity={0.35} />
          <stop offset="1" stopColor="#b8935c" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform="translate(540 700) scale(0.86) translate(-540 -700) rotate(-3 540 700)">
        <rect x={150} y={250} width={780} height={880} rx={10} fill="#000" opacity={0.45} filter="url(#difuso)" transform="translate(18 26)" />
        <rect x={150} y={250} width={780} height={880} rx={10} fill="url(#m56-papel)" />
        <rect x={150} y={250} width={780} height={880} rx={10} fill="url(#m56-mancha)" />
        <rect x={180} y={280} width={720} height={820} rx={6} fill="none" stroke="#9a7a4a" strokeWidth={3} />
        <rect x={192} y={292} width={696} height={796} rx={4} fill="none" stroke="#9a7a4a" strokeWidth={1.5} />
        {/* esquinas con estrella de ocho puntas */}
        {[[214, 314], [866, 314], [214, 1066], [866, 1066]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`} fill="none" stroke="#9a7a4a" strokeWidth={2}>
            <rect x={-12} y={-12} width={24} height={24} />
            <rect x={-12} y={-12} width={24} height={24} transform="rotate(45)" />
          </g>
        ))}
        <text x={540} y={390} fill="#3a2a1a" fontFamily={serif} fontSize={56} textAnchor="middle" opacity={linea(0)}>
          Acta de nacimiento
        </text>
        <line x1={300} y1={420} x2={780} y2={420} stroke="#9a7a4a" strokeWidth={2} opacity={linea(0)} />
        {[
          ['Nombre', 'MARRUECOS', 540],
          ['Lugar', 'Norte de África', 650],
        ].map(([k, v, y], i) => (
          <g key={i} opacity={linea(i + 1)}>
            <text x={240} y={(y as number) - 40} fill="#7a6040" fontFamily={sans} fontWeight={700} fontSize={30}>
              {k}:
            </text>
            <text x={240} y={(y as number) + 14} fill="#1f2a4a" fontFamily={serif} fontSize={i ? 50 : 66}>
              {v}
            </text>
            <line x1={240} y1={(y as number) + 30} x2={840} y2={(y as number) + 30} stroke="#c4a87a" strokeWidth={2} strokeDasharray="4 6" />
          </g>
        ))}
        <text x={240} y={740} fill="#7a6040" fontFamily={sans} fontWeight={700} fontSize={30} opacity={linea(3)}>
          Año de nacimiento:
        </text>
        <text x={240} y={900} fill="#1f2a4a" fontFamily={serif} fontSize={190} opacity={fecha} letterSpacing={6}>
          1956
        </text>
        <line x1={240} y1={930} x2={840} y2={930} stroke="#c4a87a" strokeWidth={2} strokeDasharray="4 6" opacity={linea(3)} />
        {/* sello */}
        {sello > 0 && (
          <g transform={`translate(740 1000) rotate(-14) scale(${golpe})`} opacity={Math.min(1, sello * 4) * 0.85}>
            <circle r={92} fill="none" stroke="#b0302a" strokeWidth={8} />
            <circle r={74} fill="none" stroke="#b0302a" strokeWidth={3} />
            <text y={-16} fill="#b0302a" fontFamily={sans} fontWeight={800} fontSize={30} textAnchor="middle" letterSpacing={3}>
              OFICIAL
            </text>
            <text y={30} fill="#b0302a" fontFamily={sans} fontWeight={800} fontSize={42} textAnchor="middle">
              1956
            </text>
          </g>
        )}
      </g>
    </g>
  );
};

/** Línea quebrada de la grieta (en coordenadas del acta) */
const GRIETA: [number, number][] = [
  [560, 230], [520, 360], [585, 470], [510, 600], [575, 720], [500, 850], [560, 960], [505, 1080], [550, 1160],
];
const grietaHasta = (t: number) => {
  const n = Math.max(2, Math.ceil(t * (GRIETA.length - 1)) + 1);
  return GRIETA.slice(0, n);
};

/** Fez vista desde arriba: medina densa de azoteas, patios, el río y los tejados verdes de la Qarawiyyin */
const QX = 560, QY = 760; // centro de la Qarawiyyin en la vista aérea
/** Casas de la medina: manzanas irregulares entre callejones, partidas en casas de tamaños distintos */
type Casa = {x: number; y: number; w: number; h: number; s: number};
const rioY = (x: number) => 1180 + Math.sin(x / 160) * 60;
const partir = (x: number, y: number, w: number, h: number, s: number, out: Casa[]) => {
  if ((w < 95 && h < 95) || (w < 60 || h < 60)) {
    out.push({x, y, w, h, s});
    return;
  }
  const vertical = w > h ? rnd(s) > 0.2 : rnd(s) > 0.8;
  const c = 0.35 + rnd(s + 1) * 0.3;
  if (vertical) {
    partir(x, y, w * c, h, s * 2 + 1, out);
    partir(x + w * c, y, w * (1 - c), h, s * 2 + 2, out);
  } else {
    partir(x, y, w, h * c, s * 2 + 1, out);
    partir(x, y + h * c, w, h * (1 - c), s * 2 + 2, out);
  }
};
const CASAS: Casa[] = (() => {
  const out: Casa[] = [];
  let n = 1;
  for (let gy = 0; gy < 12; gy++) {
    for (let gx = 0; gx < 7; gx++) {
      n++;
      const bw = 190, bh = 190;
      const x = gx * bw - 60 + (rnd(n) - 0.5) * 40 + (gy % 2) * 50;
      const y = gy * bh - 60 + (rnd(n + 1) - 0.5) * 40;
      const w = bw - 14 - rnd(n + 2) * 14, h = bh - 14 - rnd(n + 3) * 14;
      partir(x, y, w, h, n * 7, out);
    }
  }
  return out.filter((c) => {
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
    if (Math.abs(cx - QX) < 225 && Math.abs(cy - QY) < 185) return false; // la Qarawiyyin
    if (Math.abs(cy - rioY(cx)) < 60) return false; // el río
    return true;
  });
})();
const TONOS = ['#dcc6a2', '#d2b68e', '#e6d4b4', '#ccae84', '#e0cdb0', '#c4a47c', '#d8c09a'];

const FezAerea: React.FC<{f: number; brillo?: number}> = ({f, brillo = 0}) => {
  const casas = CASAS.map((c, i) => {
    const m = 3; // muro (pretil) de la azotea
    const tono = TONOS[Math.floor(rnd(c.s) * TONOS.length)];
    const patio = c.w > 70 && c.h > 70 && rnd(c.s + 3) > 0.35;
    const pw = c.w * (0.32 + rnd(c.s + 4) * 0.12), ph = c.h * (0.32 + rnd(c.s + 5) * 0.12);
    const px = c.x + (c.w - pw) / 2, py = c.y + (c.h - ph) / 2;
    return (
      <g key={i}>
        {/* sombra proyectada (luz de tarde desde arriba a la izquierda) */}
        <rect x={c.x + 7} y={c.y + 9} width={c.w - 3} height={c.h - 3} fill="#2a1c14" opacity={0.5} />
        <rect x={c.x} y={c.y} width={c.w - 3} height={c.h - 3} fill={tono} />
        <rect x={c.x} y={c.y} width={c.w - 3} height={m} fill="#fff6e2" opacity={0.6} />
        <rect x={c.x} y={c.y} width={m} height={c.h - 3} fill="#fff6e2" opacity={0.4} />
        <rect x={c.x + c.w - 3 - m} y={c.y} width={m} height={c.h - 3} fill="#000" opacity={0.12} />
        {patio && (
          <>
            <rect x={px} y={py} width={pw} height={ph} fill="#6a4e3a" />
            <rect x={px} y={py} width={pw} height={ph * 0.35} fill="#2a1c14" opacity={0.45} />
            {rnd(c.s + 6) > 0.55 && <circle cx={px + pw / 2} cy={py + ph * 0.6} r={Math.min(pw, ph) * 0.28} fill={rnd(c.s + 7) > 0.5 ? '#557a3a' : '#6f9a4a'} />}
            {rnd(c.s + 8) > 0.8 && <circle cx={px + pw / 2} cy={py + ph / 2} r={4} fill="#7fc0d0" />}
          </>
        )}
        {!patio && rnd(c.s + 9) > 0.7 && <rect x={c.x + c.w * 0.2} y={c.y + c.h * 0.25} width={c.w * 0.25} height={c.h * 0.18} fill="#b89870" />}
        {rnd(c.s + 10) > 0.965 && <rect x={c.x + 4} y={c.y + 4} width={c.w - 11} height={c.h - 11} fill="#3f8a63" />}
      </g>
    );
  });
  // tejados verdes de la Qarawiyyin: naves paralelas + patio con fuente
  const naves = Array.from({length: 9}).map((_, i) => (
    <g key={i}>
      <rect x={QX - 190} y={QY - 70 + i * 24} width={380} height={22} fill={i % 2 ? '#2f7a55' : '#3a8a62'} />
      <rect x={QX - 190} y={QY - 70 + i * 24} width={380} height={4} fill="#7fc49a" opacity={0.6} />
    </g>
  ));
  return (
    <Lienzo>
      <rect width={W} height={H} fill="#6e563f" />
      {casas}
      {/* río Fez con árboles */}
      <path d={Array.from({length: 23}).map((_, i) => `${i ? 'L' : 'M'}${i * 50 - 20},${rioY(i * 50 - 20)}`).join(' ')} stroke="#3c6e74" strokeWidth={46} fill="none" />
      <path d={Array.from({length: 23}).map((_, i) => `${i ? 'L' : 'M'}${i * 50 - 20},${rioY(i * 50 - 20)}`).join(' ')} stroke="#6aa0a0" strokeWidth={6} fill="none" strokeDasharray="30 40" strokeDashoffset={-f * 2} opacity={0.6} />
      {Array.from({length: 26}).map((_, i) => {
        const x = rnd(i + 40) * W;
        const y = rioY(x) + (rnd(i + 41) > 0.5 ? 46 : -46);
        return <circle key={i} cx={x} cy={y} r={16 + rnd(i + 42) * 12} fill={i % 2 ? '#4f7a3a' : '#3d6630'} />;
      })}
      {/* la Qarawiyyin */}
      <g>
        <rect x={QX - 206} y={QY - 156} width={420} height={330} fill="#000" opacity={0.35} transform="translate(8 10)" />
        <rect x={QX - 200} y={QY - 150} width={400} height={320} fill="#e8dcc6" />
        {naves}
        <rect x={QX - 110} y={QY - 140} width={220} height={66} fill="#f2ead8" />
        {/* patio: suelo de zellige y fuente */}
        <rect x={QX - 100} y={QY - 134} width={200} height={54} fill="#dfe8e2" />
        <circle cx={QX} cy={QY - 107} r={14} fill="#5fa7b8" stroke="#fff" strokeWidth={3} />
        {/* alminar cuadrado (visto desde arriba) */}
        <rect x={QX + 120} y={QY - 150} width={56} height={56} fill="#f6f1e6" />
        <rect x={QX + 132} y={QY - 138} width={32} height={32} fill="#3a8a62" />
        <Halo x={QX} y={QY} r={320} color={P.oroClaro} o={brillo} />
      </g>
      {/* bruma y luz de tarde */}
      <Halo x={900} y={200} r={700} color="#ffd9a0" o={0.35} />
    </Lienzo>
  );
};

/** La Qarawiyyin replicada: patio con fuente, arcos de herradura, tejas verdes y alminar blanco cuadrado.
 *  t (0–1) = cuánto se ha construido */
const Qarawiyyin: React.FC<{f: number; t: number}> = ({f, t}) => {
  const suelo = ease(p(t, 0, 0.2));
  const muro = easeIO(p(t, 0.1, 0.45));
  const tejado = ease(p(t, 0.5, 0.25));
  const alminar = easeIO(p(t, 0.55, 0.4));
  const agua = ease(p(t, 0.85, 0.15));
  const arcos = [0, 1, 2, 3, 4];
  const ax = (i: number) => 140 + i * 200; // centro de cada arco
  const yb = 1060; // suelo del pórtico
  const ytop = 720; // arriba del muro
  return (
    <>
      <defs>
        <linearGradient id="m56-q-cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2a4f" />
          <stop offset="0.5" stopColor="#7a5a7a" />
          <stop offset="1" stopColor="#f2a774" />
        </linearGradient>
        <linearGradient id="m56-q-muro" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3e7d0" />
          <stop offset="1" stopColor="#d9c3a0" />
        </linearGradient>
        <linearGradient id="m56-q-hueco" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3420" />
          <stop offset="0.6" stopColor="#8a5a30" />
          <stop offset="1" stopColor="#c48a48" />
        </linearGradient>
        <linearGradient id="m56-q-alm" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fbf6ec" />
          <stop offset="0.75" stopColor="#efe5d2" />
          <stop offset="1" stopColor="#cdbfa6" />
        </linearGradient>
        <linearGradient id="m56-q-teja" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4fa57a" />
          <stop offset="1" stopColor="#1f5e40" />
        </linearGradient>
        <pattern id="m56-q-suelo" width={36} height={36} patternUnits="userSpaceOnUse">
          <rect width={36} height={36} fill="#efe6d4" />
          <rect width={18} height={18} fill="#e2d4b8" />
          <rect x={18} y={18} width={18} height={18} fill="#e2d4b8" />
          <polygon points="18,11 25,18 18,25 11,18" fill="#2f7a6a" opacity={0.45} />
        </pattern>
        <linearGradient id="m56-q-sombra" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a0e08" stopOpacity={0.05} />
          <stop offset="0.5" stopColor="#1a0e08" stopOpacity={0.55} />
          <stop offset="1" stopColor="#0d0a12" stopOpacity={0.95} />
        </linearGradient>
        <clipPath id="m56-q-crece">
          <rect x={0} y={yb - (yb - ytop + 40) * muro} width={W} height={(yb - ytop + 40) * muro} />
        </clipPath>
        <clipPath id="m56-q-alm-crece">
          <rect x={300} y={760 - 560 * alminar} width={300} height={560 * alminar + 10} />
        </clipPath>
      </defs>
      <rect width={W} height={H} fill="url(#m56-q-cielo)" />
      <Estrellas f={f} n={40} hasta={360} o={0.6} />
      <Halo x={900} y={640} r={420} color="#ffc98a" o={0.6} />

      {/* alminar blanco cuadrado detrás, a la izquierda del centro */}
      <g clipPath="url(#m56-q-alm-crece)">
        <rect x={350} y={250} width={190} height={520} fill="url(#m56-q-alm)" />
        {/* paneles de arcos ciegos y celosía (sebka) */}
        {[330, 500].map((y, i) => (
          <g key={i}>
            <path d={`M380,${y + 120} L380,${y + 40} A65,70 0 1 1 510,${y + 40} L510,${y + 120} Z`} fill="#e3d6bd" />
            <path d={`M405,${y + 120} L405,${y + 50} A40,48 0 1 1 485,${y + 50} L485,${y + 120} Z`} fill="#3a2a2a" opacity={0.75} />
            {[0, 1, 2].map((j) => (
              <path key={j} d={`M${405 + j * 27},${y + 120} L${418 + j * 27},${y + 70} L${431 + j * 27},${y + 120}`} stroke="#e3d6bd" strokeWidth={3} fill="none" opacity={0.6} />
            ))}
          </g>
        ))}
        <Zellige x={350} y={292} w={190} h={22} id="m56-q-zal" />
        <rect x={350} y={250} width={190} height={14} fill="#e9dcc4" />
        {/* almenas escalonadas */}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${352 + i * 38},250 l0,-20 l10,0 l0,-12 l14,0 l0,12 l10,0 l0,20 Z`} fill="#f6efe2" />
        ))}
        {/* linterna superior con cúpula verde y yamur (tres bolas) */}
        <rect x={405} y={150} width={80} height={90} fill="url(#m56-q-alm)" />
        <path d="M418,240 L418,190 A27,30 0 1 1 472,190 L472,240 Z" fill="#3a2a2a" opacity={0.7} />
        <path d="M395,152 Q445,90 495,152 Z" fill="url(#m56-q-teja)" />
        <line x1={445} y1={112} x2={445} y2={50} stroke="#d9b45a" strokeWidth={5} />
        {[96, 80, 64].map((y, i) => (
          <circle key={i} cx={445} cy={y} r={11 - i * 2.5} fill="#e9c46a" stroke="#b08a3a" strokeWidth={2} />
        ))}
        <rect x={510} y={250} width={30} height={520} fill="#000" opacity={0.08} />
      </g>

      {/* tejado de tejas verdes sobre el pórtico */}
      <g opacity={tejado} transform={`translate(0 ${(1 - tejado) * 30})`}>
        <path d={`M40,${ytop} L90,${ytop - 90} L990,${ytop - 90} L1040,${ytop} Z`} fill="url(#m56-q-teja)" />
        {Array.from({length: 46}).map((_, i) => (
          <line key={i} x1={70 + i * 20} y1={ytop - 88} x2={56 + i * 21} y2={ytop} stroke="#1a4a32" strokeWidth={4} opacity={0.6} />
        ))}
        {[0, 1, 2].map((i) => (
          <line key={i} x1={60 + i * 12} y1={ytop - 30 * (i + 1)} x2={1020 - i * 12} y2={ytop - 30 * (i + 1)} stroke="#7fd0a4" strokeWidth={2} opacity={0.35} />
        ))}
        <rect x={86} y={ytop - 100} width={908} height={14} rx={4} fill="#2a6a48" />
        <rect x={36} y={ytop - 6} width={1008} height={16} fill="#c9b08a" />
      </g>

      {/* muro del pórtico con cinco arcos de herradura */}
      <g clipPath="url(#m56-q-crece)">
        <rect x={40} y={ytop + 10} width={1000} height={yb - ytop - 10} fill="url(#m56-q-muro)" />
        {/* friso de yesería tallada */}
        <rect x={40} y={ytop + 10} width={1000} height={36} fill="#e6d5b6" />
        {Array.from({length: 50}).map((_, i) => (
          <path key={i} d={`M${46 + i * 20},${ytop + 40} q10,-24 20,0`} stroke="#b89a6e" strokeWidth={2.5} fill="none" />
        ))}
        {arcos.map((i) => {
          const x = ax(i);
          return (
            <g key={i}>
              {/* alfiz (marco rectangular) */}
              <rect x={x - 88} y={ytop + 66} width={176} height={yb - ytop - 66} fill="none" stroke="#c4a87a" strokeWidth={5} />
              {/* arco de herradura: la curva pasa de la mitad, se cierra hacia dentro */}
              <path d={`M${x - 64},${yb} L${x - 64},${ytop + 210} A78,78 0 1 1 ${x + 64},${ytop + 210} L${x + 64},${yb} Z`} fill="url(#m56-q-hueco)" />
              <path d={`M${x - 64},${yb} L${x - 64},${ytop + 210} A78,78 0 1 1 ${x + 64},${ytop + 210} L${x + 64},${yb}`} fill="none" stroke="#f6ead2" strokeWidth={10} />
              {/* dovelas */}
              {Array.from({length: 11}).map((_, j) => {
                const a = Math.PI * (1.25 - j * 0.15);
                return <line key={j} x1={x + Math.cos(a) * 72} y1={ytop + 190 - Math.sin(a) * 72} x2={x + Math.cos(a) * 88} y2={ytop + 190 - Math.sin(a) * 88} stroke="#c4a87a" strokeWidth={3} />;
              })}
              {/* farol colgado y su luz */}
              <line x1={x} y1={ytop + 130} x2={x} y2={ytop + 200} stroke="#3a2416" strokeWidth={3} />
              <Halo x={x} y={ytop + 230} r={90} color="#ffd27a" o={0.9} />
              <path d={`M${x - 16},${ytop + 205} L${x + 16},${ytop + 205} L${x + 22},${ytop + 240} L${x},${ytop + 262} L${x - 22},${ytop + 240} Z`} fill="#e9b44c" stroke="#7a5420" strokeWidth={3} />
              {/* columnas */}
              <rect x={x - 72} y={ytop + 200} width={14} height={yb - ytop - 200} fill="#e9dcc4" />
              <rect x={x + 58} y={ytop + 200} width={14} height={yb - ytop - 200} fill="#d8c8aa" />
            </g>
          );
        })}
        {/* zócalo de zellige */}
        <Zellige x={40} y={yb - 50} w={1000} h={50} id="m56-q-zoc" />
      </g>

      {/* suelo del patio en perspectiva */}
      <g opacity={suelo}>
        <path d={`M40,${yb} L1040,${yb} L1180,${H} L-100,${H} Z`} fill="url(#m56-q-suelo)" />
        <path d={`M40,${yb} L1040,${yb} L1180,${H} L-100,${H} Z`} fill="url(#m56-q-sombra)" />
        {/* luz de los faroles reflejada en el suelo */}
        {arcos.map((i) => (
          <ellipse key={i} cx={ax(i)} cy={yb + 40} rx={70} ry={18} fill="#ffcf7a" opacity={0.18} />
        ))}
        <rect x={0} y={yb} width={W} height={10} fill="#000" opacity={0.25} />
      </g>

      {/* fuente central de mármol */}
      <g opacity={suelo}>
        <ellipse cx={540} cy={1150} rx={200} ry={44} fill="#000" opacity={0.3} />
        <path d="M350,1110 L730,1110 L710,1160 L370,1160 Z" fill="#e8e2d6" />
        <ellipse cx={540} cy={1110} rx={190} ry={36} fill="#f4efe6" />
        <ellipse cx={540} cy={1110} rx={168} ry={28} fill="#4f9bb0" opacity={0.4 + 0.6 * agua} />
        <rect x={528} y={1040} width={24} height={70} fill="#e8e2d6" />
        <ellipse cx={540} cy={1040} rx={50} ry={12} fill="#f4efe6" />
        {agua > 0 &&
          Array.from({length: 10}).map((_, i) => {
            const ph = ((f * 0.04 + i / 10) % 1);
            const dir = i % 2 ? 1 : -1;
            return (
              <circle
                key={i}
                cx={540 + dir * ph * (40 + (i % 5) * 14)}
                cy={1034 - Math.sin(ph * Math.PI) * 50 + ph * 70}
                r={4}
                fill="#cfeaf2"
                opacity={agua * (1 - ph)}
              />
            );
          })}
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={540} cy={1110} rx={30 + ((f * 1.2 + i * 40) % 140)} ry={(30 + ((f * 1.2 + i * 40) % 140)) * 0.18} fill="none" stroke="#e6f6fa" strokeWidth={2} opacity={agua * (1 - ((f * 1.2 + i * 40) % 140) / 140)} />
        ))}
      </g>
    </>
  );
};

// ───────────────────────── 1 · ano1956 ─────────────────────────
const Ano1956: React.FC<EscenaProps> = ({f}) => {
  const t = seg(f);
  const entra = easeIO(p(t, 0, 0.6));
  return (
    <Lienzo>
      <Mesa id="m56-a" />
      {/* pluma y tintero sobre la mesa */}
      <ellipse cx={930} cy={1180} rx={70} ry={20} fill="#000" opacity={0.4} />
      <rect x={880} y={1100} width={100} height={80} rx={14} fill="#1a1a2a" />
      <rect x={895} y={1090} width={70} height={18} rx={6} fill="#2a2a3a" />
      <g transform={`translate(0 ${(1 - entra) * 900}) rotate(${(1 - entra) * 8} 540 700)`}>
        <Acta f={f} escrito={p(t, 0.3, 1.4)} fecha={ease(p(t, 2.1, 0.5))} sello={p(t, 2.9, 1)} />
      </g>
      <Polvo f={f} color="#ffe3b0" o={0.5} />
    </Lienzo>
  );
};

// ───────────────────────── 2 · grieta ─────────────────────────
const Grieta: React.FC<EscenaProps> = ({f}) => {
  const t = seg(f);
  const raja = easeIO(p(t, 0.1, 0.9));
  const abre = easeIO(p(t, 1.1, 1.3));
  const pts = grietaHasta(raja);
  const izq = `M0,0 L${GRIETA[0][0]},0 ${GRIETA.map(([x, y]) => `L${x},${y}`).join(' ')} L${GRIETA[GRIETA.length - 1][0]},${H} L0,${H} Z`;
  const der = `M${W},0 L${GRIETA[0][0]},0 ${GRIETA.map(([x, y]) => `L${x},${y}`).join(' ')} L${GRIETA[GRIETA.length - 1][0]},${H} L${W},${H} Z`;
  return (
    <Lienzo>
      <Mesa id="m56-g" />
      <defs>
        <clipPath id="m56-g-i">
          <path d={izq} />
        </clipPath>
        <clipPath id="m56-g-d">
          <path d={der} />
        </clipPath>
      </defs>
      {/* luz antigua que sale de dentro */}
      <g opacity={abre}>
        {Array.from({length: 16}).map((_, i) => {
          const a = (i / 16) * Math.PI * 2 + f * 0.01;
          return <path key={i} d={`M540,700 L${540 + Math.cos(a) * 1400},${700 + Math.sin(a) * 1400} L${540 + Math.cos(a + 0.12) * 1400},${700 + Math.sin(a + 0.12) * 1400} Z`} fill="#ffe2a0" opacity={0.18} />;
        })}
        <Halo x={540} y={700} r={mix(100, 620, abre)} color="#ffe6a8" />
        <circle cx={540} cy={700} r={mix(10, 110, abre)} fill="#fff6dc" filter="url(#brillo)" />
      </g>
      <g clipPath="url(#m56-g-i)" transform={`translate(${-abre * 300} ${abre * 40}) rotate(${-abre * 9} 300 1100)`}>
        <Acta f={100} escrito={1} fecha={1} sello={1} />
      </g>
      <g clipPath="url(#m56-g-d)" transform={`translate(${abre * 300} ${abre * 40}) rotate(${abre * 9} 780 1100)`}>
        <Acta f={100} escrito={1} fecha={1} sello={1} />
      </g>
      {abre < 0.4 && (
        <g transform="translate(540 700) scale(0.86) translate(-540 -700) rotate(-3 540 700)" opacity={1 - abre * 2.5}>
          <path d={pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ')} stroke="#1a0e06" strokeWidth={7} fill="none" strokeLinejoin="round" />
          <path d={pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x + 3},${y}`).join(' ')} stroke="#ffe6a8" strokeWidth={3} fill="none" strokeLinejoin="round" opacity={raja} />
        </g>
      )}
      <Polvo f={f} color="#ffe6a8" o={0.8} n={40} />
    </Lienzo>
  );
};

// ───────────────────────── 3 · independencia ─────────────────────────
/** Bandera de Marruecos: roja con la estrella verde de cinco puntas (pentagrama de líneas) */
const BanderaMarruecos: React.FC<{x: number; y: number; w: number; f: number}> = ({x, y, w, f}) => {
  const h = w * 0.66;
  const ond = (k: number) => Math.sin(f * 0.18 + k) * w * 0.04;
  const cx = x + w / 2, cy = y + h / 2, r = h * 0.3;
  const pt = (i: number) => [cx + r * Math.sin((i * 4 * Math.PI) / 5), cy - r * Math.cos((i * 4 * Math.PI) / 5)];
  return (
    <g>
      <path d={`M${x},${y} Q${x + w * 0.5},${y + ond(0)} ${x + w},${y + ond(1)} L${x + w},${y + h + ond(1)} Q${x + w * 0.5},${y + h + ond(0)} ${x},${y + h} Z`} fill="#c1272d" />
      <path d={`M${pt(0).join(',')} L${pt(1).join(',')} L${pt(2).join(',')} L${pt(3).join(',')} L${pt(4).join(',')} Z`} fill="none" stroke="#006233" strokeWidth={w * 0.035} strokeLinejoin="miter" />
    </g>
  );
};

const Independencia: React.FC<EscenaProps> = ({f}) => {
  const t = seg(f);
  const barco = easeIO(p(t, 0.3, 4.6));
  const sube = easeIO(p(t, 2.6, 1.6));
  const bx = mix(700, 1010, barco);
  return (
    <Lienzo>
      <Cielo id="m56-i-c" colores={['#1b2448', '#5a4a78', '#d9826a', '#ffcf8f']} />
      <Halo x={860} y={820} r={420} color="#ffd59a" />
      <circle cx={860} cy={840} r={90} fill="#ffe4b0" opacity={0.9} />
      {/* mar */}
      <rect x={0} y={880} width={W} height={1040} fill="#2a3a5a" />
      <rect x={0} y={880} width={W} height={1040} fill="url(#m56-i-c)" opacity={0.25} />
      {Array.from({length: 26}).map((_, i) => (
        <rect key={i} x={((rnd(i) * W + f * (0.6 + rnd(i + 1))) % (W + 200)) - 100} y={900 + rnd(i + 2) * 320} width={40 + rnd(i + 3) * 120} height={3} fill="#ffd9a8" opacity={0.25 + 0.3 * rnd(i + 4)} />
      ))}
      <rect x={780} y={900} width={160} height={260} fill="#ffe4b0" opacity={0.12} />
      {/* el barco que se va (bandera francesa a popa) */}
      <g transform={`translate(${bx} 900)`}>
        <path d="M-150,0 L150,0 L120,46 L-130,46 Z" fill="#1c1c26" />
        <rect x={-110} y={-36} width={190} height={36} fill="#e9e2d2" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <circle key={i} cx={-92 + i * 26} cy={-18} r={5} fill="#3a3a4a" />
        ))}
        <rect x={-40} y={-90} width={34} height={56} fill="#b0302a" />
        <rect x={-40} y={-90} width={34} height={10} fill="#1c1c26" />
        {Array.from({length: 6}).map((_, i) => (
          <circle key={i} cx={-24 + i * 14 + Math.sin(f * 0.1 + i) * 6} cy={-110 - i * 24} r={14 + i * 6} fill="#8a8090" opacity={0.35 - i * 0.05} />
        ))}
        <line x1={-140} y1={0} x2={-140} y2={-80} stroke="#1c1c26" strokeWidth={4} />
        <g transform="translate(-140 -80)">
          {['#0055a4', '#ffffff', '#ef4135'].map((c, i) => (
            <rect key={i} x={-60 + i * 20} y={Math.sin(f * 0.2 + i) * 3} width={20} height={40} fill={c} />
          ))}
        </g>
        <path d="M-150,48 L150,48" stroke="#ffd9a8" strokeWidth={3} opacity={0.4} />
      </g>
      {/* la kasbah de los Udayas: murallas almohades que ya estaban ahí */}
      <g>
        <defs>
          <linearGradient id="m56-i-muro" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9a5e30" />
            <stop offset="0.6" stopColor="#c4844a" />
            <stop offset="1" stopColor="#e09a5a" />
          </linearGradient>
        </defs>
        <path d="M0,640 L560,640 L600,700 L620,960 L0,960 Z" fill="url(#m56-i-muro)" />
        <rect x={0} y={940} width={630} height={30} fill="#000" opacity={0.25} />
        <path d="M0,640 L560,640 L600,700 L620,960 L0,960 Z" fill="#000" opacity={0.08} />
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={6 + i * 40} y={612} width={24} height={32} fill="#b8763e" />
        ))}
        {Array.from({length: 40}).map((_, i) => (
          <rect key={i} x={rnd(i) * 560} y={660 + rnd(i + 1) * 280} width={30 + rnd(i + 2) * 40} height={4} fill="#8a522a" opacity={0.4} />
        ))}
        {/* torre */}
        <rect x={430} y={520} width={150} height={440} fill="url(#m56-i-muro)" />
        <rect x={430} y={520} width={40} height={440} fill="#000" opacity={0.12} />
        {Array.from({length: 5}).map((_, i) => (
          <rect key={i} x={432 + i * 30} y={494} width={18} height={30} fill="#c4824a" />
        ))}
        <rect x={560} y={520} width={20} height={440} fill="#000" opacity={0.12} />
        {/* puerta monumental (Bab Udaya) con arco de herradura y decoración tallada */}
        <rect x={110} y={700} width={260} height={260} fill="#a8683a" />
        <rect x={124} y={714} width={232} height={232} fill="none" stroke="#e0b07a" strokeWidth={5} />
        <path d="M170,960 L170,830 A70,72 0 1 1 310,830 L310,960 Z" fill="#2a1a14" />
        <path d="M170,960 L170,830 A70,72 0 1 1 310,830 L310,960" fill="none" stroke="#e0b07a" strokeWidth={8} />
        {Array.from({length: 9}).map((_, i) => (
          <path key={i} d={`M${136 + i * 24},722 q12,16 24,0`} stroke="#e0b07a" strokeWidth={3} fill="none" />
        ))}
        {/* casas blancas y azules por encima de la muralla */}
        {[[30, 560, 90, 80], [130, 580, 70, 60], [210, 548, 100, 92], [320, 576, 90, 64]].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill="#f2ede2" />
            <rect x={x} y={y + h - 22} width={w} height={22} fill="#3b6fb0" />
            <rect x={x + w * 0.4} y={y + 18} width={16} height={22} fill="#2a3a5a" />
          </g>
        ))}
        {/* mástil con la bandera marroquí que sube */}
        <line x1={505} y1={372} x2={505} y2={500} stroke="#3a2a20" strokeWidth={6} />
        <g transform={`translate(0 ${(1 - sube) * 90})`}>
          <BanderaMarruecos x={508} y={374} w={120} f={f} />
        </g>
      </g>
      <text x={540} y={270} fill="#ffe9c0" fontFamily={serif} fontSize={100} textAnchor="middle" opacity={ease(p(t, 0, 0.6))}>
        1956
      </text>
      <text x={540} y={322} fill="#ffe9c0" fontFamily={sans} fontWeight={700} fontSize={30} textAnchor="middle" letterSpacing={4} opacity={ease(p(t, 1.8, 0.6)) * 0.9}>
        FIN DEL PROTECTORADO
      </text>
      <Polvo f={f} color="#ffd9a8" o={0.4} />
    </Lienzo>
  );
};

// ───────────────────────── 4 · lineatiempo ─────────────────────────
const HITOS: [number, string][] = [
  [1912, 'Protectorado'],
  [1578, 'Batalla de los Tres Reyes'],
  [1070, 'Fundación de Marrakech'],
  [788, 'Idris I'],
];
const LineaTiempo: React.FC<EscenaProps> = ({f}) => {
  const t = seg(f);
  const corre = easeIO(p(t, 0.3, 2.4));
  const ano = mix(1956, 788, corre);
  const llega = ease(p(t, 2.7, 0.8));
  const k = 0.95; // píxeles por año
  const X = (y: number) => 540 + (y - ano) * k;
  return (
    <Lienzo>
      <Cielo id="m56-l-c" colores={['#0f1530', '#1f2448', '#3a2a50']} />
      <Estrellas f={f} hasta={1000} o={0.7} />
      {/* Walili (Volubilis) al amanecer: donde Idris I fue recibido en 788 */}
      <g opacity={0.25 + 0.75 * llega}>
        <Halo x={540} y={1040} r={520} color="#ffb877" o={llega} />
        <path d="M0,1060 C200,1010 400,1040 540,1020 C700,1000 880,1040 1080,1010 L1080,1300 L0,1300 Z" fill="#3a2a30" />
        {/* arco de triunfo y columnas romanas en ruinas */}
        <rect x={330} y={760} width={420} height={70} fill="#c9a77a" />
        <rect x={330} y={760} width={420} height={12} fill="#e8cfa0" />
        <path d="M410,1030 L410,880 A130,110 0 0 1 670,880 L670,1030 L620,1030 L620,890 A80,70 0 0 0 460,890 L460,1030 Z" fill="#b8956a" />
        <rect x={330} y={830} width={80} height={200} fill="#c9a77a" />
        <rect x={670} y={830} width={80} height={200} fill="#b8956a" />
        {[140, 200, 860, 930].map((x, i) => (
          <g key={i}>
            <rect x={x} y={860 + (i % 2) * 40} width={30} height={170 - (i % 2) * 40} fill="#c9a77a" />
            <rect x={x - 8} y={850 + (i % 2) * 40} width={46} height={14} fill="#e0c494" />
          </g>
        ))}
        {/* Idris I y quienes le reciben (siluetas sin cara) */}
        <Silueta x={540} y={1060} s={0.55} tipo="hombre" color="#1a1020" />
        <line x1={572} y1={1060} x2={590} y2={880} stroke="#1a1020" strokeWidth={7} />
        <Silueta x={250} y={1080} s={0.45} tipo="hombre" color="#24161e" />
        <Silueta x={820} y={1080} s={0.45} tipo="mujer" color="#24161e" />
        <rect x={0} y={1060} width={W} height={H - 1060} fill="#2a1e24" />
      </g>
      {/* contador de años que retrocede */}
      <text x={540} y={420} fill={corre >= 1 ? P.oro : '#f6e8d2'} fontFamily={serif} fontSize={210} textAnchor="middle" filter={corre >= 1 ? 'url(#brillo)' : undefined}>
        {Math.round(ano)}
      </text>
      <text x={540} y={490} fill="#c9b8d0" fontFamily={sans} fontWeight={700} fontSize={34} textAnchor="middle" letterSpacing={4} opacity={1 - llega}>
        ◀ RETROCEDIENDO
      </text>
      {/* cinta de la línea de tiempo */}
      <rect x={0} y={630} width={W} height={8} fill="#f6e8d2" opacity={0.5} />
      {Array.from({length: 13}).map((_, i) => {
        const y = 800 + i * 100;
        const x = X(y);
        return x > -50 && x < W + 50 ? (
          <g key={i}>
            <line x1={x} y1={610} x2={x} y2={658} stroke="#f6e8d2" strokeWidth={3} opacity={0.7} />
            <text x={x} y={600} fill="#f6e8d2" fontFamily={sans} fontWeight={700} fontSize={22} textAnchor="middle" opacity={0.55}>
              {y}
            </text>
          </g>
        ) : null;
      })}
      {HITOS.map(([y, n], i) => {
        const x = X(y);
        const cerca = Math.max(0, 1 - Math.abs(x - 540) / 220);
        return x > -200 && x < W + 200 ? (
          <g key={i}>
            <circle cx={x} cy={634} r={12 + 8 * cerca} fill={i === HITOS.length - 1 ? P.oro : '#e79a8f'} stroke="#fff6e6" strokeWidth={4} />
            <text x={x} y={700} fill="#fff6e6" fontFamily={sans} fontWeight={800} fontSize={34 + 12 * cerca} textAnchor="middle" opacity={Math.max(0, (cerca - 0.4) / 0.6)}>
              {n}
            </text>
          </g>
        ) : null;
      })}
      <path d="M540,580 L526,560 L554,560 Z" fill={P.oro} />
      <Polvo f={f} o={0.5} />
    </Lienzo>
  );
};

// ───────────────────────── 5 · mapa (Kairouan → Fez, y bajada a Fez) ─────────────────────────
const VIAJE_FIN = 30; // los últimos fotogramas bajan a Fez vista desde arriba
const Mapa: React.FC<EscenaProps> = (pr) => {
  const {f, d} = pr;
  const baja = easeIO(p(f, d - VIAJE_FIN - 6, VIAJE_FIN));
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - baja}}>
        <Caravana {...pr} d={d - VIAJE_FIN} />
      </div>
      {baja > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: baja, transform: `scale(${mix(0.6, 1, baja)})`, transformOrigin: `${QX}px ${QY}px`}}>
          <FezAerea f={f} />
        </div>
      )}
    </>
  );
};

// ───────────────────────── 6 · herencia-obra ─────────────────────────
const HerenciaObra: React.FC<EscenaProps> = ({f}) => {
  const t = seg(f);
  const pasa = easeIO(p(t, 1.4, 0.5));
  const obra = p(t, 1.6, 2.2);
  const placa = ease(p(t, 4.0, 0.5));
  const lluvia = p(t, 0.1, 1.3);
  return (
    <>
      {pasa < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - pasa}}>
          <FezAerea f={f} brillo={ease(lluvia)} />
          {/* lluvia de monedas de la herencia sobre el solar */}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
            {Array.from({length: 36}).map((_, i) => {
              const ini = rnd(i) * 0.6;
              const q = Math.max(0, Math.min(1, (lluvia - ini) / 0.4));
              if (q <= 0) return null;
              const x = QX - 160 + rnd(i + 1) * 320;
              const y = mix(-80, QY - 60 + rnd(i + 2) * 160, ease(q));
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${(1 - q) * 360 * (i % 2 ? 1 : -1)})`}>
                  <ellipse rx={22} ry={22 * (0.4 + 0.6 * Math.abs(Math.cos(f * 0.3 + i)))} fill="#e9b949" stroke="#9a7020" strokeWidth={3} />
                  <ellipse rx={12} ry={12 * (0.4 + 0.6 * Math.abs(Math.cos(f * 0.3 + i)))} fill="none" stroke="#fff0b0" strokeWidth={2} opacity={0.7} />
                </g>
              );
            })}
          </svg>
        </div>
      )}
      {pasa > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: pasa}}>
          <Lienzo>
            <Qarawiyyin f={f} t={obra} />
            {/* andamios de madera mientras se construye */}
            <g opacity={Math.max(0, 1 - obra * 1.4)}>
              {[90, 330, 750, 990].map((x, i) => (
                <g key={i} stroke="#8a5a34" strokeWidth={9}>
                  <line x1={x} y1={1060} x2={x} y2={640} />
                  <line x1={x - 40} y1={820} x2={x + 40} y2={820} />
                  <line x1={x - 40} y1={700} x2={x + 40} y2={760} />
                </g>
              ))}
            </g>
            {/* placa con el año */}
            <g opacity={placa} transform={`translate(800 ${mix(380, 420, placa)})`}>
              <rect x={-170} y={-70} width={340} height={120} rx={14} fill="#1f1410" opacity={0.75} />
              <rect x={-170} y={-70} width={340} height={120} rx={14} fill="none" stroke={P.oro} strokeWidth={3} />
              <text y={22} fill={P.oro} fontFamily={serif} fontSize={92} textAnchor="middle">
                859
              </text>
            </g>
            <Polvo f={f} color="#ffe3b0" o={Math.max(0.3, 1 - obra)} n={34} />
          </Lienzo>
        </div>
      )}
    </>
  );
};

// ───────────────────────── 7 · comparativa ─────────────────────────
/** Torres de Bolonia (Asinelli y Garisenda), ladrillo */
const Bolonia: React.FC = () => (
  <g>
    <rect x={-46} y={-330} width={56} height={330} fill="#b5603e" />
    <rect x={-46} y={-330} width={18} height={330} fill="#000" opacity={0.12} />
    <rect x={-54} y={-344} width={72} height={18} fill="#9a4a2e" />
    <path d="M-40,-344 L-18,-380 L4,-344 Z" fill="#7a3a24" />
    <g transform="rotate(5 40 0)">
      <rect x={22} y={-210} width={50} height={210} fill="#c06a46" />
      <rect x={16} y={-220} width={62} height={14} fill="#9a4a2e" />
    </g>
    {Array.from({length: 8}).map((_, i) => (
      <rect key={i} x={-26} y={-300 + i * 36} width={10} height={16} fill="#3a1e14" />
    ))}
  </g>
);
/** Torre gótica de Oxford con pináculos */
const Oxford: React.FC = () => (
  <g>
    <rect x={-60} y={-230} width={120} height={230} fill="#d8c498" />
    <rect x={30} y={-230} width={30} height={230} fill="#000" opacity={0.1} />
    <path d="M-60,-230 L0,-370 L60,-230 Z" fill="#c9b282" />
    {[-60, -20, 20, 60].map((x, i) => (
      <path key={i} d={`M${x - 10},-230 L${x},-290 L${x + 10},-230 Z`} fill="#bfa674" />
    ))}
    {[-30, 30].map((x, i) => (
      <path key={i} d={`M${x - 16},-60 L${x - 16},-150 Q${x},-180 ${x + 16},-150 L${x + 16},-60 Z`} fill="#3a3040" />
    ))}
    <circle cx={0} cy={-190} r={16} fill="#3a3040" />
  </g>
);
/** Alminar de la Qarawiyyin (pequeño) */
const AlminarQ: React.FC = () => (
  <g>
    <rect x={-50} y={-330} width={100} height={330} fill="#f6f0e2" />
    <rect x={20} y={-330} width={30} height={330} fill="#000" opacity={0.08} />
    <path d="M-30,-200 L-30,-260 A30,34 0 1 1 30,-260 L30,-200 Z" fill="#3a2a2a" opacity={0.7} />
    <path d="M-30,-60 L-30,-120 A30,34 0 1 1 30,-120 L30,-60 Z" fill="#3a2a2a" opacity={0.7} />
    <rect x={-50} y={-310} width={100} height={14} fill="#2f8f6a" />
    <rect x={-22} y={-390} width={44} height={60} fill="#f6f0e2" />
    <path d="M-30,-388 Q0,-430 30,-388 Z" fill="#2f8f6a" />
    <line x1={0} y1={-420} x2={0} y2={-450} stroke="#d9b45a" strokeWidth={4} />
    <circle cx={0} cy={-440} r={6} fill="#e9c46a" />
    <path d="M-120,0 L-60,-60 L60,-60 L120,0 Z" fill="#2f8f6a" />
  </g>
);
const Comparativa: React.FC<EscenaProps> = ({f}) => {
  const t = seg(f);
  const fichas = [
    {n: 'Bolonia', a: 1088, x: 210, ent: ease(p(t, 0.1, 0.6)), Ed: Bolonia, col: '#b5603e'},
    {n: 'Oxford', a: 1096, x: 540, ent: ease(p(t, 1.2, 0.6)), Ed: Oxford, col: '#c9b282'},
    {n: 'Qarawiyyin', a: 859, x: 870, ent: ease(p(t, 2.2, 0.7)), Ed: AlminarQ, col: P.oro},
  ];
  const sello = ease(p(t, 3.9, 0.5));
  const base = 1080;
  return (
    <Lienzo>
      <Cielo id="m56-c-c" colores={['#1a1222', '#2e1f30', '#3e2a2a']} />
      <Halo x={870} y={620} r={460} color={P.oroClaro} o={fichas[2].ent * 0.8} />
      <text x={540} y={300} fill="#f6e8d2" fontFamily={serif} fontSize={58} textAnchor="middle">
        ¿Cuál es más antigua?
      </text>
      {fichas.map(({n, a, x, ent, Ed, col}, i) => {
        const edad = 2026 - a;
        const alto = (edad / 1200) * 380 * easeIO(p(t, [0.3, 1.4, 2.4][i], 1.2));
        const gana = i === 2;
        return (
          <g key={i} opacity={ent} transform={`translate(0 ${(1 - ent) * 60})`}>
            {/* edificio */}
            <g transform={`translate(${x} ${base - 420}) scale(${gana ? 0.7 : 0.6})`}>
              <Ed />
            </g>
            {/* barra de antigüedad */}
            <rect x={x - 90} y={base - alto} width={180} height={alto} rx={10} fill={col} opacity={gana ? 1 : 0.75} />
            <rect x={x - 90} y={base - alto} width={180} height={8} rx={4} fill="#fff" opacity={0.35} />
            <text x={x} y={base - alto + 56} fill={gana ? '#2a1a0e' : '#fff6e6'} fontFamily={sans} fontWeight={800} fontSize={40} textAnchor="middle" opacity={alto > 70 ? 1 : 0}>
              {fmt(Math.min(edad, (alto / 380) * 1200))}
            </text>
            <text x={x} y={base - alto + 92} fill={gana ? '#2a1a0e' : '#fff6e6'} fontFamily={sans} fontWeight={700} fontSize={22} textAnchor="middle" opacity={alto > 110 ? 0.8 : 0}>
              años
            </text>
            <text x={x} y={base + 56} fill={gana ? P.oro : '#f6e8d2'} fontFamily={sans} fontWeight={800} fontSize={gana ? 44 : 38} textAnchor="middle">
              {a}
            </text>
            <text x={x} y={base + 98} fill="#f6e8d2" fontFamily={sans} fontWeight={700} fontSize={28} textAnchor="middle" opacity={0.85}>
              {n}
            </text>
          </g>
        );
      })}
      <rect x={60} y={base} width={960} height={4} fill="#f6e8d2" opacity={0.5} />
      {/* sello: sigue abierta */}
      <g transform={`translate(870 ${base - 190}) rotate(-12) scale(${1 + (1 - sello) * 0.8})`} opacity={sello}>
        <rect x={-150} y={-40} width={300} height={76} rx={12} fill="#14301f" opacity={0.85} />
        <rect x={-150} y={-40} width={300} height={76} rx={12} fill="none" stroke="#7fd0a4" strokeWidth={6} />
        <text y={14} fill="#7fd0a4" fontFamily={sans} fontWeight={800} fontSize={34} textAnchor="middle" letterSpacing={2}>
          SIGUE ABIERTA
        </text>
      </g>
      <Polvo f={f} o={0.5} />
    </Lienzo>
  );
};

// ───────────────────────── 8 · contador ─────────────────────────
const Contador: React.FC<EscenaProps> = ({f}) => {
  const t = seg(f);
  const tacha = ease(p(t, 1.6, 0.4));
  const sube = easeIO(p(t, 2.3, 2.1));
  const n = sube > 0 ? mix(70, 1200, sube) : 70;
  const fin = sube >= 1;
  return (
    <Lienzo>
      <Cielo id="m56-k-c" colores={['#1d1a3a', '#6a3a5a', '#e0805a', '#ffc98a']} />
      <Halo x={540} y={980} r={600} color="#ffcf8a" />
      {/* horizonte con monumentos de Marruecos en silueta */}
      <g fill="#1e1424">
        {/* Kutubía */}
        <rect x={70} y={640} width={110} height={420} />
        <rect x={98} y={570} width={54} height={74} />
        <path d="M92,572 Q125,540 158,572 Z" />
        <line x1={125} y1={548} x2={125} y2={510} stroke="#1e1424" strokeWidth={5} />
        {/* Torre Hassan */}
        <rect x={270} y={740} width={150} height={320} />
        {/* cúpulas y murallas */}
        <path d="M420,1060 L420,880 L470,880 L470,860 L520,860 L520,880 L560,880 A70,70 0 0 1 700,880 L740,880 L740,1060 Z" />
        {/* alminar de la Qarawiyyin */}
        <rect x={760} y={700} width={100} height={360} />
        <rect x={786} y={640} width={48} height={64} />
        <path d="M778,642 Q810,612 842,642 Z" />
        {/* palmeras */}
        {[230, 930, 1010].map((x, i) => (
          <g key={i}>
            <path d={`M${x},1060 Q${x + 10},900 ${x - 5},800`} stroke="#1e1424" strokeWidth={10} fill="none" />
            {[-1, -0.4, 0.3, 1].map((s, j) => (
              <path key={j} d={`M${x - 5},800 q${s * 60},-30 ${s * 110},20`} stroke="#1e1424" strokeWidth={9} fill="none" />
            ))}
          </g>
        ))}
        <rect x={0} y={1050} width={W} height={H - 1050} />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={110 + (i % 2) * 20} y={700 + i * 80} width={14} height={30} fill="#ffcf8a" opacity={0.4} />
      ))}
      {/* el número */}
      <text x={540} y={500} fill={fin ? P.oro : '#fff6e6'} fontFamily={sans} fontWeight={800} fontSize={fin ? 200 : 220} textAnchor="middle" filter={fin ? 'url(#brillo)' : undefined}>
        {fin ? '+1.200' : fmt(n)}
      </text>
      <text x={540} y={580} fill="#fff6e6" fontFamily={sans} fontWeight={700} fontSize={50} textAnchor="middle" opacity={0.9}>
        años de historia
      </text>
      {sube === 0 && tacha > 0 && (
        <line x1={380} y1={450} x2={380 + 320 * tacha} y2={380} stroke="#e85c4a" strokeWidth={22} strokeLinecap="round" />
      )}
      <Polvo f={f} color={P.oroClaro} o={fin ? 1 : 0.5} n={40} />
    </Lienzo>
  );
};

// ───────────────────────── 9 · cta ─────────────────────────
const Farol: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(f * 0.04) * 3} 0 -200)`}>
    <line x1={0} y1={-260} x2={0} y2={-90} stroke="#3a2416" strokeWidth={4} />
    <Halo x={0} y={20} r={300} color="#ffcf7a" />
    <path d="M-30,-90 L30,-90 L50,-50 L-50,-50 Z" fill="#b08a3a" />
    <path d="M-50,-50 L50,-50 L60,60 L0,110 L-60,60 Z" fill="#ffd27a" />
    {Array.from({length: 5}).map((_, i) => (
      <circle key={i} cx={-30 + i * 15} cy={0} r={6} fill="#7a5420" />
    ))}
    {Array.from({length: 4}).map((_, i) => (
      <path key={i} d={`M${-45 + i * 30},-40 L${-45 + i * 30 + 15},60`} stroke="#7a5420" strokeWidth={3} />
    ))}
    <path d="M-50,-50 L50,-50 L60,60 L0,110 L-60,60 Z" fill="none" stroke="#7a5420" strokeWidth={5} />
    <circle cx={0} cy={120} r={8} fill="#b08a3a" />
  </g>
);
const OPCIONES = ['Ibn Battuta, el gran viajero', 'La batalla de los Tres Reyes', 'Yusuf ibn Tashfin y Marrakech'];
const Cta: React.FC<EscenaProps> = ({f}) => {
  const t = seg(f);
  return (
    <Lienzo>
      <Cielo id="m56-t-c" colores={P.interior} />
      <Zellige x={0} y={1040} w={W} h={70} id="m56-t-z" />
      <rect x={0} y={1110} width={W} height={900} fill="#2a1a18" />
      <Farol x={90} y={250} f={f} />
      <Farol x={990} y={220} f={f + 20} />
      <text x={540} y={420} fill="#fff1d6" fontFamily={serif} fontSize={70} textAnchor="middle" opacity={ease(p(t, 0, 0.5))}>
        ¿La próxima historia?
      </text>
      {OPCIONES.map((o, i) => {
        const e = ease(p(t, 0.6 + i * 0.7, 0.5));
        const y = 590 + i * 165;
        const votos = Math.round(mix(0, [312, 248, 190][i], easeIO(p(t, 1 + i * 0.7, 2.5))));
        return (
          <g key={i} opacity={e} transform={`translate(${(1 - e) * -80} ${y})`}>
            <rect x={110} y={-60} width={860} height={130} rx={34} fill="#000" opacity={0.3} transform="translate(8 10)" />
            <rect x={110} y={-60} width={860} height={130} rx={34} fill="#fbf3e6" />
            <circle cx={180} cy={5} r={38} fill={['#c8623e', '#2f8f8a', '#3b5a8f'][i]} />
            <text x={180} y={20} fill="#fff" fontFamily={sans} fontWeight={800} fontSize={40} textAnchor="middle">
              {i + 1}
            </text>
            <text x={240} y={20} fill="#2a1a12" fontFamily={sans} fontWeight={800} fontSize={38}>
              {o}
            </text>
            <path d={`M900,-6 c-12,-20 -40,-8 -30,12 l30,26 l30,-26 c10,-20 -18,-32 -30,-12 Z`} fill="#e8505b" transform="translate(0 -6) scale(1)" />
            <text x={900} y={56} fill="#7a5a4a" fontFamily={sans} fontWeight={700} fontSize={22} textAnchor="middle">
              {votos}
            </text>
          </g>
        );
      })}
      <Polvo f={f} color="#ffe3a0" o={0.6} />
    </Lienzo>
  );
};

export const MARRUECOS_1956: Record<string, React.FC<EscenaProps>> = {
  'marruecos-1956/ano1956': Ano1956,
  'marruecos-1956/grieta': Grieta,
  'marruecos-1956/independencia': Independencia,
  'marruecos-1956/lineatiempo': LineaTiempo,
  'marruecos-1956/mapa': Mapa,
  'marruecos-1956/herencia-obra': HerenciaObra,
  'marruecos-1956/comparativa': Comparativa,
  'marruecos-1956/contador': Contador,
  'marruecos-1956/cta': Cta,
};

/** Hacia dónde mira la cámara en cada escena */
export const FOCOS_MARRUECOS_1956: Record<string, FocoEscena> = {
  'marruecos-1956/ano1956': {x: 540, y: 700},
  'marruecos-1956/grieta': {x: 540, y: 700},
  'marruecos-1956/independencia': (f) => ({x: mix(360, 700, Math.min(1, f / 140)), y: 720}),
  'marruecos-1956/lineatiempo': (f) => ({x: 540, y: f < 80 ? 560 : mix(560, 820, Math.min(1, (f - 80) / 40))}),
  'marruecos-1956/mapa': (f, d) => {
    const pos = enRuta(viaje(f, d - VIAJE_FIN));
    const b = easeIO(p(f, d - VIAJE_FIN - 6, VIAJE_FIN));
    return {x: mix(pos.x, QX, b), y: mix(pos.y, QY, b)};
  },
  'marruecos-1956/herencia-obra': (f) => (f < 60 ? {x: QX, y: QY} : {x: 540, y: 760}),
  'marruecos-1956/comparativa': (f) => ({x: mix(300, 760, Math.min(1, f / 110)), y: 760}),
  'marruecos-1956/contador': {x: 540, y: 700},
  'marruecos-1956/cta': {x: 540, y: 700},
};
