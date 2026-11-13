// Mundo 3D «burbuja»: una persona sentada en un callejón de piedra al atardecer, protegida por una esfera de luz.
// Figuras encapuchadas hechas de sombra la rodean y lanzan flechas de sombra que rebotan contra la luz sin tocarla.
// Al final amanece, las sombras se disuelven y la luz llena el callejón. Planos: general, anillo, golpe, cerca, amanecer, final.
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
const C = (h: string) => new THREE.Color(h);
const mezcla = (a: string, b: string, t: number) => C(a).lerp(C(b), clamp(t));

const R = 2.7; // radio de la esfera de luz
const CY = 1.55; // altura del centro
const N = 18; // figuras de sombra

const PLANOS: Record<string, PlanoCam> = {
  general: {obj: [0, 1.7, 0], d: 21, az: 14, el: 8, fov: 48},
  anillo: {obj: [0, 1.4, 0], d: 15, az: -34, el: 40, fov: 50},
  golpe: {obj: [1.6, 1.9, 1.4], d: 7.2, az: 42, el: 6, fov: 46},
  cerca: {obj: [0, 1.45, 0], d: 8.2, az: -12, el: 3, fov: 44},
  amanecer: {obj: [0, 2.4, 0], d: 25, az: 26, el: 13, fov: 54},
  final: {obj: [0, 3.2, 0], d: 36, az: 8, el: 24, fov: 54},
};

export const MundoBurbuja: React.FC<{t: number; T: number; tramos: Tramo[]}> = ({t, T, tramos}) => {
  const {camera, scene} = useThree();
  const primera = (p: string) => tramos.find((x) => x.plano === p)?.t ?? null;
  const tAm = primera('amanecer');
  const tFin = primera('final');
  const alba = tAm !== null ? sm((t - tAm + 0.2) / 3.2) : 0; // el amanecer sube
  const disolver = tAm !== null ? sm((t - tAm) / 2.6) : 0; // las sombras se disuelven
  const acerca = clamp(t / Math.max(1, tAm ?? T)); // el cerco se cierra poco a poco
  const luzE = 0.55 + 0.45 * Math.min(1, t / 6) + alba * 0.6;

  const cam = camaraEn(PLANOS, tramos, t, 1.4);
  const camP = (() => {
    const az = (cam.az * Math.PI) / 180, el = (cam.el * Math.PI) / 180;
    return [cam.obj[0] + cam.d * Math.cos(el) * Math.sin(az), cam.obj[1] + cam.d * Math.sin(el), cam.obj[2] + cam.d * Math.cos(el) * Math.cos(az)];
  })();

  const r = useMemo(() => {
    const rnd = azar(57);
    // adoquines
    const suelo = lienzo(1024, 1024, (g) => {
      g.fillStyle = '#2a2420';
      g.fillRect(0, 0, 1024, 1024);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const ox = (y % 2) * 32;
          const c = ['#4a4038', '#52463c', '#3e352e', '#5a4c40', '#463c34'][Math.floor(rnd() * 5)];
          g.fillStyle = c;
          g.beginPath();
          g.roundRect(x * 64 + ox + 3, y * 64 + 3, 58, 58, 12);
          g.fill();
          g.fillStyle = 'rgba(255,240,210,0.05)';
          g.beginPath();
          g.roundRect(x * 64 + ox + 8, y * 64 + 6, 40, 12, 6);
          g.fill();
        }
      }
    });
    suelo.wrapS = suelo.wrapT = THREE.RepeatWrapping;
    suelo.repeat.set(7, 7);
    suelo.colorSpace = THREE.SRGBColorSpace;
    const pared = lienzo(512, 512, (g) => {
      g.fillStyle = '#6a5a48';
      g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = ['#74634f', '#5e4f40', '#7a6954', '#66573f'][Math.floor(rnd() * 4)];
        g.fillRect(rnd() * 512, rnd() * 512, 6 + rnd() * 30, 4 + rnd() * 14);
      }
    });
    pared.wrapS = pared.wrapT = THREE.RepeatWrapping;
    pared.repeat.set(10, 2);
    pared.colorSpace = THREE.SRGBColorSpace;
    const est = new THREE.BufferGeometry();
    const pe: number[] = [];
    for (let i = 0; i < 900; i++) {
      const a = rnd() * Math.PI * 2, e = 0.18 + rnd() * 1.1;
      pe.push(Math.cos(a) * Math.cos(e) * 300, Math.sin(e) * 300, Math.sin(a) * Math.cos(e) * 300);
    }
    est.setAttribute('position', new THREE.Float32BufferAttribute(pe, 3));
    const figuras = Array.from({length: N}).map((_, i) => ({
      a: (i / N) * Math.PI * 2 + rnd() * 0.2,
      rho: 6.2 + rnd() * 3.4,
      h: 1.9 + rnd() * 0.5,
      ph: rnd(),
      v: 0.55 + rnd() * 0.5,
    }));
    const faroles = [-9, -2, 5, 12].map((z) => ({z}));
    // la persona (dibujo pintado a mano en un lienzo): sentada, abrazada a las rodillas, cabeza apoyada, pañuelo claro, zapatillas blancas
    const persona = lienzo(512, 640, (g) => {
      g.clearRect(0, 0, 512, 640);
      const grad = (x0: number, y0: number, x1: number, y1: number, a: string, b: string) => {
        const q = g.createLinearGradient(x0, y0, x1, y1);
        q.addColorStop(0, a);
        q.addColorStop(1, b);
        return q;
      };
      g.fillStyle = 'rgba(0,0,0,0.38)';
      g.beginPath();
      g.ellipse(256, 604, 200, 22, 0, 0, Math.PI * 2);
      g.fill();
      // vestido (masa del cuerpo)
      g.fillStyle = grad(120, 300, 400, 600, '#56684a', '#26331f');
      g.beginPath();
      g.moveTo(100, 604);
      g.bezierCurveTo(70, 520, 92, 400, 150, 332);
      g.bezierCurveTo(196, 280, 326, 280, 372, 332);
      g.bezierCurveTo(430, 400, 450, 520, 412, 604);
      g.closePath();
      g.fill();
      // rodillas
      g.fillStyle = grad(140, 400, 380, 580, '#62765a', '#34452f');
      g.beginPath();
      g.ellipse(256, 478, 150, 100, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(255,235,190,0.35)';
      g.lineWidth = 5;
      g.beginPath();
      g.ellipse(256, 478, 150, 100, 0, Math.PI * 1.05, Math.PI * 1.7);
      g.stroke();
      // zapatillas blancas
      [[150, 584], [284, 584]].forEach(([x, y]) => {
        g.fillStyle = grad(x, y - 24, x, y + 24, '#ffffff', '#cfc7b8');
        g.beginPath();
        g.roundRect(x, y - 22, 86, 40, 18);
        g.fill();
      });
      // chal / pañuelo sobre los hombros
      g.fillStyle = grad(130, 300, 380, 440, '#fbf3de', '#d2bd92');
      g.beginPath();
      g.moveTo(132, 400);
      g.bezierCurveTo(120, 330, 170, 262, 256, 258);
      g.bezierCurveTo(342, 262, 392, 330, 380, 400);
      g.bezierCurveTo(350, 372, 300, 392, 256, 396);
      g.bezierCurveTo(212, 392, 162, 372, 132, 400);
      g.closePath();
      g.fill();
      // brazos cruzados sobre las rodillas
      g.lineCap = 'round';
      g.strokeStyle = '#3e4f38';
      g.lineWidth = 56;
      g.beginPath();
      g.moveTo(160, 392);
      g.quadraticCurveTo(250, 470, 350, 430);
      g.stroke();
      g.strokeStyle = '#4a5e42';
      g.lineWidth = 50;
      g.beginPath();
      g.moveTo(352, 392);
      g.quadraticCurveTo(262, 452, 168, 436);
      g.stroke();
      // cabeza apoyada (de espaldas / baja) con el pañuelo
      g.fillStyle = grad(190, 250, 330, 420, '#fffaf0', '#d9c59c');
      g.beginPath();
      g.ellipse(256, 352, 92, 96, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(120,90,50,0.35)';
      g.lineWidth = 4;
      [[-38, 18], [4, 14], [44, 10]].forEach(([dx, r]) => {
        g.beginPath();
        g.ellipse(256 + dx, 360, 22 + r, 70, 0, Math.PI * 0.25, Math.PI * 1.0);
        g.stroke();
      });
      g.fillStyle = 'rgba(80,55,30,0.28)';
      g.beginPath();
      g.ellipse(256, 410, 72, 22, 0, 0, Math.PI);
      g.fill();
    });
    persona.colorSpace = THREE.SRGBColorSpace;
    return {persona, suelo, pared, est, figuras, faroles, brillo: texturaBrillo(), brilloCalido: texturaBrillo('255,190,120'), brilloBlanco: texturaBrillo('255,248,225')};
  }, []);

  const horizonte = mezcla('#2a2447', '#ffb27a', alba);
  const cenit = mezcla('#0a0d28', '#f0a58a', alba);
  const skyU = useMemo(() => ({uTop: {value: new THREE.Color()}, uHor: {value: new THREE.Color()}}), []);

  useLayoutEffect(() => {
    ponerCamara(camera as THREE.PerspectiveCamera, cam);
    scene.background = horizonte.clone();
    scene.fog = new THREE.Fog(horizonte.clone().lerp(C('#10142e'), 0.2 * (1 - alba)), 14, 110);
    skyU.uTop.value.copy(cenit);
    skyU.uHor.value.copy(horizonte);
  });

  const pulso = 0.85 + 0.15 * Math.sin(t * 3.1);
  const radioEsf = R * (1 + alba * 0.35) * (1 + 0.012 * Math.sin(t * 4.2));
  const opEsf = (1 - 0.5 * alba) * pulso;

  return (
    <>
      <hemisphereLight args={[mezcla('#6a78c8', '#ffe2b8', alba), mezcla('#2a2030', '#8a6a50', alba), 0.8 + alba * 1.2]} />
      <directionalLight position={[-18, 20, 14]} intensity={0.5 * (1 - alba) + alba * 1.6} color={mezcla('#9fb0ff', '#ffd09a', alba)} />
      {/* luz de la esfera */}
      <pointLight position={[0, CY, 0]} intensity={60 * luzE} distance={30} color={'#ffe3b0'} decay={1.5} />

      {/* cielo */}
      <mesh>
        <sphereGeometry args={[300, 24, 16]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          uniforms={skyU}
          vertexShader={'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }'}
          fragmentShader={'varying vec3 vP; uniform vec3 uTop; uniform vec3 uHor; void main(){ float h = clamp(normalize(vP).y, 0.0, 1.0); gl_FragColor = vec4(mix(uHor, uTop, smoothstep(0.0, 0.7, h)), 1.0); }'}
        />
      </mesh>
      <points geometry={r.est}>
        <pointsMaterial size={1.4} color={'#fff6e0'} transparent opacity={0.9 * (1 - alba)} fog={false} sizeAttenuation={false} depthWrite={false} />
      </points>

      {/* suelo de adoquines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]}>
        <planeGeometry args={[60, 120]} />
        <meshStandardMaterial map={r.suelo} roughness={0.85} color={'#d8ccc0'} />
      </mesh>
      {/* paredes del callejón */}
      {[-14, 14].map((x) => (
        <mesh key={x} position={[x, 14, -10]}>
          <boxGeometry args={[1.2, 28, 160]} />
          <meshStandardMaterial map={r.pared} roughness={1} color={'#cfc0aa'} />
        </mesh>
      ))}
      {/* ventanas y arcos con luz */}
      {Array.from({length: 14}).map((_, i) => {
        const z = 24 - i * 8.2;
        const lado = i % 2 ? 1 : -1;
        return (
          <group key={i} position={[lado * 13.35, 3.2 + (i % 3) * 3, z]} rotation={[0, lado * -Math.PI / 2, 0]}>
            <mesh>
              <planeGeometry args={[1.3, 2.1]} />
              <meshBasicMaterial color={'#ffd27a'} transparent opacity={0.5 + 0.35 * Math.sin(i * 2.3 + t) * (1 - alba)} />
            </mesh>
          </group>
        );
      })}
      {/* faroles colgando */}
      {r.faroles.map((f, i) => (
        <group key={'f' + i}>
          {[-1, 1].map((lado) => (
            <group key={lado} position={[lado * 11.5, 5.2, f.z + lado * 1.3]}>
              <mesh>
                <boxGeometry args={[0.45, 0.7, 0.45]} />
                <meshBasicMaterial color={'#ffd27a'} />
              </mesh>
              <sprite scale={[7, 7, 1]}>
                <spriteMaterial map={r.brilloCalido} transparent opacity={0.85 * (1 - alba * 0.6)} depthWrite={false} />
              </sprite>
            </group>
          ))}
        </group>
      ))}

      {/* LA PERSONA, dibujada a mano, siempre de cara a la cámara */}
      <sprite position={[0, 1.55, 0]} scale={[3.2, 4.0, 1]} renderOrder={4}>
        <spriteMaterial map={r.persona} transparent depthWrite={false} color={'#c9bda6'} />
      </sprite>
      <sprite position={[0, CY, 0]} scale={[R * 4.2 * luzE, R * 4.2 * luzE, 1]} renderOrder={3}>
        <spriteMaterial map={r.brilloBlanco} transparent opacity={0.4 * luzE * (1 - alba * 0.4)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      {/* LA ESFERA de luz (brillo en el borde, transparente en el centro) */}
      <mesh position={[0, CY, 0]} scale={radioEsf} renderOrder={5}>
        <sphereGeometry args={[1, 48, 32]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{uO: {value: opEsf}, uT: {value: t}}}
          vertexShader={'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }'}
          fragmentShader={'varying vec3 vN; varying vec3 vV; uniform float uO; uniform float uT; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); float a = (pow(f, 2.6) * 1.15 + 0.05 + 0.04 * sin(uT * 2.0 + f * 8.0)) * uO; gl_FragColor = vec4(vec3(1.0, 0.9, 0.62) * a, a); }'}
        />
      </mesh>

      {/* FIGURAS DE SOMBRA con sus flechas */}
      {r.figuras.map((g, i) => {
        const rho = mixN(g.rho, 5.0 + (i % 3) * 0.5, acerca) + Math.sin(t * 0.6 + i) * 0.15 + disolver * 5;
        const x = Math.cos(g.a) * rho, z = Math.sin(g.a) * rho;
        const esc = (1 - disolver) * sm(t / 1.2 + 0.1 * (i % 5));
        const dcam = Math.hypot(x - camP[0], z - camP[2]);
        if (esc < 0.02 || dcam < 3.6) return null;
        // fase de ataque: la flecha de sombra se alarga hacia la esfera y rebota
        const ph = (t * g.v * 0.5 + g.ph) % 1;
        const largo = Math.max(0, rho - radioEsf - 0.1);
        const ext = ph < 0.55 ? sm(ph / 0.55) : ph < 0.7 ? 1 - sm((ph - 0.55) / 0.15) : 0;
        const choque = ph > 0.5 && ph < 0.66 ? Math.sin(((ph - 0.5) / 0.16) * Math.PI) : 0;
        const ang = Math.atan2(-z, -x); // mira al centro
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -ang + Math.PI / 2, 0]} scale={esc}>
            {/* capa con capucha */}
            <mesh position={[0, g.h / 2, 0]}>
              <coneGeometry args={[0.62, g.h, 14]} />
              <meshStandardMaterial color={'#0b0814'} roughness={1} />
            </mesh>
            <mesh position={[0, g.h + 0.05, 0]}>
              <sphereGeometry args={[0.3, 14, 10]} />
              <meshStandardMaterial color={'#06040c'} roughness={1} />
            </mesh>
            <mesh position={[0, g.h + 0.22, -0.02]} rotation={[0.15, 0, 0]}>
              <coneGeometry args={[0.34, 0.5, 12]} />
              <meshStandardMaterial color={'#0b0814'} roughness={1} />
            </mesh>
            {/* ojos rojos muy tenues */}
            <mesh position={[0, g.h + 0.02, 0.28]}>
              <planeGeometry args={[0.22, 0.05]} />
              <meshBasicMaterial color={'#ff5a3a'} transparent opacity={0.0 + 0.55 * (1 - disolver)} />
            </mesh>
            {/* flecha de sombra hacia la esfera (la figura mira a +z local) */}
            <group position={[0, g.h * 0.72, 0.4]}>
              <mesh position={[0, 0, (largo * ext) / 2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.1, Math.max(0.01, largo * ext), 8]} />
                <meshBasicMaterial color={'#0a0612'} />
              </mesh>
              {choque > 0.02 && (
                <sprite position={[0, 0, largo * ext]} scale={[2.2 * choque, 2.2 * choque, 1]}>
                  <spriteMaterial map={r.brilloBlanco} transparent opacity={0.95 * choque} depthWrite={false} blending={THREE.AdditiveBlending} />
                </sprite>
              )}
            </group>
          </group>
        );
      })}

      {/* polvo de luz */}
      {Array.from({length: 40}).map((_, i) => (
        <sprite key={'p' + i} position={[Math.cos(i * 2.4 + t * 0.2) * (3 + (i % 7)), 0.6 + ((i * 0.37 + t * 0.25) % 6), Math.sin(i * 2.4 + t * 0.2) * (3 + (i % 7))]} scale={[0.22, 0.22, 1]}>
          <spriteMaterial map={r.brillo} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </>
  );
};
