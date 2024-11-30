import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { XROrigin } from '@react-three/xr';
import { RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { Arrow } from './Arrow';
import { BASE_BOX_Y, BOX_SIZE, BOX_SPAWN_Z, GRID_OFFSET, GRID_SIZE, GRID_SPACING, HIGH_BOX_Y, RIGHT_HAND_COLOR } from '../constants';
import { BoxModel } from '../store';

const LEFT_HAND_COLOR = 'blue';
const COLLISION_START_Z = -3; // Z position where we start checking collisions

export function Box({ model }: { model: BoxModel }) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const color = model.hand === 'right' ? RIGHT_HAND_COLOR : LEFT_HAND_COLOR;
  const [springs, springsApi] = useSpring(() => ({
    scale: 0.1,
  }));

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
      duration: 2000,
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
      springsApi.start({ scale: 1 });
    },
  }));

  useEffect(() => {
    model.onCollision(() => {
      if (ref.current) {
        ref.current.visible = false;
      }
    });
  }, []);

  useFrame(() => {
    if (meshRef.current && model.canTestCollision) {
      model.calculateBoxBoundingBox(meshRef.current);
    }
  });

  return (
    <XROrigin>
      <animated.group
        ref={ref}
        scale={springs.scale}
        position={position.z.to((value) => [gridX, boxY, value])}
        // debug position
        // position={[gridX, boxY, -2]}
      >
        <RoundedBox ref={meshRef} args={[BOX_SIZE, BOX_SIZE, BOX_SIZE * 0.5]} radius={0.02} smoothness={1}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} metalness={0.5} roughness={0.2} />
        </RoundedBox>
        <Arrow direction={model.direction} BOX_SIZE={BOX_SIZE} />
      </animated.group>
    </XROrigin>
  );
}
