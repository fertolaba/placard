import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import type { SavedFilter } from '../../outfits/savedOutfitView';
import { useOutfitsTheme } from '../../outfits/outfitsTheme';

const SPRING = { damping: 14, stiffness: 180 };
const SELECTED_SHADOW = '0px 8px 18px rgba(200,67,43,0.35)';

const FILTERS: { value: SavedFilter; label: string; icon: string }[] = [
  { value: 'todos', label: 'Todos', icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
  { value: 'color', label: 'Por color', icon: 'M9 4a5 5 0 1 0 0 10a5 5 0 1 0 0-10zM15 10a5 5 0 1 0 0 10a5 5 0 1 0 0-10z' },
  { value: 'estilo', label: 'Por estilo', icon: 'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z' },
];

interface BlockProps {
  value: SavedFilter;
  label: string;
  icon: string;
  count: number;
  selected: boolean;
  onSelect: (value: SavedFilter) => void;
}

const FilterBlock = memo(function FilterBlock({ value, label, icon, count, selected, onSelect }: BlockProps) {
  const { tokens, reducedMotion } = useOutfitsTheme();
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    const target = selected ? 1 : 0;
    progress.set(reducedMotion ? target : withSpring(target, SPRING));
  }, [selected, reducedMotion, progress]);

  const growStyle = useAnimatedStyle(() => ({
    flex: 1 + 0.5 * progress.get(),
    transform: [{ scale: 1 + 0.05 * progress.get() }],
  }));

  const colorTransition = reducedMotion
    ? { transitionDuration: 0 }
    : { transitionProperty: ['backgroundColor', 'borderColor', 'color'], transitionDuration: 300 };
  const foreground = selected ? tokens.onPrimary : tokens.text;

  return (
    <Animated.View style={[selected ? styles.onTop : null, growStyle]}>
      <Pressable
        onPress={() => onSelect(value)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${label}: ${count} ${count === 1 ? 'outfit' : 'outfits'}`}
      >
        <Animated.View
          style={[
            styles.block,
            selected
              ? { backgroundColor: tokens.primary, borderColor: tokens.primary, boxShadow: SELECTED_SHADOW }
              : { backgroundColor: tokens.card, borderColor: tokens.cardBorder },
            colorTransition,
          ]}
        >
          <View style={styles.topRow}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path d={icon} fill="none" stroke={foreground} strokeWidth={2} strokeLinejoin="round" />
            </Svg>
            <Animated.View
              style={[styles.bubble, { backgroundColor: selected ? 'rgba(255,255,255,0.25)' : tokens.soft }, colorTransition]}
            >
              <Animated.Text style={[styles.count, { color: foreground }, colorTransition]} maxFontSizeMultiplier={1.2}>
                {count}
              </Animated.Text>
            </Animated.View>
          </View>
          <Animated.Text
            style={[styles.label, { color: foreground }, colorTransition]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            maxFontSizeMultiplier={1.2}
          >
            {label}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

interface Props {
  value: SavedFilter;
  counts: Record<SavedFilter, number>;
  onChange: (value: SavedFilter) => void;
}

export const SavedFilters = memo(function SavedFilters({ value, counts, onChange }: Props) {
  return (
    <View style={styles.row}>
      {FILTERS.map((filter) => (
        <FilterBlock key={filter.value} {...filter} count={counts[filter.value]} selected={value === filter.value} onSelect={onChange} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  onTop: { zIndex: 1 },
  block: { height: 64, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, justifyContent: 'center', gap: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bubble: { minWidth: 24, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  count: { fontSize: 13, fontWeight: '700' },
  label: { fontSize: 15, fontWeight: '700' },
});
