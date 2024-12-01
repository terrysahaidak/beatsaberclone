import { useControls } from 'leva';

export function useComponentControls(
  name: string,
  position?: [number, number, number],
  rotation?: [number, number, number]
): {
  position: [number, number, number];
  rotation: [number, number, number];
} {
  const { pos, rot } = useControls(name, {
    pos: {
      x: position?.[0] ?? 0,
      y: position?.[1] ?? 0,
      z: position?.[2] ?? 0,
    },
    rot: {
      x: rotation?.[0] ?? 0,
      y: rotation?.[1] ?? 0,
      z: rotation?.[2] ?? 0,
    },
  });

  return { position: [pos.x, pos.y, pos.z], rotation: [rot.x, rot.y, rot.z] };
}
