import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { withDelay, withTiming, type SharedValue } from 'react-native-reanimated';
import type { Garment } from '../../domain/entities/Garment';
import { useThemeColors, type ThemeColorMap } from '../theme/SeasonThemeProvider';
import { GarmentSwatch } from './GarmentSwatch';
import { PressableScale } from './PressableScale';

const PADDING = 8;
const BORDER = 1;
const SWATCH_HEIGHT = 110;
const NAME_LINE = 20;
const META_LINE = 16;

/** Alto fijo de la tarjeta (con interlineado explícito), para que AddGarmentCard mida lo mismo. */
export const GARMENT_CARD_HEIGHT = BORDER + PADDING + SWATCH_HEIGHT + 8 + NAME_LINE + 2 + META_LINE + 4 + PADDING + BORDER;

const ENTER_DISTANCE = 14;
const ENTER_STAGGER_MS = 50;
const ENTER_DURATION_MS = 280;
const ENTER_MAX_STEPS = 8; // las que quedan fuera de la pantalla no tienen que hacer esperar a nadie

/**
 * Entrada de las tarjetas: suben con un fundido, escalonadas.
 * entranceDone se lee recién al montar, así una tarjeta que vuelve a entrar al scrollear no repite la animación.
 */
export function cardEntering(index: number, entranceDone: SharedValue<boolean>) {
  return () => {
    'worklet';
    const done = entranceDone.get();
    const delay = done ? 0 : Math.min(index, ENTER_MAX_STEPS) * ENTER_STAGGER_MS;
    const duration = done ? 0 : ENTER_DURATION_MS;
    return {
      initialValues: { opacity: done ? 1 : 0, transform: [{ translateY: done ? 0 : ENTER_DISTANCE }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, { duration })),
        transform: [{ translateY: withDelay(delay, withTiming(0, { duration })) }],
      },
    };
  };
}

const CARD_COLORS: ThemeColorMap = { backgroundColor: 'card', borderColor: 'cardBorder' };
const NAME_COLORS: ThemeColorMap = { color: 'text' };
const META_COLORS: ThemeColorMap = { color: 'textMuted' };

interface Props {
  garment: Garment;
  width: number;
  index: number;
  entranceDone: SharedValue<boolean>;
  onPress: (id: string) => void;
}

export const GarmentCard = memo(function GarmentCard({ garment, width, index, entranceDone, onPress }: Props) {
  const cardColors = useThemeColors(CARD_COLORS);
  const nameColors = useThemeColors(NAME_COLORS);
  const metaColors = useThemeColors(META_COLORS);
  return (
    <Animated.View entering={cardEntering(index, entranceDone)}>
      <PressableScale
        onPress={() => onPress(garment.id)}
        accessibilityRole="button"
        accessibilityLabel={`${garment.name}, ${garment.colorName}`}
        accessibilityHint="Abre el detalle de la prenda"
        style={[styles.card, { width }, cardColors]}
      >
        <GarmentSwatch garment={garment} height={SWATCH_HEIGHT} />
        <Animated.Text style={[styles.name, nameColors]} numberOfLines={1}>
          {garment.name}
        </Animated.Text>
        <Animated.Text style={[styles.meta, metaColors]} numberOfLines={1}>
          {garment.colorName}
        </Animated.Text>
      </PressableScale>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: BORDER, padding: PADDING },
  name: { fontSize: 15, lineHeight: NAME_LINE, fontWeight: '600', marginTop: 8, paddingHorizontal: 4 },
  meta: { fontSize: 12, lineHeight: META_LINE, marginTop: 2, marginBottom: 4, paddingHorizontal: 4 },
});
