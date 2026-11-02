import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { CATEGORY_ZONE, type BodyZone, type Garment } from '../../../domain/entities/Garment';
import type { PaletteEntry } from '../../../domain/usecases/GetWardrobeStats';
import { useOutfitsTheme } from '../../outfits/outfitsTheme';
import { representativeGarment, STYLE_ZONES, ZONE_LABELS } from '../../outfits/styleVariants';
import { ZoneGarment } from '../outfits/StyleGarmentsRow';

interface TileProps {
  zone: BodyZone;
  items: readonly Garment[];
}

const Tile = memo(function Tile({ zone, items }: TileProps) {
  const { tokens, transition } = useOutfitsTheme();
  const count = items.length;
  const label = count > 0 ? ZONE_LABELS[zone] : `${ZONE_LABELS[zone]} · falta`;
  return (
    <Animated.View
      style={[styles.tile, { backgroundColor: tokens.soft }, transition]}
      accessible
      accessibilityLabel={count > 0 ? `${ZONE_LABELS[zone]}: ${count}` : `${ZONE_LABELS[zone]}: te falta`}
    >
      <View style={styles.silhouette}>
        <ZoneGarment zone={zone} garment={representativeGarment(items)} size={0.82} dashColor={tokens.sub2} />
      </View>
      <Animated.Text style={[styles.tileCount, { color: tokens.text }, transition]}>{count}</Animated.Text>
      <Animated.Text style={[styles.tileLabel, { color: tokens.sub }, transition]} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Animated.Text>
    </Animated.View>
  );
});

interface Props {
  garments: readonly Garment[];
  palette: readonly PaletteEntry[];
}

export const WardrobeSummary = memo(function WardrobeSummary({ garments, palette }: Props) {
  const { tokens, transition } = useOutfitsTheme();
  const byZone = useMemo(() => {
    const groups: Record<BodyZone, Garment[]> = { torso: [], piernas: [], pies: [] };
    for (const garment of garments) groups[CATEGORY_ZONE[garment.category]].push(garment);
    return groups;
  }, [garments]);
  const names = palette.map((entry) => entry.colorName).join(' · ');

  return (
    <Animated.View style={[styles.card, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }, transition]}>
      <View style={styles.tiles}>
        {STYLE_ZONES.map((zone) => (
          <Tile key={zone} zone={zone} items={byZone[zone]} />
        ))}
      </View>
      {palette.length > 0 ? (
        <View style={styles.palette} accessible accessibilityLabel={`Tu paleta: ${palette.map((entry) => entry.colorName).join(', ')}`}>
          <View style={styles.paletteHeader}>
            <Animated.Text style={[styles.paletteTitle, { color: tokens.text }, transition]}>Tu paleta</Animated.Text>
            <Animated.Text style={[styles.paletteNames, { color: tokens.sub }, transition]} numberOfLines={1}>
              {names}
            </Animated.Text>
          </View>
          <Animated.View style={[styles.bar, { borderColor: tokens.line }, transition]}>
            {palette.map((entry) => (
              <View key={entry.colorName} style={{ flex: entry.count, backgroundColor: entry.colorHex }} />
            ))}
          </Animated.View>
        </View>
      ) : null}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 14, borderWidth: 1 },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center' },
  silhouette: { height: 54, justifyContent: 'center' },
  tileCount: { fontSize: 22, fontWeight: '700' },
  tileLabel: { fontSize: 13 },
  palette: { marginTop: 14 },
  paletteHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  paletteTitle: { fontSize: 13, fontWeight: '700' },
  paletteNames: { flexShrink: 1, fontSize: 13 },
  bar: { height: 12, borderRadius: 6, borderWidth: 1, flexDirection: 'row', overflow: 'hidden' },
});
