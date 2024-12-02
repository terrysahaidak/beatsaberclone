import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { BlockModel } from '../store/BlockModel';
import { useObject } from '../hooks/useObject';
import bomb from '../assets/bomb.obj?url';
import { getPositionForBlock } from '../utils';
import { observer } from 'mobx-react';

const SCALE_FACTOR = 0.3;

export const Bomb = observer(function Bomb({ model }: { model: BlockModel }) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const [springs, springsApi] = useSpring(() => ({
    from: {
      scale: model.initial ? SCALE_FACTOR : 0,
    },
    to: {
      scale: SCALE_FACTOR,
    },
    config: {
      tension: 170,
      friction: 26,
    },
  }));

  const group = useObject(bomb);

  const rotation: THREE.Vector3Tuple = [Math.random(), Math.random(), Math.random()];

  const { x, y, z } = getPositionForBlock(model);

  useEffect(() => {
    model.setOnCollisionCallback(() => {
      if (ref.current) {
        springsApi.start({ scale: 0, config: { duration: 50 } });
      }
    });
  }, []);

  useFrame(() => {
    if (meshRef.current && model.canTestCollision) {
      model.calculateBoundingBox(meshRef.current);
    }
  });

  if (!group) {
    return null;
  }

  const geometry = (group.children[0] as THREE.Mesh).geometry;

  console.log(group);

  return (
    <animated.group ref={ref} scale={springs.scale} position={[x, y, z]} rotation={rotation}>
      <mesh ref={meshRef} scale={[SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR]}>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial transparent attach="material" metalness={0.5} roughness={0.4} color="gray" />
      </mesh>
    </animated.group>
  );
});
