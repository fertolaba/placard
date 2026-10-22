import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { SEASONS, normalizeSeasons, type Season } from '../../domain/entities/Season';
import { SEASON_UI } from '../seasonUi';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  value: readonly Season[];
  onChange: (value: Season[]) => void;
}

/** Elección múltiple: una prenda puede servir para varias épocas del año. */
export function SeasonPicker({ value, onChange }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  const toggle = (season: Season) =>
    onChange(normalizeSeasons(value.includes(season) ? value.filter((item) => item !== season) : [...value, season]));

  return (
    <View style={styles.row}>
      {SEASONS.map((season) => {
        const selected = value.includes(season);
        const ui = SEASON_UI[season];
        return (
          <Pressable
            key={season}
            onPress={() => toggle(season)}
            accessibilityRole="button"
            accessibilityLabel={ui.label}
            accessibilityState={{ selected }}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Ionicons name={ui.icon} size={24} color={selected ? colors.link : colors.textMuted} />
            <Text style={[styles.label, selected && styles.labelSelected]}>{ui.label}</Text>
            {selected ? (
              <View style={styles.badge}>
                <Ionicons name="checkmark" size={11} color={colors.onPrimary} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.swatchBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  chipSelected: { backgroundColor: colors.primaryFill, borderColor: colors.link, borderWidth: 2 },
  label: { fontSize: 13, fontWeight: '500', color: colors.text },
  labelSelected: { fontWeight: '600', color: colors.link },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));