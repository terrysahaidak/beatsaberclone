export interface Beatmap {
  _notes: Note[];
}

export interface BeatmapInfo {
  _beatsPerMinute: number;
  _songTimeOffset: number;
  _difficultyBeatmapSets: {
    _difficultyBeatmaps: {
      _difficulty: string;
      _noteJumpMovementSpeed: number;
    }[];
  }[];
}

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

export interface Note {
  _time: number;
  _lineIndex: number;
  _lineLayer: number;
  _type: number;
  _cutDirection: Direction;
}
