import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { createXRStore, XR, XROrigin } from '@react-three/xr';
import { Cylinder, MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { Physics } from '@react-three/cannon';
import { ArrowDirection, createArrowTexture } from './utils';

const LEFT_HAND_COLOR = 'blue';
const RIGHT_HAND_COLOR = 'red';

const BOX_SIZE = 0.2;
const BOX_SPAWN_Z = -5;
const BASE_BOX_Y = BOX_SIZE * 6;      // Base height for lower row
const HIGH_BOX_Y = BOX_SIZE * 7.5;    // Height for upper row

const GRID_SIZE = 4;
const GRID_SPACING = BOX_SIZE * 1.5; // Space between boxes
const GRID_OFFSET = (GRID_SIZE * GRID_SPACING) / 2 - GRID_SPACING / 2; // Center the grid

const calculateSaberBoundingBox = (mesh: THREE.Mesh) => {
  const box = new THREE.Box3();
  // Update matrix world to ensure correct world position
  mesh.updateMatrixWorld();
  box.setFromObject(mesh);
  return box;
};

const calculateBoxBoundingBox = (mesh: THREE.Mesh) => {
  const box = new THREE.Box3();
  // Update matrix world to ensure correct world position
  mesh.updateMatrixWorld();
  box.setFromObject(mesh);
  return box;
};

const boxBoundingBox = new THREE.Box3();

const onLeftCollisionListeners = new Set<() => void>();
const onRightCollisionListeners = new Set<() => void>();

const SaberMesh: React.FC<{
  isRightHand: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
}> = ({ isRightHand, position, rotation }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    
    const saberBox = calculateSaberBoundingBox(ref.current);
    
    // Check for collision with the box
    if (saberBox.intersectsBox(boxBoundingBox)) {
      if (isRightHand) {
        onRightCollisionListeners.forEach((listener) => listener());
      } else {
        onLeftCollisionListeners.forEach((listener) => listener());
      }
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

const store = createXRStore({
  controller: {
    right: () => {
      return <SaberMesh isRightHand position={[0, 0.24, -0.21]} rotation={[2.35, 0, 0]} />;
    },
    left: () => {
      return <SaberMesh isRightHand={false} position={[0, 0.24, -0.21]} rotation={[2.35, 0, 0]} />;
    },
  },
});



const Arrow: React.FC<{ direction: ArrowDirection }> = ({ direction }) => {
  const texture = React.useMemo(() => {
    return createArrowTexture(direction);
  }, [direction]);

  // Position arrows with their bases at the edges
  const position: [number, number, number] = (() => {
    const frontOffset = BOX_SIZE * 0.25 + 0.01; // Half depth plus small offset
    const edgeOffset = BOX_SIZE * 0.5; // Full edge distance
    const arrowLength = BOX_SIZE; // Full box size for length

    switch (direction) {
      case 'up':
        return [0, -edgeOffset + arrowLength/2, frontOffset];
      case 'down':
        return [0, edgeOffset - arrowLength/2, frontOffset];
      case 'left':
        return [edgeOffset - arrowLength/2, 0, frontOffset];
      case 'right':
        return [-edgeOffset + arrowLength/2, 0, frontOffset];
      default:
        return [0, 0, frontOffset];
    }
  })();

  // Make arrows as wide as the cube
  const [scaleX, scaleY] = (() => {
    const width = BOX_SIZE; // Full box width
    const length = BOX_SIZE; // Full box length
    
    switch (direction) {
      case 'up':
      case 'down':
        return [width, length]; // Full width for vertical arrows
      case 'left':
      case 'right':
        return [length, width]; // Full width for horizontal arrows
      default:
        return [width, width];
    }
  })();

  return (
    <sprite 
      position={position}
      scale={[scaleX, scaleY, 1]}
    >
      <spriteMaterial 
        map={texture} 
        transparent={true}
        opacity={0.9}
      />
    </sprite>
  );
};

const AnimatedMeshStandardMaterial = animated(MeshDistortMaterial);

function Box({
  isRightHand,
  gridPosition,
  delay,
  direction,
}: {
  isRightHand: boolean;
  gridPosition: number;
  delay: number;
  direction: ArrowDirection;
}) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [springs, springsApi] = useSpring(() => ({ 
    scale: 0.1, 
    color: isRightHand ? RIGHT_HAND_COLOR : LEFT_HAND_COLOR,
    emissive: isRightHand ? RIGHT_HAND_COLOR : LEFT_HAND_COLOR,
    emissiveIntensity: 0.5
  }));

  // Calculate grid x and z positions (avoiding middle positions)
  const row = Math.floor(gridPosition / GRID_SIZE);
  const col = gridPosition % GRID_SIZE;
  const gridX = (col * GRID_SPACING) - GRID_OFFSET;
  const gridZ = (row * GRID_SPACING) - GRID_OFFSET;

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
    delay,
    onRest() {
      springsApi.set({ scale: 0.1 });
    },
    onStart() {
      if (meshRef.current) {
        meshRef.current.visible = true;
      }
      springsApi.start({ scale: 1 });
    },
  }));

  useEffect(() => {
    const handleLeftCollision = () => {
      if (meshRef.current) {
        meshRef.current.visible = false;
      }
    };

    const handleRightCollision = () => {
      if (meshRef.current) {
        meshRef.current.visible = false;
      }
    };

    onLeftCollisionListeners.add(handleLeftCollision);
    onRightCollisionListeners.add(handleRightCollision);

    return () => {
      onLeftCollisionListeners.delete(handleLeftCollision);
      onRightCollisionListeners.delete(handleRightCollision);
    };
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      boxBoundingBox.copy(calculateBoxBoundingBox(meshRef.current));
    }
  });

  return (
    <XROrigin>
      <animated.group 
        ref={ref} 
        scale={springs.scale} 
        position={position.z.to((value) => [gridX, boxY, value])}
      >
        <RoundedBox 
          ref={meshRef}
          args={[BOX_SIZE, BOX_SIZE, BOX_SIZE * 0.5]}
          radius={0.02}
          smoothness={4}
        >
          <AnimatedMeshStandardMaterial 
            color={springs.color}
            emissive={springs.emissive}
            emissiveIntensity={springs.emissiveIntensity}
            metalness={0.5}
            roughness={0.2}
          />
        </RoundedBox>
        <Arrow direction={direction} />
      </animated.group>
    </XROrigin>
  );
}

export default function App() {
  const validPositions = [
    0, 1, 2, 3,      // Top row (higher)
    12, 13, 14, 15   // Bottom row (lower)
  ];

  return (
    <>
      <button className="vr-button" onClick={() => store.enterAR()}>
        Enter AR
      </button>
      <Canvas camera={{ fov: 45 }}>
        <Physics>
          <XR store={store}>
            <XROrigin>
              <ambientLight intensity={0.5} />
              <directionalLight 
                position={[5, 5, 5]} 
                intensity={1} 
                castShadow
              />
              <directionalLight 
                position={[-5, 5, -5]} 
                intensity={0.5}
              />
              
              <Box 
                isRightHand={false} 
                gridPosition={validPositions[0]} 
                delay={0}
                direction="left"
              />
              <Box 
                isRightHand={true} 
                gridPosition={validPositions[3]} 
                delay={1000}
                direction="right"
              />
              <Box 
                isRightHand={false} 
                gridPosition={validPositions[4]} 
                delay={2000}
                direction="up"
              />
              <Box 
                isRightHand={true} 
                gridPosition={validPositions[7]} 
                delay={500}
                direction="down"
              />
            </XROrigin>
          </XR>
        </Physics>
      </Canvas>
    </>
  );
}
