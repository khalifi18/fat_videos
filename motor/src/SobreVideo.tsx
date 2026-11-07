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
