import { Vector3Tuple } from 'three';

export const LEFT_HAND_COLOR = '#ff000c';
export const RIGHT_HAND_COLOR = '#123bff';

export const BOX_SIZE = 0.5;

export const BLOCK_COLUMN_WIDTH = BOX_SIZE * 1.175;
export const SONG_OFFSET = 0;

export const BLADE_POSITION = [0, 0.01, 0.15] as Vector3Tuple;
export const BLADE_ROTATION = [-1.6, 0, 0.07] as Vector3Tuple;
export const COLLISION_START_Z = 3 + SONG_OFFSET;

export const BLOCK_SPAWN_POSITION = 3 + SONG_OFFSET;
export const BLOCK_REMOVE_POSITION = 2;
