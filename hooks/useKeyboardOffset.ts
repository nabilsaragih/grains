import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

export function useKeyboardOffset() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleShow = (event: any) => {
      const height = event?.endCoordinates?.height ?? 0;
      setKeyboardHeight(height);
    };

    const handleHide = () => {
      setKeyboardHeight(0);
    };

    const showListener = Keyboard.addListener('keyboardDidShow', handleShow);
    const hideListener = Keyboard.addListener('keyboardDidHide', handleHide);

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return keyboardHeight;
}
