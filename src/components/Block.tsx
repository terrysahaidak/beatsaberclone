import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { RIGHT_HAND_COLOR } from '../constants';
import { BlockModel } from '../store/BlockModel';
import { useObject } from '../hooks/useObject';
import blockDirectional from '../assets/block-directional.obj?url';
import blockCenter from '../assets/block-center.obj?url';
import { Direction } from '../types';
import { getPositionForBlock, getRotationForDirection } from '../utils';

const LEFT_HAND_COLOR = 'blue';
const COLLISION_START_Z = -3; // Z position where we start checking collisions

const SCALE_FACTOR = 0.4;

export function Block({ model }: { model: BlockModel }) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const color = model.type === 1 ? RIGHT_HAND_COLOR : LEFT_HAND_COLOR;
  const [springs, springsApi] = useSpring(() => ({
    scale: SCALE_FACTOR,
    config: {
      tension: 170,
      friction: 26,
    },
  }));

  const group = useObject(model.cutDirection === Direction.ANY ? blockCenter : blockDirectional);

  const rotation: THREE.Vector3Tuple = [0, 0, getRotationForDirection(model.cutDirection)];

  const { x, y, z } = getPositionForBlock(model, 1);

  // const [position] = useSpring(() => ({
  //   from: { z: BOX_SPAWN_Z },
  //   to: { z: gridZ },
  //   config: {
  //     duration: 2000,
  //   },
  //   loop: true,
  //   delay: model.delay,
  //   onChange: (result) => {
  //     // Update collision testing flag based on Z position
  //     model.canTestCollision = result.value.z > COLLISION_START_Z;
  //   },
  //   onRest() {
  //     springsApi.set({ scale: 0.1 });
  //   },
  //   onStart() {
  //     if (ref.current) {
  //       ref.current.visible = true;
  //     }
  //     springsApi.start({ scale: SCALE_FACTOR });
  //   },
  // }));

  useEffect(() => {
    model.onCollision(() => {
      if (ref.current) {
        springsApi.start({ scale: 0, config: { duration: 200 } });
      }
    });
  }, []);

  useFrame(() => {
    if (meshRef.current && model.canTestCollision) {
      model.calculateBoxBoundingBox(meshRef.current);
    }
  });

  if (!group) {
    return null;
  }

  const geometry = (group.children[0] as THREE.Mesh).geometry;

  return (
    <animated.group
      ref={ref}
      scale={springs.scale}
      position={[x, y, z]}
      rotation={rotation}

      // debug position
      // position={[gridX, boxY, -2]}
    >
      <mesh ref={meshRef} scale={[SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR]}>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial transparent attach="material" metalness={0.5} roughness={0.4} color={color} />
      </mesh>
      <mesh position={[0, 0, 0.15]}>
        <planeGeometry attach="geometry" args={[0.5, 0.5]} />
        <meshLambertMaterial attach="material" emissive={0xffffff} />
      </mesh>
    </animated.group>
  );
}
