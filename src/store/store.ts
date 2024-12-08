import { Beatmap, BeatmapInfo, Direction, Note, Obstacle } from '../types';
import { makeObservable, observable, action } from 'mobx';
import { Howl } from 'howler';
import { BlockModel } from './BlockModel';
import { BLOCK_REMOVE_POSITION, BLOCK_SPAWN_POSITION } from '../constants';
import { WallModel } from './WallModel';
import SabersStore from './SabersStore';

export class GameStore {
  sabers: SabersStore;

  state: 'loading' | 'menu' | 'map-pause' | 'map-playing' | 'map-loading' | 'map-loaded' | 'map-end' = 'loading';

  blocks: BlockModel[] = [
    // block testing
    // new BlockModel({ index: 0, layer: 0, cutDirection: Direction.UP, type: 0, time: 3 }, this),
    // new BlockModel({ index: 1, layer: 0, cutDirection: Direction.DOWN, type: 1, time: 3 }, this),
    // new BlockModel({ index: 2, layer: 0, cutDirection: Direction.LEFT, type: 0, time: 3 }, this),
    // new BlockModel({ index: 3, layer: 0, cutDirection: Direction.RIGHT, type: 1, time: 3 }, this),
    // new BlockModel({ index: 0, layer: 1, cutDirection: Direction.UP_LEFT, type: 0, time: 3 }, this),
    // new BlockModel({ index: 1, layer: 1, cutDirection: Direction.UP_RIGHT, type: 1, time: 3 }, this),
    // new BlockModel({ index: 2, layer: 1, cutDirection: Direction.DOWN_RIGHT, type: 0, time: 3 }, this),
    // new BlockModel({ index: 3, layer: 1, cutDirection: Direction.DOWN_LEFT, type: 1, time: 3 }, this),
    // new BlockModel({ index: 0, layer: 2, cutDirection: Direction.ANY, type: 0, time: 3 }, this),
    // new BlockModel({ index: 1, layer: 2, cutDirection: Direction.ANY, type: 1, time: 3 }, this),
    // new BlockModel({ index: 2, layer: 2, cutDirection: Direction.ANY, type: 0, time: 3 }, this),
    // new BlockModel({ index: 3, layer: 2, cutDirection: Direction.ANY, type: 1, time: 3 }, this),
  ];

  walls: WallModel[] = [];

  hitCount = 0;
  totalNotesCount = 0;

  // in meters
  currentBeatTime = 0;
  // in beats
  bpm = 0;
  // in meters per second
  speed = 1;

  isPlaying = false;

  howl: Howl | null = null;

  onPlay: (() => void) | null = null;
  onPause: (() => void) | null = null;
  onReset: (() => void) | null = null;

  constructor() {
    this.sabers = new SabersStore();

    makeObservable(this, {
      blocks: observable,
      walls: observable,
      state: observable,
      onTriggerPress: action,
      onMapPlay: action,
      onMapReady: action,
      onMapEnd: action,
      setCurrentPosition: action,
    });
  }

  onReady() {
    this.state = 'menu';
  }

  setOnMapPlay(callback: () => void) {
    this.onPlay = callback;
  }

  setOnMapPause(callback: () => void) {
    this.onPause = callback;
  }

  setOnMapReset(callback: () => void) {
    this.onReset = callback;
  }

  onTriggerPress() {
    console.log('on trigger', this.state);

    if (this.state === 'menu') {
      this.state = 'map-loading';
    } else if (this.state === 'map-playing') {
      this.state = 'map-pause';

      this.onPause?.();
    } else if (this.state === 'map-pause') {
      this.state = 'map-playing';

      this.onReset?.();
    } else if (this.state === 'map-loaded') {
      this.onMapPlay();
    }
  }

  beatsDuration(beats: number) {
    return (60 / this.bpm) * beats * 1000;
  }

  setCurrentPosition(position: number) {
    this.currentBeatTime = ((position / this.speed) * this.bpm) / 60;

    this.blocks.forEach((block) => {
      // Calculate block's current Z position based on time
      const z = block.time - this.currentBeatTime;

      if (z < 1.5) {
        if (!block.hasBeenHit) {
          block.canTestCollision = true;
        }

        block.shouldRotate = true;
      }
    });

    // load more blocks
    const nextCursor = this._cursor + 1;
    const nextNote = this._sortedBlocks[nextCursor];

    if (nextNote && nextNote._time <= this.currentBeatTime + BLOCK_SPAWN_POSITION) {
      this.pushBlock(nextNote);
      this._cursor++;
    }

    // load more walls
    const nextWallsCursor = this._wallsCursor + 1;
    const nextWalls = this._sortedWalls[nextWallsCursor];

    if (nextWalls && nextWalls._time <= this.currentBeatTime + BLOCK_SPAWN_POSITION) {
      this.pushWall(nextWalls);
      this._wallsCursor++;
    }

    // remove invisible blocks
    this.blocks = this.blocks.filter((block) => block.time > this.currentBeatTime - BLOCK_REMOVE_POSITION);
    // remove invisible walls
    this.walls = this.walls.filter((item) => item.props.time + item.props.duration > this.currentBeatTime - BLOCK_REMOVE_POSITION);
  }

  pushBlock(note: Note, initial = false) {
    this.blocks.push(
      new BlockModel(
        {
          initial: initial,
          index: note._lineIndex,
          layer: note._lineLayer,
          cutDirection: note._cutDirection as Direction,
          type: note._type,
          time: note._time,
        },
        this
      )
    );
  }

  pushWall(obstacle: Obstacle, initial = false) {
    this.walls.push(
      new WallModel(
        {
          initial: initial,
          duration: obstacle._duration,
          index: obstacle._lineIndex,
          type: obstacle._type,
          width: obstacle._width,
          time: obstacle._time,
        },
        this
      )
    );
  }

  private _sortedBlocks: Note[] = [];
  private _cursor = 0;

  private _sortedWalls: Obstacle[] = [];
  private _wallsCursor = 0;

  loadMap(info: BeatmapInfo, map: Beatmap) {
    this._sortedBlocks = map._notes.sort((a, b) => a._time - b._time);
    this._sortedWalls = map._obstacles.sort((a, b) => a._time - b._time);
    this.bpm = info._beatsPerMinute;
    // this.speed =
    //   info._difficultyBeatmapSets[0]._difficultyBeatmaps[info._difficultyBeatmapSets[0]._difficultyBeatmaps.length - 1]._noteJumpMovementSpeed;
    this.speed = info._difficultyBeatmapSets[0]._difficultyBeatmaps[0]._noteJumpMovementSpeed;
    this.totalNotesCount = map._notes.reduce((acc, note) => (note._type !== 3 ? acc + 1 : acc), 0);

    // load only first blocks
    for (const item of this._sortedBlocks) {
      if (item._time > BLOCK_SPAWN_POSITION) break;
      this.pushBlock(item, true);
      this._cursor++;
    }
    // load only first blocks
    for (const item of this._sortedWalls) {
      // if (item._time > BLOCK_SPAWN_POSITION) break;
      this.pushWall(item, true);
      this._wallsCursor++;
    }
  }

  onMapPlay() {
    this.state = 'map-playing';

    this.onPlay?.();
  }

  onMapReady() {
    this.state = 'map-loaded';
  }

  onMapEnd() {
    this.state = 'map-end';
  }

  getLastBlockTime() {
    if (this.blocks.length === 0) return 0;
    return this.blocks[this.blocks.length - 1].time;
  }

  onCollision(_block: BlockModel, shouldCount: boolean, hand: 'left' | 'right') {
    if (shouldCount) {
      this.hitCount++;
    }

    this.sabers.onHitVibration(hand);
  }

  calculateCollisions(hand: 'left' | 'right') {
    const blocksToTest = this.blocks.filter((block) => block.canTestCollision && !block.hasBeenHit);
    if (blocksToTest.length === 0) return;

    const boundingBox = this.sabers.getBoundingBox(hand);

    if (!boundingBox) return;

    blocksToTest.forEach((block) => {
      const isCorrectHand = (block.type === 0 && hand === 'left') || (block.type === 1 && hand === 'right');

      block.testCollision(boundingBox, isCorrectHand, hand);
    });
  }
}

export const gameStore = new GameStore();
