import * as THREE from 'three';
import { Beatmap, BeatmapInfo, Direction } from '../types';
import { makeObservable, observable } from 'mobx';

import { Howl } from 'howler';
import { BlockModel } from './BlockModel';

export class GameStore {
  blocks: BlockModel[] = [
    // block testing
    //   new BlockModel({ index: 0, layer: 0, cutDirection: Direction.UP, type: 0, time: 0 }),
    //   new BlockModel({ index: 1, layer: 0, cutDirection: Direction.DOWN, type: 1, time: 0 }),
    //   new BlockModel({ index: 2, layer: 0, cutDirection: Direction.LEFT, type: 0, time: 0 }),
    //   new BlockModel({ index: 3, layer: 0, cutDirection: Direction.RIGHT, type: 1, time: 0 }),
    //   new BlockModel({ index: 0, layer: 1, cutDirection: Direction.UP_LEFT, type: 0, time: 0 }),
    //   new BlockModel({ index: 1, layer: 1, cutDirection: Direction.UP_RIGHT, type: 1, time: 0 }),
    //   new BlockModel({ index: 2, layer: 1, cutDirection: Direction.DOWN_RIGHT, type: 0, time: 0 }),
    //   new BlockModel({ index: 3, layer: 1, cutDirection: Direction.DOWN_LEFT, type: 1, time: 0 }),
    //   new BlockModel({ index: 0, layer: 2, cutDirection: Direction.ANY, type: 0, time: 0 }),
    //   new BlockModel({ index: 1, layer: 2, cutDirection: Direction.ANY, type: 1, time: 0 }),
    //   new BlockModel({ index: 2, layer: 2, cutDirection: Direction.ANY, type: 0, time: 0 }),
    //   new BlockModel({ index: 3, layer: 2, cutDirection: Direction.ANY, type: 1, time: 0 }),
  ];

  saberBoxBoundingBoxes = new THREE.Box3();

  currentTime = 0;
  songBpm = 0;
  duration = 0;

  howl: Howl | null = null;

  constructor() {
    makeObservable(this, {
      blocks: observable,
    });
  }

  loadSong(url: string, info: BeatmapInfo, map: Beatmap): Promise<boolean> {
    const sorted = map._notes.sort((a, b) => a._time - b._time);
    this.songBpm = info._beatsPerMinute;

    const lastTime = sorted[sorted.length - 1]._time;

    // console.log((lastTime * 60) / this.songBpm);

    for (const note of sorted) {
      if (this.blocks.length > 30) break;

      this.blocks.push(
        new BlockModel({
          index: note._lineIndex,
          layer: note._lineLayer,
          cutDirection: note._cutDirection as Direction,
          type: note._type,
          time: note._time,
        })
      );
    }

    return new Promise((resolve) => {
      this.howl = new Howl({
        src: url,
        onload: () => {
          this.duration = this.howl!.duration();
          resolve(true);
        },
      });
    });
  }

  play() {
    this.howl?.play();
  }

  // get duration() {
  //   return 60 / this.songBpm;
  // }

  getLastBlockTime() {
    return this.blocks[this.blocks.length - 1].time;
  }

  calculateCollisions(hand: 'left' | 'right', saberMesh: THREE.Mesh) {
    const shouldTest = this.blocks.some((box) => box.canTestCollision);
    if (!shouldTest) return;

    saberMesh.updateMatrixWorld();

    this.saberBoxBoundingBoxes.setFromObject(saberMesh);

    this.blocks.forEach((box) => {
      box.testCollision(this.saberBoxBoundingBoxes, box.type === 0 && hand === 'left');
    });
  }
}

export const gameStore = new GameStore();
