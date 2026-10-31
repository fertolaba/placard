import { Pressable, ScrollView, Text } from 'react-native';
import { ESTILOS_REFERENTE, type EstiloReferente } from '../../domain/entities/Referente';
import { makeStyles } from '../theme/makeStyles';

export type ReferenteFilterValue = EstiloReferente | 'Todos';

const OPTIONS: readonly ReferenteFilterValue[] = ['Todos', ...ESTILOS_REFERENTE];

interface Props {
  value: ReferenteFilterValue;
  onChange: (value: ReferenteFilterValue) => void;
}

export function ReferenteFilter({ value, onChange }: Props) {
  const styles = useStyles();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {OPTIONS.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityLabel={`Filtrar por ${option}`}
            accessibilityState={{ selected }}
            style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  scroll: { flexGrow: 0 },
  row: { gap: 8, paddingHorizontal: 20 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: colors.fillMuted,
  },
  chipSelected: { backgroundColor: colors.primary },
  pressed: { opacity: 0.7 },
  label: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  labelSelected: { color: colors.onPrimary },
}));
