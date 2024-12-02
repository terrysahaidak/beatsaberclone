import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { LEFT_HAND_COLOR, RIGHT_HAND_COLOR } from '../constants';
import { BlockModel } from '../store/BlockModel';
import { useObject } from '../hooks/useObject';
import blockDirectional from '../assets/block-directional.obj?url';
import blockCenter from '../assets/block-center.obj?url';
import { Direction } from '../types';
import { getPositionForBlock, getRotationForDirection } from '../utils';
import { observer } from 'mobx-react';

const SCALE_FACTOR = 0.4;

export const Block = observer(function Block({ model }: { model: BlockModel }) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const color = model.type === 1 ? RIGHT_HAND_COLOR : LEFT_HAND_COLOR;

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

  const group = useObject(model.cutDirection === Direction.ANY ? blockCenter : blockDirectional);

  const rotation: THREE.Vector3Tuple = [0, 0, getRotationForDirection(model.cutDirection)];

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

  return (
    <animated.group ref={ref} scale={springs.scale} position={[x, y, z]} rotation={rotation}>
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
});
