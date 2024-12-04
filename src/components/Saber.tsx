import { useRef } from 'react';
import * as THREE from 'three';
import { LEFT_HAND_COLOR, RIGHT_HAND_COLOR } from '../constants';
import { gameStore } from '../store/store';
import { useFrame } from '@react-three/fiber';
import { useXRControllerButtonEvent, useXRInputSourceStateContext } from '@react-three/xr';
import { useObject } from '../hooks/useObject';
import saberObj from '../assets/saber.obj?url';
import { FakeGlowMaterial } from '../materials/FakeGlowMaterial';

export const SaberMesh: React.FC<{
  isRightHand: boolean;
  position: THREE.Vector3Tuple;
  rotation: THREE.Vector3Tuple;
}> = ({ isRightHand, position, rotation }) => {
  const state = useXRInputSourceStateContext('controller');
  // Handle trigger press event to spawn a bullet
  useXRControllerButtonEvent(state, 'xr-standard-trigger', (state) => {
    if (state === 'pressed' && isRightHand) {
      gameStore.onTriggerPress();
    }
  });

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

  const group = useObject(saberObj);

  if (!group) {
    return null;
  }

  const saberGeometry = (group.children[0] as THREE.Mesh).geometry;
  const handle1Geometry = (group.children[1] as THREE.Mesh).geometry;
  const handle2Geometry = (group.children[2] as THREE.Mesh).geometry;

  return (
    <group position={positionProp} rotation={rotation}>
      {/* Blade */}
      <mesh ref={ref}>
        <primitive object={saberGeometry} attach="geometry" />
        <FakeGlowMaterial glowColor={color} falloff={0} glowSharpness={2} glowInternalRadius={2} depthTest opacity={1} side="THREE.DoubleSide" />
        {/* <meshStandardMaterial attach="material" color={color} emissive={color} /> */}
      </mesh>
      <mesh>
        <primitive object={handle2Geometry} />
        <meshStandardMaterial metalness={1} roughness={1} color={0x000000} />
      </mesh>
      <mesh>
        <primitive object={handle1Geometry} />
        <meshStandardMaterial metalness={0.1} roughness={1} color={0x000000} />
      </mesh>
    </group>
  );
};
