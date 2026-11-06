import React from 'react';
import type {Tramo} from './camara';
import {MundoArbol} from './MundoArbol';
import {MundoMar} from './MundoMar';

/** Mundos 3D del formato historia (# mundo: nombre). Planos de cámara: ver cada mundo y guias/mundos.md */
export const MUNDOS: Record<string, React.FC<{t: number; T: number; tramos: Tramo[]}>> = {
  arbol: MundoArbol,
  mar: MundoMar,
};
