// Mundo 3D «tiempo»: una torre del reloj marroquí de noche, un campo con las 3.640 semanas de una vida (una linterna por
// semana, una fila por año), el reloj de arena con monedas y, al fondo, una tumba con una luz (las obras).
// Planos: reloj, colina, semanas, treinta, arena, tumba, amanecer, general.
import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {PlanoCam, Tramo, azar, camaraEn, lienzo, ponerCamara, texturaBrillo} from './camara';

export const PLANOS_TIEMPO: Record<string, PlanoCam> = {
  reloj: {obj: [0, 11, -14], d: 24, az: 10, el: 3, fov: 44},
  colina: {obj: [0, 5, 0], d: 58, az: 16, el: 12, fov: 44},
  semanas: {obj: [0, 0, 17], d: 64, az: 0, el: 52, fov: 44},
  treinta: {obj: [0, 0, 8], d: 36, az: 0, el: 62, fov: 44},
  arena: {obj: [27, 2.6, 7], d: 15, az: -24, el: 7, fov: 44},
  tumba: {obj: [-31, 2.6, -31], d: 21, az: 22, el: 9, fov: 44},
  amanecer: {obj: [0, 12, -14], d: 34, az: -8, el: 3, fov: 46},
  general: {obj: [0, 8, -4], d: 95, az: 12, el: 16, fov: 46},
};

const COLS = 52, FILAS = 70, N = COLS * FILAS; // 52 semanas × 70 años = 3.640
const PASO = 0.62;
const Z0 = -4;
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const lerpC = (a: THREE.Color, b: THREE.Color, t: number) => a.clone().lerp(b, t);
const suave = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

const etiqueta = (texto: string, sub: string) =>
  lienzo(1024, 384, (g) => {
    g.textAlign = 'center';
    g.shadowColor = 'rgba(0,0,0,0.7)';
    g.shadowBlur = 18;
    g.fillStyle = '#ffe3a0';
    g.font = '800 190px sans-serif';
    g.fillText(texto, 512, 190);
    g.shadowBlur = 8;
    g.fillStyle = '#fbf3e6';
    g.font = '700 84px sans-serif';
    g.fillText(sub, 512, 310);
  });

export const MundoTiempo: React.FC<{t: number; T: number; tramos: Tramo[]}> = ({t, T, tramos}) => {
  const {camera, scene} = useThree();
  const primera = (p: string) => tramos.find((x) => x.plano === p)?.t ?? null;
  const tSem = primera('semanas');
  const tTre = primera('treinta');
  const tAre = primera('arena');
  const tTum = primera('tumba');
  const tAm = primera('amanecer');
  const sol = tAm !== null ? clamp((t - tAm + 0.3) / 4) : 0;
  const reveladas = tSem !== null ? suave((t - tSem) / 3.2) : 0;
  const vividas = tTre !== null ? clamp((t - tTre - 0.4) / 3.6) : 0;
  const arena = tAre !== null ? clamp((t - tAre) / 9) * 0.78 : 0;
  const luzTumba = tTum !== null ? suave((t - tTum) / 1.6) : 0;

  const ref = useRef<THREE.InstancedMesh>(null);
  const r = useMemo(() => {
    const rnd = azar(11);
    const suelo = lienzo(1024, 1024, (g) => {
      g.fillStyle = '#1b1c3b';
      g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 9000; i++) {
        g.fillStyle = ['#202244', '#171934', '#25274c', '#1e1f3f'][Math.floor(rnd() * 4)];
        g.fillRect(rnd() * 1024, rnd() * 1024, 2 + rnd() * 5, 2 + rnd() * 5);
      }
    });
    suelo.wrapS = suelo.wrapT = THREE.RepeatWrapping;
    suelo.repeat.set(30, 30);
    const est = new THREE.BufferGeometry();
    const pe: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const a = rnd() * Math.PI * 2, e = 0.08 + rnd() * 1.2;
      pe.push(Math.cos(a) * Math.cos(e) * 300, Math.sin(e) * 300, Math.sin(a) * Math.cos(e) * 300);
    }
    est.setAttribute('position', new THREE.Float32BufferAttribute(pe, 3));
    const luz = new THREE.BufferGeometry();
    const pl: number[] = [];
    for (let i = 0; i < 160; i++) pl.push((rnd() - 0.5) * 60, 0.3 + rnd() * 7, -6 + rnd() * 50);
    luz.setAttribute('position', new THREE.Float32BufferAttribute(pl, 3));
    const casas = Array.from({length: 30}).map(() => ({
      p: [-46 + rnd() * 92, 0, -30 - rnd() * 22] as [number, number, number],
      s: [2.2 + rnd() * 3, 1.8 + rnd() * 3.4, 2.2 + rnd() * 3] as [number, number, number],
      c: ['#d9c4a6', '#c9a07a', '#e6d5bb', '#b9886a'][Math.floor(rnd() * 4)],
      v: rnd(),
    }));
    const cipreses = Array.from({length: 9}).map(() => ({
      p: [-31 + (rnd() < 0.5 ? -1 : 1) * (5 + rnd() * 5), 0, -31 - 4 - rnd() * 6] as [number, number, number],
      s: 1 + rnd() * 0.8,
    }));
    const monedas = Array.from({length: 16}).map((_, i) => ({
      p: [22 + (rnd() - 0.5) * 5.5, 0.07 + Math.floor(i / 6) * 0.1, 12 + (rnd() - 0.5) * 4] as [number, number, number],
      r: [(rnd() - 0.5) * 0.5, 0, (rnd() - 0.5) * 0.5] as [number, number, number],
    }));
    // matrices de las 3.640 linternas (una vez)
    const m = new THREE.Matrix4();
    const mats: THREE.Matrix4[] = [];
    for (let i = 0; i < N; i++) {
      const c = i % COLS, f = Math.floor(i / COLS);
      m.makeTranslation((c - (COLS - 1) / 2) * PASO, 0.07, Z0 + f * PASO);
      mats.push(m.clone());
    }
    return {suelo, est, luz, casas, cipreses, monedas, mats, brillo: texturaBrillo(), brilloAzul: texturaBrillo('150,190,255'), t3640: etiqueta('3.640', 'semanas en 70 años'), t1560: etiqueta('1.560', 'ya vividas')};
  }, []);

  const noche = new THREE.Color('#1d2860');
  const alba = new THREE.Color('#e98f6f');
  const cielo = lerpC(noche, alba, sol * 0.85);
  const tierra = lerpC(new THREE.Color('#3a2c48'), new THREE.Color('#5a3a3a'), sol);

  useLayoutEffect(() => {
    scene.background = cielo;
    scene.fog = new THREE.Fog(cielo, 40, 190);
    ponerCamara(camera as THREE.PerspectiveCamera, camaraEn(PLANOS_TIEMPO, tramos, t));
    const im = ref.current;
    if (im) {
      const dorado = new THREE.Color('#ffcf6a'), oscuro = new THREE.Color('#171b3d'), pasado = new THREE.Color('#3a4572'), ahora = new THREE.Color('#8fd0ff');
      const lit = Math.floor(N * reveladas);
      const filasVividas = FILAS * 0 + 30 * vividas;
      const col = new THREE.Color();
      for (let i = 0; i < N; i++) {
        im.setMatrixAt(i, r.mats[i]);
        const f = Math.floor(i / COLS);
        if (i >= lit) col.copy(oscuro);
        else if (f < Math.floor(filasVividas)) col.copy(pasado);
        else if (f < filasVividas + 0.999 && vividas > 0 && vividas < 1) col.copy(ahora);
        else col.copy(dorado).multiplyScalar(0.8 + 0.2 * Math.sin(t * 2 + i * 0.37));
        im.setColorAt(i, col);
      }
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    }
  });

  const hMin = -t * 2.4, hHora = -t * 2.4 / 12;
  const sTop = 0.15 + 2.1 * (1 - arena), sBot = 2.1 * arena;
  const radio = (y: number) => 0.25 + (1.5 * Math.abs(y)) / 2.5;
  const vidrio = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const y = -2.5 + (5 * i) / 20;
      pts.push(new THREE.Vector2(0.25 + (1.5 * Math.abs(y)) / 2.5, y));
    }
    return new THREE.LatheGeometry(pts, 24);
  }, []);
  const yv = -6 + sol * 26;

  return (
    <>
      <hemisphereLight args={[lerpC(new THREE.Color('#8a9ae0'), new THREE.Color('#ffd9b0'), sol), tierra, 1.6 + sol * 0.6]} />
      <directionalLight position={[-40, 60, 40]} intensity={1.0 * (1 - sol)} color={'#a8b8ff'} />
      <directionalLight position={[20, 8 + sol * 20, -50]} intensity={0.2 + sol * 2.4} color={'#ffcf9a'} />
      {/* estrellas, sol y luna */}
      <points geometry={r.est}>
        <pointsMaterial size={1.4} color={'#fff6e0'} transparent opacity={1 - sol * 0.9} fog={false} sizeAttenuation={false} />
      </points>
      <sprite position={[8, yv, -150]} scale={[70 + sol * 30, 70 + sol * 30, 1]}>
        <spriteMaterial map={r.brillo} transparent opacity={0.3 + sol * 0.7} fog={false} depthWrite={false} />
      </sprite>
      <mesh position={[8, yv, -151]}>
        <circleGeometry args={[6, 48]} />
        <meshBasicMaterial color={'#fff1c9'} fog={false} transparent opacity={clamp(sol * 1.5)} />
      </mesh>
      <sprite position={[-40, 60, -140]} scale={[40, 40, 1]}>
        <spriteMaterial map={r.brillo} transparent opacity={0.6 * (1 - sol)} fog={false} />
      </sprite>
      <mesh position={[-40, 60, -141]}>
        <circleGeometry args={[4, 40]} />
        <meshBasicMaterial color={'#fff1c9'} fog={false} transparent opacity={1 - sol} />
      </mesh>

      {/* suelo y montañas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial map={r.suelo} color={'#9a90a8'} roughness={1} />
      </mesh>
      {[[-90, -130, 55], [50, -150, 75], [130, -110, 50], [-150, -90, 60]].map(([x, z, s], i) => (
        <mesh key={i} position={[x, -s * 0.55, z]}>
          <sphereGeometry args={[s, 32, 16]} />
          <meshStandardMaterial color={i % 2 ? '#2e2440' : '#3a2c4a'} roughness={1} />
        </mesh>
      ))}

      {/* pueblo al fondo */}
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

      {/* TORRE DEL RELOJ */}
      <group position={[0, 0, -14]}>
        <mesh position={[0, 7, 0]}>
          <boxGeometry args={[6.4, 14, 6.4]} />
          <meshStandardMaterial color={'#cfae86'} roughness={1} />
        </mesh>
        <mesh position={[0, 14.4, 0]}>
          <boxGeometry args={[7.4, 0.8, 7.4]} />
          <meshStandardMaterial color={'#b88e66'} />
        </mesh>
        <mesh position={[0, 18.2, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[5.4, 6.8, 4]} />
          <meshStandardMaterial color={'#2f7a58'} roughness={0.7} flatShading />
        </mesh>
        <mesh position={[0, 22, 0]}>
          <sphereGeometry args={[0.5, 12, 8]} />
          <meshBasicMaterial color={'#ffd27a'} />
        </mesh>
        {/* esfera del reloj */}
        <group position={[0, 11, 3.25]}>
          <mesh position={[0, 0, -0.02]}>
            <circleGeometry args={[2.9, 48]} />
            <meshBasicMaterial color={'#c9983a'} />
          </mesh>
          <mesh>
            <circleGeometry args={[2.6, 48]} />
            <meshBasicMaterial color={'#fff4dc'} />
          </mesh>
          {Array.from({length: 12}).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.sin(a) * 2.15, Math.cos(a) * 2.15, 0.02]} rotation={[0, 0, -a]}>
                <boxGeometry args={[i % 3 === 0 ? 0.18 : 0.1, i % 3 === 0 ? 0.55 : 0.32, 0.02]} />
                <meshBasicMaterial color={'#1a1530'} />
              </mesh>
            );
          })}
          <group rotation={[0, 0, hMin]}>
            <mesh position={[0, 1.0, 0.04]}>
              <boxGeometry args={[0.1, 2.0, 0.03]} />
              <meshBasicMaterial color={'#1a1530'} />
            </mesh>
          </group>
          <group rotation={[0, 0, hHora]}>
            <mesh position={[0, 0.65, 0.06]}>
              <boxGeometry args={[0.18, 1.3, 0.03]} />
              <meshBasicMaterial color={'#1a1530'} />
            </mesh>
          </group>
          <mesh position={[0, 0, 0.09]}>
            <circleGeometry args={[0.18, 16]} />
            <meshBasicMaterial color={'#c9983a'} />
          </mesh>
        </group>
        <pointLight position={[0, 11, 6]} intensity={14} distance={22} color={'#ffe3b0'} />
        {/* ventanas con luz */}
        {[3, 6.5].map((y) => [-1.6, 1.6].map((x) => (
          <mesh key={`${y}${x}`} position={[x, y, 3.23]}>
            <planeGeometry args={[0.9, 1.5]} />
            <meshBasicMaterial color={'#ffd27a'} />
          </mesh>
        )))}
        <mesh position={[0, 1.2, 3.23]}>
          <planeGeometry args={[1.5, 2.4]} />
          <meshBasicMaterial color={'#2a1a30'} />
        </mesh>
      </group>

      {/* CAMPO DE SEMANAS */}
      <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}>
        <boxGeometry args={[PASO * 0.74, 0.14, PASO * 0.74]} />
        <meshBasicMaterial color={'#ffffff'} />
      </instancedMesh>
      <sprite position={[0, 4.5, 2]} scale={[22, 8.25, 1]} renderOrder={5}>
        <spriteMaterial map={r.t3640} transparent depthTest={false} opacity={suave((t - (tSem ?? 1e9) - 1.2) / 1) * (tTre !== null && t > tTre ? 0 : 1)} />
      </sprite>
      <sprite position={[0, 4.5, 2]} scale={[19, 7.1, 1]} renderOrder={5}>
        <spriteMaterial map={r.t1560} transparent depthTest={false} opacity={tTre !== null ? suave((t - tTre - 1.2) / 1) * (tAre !== null && t > tAre ? 0 : 1) : 0} />
      </sprite>
      <pointLight position={[0, 3, 12]} intensity={10 * reveladas} distance={40} color={'#ffcf6a'} />

      {/* RELOJ DE ARENA + MONEDAS */}
      <group position={[27, 2.7, 6]}>
        <pointLight position={[0, 0, 3]} intensity={8} distance={14} color={'#ffd89a'} />
        <mesh geometry={vidrio}>
          <meshStandardMaterial color={'#cfe6ff'} transparent opacity={0.22} side={THREE.DoubleSide} roughness={0.1} />
        </mesh>
        {[-2.62, 2.62].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[2.0, 2.0, 0.24, 24]} />
            <meshStandardMaterial color={'#8a5a2a'} roughness={0.6} />
          </mesh>
        ))}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos((i / 3) * Math.PI * 2) * 1.9, 0, Math.sin((i / 3) * Math.PI * 2) * 1.9]}>
            <cylinderGeometry args={[0.08, 0.08, 5.2, 8]} />
            <meshStandardMaterial color={'#8a5a2a'} />
          </mesh>
        ))}
        {/* arena de arriba (baja) */}
        <mesh position={[0, 0.15 + (sTop - 0.15) / 2, 0]}>
          <cylinderGeometry args={[radio(sTop) * 0.92, radio(0.15) * 0.92, Math.max(0.01, sTop - 0.15), 20]} />
          <meshStandardMaterial color={'#ffcf6a'} emissive={'#ffb347'} emissiveIntensity={0.6} flatShading />
        </mesh>
        {/* arena de abajo (sube) */}
        <mesh position={[0, -2.5 + sBot / 2, 0]}>
          <cylinderGeometry args={[0.12, 1.55, Math.max(0.01, sBot), 20]} />
          <meshStandardMaterial color={'#ffcf6a'} emissive={'#ffb347'} emissiveIntensity={0.6} flatShading />
        </mesh>
        {arena > 0 && arena < 0.78 && (
          <mesh position={[0, (-2.5 + sBot) / 2, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.15 - (-2.5 + sBot) + 0, 6]} />
            <meshBasicMaterial color={'#ffe3a0'} />
          </mesh>
        )}
      </group>
      {r.monedas.map((c, i) => (
        <mesh key={'m' + i} position={c.p} rotation={c.r}>
          <cylinderGeometry args={[0.7, 0.7, 0.1, 20]} />
          <meshStandardMaterial color={'#ffcf6a'} emissive={'#c98a1a'} emissiveIntensity={0.5} roughness={0.35} />
        </mesh>
      ))}
      <pointLight position={[22, 1.6, 12]} intensity={6} distance={9} color={'#ffcf6a'} />

      {/* TUMBA con la luz de las obras */}
      <group position={[-31, 0, -31]}>
        <mesh position={[0, -0.6, 0]} scale={[1.8, 0.7, 1.2]}>
          <sphereGeometry args={[3.2, 24, 12]} />
          <meshStandardMaterial color={'#2a2440'} roughness={1} />
        </mesh>
        <mesh position={[0, 1.3, 1.8]}>
          <boxGeometry args={[1.7, 2.2, 0.45]} />
          <meshStandardMaterial color={'#8d8aa8'} roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 2.4, 1.8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 0.45, 20]} />
          <meshStandardMaterial color={'#8d8aa8'} roughness={0.9} />
        </mesh>
        {/* libro de luz */}
        <group position={[0, 4.6 + Math.sin(t * 1.6) * 0.18 + luzTumba * 1.2, 1.5]} scale={0.2 + 0.8 * luzTumba}>
          <mesh position={[-0.55, 0, 0]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[1.0, 1.35, 0.08]} />
            <meshBasicMaterial color={'#fff4dc'} />
          </mesh>
          <mesh position={[0.55, 0, 0]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[1.0, 1.35, 0.08]} />
            <meshBasicMaterial color={'#fff4dc'} />
          </mesh>
        </group>
        <sprite position={[0, 5, 1.6]} scale={[11 * luzTumba, 11 * luzTumba, 1]}>
          <spriteMaterial map={r.brillo} transparent opacity={0.9 * luzTumba} depthWrite={false} />
        </sprite>
        <pointLight position={[0, 5, 3]} intensity={16 * luzTumba} distance={26} color={'#ffd27a'} />
        {r.cipreses.map((c, i) => (
          <mesh key={i} position={[c.p[0] + 31, 2.6 * c.s, c.p[2] + 31]} scale={c.s}>
            <coneGeometry args={[0.9, 5.2, 7]} />
            <meshStandardMaterial color={'#1c3b34'} flatShading roughness={1} />
          </mesh>
        ))}
      </group>

      {/* polvo dorado / luciérnagas */}
      <points geometry={r.luz} position={[0, Math.sin(t * 0.5) * 0.2, 0]}>
        <pointsMaterial map={r.brillo} size={0.4} transparent depthWrite={false} opacity={0.8} color={'#ffe3a0'} />
      </points>
    </>
  );
};
