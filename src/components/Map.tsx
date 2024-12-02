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
      position: 0,
    },
    onChange: (result) => {
      gameStore.setCurrentPosition(result.value.position);
    },
  }));

  console.log(gameStore.state);

  useEffect(() => {
    const run = async () => {
      gameStore.loadMap(info, songMap as Beatmap);

      const audio = await loadAudio(song);

      const duration = audio.duration();

      console.log('Starting song, duration:', duration);
      console.log('Total blocks:', gameStore.blocks.length);
      console.log('Last block time:', gameStore.getLastBlockTime());

      const endPosition = (duration / 60) * gameStore.songBpm;

      console.log('End position:', endPosition);

      audio.once('end', () => {
        gameStore.onMapEnd();
      });

      gameStore.setOnMapPlay(() => {
        audio.play();
        console.log('on play');
        api.start({
          config: {
            duration: duration * 1000,
          },
          to: {
            position: endPosition,
          },
        });
      });

      gameStore.setOnMapPause(() => {
        audio.pause();
        api.stop();
      });

      gameStore.setOnMapReset(() => {
        audio.stop();

        api.set({ position: 0 });
        requestAnimationFrame(() => {
          gameStore.onMapPlay();
        });
      });

      gameStore.onMapReady();
    };

    run();

    return () => {
      gameStore.howl?.stop();
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

      {(gameStore.state === 'map-playing' || gameStore.state === 'map-pause') && (
        <animated.group position={styles.position.to((v) => [0, 1.2, v])}>
          <Blocks />
        </animated.group>
      )}

      {gameStore.state === 'map-end' && (
        <Text color={0xffa276} fontSize={0.3} position={[0, 2, -3]}>
          Song ended
        </Text>
      )}

      {gameStore.state === 'map-pause' && (
        <Text color={0xffa276} fontSize={0.3} position={[0, 2, -3]}>
          Press again to reset
        </Text>
      )}
    </XROrigin>
  );
});
