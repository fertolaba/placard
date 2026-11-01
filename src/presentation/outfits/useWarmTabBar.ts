import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { useOutfitsTheme } from './outfitsTheme';

/** La barra toma las opciones de la pestaña abierta: estos colores se ven solo en la pantalla que llama al hook. */
export function useWarmTabBar(): void {
  const { tokens } = useOutfitsTheme();
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarActiveTintColor: tokens.tabActive,
      tabBarInactiveTintColor: tokens.sub2,
      tabBarStyle: { backgroundColor: tokens.tabBar, borderTopColor: tokens.cardBorder },
    });
  }, [navigation, tokens]);
}
