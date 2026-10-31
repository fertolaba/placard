import { useIsFocused } from 'expo-router';
import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

function subscribeToAppState(listener: () => void): () => void {
  const subscription = AppState.addEventListener('change', listener);
  return () => subscription.remove();
}

/** Las animaciones de la escena corren solo con la pantalla enfocada, la app adelante y sin "reducir movimiento". */
export function useSceneActive(): boolean {
  const focused = useIsFocused();
  const reducedMotion = useReducedMotion();
  const appState = useSyncExternalStore(
    subscribeToAppState,
    () => AppState.currentState,
    () => AppState.currentState,
  );
  return focused && appState === 'active' && !reducedMotion;
}
