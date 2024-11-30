import { useRef } from 'react';
import * as THREE from 'three';
import { Cylinder } from '@react-three/drei';
import { LEFT_HAND_COLOR, RIGHT_HAND_COLOR } from '../constants';
import { gameStore } from '../store';
import { useFrame } from '@react-three/fiber';

export const SaberMesh: React.FC<{
  isRightHand: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
}> = ({ isRightHand, position, rotation }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;

    if (isRightHand) {
      gameStore.calculateCollisions('right', ref.current);
    } else {
      gameStore.calculateCollisions('left', ref.current);
    }
  });

  const color = isRightHand ? RIGHT_HAND_COLOR : LEFT_HAND_COLOR;
  const positionProp: THREE.Vector3Tuple = isRightHand
    ? [position[0] + 0.015, position[1], position[2]]
    : [position[0] - 0.015, position[1], position[2]];

  return (
    <mesh ref={ref} position={positionProp} rotation={rotation}>
      <Cylinder args={[0.02, 0.02, 0.93, 32]} material-color={color} />
    </mesh>
  );
};
