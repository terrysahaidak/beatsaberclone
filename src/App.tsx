import { Canvas } from '@react-three/fiber';
import { createXRStore, XR, XROrigin } from '@react-three/xr';
import { Physics } from '@react-three/cannon';
import { gameStore } from './store';
import { Box } from './components/Box';
import { FloorCross } from './components/FloorCross';
import { SaberMesh } from './components/Saber';

export const xrStore = createXRStore({
  controller: {
    right: () => {
      return <SaberMesh isRightHand position={[0, 0.24, -0.21]} rotation={[2.35, 0, 0]} />;
    },
    left: () => {
      return <SaberMesh isRightHand={false} position={[0, 0.24, -0.21]} rotation={[2.35, 0, 0]} />;
    },
  },
});

export default function App() {
  return (
    <>
      <button className="vr-button" onClick={() => xrStore.enterAR()}>
        Enter AR
      </button>
      <Canvas camera={{ fov: 45 }}>
        <Physics>
          <XR store={xrStore}>
            <XROrigin>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
              <directionalLight position={[-5, 5, -5]} intensity={0.5} />

              <FloorCross />

              {gameStore.boxes.map((box) => (
                <Box key={box.gridPosition} model={box} />
              ))}
            </XROrigin>
          </XR>
        </Physics>
      </Canvas>
    </>
  );
}
