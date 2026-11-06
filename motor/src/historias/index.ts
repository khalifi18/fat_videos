import React from 'react';
import type {EscenaProps} from '../dibujos/base';
import {FATIMA_FIHRI, FOCOS_FATIMA_FIHRI} from './fatima-fihri';
import {TALLER_MAALEM, FOCOS_TALLER_MAALEM} from './taller-maalem';
import {NOTICIERO_SAHARA, FOCOS_NOTICIERO_SAHARA} from './noticiero-sahara';
import {YUSUF, FOCOS_YUSUF} from './yusuf';
import {TIEMPO, FOCOS_TIEMPO} from './tiempo';
import {CARGA, FOCOS_CARGA} from './carga';
import {MAR, FOCOS_MAR} from './mar';
import type {FocoEscena} from '../dibujos/camara2d';

/** Escenas hechas a medida para cada historia. El nombre de la escena se pone entre corchetes en el guion. */
export const HISTORIAS: Record<string, React.FC<EscenaProps>> = {
  ...FATIMA_FIHRI,
  ...TALLER_MAALEM,
  ...NOTICIERO_SAHARA,
  ...YUSUF,
  ...TIEMPO,
  ...CARGA,
  ...MAR,
};

/** Punto de interés de cada escena para la cámara (si no está, mira al centro) */
export const FOCOS_HISTORIAS: Record<string, FocoEscena> = {
  ...FOCOS_FATIMA_FIHRI,
  ...FOCOS_TALLER_MAALEM,
  ...FOCOS_NOTICIERO_SAHARA,
  ...FOCOS_YUSUF,
  ...FOCOS_TIEMPO,
  ...FOCOS_CARGA,
  ...FOCOS_MAR,
};
