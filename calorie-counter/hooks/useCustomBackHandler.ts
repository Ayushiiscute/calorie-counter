// hooks/useCustomBackHandler.ts
import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

export function useCustomBackHandler(navigation: any) {
  const backPressedOnce = useRef(false);

  useFocusEffect(() => {
    const onBackPress = () => {
      if (backPressedOnce.current) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Press back again to go to Welcome screen',
        });
        backPressedOnce.current = true;
        setTimeout(() => {
          backPressedOnce.current = false;
        }, 1500);
      }
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  });

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, 
      headerBackVisible: false, 
      gestureEnabled: false, 
    });
  }, [navigation]);
}
