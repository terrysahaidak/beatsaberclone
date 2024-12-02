import * as THREE from 'three';
import { Beatmap, BeatmapInfo, Direction } from '../types';
import { makeObservable, observable, action } from 'mobx';
import { Howl } from 'howler';
import { BlockModel } from './BlockModel';
import { COLLISION_START_Z } from '../constants';

export class GameStore {
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

  saberBoxBoundingBoxes = new THREE.Box3();

  currentPosition = 0;
  songBpm = 0;
  isPlaying = false;

  howl: Howl | null = null;

  onPlay: (() => void) | null = null;
  onPause: (() => void) | null = null;
  onReset: (() => void) | null = null;

  constructor() {
    makeObservable(this, {
      blocks: observable,
      state: observable,
      onTriggerPress: action,
      onMapPlay: action,
      onMapReady: action,
      onMapEnd: action,
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

  setCurrentPosition(position: number) {
    this.currentPosition = position;

    // Update block states based on current time
    this.blocks.forEach((block) => {
      // Calculate block's current Z position based on time
      const z = block.time - this.currentPosition;

      if (z > 0 && z <= COLLISION_START_Z && !block.hasBeenHit) {
        block.canTestCollision = true;
      } else {
        block.canTestCollision = false;
      }
    });
  }

  loadMap(info: BeatmapInfo, map: Beatmap) {
    const sorted = map._notes.sort((a, b) => a._time - b._time).filter((note) => note._type !== 3);
    this.songBpm = info._beatsPerMinute;

    for (const note of sorted) {
      this.blocks.push(
        new BlockModel(
          {
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

  onCollision(block: BlockModel) {
    console.log('Collision with block', block.id);
  }

  calculateCollisions(hand: 'left' | 'right', saberMesh: THREE.Mesh) {
    const blocksToTest = this.blocks.filter((block) => block.canTestCollision && !block.hasBeenHit);

    if (blocksToTest.length === 0) return;

    saberMesh.updateMatrixWorld();
    this.saberBoxBoundingBoxes.setFromObject(saberMesh);

    blocksToTest.forEach((block) => {
      const isCorrectHand = (block.type === 0 && hand === 'left') || (block.type === 1 && hand === 'right');

      block.testCollision(this.saberBoxBoundingBoxes);
    });
  }
}

export const gameStore = new GameStore();
