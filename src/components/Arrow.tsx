import React from 'react';
import { ArrowDirection, createArrowTexture } from '../utils';
import * as THREE from 'three';

interface ArrowProps {
  direction: ArrowDirection;
  BOX_SIZE: number;
}

export const Arrow: React.FC<ArrowProps> = ({ direction, BOX_SIZE }) => {
  const texture = React.useMemo(() => {
    return createArrowTexture(direction, BOX_SIZE);
  }, [direction, BOX_SIZE]);

  return (
    <mesh position={[0, 0, BOX_SIZE * 0.25 + 0.001]}>
      <planeGeometry args={[BOX_SIZE, BOX_SIZE]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        opacity={1}
        depthTest={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}; 