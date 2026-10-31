import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { type SharedValue } from 'react-native-reanimated';
import { useSeasonTheme, useThemeColors, type ThemeColorMap } from '../theme/SeasonThemeProvider';
import { cardEntering, GARMENT_CARD_HEIGHT } from './GarmentCard';
import { PressableScale } from './PressableScale';

const CARD_COLORS: ThemeColorMap = { backgroundColor: 'card', borderColor: 'dashedBorder' };
const NAME_COLORS: ThemeColorMap = { color: 'text' };
const META_COLORS: ThemeColorMap = { color: 'textMuted' };

interface Props {
  width: number;
  index: number;
  entranceDone: SharedValue<boolean>;
  onPress: () => void;
}

/** Última tarjeta de la grilla: mismo tamaño que GarmentCard, con el contenido centrado. */
export const AddGarmentCard = memo(function AddGarmentCard({ width, index, entranceDone, onPress }: Props) {
  const { theme } = useSeasonTheme();
  const cardColors = useThemeColors(CARD_COLORS);
  const nameColors = useThemeColors(NAME_COLORS);
  const metaColors = useThemeColors(META_COLORS);
  return (
    <Animated.View entering={cardEntering(index, entranceDone)}>
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Agregar prenda"
        accessibilityHint="Abre la cámara o la galería para subir una prenda"
        style={[styles.card, { width }, cardColors]}
      >
        <Ionicons name="add" size={48} color={theme.addButton} />
        <Animated.Text style={[styles.name, nameColors]} numberOfLines={1}>
          Agregar prenda
        </Animated.Text>
        <Animated.Text style={[styles.meta, metaColors]} numberOfLines={1}>
          Subir más
        </Animated.Text>
      </PressableScale>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    height: GARMENT_CARD_HEIGHT,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  name: { fontSize: 15, fontWeight: '600', marginTop: 4, paddingHorizontal: 4, textAlign: 'center' },
  meta: { fontSize: 12, marginTop: 2, paddingHorizontal: 4, textAlign: 'center' },
});
