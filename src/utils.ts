import { useControls } from 'leva';
import { Direction } from './types';
import { BLOCK_COLUMN_WIDTH, SONG_OFFSET } from './constants';
import { BlockModel } from './store/BlockModel';

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

export function getRotationForDirection(direction: Direction) {
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

export function getPositionForBlock(note: BlockModel) {
  const x = note.index * BLOCK_COLUMN_WIDTH - BLOCK_COLUMN_WIDTH * 1.5;
  const y = note.layer * BLOCK_COLUMN_WIDTH - BLOCK_COLUMN_WIDTH;

  const startingPosition = -note.zPosition;

  // Next, take into account that the song is playing. `cursorPosition` will continue to grow, and we need to cursorPosition it by the right number of beats.
  const z = startingPosition;

  return { x, y, z };
}

export function roundToNearest(number: number, nearest: number) {
  return Math.round(number / nearest) * nearest;
}
export function roundAwayFloatingPointNonsense(n: number) {
  return roundToNearest(n, 1 / 1000000);
}
