import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SEASONS, type SeasonSelection } from '../../domain/entities/Season';
import { SEASON_UI } from '../seasonUi';
import { useSeasonTheme, useThemeColors, type ThemeColorMap } from '../theme/SeasonThemeProvider';
import { PressableScale } from './PressableScale';

type IconName = keyof typeof Ionicons.glyphMap;

const OPTIONS: { value: SeasonSelection; label: string; icon: IconName }[] = [
  { value: 'todas', label: 'Todas', icon: 'apps-outline' },
  ...SEASONS.map((season) => ({ value: season, label: SEASON_UI[season].label, icon: SEASON_UI[season].icon })),
];

const BOUNCE_SCALE = 1.12;
const BOUNCE_UP_MS = 120;

const CIRCLE_COLORS: ThemeColorMap = { backgroundColor: 'seasonCircle', borderColor: 'seasonCircleBorder' };
const CIRCLE_ACTIVE_COLORS: ThemeColorMap = { backgroundColor: 'seasonActive', borderColor: 'seasonActive' };
const LABEL_COLORS: ThemeColorMap = { color: 'seasonLabel' };
const LABEL_ACTIVE_COLORS: ThemeColorMap = { color: 'activeText' };

interface OptionProps {
  option: (typeof OPTIONS)[number];
  selected: boolean;
  onPress: () => void;
}

function SeasonOption({ option, selected, onPress }: OptionProps) {
  const { theme } = useSeasonTheme();
  const reducedMotion = useReducedMotion();
  const circleColors = useThemeColors(selected ? CIRCLE_ACTIVE_COLORS : CIRCLE_COLORS);
  const labelColors = useThemeColors(selected ? LABEL_ACTIVE_COLORS : LABEL_COLORS);
  const scale = useSharedValue(1);
  const bounceStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const mounted = useRef(false);

  // El círculo elegido rebota, salvo el que ya estaba elegido al abrir la pantalla.
  useEffect(() => {
    if (mounted.current && selected && !reducedMotion) {
      scale.set(withSequence(withTiming(BOUNCE_SCALE, { duration: BOUNCE_UP_MS }), withSpring(1)));
    }
    mounted.current = true;
  }, [selected, reducedMotion, scale]);

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={option.value === 'todas' ? 'Mostrar todas las épocas' : `Filtrar por ${option.label}`}
      accessibilityState={{ selected }}
      style={styles.item}
    >
      <Animated.View style={[styles.circle, circleColors, bounceStyle]}>
        <Ionicons name={option.icon} size={26} color={selected ? theme.seasonActiveIcon : theme.seasonIcon} />
      </Animated.View>
      <Animated.Text style={[styles.label, selected && styles.labelSelected, labelColors]}>{option.label}</Animated.Text>
    </PressableScale>
  );
}

interface Props {
  value: SeasonSelection;
  onChange: (value: SeasonSelection) => void;
}

/** Fila de íconos para filtrar el placard por época del año. Tocar la elegida otra vez la quita. */
export function SeasonFilter({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <SeasonOption
            key={option.value}
            option={option}
            selected={selected}
            onPress={() => onChange(selected && option.value !== 'todas' ? 'todas' : option.value)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingBottom: 14 },
  item: { alignItems: 'center', gap: 6 },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, fontWeight: '500' },
  labelSelected: { fontWeight: '600' },
});
