import { Canvas } from '@react-three/fiber';
import { createXRStore, XR, XROrigin } from '@react-three/xr';
import { Physics } from '@react-three/cannon';
import { FloorCross } from './components/FloorCross';
import { SaberMesh } from './components/Saber';
import { Scene } from './components/Scene';
import { useState } from 'react';
import { BLADE_POSITION } from './constants';
import { gameStore } from './store/store';
import song from './assets/demo/song.ogg?url';
import songMap from './assets/demo/Normal.json';
import info from './assets/demo/Info.json';
import { Beatmap } from './types';

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

export default function App() {
  const [isReady, setIsReady] = useState(false);

  async function enterAR() {
    if (gameStore.howl) return;

    xrStore.enterAR();

    await gameStore.loadSong(song, info, songMap as Beatmap);
    setIsReady(true);
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

              {isReady && <Scene />}
            </XROrigin>
          </XR>
        </Physics>
      </Canvas>
    </>
  );
}
