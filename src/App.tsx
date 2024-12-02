import { Canvas } from '@react-three/fiber';
import { createXRStore, XR, XROrigin } from '@react-three/xr';
import { Physics } from '@react-three/cannon';
import { FloorCross } from './components/FloorCross';
import { SaberMesh } from './components/Saber';
import { BLADE_POSITION } from './constants';
import { gameStore } from './store/store';
import { observer } from 'mobx-react';
import { Router } from './components/Router';

export const xrStore = createXRStore({
  controller: {
    right: () => {
      return <SaberMesh isRightHand position={BLADE_POSITION} rotation={[2.35, 0, 0]} />;
    },
    left: () => {
      return <SaberMesh isRightHand={false} position={BLADE_POSITION} rotation={[2.35, 0, 0]} />;
    },
  },
  handTracking: false,
});

const App = observer(function App() {
  async function enterAR() {
    if (gameStore.state !== 'loading') {
      return;
    }

    xrStore.enterAR();

    gameStore.onReady();
  }

  return (
    <>
      <button className="vr-button" onClick={enterAR}>
        Enter AR
      </button>
      <Canvas camera={{ fov: 45 }}>
        <Physics>
          <XR store={xrStore}>
            <XROrigin>
              <directionalLight position={[5, 5, 5]} intensity={1} />

              <FloorCross />

              <Router />
            </XROrigin>
          </XR>
        </Physics>
      </Canvas>
    </>
  );
});

export default App;
