import { Pressable, StyleSheet, View } from 'react-native';
import type { GarmentColor } from '../../domain/services/garmentColors';
import { makeStyles } from '../theme/makeStyles';

interface Props {
  options: readonly GarmentColor[];
  selectedHexes: readonly string[]; // uno para el color dominante; varios para los secundarios
  onSelect: (color: GarmentColor) => void;
}

export function ColorPicker({ options, selectedHexes, onSelect }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.grid}>
      {options.map((color) => {
        const selected = selectedHexes.includes(color.hex);
        return (
          <Pressable
            key={color.hex}
            onPress={() => onSelect(color)}
            accessibilityRole="button"
            accessibilityLabel={color.name}
            accessibilityState={{ selected }}
            style={[styles.ring, selected && styles.ringSelected]}
          >
            <View style={[styles.dot, { backgroundColor: color.hex }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ring: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSelected: { borderColor: colors.link },
  dot: { width: 32, height: 32, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.swatchBorder },
}));