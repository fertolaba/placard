import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, type DimensionValue } from 'react-native';
import Animated from 'react-native-reanimated';
import type { SavedOutfit } from '../../../domain/entities/SavedOutfit';
import { PAPER, useOutfitsTheme } from '../../outfits/outfitsTheme';
import { STYLE_GRADIENTS } from '../../outfits/styleGradients';
import { buildStyleVariants, type StyleCoverage, type StyleVariant } from '../../outfits/styleVariants';
import { GarmentSilhouettes } from './GarmentSilhouettes';
import { GradientFill } from './GradientFill';

const CARD_WIDTH = 152;
const GAP = 12;
const SIDE_PADDING = 20;
const COLLAPSED_COUNT = 6;
const GRID_CARD_WIDTH = '48%'; // en porcentaje: siempre entran dos columnas, sea cual sea el ancho disponible

function variantTitle({ top, bottom }: StyleVariant): string {
  return `${top?.name ?? 'Te falta arriba'} + ${bottom?.name ?? 'te falta abajo'}`;
}

interface CardProps {
  variant: StyleVariant;
  gradient: { from: string; to: string };
  width: DimensionValue;
  saved: boolean;
  onToggleSave: (variant: StyleVariant) => void;
}

export const VariantCard = memo(function VariantCard({ variant, gradient, width, saved, onToggleSave }: CardProps) {
  const title = variantTitle(variant);
  const colors = useMemo(
    () => ({
      torso: variant.top?.colorHex ?? null,
      piernas: variant.bottom?.colorHex ?? null,
      pies: variant.shoe?.colorHex ?? null,
    }),
    [variant],
  );
  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.cardTop}>
        <GradientFill from={gradient.from} to={gradient.to} />
        <View style={styles.cardSilhouettes}>
          <GarmentSilhouettes colors={colors} size={0.56} />
        </View>
        <Pressable
          onPress={() => onToggleSave(variant)}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
          accessibilityLabel={saved ? `Quitar de guardados: ${title}` : `Guardar variante: ${title}`}
          style={styles.heart}
        >
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={PAPER.heart} />
        </Pressable>
      </View>
      <View style={styles.cardBottom}>
        <Text style={[styles.match, variant.complete ? styles.matchComplete : styles.matchIncomplete]}>
          {variant.complete ? `${variant.matchPercent}% match` : 'Incompleto'}
        </Text>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.cardDetail} numberOfLines={1}>
          {variant.shoe?.name ?? 'Te falta calzado'}
        </Text>
      </View>
    </View>
  );
});

interface Props {
  coverage: StyleCoverage;
  savedIds: ReadonlySet<string>;
  onToggleSave: (outfit: SavedOutfit) => void;
}

/** Se monta con key={estilo}: al cambiar de estilo vuelve solo al modo plegado. */
export function StyleVariantsSection({ coverage, savedIds, onToggleSave }: Props) {
  const { tokens, transition } = useOutfitsTheme();
  const [expanded, setExpanded] = useState(false);
  const variants = useMemo(() => buildStyleVariants(coverage), [coverage]);
  const styleId = coverage.reference.id;
  const gradient = useMemo(() => ({ from: STYLE_GRADIENTS[styleId].c1, to: STYLE_GRADIENTS[styleId].c2 }), [styleId]);
  const toggle = useCallback(
    ({ id, top, bottom, shoe }: StyleVariant) =>
      onToggleSave({ id, styleId, garmentIds: [top, bottom, shoe].flatMap((item) => (item ? [item.id] : [])) }),
    [onToggleSave, styleId],
  );
  const total = coverage.combinations;
  const shown = variants.length;

  const countLabel = total > shown ? `${shown} de ${total} combinaciones` : `${total} ${total === 1 ? 'combinación' : 'combinaciones'}`;
  const expandLabel = total > shown ? `Ver las ${shown} mejores` : `Ver las ${shown} combinaciones`;

  const renderItem = useCallback(
    ({ item }: { item: StyleVariant }) => (
      <VariantCard variant={item} gradient={gradient} width={CARD_WIDTH} saved={savedIds.has(item.id)} onToggleSave={toggle} />
    ),
    [gradient, savedIds, toggle],
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Animated.Text style={[styles.title, { color: tokens.text }, transition]} accessibilityRole="header">
          Variantes con tu ropa
        </Animated.Text>
        <Animated.Text style={[styles.count, { color: tokens.sub }, transition]}>{countLabel}</Animated.Text>
      </View>

      {shown === 0 ? (
        <Animated.Text style={[styles.none, { color: tokens.sub }, transition]}>
          Todavía no tenés prendas de este estilo.
        </Animated.Text>
      ) : expanded ? (
        <View style={styles.grid}>
          {variants.map((variant) => (
            <VariantCard
              key={variant.id}
              variant={variant}
              gradient={gradient}
              width={GRID_CARD_WIDTH}
              saved={savedIds.has(variant.id)}
              onToggleSave={toggle}
            />
          ))}
        </View>
      ) : (
        <FlatList
          horizontal
          data={variants.slice(0, COLLAPSED_COUNT)}
          extraData={savedIds}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + GAP}
          decelerationRate="fast"
          contentContainerStyle={styles.list}
        />
      )}

      {shown > COLLAPSED_COUNT ? (
        <Pressable onPress={() => setExpanded((value) => !value)} accessibilityRole="button" accessibilityState={{ expanded }}>
          <Animated.View style={[styles.more, { borderColor: tokens.line }, transition]}>
            <Animated.Text style={[styles.moreLabel, { color: tokens.text }, transition]}>
              {expanded ? 'Ver menos' : expandLabel}
            </Animated.Text>
          </Animated.View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 22 },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, paddingHorizontal: SIDE_PADDING, marginBottom: 12 },
  title: { flexShrink: 1, fontSize: 20, fontWeight: '700' },
  count: { fontSize: 14 },
  none: { fontSize: 14, paddingHorizontal: SIDE_PADDING },
  list: { paddingHorizontal: SIDE_PADDING, gap: GAP },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: GAP, paddingHorizontal: SIDE_PADDING },
  card: { borderRadius: 20, overflow: 'hidden', backgroundColor: PAPER.background },
  cardTop: { height: 112 },
  cardSilhouettes: { position: 'absolute', bottom: 10, left: 0, right: 0 },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBottom: { padding: 10, gap: 2 },
  match: { fontSize: 12, fontWeight: '700' },
  matchComplete: { color: PAPER.matchText },
  matchIncomplete: { color: PAPER.sub },
  cardTitle: { fontSize: 13, lineHeight: 17, minHeight: 34, fontWeight: '700', color: PAPER.text },
  cardDetail: { fontSize: 12, color: PAPER.sub },
  more: { height: 46, marginHorizontal: SIDE_PADDING, marginTop: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  moreLabel: { fontSize: 15, fontWeight: '600' },
});
