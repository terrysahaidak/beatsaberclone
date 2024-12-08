import { Text } from '@react-three/drei';
import { XROrigin } from '@react-three/xr';
import { observer } from 'mobx-react';
import BeatSaverAPI from 'beatsaver-api';
import { useEffect } from 'react';

const api = new BeatSaverAPI({
  AppName: 'Application Name',
  Version: '1.0.0',
});

export const Menu = observer(function Menu({ text }: { text: string }) {
  useEffect(() => {
    api.searchMaps({ q: 'attack on titan', sortOrder: 'Rating' }).then((maps) => {
      console.log(maps);
    });
  }, []);

  return (
    <XROrigin>
      <Text color={0xffa276} fontSize={0.3} position={[0, 2, -3]}>
        {text}
      </Text>
    </XROrigin>
  );
});
