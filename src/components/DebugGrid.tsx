import * as THREE from 'three';
import { GRID_CELL_SIZE, GRID_PADDING, GRID_X } from '../constants';

function GridCell({ index, layer }: { index: number; layer: number }) {
  const geometry = new THREE.PlaneGeometry(GRID_CELL_SIZE, GRID_CELL_SIZE);

  const x = index * GRID_CELL_SIZE;
  const y = layer * GRID_CELL_SIZE;

  return (
    <lineSegments position={[x, y, 0]}>
      <edgesGeometry args={[geometry]} />
      <lineBasicMaterial color="white" />
    </lineSegments>
  );
}

export function DebugGrid({ position }: { position?: THREE.Vector3Tuple }) {
  return (
    <group position={position ?? [GRID_X, GRID_PADDING, -8]}>
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
