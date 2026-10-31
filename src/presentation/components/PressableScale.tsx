import type { ComponentProps } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESSED_SCALE = 0.97;
const DURATION = 100;

interface Props extends Omit<PressableProps, 'style'> {
  style?: ComponentProps<typeof AnimatedPressable>['style'];
}

/** Pressable que se achica un poco al presionarlo. */
export function PressableScale({ style, onPressIn, onPressOut, ...props }: Props) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const animateTo = (value: number) => {
    if (!reducedMotion) scale.set(withTiming(value, { duration: DURATION }));
  };

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        animateTo(PRESSED_SCALE);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}
      style={[style, scaleStyle]}
    />
  );
}
