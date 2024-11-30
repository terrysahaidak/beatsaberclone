import './App.css';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { createXRStore, XR, XROrigin } from '@react-three/xr';
import { Cylinder, MeshDistortMaterial } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { Physics } from '@react-three/cannon';

const boxBoundingBox = new THREE.Box3();

const onLeftCollisionListeners = new Set<() => void>();
const onRightCollisionListeners = new Set<() => void>();

const SaberMesh: React.FC<{
  isRightHand: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
}> = ({ isRightHand, position, rotation }) => {
  const ref = useRef<THREE.Mesh>(null);

  const saberOBB = new THREE.Box3();
  const saberMatrix = new THREE.Matrix4();

  const saberSize = new THREE.Vector3(0.02, 0.93, 0.02); // Cylinder dimensions: width, height, depth

  useFrame(() => {
    if (ref.current) {
      // Update the matrix to include position and rotation
      saberMatrix.compose(
        new THREE.Vector3(...position), // Position
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), // Rotation
        new THREE.Vector3(1, 1, 1) // Scale
      );

      // Create the OBB by applying the transformation matrix to the bounding box
      saberOBB.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), saberSize).applyMatrix4(saberMatrix);

      // Check for collision with the box
      if (saberOBB.intersectsBox(boxBoundingBox)) {
        if (isRightHand) {
          onRightCollisionListeners.forEach((listener) => listener());
        } else {
          onLeftCollisionListeners.forEach((listener) => listener());
        }
      }
    }
  });

  const color = isRightHand ? 'red' : 'blue';

  return (
    <mesh ref={ref} position={position} rotation={rotation}>
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

const BOX_SIZE = 0.2;
const BOX_SPAWN_Z = -5;
const BOX_Y = BOX_SIZE * 6;

const AnimatedMeshStandardMaterial = animated(MeshDistortMaterial);

function Box() {
  const ref = useRef<THREE.Mesh>(null);
  const [springs, springsApi] = useSpring(() => ({ scale: 0.1, color: 'black' }));

  const [position] = useSpring(() => ({
    from: { z: BOX_SPAWN_Z },
    to: { z: 0 },
    config: {
      duration: 2000,
    },
    loop: true,
    onRest() {
      springsApi.set({ scale: 0.1 });
    },
    onStart() {
      ref.current.visible = true;
      springsApi.set({ color: 'black' });
      springsApi.start({ scale: 1 });
    },
  }));

  useEffect(() => {
    onLeftCollisionListeners.add(() => {
      ref.current.visible = false;
      springsApi.set({ color: 'blue' });
    });

    onRightCollisionListeners.add(() => {
      ref.current.visible = false;
      springsApi.set({ color: 'red' });
    });

    return () => {
      onLeftCollisionListeners.clear();
      onRightCollisionListeners.clear();
    };
  }, []);

  useFrame(() => {
    if (ref.current) {
      ref.current.geometry.computeBoundingBox();
      ref.current.getWorldPosition(boxBoundingBox.min); // Use box's world position as the min bound
      boxBoundingBox.max.copy(boxBoundingBox.min).addScalar(BOX_SIZE); // Add box size for the max bound
    }
  });

  return (
    <XROrigin>
      <animated.mesh ref={ref} scale={springs.scale} position={position.z.to((value) => [0, BOX_Y, value])}>
        <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
        <AnimatedMeshStandardMaterial color={springs.color} />
      </animated.mesh>
    </XROrigin>
  );
}

export default function App() {
  return (
    <>
      <button className="vr-button" onClick={() => store.enterAR()}>
        Enter AR
      </button>
      <Canvas camera={{ fov: 45 }}>
        <Physics>
          <XR store={store}>
            <XROrigin>
              <ambientLight intensity={1} />

              <Box />
            </XROrigin>
          </XR>
        </Physics>
      </Canvas>
    </>
  );
}
