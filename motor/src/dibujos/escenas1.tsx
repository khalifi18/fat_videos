// Escenas de historia (1/2): puerta, arbol, semilla, camino, vela, luna, te, madre
import React from 'react';
import {P, W} from '../tema';
import {Cielo, Colinas, EscenaProps, Estrellas, Halo, Lienzo, Polvo, Silueta, Zellige, ease, easeIO, mix, p, rnd} from './base';

/* ───── puerta: puerta marroquí de arco de herradura; se abre en la clave (opts: cierra) ───── */
export const Puerta: React.FC<EscenaProps> = ({f, k, opts}) => {
  const cierra = opts.includes('cierra');
  const a = easeIO(p(f, k - 4, 34));
  const open = cierra ? 1 - a : a;
  const cx = W / 2, x0 = 330, x1 = 750, ya = 700, yb = 1210;
  const arco = `M${x0},${yb} L${x0},${ya} A230,230 0 1 1 ${x1},${ya} L${x1},${yb} Z`;
  const marco = `M${x0 - 60},${yb} L${x0 - 60},${ya} A292,292 0 1 1 ${x1 + 60},${ya} L${x1 + 60},${yb} Z`;
  const hoja = (lado: -1 | 1) => {
    const bisagra = lado < 0 ? x0 : x1;
    const sx = mix(1, 0.08, open);
    return (
      <g transform={`translate(${bisagra} 0) scale(${sx} 1) translate(${-bisagra} 0)`}>
        <clipPath id={`pu-h${lado}`}>
          <rect x={lado < 0 ? x0 : cx} y={300} width={210} height={1000} />
        </clipPath>
        <g clipPath={`url(#pu-h${lado})`}>
          <path d={arco} fill="url(#pu-madera)" />
          {[0, 1, 2, 3, 4, 5].map((r) =>
            [0, 1].map((c) => <circle key={`${r}${c}`} cx={(lado < 0 ? x0 + 60 : cx + 60) + c * 90} cy={720 + r * 80} r={9} fill={P.oro} opacity={0.9} />),
          )}
          <rect x={lado < 0 ? x0 + 30 : cx + 30} y={760} width={150} height={360} rx={12} fill="none" stroke={P.maderaOsc} strokeWidth={6} opacity={0.6} />
          <path d={arco} fill="#000" opacity={0.35 * open} />
        </g>
      </g>
    );
  };
  return (
    <Lienzo>
      <defs>
        <linearGradient id="pu-pared" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2630" />
          <stop offset="0.5" stopColor="#7a5045" />
          <stop offset="1" stopColor="#2a1a20" />
        </linearGradient>
        <linearGradient id="pu-madera" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5a2e1e" />
          <stop offset="0.5" stopColor="#8a4a2e" />
          <stop offset="1" stopColor="#5a2e1e" />
        </linearGradient>
        <radialGradient id="pu-luz" cx="50%" cy="60%" r="60%">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.5" stopColor={P.oroClaro} />
          <stop offset="1" stopColor={P.oro} />
        </radialGradient>
        <linearGradient id="pu-rayo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.oroClaro} stopOpacity={0.6} />
          <stop offset="1" stopColor={P.oroClaro} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect width={W} height={1920} fill="url(#pu-pared)" />
      <Halo x={cx} y={900} r={mix(200, 620, open)} color={P.oroClaro} o={0.3 + 0.7 * open} />
      {/* marco de yeso y azulejo */}
      <path d={marco} fill="#c9b49a" opacity={0.95} />
      <path d={marco} fill="none" stroke={P.turquesa} strokeWidth={18} />
      <path d={`M${x0 - 30},${yb} L${x0 - 30},${ya} A262,262 0 1 1 ${x1 + 30},${ya} L${x1 + 30},${yb}`} fill="none" stroke={P.oro} strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" />
      <path d={arco} fill="url(#pu-luz)" opacity={0.25 + 0.75 * open} />
      {hoja(-1)}
      {hoja(1)}
      {/* suelo */}
      <rect x={0} y={yb} width={W} height={720} fill="#2a1c20" />
      <Zellige x={0} y={yb} w={W} h={46} id="pu-z" />
      <polygon points={`${x0},${yb + 46} ${x1},${yb + 46} ${x1 + 420 * open},${1920} ${x0 - 420 * open},${1920}`} fill="url(#pu-rayo)" opacity={open} />
      {/* farol */}
      <line x1={190} y1={300} x2={190} y2={560} stroke="#1a1014" strokeWidth={4} />
      <Halo x={190} y={620} r={150} o={0.8} />
      <path d="M150,560 L230,560 L250,610 L215,690 L165,690 L130,610 Z" fill={P.oro} opacity={0.95} />
      <path d="M150,560 L230,560 L250,610 L215,690 L165,690 L130,610 Z" fill="none" stroke="#3a2418" strokeWidth={5} />
      {/* maceta */}
      <path d="M840,1210 L960,1210 L940,1110 L860,1110 Z" fill={P.terracota} />
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={900 + (i - 2) * 26} cy={1060 - Math.abs(i - 2) * -12} rx={22} ry={60} fill={i % 2 ? P.verde : P.verdeOsc} transform={`rotate(${(i - 2) * 18 + Math.sin(f * 0.05 + i) * 3} 900 1110)`} />
      ))}
      <Polvo f={f} o={0.4 + 0.6 * open} />
    </Lienzo>
  );
};

/* ───── arbol: árbol en una colina al atardecer (opts: raices → corte con raíces doradas, el árbol crece en la clave) ───── */
export const Arbol: React.FC<EscenaProps> = ({f, k, opts}) => {
  const raices = opts.includes('raices');
  const crece = raices ? ease(p(f, k - 4, 30)) : ease(p(f, 0, 36));
  const rz = raices ? ease(p(f, 0, Math.max(30, k))) : 0;
  const fruto = ease(p(f, raices ? k + 24 : k, 18));
  const y0 = raices ? 980 : 1150;
  const sway = Math.sin(f * 0.05) * 1.5;
  const copa = [
    [540, y0 - 560, 190, '#3f7a45'],
    [400, y0 - 470, 150, '#356b3d'],
    [680, y0 - 470, 155, '#356b3d'],
    [450, y0 - 620, 140, '#5f9a57'],
    [630, y0 - 620, 145, '#5f9a57'],
    [540, y0 - 700, 120, '#7cb46a'],
  ] as const;
  const rutas = [
    `M540,${y0} C520,${y0 + 90} 420,${y0 + 140} 330,${y0 + 260}`,
    `M540,${y0} C560,${y0 + 100} 660,${y0 + 150} 760,${y0 + 270}`,
    `M540,${y0} C535,${y0 + 140} 520,${y0 + 230} 545,${y0 + 360}`,
    `M500,${y0 + 70} C450,${y0 + 120} 380,${y0 + 160} 250,${y0 + 160}`,
    `M590,${y0 + 80} C640,${y0 + 130} 720,${y0 + 150} 840,${y0 + 140}`,
  ];
  return (
    <Lienzo>
      <Cielo id="ar-c" colores={P.cieloAtardecer} />
      <Halo x={760} y={y0 - 260} r={260} color={P.oroClaro} />
      <circle cx={760} cy={y0 - 240} r={90} fill={P.oroClaro} opacity={0.9} />
      <Colinas y={y0 - 80} colores={['#7a4a6a', '#5a3552']} f={f} />
      {/* colina principal */}
      <path d={`M-50,${y0 + 30} C250,${y0 - 60} 830,${y0 - 60} 1130,${y0 + 30} L1130,1920 L-50,1920 Z`} fill="#2f2a3a" />
      {raices && (
        <g>
          <rect x={0} y={y0 + 10} width={W} height={1000} fill="#2a1a18" />
          <path d={`M0,${y0 + 10} L${W},${y0 + 10}`} stroke="#5a3a2a" strokeWidth={6} />
          {Array.from({length: 40}).map((_, i) => (
            <circle key={i} cx={rnd(i) * W} cy={y0 + 40 + rnd(i + 3) * 420} r={3 + rnd(i + 5) * 6} fill="#3e2620" />
          ))}
          <Halo x={540} y={y0 + 200} r={320} o={rz} />
          {rutas.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={P.oro} strokeWidth={i < 3 ? 18 : 10} strokeLinecap="round" strokeDasharray={480} strokeDashoffset={480 * (1 - Math.min(1, rz * 1.6 - i * 0.12))} filter="url(#brillo)" />
          ))}
        </g>
      )}
      <g transform={`rotate(${sway} 540 ${y0})`}>
        <path d={`M512,${y0 + 10} C520,${y0 - 160} 500,${y0 - 300} 528,${y0 - 430} L556,${y0 - 430} C570,${y0 - 300} 560,${y0 - 160} 572,${y0 + 10} Z`} fill={P.madera} transform={`translate(540 ${y0}) scale(1 ${crece}) translate(-540 ${-y0})`} />
        <g opacity={crece}>
          <path d={`M530,${y0 - 300} C480,${y0 - 360} 440,${y0 - 380} 400,${y0 - 440}`} stroke={P.madera} strokeWidth={22} strokeLinecap="round" fill="none" />
          <path d={`M555,${y0 - 330} C600,${y0 - 380} 640,${y0 - 400} 680,${y0 - 460}`} stroke={P.madera} strokeWidth={22} strokeLinecap="round" fill="none" />
        </g>
        <g transform={`translate(540 ${y0 - 520}) scale(${crece}) translate(-540 ${-(y0 - 520)})`}>
          {copa.map(([x, y, r, c], i) => (
            <circle key={i} cx={x + Math.sin(f * 0.04 + i) * 3} cy={y} r={r} fill={c} />
          ))}
          {copa.map(([x, y, r], i) => (
            <circle key={'l' + i} cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.45} fill="#a8d08a" opacity={0.18} />
          ))}
          {Array.from({length: 9}).map((_, i) => (
            <circle key={'f' + i} cx={400 + rnd(i) * 280} cy={y0 - 720 + rnd(i + 9) * 300} r={14 * fruto} fill={P.oro} filter="url(#brillo)" />
          ))}
        </g>
      </g>
      <Polvo f={f} o={0.5} />
    </Lienzo>
  );
};

/* ───── semilla: corte de tierra; la semilla brota y florece en la clave ───── */
export const Semilla: React.FC<EscenaProps> = ({f, k}) => {
  const g = ease(p(f, 6, Math.max(24, k - 6)));
  const flor = ease(p(f, k, 22));
  const y0 = 1000;
  const top = y0 - 380 * g;
  return (
    <Lienzo>
      <Cielo id="se-c" colores={P.cieloAmanecer} />
      <Halo x={540} y={500} r={360} color={P.oroClaro} o={0.5 + 0.5 * flor} />
      <rect x={0} y={y0} width={W} height={920} fill="#3a2418" />
      <path d={`M0,${y0} C300,${y0 - 30} 780,${y0 - 30} ${W},${y0}`} fill="#4a2e1e" />
      {Array.from({length: 50}).map((_, i) => (
        <ellipse key={i} cx={rnd(i) * W} cy={y0 + 40 + rnd(i + 3) * 700} rx={4 + rnd(i + 5) * 10} ry={3 + rnd(i + 6) * 6} fill="#2a1810" />
      ))}
      <ellipse cx={540} cy={y0 + 120} rx={34} ry={24} fill="#c99a5b" />
      <path d={`M540,${y0 + 110} C520,${y0 + 160} 500,${y0 + 200} 470,${y0 + 230} M540,${y0 + 110} C560,${y0 + 170} 590,${y0 + 210} 620,${y0 + 220}`} stroke="#d9b68a" strokeWidth={5} fill="none" opacity={g} />
      <path d={`M540,${y0 + 100} C548,${y0 - 100 * g} 528,${y0 - 260 * g} 540,${top}`} stroke={P.verde} strokeWidth={16} fill="none" strokeLinecap="round" />
      {[0.35, 0.6].map((t, i) => {
        const s = ease(p(f, 12 + i * 10, 18)) * g;
        const y = y0 - 380 * g * t;
        const dir = i % 2 ? 1 : -1;
        return (
          <path key={i} d={`M540,${y} C${540 + dir * 70},${y - 80} ${540 + dir * 150},${y - 50} ${540 + dir * 170},${y - 10} C${540 + dir * 120},${y + 24} ${540 + dir * 60},${y + 12} 540,${y} Z`} fill={i ? P.verde : '#79b36a'} transform={`translate(540 ${y}) scale(${s}) translate(-540 ${-y})`} />
        );
      })}
      <Halo x={540} y={top} r={260} color={P.rosa} o={flor} />
      <g transform={`translate(540 ${top}) scale(${flor}) rotate(${f * 0.3})`}>
        {Array.from({length: 8}).map((_, i) => (
          <ellipse key={i} cx={0} cy={-66} rx={36} ry={66} fill={i % 2 ? '#f3b1a6' : P.rosa} transform={`rotate(${i * 45})`} />
        ))}
        <circle r={40} fill={P.oro} />
      </g>
      <Polvo f={f} o={flor} />
    </Lienzo>
  );
};

/* ───── camino: una mujer camina por un camino entre colinas; sale el sol en la clave ───── */
export const Camino: React.FC<EscenaProps> = ({f, d, k}) => {
  const sol = ease(p(f, k - 6, 50));
  const hz = 900;
  const t = mix(0.05, 0.45, f / Math.max(1, d));
  const q = (t: number, a: number, b: number, c: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
  const fx = q(t, 540, 760, 540), fy = q(t, 1500, 1120, hz + 10);
  const fs = mix(0.85, 0.2, t);
  return (
    <Lienzo>
      <Cielo id="ca-c" colores={['#1d2a4f', '#4f5a92', '#d98a7a', '#ffd9a0']} />
      <Cielo id="ca-c2" colores={P.cieloAmanecer} o={sol} />
      <Halo x={540} y={hz - 120 * sol} r={mix(200, 600, sol)} color={P.oroClaro} />
      <circle cx={540} cy={hz + 60 - 220 * sol} r={110} fill="#fff1c9" />
      <Colinas y={hz + 20} colores={['#6a5a8a', '#4a3a6a', '#2e2448']} f={f} />
      <path d={`M220,1920 Q760,1150 525,${hz + 10} L555,${hz + 10} Q840,1150 860,1920 Z`} fill="#c9a77e" opacity={0.85} />
      <path d={`M540,1920 Q800,1150 540,${hz + 10}`} fill="none" stroke="#fff1d8" strokeOpacity={0.5} strokeWidth={8} strokeDasharray="40 34" />
      <ellipse cx={fx + 40 * fs} cy={fy} rx={80 * fs} ry={14 * fs} fill="#000" opacity={0.3} />
      <g transform={`translate(0 ${-Math.abs(Math.sin(f * 0.22)) * 6 * fs})`}>
        <Silueta x={fx} y={fy} s={fs} tipo="mujer" color="#1a1424" />
      </g>
      <Polvo f={f} o={0.4 + 0.4 * sol} />
    </Lienzo>
  );
};

/* ───── vela: vela junto a la ventana de noche; su luz crece en la clave (opts: apaga) ───── */
export const Vela: React.FC<EscenaProps> = ({f, k, opts}) => {
  const apaga = opts.includes('apaga');
  const enc = ease(p(f, 4, 14));
  const llama = apaga ? enc * (1 - easeIO(p(f, k, 16))) : enc;
  const luz = apaga ? llama : mix(0.45, 1, ease(p(f, k, 36))) * enc;
  const fl = 1 + 0.06 * Math.sin(f * 0.7) + 0.04 * Math.sin(f * 1.9);
  return (
    <Lienzo>
      <rect width={W} height={1920} fill="#120d18" />
      {/* ventana */}
      <path d="M300,1000 L300,560 A240,240 0 0 1 780,560 L780,1000 Z" fill="#1d2a52" />
      <Estrellas f={f} n={30} hasta={400} />
      <circle cx={660} cy={500} r={46} fill="#fff1c9" opacity={0.9} />
      <path d="M300,1000 L300,560 A240,240 0 0 1 780,560 L780,1000 Z" fill="none" stroke="#2a1e26" strokeWidth={30} />
      <line x1={540} y1={330} x2={540} y2={1000} stroke="#2a1e26" strokeWidth={18} />
      <line x1={300} y1={720} x2={780} y2={720} stroke="#2a1e26" strokeWidth={18} />
      {/* luz de la vela */}
      <Halo x={540} y={1060} r={mix(200, 760, luz)} color={P.oro} o={luz} />
      {/* mesa */}
      <rect x={0} y={1180} width={W} height={740} fill="#2a1a18" />
      <rect x={0} y={1180} width={W} height={20} fill="#4a2e22" opacity={0.6 + 0.4 * luz} />
      <ellipse cx={540} cy={1185} rx={180} ry={26} fill="#000" opacity={0.4} />
      {/* vela */}
      <defs>
        <linearGradient id="ve-cera" x1="0" x2="1">
          <stop offset="0" stopColor="#fff3dc" />
          <stop offset="0.6" stopColor="#f0dcb8" />
          <stop offset="1" stopColor="#bfa27c" />
        </linearGradient>
      </defs>
      <rect x={470} y={900} width={140} height={285} rx={16} fill="url(#ve-cera)" />
      <path d="M470,930 C490,930 492,990 504,990 C516,990 514,930 540,930 C556,930 556,960 566,960 C578,960 576,930 610,930 L610,912 L470,912 Z" fill="#fff6e6" />
      <line x1={540} y1={912} x2={540} y2={880} stroke="#2b2025" strokeWidth={6} strokeLinecap="round" />
      <g transform={`translate(540 886) scale(${llama * fl} ${llama * (fl + 0.05)})`} filter="url(#brillo)">
        <path d="M0,0 C36,-30 28,-96 0,-150 C-28,-96 -36,-30 0,0 Z" fill={P.oro} />
        <path d="M0,-4 C20,-24 16,-62 0,-96 C-16,-62 -20,-24 0,-4 Z" fill="#fffbe8" />
      </g>
      {apaga && p(f, k + 6, 50) > 0 && (
        <path d={`M540,870 C${515 + 30 * Math.sin(f * 0.1)},800 ${565 - 30 * Math.sin(f * 0.1)},740 540,${680 - 90 * p(f, k + 6, 50)}`} stroke="#bba" strokeWidth={8} fill="none" opacity={0.5 * (1 - p(f, k + 6, 50))} strokeLinecap="round" />
      )}
    </Lienzo>
  );
};

/* ───── luna: noche sobre la medina, luna creciente; estrella fugaz y ventanas que se encienden en la clave ───── */
export const Luna: React.FC<EscenaProps> = ({f, k}) => {
  const ent = ease(p(f, 0, 24));
  const fug = p(f, k, 20);
  const ventanas = [
    [120, 1080], [300, 1010], [420, 1100], [690, 1060], [850, 1000], [960, 1110], [230, 1150], [770, 1160],
  ];
  return (
    <Lienzo>
      <Cielo id="lu-c" colores={P.cieloNoche} />
      <Estrellas f={f} hasta={800} o={ent} />
      <Halo x={680} y={520} r={330} color={P.oroClaro} o={ent} />
      <defs>
        <mask id="lu-m">
          <rect width={W} height={1920} fill="#fff" />
          <circle cx={745} cy={470} r={160} fill="#000" />
        </mask>
      </defs>
      <circle cx={680} cy={520} r={180} fill="#fff1c9" mask="url(#lu-m)" opacity={ent} />
      {fug > 0 && fug < 1 && (
        <line x1={mix(80, 700, fug)} y1={mix(220, 520, fug)} x2={mix(80, 700, fug) - 200} y2={mix(220, 520, fug) - 96} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={Math.sin(fug * Math.PI)} />
      )}
      {/* medina */}
      <path d="M0,1020 L0,960 L90,960 L90,900 L170,900 L170,980 L260,980 L260,930 A70,70 0 0 1 400,930 L400,990 L470,990 L470,1000 L560,1000 L560,960 L620,960 L620,700 L700,700 L700,960 L760,960 A90,90 0 0 1 940,960 L940,920 L1080,920 L1080,1920 L0,1920 Z" fill="#1a1328" />
      <rect x={626} y={660} width={68} height={50} fill="#1a1328" />
      <rect x={648} y={620} width={24} height={44} fill="#1a1328" />
      <circle cx={660} cy={606} r={10} fill={P.oro} opacity={0.8} />
      <path d="M0,1200 L0,1100 L180,1100 L180,1060 L360,1060 L360,1120 L540,1120 L540,1080 L760,1080 L760,1130 L1080,1130 L1080,1920 L0,1920 Z" fill="#0f0a18" />
      {ventanas.map(([x, y], i) => {
        const on = ease(p(f, k - 10 + i * 4, 10));
        return (
          <g key={i}>
            <Halo x={x} y={y} r={60} o={on * 0.7} />
            <path d={`M${x - 14},${y + 22} L${x - 14},${y} A14,14 0 0 1 ${x + 14},${y} L${x + 14},${y + 22} Z`} fill={on > 0.05 ? P.oroClaro : '#2a2038'} opacity={0.4 + 0.6 * on} />
          </g>
        );
      })}
    </Lienzo>
  );
};

/* ───── te: bandeja con tetera y vaso de té marroquí; sirve el té en la clave (familia, hospitalidad, calma) ───── */
export const Te: React.FC<EscenaProps> = ({f, k}) => {
  const sube = easeIO(p(f, k - 10, 16));
  const chorro = p(f, k + 4, 30);
  const lleno = ease(p(f, k + 6, 30));
  const vapor = 0.4 + 0.6 * lleno;
  return (
    <Lienzo>
      <Cielo id="te-c" colores={P.interior} />
      <Halo x={540} y={900} r={520} color={P.oro} o={0.6} />
      {/* bandeja */}
      <ellipse cx={540} cy={1160} rx={420} ry={110} fill="#8a6a3a" />
      <ellipse cx={540} cy={1150} rx={400} ry={100} fill="url(#te-laton)" />
      <defs>
        <radialGradient id="te-laton" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#ffe3a0" />
          <stop offset="0.6" stopColor="#d9a54a" />
          <stop offset="1" stopColor="#8a6a3a" />
        </radialGradient>
        <linearGradient id="te-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#8a8f96" />
          <stop offset="0.35" stopColor="#f2f4f6" />
          <stop offset="1" stopColor="#6a6f76" />
        </linearGradient>
        <linearGradient id="te-vaso" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.25} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0.08} />
        </linearGradient>
      </defs>
      {/* vaso */}
      <path d="M640,1140 L620,960 L780,960 L760,1140 Z" fill="url(#te-vaso)" stroke="#fff" strokeOpacity={0.5} strokeWidth={4} />
      <clipPath id="te-clip">
        <path d="M640,1140 L620,960 L780,960 L760,1140 Z" />
      </clipPath>
      <rect x={600} y={1140 - 170 * lleno} width={200} height={200} fill="#b5651d" opacity={0.85} clipPath="url(#te-clip)" />
      <path d="M626,1010 L774,1010 M632,1060 L768,1060" stroke={P.oro} strokeWidth={6} opacity={0.9} />
      <path d="M630,1035 l12,-10 l12,10 l12,-10 l12,10 l12,-10 l12,10 l12,-10 l12,10 l12,-10 l12,10 l12,-10" stroke="#3f8f5a" strokeWidth={4} fill="none" />
      {/* vapor */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${680 + i * 22},940 C${660 + i * 22 + Math.sin(f * 0.08 + i) * 20},880 ${710 + i * 22},840 ${690 + i * 22 + Math.sin(f * 0.06 + i) * 24},780`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.25 * vapor} strokeLinecap="round" />
      ))}
      {/* tetera */}
      <g transform={`translate(400 ${1130 - 180 * sube}) rotate(${-28 * sube})`}>
        <ellipse cx={0} cy={0} rx={130} ry={24} fill="#000" opacity={0.25 * (1 - sube)} />
        <path d="M-110,-10 C-130,-120 -80,-200 0,-200 C80,-200 130,-120 110,-10 Z" fill="url(#te-metal)" />
        <path d="M-60,-200 C-60,-250 60,-250 60,-200 Z" fill="url(#te-metal)" />
        <path d="M-12,-250 C-12,-290 12,-290 12,-250 Z" fill="url(#te-metal)" />
        <path d="M105,-90 C170,-110 200,-160 250,-200 L262,-188 C220,-140 190,-80 112,-50 Z" fill="url(#te-metal)" />
        <path d="M-108,-150 C-190,-160 -190,-40 -108,-50" stroke="#7a7f86" strokeWidth={16} fill="none" />
        <path d="M-90,-110 L90,-110" stroke={P.oro} strokeWidth={6} />
      </g>
      {chorro > 0 && chorro < 1 && (
        <path d={`M${400 + 245 * Math.cos(0) - 30},${1130 - 180 - 175} Q700,860 700,${960 + 180 * (1 - lleno)}`} stroke="#b5651d" strokeWidth={10} fill="none" opacity={Math.sin(chorro * Math.PI) * 0.95} />
      )}
      <Polvo f={f} o={0.5} />
    </Lienzo>
  );
};

/* ───── madre: madre e hijo de la mano al atardecer; en la clave el niño la mira y aparece un brillo ───── */
export const Madre: React.FC<EscenaProps> = ({f, d, k}) => {
  const t = f / Math.max(1, d);
  const x = mix(380, 560, t);
  const brillo = ease(p(f, k, 26));
  return (
    <Lienzo>
      <Cielo id="ma-c" colores={P.cieloAtardecer} />
      <Halo x={700} y={980} r={360} color={P.oroClaro} />
      <circle cx={700} cy={1010} r={120} fill="#ffe2a8" />
      <Colinas y={1060} colores={['#8a4a6a', '#5a3050', '#2a1a2e']} f={f} />
      <rect x={0} y={1240} width={W} height={700} fill="#1a1222" />
      <ellipse cx={x + 40} cy={1242} rx={260} ry={18} fill="#000" opacity={0.35} />
      <g transform={`translate(0 ${-Math.abs(Math.sin(f * 0.2)) * 4})`}>
        <Silueta x={x} y={1240} s={1.25} tipo="mujer" color={P.silueta} />
      </g>
      <g transform={`translate(0 ${-Math.abs(Math.sin(f * 0.2 + 1)) * 5})`}>
        <Silueta x={x + 170} y={1240} s={1.15} tipo="nino" color={P.silueta} />
      </g>
      <path d={`M${x + 95},${1240 - 330} C${x + 120},${1240 - 280} ${x + 130},${1240 - 260} ${x + 128},${1240 - 220}`} stroke={P.silueta} strokeWidth={22} strokeLinecap="round" fill="none" />
      <Halo x={x + 112} y={1240 - 230} r={120} o={brillo} />
      <circle cx={x + 112} cy={1240 - 230} r={10 * brillo} fill="#fff6dc" filter="url(#brillo)" />
      <Polvo f={f} o={0.6} />
    </Lienzo>
  );
};
