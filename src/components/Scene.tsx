import { observer } from 'mobx-react';
import { gameStore } from '../store/store';
import { Block } from './Block';
import { animated, useSpring } from '@react-spring/three';
import { useEffect } from 'react';
import { XROrigin } from '@react-three/xr';

export const Scene = observer(function Snece() {
  const [springs, api] = useSpring(() => ({
    from: {
      position: 0,
    },
    to: {
      position: gameStore.duration,
    },
    loop: true,
    config: {
      duration: (gameStore.duration * 1000 * 60) / gameStore.songBpm,
    },
    onChange: (result) => {
      // Only update blocks that are in view or approaching
      const currentPosition = result.value.position;
    },
  }));

  useEffect(() => {
    console.log('starting', gameStore.duration);
    console.log(gameStore.blocks.length);

    setTimeout(() => {
      gameStore.play();
      api.start();
    }, 2000);
  }, []);

  return (
    <XROrigin>
      <animated.group position={springs.position.to((v) => [0, 1.2, v])}>
        {gameStore.blocks.map((block) => (
          <Block key={block.id.toString()} model={block} />
        ))}
      </animated.group>
    </XROrigin>
  );
});
