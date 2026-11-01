// Escenas de historia (2/2): pajaro, lluvia, corazon, casa, mar, reloj, gente
import React from 'react';
import {P, W} from '../tema';
import {Cielo, Colinas, EscenaProps, Estrellas, Halo, Lienzo, Polvo, Silueta, Zellige, ease, easeIO, mix, p, rnd} from './base';

/* ───── pajaro: jaula junto a la ventana; en la clave se abre y el pájaro sale volando al cielo ───── */
export const Pajaro: React.FC<EscenaProps> = ({f, k}) => {
  const puerta = easeIO(p(f, k - 2, 14));
  const vuelo = easeIO(p(f, k + 8, 46));
  const cx = 540, top = 760, base = 1100, r = 200;
  const xs = Array.from({length: 9}).map((_, i) => cx - r + ((i + 1) * 2 * r) / 10);
  const yTop = (x: number) => top - Math.sqrt(Math.max(0, r * r - (x - cx) * (x - cx)));
  const bx = mix(540, 900, vuelo) + Math.sin(vuelo * 7) * 30 * vuelo;
  const by = mix(1020, 330, vuelo);
  const ala = vuelo > 0 && vuelo < 1 ? Math.sin(f * 0.9) * 45 : Math.sin(f * 0.15) * 6;
  const bs = mix(1, 0.6, vuelo);
  return (
    <Lienzo>
      <Cielo id="pj-c" colores={P.cieloDia} />
      <Colinas y={1150} colores={['#9ab8c8', '#7a9aa8']} f={f} />
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={(200 + i * 380 + f * 0.6) % 1300 - 100} cy={300 + i * 90} rx={150} ry={46} fill="#fff" opacity={0.7} />
      ))}
      {/* marco de ventana */}
      <path d="M0,0 L1080,0 L1080,1920 L0,1920 Z M130,1300 L130,420 A410,410 0 0 1 950,420 L950,1300 Z" fill="#e9dcc6" fillRule="evenodd" />
      <path d="M130,1300 L130,420 A410,410 0 0 1 950,420 L950,1300" fill="none" stroke="#c8b493" strokeWidth={14} />
      <rect x={90} y={1300} width={900} height={60} fill="#c8b493" />
      <Zellige x={0} y={1360} w={W} h={60} id="pj-z" />
      <rect x={0} y={1420} width={W} height={500} fill="#d9c8ac" />
      {/* jaula */}
      <g>
        <line x1={cx} y1={0} x2={cx} y2={top - r - 30} stroke="#6a5030" strokeWidth={5} />
        <circle cx={cx} cy={top - r - 14} r={18} fill="none" stroke={P.oro} strokeWidth={7} />
        <path d={`M${cx - r},${base} L${cx - r},${top} A${r},${r} 0 0 1 ${cx + r},${top} L${cx + r},${base}`} fill="none" stroke={P.oro} strokeWidth={10} />
        {xs.map((x, i) => (x > 470 && x < 610 ? null : <line key={i} x1={x} y1={base} x2={x} y2={yTop(x)} stroke={P.oro} strokeWidth={5} />))}
        <ellipse cx={cx} cy={base + 10} rx={r + 26} ry={26} fill="#a8742e" />
        <line x1={cx - r} x2={cx + r} y1={top + 80} y2={top + 80} stroke={P.oro} strokeWidth={5} />
        <g transform={`translate(470 0) scale(${mix(1, 0.06, puerta)} 1) translate(-470 0)`}>
          <rect x={470} y={900} width={140} height={200} fill="none" stroke={P.oroClaro} strokeWidth={8} />
          {[505, 540, 575].map((x) => (
            <line key={x} x1={x} x2={x} y1={900} y2={1100} stroke={P.oroClaro} strokeWidth={5} />
          ))}
        </g>
        {xs.map((x, i) => (x > 470 && x < 610 ? <line key={'t' + i} x1={x} y1={900} x2={x} y2={yTop(x)} stroke={P.oro} strokeWidth={5} /> : null))}
        <line x1={420} x2={660} y1={1060} y2={1060} stroke="#7a4b33" strokeWidth={8} strokeLinecap="round" />
      </g>
      {/* pájaro */}
      <g transform={`translate(${bx} ${by}) scale(${bs})`} filter="url(#sombra)">
        <ellipse cx={0} cy={0} rx={50} ry={34} fill="#f2c165" />
        <path d="M-44,-4 L-92,-26 L-84,12 Z" fill="#d99a3a" />
        <circle cx={40} cy={-26} r={26} fill="#f2c165" />
        <circle cx={48} cy={-30} r={4} fill="#2a1a10" />
        <path d="M62,-30 L88,-22 L62,-16 Z" fill="#c8623e" />
        <g transform={`rotate(${-ala} -4 -10)`}>
          <path d="M-4,-10 C-34,-80 12,-100 34,-66 C24,-44 12,-22 -4,-10 Z" fill="#ffe3a0" />
        </g>
      </g>
    </Lienzo>
  );
};

/* ───── lluvia: ventana con lluvia por dentro; en la clave para y sale el sol (opts: sigue) ───── */
export const Lluvia: React.FC<EscenaProps> = ({f, k, opts}) => {
  const sigue = opts.includes('sigue');
  const c = sigue ? 0 : easeIO(p(f, k, 40));
  return (
    <Lienzo>
      <Cielo id="ll-c1" colores={['#1a2232', '#2c3a52', '#3e4e66']} />
      <Cielo id="ll-c2" colores={P.cieloAmanecer} o={c} />
      <Halo x={700} y={560} r={360} color={P.oroClaro} o={c} />
      <circle cx={700} cy={580} r={100 * c} fill="#fff1c9" />
      <Colinas y={1050} colores={[c > 0.5 ? '#6a7aa0' : '#2a3448', c > 0.5 ? '#4a5a80' : '#1e2638']} f={f} />
      {/* lluvia exterior */}
      {Array.from({length: 70}).map((_, i) => {
        const x = rnd(i) * W;
        const y = ((f * 28 + rnd(i + 50) * 1400) % 1400) + 100;
        return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 50} stroke="#9fb4d4" strokeWidth={3} opacity={0.5 * (1 - c)} />;
      })}
      {/* gotas en el cristal */}
      {Array.from({length: 40}).map((_, i) => {
        const x = 160 + rnd(i + 7) * 760;
        const y = 300 + ((rnd(i + 2) * 900 + f * (0.6 + rnd(i) * 1.4)) % 900);
        return <ellipse key={'g' + i} cx={x} cy={y} rx={6 + rnd(i) * 6} ry={9 + rnd(i) * 8} fill="#dfe8f5" opacity={0.35 * (1 - c * 0.7)} />;
      })}
      {/* marco */}
      <path d="M0,0 L1080,0 L1080,1920 L0,1920 Z M150,1250 L150,300 L930,300 L930,1250 Z" fill="#2a1e24" fillRule="evenodd" />
      <rect x={530} y={300} width={20} height={950} fill="#2a1e24" />
      <rect x={150} y={760} width={780} height={20} fill="#2a1e24" />
      <rect x={110} y={1250} width={860} height={50} fill="#4a3428" />
      {/* planta en el alféizar */}
      <path d="M760,1250 L880,1250 L860,1160 L780,1160 Z" fill={P.terracota} />
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={820 + (i - 2) * 22} cy={1110} rx={18} ry={52} fill={i % 2 ? P.verde : P.verdeOsc} transform={`rotate(${(i - 2) * 20} 820 1160)`} />
      ))}
      <Halo x={540} y={1300} r={420} color={P.oro} o={0.25 + 0.4 * c} />
    </Lienzo>
  );
};

/* ───── corazon: corazón agrietado que se repara con oro (kintsugi) en la clave (opts: roto → se rompe) ───── */
export const Corazon: React.FC<EscenaProps> = ({f, k, opts}) => {
  const roto = opts.includes('roto');
  const ent = ease(p(f, 0, 18));
  const grieta = roto ? ease(p(f, k - 2, 10)) : ease(p(f, 4, 16));
  const oro = roto ? 0 : easeIO(p(f, k, 28));
  const sep = roto ? ease(p(f, k + 4, 20)) * 22 : 0;
  const lat = 1 + 0.025 * Math.sin(f * 0.22) + 0.05 * (roto ? 0 : Math.sin(Math.PI * p(f, k + 22, 18)));
  const heart = 'M0,100 C-220,-40 -132,-240 0,-120 C132,-240 220,-40 0,100 Z';
  const crack = 'M0,-120 L-30,-64 L24,-20 L-20,28 L14,66 L0,100';
  return (
    <Lienzo>
      <Cielo id="co-c" colores={['#1a0f1a', '#3a1a2a', '#1a0f1a']} />
      <Halo x={540} y={820} r={mix(260, 560, oro)} color={roto ? P.terracota : P.oro} o={0.4 + 0.6 * oro} />
      <defs>
        <radialGradient id="co-g" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#f08a6a" />
          <stop offset="0.6" stopColor="#c8443a" />
          <stop offset="1" stopColor="#7a1e24" />
        </radialGradient>
        <clipPath id="co-i">
          <path d="M-300,-300 L0,-300 L0,-120 L-30,-64 L24,-20 L-20,28 L14,66 L0,100 L0,300 L-300,300 Z" />
        </clipPath>
        <clipPath id="co-d">
          <path d="M300,-300 L0,-300 L0,-120 L-30,-64 L24,-20 L-20,28 L14,66 L0,100 L0,300 L300,300 Z" />
        </clipPath>
      </defs>
      <g transform={`translate(540 840) scale(${2.1 * ent * lat})`} filter="url(#sombra)">
        <g transform={`translate(${-sep} ${sep * 0.3}) rotate(${-sep * 0.3})`} clipPath="url(#co-i)">
          <path d={heart} fill="url(#co-g)" />
        </g>
        <g transform={`translate(${sep} ${sep * 0.3}) rotate(${sep * 0.3})`} clipPath="url(#co-d)">
          <path d={heart} fill="url(#co-g)" />
        </g>
        <ellipse cx={-70} cy={-120} rx={40} ry={22} fill="#fff" opacity={0.25} transform="rotate(-30 -70 -120)" />
        <path d={crack} fill="none" stroke="#2a0a10" strokeWidth={6} strokeLinejoin="round" strokeDasharray={280} strokeDashoffset={280 * (1 - grieta)} opacity={1 - oro} />
        <path d={crack} fill="none" stroke={P.oro} strokeWidth={7} strokeLinejoin="round" strokeDasharray={280} strokeDashoffset={280 * (1 - oro)} filter="url(#brillo)" />
      </g>
      <Polvo f={f} o={0.3 + 0.7 * oro} />
    </Lienzo>
  );
};

/* ───── casa: casa marroquí al anochecer; las ventanas se encienden en la clave (opts: apaga) ───── */
export const Casa: React.FC<EscenaProps> = ({f, k, opts}) => {
  const apaga = opts.includes('apaga');
  const v1 = ease(p(f, 6, 12));
  const v2 = apaga ? 1 - ease(p(f, k, 14)) : ease(p(f, k, 12));
  const ventana = (x: number, y: number, on: number) => (
    <g key={x}>
      <Halo x={x} y={y + 60} r={150} o={on * 0.8} />
      <path d={`M${x - 60},${y + 130} L${x - 60},${y + 40} A60,60 0 0 1 ${x + 60},${y + 40} L${x + 60},${y + 130} Z`} fill={on > 0.05 ? '#ffe3a0' : '#241834'} opacity={0.35 + 0.65 * on} />
      <path d={`M${x - 60},${y + 130} L${x - 60},${y + 40} A60,60 0 0 1 ${x + 60},${y + 40} L${x + 60},${y + 130}`} fill="none" stroke={P.turquesa} strokeWidth={10} />
      <path d={`M${x - 60},${y + 70} L${x + 60},${y + 70} M${x},${y - 20} L${x},${y + 130}`} stroke="#3a2a30" strokeWidth={6} />
    </g>
  );
  return (
    <Lienzo>
      <Cielo id="cs-c" colores={['#1a2040', '#4a3a6a', '#b06a6a']} />
      <Estrellas f={f} n={40} hasta={500} />
      <circle cx={860} cy={330} r={70} fill="#fff1c9" />
      <Halo x={860} y={330} r={160} color={P.oroClaro} />
      <Colinas y={1000} colores={['#3a2a4a']} f={f} />
      <defs>
        <linearGradient id="cs-m" x1="0" x2="1">
          <stop offset="0" stopColor="#c9906a" />
          <stop offset="1" stopColor="#8a5a4a" />
        </linearGradient>
      </defs>
      <rect x={220} y={640} width={640} height={560} fill="url(#cs-m)" />
      {Array.from({length: 11}).map((_, i) => (
        <path key={i} d={`M${220 + i * 58},640 L${220 + i * 58},612 L${250 + i * 58},590 L${278 + i * 58},612 L${278 + i * 58},640 Z`} fill="#b07a5a" />
      ))}
      <Zellige x={220} y={700} w={640} h={34} id="cs-z" />
      {ventana(380, 790, v1)}
      {ventana(700, 790, v2)}
      <path d="M470,1200 L470,1040 A70,70 0 0 1 610,1040 L610,1200 Z" fill="#5a2e1e" />
      <path d="M470,1200 L470,1040 A70,70 0 0 1 610,1040 L610,1200" fill="none" stroke={P.turquesa} strokeWidth={10} />
      <Halo x={440} y={1000} r={90} o={0.8} />
      <path d="M425,960 L455,960 L462,985 L448,1012 L432,1012 L418,985 Z" fill={P.oro} />
      <rect x={0} y={1200} width={W} height={720} fill="#1e1626" />
      <ellipse cx={540} cy={1204} rx={360} ry={16} fill="#000" opacity={0.3} />
    </Lienzo>
  );
};

/* ───── mar: barco con farol en el mar; las olas se calman y amanece en la clave (opts: tormenta) ───── */
export const Mar: React.FC<EscenaProps> = ({f, k, opts}) => {
  const tormenta = opts.includes('tormenta');
  const t = easeIO(p(f, k, 46));
  const calma = tormenta ? 1 - t : t;
  const amp = mix(70, 12, calma);
  const ola = (y: number, ph: number) => {
    let d = `M0,${y}`;
    for (let x = 0; x <= W; x += 30) d += ` L${x},${y + Math.sin(x / 130 + f * 0.08 + ph) * amp * 0.6}`;
    return d + ' L1080,1920 L0,1920 Z';
  };
  const bob = Math.sin(540 / 130 + f * 0.08) * amp * 0.6;
  const rot = Math.cos(540 / 130 + f * 0.08) * amp * 0.2;
  return (
    <Lienzo>
      <Cielo id="ma-n" colores={['#0e1222', '#1e2440', '#2e2e4a']} />
      <Cielo id="ma-a" colores={P.cieloAmanecer} o={calma} />
      {Array.from({length: 4}).map((_, i) => (
        <ellipse key={i} cx={220 + i * 220} cy={330 + (i % 2) * 70} rx={200} ry={70} fill="#232038" opacity={0.9 * (1 - calma)} />
      ))}
      <Halo x={540} y={1000} r={mix(120, 520, calma)} color={P.oroClaro} o={calma} />
      <circle cx={540} cy={1040 - 80 * calma} r={110} fill="#fff1c9" opacity={calma} />
      <path d={ola(1010, 0)} fill="#2a4a72" />
      <g transform={`translate(540 ${960 + bob}) rotate(${rot})`}>
        <line x1={0} y1={30} x2={0} y2={-320} stroke={P.maderaOsc} strokeWidth={12} />
        <path d="M8,-310 C80,-220 150,-100 200,-20 L8,-20 Z" fill="#f6e8d2" />
        <path d="M-8,-270 C-60,-200 -110,-110 -150,-30 L-8,-30 Z" fill="#e8d6b8" />
        <path d="M-230,0 L230,0 L180,90 L-180,90 Z" fill={P.terracota} />
        <path d="M-230,0 L230,0 L222,16 L-222,16 Z" fill={P.oro} />
        <Halo x={-150} y={-40} r={60} o={1 - calma * 0.6} />
        <circle cx={-150} cy={-40} r={12} fill={P.oroClaro} />
      </g>
      <path d={ola(1070, 1.4)} fill="#1f3a5f" />
      <path d={ola(1160, 2.8)} fill="#152a48" />
      {Array.from({length: 18}).map((_, i) => (
        <line key={i} x1={rnd(i) * W} y1={1120 + rnd(i + 3) * 400} x2={rnd(i) * W + 60} y2={1120 + rnd(i + 3) * 400} stroke={P.oroClaro} strokeWidth={4} opacity={0.4 * calma} strokeLinecap="round" />
      ))}
    </Lienzo>
  );
};

/* ───── reloj: reloj de arena en una mesa, luz cálida (opts: gira → le da la vuelta en la clave) ───── */
export const Reloj: React.FC<EscenaProps> = ({f, d, k, opts}) => {
  const gira = opts.includes('gira');
  const rot = gira ? 180 * easeIO(p(f, k, 24)) : 0;
  const pr = mix(0.15, 0.85, f / Math.max(1, d));
  const topH = 220 * Math.sqrt(1 - pr), botH = 200 * Math.sqrt(pr);
  return (
    <Lienzo>
      <Cielo id="re-c" colores={P.interior} />
      <Halo x={540} y={820} r={480} color={P.oro} o={0.7} />
      <rect x={0} y={1180} width={W} height={740} fill="#2a1a18" />
      <ellipse cx={540} cy={1180} rx={260} ry={30} fill="#000" opacity={0.4} />
      <defs>
        <linearGradient id="re-m" x1="0" x2="1">
          <stop offset="0" stopColor="#5a3020" />
          <stop offset="0.5" stopColor="#9a5a3a" />
          <stop offset="1" stopColor="#5a3020" />
        </linearGradient>
      </defs>
      <g transform={`translate(540 880) rotate(${rot})`}>
        <rect x={-210} y={-300} width={420} height={44} rx={14} fill="url(#re-m)" />
        <rect x={-210} y={256} width={420} height={44} rx={14} fill="url(#re-m)" />
        <rect x={-186} y={-258} width={18} height={516} fill="#6a3a26" />
        <rect x={168} y={-258} width={18} height={516} fill="#6a3a26" />
        <path d="M-150,-256 L150,-256 L16,-8 L16,8 L150,256 L-150,256 L-16,8 L-16,-8 Z" fill="rgba(255,255,255,0.1)" stroke="#f6e8d2" strokeOpacity={0.7} strokeWidth={5} strokeLinejoin="round" />
        <polygon points={`0,-12 ${-topH * 0.6},${-12 - topH} ${topH * 0.6},${-12 - topH}`} fill={P.arena} />
        <polygon points={`${-botH * 0.72},252 0,${252 - botH} ${botH * 0.72},252`} fill={P.arena} />
        {rot === 0 && <line x1={0} y1={-8} x2={0} y2={252 - botH} stroke={P.arena} strokeWidth={5} strokeDasharray="10 8" strokeDashoffset={-f * 3} />}
        <rect x={-120} y={-240} width={22} height={160} rx={11} fill="#fff" opacity={0.15} />
      </g>
      <Polvo f={f} o={0.5} />
    </Lienzo>
  );
};

/* ───── gente: siluetas a contraluz alrededor de una mujer iluminada (opts: hablan → bocadillos; calma → se callan en la clave) ───── */
export const Gente: React.FC<EscenaProps> = ({f, k, opts}) => {
  const hablan = opts.includes('hablan') || opts.includes('calma');
  const calma = opts.includes('calma');
  const fuera = calma ? easeIO(p(f, k, 18)) : 0;
  const foco = ease(p(f, 0, 20));
  const base = 1240;
  const otros: [number, number, 'mujer' | 'hombre', number][] = [
    [140, base, 'hombre', 1.05], [300, base + 30, 'mujer', 0.95], [800, base + 20, 'hombre', 1.0], [950, base, 'mujer', 1.05], [220, base + 70, 'hombre', 0.85], [870, base + 70, 'mujer', 0.85],
  ];
  const bocadillos = [[160, 700], [330, 620], [770, 610], [940, 700], [250, 520], [860, 520]];
  return (
    <Lienzo>
      <Cielo id="ge-c" colores={['#151020', '#2a1e36', '#151020']} />
      <Halo x={540} y={820} r={mix(150, 380, foco)} color={P.oroClaro} />
      <polygon points="470,0 610,0 760,1300 320,1300" fill={P.oroClaro} opacity={0.12 * foco} />
      <rect x={0} y={base} width={W} height={700} fill="#0f0a16" />
      {otros.map(([x, y, t, s], i) => (
        <Silueta key={i} x={x} y={y} s={s} tipo={t} color={i > 3 ? '#0a0610' : '#1e1628'} />
      ))}
      <Silueta x={540} y={base + 10} s={1.3} tipo="mujer" color="#3a2a40" borde={P.oroClaro} />
      {hablan &&
        bocadillos.map(([x, y], i) => {
          const s = ease(p(f, 6 + i * 6, 10)) * (1 - fuera);
          const sh = !calma && f > k ? Math.sin(f * 1.2 + i) * 5 : 0;
          return (
            <g key={'b' + i} transform={`translate(${x + sh} ${y}) scale(${s})`}>
              <rect x={-80} y={-48} width={160} height={96} rx={42} fill="#f6e8d2" opacity={0.92} />
              <path d={`M${i % 2 ? 20 : -20},44 L${i % 2 ? 46 : -46},80 L${i % 2 ? 44 : -44},38 Z`} fill="#f6e8d2" opacity={0.92} />
              {[-30, 0, 30].map((dx, j) => (
                <circle key={j} cx={dx} cy={0} r={10} fill="#3a2a40" opacity={0.4 + 0.6 * Math.abs(Math.sin(f * 0.2 + j))} />
              ))}
            </g>
          );
        })}
      <Polvo f={f} o={0.4} />
    </Lienzo>
  );
};
