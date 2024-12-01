import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { XROrigin } from '@react-three/xr';
import { useSpring, animated } from '@react-spring/three';
import { BASE_BOX_Y, BOX_SPAWN_Z, Direction, GRID_OFFSET, GRID_SIZE, GRID_SPACING, HIGH_BOX_Y, RIGHT_HAND_COLOR } from '../constants';
import { BlockModel } from '../store';
import { useObject } from '../hooks/use-object.hook';
import blockDirectional from '../assets/block-directional.obj?url';

function getRotationForDirection(direction: Direction) {
  switch (direction) {
    case Direction.UP:
      return Math.PI;
    case Direction.DOWN:
      return 0;
    case Direction.LEFT:
      return Math.PI * -0.5;
    case Direction.RIGHT:
      return Math.PI * 0.5;
    case Direction.UP_LEFT:
      return Math.PI * -0.75;
    case Direction.UP_RIGHT:
      return Math.PI * 0.75;
    case Direction.DOWN_LEFT:
      return Math.PI * -0.25;
    case Direction.DOWN_RIGHT:
      return Math.PI * 0.25;

    case Direction.ANY:
      return 0;

    default:
      throw new Error(`Unrecognized direction: ${direction}`);
  }
}

const LEFT_HAND_COLOR = 'blue';
const COLLISION_START_Z = -3; // Z position where we start checking collisions

const SCALE_FACTOR = 0.3;

export function Block({ model }: { model: BlockModel }) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const color = model.hand === 'right' ? RIGHT_HAND_COLOR : LEFT_HAND_COLOR;
  const [springs, springsApi] = useSpring(() => ({
    scale: 0.1,
  }));

  const group = useObject(blockDirectional);

  const rotation: THREE.Vector3Tuple = [0, 0, getRotationForDirection(model.direction)];

  // Calculate grid x and z positions (avoiding middle positions)
  const row = Math.floor(model.gridPosition / GRID_SIZE);
  const col = model.gridPosition % GRID_SIZE;
  const gridX = col * GRID_SPACING - GRID_OFFSET;
  const gridZ = row * GRID_SPACING - GRID_OFFSET;

  // Calculate if this box should be in the higher row (first row)
  const isHighRow = row === 0;
  const boxY = isHighRow ? HIGH_BOX_Y : BASE_BOX_Y;

  const [position] = useSpring(() => ({
    from: { z: BOX_SPAWN_Z },
    to: { z: gridZ },
    config: {
      duration: 2000 + model.delay,
    },
    loop: true,
    delay: model.delay,
    onChange: (result) => {
      // Update collision testing flag based on Z position
      model.canTestCollision = result.value.z > COLLISION_START_Z;
    },
    onRest() {
      springsApi.set({ scale: 0.1 });
    },
    onStart() {
      if (ref.current) {
        ref.current.visible = true;
      }
      springsApi.start({ scale: SCALE_FACTOR });
    },
  }));

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
    <XROrigin>
      <animated.group
        ref={ref}
        scale={springs.scale}
        position={position.z.to((value) => [gridX, boxY, value])}
        rotation={rotation}
        // debug position
        // position={[gridX, boxY, -2]}
      >
        <mesh ref={meshRef} scale={[SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR]}>
          <primitive object={geometry} attach="geometry" />
          <meshStandardMaterial opacity={0.25} attach="material" metalness={0.5} roughness={0.4} color={color} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <planeGeometry attach="geometry" args={[0.5, 0.5]} />
          <meshLambertMaterial attach="material" emissive={0xffffff} />
        </mesh>
      </animated.group>
    </XROrigin>
  );
}
