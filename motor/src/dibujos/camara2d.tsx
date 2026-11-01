// Cámara 2D de verdad: en cada escena hace UN movimiento continuo (nunca va y vuelve, nunca tiembla).
// Tipos de movimiento, alternados entre escenas: acercarse, alejarse, paneo izquierda→derecha, paneo derecha→izquierda,
// subir (tilt), bajar. Empieza con algo de inercia y termina sin frenar en seco.
// PROFUNDIDAD: envuelve las capas del dibujo en <Capa z={…}> (0 = fondo lejano, 1 = primer plano):
// las capas cercanas se desplazan más que las lejanas (parallax) y así se siente que la cámara se mueve dentro del dibujo.
import React, {createContext, useContext} from 'react';
import {AbsoluteFill} from 'remotion';
import {H, W} from '../tema';

export type Foco = {x: number; y: number}; // punto de interés de la escena (px del lienzo 1080×1920)
/** Foco fijo, o que se mueve con la escena (p. ej. seguir a la caravana por el mapa) */
export type FocoEscena = Foco | ((f: number, d: number) => Foco);

const ALTO = 0.42; // altura de pantalla donde queda el foco (los subtítulos van debajo)

// curva con arranque suave y final sin frenar del todo (se siente como una cámara con peso)
const curva = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2 * 0.85 - 0.075 * (1 - x);
};

type Mov = {s0: number; s1: number; dx0: number; dx1: number; dy0: number; dy1: number};
const MOVIMIENTOS: Mov[] = [
  {s0: 1.05, s1: 1.22, dx0: 0, dx1: 0, dy0: 30, dy1: 0}, // acercarse
  {s0: 1.12, s1: 1.12, dx0: -90, dx1: 90, dy0: 0, dy1: 0}, // paneo → derecha
  {s0: 1.24, s1: 1.06, dx0: 0, dx1: 0, dy0: -20, dy1: 10}, // alejarse (revela)
  {s0: 1.12, s1: 1.12, dx0: 90, dx1: -90, dy0: 0, dy1: 0}, // paneo ← izquierda
  {s0: 1.14, s1: 1.18, dx0: 0, dx1: 0, dy0: 110, dy1: -60}, // subir
  {s0: 1.1, s1: 1.2, dx0: -50, dx1: 30, dy0: -70, dy1: 40}, // bajar en diagonal
];

const Profundidad = createContext({dx: 0, dy: 0, ds: 0});

/** Capa con profundidad: z = 0 (lejos, casi no se mueve) … 1 (cerca, se mueve más que la cámara) */
export const Capa: React.FC<{z: number; children: React.ReactNode}> = ({z, children}) => {
  const {dx, dy, ds} = useContext(Profundidad);
  const k = (z - 0.5) * 0.8; // la capa media (0,5) va con la cámara
  return <g transform={`translate(${-dx * k} ${-dy * k}) translate(${W / 2} ${H / 2}) scale(${1 + ds * k}) translate(${-W / 2} ${-H / 2})`}>{children}</g>;
};

export const encuadre = (f: number, d: number, semilla: number, foco: Foco) => {
  const m = MOVIMIENTOS[Math.floor(semilla) % MOVIMIENTOS.length];
  const t = curva(f / Math.max(1, d));
  const s = m.s0 + (m.s1 - m.s0) * t;
  const mx = W / (2 * s);
  const x = Math.min(W - mx, Math.max(mx, foco.x + m.dx0 + (m.dx1 - m.dx0) * t));
  const y = Math.min(H - (H * (1 - ALTO)) / s, Math.max((H * ALTO) / s, foco.y + m.dy0 + (m.dy1 - m.dy0) * t));
  return {s, x, y, dx: (m.dx1 - m.dx0) * t, dy: (m.dy1 - m.dy0) * t, ds: (m.s1 - m.s0) * t};
};

export const Camara2D: React.FC<{f: number; d: number; semilla: number; foco?: FocoEscena; children: React.ReactNode}> = ({f, d, semilla, foco, children}) => {
  const fc = typeof foco === 'function' ? foco(f, d) : foco ?? {x: W / 2, y: H * 0.42};
  const {s, x, y, dx, dy, ds} = encuadre(f, d, semilla, fc);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Profundidad.Provider value={{dx, dy, ds}}>
        <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${W / 2}px, ${H * ALTO}px) scale(${s}) translate(${-x}px, ${-y}px)`}}>
          {children}
        </AbsoluteFill>
      </Profundidad.Provider>
    </AbsoluteFill>
  );
};
