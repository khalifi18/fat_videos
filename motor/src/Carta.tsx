import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {loadFont as loadRuqaa} from '@remotion/google-fonts/ArefRuqaa';
import {FPS, serif, sans} from './tema';

// Formato «carta»: una frase escrita a mano en una hoja sobre una mesa marroquí (vista desde arriba),
// con un vaso de atay y hierbabuena. Sin voz: Fatima le pone un sonido de moda en TikTok.
const ruqaa = loadRuqaa('normal', {weights: ['400', '700'], subsets: ['arabic']}).fontFamily;

export type CartaProps = {
  firma: string;
  cierre: string;
  lineas: {ar: string; es: string}[];
  portada?: boolean;
};

const PALABRA = 0.16 * FPS; // separación entre palabras al escribir
const PAUSA = 0.55 * FPS; // respiro entre frases
const INICIO = 0.6 * FPS;

export const tiemposCarta = (lineas: CartaProps['lineas']) => {
  let t = INICIO;
  const ini = lineas.map((l) => {
    const a = t;
    t += l.ar.split(/\s+/).length * PALABRA + PAUSA;
    return a;
  });
  const escrito = t;
  return {ini, escrito, total: escrito + 6.5 * FPS};
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

export const Carta: React.FC<CartaProps> = ({firma, cierre, lineas, portada}) => {
  const fr = useCurrentFrame();
  const {ini, escrito, total} = tiemposCarta(lineas);
  const f = portada ? escrito + FPS : fr;
  const zoom = interpolate(f, [0, total], [1.0, 1.07], {easing: Easing.inOut(Easing.sin)});
  const fin = portada ? 0 : interpolate(f, [total - 2.2 * FPS, total - 1.4 * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const llama = 0.85 + 0.15 * Math.sin(f / 7) * Math.sin(f / 11);

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
        <Hoja>
          <div style={{position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22}}>
            <div style={{width: 150, height: 2, background: '#8a6a45'}} />
            <div style={{fontFamily: serif, fontSize: 34, color: '#6b4a2c'}}>{firma}</div>
            <div style={{width: 150, height: 2, background: '#8a6a45'}} />
          </div>
          <div style={{position: 'absolute', top: 140, bottom: 70, left: 55, right: 55, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22}}>
            {lineas.map((l, i) => {
              const pal = l.ar.split(/\s+/);
              const tEs = ini[i] + pal.length * PALABRA;
              return (
                <div key={i}>
                  <div dir="rtl" style={{fontFamily: ruqaa, fontWeight: i === 0 ? 400 : 700, fontSize: i === 0 ? 46 : 60, lineHeight: 1.35, color: i === 0 ? '#7a5634' : '#2b1a10', textAlign: 'center'}}>
                    {pal.map((w, j) => {
                      const a = ini[i] + j * PALABRA;
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
                      fontSize: 28,
                      lineHeight: 1.3,
                      color: '#8a6a4a',
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
        </Hoja>
        <Atay f={f} />
        {/* luz cálida de vela desde arriba a la izquierda */}
        <AbsoluteFill style={{background: `radial-gradient(ellipse at 25% 20%, rgba(255,200,120,${0.22 * llama}) 0%, rgba(0,0,0,0) 55%)`, mixBlendMode: 'screen'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
      </AbsoluteFill>
      {/* cierre */}
      <AbsoluteFill style={{background: `rgba(15,8,5,${0.9 * fin})`, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24}}>
        <div style={{opacity: fin, fontFamily: serif, fontSize: 64, color: '#fbf3e6'}}>{firma}</div>
        <div style={{opacity: fin, fontFamily: sans, fontWeight: 700, fontSize: 34, color: '#f2c165'}}>{cierre}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
