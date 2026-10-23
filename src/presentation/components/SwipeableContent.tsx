import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, PanResponder, Platform } from 'react-native';
import { resolveSwipe, type SwipeDirection } from '../utils/swipe';

interface Props {
  index: number; // posición actual: sirve para animar la entrada según hacia dónde se movió
  onSwipe: (direction: SwipeDirection) => void;
  children: ReactNode;
}

const SLIDE_DISTANCE = 32;
const DURATION = 180;

/** Detecta deslizamientos horizontales sobre su contenido sin molestar al scroll vertical ni a los toques. */
export function SwipeableContent({ index, onSwipe, children }: Props) {
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe; // siempre usa la última versión de la función

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Solo toma el control cuando el dedo se mueve claramente hacia los costados.
        onMoveShouldSetPanResponderCapture: (_event, gesture) =>
          Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 2,
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: (_event, gesture) => {
          const direction = resolveSwipe(gesture.dx, gesture.dy, gesture.vx);
          if (direction) onSwipeRef.current(direction);
        },
      }),
    [],
  );

  const offset = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const previousIndex = useRef(index);
  const reduceMotion = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotion.current = enabled;
    });
  }, []);

  useEffect(() => {
    if (previousIndex.current === index) return;
    const direction = index > previousIndex.current ? 1 : -1; // si avanza, el contenido entra desde la derecha
    previousIndex.current = index;
    if (reduceMotion.current) return;
    const useNativeDriver = Platform.OS !== 'web';
    offset.setValue(direction * SLIDE_DISTANCE);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(offset, { toValue: 0, duration: DURATION, useNativeDriver }),
      Animated.timing(opacity, { toValue: 1, duration: DURATION, useNativeDriver }),
    ]).start();
  }, [index, offset, opacity]);

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateX: offset }] }} {...panResponder.panHandlers}>
      {children}
    </Animated.View>
  );
}