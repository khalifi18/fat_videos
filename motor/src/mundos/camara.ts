// Cámara en órbita: cada plano es {obj, d, az, el, fov}. La historia salta de plano en plano
// con un movimiento suave, y dentro de cada plano la cámara no para (deriva lenta).
import * as THREE from 'three';

export type PlanoCam = {obj: [number, number, number]; d: number; az: number; el: number; fov: number};
export type Tramo = {plano: string; t: number}; // a partir de t (s) la cámara va a `plano`

const suave = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const mezcla = (a: PlanoCam, b: PlanoCam, f: number): PlanoCam => ({
  obj: [0, 1, 2].map((i) => a.obj[i] + (b.obj[i] - a.obj[i]) * f) as [number, number, number],
  d: Math.exp(Math.log(a.d) + (Math.log(b.d) - Math.log(a.d)) * f), // la distancia en escala logarítmica: acercamientos naturales
  az: a.az + (b.az - a.az) * f,
  el: a.el + (b.el - a.el) * f,
  fov: a.fov + (b.fov - a.fov) * f,
});

/** Plano de cámara en el instante t (s). `viaje` = segundos que tarda en llegar al plano nuevo. */
export const camaraEn = (planos: Record<string, PlanoCam>, tramos: Tramo[], t: number, viaje = 1.1): PlanoCam => {
  let i = 0;
  while (i < tramos.length - 1 && t >= tramos[i + 1].t) i++;
  const B = planos[tramos[i].plano] ?? Object.values(planos)[0];
  const A = i > 0 ? planos[tramos[i - 1].plano] ?? B : B;
  const f = suave(Math.min(1, Math.max(0, (t - tramos[i].t) / viaje)));
  const c = mezcla(A, B, i > 0 ? f : 1);
  // dentro del plano la cámara nunca para: gira, se acerca y sube un poco (sensación de viaje)
  const deriva = t - tramos[i].t;
  return {
    ...c,
    obj: [c.obj[0], c.obj[1] + Math.min(0.6, deriva * 0.08), c.obj[2]],
    az: c.az + deriva * 4,
    el: c.el + Math.min(4, deriva * 0.5),
    d: c.d * (1 - Math.min(0.22, deriva * 0.035)),
  };
};

export const ponerCamara = (cam: THREE.PerspectiveCamera, c: PlanoCam) => {
  const az = (c.az * Math.PI) / 180, el = (c.el * Math.PI) / 180;
  const [x, y, z] = c.obj;
  cam.position.set(x + c.d * Math.cos(el) * Math.sin(az), y + c.d * Math.sin(el), z + c.d * Math.cos(el) * Math.cos(az));
  cam.fov = c.fov;
  cam.near = 0.05;
  cam.far = 600;
  cam.lookAt(x, y, z);
  cam.updateProjectionMatrix();
};

/** Textura desde un canvas 2D */
export const lienzo = (w: number, h: number, pinta: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  pinta(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Textura de brillo radial (para soles, farolas, luciérnagas) */
export const texturaBrillo = (color = '255,226,160') =>
  lienzo(256, 256, (g) => {
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, `rgba(${color},1)`);
    r.addColorStop(0.25, `rgba(${color},0.55)`);
    r.addColorStop(0.6, `rgba(${color},0.12)`);
    r.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
  });

export const azar = (semilla: number) => {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};
