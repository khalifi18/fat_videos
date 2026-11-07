import React from 'react';
import {AbsoluteFill, Composition, useCurrentFrame} from 'remotion';
import {FPS, H, W} from './tema';
import {Video, VideoProps} from './Video';
import {ESCENAS} from './dibujos';
import {SobreVideo, SobreVideoProps} from './SobreVideo';

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
    <Composition id="Escena" component={VistaEscena} width={W} height={H} fps={FPS} durationInFrames={150} defaultProps={{escena: 'puerta', opts: [] as string[], k: 30, d: 150}} />
  </>
);
