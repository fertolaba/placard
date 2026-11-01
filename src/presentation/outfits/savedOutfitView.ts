import { CATEGORY_ZONE, type BodyZone, type Garment } from '../../domain/entities/Garment';
import type { SavedOutfit } from '../../domain/entities/SavedOutfit';
import { scoreOutfit } from '../../domain/services/colorHarmony';
import { echoBonus } from '../../domain/services/outfitExplanation';
import { deckGradient } from './deckAppearance';
import { STYLE_GRADIENTS } from './styleGradients';
import type { StyleVariant } from './styleVariants';

export interface SavedOutfitView {
  saved: SavedOutfit;
  variant: StyleVariant;
  gradient: { from: string; to: string };
}

/** Arma lo que muestra Guardados. Devuelve null si alguna prenda del look ya no está en el placard. */
export function savedOutfitView(saved: SavedOutfit, wardrobe: ReadonlyMap<string, Garment>): SavedOutfitView | null {
  const garments = saved.garmentIds.map((id) => wardrobe.get(id));
  if (garments.length === 0 || garments.some((garment) => garment === undefined)) return null;
  const items = garments as Garment[];
  const inZone = (zone: BodyZone) =>
    items.find((item) => CATEGORY_ZONE[item.category] === zone) ?? null;

  const styleColors = saved.styleId ? STYLE_GRADIENTS[saved.styleId] : null;
  const fallback = deckGradient({ garments: items });
  return {
    saved,
    variant: {
      id: saved.id,
      top: inZone('torso'),
      bottom: inZone('piernas'),
      shoe: inZone('pies'),
      complete: items.length === 3,
      matchPercent: Math.min(100, scoreOutfit(items.map((item) => item.colorHex)) + echoBonus(items)),
    },
    gradient: styleColors ? { from: styleColors.c1, to: styleColors.c2 } : { from: fallback.bg1, to: fallback.bg2 },
  };
}
