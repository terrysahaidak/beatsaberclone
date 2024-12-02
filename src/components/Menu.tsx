import { Text } from '@react-three/drei';
import { XROrigin } from '@react-three/xr';
import { observer } from 'mobx-react';

export const Menu = observer(function Menu({ text }: { text: string }) {
  return (
    <XROrigin>
      <Text color={0xffa276} fontSize={0.3} position={[0, 2, -3]}>
        {text}
      </Text>
    </XROrigin>
  );
});
