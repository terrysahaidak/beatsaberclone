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

const cache = new Map<`${ArrowDirection}-${number}`, THREE.CanvasTexture>();

const drawArrow = (ctx: CanvasRenderingContext2D, size: number, direction: ArrowDirection) => {
  const center = size / 2;
  const arrowWidth = size * 0.8;  // 80% of canvas width
  const arrowHeight = size * 0.1; // 30% of canvas height
  
  ctx.save();
  ctx.translate(center, center);

  switch (direction) {
    case 'up':
      ctx.translate(0, size / 2 - size * 0.15);
      // Draw upward pointing arrow
      ctx.beginPath();
      ctx.moveTo(0, -arrowHeight * 1.5);          // Top point
      ctx.lineTo(-arrowWidth/2, arrowHeight/2);   // Bottom left
      ctx.lineTo(arrowWidth/2, arrowHeight/2);    // Bottom right
      break;
    case 'down':
      ctx.translate(0, -size / 2 + size * 0.15);
      // Draw downward pointing arrow
      ctx.beginPath();
      ctx.moveTo(0, arrowHeight * 1.5);           // Bottom point
      ctx.lineTo(-arrowWidth/2, -arrowHeight/2);  // Top left
      ctx.lineTo(arrowWidth/2, -arrowHeight/2);   // Top right
      break;
    case 'left':
      // Draw leftward pointing arrow
      ctx.translate(size / 2 - size * 0.1, 0);
      ctx.beginPath();
      ctx.moveTo(-arrowHeight * 1.5, 0);          // Left point
      ctx.lineTo(arrowHeight/2, -arrowWidth/2);   // Top right
      ctx.lineTo(arrowHeight/2, arrowWidth/2);    // Bottom right
      break;
    case 'right':
      // Draw rightward pointing arrow
      ctx.translate(-size / 2 + size * 0.1, 0);
      ctx.beginPath();
      ctx.moveTo(arrowHeight * 1.5, 0);           // Right point
      ctx.lineTo(-arrowHeight/2, -arrowWidth/2);  // Top left
      ctx.lineTo(-arrowHeight/2, arrowWidth/2);   // Bottom left
      break;
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};

export const createArrowTexture = (direction: ArrowDirection, boxSize: number) => {
  const cacheKey = `${direction}-${boxSize}` as const;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Clear canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, size, size);

  // Set arrow style
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 8;

  // Draw the arrow in the proper direction
  drawArrow(ctx, size, direction);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  cache.set(cacheKey, texture);
  return texture;
};
