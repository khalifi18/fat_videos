import React from 'react';
import {W} from '../tema';

/** Trama muy suave de estrellas de zellige para el fondo de la hikma */
export const Estrella8Fondo: React.FC<{frame: number}> = ({frame}) => (
  <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`} style={{position: 'absolute', inset: 0}}>
    <defs>
      <pattern id="hk-z" width={180} height={180} patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${-frame * 0.3})`}>
        <rect x={50} y={50} width={80} height={80} fill="none" stroke="#fff" strokeWidth={2} />
        <rect x={50} y={50} width={80} height={80} fill="none" stroke="#fff" strokeWidth={2} transform="rotate(45 90 90)" />
      </pattern>
      <filter id="hk-grano" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="5" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.08" />
        </feComponentTransfer>
      </filter>
    </defs>
    <rect width={W} height={1920} fill="url(#hk-z)" opacity={0.06} />
    <rect width={W} height={1920} filter="url(#hk-grano)" />
  </svg>
);
