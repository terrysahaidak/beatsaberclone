import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { BOX_SIZE, LEFT_HAND_COLOR, RIGHT_HAND_COLOR } from '../constants';
import { BlockModel } from '../store/BlockModel';
import { useObject } from '../hooks/useObject';
import blockDirectional from '../assets/block-directional.obj?url';
import blockCenter from '../assets/block-center.obj?url';
import { Direction } from '../types';
import { getPositionForBlock, getRotationForDirection } from '../utils';
import { observer } from 'mobx-react';
import { gameStore } from '../store/store';

const SCALE_FACTOR = 1;

export const Block = observer(function Block({ model }: { model: BlockModel }) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const color = model.type === 1 ? RIGHT_HAND_COLOR : LEFT_HAND_COLOR;

  const { x, y, z } = getPositionForBlock(model);
  const rotationZ = getRotationForDirection(model.cutDirection);

  const [springs] = useSpring(() => ({
    from: {
      y: 0,
      rotationZ: 0,
      rotationY: 0,
      scale: model.initial ? SCALE_FACTOR : 0,
    },
    to: {
      y,
      rotationZ,
      rotationY: 0,
      scale: SCALE_FACTOR,
    },
    config: {
      tension: 170,
      friction: 26,
    },
  }));

  const { rotationY } = useSpring({
    from: {
      rotationY: 0,
    },
    to: {
      rotationY: model.shouldRotate ? model.rotationY : 0,
    },
    config: {
      duration: gameStore.beatsDuration(2),
    },
  });

  const group = useObject(model.cutDirection === Direction.ANY ? blockCenter : blockDirectional);

  useEffect(() => {
    model.setOnCollisionCallback(() => {
      if (ref.current) {
        ref.current.visible = false;
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
    <animated.group ref={ref} scale={springs.scale} position={springs.y.to((v) => [x, v, z])} rotation-z={springs.rotationZ} rotation-y={rotationY}>
      {/* <mesh ref={meshRef}>
        <planeGeometry args={[BOX_SIZE, BOX_SIZE]} />
        <meshStandardMaterial color={color} />
      </mesh> */}

      <mesh ref={meshRef} scale={[0.25, 0.25, 0.5]}>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial transparent attach="material" metalness={0.5} roughness={0.4} color={color} />
      </mesh>
      <mesh position-z={0.22} scale={0.8}>
        <planeGeometry attach="geometry" args={[BOX_SIZE, BOX_SIZE]} />
        <meshLambertMaterial attach="material" emissive={0xffffff} />
      </mesh>
    </animated.group>
  );
});
