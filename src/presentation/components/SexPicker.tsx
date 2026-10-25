import { Pressable, Text, View } from 'react-native';
import type { Sex } from '../../domain/entities/Sex';
import { makeStyles } from '../theme/makeStyles';

const OPTIONS: { value: Sex; label: string }[] = [
  { value: 'femenino', label: 'Femenino' },
  { value: 'masculino', label: 'Masculino' },
];

interface Props {
  value: Sex | null; // null = todavía no eligió
  onChange: (value: Sex) => void;
  disabled?: boolean;
}

/** Elección única y obligatoria entre femenino y masculino (botones de opción). */
export function SexPicker({ value, onChange, disabled = false }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Sexo">
      {OPTIONS.map((option) => {
        const checked = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked, disabled }}
            style={[styles.option, checked && styles.optionChecked]}
          >
            <View style={[styles.dot, checked && styles.dotChecked]}>{checked ? <View style={styles.dotInner} /> : null}</View>
            <Text style={[styles.label, checked && styles.labelChecked]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: 'row', gap: 10 },
  option: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.swatchBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  optionChecked: { backgroundColor: colors.primaryFill, borderColor: colors.link, borderWidth: 2 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotChecked: { borderColor: colors.link },
  dotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.link },
  label: { fontSize: 16, fontWeight: '500', color: colors.text },
  labelChecked: { fontWeight: '600', color: colors.link },
}));
