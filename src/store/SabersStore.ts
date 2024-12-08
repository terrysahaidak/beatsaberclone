import { action, makeObservable, observable } from 'mobx';
import * as THREE from 'three';
import { GameStore } from './store';

class SabersStore {
  leftSaberMesh: THREE.Mesh | null = null;
  rightSaberMesh: THREE.Mesh | null = null;

  rightSaberBoxBoundingBoxes: THREE.Box3;
  leftSaberBoxBoundingBoxes: THREE.Box3;
  sabersCollided: boolean = false;

  // Reusable objects for calculations
  private readonly centerVector = new THREE.Vector3();
  private readonly cross = new THREE.Vector3();
  private readonly rightWorldPos = new THREE.Vector3();
  private readonly leftWorldPos = new THREE.Vector3();
  private readonly rightDir = new THREE.Vector3();
  private readonly leftDir = new THREE.Vector3();
  private readonly intersectionPoint1 = new THREE.Vector3();
  private readonly intersectionPoint2 = new THREE.Vector3();
  private readonly temp = new THREE.Vector3();
  private readonly tempQuat = new THREE.Quaternion();
  private readonly tempMatrix = new THREE.Matrix4();
  private readonly localUp = new THREE.Vector3(0, 1, 0);

  _leftHapticActuator: GamepadHapticActuator | null = null;
  _rightHapticActuator: GamepadHapticActuator | null = null;

  root: GameStore;

  constructor(root: GameStore) {
    this.root = root;

    this.rightSaberBoxBoundingBoxes = new THREE.Box3();
    this.leftSaberBoxBoundingBoxes = new THREE.Box3();

    makeObservable(this, {
      sabersCollided: observable,
      calculateCollisions: action,
    });
  }

  setSaber(hand: 'left' | 'right', saberMesh: THREE.Mesh) {
    if (hand === 'left') {
      this.leftSaberMesh = saberMesh;
    } else {
      this.rightSaberMesh = saberMesh;
    }
  }

  setHapticActuator(hand: 'left' | 'right', actuator: GamepadHapticActuator) {
    if (hand === 'left') {
      this._leftHapticActuator = actuator;
    } else {
      this._rightHapticActuator = actuator;
    }
  }

  onHitVibration(hand: 'left' | 'right') {
    if (hand === 'left' && this._leftHapticActuator) {
      this._leftHapticActuator.pulse(1.0, 50);
    } else if (hand === 'right' && this._rightHapticActuator) {
      this._rightHapticActuator.pulse(1.0, 50);
    }
  }

  getBoundingBox(hand: 'left' | 'right') {
    if (hand === 'left') {
      if (!this.leftSaberMesh) {
        return null;
      }

      this.leftSaberMesh!.updateMatrixWorld(true);

      this.leftSaberBoxBoundingBoxes.setFromObject(this.leftSaberMesh);

      return this.leftSaberBoxBoundingBoxes;
    }

    if (!this.rightSaberMesh) {
      return null;
    }

    this.rightSaberMesh!.updateMatrixWorld(true);

    this.rightSaberBoxBoundingBoxes.setFromObject(this.rightSaberMesh);

    return this.rightSaberBoxBoundingBoxes;
  }

  calculateCollisions(hand: 'left' | 'right') {
    this.getBoundingBox(hand);

    if (!this.rightSaberBoxBoundingBoxes.intersectsBox(this.leftSaberBoxBoundingBoxes)) {
      this.sabersCollided = false;
      return { intersects: false, point1: null, point2: null };
    }

    // Precise cylinder intersection check
    const result = this.checkCylinderIntersection();
    this.sabersCollided = result.intersects;

    return result;
  }

  private getSaberDirection(mesh: THREE.Mesh, target: THREE.Vector3) {
    // Extract rotation from world matrix
    this.tempMatrix.copy(mesh.matrixWorld);
    this.tempQuat.setFromRotationMatrix(this.tempMatrix);

    // Transform local up vector by mesh's rotation
    return target.copy(this.localUp).applyQuaternion(this.tempQuat).normalize();
  }

  private getSaberPosition(mesh: THREE.Mesh, target: THREE.Vector3) {
    // Get world position including all transformations
    mesh.getWorldPosition(target);

    // Adjust for cylinder center (assuming cylinder is centered on local Y axis)
    const height = 1.2; // cylinder height
    this.temp
      .copy(this.localUp)
      .applyQuaternion(this.tempQuat)
      .multiplyScalar(height * 0.5);
    target.add(this.temp);

    return target;
  }

  private checkCylinderIntersection(): {
    intersects: boolean;
    point1: THREE.Vector3 | null;
    point2: THREE.Vector3 | null;
  } {
    if (!this.leftSaberMesh || !this.rightSaberMesh) {
      return { intersects: false, point1: null, point2: null };
    }

    // Get current positions and directions in world space
    this.getSaberPosition(this.rightSaberMesh, this.rightWorldPos);
    this.getSaberPosition(this.leftSaberMesh, this.leftWorldPos);
    this.getSaberDirection(this.rightSaberMesh, this.rightDir);
    this.getSaberDirection(this.leftSaberMesh, this.leftDir);

    // Vector between cylinder centers
    this.centerVector.subVectors(this.leftWorldPos, this.rightWorldPos);

    // Constants
    const radius = 0.03;
    const length = 1.2;
    const radiusSum = radius * 2;

    // Calculate cross product for cylinder axes
    this.cross.crossVectors(this.rightDir, this.leftDir);
    const sinTheta = this.cross.length();

    // Handle parallel cylinders
    if (sinTheta < 1e-8) {
      const separation = this.centerVector.length();
      const projectedSep = Math.abs(this.centerVector.dot(this.rightDir));

      if (separation <= radiusSum && projectedSep <= length) {
        this.intersectionPoint1.copy(this.rightWorldPos);
        this.intersectionPoint2.copy(this.leftWorldPos);
        return {
          intersects: true,
          point1: this.intersectionPoint1.clone(),
          point2: this.intersectionPoint2.clone(),
        };
      }
      return { intersects: false, point1: null, point2: null };
    }

    // Non-parallel cylinders
    this.cross.normalize();
    const dist = Math.abs(this.centerVector.dot(this.cross));

    if (dist > radiusSum) {
      return { intersects: false, point1: null, point2: null };
    }

    // Find closest points on the cylinder axes
    const m1 = this.rightDir.dot(this.leftDir);
    const m2 = this.rightDir.dot(this.centerVector);
    const m3 = this.leftDir.dot(this.centerVector);

    const denom = 1 - m1 * m1;

    // Calculate parameters for closest points
    const t1 = (m2 - m1 * m3) / denom;
    const t2 = (m1 * m2 - m3) / denom;

    // Check if closest points are within cylinder lengths
    if (Math.abs(t1) > length / 2 || Math.abs(t2) > length / 2) {
      return { intersects: false, point1: null, point2: null };
    }

    // Calculate intersection points
    this.intersectionPoint1.copy(this.rightDir).multiplyScalar(t1).add(this.rightWorldPos);
    this.intersectionPoint2.copy(this.leftDir).multiplyScalar(t2).add(this.leftWorldPos);

    return {
      intersects: true,
      point1: this.intersectionPoint1.clone(),
      point2: this.intersectionPoint2.clone(),
    };
  }
}

export default SabersStore;
