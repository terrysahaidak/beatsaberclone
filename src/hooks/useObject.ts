// github.com/bsmg/beatmapper/blob/116b619fc8d8ca0b1fb1539472dd0536a72332cf/src/hooks/use-object.hook.ts
import { useState } from 'react';
import type { Group, Object3DEventMap } from 'three';
import { OBJLoader } from 'three-stdlib';

const loadingMap: Record<string, Promise<Group<Object3DEventMap>>> = {};

export function useObject(path: string) {
  const [loadedObject, setLoadedObject] = useState<Group<Object3DEventMap> | null>(null);

  // `existing` will be a promise that resolves once the object is loaded,
  // IF this object has already started being loaded.
  const existing = loadingMap[path];

  if (!existing) {
    // If this is the first request for the object, start loading it.
    loadingMap[path] = new Promise((resolve) => {
      new OBJLoader().load(path, (result) => {
        resolve(result);
      });
    });
  }

  loadingMap[path]
    .then((result) => {
      setLoadedObject(result);
    })
    .catch((err) => console.error('Could not load object', err));

  return loadedObject;
}
