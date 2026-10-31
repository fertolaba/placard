import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import type { Sex } from '../../domain/entities/Sex';
import { categoryOptionsFor } from '../categoryUi';
import type { CategoryFilterValue } from '../hooks/useGarments';
import { useThemeColors, type ThemeColorMap } from '../theme/SeasonThemeProvider';
import { PressableScale } from './PressableScale';

const SLIDE_MS = 280;
const SCROLL_MARGIN = 40; // deja ver un poco de la opción anterior

const TRACK_COLORS: ThemeColorMap = { backgroundColor: 'categoryTrack' };
const PILL_COLORS: ThemeColorMap = { backgroundColor: 'categorySelected' };
const LABEL_COLORS: ThemeColorMap = { color: 'categoryText' };
const LABEL_SELECTED_COLORS: ThemeColorMap = { color: 'categorySelectedText' };

/** Las categorías del perfil, en el orden en que se muestran (también es el orden al deslizar). */
export function categoryFilterOptions(sex: Sex | null): { value: CategoryFilterValue; label: string }[] {
  return [{ value: 'todo', label: 'Todo' }, ...categoryOptionsFor(sex)];
}

interface OptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  onMeasure: (x: number, width: number) => void;
}

function CategoryOption({ label, selected, onPress, onMeasure }: OptionProps) {
  const labelColors = useThemeColors(selected ? LABEL_SELECTED_COLORS : LABEL_COLORS);
  return (
    <PressableScale
      onPress={onPress}
      onLayout={(event) => onMeasure(event.nativeEvent.layout.x, event.nativeEvent.layout.width)}
      accessibilityRole="button"
      accessibilityLabel={`Categoría ${label}`}
      accessibilityState={{ selected }}
      hitSlop={{ top: 6, bottom: 6 }}
      style={styles.option}
    >
      <Animated.Text style={[styles.label, selected && styles.labelSelected, labelColors]}>{label}</Animated.Text>
    </PressableScale>
  );
}

interface Props {
  options: { value: CategoryFilterValue; label: string }[];
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
}

/** Barra de categorías con un fondo que desliza. Sigue scrolleando porque algunos perfiles tienen más opciones. */
export function CategoryFilter({ options, value, onChange }: Props) {
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [layouts, setLayouts] = useState<Partial<Record<CategoryFilterValue, { x: number; width: number }>>>({});
  const trackColors = useThemeColors(TRACK_COLORS);
  const pillColors = useThemeColors(PILL_COLORS);
  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const pillPlaced = useRef(false);
  const pillStyle = useAnimatedStyle(() => ({ width: pillWidth.get(), transform: [{ translateX: pillX.get() }] }));

  const selected = layouts[value];
  const selectedX = selected?.x;
  const selectedWidth = selected?.width;

  useEffect(() => {
    if (selectedX === undefined || selectedWidth === undefined) return;
    if (pillPlaced.current && !reducedMotion) {
      pillX.set(withTiming(selectedX, { duration: SLIDE_MS }));
      pillWidth.set(withTiming(selectedWidth, { duration: SLIDE_MS }));
    } else {
      pillX.set(selectedX); // la primera vez aparece en su lugar, sin venir deslizando desde el costado
      pillWidth.set(selectedWidth);
    }
    pillPlaced.current = true;
    scrollRef.current?.scrollTo({ x: Math.max(0, selectedX - SCROLL_MARGIN), animated: !reducedMotion });
  }, [selectedX, selectedWidth, reducedMotion, pillX, pillWidth]);

  return (
    <Animated.View style={[styles.track, trackColors]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.row}>
          <Animated.View style={[styles.pill, pillColors, pillStyle]} />
          {options.map((option) => (
            <CategoryOption
              key={option.value}
              label={option.label}
              selected={option.value === value}
              onPress={() => onChange(option.value)}
              onMeasure={(x, width) =>
                setLayouts((current) => {
                  const known = current[option.value];
                  return known?.x === x && known?.width === width ? current : { ...current, [option.value]: { x, width } };
                })
              }
            />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const HEIGHT = 32;

const styles = StyleSheet.create({
  track: { marginHorizontal: 20, borderRadius: 12, padding: 3 },
  scroll: { flexGrow: 0 }, // si no, el ScrollView horizontal ocupa alto que es de la grilla
  scrollContent: { flexGrow: 1 },
  row: { flexGrow: 1, flexDirection: 'row' },
  pill: { position: 'absolute', left: 0, top: 0, height: HEIGHT, borderRadius: 9 },
  option: { flexGrow: 1, height: HEIGHT, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '500' },
  labelSelected: { fontWeight: '600' },
});
