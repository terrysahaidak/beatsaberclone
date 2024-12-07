import { observer } from 'mobx-react';
import { gameStore } from '../store/store';
import { Wall } from './Wall';

export const Walls = observer(function Walls() {
  return (
    <>
      {gameStore.walls.map((item) => (
        <Wall key={item.id.toString()} model={item} />
      ))}
    </>
  );
});
