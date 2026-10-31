import { StyleSheet, View } from 'react-native';
import { makeStyles } from '../theme/makeStyles';

export function PaletteDots({ colors, size = 14 }: { colors: readonly string[]; size?: number }) {
  const styles = useStyles();
  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {colors.map((hex) => (
        <View key={hex} style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: hex }]} />
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: 'row', gap: 4 },
  dot: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.swatchBorder },
}));
