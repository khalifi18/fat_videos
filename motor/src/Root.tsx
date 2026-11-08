import React from 'react';
import {AbsoluteFill, Composition, useCurrentFrame} from 'remotion';
import {FPS, H, W} from './tema';
import {Video, VideoProps} from './Video';
import {ESCENAS} from './dibujos';
import {ThreeCanvas} from '@remotion/three';
import {MUNDOS} from './mundos';
import type {Tramo} from './mundos/camara';
import {SobreVideo, SobreVideoProps} from './SobreVideo';
import {Carta, CartaProps, tiemposCarta} from './Carta';

const ejemplo: VideoProps = {
  audio: null,
  modo: 'leccion',
  firma: 'Fatima Andalussi',
  cierre: 'Envíaselo a alguien que lo necesite',
  finVoz: 5,
  duracion: 8,
  pov: null,
  lineas: [{es: 'Con la dificultad *viene la facilidad*', ini: 0.3, fin: 4.8}],
  planos: [{clip: null, texto: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', a: 0, b: 240}],
};

/** Vista de una escena suelta (para revisar dibujos): props {escena, opts, k, d} */
const VistaEscena: React.FC<{escena: string; opts: string[]; k: number; d: number}> = ({escena, opts, k, d}) => {
  const f = useCurrentFrame();
  const E = ESCENAS[escena];
  return <AbsoluteFill style={{background: '#000'}}>{E ? <E f={f} d={d} k={k} opts={opts} /> : null}</AbsoluteFill>;
};

/** Solo un mundo 3D (sin texto ni voz): sirve de fondo para otros vídeos. Props {mundo, tramos, duracion} */
const SoloMundo: React.FC<{mundo: string; tramos: Tramo[]; duracion: number}> = ({mundo, tramos}) => {
  const f = useCurrentFrame();
  const M = MUNDOS[mundo];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {M ? (
        <ThreeCanvas width={W} height={H} gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 44, near: 0.05, far: 600}}>
          <M t={f / FPS} T={Math.max(1, (tramos.length ? 1 : 1) * 1)} tramos={tramos} />
        </ThreeCanvas>
      ) : null}
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="Video"
      component={Video}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={FPS * 8}
      defaultProps={ejemplo}
      calculateMetadata={({props}) => ({durationInFrames: Math.ceil(props.duracion * FPS)})}
    />
    <Composition
      id="SobreVideo"
      component={SobreVideo}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={FPS * 8}
      defaultProps={{video: 'sobrevideo/fondo.mp4', duracion: 8, nombre: {ar: '', es: '', t: 0.5}, bloques: [], firma: 'Fatima Andalussi'} as SobreVideoProps}
      calculateMetadata={({props}) => ({durationInFrames: Math.ceil(props.duracion * FPS)})}
    />
    <Composition
      id="Carta"
      component={Carta}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={FPS * 12}
      defaultProps={{firma: 'Fatima Andalussi', cierre: '', lineas: [{ar: 'كلمة', es: 'palabra'}]} as CartaProps}
      calculateMetadata={({props}) => ({durationInFrames: Math.ceil(tiemposCarta(props.lineas, props.tiempos, props.finVoz).total)})}
    />
    <Composition
      id="SoloMundo"
      component={SoloMundo}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={FPS * 8}
      defaultProps={{mundo: 'otono', tramos: [{plano: 'caminar', t: 0}] as Tramo[], duracion: 8}}
      calculateMetadata={({props}) => ({durationInFrames: Math.ceil(props.duracion * FPS)})}
    />
    <Composition id="Escena" component={VistaEscena} width={W} height={H} fps={FPS} durationInFrames={150} defaultProps={{escena: 'puerta', opts: [] as string[], k: 30, d: 150}} />
  </>
);
