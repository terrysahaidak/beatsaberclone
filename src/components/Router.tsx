import { observer } from 'mobx-react';
import { gameStore } from '../store/store';
import { Map } from './Map';
import { Menu } from './Menu';

export const Router = observer(function Router() {
  switch (gameStore.state) {
    case 'loading':
      return null;
    case 'menu':
      return <Menu text="Press trigger to start" />;
    case 'loading-map':
    case 'playing':
    case 'pause':
      return <Map />;
  }
});
