import * as THREE from 'three';
import React from 'react';

export const FloorCross: React.FC = () => {
  const lineWidth = 0.05;
  const lineLength = 0.3;
  const yOffset = 0.001; // Slightly above the floor to prevent z-fighting
  const rotationY = Math.PI / 4; // 45 degrees rotation

  return (
    <group rotation={[0, rotationY, 0]}>
      {/* Horizontal line */}
      <mesh position={[0, yOffset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[lineLength, lineWidth]} />
        <meshBasicMaterial color="white" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Vertical line */}
      <mesh position={[0, yOffset, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[lineLength, lineWidth]} />
        <meshBasicMaterial color="white" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
