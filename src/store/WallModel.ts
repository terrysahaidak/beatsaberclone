import { GameStore } from './store';
import { BLOCK_COLUMN_WIDTH, BOX_SIZE } from '../constants';

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
      return this.props.index * BLOCK_COLUMN_WIDTH - BLOCK_COLUMN_WIDTH * 1.5;
    } else {
      return 0;
    }
  }

  get y() {
    switch (this.props.type) {
      case 0:
        return BLOCK_COLUMN_WIDTH / 2;
      case 1:
        return BLOCK_COLUMN_WIDTH;
      default:
        return;
    }
  }

  get z() {
    const timeInSeconds = (this.props.time * 60) / this.root.bpm;

    return timeInSeconds * this.root.speed * -1;
  }

  get width() {
    return (this.props.width - 1) * BLOCK_COLUMN_WIDTH + BOX_SIZE;
  }

  get height() {
    switch (this.props.type) {
      case 0:
        return 3 * BLOCK_COLUMN_WIDTH + BOX_SIZE;
      default:
        return BOX_SIZE;
    }
  }

  get depth() {
    return (this.props.duration * 60) / this.root.bpm;
  }
}
