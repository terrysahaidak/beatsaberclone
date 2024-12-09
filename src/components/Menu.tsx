import { observer } from 'mobx-react';

import { Container, Root, Text } from '@react-three/uikit';
import { useEffect, useState } from 'react';
import { gameStore } from '../store/store';
import { SongItem } from './ui/SongItem';
import { Button, Card, CardDescription, CardTitle, Input } from '@react-three/uikit-default';

export const Menu = observer(function Menu() {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);

  useEffect(() => {
    gameStore.data.search('rumbling').then(() => {
      // setSelectedSong(gameStore.data.searchResults[0].id);
    });
  }, []);

  return (
    <>
      <group pointerEventsType={{ deny: 'grab' }} position={[0, 1.5, -10.5]}>
        <Root flexDirection="column" pixelSize={0.01} maxHeight={800} width="100%" overflow="scroll">
          <Container
            display="flex"
            justifyContent="space-between"
            flexShrink={0}
            borderRadius={8}
            backgroundColor="rgb(243,244,246)"
            padding={16}
            flexDirection="column"
          >
            <Container paddingBottom={4} flexDirection="row">
              <Input fontWeight="bold" defaultValue="" placeholder="Search..." />
              <Button marginLeft={8} onClick={() => gameStore.data.search('rumbling')}>
                <Text>Search</Text>
              </Button>
            </Container>

            {gameStore.data.searchResults.map((result) => (
              <>
                <SongItem onClick={() => setSelectedSong(result.id)} key={result.id} item={result} />
              </>
            ))}
          </Container>
        </Root>
      </group>

      {selectedSong && (
        <group position={[4.3, 1.5, -10.45]} rotation={[0, -0.1, 0]}>
          <Root flexDirection="column" pixelSize={0.01} maxHeight={800} width={200} overflow="scroll">
            <Container
              display="flex"
              justifyContent="space-between"
              flexShrink={0}
              borderRadius={8}
              backgroundColor="white"
              padding={16}
              height={800}
              flexDirection="column"
            >
              <Card>
                <CardTitle>
                  <Text>Notifications</Text>
                </CardTitle>
                <CardDescription>
                  <Text>You have 3 unread messages.</Text>
                </CardDescription>
              </Card>
            </Container>
          </Root>
        </group>
      )}
    </>
  );
});
