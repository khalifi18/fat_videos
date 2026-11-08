// Un vídeo ya hecho (se deja tal cual, con su sonido) con frases escritas encima que van apareciendo.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, W, amiri, sans} from './tema';

export type Bloque = {ar: string[]; es: string; t: number}; // líneas en árabe, traducción, segundo en que entra
export type SobreVideoProps = {
  video: string; // ruta dentro de public/
  duracion: number;
  nombre: {ar: string; es: string; t: number};
  bloques: Bloque[];
  firma: string;
};

export const SobreVideo: React.FC<SobreVideoProps> = ({video, duracion, nombre, bloques, firma}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = frame / fps;
  const entra = (t: number, d = 0.7) => interpolate(s, [t, t + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sale = interpolate(s, [duracion - 0.8, duracion], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nombreE = entra(nombre.t, 0.9);
  // línea de árabe: todas las líneas de todos los bloques, apiladas
  let fila = 0;
  const actual = [...bloques].reverse().find((b) => s >= b.t) ?? null;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile(video)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      {/* velo suave para que se lea el texto */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(8,10,20,0.55) 0%, rgba(8,10,20,0.38) 55%, rgba(8,10,20,0.12) 100%)', opacity: Math.min(1, entra(nombre.t - 0.3, 0.8)) * sale}} />
      <AbsoluteFill style={{opacity: sale}}>
        {/* nombre */}
        <div dir="rtl" style={{position: 'absolute', top: 440, left: 50, right: 50, textAlign: 'center', fontFamily: amiri, fontWeight: 700, color: C.oro, opacity: nombreE, transform: `translateY(${(1 - nombreE) * 24}px)`, textShadow: '0 4px 26px rgba(0,0,0,0.75)'}}>
          {nombre.ar.split('\n').map((l, i) => (
            <div key={i} style={{fontSize: i === 0 ? 80 : 62, lineHeight: 1.35}}>
              {l}
            </div>
          ))}
          <div style={{margin: '14px auto 0', width: 560 * nombreE, height: 7, borderRadius: 4, background: '#c8382c'}} />
        </div>
        {/* frases */}
        {bloques.map((b, bi) => {
          const e = entra(b.t, 0.8);
          const top = 735 + fila * 138;
          fila += b.ar.length;
          return (
            <div key={bi} dir="rtl" style={{position: 'absolute', top, left: 50, right: 50, textAlign: 'center', fontFamily: amiri, fontWeight: 700, fontSize: 92, lineHeight: 1.45, color: '#fffaf0', opacity: e, transform: `translateY(${(1 - e) * 30}px)`, textShadow: '0 4px 28px rgba(0,0,0,0.85), 0 0 6px rgba(0,0,0,0.6)'}}>
              {b.ar.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          );
        })}
        {/* traducción (cambia con cada frase) */}
        {bloques.map((b, bi) => {
          const sig = bloques[bi + 1]?.t ?? duracion + 1;
          const e = entra(b.t + 0.2, 0.5) * (1 - interpolate(s, [sig - 0.3, sig], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
          return (
            <div key={'e' + bi} style={{position: 'absolute', top: 1500, left: 90, right: 90, textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 46, lineHeight: 1.3, color: '#fff', opacity: e, textShadow: '0 3px 18px rgba(0,0,0,0.9)'}}>
              {b.es}
            </div>
          );
        })}
        {/* marca de Fatima */}
        <div style={{position: 'absolute', top: 1690, width: W, textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 50, letterSpacing: 3, color: 'rgba(255,255,255,0.93)', textShadow: '0 3px 18px rgba(0,0,0,0.85)'}}>
          {firma}
          <div style={{margin: '10px auto 0', width: 150, height: 5, borderRadius: 3, background: C.oro}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ───────── Protección: una persona real (vídeo) dentro de una esfera de luz; las sombras no pueden tocarla ─────────
export type LineaProt = {ar: string | null; es: string; t: number; fin: number};
export type ProteccionProps = {
  video: string;
  duracion: number;
  lineas: LineaProt[];
  firma: string;
  burbuja: {cx: number; cy: number; r: number}; // en píxeles del lienzo 1080×1920
  amanecer: number; // segundo en que sale el sol
};

const rr = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Proteccion: React.FC<ProteccionProps> = ({video, duracion, lineas, firma, burbuja, amanecer}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = frame / fps;
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const alba = interpolate(s, [amanecer, amanecer + 3.2], [0, 1], clamp);
  const entra = interpolate(s, [0.2, 1.6], [0, 1], clamp);
  const sale = interpolate(s, [duracion - 0.8, duracion], [1, 0], clamp);
  const {cx, cy, r} = burbuja;
  const latido = 1 + 0.012 * Math.sin(s * 4.2);
  const R = r * latido * (1 + alba * 0.28);
  const actual = [...lineas].reverse().find((l) => s >= l.t && s <= l.fin + 0.4) ?? null;
  const ae = actual ? interpolate(s, [actual.t, actual.t + 0.5], [0, 1], clamp) : 0;
  // flechas de sombra que llegan y rebotan
  const flechas = Array.from({length: 11}).map((_, i) => {
    const ciclo = 1.5 + rr(i, 1) * 0.9;
    const ph = ((s + rr(i, 2) * ciclo) % ciclo) / ciclo;
    const ang = (i / 11) * Math.PI * 2 + rr(i, 3) * 0.4;
    const ext = ph < 0.55 ? ph / 0.55 : ph < 0.72 ? 1 - (ph - 0.55) / 0.17 : 0;
    const choque = ph > 0.5 && ph < 0.68 ? Math.sin(((ph - 0.5) / 0.18) * Math.PI) : 0;
    const dist0 = r * 2.1;
    const d = dist0 - (dist0 - R - 6) * ext;
    return {ang, d, ext, choque, i};
  });
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile(video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      {/* la oscuridad se cierra desde los bordes y se aparta con el amanecer */}
      <AbsoluteFill style={{background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(8,6,14,0) ${r * 1.1}px, rgba(8,6,14,${0.62 * (1 - alba)}) ${r * 2.6}px, rgba(4,3,8,${0.82 * (1 - alba)}) 100%)`, opacity: entra}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(255,214,140,${0.22 * entra}) 0px, rgba(255,214,140,${0.1 * entra}) ${R}px, rgba(255,214,140,0) ${R * 1.9}px)`, mixBlendMode: 'screen'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: entra * sale}}>
        <defs>
          <radialGradient id="esf" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff3cf" stopOpacity={0.0} />
            <stop offset="0.72" stopColor="#ffe6a8" stopOpacity={0.05} />
            <stop offset="0.9" stopColor="#ffe8b0" stopOpacity={0.55} />
            <stop offset="0.965" stopColor="#fff6dc" stopOpacity={0.95} />
            <stop offset="1" stopColor="#ffe8b0" stopOpacity={0} />
          </radialGradient>
          <filter id="difu">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        {/* sombras: flechas oscuras que se acercan y rebotan sin tocarla */}
        {flechas.map((f) => {
          const x = cx + Math.cos(f.ang) * f.d, y = cy + Math.sin(f.ang) * f.d;
          const x0 = cx + Math.cos(f.ang) * (r * 1.75), y0 = cy + Math.sin(f.ang) * (r * 1.75);
          const ux = Math.cos(f.ang), uy = Math.sin(f.ang);
          // punta de sombra: triángulo oscuro con la punta hacia la esfera
          const base = 56 * (1 - f.ext * 0.2);
          const largo = Math.hypot(x - x0, y - y0);
          const pts = [
            [x, y],
            [x + ux * 190 * Math.min(1, f.ext * 1.4 + 0.2) - uy * base, y + uy * 190 * Math.min(1, f.ext * 1.4 + 0.2) + ux * base],
            [x + ux * 190 * Math.min(1, f.ext * 1.4 + 0.2) + uy * base, y + uy * 190 * Math.min(1, f.ext * 1.4 + 0.2) - ux * base],
          ];
          return (
            <g key={f.i} opacity={(1 - alba) * 0.92 * Math.min(1, largo / 20)}>
              <polygon points={pts.map((q) => q.join(',')).join(' ')} fill="#07050d" />
              <polygon points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke="rgba(120,80,60,0.25)" strokeWidth={3} />
              {f.choque > 0.02 && (
                <g transform={`translate(${cx + Math.cos(f.ang) * R} ${cy + Math.sin(f.ang) * R})`}>
                  <circle r={90 * f.choque} fill="rgba(255,244,210,0.9)" opacity={f.choque * 0.9} filter="url(#difu)" />
                  <circle r={26 * f.choque} fill="#fffbea" />
                </g>
              )}
            </g>
          );
        })}
        {/* la esfera de luz */}
        <circle cx={cx} cy={cy} r={R * 1.04} fill="url(#esf)" opacity={0.95 - alba * 0.45} />
        <path d={`M ${cx - R * 0.74} ${cy - R * 0.5} A ${R * 0.9} ${R * 0.9} 0 0 1 ${cx - R * 0.15} ${cy - R * 0.88}`} stroke="rgba(255,255,255,0.65)" strokeWidth={9} fill="none" strokeLinecap="round" />
        {/* polvo de luz */}
        {Array.from({length: 28}).map((_, i) => {
          const a = rr(i, 1) * Math.PI * 2 + s * 0.15;
          const d = R * (0.2 + rr(i, 2) * 0.95);
          const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.9 - ((s * 14 + rr(i, 3) * 100) % 90);
          return <circle key={i} cx={x} cy={y} r={2 + rr(i, 4) * 4} fill="#fff1c0" opacity={0.25 + 0.5 * Math.abs(Math.sin(s * 2 + i))} />;
        })}
      </svg>
      {/* amanecer: luz cálida desde arriba */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(255,170,100,${0.5 * alba}) 0%, rgba(255,200,130,${0.18 * alba}) 45%, rgba(255,200,130,0) 80%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{opacity: sale}}>
        {actual?.ar && (
          <div dir="rtl" style={{position: 'absolute', top: 270, left: 50, right: 50, textAlign: 'center', fontFamily: amiri, fontWeight: 700, fontSize: 86, lineHeight: 1.45, color: C.oro, opacity: ae, textShadow: '0 4px 24px rgba(0,0,0,0.8)', background: 'radial-gradient(ellipse at center, rgba(10,12,34,0.6) 0%, rgba(10,12,34,0.4) 55%, rgba(10,12,34,0) 100%)', padding: '26px 30px', borderRadius: 60}}>
            {actual.ar}
          </div>
        )}
        {actual && (
          <div style={{position: 'absolute', top: 1450, left: 80, right: 80, textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 52, lineHeight: 1.3, color: '#fff', opacity: ae, textShadow: '0 3px 18px rgba(0,0,0,0.9)'}}>
            {actual.es.replace(/\*/g, '')}
          </div>
        )}
        <div style={{position: 'absolute', top: 1690, width: W, textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 50, letterSpacing: 3, color: 'rgba(255,255,255,0.93)', textShadow: '0 3px 18px rgba(0,0,0,0.85)'}}>
          {firma}
          <div style={{margin: '10px auto 0', width: 150, height: 5, borderRadius: 3, background: C.oro}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
