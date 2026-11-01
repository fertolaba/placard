import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useOutfitsTheme } from '../../outfits/outfitsTheme';

const THUMB_TRAVEL = 22;
const THUMB_TRANSITION = { transitionProperty: 'transform', transitionDuration: 180 } as const;

interface Props {
  value: boolean;
  label: string;
  onChange: (value: boolean) => void;
}

export const PillSwitch = memo(function PillSwitch({ value, label, onChange }: Props) {
  const { tokens, transition, reducedMotion } = useOutfitsTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      hitSlop={5}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
    >
      <Animated.View style={[styles.track, { backgroundColor: value ? tokens.primary : tokens.switchOff }, transition]}>
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX: value ? THUMB_TRAVEL : 0 }] }, reducedMotion ? null : THUMB_TRANSITION]}
        />
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  track: { width: 56, height: 34, borderRadius: 17, padding: 3 },
  thumb: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF' },
});
