import * as THREE from 'three';
import { Direction } from '../types';
import { roundAwayFloatingPointNonsense } from '../utils';
import { GameStore } from './store';

let _id = 0;
export class BlockModel {
  root: GameStore;

  canTestCollision: boolean = false;
  hasBeenHit: boolean = false;

  id: number;
  cutDirection: Direction;
  index: number;
  layer: number;
  type: number;
  time: number;

  onCollisionCallback = () => {};

  boxBoundingBox: THREE.Box3;
  collisionCallbacks: Set<{ id: number; callback: () => void }> = new Set();

  constructor(
    { index, layer, cutDirection, type, time }: { index: number; layer: number; cutDirection: Direction; type: number; time: number },
    root: GameStore
  ) {
    this.id = _id++;

    this.boxBoundingBox = new THREE.Box3();

    this.cutDirection = cutDirection;
    this.index = index;
    this.layer = layer;
    this.type = type;
    this.time = roundAwayFloatingPointNonsense(time);

    this.root = root;
  }

  calculateBoundingBox(mesh: THREE.Mesh) {
    mesh.updateMatrixWorld();
    this.boxBoundingBox.setFromObject(mesh);
  }

  testCollision(saberBox: THREE.Box3) {
    if (!this.canTestCollision || this.hasBeenHit) return;

    const intersects = this.boxBoundingBox.intersectsBox(saberBox);
    if (intersects) {
      this.hasBeenHit = true;
      this.onCollisionCallback();

      this.root.onCollision(this);
    }
  }

  setOnCollisionCallback(callback: () => void) {
    this.onCollisionCallback = callback;
  }
}
