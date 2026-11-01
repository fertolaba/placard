import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { BodyZone } from '../../../domain/entities/Garment';
import { useOutfitsTheme } from '../../outfits/outfitsTheme';
import { STYLE_ZONES, ZONE_LABELS, type StyleCoverage } from '../../outfits/styleVariants';
import { styleBadge } from './StyleCarousel';

function subtitle({ complete, garments, missingZones }: StyleCoverage): string {
  if (complete) return `Con tus ${garments.length} prendas de este estilo`;
  const names = missingZones.map((zone) => ZONE_LABELS[zone].toLowerCase());
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names[0];
  return `Te falta ${list} para completar un look`;
}

function ZoneRow({ zone, coverage }: { zone: BodyZone; coverage: StyleCoverage }) {
  const { tokens, transition } = useOutfitsTheme();
  const items = coverage.byZone[zone];
  const label = ZONE_LABELS[zone];
  const has = items.length > 0;
  return (
    <View style={styles.row}>
      {has ? (
        <View style={[styles.circle, { backgroundColor: tokens.primary }]}>
          <Ionicons name="checkmark" size={18} color={tokens.onPrimary} />
        </View>
      ) : (
        <Animated.View style={[styles.circle, styles.dashed, { borderColor: tokens.line }, transition]}>
          <Ionicons name="add" size={18} color={tokens.sub} />
        </Animated.View>
      )}
      <View style={styles.rowText}>
        <Animated.Text style={[styles.rowTitle, { color: tokens.text }, transition]}>
          {has ? `${label} (${items.length})` : label}
        </Animated.Text>
        <Animated.Text style={[styles.rowDetail, { color: tokens.sub }, transition]} numberOfLines={1} ellipsizeMode="tail">
          {has ? items.map((item) => item.name).join(', ') : 'Te falta'}
        </Animated.Text>
      </View>
    </View>
  );
}

export const StyleDetailCard = memo(function StyleDetailCard({ coverage }: { coverage: StyleCoverage }) {
  const { tokens, transition } = useOutfitsTheme();
  return (
    <Animated.View style={[styles.card, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }, transition]}>
      <View style={styles.header}>
        <Animated.Text style={[styles.title, { color: tokens.text }, transition]} accessibilityRole="header" numberOfLines={1}>
          Look {coverage.reference.name}
        </Animated.Text>
        <View style={[styles.pill, { backgroundColor: tokens.primary }]}>
          <Text style={[styles.pillLabel, { color: tokens.onPrimary }]}>{styleBadge(coverage)}</Text>
        </View>
      </View>
      <Animated.Text style={[styles.subtitle, { color: tokens.sub }, transition]}>{subtitle(coverage)}</Animated.Text>
      <View style={styles.rows}>
        {STYLE_ZONES.map((zone) => (
          <ZoneRow key={zone} zone={zone} coverage={coverage} />
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginTop: 16, padding: 18, borderRadius: 24, borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontSize: 20, fontWeight: '700' },
  pill: { borderRadius: 13, paddingHorizontal: 10, paddingVertical: 4 },
  pillLabel: { fontSize: 13, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 4 },
  rows: { marginTop: 14, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  circle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dashed: { borderWidth: 1, borderStyle: 'dashed' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowDetail: { fontSize: 13 },
});
