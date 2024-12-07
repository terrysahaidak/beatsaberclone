import { Canvas } from '@react-three/fiber';
import { createXRStore, XR, XROrigin, XRSpace } from '@react-three/xr';
import { Physics } from '@react-three/cannon';
import { FloorCross } from './components/FloorCross';
import { SaberMesh } from './components/Saber';
import { BLADE_POSITION, BLADE_ROTATION } from './constants';
import { gameStore } from './store/store';
import { observer } from 'mobx-react';
import { Router } from './components/Router';

const xrStore = createXRStore({
  controller: {
    right: () => {
      // const { rotation, position } = useComponentControls('Saber', BLADE_POSITION, BLADE_ROTATION);

      return (
        <>
          <XRSpace space="grip-space">
            <SaberMesh isRightHand position={BLADE_POSITION} rotation={BLADE_ROTATION} />
          </XRSpace>
          {/* <XRControllerModel /> */}
        </>
      );
    },
    left: () => {
      return (
        <XRSpace space="grip-space">
          <SaberMesh isRightHand={false} position={BLADE_POSITION} rotation={BLADE_ROTATION} />
        </XRSpace>
      );
    },
  },
  handTracking: false,
});

const App = observer(function App() {
  function enterAR() {
    if (gameStore.state !== 'loading') {
      return;
    }

    xrStore.enterAR();

    gameStore.onReady();
  }

  // useEffect(() => {
  // setTimeout(() => {
  //   enterAR();
  // }, 500);
  // }, []);

  return (
    <>
      {gameStore.state === 'loading' && (
        <button className="vr-button" onClick={enterAR}>
          Enter AR
        </button>
      )}
      <Canvas camera={{ fov: 45 }}>
        <Physics>
          <XR store={xrStore}>
            <XROrigin>
              <directionalLight position={[5, 5, 5]} intensity={3} />

              <FloorCross />

              <Router />

              {/* <DebugGrid /> */}
            </XROrigin>
          </XR>
        </Physics>
      </Canvas>
    </>
  );
});

export default App;
