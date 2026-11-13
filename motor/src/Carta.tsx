import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing, OffthreadVideo, staticFile} from 'remotion';
import {loadFont as loadRuqaa} from '@remotion/google-fonts/ArefRuqaa';
import {FPS, serif, sans, amiri} from './tema';

// Formato «carta»: una frase escrita a mano en una hoja sobre una mesa marroquí (vista desde arriba),
// con un vaso de atay y hierbabuena (fondo «mesa»), o en la página de un cuaderno con bolígrafo (fondo «cuaderno»).
// Con voz (tiempos de words.json: cada palabra aparece cuando se dice) o sin voz (ritmo fijo).
const ruqaa = loadRuqaa('normal', {weights: ['400', '700'], subsets: ['arabic']}).fontFamily;

export type CartaProps = {
  firma: string;
  cierre: string;
  lineas: {ar: string; es: string}[];
  portada?: boolean;
  papel?: {dx?: number; dy?: number; s?: number; boli?: {x: number; y: number; g: number}};
  fondo?: 'mesa' | 'cuaderno' | 'pergamino' | 'rosas' | 'rosasreales';
  tiempos?: number[][]; // segundo en que se dice cada palabra, por línea
  finVoz?: number;
  escala?: number; // texto más pequeño si es largo
};

const PALABRA = 0.16 * FPS; // separación entre palabras al escribir
const PAUSA = 0.55 * FPS; // respiro entre frases
const INICIO = 0.6 * FPS;

export const tiemposCarta = (lineas: CartaProps['lineas'], tiempos?: number[][], finVoz?: number) => {
  if (tiempos && finVoz) {
    const pal = tiempos.map((ws) => ws.map((x) => x * FPS));
    return {ini: pal.map((ws) => ws[0]), pal, escrito: finVoz * FPS, total: (finVoz + 3.4) * FPS};
  }
  let t = INICIO;
  const ini = lineas.map((l) => {
    const a = t;
    t += l.ar.split(/\s+/).length * PALABRA + PAUSA;
    return a;
  });
  const escrito = t;
  const pal = lineas.map((l, i) => l.ar.split(/\s+/).map((_, j) => ini[i] + j * PALABRA));
  return {ini, pal, escrito, total: escrito + 6.5 * FPS};
};

const Hoja: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: 80, top: 250, width: 920, height: 1350, transform: 'rotate(-1.6deg)'}}>
    {/* sombra */}
    <div style={{position: 'absolute', inset: 0, transform: 'translate(18px, 26px)', background: 'rgba(0,0,0,0.45)', filter: 'blur(26px)', borderRadius: 8}} />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 6,
        background: 'radial-gradient(ellipse at 40% 35%, #fbf4e4 0%, #f3e6cb 60%, #e6d2ab 100%)',
        overflow: 'hidden',
      }}
    >
      {/* fibras del papel */}
      <svg width="920" height="1350" style={{position: 'absolute', inset: 0, opacity: 0.35}}>
        <filter id="papel">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0.25 0" />
        </filter>
        <rect width="920" height="1350" filter="url(#papel)" />
      </svg>
      {/* borde envejecido */}
      <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 90px rgba(140,95,40,0.35)'}} />
      {children}
    </div>
  </div>
);

const Cuaderno: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #4d5562 0%, #6f7784 35%, #8a909a 100%)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 60% 40%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0) 60%)'}} />
    {/* bloque de páginas */}
    <div style={{position: 'absolute', left: 30, top: 190, width: 1080, height: 1780, borderTopLeftRadius: 120, background: '#d9cfbc', transform: 'translate(-14px, 16px)', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}} />
    <div style={{position: 'absolute', left: 30, top: 190, width: 1080, height: 1780, borderTopLeftRadius: 120, background: '#e3d9c6', transform: 'translate(-7px, 8px)'}} />
    {/* página */}
    <div style={{position: 'absolute', left: 30, top: 190, width: 1080, height: 1780, borderTopLeftRadius: 120, overflow: 'hidden', background: 'radial-gradient(ellipse at 45% 30%, #f1ebdf 0%, #e7decd 55%, #d6cab3 100%)'}}>
      <svg width="1080" height="1780" style={{position: 'absolute', inset: 0, opacity: 0.3}}>
        <filter id="papelC">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="9" />
          <feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0.22 0" />
        </filter>
        <rect width="1080" height="1780" filter="url(#papelC)" />
      </svg>
      {/* curva del lomo arriba y sombra del borde */}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(90,70,40,0.18) 0%, rgba(0,0,0,0) 7%), linear-gradient(90deg, rgba(90,70,40,0.16) 0%, rgba(0,0,0,0) 6%)'}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1050, height: 1420}}>{children}</div>
    </div>
    <Boli />
  </AbsoluteFill>
);

// bolígrafo negro con anillos dorados, en diagonal abajo a la izquierda
const Boli: React.FC = () => (
  <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id="negro" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a3d44" />
        <stop offset="0.35" stopColor="#0d0e11" />
        <stop offset="1" stopColor="#000" />
      </linearGradient>
      <linearGradient id="dorado" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff0b8" />
        <stop offset="0.5" stopColor="#c9a14a" />
        <stop offset="1" stopColor="#7a5a1c" />
      </linearGradient>
    </defs>
    <g transform="translate(330 1770) rotate(32)">
      <rect x="-520" y="-14" width="560" height="70" rx="34" fill="rgba(0,0,0,0.35)" filter="blur(12px)" transform="translate(10 40)" />
      <rect x="-560" y="-32" width="470" height="64" rx="30" fill="url(#negro)" />
      <rect x="-120" y="-32" width="26" height="64" fill="url(#dorado)" />
      <rect x="-94" y="-28" width="90" height="56" rx="6" fill="url(#negro)" />
      <rect x="-30" y="-28" width="14" height="56" fill="url(#dorado)" />
      <path d="M-4,-24 L60,-12 L60,12 L-4,24 Z" fill="url(#negro)" />
      <path d="M58,-12 L130,0 L58,12 Z" fill="url(#dorado)" />
      <path d="M62,0 L126,0" stroke="#5a4210" strokeWidth="2" />
      <rect x="-470" y="-34" width="200" height="12" rx="6" fill="url(#dorado)" transform="translate(0 -6)" />
      <rect x="-560" y="-26" width="470" height="8" rx="4" fill="rgba(255,255,255,0.18)" />
    </g>
  </svg>
);

// borde rasgado: polígono con dientes pequeños alrededor de un rectángulo
const bordeRoto = (w: number, h: number, paso = 14, amp = 7, seed = 3) => {
  let x = seed;
  const r = () => ((x = (x * 9301 + 49297) % 233280) / 233280 - 0.5) * 2 * amp;
  const pts: string[] = [];
  for (let i = 0; i <= w; i += paso) pts.push(`${i},${r()}`);
  for (let i = 0; i <= h; i += paso) pts.push(`${w + r()},${i}`);
  for (let i = w; i >= 0; i -= paso) pts.push(`${i},${h + r()}`);
  for (let i = h; i >= 0; i -= paso) pts.push(`${r()},${i}`);
  return pts.join(' ');
};

const Margarita: React.FC<{x: number; y: number; r: number; g: number}> = ({x, y, r, g}) => (
  <g transform={`translate(${x} ${y}) rotate(${g})`}>
    {Array.from({length: 12}, (_, i) => (
      <ellipse key={i} cx="0" cy={-r * 0.55} rx={r * 0.17} ry={r * 0.5} fill="#f6ead2" transform={`rotate(${i * 30})`} opacity="0.95" />
    ))}
    <circle r={r * 0.24} fill="#d99a2b" />
    <circle r={r * 0.24} fill="none" stroke="#9a5f14" strokeWidth="2" opacity="0.6" />
  </g>
);

const Rosa: React.FC<{x: number; y: number; r: number; g: number}> = ({x, y, r, g}) => (
  <g transform={`translate(${x} ${y}) rotate(${g})`}>
    <circle r={r * 1.02} fill="rgba(0,0,0,0.35)" transform={`translate(${r * 0.08} ${r * 0.12})`} />
    {Array.from({length: 8}, (_, i) => (
      <ellipse key={'o' + i} cx="0" cy={-r * 0.52} rx={r * 0.46} ry={r * 0.5} fill={i % 2 ? '#8e0f1d' : '#a3121f'} stroke="#5a0710" strokeWidth="1.5" transform={`rotate(${i * 45})`} />
    ))}
    {Array.from({length: 6}, (_, i) => (
      <ellipse key={'m' + i} cx="0" cy={-r * 0.36} rx={r * 0.34} ry={r * 0.38} fill={i % 2 ? '#b8182a' : '#c71e32'} stroke="#7a0d19" strokeWidth="1.2" transform={`rotate(${i * 60 + 20})`} />
    ))}
    {Array.from({length: 4}, (_, i) => (
      <ellipse key={'i' + i} cx="0" cy={-r * 0.2} rx={r * 0.22} ry={r * 0.26} fill={i % 2 ? '#d42a40' : '#e0384e'} stroke="#8a0f1c" strokeWidth="1" transform={`rotate(${i * 90 + 45})`} />
    ))}
    <path d={`M0,0 m${-r * 0.1},0 a${r * 0.1},${r * 0.1} 0 1,1 ${r * 0.2},0 a${r * 0.16},${r * 0.16} 0 1,1 ${-r * 0.3},0`} fill="none" stroke="#7a0d19" strokeWidth="2" />
    <ellipse cx={-r * 0.25} cy={-r * 0.35} rx={r * 0.18} ry={r * 0.08} fill="rgba(255,255,255,0.18)" transform="rotate(-30)" />
  </g>
);

const Petalo: React.FC<{x: number; y: number; r: number; g: number}> = ({x, y, r, g}) => (
  <ellipse cx={x} cy={y} rx={r * 0.55} ry={r} fill="#b0182a" stroke="#6a0a16" strokeWidth="1.5" transform={`rotate(${g} ${x} ${y})`} opacity="0.95" />
);

/** Nube de flores pequeñas blancas (gipsófila) */
const Gipsofila: React.FC<{x: number; y: number; r: number; g: number}> = ({x, y, r, g}) => (
  <g transform={`translate(${x} ${y}) rotate(${g})`}>
    {Array.from({length: 7}, (_, i) => {
      const a = (i / 7) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * r * 0.5} cy={Math.sin(a) * r * 0.5} r={r * 0.22} fill="#fbf0dc" />;
    })}
    <circle r={r * 0.16} fill="#e6b04a" />
  </g>
);

const FLORES = (() => {
  let x = 11;
  const r = () => (x = (x * 9301 + 49297) % 233280) / 233280;
  return Array.from({length: 70}, () => {
    const px = r() * 1180 - 50;
    const py = r() * 330 - 60 + (px < 300 ? r() * 120 : 0);
    return {x: px, y: py, r: 24 + r() * 22, g: r() * 360};
  });
})();


const BoliReal: React.FC<{x: number; y: number; g: number}> = ({x, y, g}) => (
  <svg width="640" height="120" viewBox="0 0 640 120" style={{position: 'absolute', left: x, top: y, transform: `rotate(${g}deg)`, transformOrigin: '50% 50%', overflow: 'visible'}}>
    <defs>
      <linearGradient id="boliC" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6f8fd6" /><stop offset="0.3" stopColor="#23408f" /><stop offset="0.75" stopColor="#101f55" /><stop offset="1" stopColor="#070d2b" />
      </linearGradient>
      <linearGradient id="boliM" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff6d8" /><stop offset="0.4" stopColor="#d9b55c" /><stop offset="1" stopColor="#6e5420" />
      </linearGradient>
    </defs>
    <ellipse cx="330" cy="84" rx="300" ry="14" fill="rgba(0,0,0,0.42)" filter="blur(9px)" />
    <path d="M40,60 L120,50 L560,44 Q612,44 612,60 Q612,76 560,76 L120,70 Z" fill="url(#boliC)" />
    <rect x="120" y="50" width="26" height="20" fill="url(#boliM)" />
    <rect x="430" y="45" width="130" height="8" rx="4" fill="url(#boliM)" />
    <path d="M40,60 L120,50 L120,70 Z" fill="#cfd3dc" />
    <path d="M40,60 L18,60 L40,58 Z" fill="#222" />
    <rect x="150" y="53" width="380" height="4" rx="2" fill="rgba(255,255,255,0.35)" />
  </svg>
);

const Pergamino: React.FC<{children: React.ReactNode; f: number; rosas?: boolean; real?: boolean; papel?: {dx?: number; dy?: number; s?: number; boli?: {x: number; y: number; g: number}}}> = ({children, f, rosas, real, papel}) => {
  const W2 = 900, H2 = 1290;
  const sol = Math.sin(f / 70) * 25;
  return (
    <AbsoluteFill>
      {real && <OffthreadVideo src={staticFile('carta/fondo.mp4')} muted style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />}
      {/* tela de punto, granate */}
      {!real && <AbsoluteFill style={{background: 'linear-gradient(160deg, #5a2a22 0%, #7a3a2c 35%, #5e2c24 60%, #43201b 100%)'}} />}
      {!real && <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
        <filter id="punto">
          <feTurbulence type="fractalNoise" baseFrequency="0.06 0.18" numOctaves="2" seed="5" />
          <feColorMatrix values="0 0 0 0 0.15  0 0 0 0 0.05  0 0 0 0 0.03  0 0 0 0.8 0" />
        </filter>
        <rect width="1080" height="1920" filter="url(#punto)" opacity="0.7" />
        {/* pliegues */}
        {[[200, 1650, 30], [880, 1500, -25], [-50, 700, 60], [1100, 900, -50]].map(([x, y, g], i) => (
          <ellipse key={i} cx={x} cy={y} rx="420" ry="70" fill="rgba(0,0,0,0.28)" transform={`rotate(${g} ${x} ${y})`} filter="blur(30px)" />
        ))}
        {[[400, 1800, 20], [1000, 1250, -30]].map(([x, y, g], i) => (
          <ellipse key={i} cx={x} cy={y} rx="380" ry="50" fill="rgba(255,190,140,0.12)" transform={`rotate(${g} ${x} ${y})`} filter="blur(24px)" />
        ))}
        {/* margaritas arriba */}
        <rect x="-20" y="-20" width="1120" height="330" fill="#2a1a12" opacity="0.65" filter="blur(20px)" />
        {FLORES.map((m, i) => (rosas ? <Gipsofila key={i} {...m} r={m.r * 0.7} /> : <Margarita key={i} {...m} />))}
      </svg>}
      {/* pergamino */}
      <div style={{position: 'absolute', left: 90, top: real ? 480 : 330, width: W2, height: H2, transform: real ? `translate(${papel?.dx ?? 0}px, ${papel?.dy ?? 0}px) rotate(-2deg) scale(${papel?.s ?? 0.8})` : 'rotate(-3deg)'}}>
        <svg width={W2 + 60} height={H2 + 60} viewBox={`-30 -30 ${W2 + 60} ${H2 + 60}`} style={{position: 'absolute', left: -30, top: -30, overflow: 'visible'}}>
          <defs>
            <radialGradient id="perg" cx="45%" cy="40%" r="75%">
              <stop offset="0" stopColor="#f1d3a0" />
              <stop offset="0.6" stopColor="#dcae6c" />
              <stop offset="1" stopColor="#a8703a" />
            </radialGradient>
            <filter id="pergT">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="2" />
              <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.28  0 0 0 0 0.12  0 0 0 0.35 0" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <filter id="pergViejo">
              <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="9" />
              <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.18  0 0 0 0 0.06  0 0 0 0.6 -0.12" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <clipPath id="pergC">
              <polygon points={bordeRoto(W2, H2)} />
            </clipPath>
          </defs>
          <polygon points={bordeRoto(W2, H2)} fill="rgba(0,0,0,0.55)" transform="translate(16 24)" filter="blur(14px)" />
          <g clipPath="url(#pergC)">
            <rect x="-20" y="-20" width={W2 + 40} height={H2 + 40} fill="url(#perg)" />
            <rect x="-20" y="-20" width={W2 + 40} height={H2 + 40} fill="#000" filter="url(#pergT)" />
            <polygon points={bordeRoto(W2, H2)} fill="none" stroke="#7a4a22" strokeWidth="16" opacity="0.45" filter="blur(6px)" />
            {real && (
              <>
                <rect x="-20" y="-20" width={W2 + 40} height={H2 + 40} fill="#8a5a24" opacity="0.22" style={{mixBlendMode: 'multiply'}} />
                <rect x="-20" y="-20" width={W2 + 40} height={H2 + 40} fill="#000" filter="url(#pergViejo)" />
                <polygon points={bordeRoto(W2, H2)} fill="none" stroke="#2e1606" strokeWidth="70" opacity="0.6" filter="blur(22px)" />
                {[[180, 260, 120, 90], [700, 520, 150, 110], [300, 980, 130, 100], [760, 1150, 110, 80], [120, 640, 70, 60]].map(([x, y, rx, ry], i) => (
                  <ellipse key={'m' + i} cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke="#6b3a14" strokeWidth="10" opacity="0.28" filter="blur(7px)" />
                ))}
                {Array.from({length: 46}, (_, i) => (
                  <circle key={'f' + i} cx={(i * 197) % W2} cy={(i * 331) % H2} r={2 + (i % 4)} fill="#6b3a14" opacity={0.18 + (i % 3) * 0.08} />
                ))}
                <line x1={W2 / 2} y1="0" x2={W2 / 2 + 8} y2={H2} stroke="#5a3010" strokeWidth="3" opacity="0.35" filter="blur(1.5px)" />
                <line x1={W2 / 2 + 4} y1="0" x2={W2 / 2 + 12} y2={H2} stroke="#fff3d6" strokeWidth="3" opacity="0.28" filter="blur(1.5px)" />
                <line x1="0" y1={H2 * 0.36} x2={W2} y2={H2 * 0.36 + 10} stroke="#5a3010" strokeWidth="3" opacity="0.3" filter="blur(1.5px)" />
                <line x1="0" y1={H2 * 0.36 + 4} x2={W2} y2={H2 * 0.36 + 14} stroke="#fff3d6" strokeWidth="3" opacity="0.25" filter="blur(1.5px)" />
              </>
            )}
          </g>
        </svg>
        {/* adornos: ♥ arriba, rama abajo */}
        <div style={{position: 'absolute', bottom: 165, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, color: '#4a2a14'}}>
          <div style={{width: 200, height: 2, background: '#6a4224'}} />
          <div style={{fontSize: 30}}>♥</div>
          <div style={{width: 200, height: 2, background: '#6a4224'}} />
        </div>
        <svg width="180" height="80" viewBox="0 0 180 80" style={{position: 'absolute', bottom: 70, left: W2 / 2 - 90}}>
          <path d="M20,65 C60,50 110,35 165,12" stroke="#4a2a14" strokeWidth="3" fill="none" />
          {[[45, 56, -30], [70, 47, 20], [95, 38, -35], [120, 29, 15], [145, 20, -40]].map(([x, y, g], i) => (
            <ellipse key={i} cx={x} cy={y - (i % 2 ? -10 : 10)} rx="13" ry="5" fill="none" stroke="#4a2a14" strokeWidth="2.5" transform={`rotate(${g} ${x} ${y})`} />
          ))}
        </svg>
        <div style={{position: 'absolute', inset: 0}}>{children}</div>
      </div>
      {real && papel?.boli && <BoliReal x={papel.boli.x} y={papel.boli.y} g={papel.boli.g} />}
      {/* luz de sol entre hojas, en diagonal */}
      {!real && <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(${-35 + sol * 0.05}deg, rgba(255,190,90,0) 0px, rgba(255,190,90,0) 90px, rgba(255,200,110,0.22) 150px, rgba(255,190,90,0) 230px)`,
          mixBlendMode: 'screen',
          transform: `translateX(${sol}px)`,
        }}
      />}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 75% 15%, rgba(255,200,120,0.28) 0%, rgba(0,0,0,0) 50%)', mixBlendMode: 'screen'}} />
      {rosas && !real && (
        <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
          {[[70, 1720, 20, 0], [210, 1840, 15, 40], [80, 1560, 14, 70], [400, 1880, 10, 20]].map(([x, y, g, h], i) => (
            <Petalo key={'p' + i} x={x + 230} y={y} r={g * 1.6} g={h} />
          ))}
          {[[880, 1780, 18, 30], [980, 1620, 12, 100], [330, 1700, 12, 150]].map(([x, y, g, h], i) => (
            <Petalo key={'q' + i} x={x} y={y} r={g * 1.5} g={h} />
          ))}
          <Rosa x={150} y={1670} r={170} g={-10} />
          <Rosa x={330} y={1830} r={120} g={25} />
          <Rosa x={60} y={1480} r={100} g={50} />
          {Array.from({length: 7}, (_, i) => (
            <Gipsofila key={'g' + i} x={20 + i * 70} y={1560 + (i % 3) * 90} r={30 + (i % 2) * 8} g={i * 40} />
          ))}
        </svg>
      )}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
    </AbsoluteFill>
  );
};

const Atay: React.FC<{f: number}> = ({f}) => {
  const vapor = (i: number) => ({
    opacity: 0.18 + 0.1 * Math.sin(f / 22 + i),
    transform: `translate(${Math.sin(f / 30 + i * 2) * 10}px, ${-((f * 0.9 + i * 40) % 120)}px)`,
  });
  return (
    <svg width="420" height="420" viewBox="-210 -210 420 420" style={{position: 'absolute', left: 720, top: 1530}}>
      <defs>
        <radialGradient id="te" cx="40%" cy="40%">
          <stop offset="0" stopColor="#e9a948" />
          <stop offset="0.7" stopColor="#a95e1c" />
          <stop offset="1" stopColor="#6e3a12" />
        </radialGradient>
        <radialGradient id="vidrio" cx="50%" cy="50%">
          <stop offset="0.8" stopColor="rgba(255,255,255,0)" />
          <stop offset="0.93" stopColor="rgba(255,240,210,0.55)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.15)" />
        </radialGradient>
      </defs>
      <ellipse cx="22" cy="30" rx="150" ry="150" fill="rgba(0,0,0,0.45)" filter="blur(14px)" />
      {/* platillo de latón */}
      <circle r="165" fill="#b98a3a" />
      <circle r="150" fill="none" stroke="#e2bd6a" strokeWidth="4" opacity="0.7" />
      <circle r="120" fill="none" stroke="#8a5f22" strokeWidth="3" strokeDasharray="6 10" opacity="0.6" />
      {/* vaso */}
      <circle r="98" fill="url(#te)" />
      <circle r="98" fill="url(#vidrio)" />
      <path d="M-60,-60 A85,85 0 0 1 20,-88" stroke="rgba(255,255,255,0.7)" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* hierbabuena */}
      {[[-20, -15, 30], [18, 5, -40], [-5, 25, 100], [25, -28, 160]].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M0,0 C14,-14 34,-10 44,0 C34,10 14,14 0,0 Z" fill={i % 2 ? '#4f8a3c' : '#3d7330'} />
          <path d="M2,0 L40,0" stroke="#7fb35d" strokeWidth="1.5" />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${-30 + i * 30},-40 c-12,-20 12,-35 0,-55 c-12,-20 12,-35 0,-55`} stroke="#fff6e4" strokeWidth="9" fill="none" strokeLinecap="round" style={vapor(i)} filter="blur(6px)" />
      ))}
    </svg>
  );
};

const Hierbabuena: React.FC = () => (
  <svg width="300" height="300" viewBox="-150 -150 300 300" style={{position: 'absolute', left: -60, top: 120}}>
    <path d="M-120,90 C-40,40 20,-20 110,-110" stroke="#3a5e2a" strokeWidth="6" fill="none" />
    {[[-80, 62, -20], [-30, 25, 60], [10, -8, -30], [50, -50, 50], [85, -85, -10]].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r + (i % 2 ? 0 : 180)})`}>
        <path d="M0,0 C18,-22 52,-18 66,0 C52,18 18,22 0,0 Z" fill={i % 2 ? '#4f8a3c' : '#406f31'} />
        <path d="M3,0 L60,0" stroke="#86b866" strokeWidth="2" />
      </g>
    ))}
  </svg>
);


/** Polvo dorado que sube despacio y pétalos de margarita que caen: da vida y profundidad a la hoja */
const Brillos: React.FC<{f: number}> = ({f}) => {
  const r = (i: number, k: number) => {
    const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {Array.from({length: 36}).map((_, i) => {
        const sz = 5 + r(i, 1) * 13;
        const y = 2000 - ((f * (0.55 + r(i, 2) * 0.8) + r(i, 3) * 2200) % 2200);
        const x = r(i, 4) * 1080 + Math.sin(f / 40 + i) * 26;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,226,150,0.95) 0%, rgba(255,200,110,0.35) 55%, rgba(255,200,110,0) 100%)', opacity: 0.35 + 0.55 * Math.abs(Math.sin(f / 30 + i * 1.9)), filter: sz > 12 ? 'blur(1.5px)' : undefined}} />;
      })}
    </AbsoluteFill>
  );
};

const Petalos: React.FC<{f: number}> = ({f}) => {
  const r = (i: number, k: number) => {
    const x = Math.sin(i * 91.7 + k * 17.3) * 12345.678;
    return x - Math.floor(x);
  };
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 9}).map((_, i) => {
        const v = 0.7 + r(i, 1) * 0.7;
        const y = -80 + ((f * v + r(i, 2) * 2100) % 2150);
        const x = r(i, 3) * 1080 + Math.sin(f / 55 + i * 2.1) * 70;
        const rot = f * (0.6 + r(i, 4) * 1.2) + i * 40;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 22 + r(i, 5) * 14, height: 46 + r(i, 6) * 22, borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%', background: 'linear-gradient(180deg, #fffaf0 0%, #f1e2c2 100%)', opacity: 0.72, transform: `rotate(${rot}deg)`, boxShadow: '0 4px 10px rgba(0,0,0,0.25)'}} />;
      })}
    </AbsoluteFill>
  );
};

export const Carta: React.FC<CartaProps> = ({firma, cierre, lineas, portada, fondo = 'mesa', tiempos, finVoz, escala = 1, papel}) => {
  const fr = useCurrentFrame();
  const {pal: tPal, escrito, total} = tiemposCarta(lineas, tiempos, finVoz);
  const f = portada ? escrito + FPS : fr;
  const esPerg = fondo === 'pergamino' || fondo === 'rosas' || fondo === 'rosasreales';
  const zoom = interpolate(f, [0, total], [1.0, 1.07], {easing: Easing.inOut(Easing.sin)});
  const fin = portada ? 0 : interpolate(f, [total - 2.2 * FPS, total - 1.4 * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const k = (fondo === 'cuaderno' ? 1.16 : esPerg ? 1.08 : 1) * escala; // en el cuaderno la hoja es más grande
  const llama = 0.85 + 0.15 * Math.sin(f / 7) * Math.sin(f / 11);

  const texto = (
    <>
          <div style={{position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22 * k}}>
            <div style={{width: 150, height: 2, background: '#8a6a45'}} />
            <div style={{fontFamily: serif, fontSize: 34, color: '#6b4a2c'}}>{firma}</div>
            <div style={{width: 150, height: 2, background: '#8a6a45'}} />
          </div>
          <div style={{position: 'absolute', top: 140, bottom: esPerg ? 210 : 70, left: 55, right: 55, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 * k}}>
            {lineas.map((l, i) => {
              const pal = l.ar.split(/\s+/);
              const tEs = tPal[i][pal.length - 1] + 0.3 * FPS;
              return (
                <div key={i}>
                  <div dir="rtl" style={{fontFamily: esPerg ? amiri : ruqaa, fontWeight: esPerg ? 700 : i === 0 ? 400 : 700, fontSize: (i === 0 ? 46 : 60) * k, lineHeight: 1.35, color: esPerg ? (i === 0 ? '#5a3418' : '#2a170b') : i === 0 ? '#7a5634' : '#2b1a10', textAlign: 'center'}}>
                    {pal.map((w, j) => {
                      const a = tPal[i][j] ?? tPal[i][tPal[i].length - 1];
                      const o = interpolate(f, [a, a + 0.35 * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
                      return (
                        <span key={j} style={{opacity: o, filter: `blur(${(1 - o) * 6}px)`, display: 'inline-block', transform: `translateY(${(1 - o) * 8}px)`}}>
                          {w}
                          {j < pal.length - 1 ? ' ' : ''}
                        </span>
                      );
                    })}
                  </div>
                  <div
                    style={{
                      fontFamily: serif,
                      fontSize: 28 * k,
                      lineHeight: 1.3,
                      color: esPerg ? '#6a4224' : '#8a6a4a',
                      textAlign: 'center',
                      marginTop: 4,
                      opacity: interpolate(f, [tEs, tEs + 0.5 * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
                    }}
                  >
                    {l.es}
                  </div>
                </div>
              );
            })}
          </div>
    </>
  );
  const cierreEl = (
    <AbsoluteFill style={{background: `rgba(15,8,5,${0.9 * fin})`, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24}}>
      <div style={{opacity: fin, fontFamily: serif, fontSize: 64, color: '#fbf3e6'}}>{firma}</div>
      <div style={{opacity: fin, fontFamily: sans, fontWeight: 700, fontSize: 34, color: '#f2c165'}}>{cierre}</div>
    </AbsoluteFill>
  );
  if (esPerg)
    return (
      <AbsoluteFill style={{background: '#4a231c'}}>
        <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 45%'}}>
          <Pergamino f={f} rosas={fondo === 'rosas'} real={fondo === 'rosasreales'} papel={papel}>{texto}</Pergamino>
          <Brillos f={fr} />
          {fondo === 'rosas' || fondo === 'rosasreales' ? null : <Petalos f={fr} />}
        </AbsoluteFill>
        {cierreEl}
      </AbsoluteFill>
    );
  if (fondo === 'cuaderno')
    return (
      <AbsoluteFill style={{background: '#4d5562'}}>
        <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 40%'}}>
          <Cuaderno>{texto}</Cuaderno>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)'}} />
        </AbsoluteFill>
        {cierreEl}
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: '#2a1810'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 45%'}}>
        {/* mesa de madera */}
        <AbsoluteFill style={{background: 'linear-gradient(100deg, #4a2c1c 0%, #5e3a24 30%, #4f301f 55%, #61402a 80%, #45291a 100%)'}} />
        <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.5}}>
          <filter id="veta">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="3" seed="7" />
            <feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.06  0 0 0 0 0.03  0 0 0 0.9 0" />
          </filter>
          <rect width="1080" height="1920" filter="url(#veta)" />
          {[480, 1210].map((y) => (
            <rect key={y} x="0" y={y} width="1080" height="4" fill="rgba(0,0,0,0.35)" />
          ))}
        </svg>
        <Hierbabuena />
        {/* margaritas: un ramillete en la esquina y unas pocas junto al té */}
        <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
          {FLORES.slice(0, 16).map((m, i) => (
            <Margarita key={'a' + i} x={m.x * 0.55 - 20} y={m.y * 0.9 + 40} r={m.r * 0.9} g={m.g} />
          ))}
          {FLORES.slice(20, 30).map((m, i) => (
            <Margarita key={'b' + i} x={640 + (m.x % 440)} y={1450 + (m.y % 380) + 120} r={m.r * 0.8} g={m.g} />
          ))}
        </svg>
        <Hoja>{texto}</Hoja>
        <Atay f={f} />
        {/* luz cálida de vela desde arriba a la izquierda */}
        <AbsoluteFill style={{background: `radial-gradient(ellipse at 25% 20%, rgba(255,200,120,${0.22 * llama}) 0%, rgba(0,0,0,0) 55%)`, mixBlendMode: 'screen'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
      </AbsoluteFill>
      {cierreEl}
    </AbsoluteFill>
  );
};
