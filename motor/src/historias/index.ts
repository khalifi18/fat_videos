import React from 'react';
import type {EscenaProps} from '../dibujos/base';
import {FATIMA_FIHRI, FOCOS_FATIMA_FIHRI} from './fatima-fihri';
import type {FocoEscena} from '../dibujos/camara2d';

/** Escenas hechas a medida para cada historia. El nombre de la escena se pone entre corchetes en el guion. */
export const HISTORIAS: Record<string, React.FC<EscenaProps>> = {
  ...FATIMA_FIHRI,
};

/** Punto de interés de cada escena para la cámara (si no está, mira al centro) */
export const FOCOS_HISTORIAS: Record<string, FocoEscena> = {
  ...FOCOS_FATIMA_FIHRI,
};
