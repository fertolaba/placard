import { Pressable, Text, View } from 'react-native';
import { makeStyles } from '../theme/makeStyles';

interface Props<T extends string> {
  options: readonly T[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  labelFor?: (option: T) => string; // sin esto, el valor con mayúscula inicial
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Elección única y opcional: tocar el corte elegido lo quita. */
export function CutPicker<T extends string>({ options, value, onChange, labelFor = capitalize }: Props<T>) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(selected ? undefined : option)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{labelFor(option)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.swatchBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.primaryFill, borderColor: colors.primary, borderWidth: 2 },
  label: { fontSize: 15, fontWeight: '500', color: colors.text },
  labelSelected: { fontWeight: '600', color: colors.link },
}));
