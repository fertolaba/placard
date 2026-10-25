import { Pressable, Text, View } from 'react-native';
import { makeStyles } from '../theme/makeStyles';

interface Props {
  options: readonly string[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Elección única y opcional: tocar el corte elegido lo quita. */
export function CutPicker({ options, value, onChange }: Props) {
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
            <Text style={[styles.label, selected && styles.labelSelected]}>{capitalize(option)}</Text>
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
  chipSelected: { backgroundColor: colors.primaryFill, borderColor: colors.link, borderWidth: 2 },
  label: { fontSize: 15, fontWeight: '500', color: colors.text },
  labelSelected: { fontWeight: '600', color: colors.link },
}));
