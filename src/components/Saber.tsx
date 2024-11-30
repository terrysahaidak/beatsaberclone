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

  const BLADE_LENGTH = 0.73;
  const HANDLE_LENGTH = 0.15;
  const RADIUS = 0.02;

  // Calculate handle offset based on rotation
  const handleOffset = BLADE_LENGTH / 2 + HANDLE_LENGTH / 2;
  const rotationX = rotation[0];
  const handlePosition: [number, number, number] = [0, Math.sin(rotationX) * handleOffset, Math.cos(rotationX) * handleOffset + 0.31];

  return (
    <group position={positionProp} rotation={rotation}>
      {/* Blade */}
      <mesh ref={ref}>
        <Cylinder args={[RADIUS, RADIUS, BLADE_LENGTH, 32]} material-color={color} />
      </mesh>
      {/* Handle */}
      <mesh position={handlePosition}>
        <Cylinder args={[RADIUS * 1.2, RADIUS * 1.2, HANDLE_LENGTH, 32]} material-color="black" />
      </mesh>
    </group>
  );
};
