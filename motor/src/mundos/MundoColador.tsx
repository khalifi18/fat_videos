// Mundo 3D «colador»: una mano con manga verde salvia sostiene un colador de metal lleno de figuritas de personas (sin cara).
// Las figuras apagadas se caen por los agujeros a una papelera plateada; las de colores cálidos se quedan. Fondo beige cálido.
// Planos: general, cerca, final.
import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {PlanoCam, Tramo, azar, camaraEn, lienzo, ponerCamara, texturaBrillo} from './camara';

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const sm = (x: number) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const mixN = (a: number, b: number, t: number) => a + (b - a) * t;

const SX = 0, SY = 6.2; // centro del colador
const RC = 2.3; // radio del colador
const BIN_Y = 3.1; // altura de la boca de la papelera
const NB = 11; // figuras que caen
const NG = 12; // figuras que se quedan

const PLANOS: Record<string, PlanoCam> = {
  general: {obj: [0.7, 5.5, 0], d: 14.8, az: 4, el: 4, fov: 46},
  cerca: {obj: [0.2, 6.2, 0], d: 9.6, az: -8, el: 8, fov: 44},
  final: {obj: [0.1, 6.6, 0], d: 8.4, az: 6, el: 16, fov: 42},
};

const BUENOS = ['#e9a14a', '#d96a5a', '#3f9c98', '#f2c94c', '#c9578a', '#5a82c8', '#e48a3a'];
const MALOS = ['#8a8794', '#77747f', '#9b98a4', '#6f6c78'];

export const MundoColador: React.FC<{t: number; T: number; tramos: Tramo[]}> = ({t, T, tramos}) => {
  const {camera, scene, gl} = useThree();
  const cam = camaraEn(PLANOS, tramos, t, 1.4);
  const ta = t * 0.62; // caída lenta, repartida por todo el vídeo // la animación va más rápida: la frase se dice una sola vez
  const activo = clamp((ta - 0.4) / 0.4) * (1 - clamp((ta - 6.2) / 1.2));
  const sacude = 0.4 + 0.6 * activo; // el colador no para de moverse; se agita más cuando caen figuras // el colador se agita mientras se filtra

  const r = useMemo(() => {
    const rnd = azar(91);
    const malla = lienzo(512, 512, (g) => {
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, 512, 512);
      g.fillStyle = '#000000';
      for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
        g.beginPath();
        g.arc((x + (y % 2) * 0.5) * 21.5 + 8, y * 21.5 + 8, 6.2, 0, Math.PI * 2);
        g.fill();
      }
    });
    malla.wrapS = malla.wrapT = THREE.RepeatWrapping;
    malla.repeat.set(2, 1);
    const personas = Array.from({length: NB + NG}).map((_, i) => {
      const malo = i < NB;
      const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * (RC - 0.7);
      return {
        malo,
        col: malo ? MALOS[i % MALOS.length] : BUENOS[i % BUENOS.length],
        // posición de reposo dentro del colador (pila en el fondo)
        x0: Math.cos(a) * rr, z0: Math.sin(a) * rr * 0.8, y0: SY - 1.0 + (rr / RC) * 0.9 + rnd() * 0.25,
        tCae: 1.1 + (i < NB ? i * 0.46 : 0) + rnd() * 0.18, // momento en que cae (solo los malos)
        xB: (rnd() - 0.5) * 1.5, zB: (rnd() - 0.5) * 1.1, // dónde acaba dentro de la papelera
        giro: (rnd() - 0.5) * 9, fase: rnd() * 6,
        esc: 0.85 + rnd() * 0.3,
        piel: ['#f1c9a5', '#e0a97f', '#c98f66', '#8a5a3c', '#f6d7bb'][Math.floor(rnd() * 5)],
        pelo: ['#3a2a22', '#5a3a28', '#1c1420', '#8a5a2c', '#2a1a14'][Math.floor(rnd() * 5)],
      };
    });
    return {malla, personas, brillo: texturaBrillo('255,226,170')};
  }, []);

  const skyU = useMemo(() => ({uTop: {value: new THREE.Color('#f6dcc8')}, uHor: {value: new THREE.Color('#fbeee0')}}), []);
  useLayoutEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    ponerCamara(camera as THREE.PerspectiveCamera, cam);
    scene.background = new THREE.Color('#f6e6d6');
    scene.fog = new THREE.Fog('#f6e6d6', 24, 70);
  });

  const shakeX = Math.sin(t * 11) * 0.075 * sacude + Math.sin(t * 1.3) * 0.16;
  const shakeR = Math.sin(t * 9 + 1) * 0.028 * sacude + Math.sin(t * 1.0) * 0.035;

  return (
    <>
      <hemisphereLight args={['#fff1e0', '#c9a98a', 1.35]} />
      <directionalLight position={[-7, 15, 11]} intensity={1.9} color={'#fff0dc'} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={12} shadow-camera-bottom={-3} shadow-camera-near={1} shadow-camera-far={45} shadow-bias={-0.0004} shadow-radius={5} />
      <directionalLight position={[10, 6, -4]} intensity={0.5} color={'#ffd6b0'} />

      {/* fondo y mesa */}
      <mesh position={[0, 4, -9]}>
        <planeGeometry args={[80, 50]} />
        <meshBasicMaterial color={'#f6d9c4'} />
      </mesh>
      <mesh position={[0, 6, -8.9]}>
        <planeGeometry args={[40, 30]} />
        <meshBasicMaterial map={r.brillo} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color={'#ead2bc'} roughness={0.9} />
      </mesh>

      {/* PAPELERA */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, BIN_Y / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.85, 1.6, BIN_Y, 40, 1, true]} />
          <meshStandardMaterial color={'#c9ccd4'} metalness={0.3} roughness={0.38} side={THREE.DoubleSide} />
        </mesh>
        {[0.55, 1.35, 2.15].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[1.85 - (1 - y / BIN_Y) * 0.25 + 0.01, 0.05, 8, 40]} />
            <meshStandardMaterial color={'#9ea2ab'} metalness={0.3} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, BIN_Y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.86, 0.1, 12, 48]} />
          <meshStandardMaterial color={'#d4d7de'} metalness={0.3} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.6, 40]} />
          <meshStandardMaterial color={'#35343c'} />
        </mesh>
        {/* tapa apoyada a un lado */}
        <group position={[-2.55, 1.15, 0.9]} rotation={[0.1, 0.3, -1.25]}>
          <mesh>
            <cylinderGeometry args={[1.8, 1.8, 0.1, 40]} />
            <meshStandardMaterial color={'#c3c6ce'} metalness={0.3} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <torusGeometry args={[0.38, 0.07, 8, 20]} />
            <meshStandardMaterial color={'#9ea2ab'} metalness={0.3} roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* COLADOR */}
      <group position={[SX + shakeX, SY, 0]} rotation={[0, 0, shakeR]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[RC, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color={'#d4d7de'} metalness={0.3} roughness={0.35} alphaMap={r.malla} alphaTest={0.5} transparent={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[RC, 0.09, 14, 60]} />
          <meshStandardMaterial color={'#e3e5ea'} metalness={0.3} roughness={0.28} />
        </mesh>
        {/* mango y mano */}
        <mesh position={[RC + 1.7, -0.05, 0]} rotation={[0, 0, Math.PI / 2 + 0.03]}>
          <cylinderGeometry args={[0.1, 0.12, 3.4, 12]} />
          <meshStandardMaterial color={'#d4d7de'} metalness={0.3} roughness={0.35} />
        </mesh>
        <mesh position={[RC + 3.45, -0.1, 0]}>
          <sphereGeometry args={[0.16, 14, 10]} />
          <meshStandardMaterial color={'#d4d7de'} metalness={0.3} roughness={0.3} />
        </mesh>
        <group position={[RC + 3.1, 0.0, 0]}>
          <mesh>
            <boxGeometry args={[0.95, 0.62, 1.0]} />
            <meshStandardMaterial color={'#e9b79a'} roughness={0.75} />
          </mesh>
          {[-0.36, -0.12, 0.12, 0.36].map((z, i) => (
            <mesh key={i} position={[-0.05, -0.38, z * 1.1]} rotation={[0, 0, 0.25]}>
              <capsuleGeometry args={[0.13, 0.5, 4, 10]} />
              <meshStandardMaterial color={'#e5ae90'} roughness={0.75} />
            </mesh>
          ))}
          <mesh position={[-0.35, 0.28, 0.5]} rotation={[0.2, 0, -0.9]}>
            <capsuleGeometry args={[0.14, 0.5, 4, 10]} />
            <meshStandardMaterial color={'#e9b79a'} roughness={0.75} />
          </mesh>
          {/* muñeca y manga verde salvia */}
          <mesh position={[0.95, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.36, 0.4, 0.9, 20]} />
            <meshStandardMaterial color={'#e5ae90'} roughness={0.75} />
          </mesh>
          <mesh position={[2.55, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[1.05, 0.72, 2.6, 28]} />
            <meshStandardMaterial color={'#9db39a'} roughness={0.95} />
          </mesh>
          <mesh position={[1.45, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.76, 0.12, 12, 30]} />
            <meshStandardMaterial color={'#8aa388'} roughness={0.95} />
          </mesh>
        </group>
      </group>

      {/* FIGURITAS (sin cara) */}
      {r.personas.map((p, i) => {
        let x = SX + p.x0, y = p.y0, z = p.z0, rot = 0, rz = 0;
        if (p.malo) {
          const tf = ta - p.tCae;
          if (tf < 0) {
            // se agitan en el colador
            x += Math.sin(t * 9 + p.fase) * 0.12 * sacude;
            y += Math.abs(Math.sin(t * 7 + p.fase)) * 0.1 * sacude;
          } else {
            // caen por los agujeros hasta la papelera y se amontonan
            const g = 9.0;
            const yFin = 0.35 + (i % 4) * 0.28;
            const yCaida = p.y0 - 0.6 - 0.5 * g * tf * tf;
            const llega = Math.max(yFin, yCaida);
            const u = clamp(tf / 0.5);
            x = mixN(SX + p.x0, p.xB, sm(u));
            z = mixN(p.z0, p.zB, sm(u));
            y = llega;
            rot = tf * p.giro * (yCaida > yFin ? 1 : 0.2);
            rz = tf * p.giro * 0.7 * (yCaida > yFin ? 1 : 0.2);
          }
        } else {
          // las buenas se quedan, respiran y se juntan al centro cuando los otros se van
          const juntan = sm((ta - 2.0) / 4.5);
          x = mixN(x, SX + p.x0 * 0.55, juntan) + Math.sin(t * 1.4 + p.fase) * 0.03 + Math.sin(t * 9 + p.fase) * 0.06 * sacude;
          y = y + Math.sin(t * 2.2 + p.fase) * 0.025 + Math.abs(Math.sin(t * 7 + p.fase)) * 0.07 * sacude;
        }
        const esc = p.esc * 0.8;
        const cae = p.malo && ta - p.tCae > 0 && y > 0.9;
        const piel = p.malo ? '#b7bbcc' : p.piel;
        const ropa = p.col;
        const guino = !p.malo && Math.sin(ta * 1.3 + p.fase) > 0.985;
        return (
          <group key={i} position={[x, y, z]} rotation={[rz, 0, rot]} scale={esc}>
            {/* cuerpo y brazos */}
            <mesh position={[0, 0.42, 0]} castShadow>
              <capsuleGeometry args={[0.34, 0.4, 8, 16]} />
              <meshPhysicalMaterial color={ropa} roughness={0.55} clearcoat={0.3} clearcoatRoughness={0.5} emissive={p.malo ? '#000000' : ropa} emissiveIntensity={p.malo ? 0 : 0.1} />
            </mesh>
            <mesh position={[-0.4, 0.5, 0]} rotation={[0, 0, cae ? 2.4 : 0.55]} castShadow>
              <capsuleGeometry args={[0.1, 0.34, 6, 10]} />
              <meshPhysicalMaterial color={ropa} roughness={0.55} />
            </mesh>
            <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, cae ? -2.4 : -0.55]} castShadow>
              <capsuleGeometry args={[0.1, 0.34, 6, 10]} />
              <meshPhysicalMaterial color={ropa} roughness={0.55} />
            </mesh>
            {/* cabeza grande, pelo y cara */}
            <mesh position={[0, 1.18, 0]} castShadow>
              <sphereGeometry args={[0.46, 28, 22]} />
              <meshPhysicalMaterial color={piel} roughness={0.6} clearcoat={0.15} />
            </mesh>
            <mesh position={[0, 1.34, -0.04]} rotation={[0.25, 0, 0]} scale={[1, 0.8, 1]} castShadow>
              <sphereGeometry args={[0.48, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              <meshPhysicalMaterial color={p.pelo} roughness={0.7} />
            </mesh>
            {[-0.18, 0.18].map((ex, k) => (
              <group key={k} position={[ex, 1.2, 0.41]}>
                <mesh scale={[1, guino && k === 0 ? 0.15 : cae ? 1.3 : 1, 0.6]}>
                  <sphereGeometry args={[0.115, 14, 12]} />
                  <meshBasicMaterial color={'#ffffff'} />
                </mesh>
                <mesh position={[0, p.malo && !cae ? -0.025 : 0, 0.07]} scale={[1, guino && k === 0 ? 0.15 : 1, 1]}>
                  <sphereGeometry args={[0.062, 12, 10]} />
                  <meshBasicMaterial color={'#1c1420'} />
                </mesh>
                <mesh position={[0.022, 0.025, 0.12]}>
                  <sphereGeometry args={[0.02, 8, 6]} />
                  <meshBasicMaterial color={'#ffffff'} />
                </mesh>
                {/* ceja (triste o contenta) */}
                <mesh position={[0, 0.17, 0.02]} rotation={[0, 0, (k === 0 ? 1 : -1) * (p.malo ? (cae ? -0.1 : 0.4) : -0.15)]}>
                  <capsuleGeometry args={[0.02, 0.1, 4, 6]} />
                  <meshBasicMaterial color={p.pelo} />
                </mesh>
              </group>
            ))}
            {/* boca */}
            {cae ? (
              <mesh position={[0, 1.02, 0.43]} scale={[1, 1.25, 0.5]}>
                <sphereGeometry args={[0.06, 10, 8]} />
                <meshBasicMaterial color={'#3a1a22'} />
              </mesh>
            ) : (
              <mesh position={[0, p.malo ? 1.0 : 1.05, 0.44]} rotation={[0, 0, p.malo ? 0 : Math.PI]}>
                <torusGeometry args={[0.085, 0.017, 6, 14, Math.PI]} />
                <meshBasicMaterial color={'#5a2a2a'} />
              </mesh>
            )}
            {/* mejillas */}
            {!p.malo &&
              [-0.27, 0.27].map((cx, k) => (
                <mesh key={k} position={[cx, 1.08, 0.36]} scale={[1, 0.65, 0.4]}>
                  <sphereGeometry args={[0.09, 10, 8]} />
                  <meshBasicMaterial color={'#ff9a8a'} transparent opacity={0.5} />
                </mesh>
              ))}
          </group>
        );
      })}
    </>
  );
};
