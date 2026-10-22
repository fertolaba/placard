import type { Ionicons } from '@expo/vector-icons';
import type { Season } from '../domain/entities/Season';

type IconName = keyof typeof Ionicons.glyphMap;

/** Cómo se muestra cada época del año: nombre e ícono. */
export const SEASON_UI: Record<Season, { label: string; icon: IconName }> = {
  verano: { label: 'Verano', icon: 'sunny-outline' },
  entretiempo: { label: 'Entretiempo', icon: 'leaf-outline' },
  invierno: { label: 'Invierno', icon: 'snow-outline' },
};