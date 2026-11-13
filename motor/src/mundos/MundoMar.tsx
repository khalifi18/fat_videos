// Mundo 3D «mar»: una barca de vela con un farol cruza el mar de noche, deja el puerto, ve un faro lejano y amanece.
// La barca avanza por el eje X (de izquierda a derecha en pantalla). Planos: dias, puerto, faro, timon, amanecer, final.
// Los planos de «seguimiento» van pegados a la barca; los demás son fijos en el mundo.
import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {PlanoCam, Tramo, azar, camaraEn, lienzo, ponerCamara, texturaBrillo} from './camara';

const X_PUERTO = -34;
const X_FARO = 85;
const Z_FARO = -12;
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const sm = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const mixN = (a: number, b: number, t: number) => a + (b - a) * t;
const C = (h: string) => new THREE.Color(h);
const mezcla = (a: string, b: string, t: number) => C(a).lerp(C(b), clamp(t));

/** Altura del mar en (x, z, t) */
const ola = (x: number, z: number, t: number, calma: number) =>
  (0.34 * Math.sin(x * 0.11 + t * 1.05) + 0.24 * Math.sin(z * 0.16 - t * 0.85 + x * 0.05) + 0.11 * Math.sin(x * 0.42 + z * 0.31 + t * 2.1)) * (1 - 0.6 * calma);

/** Posición de la barca en el instante t (s) */
const barca = (t: number, T: number) => {
  const u = clamp(t / T);
  return {x: mixN(-12, 60, u * (1.05 - 0.05 * u)), z: 0};
};

type Mov = {rel: boolean; obj: [number, number, number]; d: number; az: number; el: number; fov: number};
const PLANOS: Record<string, Mov> = {
  dias: {rel: true, obj: [1.5, 3.5, 0], d: 28, az: 20, el: 5, fov: 50},
  puerto: {rel: true, obj: [-14, 5, -6], d: 64, az: -26, el: 8, fov: 56},
  faro: {rel: true, obj: [38, 10, -6], d: 128, az: 0, el: 6, fov: 62},
  timon: {rel: true, obj: [2, 3.6, 0], d: 26, az: 36, el: 8, fov: 50},
  amanecer: {rel: true, obj: [22, 10, -6], d: 82, az: -8, el: 5, fov: 56},
  final: {rel: false, obj: [26, 10, -6], d: 190, az: 10, el: 14, fov: 66},
};

export const MundoMar: React.FC<{t: number; T: number; tramos: Tramo[]}> = ({t, T, tramos}) => {
  const {camera, scene} = useThree();
  const primera = (p: string) => tramos.find((x) => x.plano === p)?.t ?? null;
  const tDias = primera('dias') ?? 0;
  const tPuerto = primera('puerto');
  const tFaro = primera('faro');
  const tTimon = primera('timon');
  const tAm = primera('amanecer');
  const tFin = primera('final');

  // ───── estado del cielo ─────
  const finDias = tPuerto ?? tDias + 6;
  const ciclo = clamp((t - tDias) / Math.max(1, finDias - tDias)); // «los días pasan»: luna → sol → luna
  const enDias = t < finDias;
  const dia = enDias ? sm(Math.sin(ciclo * Math.PI * 2 - 0.5) * 1.7 + 0.15) : 0;
  const alba = tAm !== null ? sm((t - tAm + 0.4) / 4.5) : 0;
  const calma = tAm !== null ? sm((t - tAm) / 4) : tTimon !== null && t > tTimon ? 0.1 : 0;
  const luzPuerto = tPuerto !== null ? 1 - sm((t - tPuerto) / 6) : 1;
  const luzFaro = tFaro !== null ? sm((t - tFaro + 0.2) / 1.6) : 0;
  const fin = tFin ?? 1e9;

  const b = barca(t, T);
  const hb = ola(b.x, b.z, t, calma);
  const pitch = (ola(b.x + 3, b.z, t, calma) - ola(b.x - 3, b.z, t, calma)) / 6;
  const roll = (ola(b.x, b.z + 1.5, t, calma) - ola(b.x, b.z - 1.5, t, calma)) / 3;

  // cámara (con seguimiento a la barca) — se calcula aquí para poder usar su posición
  const plCam = Object.fromEntries(
    Object.entries(PLANOS).map(([k, m]) => [
      k,
      {obj: m.rel ? ([b.x + m.obj[0], m.obj[1] + hb * 0.4, b.z + m.obj[2]] as [number, number, number]) : m.obj, d: m.d, az: m.az, el: m.el, fov: m.fov} as PlanoCam,
    ]),
  );
  const cam = camaraEn(plCam, tramos, t, 1.5);
  const camPos = (() => {
    const az = (cam.az * Math.PI) / 180, el = (cam.el * Math.PI) / 180;
    return [cam.obj[0] + cam.d * Math.cos(el) * Math.sin(az), cam.obj[1] + cam.d * Math.sin(el), cam.obj[2] + cam.d * Math.cos(el) * Math.cos(az)];
  })();

  const aguaRef = useRef<THREE.Mesh>(null);
  const skyRef = useRef<THREE.ShaderMaterial>(null);
  const velaRef = useRef<THREE.Mesh>(null);

  const r = useMemo(() => {
    const rnd = azar(23);
    // mar: malla fina que se anima
    const agua = new THREE.PlaneGeometry(520, 300, 200, 110);
    agua.rotateX(-Math.PI / 2);
    // estrellas
    const est = new THREE.BufferGeometry();
    const pe: number[] = [];
    for (let i = 0; i < 1400; i++) {
      const a = rnd() * Math.PI * 2, e = 0.04 + rnd() * 1.3;
      pe.push(Math.cos(a) * Math.cos(e) * 380, Math.sin(e) * 380, Math.sin(a) * Math.cos(e) * 380);
    }
    est.setAttribute('position', new THREE.Float32BufferAttribute(pe, 3));
    // vela latina con panza
    const vela = new THREE.PlaneGeometry(1, 1, 8, 12);
    const vp = vela.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < vp.count; i++) {
      const u = vp.getX(i) + 0.5, v = vp.getY(i) + 0.5; // 0..1
      const ancho = 4.6 * (1 - v) + 0.25;
      vp.setXYZ(i, -0.2 + u * ancho, 1.7 + v * 7.4, Math.sin(Math.PI * u) * 0.9 * (1 - v * 0.6));
    }
    vela.computeVertexNormals();
    // casco: perfil lateral extruido y afinado en la quilla
    const perfil = new THREE.Shape();
    perfil.moveTo(-3.6, 0.9);
    perfil.quadraticCurveTo(-3.3, -0.55, -0.6, -0.72);
    perfil.quadraticCurveTo(2.2, -0.7, 3.9, 1.2);
    perfil.lineTo(3.6, 1.34);
    perfil.lineTo(-3.5, 1.1);
    perfil.closePath();
    const casco = new THREE.ExtrudeGeometry(perfil, {depth: 1.5, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.14, bevelSegments: 3, curveSegments: 14});
    casco.translate(0, 0, -0.75);
    const cp = casco.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cp.count; i++) {
      const y = cp.getY(i);
      const k = 0.4 + 0.6 * clamp((y + 0.8) / 2.1);
      cp.setZ(i, cp.getZ(i) * k);
    }
    casco.computeVertexNormals();
    // puerto
    const casas = Array.from({length: 22}).map((_, i) => ({
      p: [X_PUERTO - 34 + i * 3.4 + rnd() * 1.2, 0, -16 - rnd() * 9] as [number, number, number],
      s: [2.8 + rnd() * 2.6, 2.4 + rnd() * 4.6, 2.8 + rnd() * 2.6] as [number, number, number],
      c: ['#d9c4a6', '#c9a07a', '#e6d5bb', '#b9886a', '#cdb8c8'][Math.floor(rnd() * 5)],
      v: rnd(),
    }));
    // islas lejanas
    const islas = [[-190, -230, 36], [-40, -260, 30], [120, -250, 42], [260, -240, 34], [380, -210, 28]].map(([x, z, s]) => ({x, z, s}));
    // aves
    const aves = Array.from({length: 9}).map((_, i) => ({o: rnd() * 6, dy: rnd() * 5, dz: (rnd() - 0.5) * 16, dx: i * 3.2}));
    return {agua, est, vela, casco, casas, islas, aves, brillo: texturaBrillo(), brilloCalido: texturaBrillo('255,190,120')};
  }, []);

  // haz de luz del faro (degradado)
  const haz = useMemo(
    () =>
      lienzo(512, 64, (g) => {
        const gr = g.createLinearGradient(0, 0, 512, 0);
        gr.addColorStop(0, 'rgba(255,240,190,0.9)');
        gr.addColorStop(0.5, 'rgba(255,240,190,0.28)');
        gr.addColorStop(1, 'rgba(255,240,190,0)');
        g.fillStyle = gr;
        g.fillRect(0, 0, 512, 64);
      }),
    [],
  );

  // ───── colores ─────
  const cenit = mezcla(mezcla('#04061c', '#2c2a6a', alba), '#3b86d0', dia);
  const medio = mezcla(mezcla('#101a4e', '#c06a78', alba), '#78b8ea', dia);
  const horizonte = mezcla(mezcla('#2a2a66', '#ffb27a', alba), '#cfe6f2', dia);
  const mar0 = mezcla(mezcla('#0b1740', '#5a3a62', alba * 0.8), '#1f6aa0', dia);
  const sunH = mixN(-9, 13, sm(tAm !== null ? (t - tAm + 0.4) / 6 : 0)); // altura del sol al amanecer

  const skyU = useMemo(
    () => ({uTop: {value: new THREE.Color()}, uMid: {value: new THREE.Color()}, uHor: {value: new THREE.Color()}}),
    [],
  );

  useLayoutEffect(() => {
    ponerCamara(camera as THREE.PerspectiveCamera, cam);
    scene.background = horizonte.clone();
    scene.fog = new THREE.Fog(horizonte.clone().lerp(C('#0a1030'), 0.25 * (1 - dia)), 70, 430);
    skyU.uTop.value.copy(cenit);
    skyU.uMid.value.copy(medio);
    skyU.uHor.value.copy(horizonte);
    // olas
    const g = r.agua;
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, ola(pos.getX(i) + 70, pos.getZ(i), t, calma));
    pos.needsUpdate = true;
    g.computeVertexNormals();
  });

  // ───── luna / sol ─────
  const angDia = ciclo * Math.PI * 2;
  const lunaAltura = enDias ? 70 * Math.sin(angDia + 0.2 * Math.PI) + 18 : 60;
  const lunaX = enDias ? -60 + 220 * (ciclo * 1.0) : -30;
  const lunaVis = (1 - dia) * (1 - sm(((tAm ?? 1e9) === 1e9 ? -1e9 : t - (tAm as number) + 1.5) / 2.5));
  const sol = enDias ? 1 : 0;
  const solX = enDias ? -80 + 280 * ciclo : 260;
  const solY = enDias ? 90 * Math.sin(ciclo * Math.PI) - 4 : sunH;

  const cuernos = 0.8 + 0.2 * Math.sin(t * 6);
  const girofaro = t * 0.9;

  return (
    <>
      {/* luces */}
      <hemisphereLight args={[mezcla('#7a8ad8', '#fff0d8', dia + alba * 0.5), mezcla('#1a2250', '#3a4a70', dia), 0.9 + dia * 0.8 + alba * 0.4]} />
      <directionalLight position={[-40, 70, 50]} intensity={0.85 * (1 - dia) * (1 - alba * 0.7)} color={'#a8b8ff'} />
      <directionalLight position={[120, Math.max(4, sunH + 8), -80]} intensity={0.2 + alba * 2.6 + dia * 1.2} color={'#ffcf9a'} />
      <pointLight position={[b.x + 5.2, hb + 3.2, b.z + 0.3]} intensity={30 * (1 - dia * 0.8)} distance={32} color={'#ffb347'} decay={1.6} />
      <pointLight position={[X_FARO, 24, Z_FARO]} intensity={95 * luzFaro * (1 - dia)} distance={170} color={'#ffe3a0'} decay={1.4} />
      <pointLight position={[X_PUERTO + 6, 8, -8]} intensity={46 * luzPuerto} distance={70} color={'#ffcf8a'} decay={1.5} />

      {/* cielo */}
      <mesh>
        <sphereGeometry args={[420, 32, 24]} />
        <shaderMaterial
          ref={skyRef}
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          uniforms={skyU}
          vertexShader={'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }'}
          fragmentShader={'varying vec3 vP; uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHor; void main(){ float h = clamp(normalize(vP).y, 0.0, 1.0); vec3 c = mix(uHor, uMid, smoothstep(0.0, 0.22, h)); c = mix(c, uTop, smoothstep(0.18, 0.85, h)); gl_FragColor = vec4(c, 1.0); }'}
        />
      </mesh>
      <points geometry={r.est}>
        <pointsMaterial size={1.5} color={'#fff6e0'} transparent opacity={(1 - dia) * (1 - alba * 0.92)} fog={false} sizeAttenuation={false} depthWrite={false} />
      </points>
      {/* luna */}
      <group position={[lunaX, lunaAltura, -300]} visible={lunaVis > 0.02}>
        <sprite scale={[110, 110, 1]}>
          <spriteMaterial map={r.brillo} transparent opacity={0.5 * lunaVis} fog={false} depthWrite={false} />
        </sprite>
        <mesh>
          <circleGeometry args={[9, 48]} />
          <meshBasicMaterial color={'#fff1c9'} fog={false} transparent opacity={lunaVis} />
        </mesh>
      </group>
      {/* sol de «los días» (pasa por el cielo) */}
      <group position={[solX, solY, -300]} visible={enDias && dia > 0.02}>
        <sprite scale={[210, 210, 1]}>
          <spriteMaterial map={r.brilloCalido} transparent opacity={0.55 * dia} fog={false} depthWrite={false} />
        </sprite>
        <mesh>
          <circleGeometry args={[11, 48]} />
          <meshBasicMaterial color={'#fff1c9'} fog={false} transparent opacity={dia} />
        </mesh>
      </group>
      {/* sol del amanecer: sale justo detrás del faro */}
      <group position={[X_FARO + 16, sunH * 0.55 - 1, -96]} visible={!enDias && alba > 0.02}>
        <sprite scale={[130, 130, 1]}>
          <spriteMaterial map={r.brilloCalido} transparent opacity={0.7 * clamp(alba * 1.3)} fog={false} depthWrite={false} />
        </sprite>
        <mesh>
          <circleGeometry args={[4.6, 48]} />
          <meshBasicMaterial color={'#fff1c9'} fog={false} transparent opacity={clamp(alba * 1.8)} />
        </mesh>
      </group>

      {/* islas lejanas */}
      {r.islas.map((s, i) => (
        <mesh key={'i' + i} position={[s.x, s.s * 0.15, s.z]} scale={[2.4, 0.5, 1]}>
          <icosahedronGeometry args={[s.s, 1]} />
          <meshStandardMaterial color={mezcla(mezcla('#171a44', '#6a4a66', alba), '#4a7aa8', dia)} flatShading roughness={1} />
        </mesh>
      ))}

      {/* mar */}
      <mesh ref={aguaRef} geometry={r.agua} position={[70, 0, 0]}>
        <meshStandardMaterial color={mar0.clone().lerp(C('#2a58b0'), 0.35 * (1 - dia))} roughness={0.22} metalness={0.15} emissive={mar0.clone().lerp(C('#10306a'), 0.5)} emissiveIntensity={0.85 + alba * 0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[70, -1.6, 0]}>
        <planeGeometry args={[1400, 1400]} />
        <meshStandardMaterial color={mezcla(mar0.getStyle() as string, '#000000', 0.3)} roughness={1} />
      </mesh>

      {/* camino de luz de la luna / del sol sobre el agua */}
      {[
        {x: lunaX, o: 0.7 * lunaVis, c: r.brillo},
        {x: enDias ? solX : X_FARO + 16, o: 0.8 * (enDias ? dia : clamp(alba * 1.4)) * (enDias && solY < -2 ? 0 : 1), c: r.brilloCalido},
      ].map((q, i) => {
        const dx = q.x - camPos[0], dz = -300 - camPos[2];
        const ang = Math.atan2(dx, -dz);
        const largo = 300;
        return (
          <mesh key={'g' + i} position={[camPos[0] + dx * 0.5 * 0.5 + 0, 0.25, camPos[2] + dz * 0.25]} rotation={[-Math.PI / 2, 0, -ang]} visible={q.o > 0.02}>
            <planeGeometry args={[34, largo]} />
            <meshBasicMaterial map={q.c} transparent opacity={q.o} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
          </mesh>
        );
      })}

      {/* PUERTO */}
      <group>
        <mesh position={[X_PUERTO, 0.7, -9]}>
          <boxGeometry args={[78, 2.6, 14]} />
          <meshStandardMaterial color={'#3a2e40'} roughness={1} />
        </mesh>
        {r.casas.map((c, i) => (
          <group key={'h' + i} position={c.p}>
            <mesh position={[0, c.s[1] / 2 + 1.5, 0]}>
              <boxGeometry args={c.s} />
              <meshStandardMaterial color={c.c} roughness={1} />
            </mesh>
            <mesh position={[0, c.s[1] * 0.55 + 1.5, c.s[2] / 2 + 0.02]}>
              <planeGeometry args={[0.7, 0.95]} />
              <meshBasicMaterial color={c.v < 0.7 ? '#ffd27a' : '#2a2030'} transparent opacity={c.v < 0.7 ? 0.35 + 0.65 * luzPuerto : 1} />
            </mesh>
          </group>
        ))}
        <group position={[X_PUERTO + 4, 0, -19]}>
          <mesh position={[0, 11, 0]}>
            <boxGeometry args={[3, 20, 3]} />
            <meshStandardMaterial color={'#cdaa80'} roughness={1} />
          </mesh>
          <mesh position={[0, 21.6, 0]}>
            <boxGeometry args={[1.6, 2.4, 1.6]} />
            <meshStandardMaterial color={'#cdaa80'} />
          </mesh>
          <mesh position={[0, 23.2, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1.5, 2.6, 4]} />
            <meshStandardMaterial color={'#2f7a58'} flatShading />
          </mesh>
          <mesh position={[0, 24.8, 0]}>
            <sphereGeometry args={[0.35, 12, 8]} />
            <meshBasicMaterial color={'#ffd27a'} />
          </mesh>
        </group>
        {[-30, -14, 2, 16].map((dx, i) => (
          <group key={'f' + i} position={[X_PUERTO + dx, 0, -3]}>
            <mesh position={[0, 2.4, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 3.2, 8]} />
              <meshStandardMaterial color={'#1a1424'} />
            </mesh>
            <mesh position={[0, 4.2, 0]}>
              <boxGeometry args={[0.5, 0.6, 0.5]} />
              <meshBasicMaterial color={'#ffd27a'} transparent opacity={0.3 + 0.7 * luzPuerto} />
            </mesh>
            <sprite position={[0, 4.2, 0]} scale={[4.5, 4.5, 1]}>
              <spriteMaterial map={r.brilloCalido} transparent opacity={0.8 * luzPuerto} depthWrite={false} />
            </sprite>
          </group>
        ))}
      </group>

      {/* FARO sobre su roca */}
      <group position={[X_FARO, 0, Z_FARO]}>
        <mesh position={[0, 0.6, 0]} scale={[1.5, 0.7, 1.2]} rotation={[0, 0.5, 0]}>
          <icosahedronGeometry args={[7.5, 1]} />
          <meshStandardMaterial color={mezcla('#2a2848', '#6a5a68', alba)} flatShading roughness={1} />
        </mesh>
        <mesh position={[0, 9.2, 0]}>
          <cylinderGeometry args={[1.55, 2.5, 17, 24]} />
          <meshStandardMaterial color={'#ece4d8'} roughness={0.8} />
        </mesh>
        {[3.2, 8.2, 13.2].map((y, i) => (
          <mesh key={'b' + i} position={[0, y, 0]}>
            <cylinderGeometry args={[1.55 + (1 - (y - 0.7) / 17) * 0.95 + 0.04, 1.55 + (1 - (y + 1.5 - 0.7) / 17) * 0.95 + 0.04, 1.9, 24]} />
            <meshStandardMaterial color={i === 1 ? '#ece4d8' : '#b8403a'} roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 18, 0]}>
          <cylinderGeometry args={[2.5, 2.3, 0.45, 24]} />
          <meshStandardMaterial color={'#3a3248'} />
        </mesh>
        <mesh position={[0, 19.8, 0]}>
          <cylinderGeometry args={[1.35, 1.35, 3.2, 20]} />
          <meshBasicMaterial color={'#ffe3a0'} transparent opacity={0.35 + 0.65 * luzFaro} />
        </mesh>
        <mesh position={[0, 22.2, 0]}>
          <coneGeometry args={[1.9, 2.4, 20]} />
          <meshStandardMaterial color={'#b8403a'} />
        </mesh>
        <sprite position={[0, 19.8, 0]} scale={[26 * luzFaro, 26 * luzFaro, 1]}>
          <spriteMaterial map={r.brillo} transparent opacity={0.9 * luzFaro * (1 - dia * 0.8)} depthWrite={false} />
        </sprite>
        {/* haz giratorio */}
        <group position={[0, 19.8, 0]} rotation={[0, girofaro, 0]}>
          {[0, Math.PI].map((a, i) => (
            <mesh key={i} position={[Math.cos(a) * 60, 0, Math.sin(a) * 60]} rotation={[0, -a, 0]}>
              <planeGeometry args={[120, 9]} />
              <meshBasicMaterial map={haz} transparent opacity={0.85 * luzFaro * (1 - dia) * (i ? 0.5 : 1) * cuernos} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} fog={false} />
            </mesh>
          ))}
        </group>
      </group>

      {/* BARCA */}
      <group position={[b.x, hb + 0.55, b.z]} rotation={[roll * 0.5, 0, -pitch * 0.9]}>
        <mesh geometry={r.casco}>
          <meshStandardMaterial color={'#5a3322'} roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.02, 0]} scale={[1, 1, 1]}>
          <boxGeometry args={[7.1, 0.12, 0.8]} />
          <meshStandardMaterial color={'#c9983a'} metalness={0.3} roughness={0.5} />
        </mesh>
        {[-2.2, -0.8, 0.6, 2.0].map((x, i) => (
          <mesh key={i} position={[x, 0.55, 0]}>
            <boxGeometry args={[0.05, 0.9, 1.1]} />
            <meshStandardMaterial color={'#3a2014'} />
          </mesh>
        ))}
        {/* cubierta */}
        <mesh position={[-0.2, 0.92, 0]}>
          <boxGeometry args={[6.4, 0.12, 1.15]} />
          <meshStandardMaterial color={'#8a5a38'} roughness={0.9} />
        </mesh>
        {/* mástil y vela */}
        <mesh position={[-0.2, 5.2, 0]}>
          <cylinderGeometry args={[0.1, 0.14, 8.6, 10]} />
          <meshStandardMaterial color={'#3a2418'} roughness={0.8} />
        </mesh>
        <mesh ref={velaRef} geometry={r.vela} position={[0, 0.2, 0]}>
          <meshStandardMaterial color={mezcla('#d9cdb6', '#fff0d8', alba + dia * 0.5)} side={THREE.DoubleSide} roughness={0.9} emissive={'#ffb347'} emissiveIntensity={0.1 * (1 - dia)} />
        </mesh>
        {/* farol en la proa */}
        <mesh position={[3.4, 2.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 2.9, 6]} />
          <meshStandardMaterial color={'#2a1810'} />
        </mesh>
        <mesh position={[3.9, 3.5, 0]}>
          <boxGeometry args={[0.5, 0.65, 0.5]} />
          <meshBasicMaterial color={'#ffd27a'} />
        </mesh>
        <sprite position={[3.9, 3.5, 0]} scale={[7, 7, 1]}>
          <spriteMaterial map={r.brilloCalido} transparent opacity={0.9 * (1 - dia * 0.7)} depthWrite={false} />
        </sprite>
        {/* timonel: silueta sin cara */}
        <group position={[-2.8, 1.0, 0]}>
          <mesh position={[0, 0.9, 0]}>
            <capsuleGeometry args={[0.32, 1.0, 6, 12]} />
            <meshStandardMaterial color={'#140f26'} roughness={1} />
          </mesh>
          <mesh position={[0.05, 1.98, 0]}>
            <sphereGeometry args={[0.29, 16, 12]} />
            <meshStandardMaterial color={'#140f26'} roughness={1} />
          </mesh>
          <mesh position={[-0.7, 0.75, 0]} rotation={[0, 0, 1.1]}>
            <cylinderGeometry args={[0.1, 0.1, 1.3, 8]} />
            <meshStandardMaterial color={'#140f26'} />
          </mesh>
        </group>
        <mesh position={[-3.7, 1.0, 0]} rotation={[0, 0, -0.35]}>
          <cylinderGeometry args={[0.1, 0.1, 1.9, 8]} />
          <meshStandardMaterial color={'#2a1810'} />
        </mesh>
      </group>
      {/* estela de espuma */}
      {Array.from({length: 22}).map((_, i) => {
        const k = i / 22;
        const x = b.x - 4 - i * 1.5;
        return (
          <mesh key={'w' + i} position={[x, ola(x, b.z, t, calma) + 0.12, b.z + Math.sin(i * 1.7) * (0.4 + k * 1.6)]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.55 + k * 1.3, 12]} />
            <meshBasicMaterial color={'#e6f2ff'} transparent opacity={0.34 * (1 - k)} depthWrite={false} />
          </mesh>
        );
      })}
      {/* reflejo cálido del farol sobre el agua */}
      <mesh position={[b.x + 5, hb + 0.2, b.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 3]} />
        <meshBasicMaterial map={r.brilloCalido} transparent opacity={0.55 * (1 - dia)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* aves al amanecer */}
      {tAm !== null &&
        r.aves.map((a, i) => {
          const u = clamp((t - tAm - 1.5) / 3);
          const x = X_FARO - 70 + a.dx + ((t * 4 + a.o) % 30) - 15;
          const y = 22 + a.dy + Math.sin(t * 1.5 + a.o) * 1.2;
          const aleteo = Math.sin(t * 9 + i) * 0.55;
          return (
            <group key={'a' + i} position={[x, y, Z_FARO + 8 + a.dz]} visible={u > 0}>
              <mesh rotation={[0, 0, aleteo]} position={[0, 0, -0.5]}>
                <boxGeometry args={[0.1, 0.05, 1.4]} />
                <meshBasicMaterial color={'#1a1430'} />
              </mesh>
              <mesh rotation={[0, 0, -aleteo]} position={[0, 0, 0.5]}>
                <boxGeometry args={[0.1, 0.05, 1.4]} />
                <meshBasicMaterial color={'#1a1430'} />
              </mesh>
            </group>
          );
        })}
      {fin < 0 ? null : null}
    </>
  );
};
