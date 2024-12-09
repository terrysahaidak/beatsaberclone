import { MapDetail } from 'beatsaver-api/lib/models/MapDetail';
import { Container, Image, Text } from '@react-three/uikit';
import { observer } from 'mobx-react';
import { Card } from '@react-three/uikit-default';
import { useState } from 'react';

export const SongItem = observer(function SongItem({ item, onClick }: { item: MapDetail; onClick: () => void }) {
  const version = item.versions[item.versions.length - 1];

  const [hovered, setHovered] = useState(false);

  return (
    <Card
      onClick={onClick}
      backgroundColor={hovered ? 'red' : 'white'}
      onHoverChange={setHovered}
      key={item.id}
      marginY={4}
      padding={12}
      width={600}
      borderRadius={4}
    >
      <Container flexDirection="row" alignItems="center">
        <Image src={version.coverURL} width={48} height={48} marginRight={10} borderRadius={4} />

        <Container flexDirection="column" width={400}>
          <Text fontWeight="medium" fontSize={20}>
            {item.metadata.songName}
          </Text>
          <Text fontSize={16}>{item.metadata.songAuthorName}</Text>
        </Container>

        <Container flexDirection="column" width={120} alignItems="flex-end">
          <Text fontWeight="medium" fontSize={14}>
            {formatDuration(item.metadata.duration)}
          </Text>
          <Text fontSize={14}>BMP: {item.metadata.bpm.toString()}</Text>
        </Container>
      </Container>

      <Container marginTop={8} flexDirection="row">
        {version.diffs.map((diff, index) => (
          <Container
            borderTopLeftRadius={index === 0 ? 4 : 0}
            borderBottomLeftRadius={index === 0 ? 4 : 0}
            borderTopRightRadius={index === version.diffs.length - 1 ? 4 : 0}
            borderBottomRightRadius={index === version.diffs.length - 1 ? 4 : 0}
            key={index.toString()}
            justifyContent="center"
            flexGrow={1}
            backgroundColor="rgba(0,0,0,0.1)"
            padding={4}
          >
            <Text fontSize={16} color="white">
              {diff.difficulty}
            </Text>
          </Container>
        ))}
      </Container>
    </Card>
  );
});

function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
