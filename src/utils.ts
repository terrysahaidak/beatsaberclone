import * as THREE from 'three';
import { useControls } from 'leva';

export function useComponentControls(
  name: string,
  position?: [number, number, number],
  rotation?: [number, number, number]
): {
  position: [number, number, number];
  rotation: [number, number, number];
} {
  const { pos, rot } = useControls(name, {
    pos: {
      x: position?.[0] ?? 0,
      y: position?.[1] ?? 0,
      z: position?.[2] ?? 0,
    },
    rot: {
      x: rotation?.[0] ?? 0,
      y: rotation?.[1] ?? 0,
      z: rotation?.[2] ?? 0,
    },
  });

  return { position: [pos.x, pos.y, pos.z], rotation: [rot.x, rot.y, rot.z] };
}

export type ArrowDirection = 'left' | 'right' | 'up' | 'down';

const cache = new Map<ArrowDirection, THREE.CanvasTexture>();

export const createArrowTexture = (direction: ArrowDirection) => {
  if (cache.has(direction)) {
    return cache.get(direction)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Clear canvas
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, 64, 64);

  // Draw arrow
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  
  ctx.save();
  ctx.translate(32, 32);
  
  // Rotate context based on direction
  const rotation = {
    up: 0,
    right: Math.PI / 2,
    down: Math.PI,
    left: -Math.PI / 2,
  }[direction];
  
  ctx.rotate(rotation);

  // Draw arrow
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(-15, 10);
  ctx.lineTo(15, 10);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  cache.set(direction, texture);
  return texture;
};
