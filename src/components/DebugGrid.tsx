import * as THREE from 'three';
import { BOX_SIZE } from '../constants';
import { getPositionForBlock } from '../utils';

function GridCell({ index, layer }: { index: number; layer: number }) {
  const geometry = new THREE.PlaneGeometry(BOX_SIZE, BOX_SIZE);

  const { x, y, z } = getPositionForBlock({
    index,
    layer,
    zPosition: 0,
  });

  return (
    <group position={[x, y, z]}>
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="black" />
      </lineSegments>
    </group>
  );
}

export function DebugGrid() {
  return (
    <group position={[0, 1, 0]}>
      <GridCell index={0} layer={0} />
      <GridCell index={1} layer={0} />
      <GridCell index={2} layer={0} />
      <GridCell index={3} layer={0} />
      <GridCell index={0} layer={1} />
      <GridCell index={1} layer={1} />
      <GridCell index={2} layer={1} />
      <GridCell index={3} layer={1} />
      <GridCell index={0} layer={2} />
      <GridCell index={1} layer={2} />
      <GridCell index={2} layer={2} />
      <GridCell index={3} layer={2} />
    </group>
  );
}
