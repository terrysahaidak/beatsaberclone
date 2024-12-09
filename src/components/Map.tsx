import { observer } from 'mobx-react';
import { gameStore } from '../store/store';
import { animated, useSpring } from '@react-spring/three';
import { useEffect } from 'react';
import { XROrigin } from '@react-three/xr';
import { Text } from '@react-three/drei';
import song from '../assets/demo/song.ogg?url';
import songMap from '../assets/demo/Normal.json';
import info from '../assets/demo/Info.json';
import { Beatmap } from '../types';
import { Howl } from 'howler';
import { Blocks } from './Blocks';
import { GRID_PADDING, GRID_X, PLAYER_Y_OFFSET, SONG_OFFSET } from '../constants';
import { Walls } from './Walls';
import { PauseMenu } from './ui/PauseMenu';

const loadAudio = (url: string): Promise<Howl> => {
  return new Promise((resolve) => {
    const howler = new Howl({
      src: url,
      onload: () => resolve(howler),
    });
  });
};

export const Map = observer(function Map() {
  const [styles, api] = useSpring(() => ({
    from: {
      position: -SONG_OFFSET,
    },
    onChange: (result) => {
      gameStore.currentSong.setCurrentPosition(result.value.position);
    },
  }));

  console.log(gameStore.state);

  useEffect(() => {
    let audio: Howl;

    const run = async () => {
      gameStore.currentSong.loadMap(info, songMap as Beatmap);

      audio = await loadAudio(song);

      const duration = audio.duration();

      console.log('Starting song, duration:', duration);
      console.log('Total blocks:', gameStore.currentSong.blocks.length);
      console.log('Last block time:', gameStore.currentSong.getLastBlockTime());

      const endPosition = duration * gameStore.currentSong.speed;

      console.log('End position:', endPosition);

      audio.once('end', () => {
        gameStore.currentSong.onMapEnd();
      });

      gameStore.currentSong.setOnMapPlay(() => {
        audio.play();
        console.log('on play');
        api.start({
          config: {
            duration: duration * 1000,
          },
          from: {
            position: 0,
          },
          to: {
            position: endPosition,
          },
        });
      });

      gameStore.currentSong.setOnMapPause(() => {
        audio.pause();
        api.stop();
      });

      gameStore.currentSong.setOnMapReset(() => {
        audio.stop();

        api.set({ position: -SONG_OFFSET });
        requestAnimationFrame(() => {
          gameStore.currentSong.onMapPlay();
        });
      });

      gameStore.currentSong.onMapReady();
    };

    run();

    return () => {
      audio?.stop();
      audio?.unload();
    };
  }, []);

  return (
    <XROrigin>
      {gameStore.state === 'map-loading' && (
        <Text color={0xffa276} fontSize={0.3} position={[0, 2, -3]}>
          Loading...
        </Text>
      )}
      {gameStore.state === 'map-loaded' && (
        <Text color={0xffa276} fontSize={0.3} position={[0, 2, -3]}>
          Press trigger to start
        </Text>
      )}
      <group position-x={GRID_X} position-y={GRID_PADDING + PLAYER_Y_OFFSET}>
        {(gameStore.state === 'map-playing' || gameStore.state === 'map-pause') && (
          <animated.group position-z={styles.position.to((v) => v - SONG_OFFSET)}>
            <Blocks />
            <Walls />
          </animated.group>
        )}

        {/* <DebugGrid position={[0, 0, -8]} /> */}
      </group>
      {gameStore.state === 'map-end' && (
        <Text color={0xffa276} fontSize={0.3} position={[0, 2, -3]}>
          Song ended ({gameStore.currentSong.hitCount}/{gameStore.currentSong.totalNotesCount})
        </Text>
      )}
      {gameStore.state === 'map-pause' && <PauseMenu />}
    </XROrigin>
  );
});
