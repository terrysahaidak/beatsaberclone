import * as THREE from 'three';
import { ArrowDirection } from './utils';
import { VALID_POSITIONS } from './constants';

let _id = 0;
export class BoxModel {
  canTestCollision: boolean = false;

  direction: ArrowDirection;
  gridPosition: number;
  delay: number;
  hand: 'left' | 'right';
  boxBoundingBox: THREE.Box3;

  collisionCallbacks: Set<{ id: number; callback: () => void }> = new Set();

  constructor({ direction, gridPosition, delay, hand }: { direction: ArrowDirection; gridPosition: number; delay: number; hand: 'left' | 'right' }) {
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
  boxes: BoxModel[] = [];

  saberBoxBoundingBoxes = new THREE.Box3();

  constructor() {
    this.boxes = [
      new BoxModel({ direction: 'left', gridPosition: VALID_POSITIONS[0], delay: 0, hand: 'left' }),
      new BoxModel({ direction: 'right', gridPosition: VALID_POSITIONS[3], delay: 1000, hand: 'right' }),
      new BoxModel({ direction: 'up', gridPosition: VALID_POSITIONS[4], delay: 2000, hand: 'left' }),
      new BoxModel({ direction: 'down', gridPosition: VALID_POSITIONS[7], delay: 500, hand: 'right' }),
    ];
  }

  calculateCollisions(hand: 'left' | 'right', saberMesh: THREE.Mesh) {
    const shouldTest = this.boxes.some((box) => box.canTestCollision);
    if (!shouldTest) return;

    saberMesh.updateMatrixWorld();

    this.saberBoxBoundingBoxes.setFromObject(saberMesh);

    this.boxes.forEach((box) => {
      box.testCollision(this.saberBoxBoundingBoxes, box.hand === hand);
    });
  }
}

export const gameStore = new GameStore();
