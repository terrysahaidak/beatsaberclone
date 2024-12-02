import { observer } from 'mobx-react';
import { gameStore } from '../store/store';
import { Block } from './Block';
import { Bomb } from './Bomb';

export const Blocks = observer(function Blocks() {
  return (
    <>
      {gameStore.blocks.map((block) =>
        block.type === 3 ? <Bomb key={block.id.toString()} model={block} /> : <Block key={block.id.toString()} model={block} />
      )}
    </>
  );
});
