export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0→1 entre start y start+len (fotogramas) */
export const prog = (f: number, start: number, len: number) => clamp((f - start) / Math.max(1, len));
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const back = (t: number) => {
  t = clamp(t);
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
