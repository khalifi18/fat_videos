import React from 'react';
import {EscenaProps} from './base';
import {Arbol, Camino, Luna, Madre, Puerta, Semilla, Te, Vela} from './escenas1';
import {Casa, Corazon, Gente, Lluvia, Mar, Pajaro, Reloj} from './escenas2';
import {HISTORIAS} from '../historias';

/** Catálogo de escenas del formato historia: [nombre opciones] al principio de la línea del guion */
export const ESCENAS: Record<string, React.FC<EscenaProps>> = {
  puerta: Puerta,
  arbol: Arbol,
  semilla: Semilla,
  camino: Camino,
  vela: Vela,
  luna: Luna,
  te: Te,
  madre: Madre,
  pajaro: Pajaro,
  lluvia: Lluvia,
  corazon: Corazon,
  casa: Casa,
  mar: Mar,
  reloj: Reloj,
  gente: Gente,
  ...HISTORIAS,
};
