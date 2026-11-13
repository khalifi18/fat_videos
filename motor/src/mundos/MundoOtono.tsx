// Mundo 3D «otono»: un puente de madera sobre un arroyo en un bosque de otoño. Una silueta sin cara camina con un farol;
// de su boca salen palabras doradas, sobre su cabeza brilla una luz, y al llegar a «el rostro cambia con el tiempo»
// pasan las estaciones (otoño → invierno → primavera) mientras la silueta y su luz siguen igual.
// Planos: puente, espera, lengua, mente, tiempo, luz, final. La cámara va pegada a la silueta.
import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {PlanoCam, Tramo, azar, camaraEn, lienzo, ponerCamara, texturaBrillo} from './camara';

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const sm = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const mixN = (a: number, b: number, t: number) => a + (b - a) * t;
const C = (h: string) => new THREE.Color(h);
const mezcla = (a: string, b: string, t: number) => C(a).lerp(C(b), clamp(t));

const VEL = 1.9; // velocidad de la silueta (u/s) hacia -z
const camino = (z: number) => 2.4 * Math.sin(z * 0.042) + 1.2 * Math.sin(z * 0.017 + 1);
const dcamino = (z: number) => 2.4 * 0.042 * Math.cos(z * 0.042) + 1.2 * 0.017 * Math.cos(z * 0.017 + 1);

type Mov = {obj: [number, number, number]; d: number; az: number; el: number; fov: number};
const PLANOS: Record<string, Mov> = {
  puente: {obj: [0.2, 2.0, -1.2], d: 11.5, az: 10, el: 8, fov: 48},
  espera: {obj: [0, 3.0, -6], d: 24, az: 12, el: 20, fov: 54},
  lengua: {obj: [0, 2.4, -1.2], d: 7.2, az: 74, el: 6, fov: 46},
  mente: {obj: [0, 2.9, -0.4], d: 6.4, az: 28, el: 8, fov: 44},
  tiempo: {obj: [0, 3.0, -8], d: 22, az: 14, el: 11, fov: 52},
  luz: {obj: [0, 2.6, -1], d: 9, az: 180, el: 6, fov: 46},
  final: {obj: [0, 6, -16], d: 62, az: 28, el: 28, fov: 52},
  caminar: {obj: [0, 1.7, -7], d: 7, az: 0, el: 2, fov: 58}, // se recalcula: cámara a la altura de los ojos, mirando por el puente
};

// paletas por estación (0 otoño, 1 otoño tardío, 2 invierno, 3 primavera)
const HOJAS = [
  ['#e07a1f', '#f0a830', '#c8501c', '#d8c040', '#b8401c'],
  ['#9a5a28', '#a87030', '#8a4a20', '#7a5a2a', '#6a3a1c'],
  ['#eef3fa', '#dfe8f4', '#f4f8ff', '#e6edf7', '#d8e2f0'],
  ['#f4b8c8', '#ffe0e8', '#8fc870', '#a8dc88', '#f8c8d8'],
];
const TIERRA = ['#6a4a22', '#4a3a28', '#e8eef6', '#4f8a3a'];
const CIELO = ['#d9c3a0', '#b8a890', '#c8d4e0', '#a8d4f0'];
const PART = ['#f09a30', '#b86a28', '#ffffff', '#ffc8d8'];

const estacion = (s: number, pal: string[][] | string[]) => {
  const i = Math.min(2, Math.floor(s)), f = s - i;
  return [i, Math.min(3, i + 1), f] as const;
};

export const MundoOtono: React.FC<{t: number; T: number; tramos: Tramo[]}> = ({t, T, tramos}) => {
  const {camera, scene} = useThree();
  const primera = (p: string) => tramos.find((x) => x.plano === p)?.t ?? null;
  const tLengua = primera('lengua');
  const tMente = primera('mente');
  const tTiempo = primera('tiempo');
  const tLuz = primera('luz');

  // estación continua: 0 (otoño) … 3 (primavera)
  const s = tTiempo !== null ? 3 * sm((t - tTiempo + 0.2) / Math.max(2.5, (tLuz ?? tTiempo + 7) - tTiempo + 1.8)) : 0;
  const [sa, sb, sf] = estacion(s, TIERRA);
  const sf2 = sm(sf);

  // silueta
  const wz = -t * VEL;
  const wx = camino(wz);
  const yaw = Math.atan2(dcamino(wz) * -VEL, -VEL);
  const paso = Math.sin(t * 5.2);

  // cámara pegada a la silueta
  const plCam = Object.fromEntries(
    Object.entries(PLANOS).map(([k, m]) => {
      if (k === 'caminar') {
        // cámara en primera persona: a la altura de los ojos, mirando hacia donde sigue el puente, con un balanceo suave
        const ahead = 9;
        const P: [number, number, number] = [camino(wz - ahead) + Math.sin(t * 0.6) * 0.25, 1.55 + Math.sin(t * 5.2) * 0.025, wz - ahead];
        const Cc = [wx + Math.sin(t * 2.6) * 0.04, 1.72 + Math.abs(Math.sin(t * 2.6)) * 0.05, wz];
        const dh = Math.hypot(Cc[0] - P[0], Cc[2] - P[2]);
        return [k, {obj: P, d: Math.hypot(dh, Cc[1] - P[1]), az: (Math.atan2(Cc[0] - P[0], Cc[2] - P[2]) * 180) / Math.PI, el: (Math.atan2(Cc[1] - P[1], dh) * 180) / Math.PI, fov: m.fov} as PlanoCam];
      }
      return [k, {obj: [wx + m.obj[0], m.obj[1], wz + m.obj[2]] as [number, number, number], d: m.d, az: m.az + (yaw * 180) / Math.PI * 0.6, el: m.el, fov: m.fov} as PlanoCam];
    }),
  );
  const planoActual = [...tramos].reverse().find((x) => t >= x.t)?.plano ?? 'puente';
  const enCaminar = planoActual === 'caminar';
  const cam = camaraEn(plCam, tramos, t, 1.5);
  const camP = (() => {
    const az = (cam.az * Math.PI) / 180, el = (cam.el * Math.PI) / 180;
    return [cam.obj[0] + cam.d * Math.cos(el) * Math.sin(az), cam.obj[1] + cam.d * Math.sin(el), cam.obj[2] + cam.d * Math.cos(el) * Math.cos(az)];
  })();
  const lejos = (x: number, y: number, z: number, d = enCaminar ? 0.8 : 5.5) => (x - camP[0]) ** 2 + (y - camP[1]) ** 2 + (z - camP[2]) ** 2 > d * d;

  const tablas = useRef<THREE.InstancedMesh>(null);
  const copas = useRef<THREE.InstancedMesh>(null);
  const partRef = useRef<THREE.Points>(null);

  const r = useMemo(() => {
    const rnd = azar(41);
    // tablas del puente
    const NT = 340;
    const mT = new THREE.Matrix4();
    const tablasM: THREE.Matrix4[] = [];
    for (let i = 0; i < NT; i++) {
      const z = 24 - i * 0.5;
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(-dcamino(z), 1) * 0 + Math.atan(dcamino(z)));
      mT.compose(new THREE.Vector3(camino(z), 0.0, z), q, new THREE.Vector3(1, 1, 1));
      tablasM.push(mT.clone());
    }
    // árboles
    const arboles = Array.from({length: 190}).map(() => {
      const z = 30 - rnd() * 210;
      const lado = rnd() < 0.5 ? -1 : 1;
      return {x: camino(z) + lado * (11 + rnd() * 48), z, h: 4.5 + rnd() * 3.8, g: 0.3 + rnd() * 0.2, v: rnd()};
    });
    // copas: 3 blobs por árbol
    const blobs: {x: number; y: number; z: number; r: number; a: number}[] = [];
    arboles.forEach((a, i) => {
      for (let k = 0; k < 6; k++) blobs.push({x: a.x + (rnd() - 0.5) * 4.4, y: a.h + (k % 3 - 1) * 1.2 + rnd() * 1.6, z: a.z + (rnd() - 0.5) * 4.4, r: 1.2 + rnd() * 1.1, a: i * 6 + k});
    });
    // matas bajas junto al camino (dan profundidad)
    for (let i = 0; i < 70; i++) {
      const z = 20 - rnd() * 170, lado = rnd() < 0.5 ? -1 : 1;
      blobs.push({x: camino(z) + lado * (5.2 + rnd() * 3.5), y: 0.2 + rnd() * 0.5, z, r: 0.7 + rnd() * 0.8, a: 2000 + i});
    }
    // follaje espeso pegado a las barandillas (como un sauce a cada lado del puente)
    for (let i = 0; i < 300; i++) {
      const z = 22 - rnd() * 175, lado = rnd() < 0.5 ? -1 : 1;
      blobs.push({x: camino(z) + lado * (4.3 + rnd() * 2.6), y: 0.4 + rnd() * 3.4, z, r: 0.5 + rnd() * 0.6, a: 3000 + i});
    }
    // partículas (hojas / nieve / pétalos)
    const NP = 520;
    const pos = new Float32Array(NP * 3);
    const sem = Array.from({length: NP}).map(() => ({x: (rnd() - 0.5) * 40, y: rnd() * 14, z: rnd() * 60 - 40, v: 0.5 + rnd() * 0.9, f: rnd() * 6}));
    const geoP = new THREE.BufferGeometry();
    geoP.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    // estrellitas de la mente
    const mente = Array.from({length: 26}).map(() => ({a: rnd() * Math.PI * 2, r: 0.5 + rnd() * 0.9, y: 0.5 + rnd() * 0.9, v: 0.4 + rnd() * 0.8}));
    // palabras doradas
    const palabras = ['كلمة طيبة', 'صدق', 'حكمة', 'رحمة', 'حياء', 'أدب'].map((txt) =>
      lienzo(512, 192, (g) => {
        g.textAlign = 'center';
        g.shadowColor = 'rgba(255,190,80,0.95)';
        g.shadowBlur = 30;
        g.fillStyle = '#ffe3a0';
        g.font = '700 118px Amiri, "Noto Naskh Arabic", serif';
        g.fillText(txt, 256, 128);
      }),
    );
    return {NT, tablasM, arboles, blobs, sem, geoP, mente, palabras, NP, brillo: texturaBrillo(), brilloCalido: texturaBrillo('255,190,120'), rayo: lienzo(64, 512, (g) => {
      const gr = g.createLinearGradient(0, 0, 0, 512);
      gr.addColorStop(0, 'rgba(255,232,170,0.0)');
      gr.addColorStop(0.4, 'rgba(255,232,170,0.35)');
      gr.addColorStop(1, 'rgba(255,232,170,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 512);
    })};
  }, []);

  const colTierra = mezcla(TIERRA[sa], TIERRA[sb], sf2);
  const colCielo = mezcla(CIELO[sa], CIELO[sb], sf2);
  const colPart = mezcla(PART[sa], PART[sb], sf2);
  const escalaHoja = [1, 0.55, 0.06, 1][sa] * (1 - sf2) + [1, 0.55, 0.06, 1][sb] * sf2;

  const skyU = useMemo(() => ({uTop: {value: new THREE.Color()}, uMid: {value: new THREE.Color()}, uHor: {value: new THREE.Color()}}), []);

  useLayoutEffect(() => {
    ponerCamara(camera as THREE.PerspectiveCamera, cam);
    scene.background = colCielo.clone();
    scene.fog = new THREE.Fog(colCielo.clone().lerp(C('#ffffff'), 0.1), 14, 120);
    skyU.uTop.value.copy(mezcla('#6a88b0', '#7aa8d8', sa >= 3 ? 1 : 0).lerp(colCielo, 0.35));
    skyU.uMid.value.copy(colCielo.clone().lerp(C('#fff4dc'), 0.25));
    skyU.uHor.value.copy(colCielo.clone().lerp(C('#fff0d0'), 0.5));
    // copas con color y tamaño de la estación
    const im = copas.current;
    if (im) {
      const m = new THREE.Matrix4(), col = new THREE.Color();
      r.blobs.forEach((b, i) => {
        const e = (lejos(b.x, b.y, b.z, enCaminar ? b.r * 1.4 + 0.9 : 6.5) ? 1 : 0.0001) * escalaHoja * (0.9 + 0.2 * ((i * 7) % 5) / 5);
        m.compose(new THREE.Vector3(b.x, b.y, b.z), new THREE.Quaternion(), new THREE.Vector3(b.r * e, b.r * e * 0.85, b.r * e));
        im.setMatrixAt(i, m);
        const pa = HOJAS[sa][i % 5], pb = HOJAS[sb][i % 5];
        col.set(pa).lerp(C(pb), sf2);
        im.setColorAt(i, col);
      });
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    }
    const tb = tablas.current;
    if (tb) {
      const col = new THREE.Color();
      r.tablasM.forEach((mm, i) => {
        tb.setMatrixAt(i, mm);
        col.set(i % 3 === 0 ? '#6a4228' : i % 3 === 1 ? '#7a4e30' : '#5a3822').lerp(C('#f2f6fb'), sa === 2 ? 0.9 * (1 - sf2) + (sb === 3 ? 0 : 0) : sa === 1 ? 0.9 * sf2 : 0);
        tb.setColorAt(i, col);
      });
      tb.instanceMatrix.needsUpdate = true;
      if (tb.instanceColor) tb.instanceColor.needsUpdate = true;
    }
    // partículas
    const pg = r.geoP.attributes.position as THREE.BufferAttribute;
    const nieva = sa === 2 && sf2 < 0.6 ? 1 : 0;
    r.sem.forEach((q, i) => {
      const caida = (q.y - t * q.v * (nieva ? 0.9 : 0.6)) % 14;
      const y = caida < 0 ? caida + 14 : caida;
      pg.setXYZ(i, wx + q.x + Math.sin(t * 0.9 + q.f) * 1.2, y, wz + q.z + ((t * 0.3 * q.v) % 3));
    });
    pg.needsUpdate = true;
  });

  // luz de la silueta (palabras y mente)
  const tL = tLengua ?? 1e9;
  const palabrasE = clamp((t - tL) / 0.6) * (1 - clamp((t - (tMente ?? tL + 5) - 0.3) / 1.2));
  const menteE = tMente !== null ? sm((t - tMente) / 0.9) * (1 - clamp((t - (tTiempo ?? 1e9) - 0.3) / 1.5)) : 0;
  const luzSil = 1 + 0.15 * Math.sin(t * 6);

  return (
    <>
      <hemisphereLight args={[mezcla('#ffe6c0', '#dfe8f4', sa >= 2 ? 1 : 0), mezcla('#4a3622', '#d0d8e4', sa >= 2 ? 1 : 0), 1.15]} />
      <directionalLight position={[-30, 22, 18]} intensity={1.45} color={sa >= 3 ? '#fff0d8' : '#ffd29a'} />
      <pointLight position={[wx + 0.7, 1.9, wz - 0.3]} intensity={11 * luzSil} distance={14} color={'#ffb347'} decay={1.5} />

      {/* cielo */}
      <mesh>
        <sphereGeometry args={[300, 24, 16]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          uniforms={skyU}
          vertexShader={'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }'}
          fragmentShader={'varying vec3 vP; uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHor; void main(){ float h = clamp(normalize(vP).y, 0.0, 1.0); vec3 c = mix(uHor, uMid, smoothstep(0.0, 0.25, h)); c = mix(c, uTop, smoothstep(0.2, 0.9, h)); gl_FragColor = vec4(c, 1.0); }'}
        />
      </mesh>

      {/* suelo del bosque y arroyo bajo el puente */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, -60]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color={colTierra} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, -60]}>
        <planeGeometry args={[11, 400]} />
        <meshStandardMaterial color={mezcla('#2a5a62', '#bcd4e6', sa === 2 ? 0.7 : 0)} roughness={0.2} metalness={0.4} emissive={'#10303a'} emissiveIntensity={0.4} />
      </mesh>

      {/* puente: tablas, postes y barandillas */}
      <instancedMesh ref={tablas} args={[undefined, undefined, r.NT]} frustumCulled={false}>
        <boxGeometry args={[4.2, 0.14, 0.42]} />
        <meshStandardMaterial color={'#ffffff'} roughness={0.85} />
      </instancedMesh>
      {Array.from({length: 130}).map((_, i) => {
        const z = 24 - i * 3.0;
        return [-1, 1].map((lado) => {
          const x = camino(z) + lado * 2.18;
          return (
            <group key={`${i}${lado}`} position={[x, 0, z]} rotation={[0, Math.atan(dcamino(z)), 0]}>
              <mesh position={[0, 0.55, 0]}>
                <boxGeometry args={[0.14, 1.1, 0.14]} />
                <meshStandardMaterial color={'#2f4a3a'} roughness={0.8} />
              </mesh>
              <mesh position={[0, 1.0, 1.5]}>
                <boxGeometry args={[0.1, 0.1, 3.1]} />
                <meshStandardMaterial color={'#3a5a46'} roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.55, 1.5]}>
                <boxGeometry args={[0.07, 0.07, 3.1]} />
                <meshStandardMaterial color={'#3a5a46'} roughness={0.8} />
              </mesh>
            </group>
          );
        });
      })}

      {/* árboles */}
      {r.arboles.map((a, i) => (
        <mesh key={'t' + i} position={[a.x, a.h / 2 - 1.5, a.z]} visible={lejos(a.x, 2, a.z, 4)}>
          <cylinderGeometry args={[a.g * 0.6, a.g, a.h + 3, 7]} />
          <meshStandardMaterial color={mezcla('#4a3626', '#6a5a50', sa >= 2 ? 0.5 : 0)} roughness={1} />
        </mesh>
      ))}
      <instancedMesh ref={copas} args={[undefined, undefined, r.blobs.length]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={'#ffffff'} flatShading roughness={0.9} />
      </instancedMesh>

      {/* rayos de luz entre los árboles */}
      {[-14, -2, 10].map((dx, i) => (
        <mesh key={'r' + i} position={[wx + dx, 8, wz - 14 - i * 9]} rotation={[0, 0.4, -0.45]}>
          <planeGeometry args={[4, 26]} />
          <meshBasicMaterial map={r.rayo} transparent opacity={(enCaminar ? 0.16 : 0.55) * (sa >= 2 ? 0.5 : 1)} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} fog={false} />
        </mesh>
      ))}

      {/* hojas / nieve / pétalos */}
      <points ref={partRef} geometry={r.geoP}>
        <pointsMaterial map={r.brillo} color={colPart} size={sa === 2 && sf2 < 0.6 ? 0.2 : 0.32} transparent opacity={0.95} depthWrite={false} />
      </points>

      {/* LA SILUETA con su farol */}
      <group position={[wx, 0.1, wz]} rotation={[0, yaw, 0]} visible={!enCaminar}>
        {/* manto */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.2, 0.36, 1.35, 14]} />
          <meshStandardMaterial color={'#120d1c'} roughness={1} />
        </mesh>
        <mesh position={[0, 1.95, 0]}>
          <sphereGeometry args={[0.3, 18, 14]} />
          <meshStandardMaterial color={'#120d1c'} roughness={1} />
        </mesh>
        <mesh position={[0, 2.22, 0]}>
          <sphereGeometry args={[0.235, 18, 14]} />
          <meshStandardMaterial color={'#120d1c'} roughness={1} />
        </mesh>
        {/* piernas (pivotan en la cadera) */}
        <group position={[0.12, 0.55, 0]} rotation={[paso * 0.5, 0, 0]}>
          <mesh position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.09, 0.5, 4, 8]} />
            <meshStandardMaterial color={'#0c0818'} />
          </mesh>
        </group>
        <group position={[-0.12, 0.55, 0]} rotation={[-paso * 0.5, 0, 0]}>
          <mesh position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.09, 0.5, 4, 8]} />
            <meshStandardMaterial color={'#0c0818'} />
          </mesh>
        </group>
        {/* brazo con el farol (colgando) */}
        <group position={[0.3, 1.7, 0.02]} rotation={[-0.4 - paso * 0.1, 0, -0.05]}>
          <mesh position={[0, -0.42, 0]}>
            <capsuleGeometry args={[0.07, 0.62, 4, 8]} />
            <meshStandardMaterial color={'#120d1c'} />
          </mesh>
        </group>
        <group position={[0.34, 0.92, 0.4 + paso * 0.04]}>
          <mesh>
            <boxGeometry args={[0.18, 0.26, 0.18]} />
            <meshBasicMaterial color={'#ffd27a'} />
          </mesh>
          <sprite scale={[3.1 * luzSil, 3.1 * luzSil, 1]}>
            <spriteMaterial map={r.brilloCalido} transparent opacity={0.95} depthWrite={false} />
          </sprite>
        </group>

        {/* palabras doradas que salen de la boca */}
        {r.palabras.map((tx, i) => {
          const k = (t - tL) * 0.6 - i * 0.34;
          const v = clamp(k / 1.3);
          return (
            <sprite key={'p' + i} position={[0.3 + v * 2.2, 2.05 + v * 0.8 + (i % 3) * 0.28, 0.6 + (i % 2) * 0.5]} scale={[1.45, 0.55, 1]}>
              <spriteMaterial map={tx} transparent opacity={palabrasE * Math.sin(Math.PI * Math.max(0.02, Math.min(0.98, v))) * (k > 0 ? 1 : 0)} depthWrite={false} fog={false} />
            </sprite>
          );
        })}
        {/* la luz de la mente */}
        <group position={[0, 2.85, 0]} visible={menteE > 0.02}>
          <sprite scale={[5.2 * menteE, 5.2 * menteE, 1]}>
            <spriteMaterial map={r.brillo} transparent opacity={0.95 * menteE} depthWrite={false} />
          </sprite>
          {r.mente.map((m, i) => (
            <mesh key={'m' + i} position={[Math.cos(m.a + t * m.v) * m.r * menteE, m.y * menteE * 0.9, Math.sin(m.a + t * m.v) * m.r * menteE]}>
              <sphereGeometry args={[0.045 + (i % 3) * 0.015, 8, 6]} />
              <meshBasicMaterial color={'#fff0c0'} transparent opacity={menteE * (0.5 + 0.5 * Math.sin(t * 4 + i))} />
            </mesh>
          ))}
          <pointLight intensity={12 * menteE} distance={10} color={'#ffe3a0'} />
        </group>
      </group>
    </>
  );
};
