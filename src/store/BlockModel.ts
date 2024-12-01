import * as THREE from 'three';
import { Direction } from '../types';
import { roundAwayFloatingPointNonsense } from '../utils';

let _id = 0;
export class BlockModel {
  canTestCollision: boolean = false;

  id: number;
  cutDirection: Direction;
  index: number;
  layer: number;
  type: number;
  time: number;

  boxBoundingBox: THREE.Box3;
  collisionCallbacks: Set<{ id: number; callback: () => void }> = new Set();

  constructor({ index, layer, cutDirection, type, time }: { index: number; layer: number; cutDirection: Direction; type: number; time: number }) {
    this.id = _id++;

    this.boxBoundingBox = new THREE.Box3();

    this.cutDirection = cutDirection;
    this.index = index;
    this.layer = layer;
    this.type = type;
    this.time = roundAwayFloatingPointNonsense(time);
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
