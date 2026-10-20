import { Pressable, Text, View } from 'react-native';
import { makeStyles } from '../theme/makeStyles';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Control segmentado con el estilo de iOS. */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const styles = useStyles();
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  track: { flexDirection: 'row', backgroundColor: colors.fillMuted, borderRadius: 9, padding: 2 },
  segment: { flex: 1, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  segmentSelected: { backgroundColor: colors.segmentSelected, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
  label: { fontSize: 13, color: colors.text },
  labelSelected: { fontWeight: '600' },
}));