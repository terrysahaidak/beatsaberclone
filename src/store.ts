import * as THREE from 'three';
import { Direction, VALID_POSITIONS } from './constants';

let _id = 0;
export class BlockModel {
  canTestCollision: boolean = false;

  direction: Direction;
  gridPosition: number;
  delay: number;
  hand: 'left' | 'right';
  boxBoundingBox: THREE.Box3;

  collisionCallbacks: Set<{ id: number; callback: () => void }> = new Set();

  constructor({ direction, gridPosition, delay, hand }: { direction: Direction; gridPosition: number; delay: number; hand: 'left' | 'right' }) {
    this.boxBoundingBox = new THREE.Box3();

    this.direction = direction;
    this.gridPosition = gridPosition;
    this.delay = delay;
    this.hand = hand;
  }

  calculateBoxBoundingBox(mesh: THREE.Mesh) {
    mesh.updateMatrixWorld();
    this.boxBoundingBox.setFromObject(mesh);
  }

  testCollision(saberBox: THREE.Box3, isRightHand: boolean) {
    if (!this.canTestCollision) return;

    const intersects = this.boxBoundingBox.intersectsBox(saberBox);
    if (intersects) {
      this.collisionCallbacks.forEach((listener) => listener.callback());
    }
  }

  onCollision(callback: () => void) {
    const listener = {
      id: _id++,
      callback,
    };

    this.collisionCallbacks.add(listener);

    return () => {
      this.collisionCallbacks.delete(listener);
    };
  }
}

export class GameStore {
  blocks: BlockModel[] = [];

  saberBoxBoundingBoxes = new THREE.Box3();

  constructor() {
    this.blocks = [
      new BlockModel({ direction: Direction.DOWN_LEFT, gridPosition: VALID_POSITIONS[0], delay: 0, hand: 'left' }),
      new BlockModel({ direction: Direction.RIGHT, gridPosition: VALID_POSITIONS[3], delay: 1000, hand: 'right' }),
      new BlockModel({ direction: Direction.UP, gridPosition: VALID_POSITIONS[4], delay: 2000, hand: 'left' }),
      new BlockModel({ direction: Direction.DOWN, gridPosition: VALID_POSITIONS[7], delay: 500, hand: 'right' }),
    ];
  }

  calculateCollisions(hand: 'left' | 'right', saberMesh: THREE.Mesh) {
    const shouldTest = this.blocks.some((box) => box.canTestCollision);
    if (!shouldTest) return;

    saberMesh.updateMatrixWorld();

    this.saberBoxBoundingBoxes.setFromObject(saberMesh);

    this.blocks.forEach((box) => {
      box.testCollision(this.saberBoxBoundingBoxes, box.hand === hand);
    });
  }
}

export const gameStore = new GameStore();
