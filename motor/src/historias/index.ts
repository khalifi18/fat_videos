import React from 'react';
import type {EscenaProps} from '../dibujos/base';
import {FATIMA_FIHRI} from './fatima-fihri';

/** Escenas hechas a medida para cada historia. El nombre de la escena se pone entre corchetes en el guion. */
export const HISTORIAS: Record<string, React.FC<EscenaProps>> = {
  ...FATIMA_FIHRI,
};
