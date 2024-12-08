import { Vector3Tuple } from 'three';

export const LEFT_HAND_COLOR = '#ff000c';
export const RIGHT_HAND_COLOR = '#123bff';

export const BOX_SIZE = 0.35;
export const PLAYER_Y_OFFSET = 0.5;

export const STAGE_WIDTH = 3;
export const STAGE_LENGTH = 2;
export const SPAWN_STAGE_WIDTH = 4.75;
export const SPAWN_STAGE_LENGTH = 100;
export const SPAWN_STAGE_POSITION_Z = 8;
export const GRID_PADDING = 0.3;
export const GRID_WIDTH = STAGE_WIDTH - GRID_PADDING * 2;
export const GRID_CELL_SIZE = GRID_WIDTH / 4;
export const GRID_HEIGHT = GRID_CELL_SIZE * 3;

export const GRID_Y = GRID_PADDING;
export const GRID_X = -GRID_WIDTH / 2 + GRID_PADDING;

export const SONG_OFFSET = 0;

export const BLADE_POSITION = [0, 0.01, 0.15] as Vector3Tuple;
export const BLADE_ROTATION = [-1.6, 0, 0.07] as Vector3Tuple;
export const COLLISION_START_Z = 3 + SONG_OFFSET;

export const BLOCK_SPAWN_POSITION = SPAWN_STAGE_POSITION_Z + SONG_OFFSET;
export const BLOCK_REMOVE_POSITION = 2;
