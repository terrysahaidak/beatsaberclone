import * as THREE from 'three';
import { observer } from 'mobx-react';
import { WallModel } from '../store/WallModel';

export const Wall = observer(function Wall({ model }: { model: WallModel }) {
  const geometry = new THREE.BoxGeometry(model.width, model.height, model.depth);

  return (
    <group position={[model.x, model.y, model.z]}>
      <mesh>
        <boxGeometry args={[model.width, model.height, model.depth]} />
        <meshBasicMaterial color="red" transparent={true} opacity={0.5} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="black" />
      </lineSegments>
    </group>
  );
});
