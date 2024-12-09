import BeatSaverAPI from 'beatsaver-api';
import { GameStore } from './store';
import { makeObservable, observable, runInAction } from 'mobx';
import { MapDetail } from 'beatsaver-api/lib/models/MapDetail';

const api = new BeatSaverAPI({
  AppName: 'Application Name',
  Version: '1.0.0',
});

export class DataStore {
  root: GameStore;

  searchResults: MapDetail[];

  constructor(root: GameStore) {
    this.root = root;

    this.searchResults = [];

    makeObservable(this, {
      searchResults: observable,
    });

    this.getLatestMaps();
  }

  async getLatestMaps() {
    const res = await api.getLatestMaps(false);

    runInAction(() => {
      this.searchResults = res.docs;
    });
  }

  async search(query: string) {
    let items: MapDetail[] = [];

    let from: string | undefined = undefined;

    while (items.length < 10) {
      const res = await api.searchMaps({ q: query, sortOrder: 'Rating', from });

      if (res.docs.length === 0) {
        break;
      }

      items = items.concat(res.docs);

      if (items.length >= 100) {
        break;
      }

      from = res.docs[res.docs.length - 1].id;
    }

    runInAction(() => {
      this.searchResults = items;
      //   this._searchInfo = res.
    });
  }
}
