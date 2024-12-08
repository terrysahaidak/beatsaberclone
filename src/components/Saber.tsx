import { useRef } from 'react';
import * as THREE from 'three';
import { LEFT_HAND_COLOR, RIGHT_HAND_COLOR } from '../constants';
import { gameStore } from '../store/store';
import { useFrame } from '@react-three/fiber';
import { useObject } from '../hooks/useObject';
import saberObj from '../assets/saber.obj?url';
import { FakeGlowMaterial } from '../materials/FakeGlowMaterial';
import { observer } from 'mobx-react';
import { Cylinder } from '@react-three/drei';

export const SaberMesh = observer(function ({
  isRightHand,
  position,
  rotation,
}: {
  isRightHand: boolean;
  position: THREE.Vector3Tuple;
  rotation: THREE.Vector3Tuple;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;

    gameStore.sabers.setSaber(isRightHand ? 'right' : 'left', ref.current!);

    if (isRightHand) {
      gameStore.currentSong.calculateCollisions('right');
    } else {
      gameStore.currentSong.calculateCollisions('left');
    }
  });

  const color = gameStore.sabers.sabersCollided ? 'white' : isRightHand ? RIGHT_HAND_COLOR : LEFT_HAND_COLOR;
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
      <mesh>
        <primitive object={saberGeometry} attach="geometry" />
        <meshStandardMaterial attach="material" color={color} emissive={color} />
      </mesh>
      <mesh scale={1.01}>
        <primitive object={saberGeometry} attach="geometry" />
        <FakeGlowMaterial glowColor={color} falloff={0} glowSharpness={0.4} glowInternalRadius={2.5} depthTest opacity={1} side="THREE.DoubleSide" />
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

      <Cylinder ref={ref} args={[0.03, 0.03, 1.2, 32]} position={[0, 0.6, 0]}>
        <meshStandardMaterial transparent opacity={0} />
      </Cylinder>
    </group>
  );
});
