export const LEFT_HAND_COLOR = 'blue';
export const RIGHT_HAND_COLOR = 'red';

export const BOX_SIZE = 0.2;
export const BOX_SPAWN_Z = -5;
export const BASE_BOX_Y = BOX_SIZE * 6; // Base height for lower row
export const HIGH_BOX_Y = BOX_SIZE * 7.5; // Height for upper row

export const GRID_SIZE = 4;
export const GRID_SPACING = BOX_SIZE * 1.5; // Space between boxes
export const GRID_OFFSET = (GRID_SIZE * GRID_SPACING) / 2 - GRID_SPACING / 2; // Center the grid
export const VALID_POSITIONS = [
  0,
  1,
  2,
  3, // Top row (higher)
  12,
  13,
  14,
  15, // Bottom row (lower)
];

export const Direction = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
  UP_LEFT: 4,
  UP_RIGHT: 5,
  DOWN_LEFT: 6,
  DOWN_RIGHT: 7,
  ANY: 8,
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];
