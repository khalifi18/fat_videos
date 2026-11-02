import React from 'react';
import {AbsoluteFill, Html5Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, W, amiri, sans, serif} from './tema';
import {easeOut, lerp, prog} from './util';
import {Subtitulo, trozosEs} from './Subtitulos';
import {ESCENAS, FOCOS} from './dibujos';
import {Camara2D} from './dibujos/camara2d';
import {FondoVideoCtx} from './dibujos/base';
import {COLORES, ELEMENTOS} from './dibujos/elementos';
import {Estrella8Fondo} from './dibujos/fondo';
import {ThreeCanvas} from '@remotion/three';
import {MUNDOS} from './mundos';
import type {Tramo} from './mundos/camara';

// Formatos:
//  historia → un dibujo animado por frase (planos con escena), subtítulos abajo
//  hikma    → fondo de color + elemento dibujado, POV arriba, frase grande en el centro
//  leccion  → un clip de vídeo por frase, subtítulos abajo
//  pov      → 1–2 clips de fondo para todo el vídeo, POV arriba, frase grande en el centro
export type Modo = 'historia' | 'hikma' | 'leccion' | 'pov';

export type Linea = {
  es: string; // frase en español
  ini: number; // segundos
  fin: number;
  arabe?: string | null; // refrán/aleya que sale también en árabe (hikma y pov)
};
export type Plano = {
  clip?: string | null; // clip vertical preparado en public/
  escena?: string | null; // dibujo (historia)
  opts?: string[];
  k?: number; // fotograma clave local (historia)
  texto: string; // tarjeta de texto en árabe si no hay clip ni escena
  a: number; // fotograma inicial
  b: number; // fotograma final
};
export type VideoProps = {
  audio: string | null;
  modo: Modo;
  lineas: Linea[];
  planos: Plano[];
  pov: string | null;
  color?: string | null; // hikma: nombre de COLORES o #hex
  elemento?: string | null; // hikma: nombre de ELEMENTOS
  mundo?: string | null; // historia en 3D: nombre de MUNDOS
  tramos?: Tramo[]; // historia en 3D: a qué plano va la cámara y cuándo
  firma: string;
  cierre: string;
  finVoz: number;
  duracion: number;
  portada?: boolean;
};

const centrado = (m: Modo) => m === 'hikma' || m === 'pov';

const Velo: React.FC<{modo: Modo}> = ({modo}) => (
  <AbsoluteFill
    style={{
      background:
        modo === 'pov'
          ? 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 25%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.7) 100%)'
          : modo === 'hikma'
            ? 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.35) 100%)'
            : 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.03) 22%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.55) 74%, rgba(0,0,0,0.7) 100%)',
    }}
  />
);

const TarjetaTexto: React.FC<{texto: string; f: number}> = ({texto, f}) => {
  const e = easeOut(prog(f, 0, 18));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #3a2a1c 0%, #0d0a12 70%)', alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 560, width: 760, height: 1, background: C.oro, opacity: 0.6 * e}} />
      <div dir="rtl" style={{position: 'absolute', top: 600, left: 120, right: 120, textAlign: 'center', fontFamily: amiri, fontWeight: 700, fontSize: 92, lineHeight: 1.6, color: C.oro, opacity: e, transform: `translateY(${lerp(20, 0, e)}px)`, textShadow: '0 4px 30px rgba(0,0,0,0.6)'}}>
        {texto}
      </div>
      <div style={{position: 'absolute', top: 1060, width: 760, height: 1, background: C.oro, opacity: 0.6 * e}} />
    </AbsoluteFill>
  );
};

const Pov: React.FC<{texto: string; frame: number}> = ({texto, frame}) => {
  const e = easeOut(prog(frame, 0, 14));
  const m = texto.match(/^(POV\s*:?)\s*(.*)$/i);
  return (
    <div style={{position: 'absolute', top: 250, left: 90, right: 90, textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 50, lineHeight: 1.25, color: C.crema, opacity: e, textShadow: '0 2px 4px rgba(0,0,0,0.7), 0 0 24px rgba(0,0,0,0.5)'}}>
      {m ? (
        <>
          <span style={{fontWeight: 800}}>{m[1].toUpperCase().replace(/\s*:?$/, ':')}</span> {m[2]}
        </>
      ) : (
        texto
      )}
    </div>
  );
};

/** Fondo de la hikma: degradado de color, estrellas de zellige muy suaves y el elemento flotando */
const FondoHikma: React.FC<{color?: string | null; elemento?: string | null; frame: number; ocultar: number}> = ({color, elemento, frame, ocultar}) => {
  const [c1, c2] = color && COLORES[color] ? COLORES[color] : color && color.startsWith('#') ? [color, color] : COLORES.ciruela;
  const el = elemento && ELEMENTOS[elemento] ? ELEMENTOS[elemento] : ELEMENTOS.luna;
  const e = easeOut(prog(frame, 4, 20));
  const flota = Math.sin(frame * 0.04) * 10;
  return (
    <AbsoluteFill style={{background: `linear-gradient(170deg, ${c2} 0%, ${c1} 75%)`}}>
      <Estrella8Fondo frame={frame} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="hk-halo">
            <stop offset="0" stopColor="#ffe3a0" stopOpacity={0.45} />
            <stop offset="0.5" stopColor="#ffe3a0" stopOpacity={0.12} />
            <stop offset="1" stopColor="#ffe3a0" stopOpacity={0} />
          </radialGradient>
        </defs>
        <g opacity={e * (1 - ocultar)} transform={`translate(540 ${590 + flota}) scale(${0.75 + 0.25 * e})`}>
          <circle r={260} fill="url(#hk-halo)" />
          {el(frame)}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const Video: React.FC<VideoProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const modo: Modo = p.modo ?? (p.pov !== null && p.pov !== undefined ? 'pov' : 'leccion');
  const finVozF = Math.round(p.finVoz * fps);
  let actual = 0;
  p.lineas.forEach((l, i) => {
    if (i === 0 || frame >= Math.round(l.ini * fps) - 4) actual = i;
  });
  const cierre = easeOut(prog(frame, finVozF + 8, 16));
  const l0 = p.lineas[0];
  const la = p.lineas[actual];
  const ultimo = p.planos.length - 1;
  const arabeE = la.arabe ? easeOut(prog(frame, Math.round(la.ini * fps) - 4, 14)) : 0;
  const centro = centrado(modo);

  return (
    <AbsoluteFill style={{backgroundColor: C.noche, overflow: 'hidden'}}>
      {modo === 'hikma' ? (
        <FondoHikma color={p.color} elemento={p.elemento} frame={frame} ocultar={arabeE} />
      ) : modo === 'historia' && p.mundo && MUNDOS[p.mundo] ? (
        <Mundo3D nombre={p.mundo} tramos={p.tramos ?? []} />
      ) : (
        p.planos.map((pl, i) => {
          const a = pl.a, b = i === ultimo ? durationInFrames : pl.b;
          const op = Math.min(i === 0 ? 1 : prog(frame, a, 10), 1 - prog(frame, b - 10, 10));
          return (
            <Sequence key={i} from={a} durationInFrames={b - a}>
              <Plano pl={pl} d={b - a} opacidad={op} />
            </Sequence>
          );
        })
      )}
      <Velo modo={modo} />

      {centro && p.pov && <Pov texto={p.pov} frame={frame} />}

      {(centro || modo === 'historia') && la.arabe && !p.portada && frame < finVozF + 6 && (
        <div dir="rtl" style={{position: 'absolute', top: centro ? 540 : 420, left: 80, right: 80, textAlign: 'center', fontFamily: amiri, fontWeight: 700, fontSize: 88, lineHeight: 1.5, color: C.oro, opacity: arabeE, textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>
          {la.arabe}
        </div>
      )}

      {!p.portada && frame < finVozF + 6 && <Subtitulo es={la.es} ini={la.ini} fin={la.fin} frame={frame} fps={fps} centro={centro} />}

      <div style={{position: 'absolute', top: 150, width: W, textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: C.tenue}}>
        {p.firma}
      </div>

      {p.portada && (
        <div style={{position: 'absolute', top: centro ? 760 : 1060, left: 90, right: 90, height: centro ? 420 : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 84, lineHeight: 1.15, color: C.crema, textShadow: '0 4px 30px rgba(0,0,0,0.9)'}}>
          <div>
            {trozosEs(l0.es)
              .flat()
              .map((w, i) => (
                <span key={i} style={{color: w.key ? C.oro : C.crema}}>
                  {w.w}{' '}
                </span>
              ))}
          </div>
        </div>
      )}

      {cierre > 0 && (
        <AbsoluteFill style={{background: `rgba(13,10,18,${0.78 * cierre})`, alignItems: 'center', justifyContent: 'center'}}>
          <div style={{opacity: cierre, transform: `translateY(${lerp(24, 0, cierre)}px)`, textAlign: 'center', padding: '0 120px'}}>
            <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 76, lineHeight: 1.25, color: C.crema}}>{p.cierre}</div>
            <div style={{width: 120, height: 2, background: C.oro, margin: '44px auto'}} />
            <div style={{fontFamily: sans, fontWeight: 800, fontSize: 44, color: C.oro, letterSpacing: 1}}>{p.firma}</div>
          </div>
        </AbsoluteFill>
      )}

      {p.audio && !p.portada && <Html5Audio src={staticFile(p.audio)} />}
    </AbsoluteFill>
  );
};

const Plano: React.FC<{pl: Plano; d: number; opacidad: number}> = ({pl, d, opacidad}) => {
  const f = useCurrentFrame();
  if (pl.escena && ESCENAS[pl.escena]) {
    const E = ESCENAS[pl.escena];
    const zoomFondo = 1.04 + 0.1 * (f / Math.max(1, d));
    return (
      <AbsoluteFill style={{opacity: opacidad}}>
        {pl.clip && (
          <AbsoluteFill style={{transform: `scale(${zoomFondo})`}}>
            <OffthreadVideo src={staticFile(pl.clip)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </AbsoluteFill>
        )}
        <FondoVideoCtx.Provider value={!!pl.clip}>
          <Camara2D f={f} d={d} semilla={[...pl.escena].reduce((a, c) => a + c.charCodeAt(0), 0)} foco={FOCOS[pl.escena]}>
            <E f={f} d={d} k={pl.k ?? Math.round(d * 0.4)} opts={pl.opts ?? []} />
          </Camara2D>
        </FondoVideoCtx.Provider>
      </AbsoluteFill>
    );
  }
  if (!pl.clip) {
    return (
      <AbsoluteFill style={{opacity: opacidad}}>
        <TarjetaTexto texto={pl.texto} f={f} />
      </AbsoluteFill>
    );
  }
  const zoom = 1.02 + 0.06 * (f / Math.max(1, d));
  return (
    <AbsoluteFill style={{opacity: opacidad, transform: `scale(${zoom})`}}>
      <OffthreadVideo src={staticFile(pl.clip)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

/** Historia en 3D: un único mundo continuo por el que viaja la cámara */
const Mundo3D: React.FC<{nombre: string; tramos: Tramo[]}> = ({nombre, tramos}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const M = MUNDOS[nombre];
  return (
    <AbsoluteFill>
      <ThreeCanvas width={W} height={1920} gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 44, near: 0.05, far: 600}}>
        <M t={f / fps} T={durationInFrames / fps} tramos={tramos} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
