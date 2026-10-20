import { StyleSheet, Text, View } from 'react-native';
import type { StyleReference } from '../../domain/entities/StyleReference';

export function StyleHero({ reference }: { reference: StyleReference }) {
  return (
    <View style={styles.card}>
      <View style={styles.glow} />
      <View style={styles.pill}>
        <Text style={styles.pillLabel}>Referencia de estilo</Text>
      </View>
      <View>
        <Text style={styles.name} accessibilityRole="header">
          {reference.name}
        </Text>
        <Text style={styles.description}>{reference.description}</Text>
        {reference.note ? <Text style={styles.note}>{reference.note}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 18,
    minHeight: 190,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(232,201,160,0.18)',
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillLabel: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  name: { fontSize: 30, fontWeight: '700', color: '#FFFFFF' },
  description: { fontSize: 14, color: '#D8D3CB', marginTop: 2 },
  note: { fontSize: 12, color: '#B7B1A8', marginTop: 6 },
});