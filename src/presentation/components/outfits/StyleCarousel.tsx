import { memo, useCallback, useEffect, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { BodyZone } from '../../../domain/entities/Garment';
import type { StyleId } from '../../../domain/entities/StyleReference';
import { useOutfitsTheme } from '../../outfits/outfitsTheme';
import { STYLE_GRADIENTS } from '../../outfits/styleGradients';
import type { StyleCoverage } from '../../outfits/styleVariants';
import { GarmentSilhouettes } from './GarmentSilhouettes';
import { GradientFill } from './GradientFill';

const CARD_WIDTH = 236;
const GAP = 12;
const SIDE_PADDING = 20;
const INTERVAL = CARD_WIDTH + GAP;
const LIFT_TRANSITION = { transitionProperty: 'transform', transitionDuration: 180 } as const;

export function styleBadge({ complete, combinations }: StyleCoverage): string {
  if (!complete) return 'Incompleto';
  return `${combinations} ${combinations === 1 ? 'look' : 'looks'}`;
}

const firstColors = ({ byZone }: StyleCoverage): Record<BodyZone, string | null> => ({
  torso: byZone.torso[0]?.colorHex ?? null,
  piernas: byZone.piernas[0]?.colorHex ?? null,
  pies: byZone.pies[0]?.colorHex ?? null,
});

interface CardProps {
  coverage: StyleCoverage;
  selected: boolean;
  onSelect: (id: StyleId) => void;
}

const StyleCard = memo(function StyleCard({ coverage, selected, onSelect }: CardProps) {
  const { tokens, transition, reducedMotion } = useOutfitsTheme();
  const { reference, garments, coveredCount } = coverage;
  const { c1, c2 } = STYLE_GRADIENTS[reference.id];
  const count = `Tenés ${garments.length} ${garments.length === 1 ? 'prenda' : 'prendas'} · ${coveredCount} de 3 tipos`;

  return (
    <Animated.View
      style={[styles.lift, { transform: [{ translateY: selected ? -4 : 0 }] }, reducedMotion ? null : LIFT_TRANSITION]}
    >
      <Pressable
        onPress={() => onSelect(reference.id)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${reference.name}, ${styleBadge(coverage)}. ${count}`}
      >
        <Animated.View style={[styles.card, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }, transition]}>
          <View style={styles.top}>
            <GradientFill from={c1} to={c2} />
            <View style={styles.circle} />
            <View style={styles.silhouettes}>
              <GarmentSilhouettes colors={firstColors(coverage)} />
            </View>
          </View>
          <View style={styles.bottom}>
            <View style={styles.nameRow}>
              <Animated.Text style={[styles.name, { color: tokens.text }, transition]} numberOfLines={1}>
                {reference.name}
              </Animated.Text>
              <Animated.Text style={[styles.badge, { color: tokens.chipFg }, transition]}>{styleBadge(coverage)}</Animated.Text>
            </View>
            <Animated.Text style={[styles.phrase, { color: tokens.sub }, transition]} numberOfLines={2}>
              {reference.description}
            </Animated.Text>
            <Animated.View style={[styles.track, { backgroundColor: tokens.soft }, transition]}>
              <View style={[styles.fill, { width: `${(coveredCount / 3) * 100}%`, backgroundColor: tokens.primary }]} />
            </Animated.View>
            <Animated.Text style={[styles.count, { color: tokens.text }, transition]} numberOfLines={1}>
              {count}
            </Animated.Text>
          </View>
        </Animated.View>
        {selected ? <View style={[styles.ring, { borderColor: tokens.primary }]} pointerEvents="none" /> : null}
      </Pressable>
    </Animated.View>
  );
});

interface Props {
  coverages: readonly StyleCoverage[];
  selectedId: StyleId;
  onSelect: (id: StyleId) => void;
}

export function StyleCarousel({ coverages, selectedId, onSelect }: Props) {
  const { reducedMotion } = useOutfitsTheme();
  const listRef = useRef<FlatList<StyleCoverage>>(null);
  const selectedIndex = coverages.findIndex((coverage) => coverage.reference.id === selectedId);

  // También sirve cuando Inspiración abre la pantalla con un estilo que está fuera de la vista.
  useEffect(() => {
    if (selectedIndex >= 0) listRef.current?.scrollToOffset({ offset: selectedIndex * INTERVAL, animated: !reducedMotion });
  }, [selectedIndex, reducedMotion]);

  const renderItem = useCallback(
    ({ item }: { item: StyleCoverage }) => (
      <StyleCard coverage={item} selected={item.reference.id === selectedId} onSelect={onSelect} />
    ),
    [selectedId, onSelect],
  );

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={coverages}
      extraData={selectedId}
      keyExtractor={(item) => item.reference.id}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      snapToInterval={INTERVAL}
      decelerationRate="fast"
      getItemLayout={(_, index) => ({ length: INTERVAL, offset: SIDE_PADDING + index * INTERVAL, index })}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: SIDE_PADDING, paddingTop: 8, paddingBottom: 4, gap: GAP },
  lift: { width: CARD_WIDTH },
  card: { borderRadius: 26, borderWidth: 1, overflow: 'hidden' },
  ring: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: 26, borderWidth: 2 },
  top: { height: 156, overflow: 'hidden' },
  circle: {
    position: 'absolute',
    top: -28,
    left: -24,
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  silhouettes: { position: 'absolute', bottom: 16, left: 0, right: 0 },
  bottom: { padding: 14, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontSize: 20, fontWeight: '700' },
  badge: { fontSize: 12, fontWeight: '700' },
  phrase: { fontSize: 13, lineHeight: 17, minHeight: 34 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  count: { fontSize: 12, fontWeight: '600' },
});
