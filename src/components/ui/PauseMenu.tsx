import { Fullscreen } from '@react-three/uikit';
import { DialogAnchor } from '@react-three/uikit-default';
import { Text } from '@react-three/uikit';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@react-three/uikit-default';
import { observer } from 'mobx-react';

export const PauseMenu = observer(function PauseMenu() {
  return (
    <Fullscreen overflow="scroll" scrollbarColor="black" flexDirection="column" gap={32} paddingX={32} alignItems="center" padding={32}>
      <DialogAnchor>
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <Text>Pause</Text>
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Exit</Text>
              </AlertDialogCancel>
              <AlertDialogAction>
                <Text>Continue</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogAnchor>
    </Fullscreen>
  );
});
