import { observer } from 'mobx-react';
import { gameStore } from '../store/store';
import { Block } from './Block';

export const Blocks = observer(function Blocks() {
  return (
    <>
      {gameStore.blocks.map((block) => (
        <Block key={block.id.toString()} model={block} />
      ))}
    </>
  );
});
