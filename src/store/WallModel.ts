import { GameStore } from './store';
import { GRID_CELL_SIZE, GRID_PADDING } from '../constants';

let _id = 0;

interface WallProps {
  time: number;
  index: number;
  duration: number;
  width: number;
  type: number;
  initial: boolean;
}
export class WallModel {
  root: GameStore;

  id: number;

  props: WallProps;

  constructor(props: WallProps, root: GameStore) {
    this.props = props;

    this.id = _id++;
    this.root = root;
  }

  get x() {
    if (this.props.type === 0) {
      return this.props.index * GRID_CELL_SIZE;
    } else {
      return GRID_PADDING + GRID_CELL_SIZE;
    }
  }

  get y() {
    switch (this.props.type) {
      case 0:
        return 0.6;
      case 1:
        return GRID_CELL_SIZE * 4 - GRID_PADDING;
      default:
        return 0;
    }
  }

  get z() {
    const timeInSeconds = (this.props.time * 60) / this.root.currentSong.bpm;

    return timeInSeconds * this.root.currentSong.speed * -1;
  }

  get width() {
    return this.props.width * GRID_CELL_SIZE;
  }

  get height() {
    switch (this.props.type) {
      case 0:
        return 5 * GRID_CELL_SIZE;
      default:
        return GRID_CELL_SIZE * 4;
    }
  }

  get depth() {
    return (this.props.duration * 60) / this.root.currentSong.bpm;
  }
}
