// Cámara 2D para las escenas dibujadas: nunca se queda quieta.
// Encadena movimientos (zoom in, paneo, zoom out…) con un cambio de dirección cada ≤ 2 s
// e interpola con una curva suave (Catmull-Rom), así la velocidad nunca llega a cero.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {H, W} from '../tema';
import {rnd} from './base';

export type Foco = {x: number; y: number}; // punto de interés de la escena (px del lienzo 1080×1920)
/** Foco fijo, o que se mueve con la escena (p. ej. seguir a la caravana por el mapa) */
export type FocoEscena = Foco | ((f: number, d: number) => Foco);

const ALTO = 0.42; // altura de pantalla donde queda el foco (los subtítulos van debajo)
const PASO = 45; // fotogramas entre puntos de la cámara (1,5 s a 30 fps) → cambia de movimiento antes de 2 s

type Key = {s: number; x: number; y: number};

const cr = (a: number, b: number, c: number, d: number, t: number) =>
  0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);

/** Puntos de la cámara para una escena: alterna acercarse y alejarse, y cruza el foco de un lado a otro */
const claves = (n: number, semilla: number, foco: Foco): Key[] =>
  Array.from({length: n}).map((_, i) => {
    const cerca = i % 2 === 1;
    const s = cerca ? 1.16 + 0.06 * rnd(semilla + i) : 1.05 + 0.03 * rnd(semilla + i * 3);
    const lado = (i + Math.floor(semilla)) % 4; // izquierda, arriba, derecha, abajo
    const dx = [-1, 0.3, 1, -0.3][lado] * 40;
    const dy = [0.3, -1, -0.3, 1][lado] * 50;
    return {s, x: foco.x + dx, y: foco.y + dy};
  });

/** Encuadre en el fotograma f: escala y centro, limitado para que nunca se vea el borde del dibujo */
export const encuadre = (f: number, d: number, semilla: number, foco: Foco) => {
  const n = Math.ceil(d / PASO) + 3;
  const k = claves(n, semilla, foco);
  const i = Math.floor(f / PASO);
  const t = (f % PASO) / PASO;
  const g = (j: number) => k[Math.max(0, Math.min(n - 1, j))];
  const [a, b, c, e] = [g(i - 1), g(i), g(i + 1), g(i + 2)];
  const s = Math.max(1.04, cr(a.s, b.s, c.s, e.s, t));
  // el foco va a la altura ALTO de la pantalla (por encima de los subtítulos) y nunca se ve el borde del dibujo
  const mx = W / (2 * s);
  const x = Math.min(W - mx, Math.max(mx, cr(a.x, b.x, c.x, e.x, t)));
  const y = Math.min(H - (H * (1 - ALTO)) / s, Math.max((H * ALTO) / s, cr(a.y, b.y, c.y, e.y, t)));
  return {s, x, y};
};

export const Camara2D: React.FC<{f: number; d: number; semilla: number; foco?: FocoEscena; children: React.ReactNode}> = ({f, d, semilla, foco, children}) => {
  const fc = typeof foco === 'function' ? foco(f, d) : foco ?? {x: W / 2, y: H * 0.42};
  const {s, x, y} = encuadre(f, d, semilla, fc);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${W / 2}px, ${H * ALTO}px) scale(${s}) translate(${-x}px, ${-y}px)`}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
