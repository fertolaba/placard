import { StyleSheet, Text, View } from 'react-native';
import type { Garment } from '../../domain/entities/Garment';
import { makeStyles } from '../theme/makeStyles';

interface Props {
  garment: Garment;
  compact?: boolean; // para las tarjetas chicas: círculos y texto más chicos
}

/** Desglose de color de una prenda: círculo y nombre del dominante, un "+" y los círculos de los secundarios. */
export function ColorBreakdown({ garment, compact = false }: Props) {
  const styles = useStyles();
  const { secondaryColors } = garment;
  const label =
    secondaryColors.length > 0
      ? `${garment.colorName}, con detalles en ${secondaryColors.map((color) => color.name).join(', ')}`
      : garment.colorName;

  return (
    <View style={styles.row} accessible accessibilityLabel={`Color: ${label}`}>
      <View style={styles.main}>
        <View style={[styles.dot, compact && styles.dotCompact, { backgroundColor: garment.colorHex }]} />
        <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={1}>
          {garment.colorName}
        </Text>
      </View>
      {secondaryColors.length > 0 ? (
        <View style={styles.extra}>
          <Text style={[styles.plus, compact && styles.nameCompact]}>+</Text>
          {secondaryColors.map((color) => (
            <View
              key={color.hex}
              style={[styles.dot, styles.secondaryDot, compact && styles.dotCompact, { backgroundColor: color.hex }]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 4, rowGap: 2, marginTop: 6 },
  main: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1, maxWidth: '100%' },
  extra: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.swatchBorder },
  secondaryDot: { width: 10, height: 10, borderRadius: 5 },
  dotCompact: { width: 8, height: 8, borderRadius: 4 },
  name: { flexShrink: 1, fontSize: 12, fontWeight: '500', color: colors.text },
  nameCompact: { fontSize: 10 },
  plus: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
}));
