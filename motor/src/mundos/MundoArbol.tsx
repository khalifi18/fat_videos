// Mundo 3D «arbol»: una colina de noche con un árbol, un pueblo marroquí al fondo, raíces que brillan bajo
// tierra y un amanecer. Planos: general, suelo, raices, tronco, copa, pueblo, amanecer.
import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {PlanoCam, Tramo, azar, camaraEn, lienzo, ponerCamara, texturaBrillo} from './camara';

export const PLANOS_ARBOL: Record<string, PlanoCam> = {
  general: {obj: [0, 4, 0], d: 26, az: 18, el: 6, fov: 44},
  suelo: {obj: [0.6, 2.2, 0.6], d: 10, az: -22, el: 4, fov: 44},
  raices: {obj: [0, -1.7, 0], d: 9, az: 14, el: 1, fov: 46},
  tronco: {obj: [0, 5, 0], d: 17, az: 40, el: 4, fov: 44},
  copa: {obj: [0, 7, 0], d: 16, az: -32, el: 20, fov: 44},
  pueblo: {obj: [-10, 4, -44], d: 32, az: 26, el: 9, fov: 44},
  amanecer: {obj: [0, 4, -60], d: 70, az: 4, el: 3, fov: 46},
};

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const lerpC = (a: THREE.Color, b: THREE.Color, t: number) => a.clone().lerp(b, t);

export const MundoArbol: React.FC<{t: number; T: number; tramos: Tramo[]}> = ({t, T, tramos}) => {
  const {camera, scene} = useThree();
  const primera = (p: string) => tramos.find((x) => x.plano === p)?.t ?? null;
  const actual = [...tramos].reverse().find((x) => t >= x.t)?.plano ?? 'general';
  const tAm = primera('amanecer');
  const sol = tAm !== null ? clamp((t - tAm + 0.5) / 4) : clamp(t / T) * 0.35;
  const tCopa = primera('copa') ?? primera('amanecer');
  const flores = tCopa !== null ? clamp((t - tCopa - 0.6) / 1.6) : 0;
  const tRz = primera('raices');
  const raices = tRz !== null ? clamp((t - tRz) / 2.2) : 0;
  const bajoTierra = actual === 'raices' ? clamp((t - (tramos.find((x) => x.plano === 'raices' && t >= x.t)?.t ?? t)) / 0.8) : 0;
  const crece = 0.55 + 0.45 * clamp((t - (primera('tronco') ?? T * 0.4)) / 3);

  const r = useMemo(() => {
    const rnd = azar(7);
    // suelo con textura de hierba seca y tierra
    const suelo = lienzo(1024, 1024, (g) => {
      g.fillStyle = '#2c2a22';
      g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 9000; i++) {
        const c = ['#34321f', '#3d3a24', '#2a2a1e', '#454028', '#3a3322'][Math.floor(rnd() * 5)];
        g.fillStyle = c;
        g.fillRect(rnd() * 1024, rnd() * 1024, 2 + rnd() * 5, 2 + rnd() * 5);
      }
    });
    suelo.wrapS = suelo.wrapT = THREE.RepeatWrapping;
    suelo.repeat.set(30, 30);
    // raíces
    const curvas: THREE.CatmullRomCurve3[] = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rnd() * 0.4;
      const pts = [new THREE.Vector3(0, 0, 0)];
      let x = 0, y = 0, z = 0;
      for (let k = 1; k <= 6; k++) {
        x += Math.cos(a) * (0.5 + rnd() * 0.6);
        z += Math.sin(a) * (0.5 + rnd() * 0.6);
        y -= 0.35 + rnd() * 0.45;
        pts.push(new THREE.Vector3(x + (rnd() - 0.5) * 0.4, y, z + (rnd() - 0.5) * 0.4));
      }
      curvas.push(new THREE.CatmullRomCurve3(pts));
    }
    const geoRaices = curvas.map((c, i) => new THREE.TubeGeometry(c, 64, i < 4 ? 0.07 : 0.04, 8, false));
    // copa
    const copa = Array.from({length: 11}).map(() => ({
      p: [(rnd() - 0.5) * 3.6, 5.6 + rnd() * 2.4, (rnd() - 0.5) * 3.6] as [number, number, number],
      s: 1.1 + rnd() * 1.0,
      c: ['#2f5e38', '#3f7a45', '#4f8a4b', '#5f9a57'][Math.floor(rnd() * 4)],
    }));
    const flores = Array.from({length: 70}).map(() => {
      const v = new THREE.Vector3(rnd() - 0.5, rnd() - 0.3, rnd() - 0.5).normalize();
      return [v.x * 2.6, 6.6 + v.y * 2.2, v.z * 2.6] as [number, number, number];
    });
    // pueblo
    const casas = Array.from({length: 26}).map(() => ({
      p: [-34 + rnd() * 40, 0, -38 - rnd() * 16] as [number, number, number],
      s: [2 + rnd() * 3, 1.6 + rnd() * 3, 2 + rnd() * 3] as [number, number, number],
      c: ['#d9c4a6', '#c9a07a', '#e6d5bb', '#b9886a'][Math.floor(rnd() * 4)],
      v: rnd(),
    }));
    // estrellas y luciérnagas
    const est = new THREE.BufferGeometry();
    const pe: number[] = [];
    for (let i = 0; i < 900; i++) {
      const a = rnd() * Math.PI * 2, e = 0.08 + rnd() * 1.2;
      pe.push(Math.cos(a) * Math.cos(e) * 300, Math.sin(e) * 300, Math.sin(a) * Math.cos(e) * 300);
    }
    est.setAttribute('position', new THREE.Float32BufferAttribute(pe, 3));
    const luz = new THREE.BufferGeometry();
    const pl: number[] = [];
    for (let i = 0; i < 120; i++) pl.push((rnd() - 0.5) * 16, 0.3 + rnd() * 6, (rnd() - 0.5) * 16);
    luz.setAttribute('position', new THREE.Float32BufferAttribute(pl, 3));
    const brillo = texturaBrillo();
    const brilloRosa = texturaBrillo('255,190,170');
    return {suelo, geoRaices, copa, flores, casas, est, luz, brillo, brilloRosa};
  }, []);

  // cielo y niebla según el amanecer
  const noche = new THREE.Color('#1f2a5c');
  const alba = new THREE.Color('#e98f6f');
  const cielo = lerpC(noche, alba, sol * 0.85);
  const tierra = lerpC(new THREE.Color('#3a2c48'), new THREE.Color('#5a3a3a'), sol);
  const fondo = bajoTierra > 0 ? lerpC(cielo, new THREE.Color('#1a100c'), bajoTierra) : cielo;

  useLayoutEffect(() => {
    scene.background = fondo;
    scene.fog = new THREE.Fog(fondo, bajoTierra > 0.5 ? 2 : 30, bajoTierra > 0.5 ? 14 : 170);
    ponerCamara(camera as THREE.PerspectiveCamera, camaraEn(PLANOS_ARBOL, tramos, t));
  });

  // las raíces se dibujan poco a poco
  r.geoRaices.forEach((g) => g.setDrawRange(0, Math.floor((g.index?.count ?? 0) * raices)));
  const latido = 0.75 + 0.25 * Math.sin(t * 3);
  const yv = -6 + sol * 26; // altura del sol

  return (
    <>
      <hemisphereLight args={[lerpC(new THREE.Color('#8a9ae0'), new THREE.Color('#ffd9b0'), sol), tierra, 1.7 + sol * 0.6]} />
      <directionalLight position={[-40, 60, 40]} intensity={1.1 * (1 - sol)} color={'#a8b8ff'} />
      <directionalLight position={[20, 8 + sol * 20, -50]} intensity={0.2 + sol * 2.4} color={'#ffcf9a'} />
      {/* farol junto al árbol: el punto cálido de la historia */}
      <pointLight position={[1.8, 1.6, 2.2]} intensity={9 * (1 - sol * 0.6)} distance={16} color={'#ffb347'} />
      <mesh position={[1.8, 1.4, 2.2]}>
        <cylinderGeometry args={[0.16, 0.2, 0.42, 8]} />
        <meshBasicMaterial color={'#ffd27a'} />
      </mesh>
      <mesh position={[1.8, 0.6, 2.2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
        <meshStandardMaterial color={'#2a2020'} />
      </mesh>
      <sprite position={[1.8, 1.4, 2.2]} scale={[2.4, 2.4, 1]}>
        <spriteMaterial map={r.brillo} transparent depthWrite={false} opacity={0.9 * (1 - sol * 0.6)} />
      </sprite>
      <pointLight position={[0, -1.6, 0]} intensity={raices * 18 * latido} distance={9} color={'#ffcf6a'} />
      {/* estrellas */}
      <points geometry={r.est}>
        <pointsMaterial size={1.4} color={'#fff6e0'} transparent opacity={1 - sol * 0.9} fog={false} sizeAttenuation={false} />
      </points>
      {/* sol */}
      <sprite position={[8, yv, -150]} scale={[70 + sol * 30, 70 + sol * 30, 1]}>
        <spriteMaterial map={r.brillo} transparent opacity={0.35 + sol * 0.65} fog={false} depthWrite={false} />
      </sprite>
      <mesh position={[8, yv, -151]}>
        <circleGeometry args={[6, 48]} />
        <meshBasicMaterial color={'#fff1c9'} fog={false} transparent opacity={clamp(sol * 1.5)} />
      </mesh>
      {/* luna (antes del amanecer) */}
      <sprite position={[-40, 60, -140]} scale={[40, 40, 1]}>
        <spriteMaterial map={r.brillo} transparent opacity={0.6 * (1 - sol)} fog={false} />
      </sprite>
      <mesh position={[-40, 60, -141]}>
        <circleGeometry args={[4, 40]} />
        <meshBasicMaterial color={'#fff1c9'} fog={false} transparent opacity={1 - sol} />
      </mesh>
      {/* suelo (se vuelve transparente bajo tierra) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial map={r.suelo} color={'#8a8070'} transparent opacity={1 - bajoTierra * 0.8} roughness={1} />
      </mesh>
      {/* colina y montañas */}
      <mesh position={[0, -18.5, 0]} scale={[1.4, 1, 1.4]}>
        <sphereGeometry args={[19, 48, 24]} />
        <meshStandardMaterial color={'#3a3426'} roughness={1} transparent opacity={1 - bajoTierra * 0.85} />
      </mesh>
      {[[-60, -120, 50], [40, -140, 70], [110, -110, 45], [-130, -100, 55]].map(([x, z, s], i) => (
        <mesh key={i} position={[x, -s * 0.55, z]}>
          <sphereGeometry args={[s, 32, 16]} />
          <meshStandardMaterial color={i % 2 ? '#2e2440' : '#3a2c4a'} roughness={1} />
        </mesh>
      ))}
      {/* raíces doradas */}
      {r.geoRaices.map((g, i) => (
        <mesh key={'r' + i} geometry={g} position={[0, 0.2, 0]}>
          <meshStandardMaterial color={'#ffcf6a'} emissive={'#ffb347'} emissiveIntensity={(0.5 + raices) * latido} roughness={0.4} />
        </mesh>
      ))}
      {/* árbol */}
      <group scale={[crece, crece, crece]}>
        <mesh position={[0, 2.4, 0]}>
          <cylinderGeometry args={[0.28, 0.5, 4.8, 12]} />
          <meshStandardMaterial color={'#5a3826'} roughness={0.9} />
        </mesh>
        {[[-0.9, 4.6, 0.2, 0.7], [0.9, 4.9, -0.2, -0.7], [0.1, 5.2, 0.8, 0.2]].map(([x, y, z, rz], i) => (
          <mesh key={'b' + i} position={[x * 0.6, y, z * 0.6]} rotation={[z * 0.5, 0, rz]}>
            <cylinderGeometry args={[0.1, 0.18, 2.2, 8]} />
            <meshStandardMaterial color={'#5a3826'} />
          </mesh>
        ))}
        {r.copa.map((c, i) => (
          <mesh key={'c' + i} position={[c.p[0] + Math.sin(t * 0.8 + i) * 0.05, c.p[1], c.p[2]]} scale={c.s}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color={c.c} flatShading roughness={0.85} />
          </mesh>
        ))}
        {r.flores.map((p, i) => (
          <mesh key={'f' + i} position={p} scale={0.16 * clamp(flores * 1.4 - (i % 7) * 0.06)}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={i % 3 ? '#f3b1a6' : '#fff1e6'} emissive={'#ff9a8a'} emissiveIntensity={0.35} flatShading />
          </mesh>
        ))}
      </group>
      {/* pueblo marroquí */}
      {r.casas.map((c, i) => (
        <group key={'h' + i} position={c.p}>
          <mesh position={[0, c.s[1] / 2, 0]}>
            <boxGeometry args={c.s} />
            <meshStandardMaterial color={c.c} roughness={1} />
          </mesh>
          <mesh position={[0, c.s[1] * 0.55, c.s[2] / 2 + 0.01]}>
            <planeGeometry args={[0.45, 0.6]} />
            <meshBasicMaterial color={c.v < 0.65 ? '#ffd27a' : '#2a2030'} />
          </mesh>
        </group>
      ))}
      <group position={[-6, 0, -46]}>
        <mesh position={[0, 7, 0]}>
          <boxGeometry args={[2.6, 14, 2.6]} />
          <meshStandardMaterial color={'#c9a07a'} roughness={1} />
        </mesh>
        <mesh position={[0, 15, 0]}>
          <boxGeometry args={[1.2, 2, 1.2]} />
          <meshStandardMaterial color={'#c9a07a'} />
        </mesh>
        <mesh position={[0, 16.4, 0]}>
          <sphereGeometry args={[0.35, 12, 8]} />
          <meshBasicMaterial color={'#ffd27a'} />
        </mesh>
      </group>
      {/* luciérnagas / polvo dorado */}
      <points geometry={r.luz} position={[0, Math.sin(t * 0.5) * 0.2, 0]}>
        <pointsMaterial map={r.brillo} size={0.35} transparent depthWrite={false} opacity={0.8} color={'#ffe3a0'} />
      </points>
    </>
  );
};
