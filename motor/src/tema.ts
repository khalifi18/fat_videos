import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadAmiri} from '@remotion/google-fonts/Amiri';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadCairo} from '@remotion/google-fonts/Cairo';

// Letras: Montserrat para subtítulos, Playfair para portada y cierre, Amiri para refranes/aleyas en árabe.
export const sans = loadMontserrat('normal', {weights: ['700', '800'], subsets: ['latin', 'latin-ext']}).fontFamily;
export const serif = loadPlayfair('italic', {weights: ['700'], subsets: ['latin', 'latin-ext']}).fontFamily;
export const cairo = loadCairo('normal', {weights: ['800', '900'], subsets: ['arabic']}).fontFamily;
export const amiri = loadAmiri('normal', {weights: ['700'], subsets: ['arabic']}).fontFamily;

// Paleta del texto. Cambia aquí y cambia todo.
export const C = {
  noche: '#0d0a12',
  crema: '#fbf3e6',
  oro: '#f2c165',
  tenue: 'rgba(251,243,230,0.55)',
};

// Paleta de los dibujos (historia y elementos de hikma): noche cálida marroquí
export const P = {
  cieloNoche: ['#0f1530', '#2a2350', '#5a3a62'],
  cieloAtardecer: ['#2b2350', '#8a4a6a', '#f08a5d', '#ffd08a'],
  cieloAmanecer: ['#1d2a4f', '#5f6fa3', '#f4a988', '#ffe2a8'],
  cieloDia: ['#5aa0d8', '#9cc9ea', '#e8f3fb'],
  interior: ['#2a1a22', '#4a2a2e', '#6a3a32'],
  oro: '#f2c165',
  oroClaro: '#ffe3a0',
  luz: '#fff2cf',
  crema: '#f6e8d2',
  arena: '#d9b68a',
  terracota: '#c8623e',
  terracotaOsc: '#8a3b26',
  cal: '#efe3cf', // pared encalada
  turquesa: '#2f8f8a',
  turquesaOsc: '#1d5e5b',
  verde: '#5f9a57',
  verdeOsc: '#2f5e38',
  madera: '#7a4b33',
  maderaOsc: '#4a2c1e',
  rosa: '#e79a8f',
  azul: '#3b5a8f',
  silueta: '#1a1424',
};

export const W = 1080;
export const H = 1920;
export const FPS = 30;
// Centro vertical de los subtítulos (zona segura de TikTok/Instagram)
export const SUB_Y = 1300;
