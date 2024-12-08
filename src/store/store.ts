import SabersStore from './SabersStore';
import { CurrentSongStore } from './CurrentSong';
import { action, makeObservable, observable } from 'mobx';

export class GameStore {
  state: 'loading' | 'menu' | 'map-pause' | 'map-playing' | 'map-loading' | 'map-loaded' | 'map-end' = 'loading';

  sabers: SabersStore;
  currentSong: CurrentSongStore;

  constructor() {
    this.sabers = new SabersStore(this);
    this.currentSong = new CurrentSongStore(this);

    makeObservable(this, {
      state: observable,
      onTriggerPress: action,
      setState: action,
    });
  }

  onReady() {
    this.state = 'menu';
  }

  setState(state: GameStore['state']) {
    this.state = state;
  }

  onTriggerPress() {
    console.log('on trigger', this.state);

    if (this.state === 'menu') {
      this.state = 'map-loading';
    } else if (this.state === 'map-playing') {
      this.state = 'map-pause';

      this.currentSong.onPause?.();
    } else if (this.state === 'map-pause') {
      this.state = 'map-playing';

      this.currentSong.onReset?.();
    } else if (this.state === 'map-loaded') {
      this.currentSong.onMapPlay();
    }
  }
}

export const gameStore = new GameStore();
