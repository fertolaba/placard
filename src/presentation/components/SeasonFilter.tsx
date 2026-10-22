import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { SEASONS } from '../../domain/entities/Season';
import type { SeasonFilterValue } from '../hooks/useGarments';
import { SEASON_UI } from '../seasonUi';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

type IconName = keyof typeof Ionicons.glyphMap;

const OPTIONS: { value: SeasonFilterValue; label: string; icon: IconName }[] = [
  { value: 'todas', label: 'Todas', icon: 'apps-outline' },
  ...SEASONS.map((season) => ({ value: season, label: SEASON_UI[season].label, icon: SEASON_UI[season].icon })),
];

interface Props {
  value: SeasonFilterValue;
  onChange: (value: SeasonFilterValue) => void;
}

/** Fila de íconos para filtrar el placard por época del año. Tocar la elegida otra vez la quita. */
export function SeasonFilter({ value, onChange }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(selected && option.value !== 'todas' ? 'todas' : option.value)}
            accessibilityRole="button"
            accessibilityLabel={option.value === 'todas' ? 'Mostrar todas las épocas' : `Filtrar por ${option.label}`}
            accessibilityState={{ selected }}
            style={styles.item}
          >
            <View style={[styles.circle, selected && styles.circleSelected]}>
              <Ionicons name={option.icon} size={26} color={selected ? colors.onPrimary : colors.text} />
            </View>
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingBottom: 14 },
  item: { alignItems: 'center', gap: 6 },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.swatchBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  labelSelected: { fontWeight: '600', color: colors.link },
}));