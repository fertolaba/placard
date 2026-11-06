import { CATEGORY_ZONE, type BodyZone, type Garment } from '../../domain/entities/Garment';
import type { Outfit } from '../../domain/entities/Outfit';
import type { SavedOutfit } from '../../domain/entities/SavedOutfit';
import { scoreOutfit } from '../../domain/services/colorHarmony';
import { echoBonus, explainOutfit } from '../../domain/services/outfitExplanation';
import { STYLE_REFERENCES } from '../../domain/services/styleCatalog';
import { rateOutfit, type OutfitRating } from '../../domain/usecases/SuggestOutfits';
import { deckGradient } from './deckAppearance';
import { STYLE_GRADIENTS } from './styleGradients';
import type { StyleVariant } from './styleVariants';

export type SavedFilter = 'todos' | 'color' | 'estilo';

export interface SavedOutfitView {
  saved: SavedOutfit;
  garments: Garment[];
  variant: StyleVariant;
  gradient: { from: string; to: string };
  title: string;
  origin: string; // "Por color" o el nombre del estilo
  /** Calificación con las reglas actuales (coherencia y paleta); null si al look le falta arriba o abajo. */
  rating: OutfitRating | null;
  /** Por qué ya no combina con las reglas actuales; null si combina o si está incompleto. Nunca se borra solo. */
  conflict: string | null;
}

/**
 * Arma lo que muestra Guardados. Una prenda borrada deja su zona vacía y el look queda incompleto;
 * devuelve null solo si no queda ninguna prenda para mostrar.
 * El match se recalcula con las reglas actuales del mazo (color, coherencia y paleta), sin tocar lo guardado: un look
 * guardado antes de una regla nueva que ahora la rompe queda marcado con `conflict`.
 */
export function savedOutfitView(saved: SavedOutfit, wardrobe: ReadonlyMap<string, Garment>): SavedOutfitView | null {
  const garments = saved.garmentIds.flatMap((id) => wardrobe.get(id) ?? []);
  if (garments.length === 0) return null;
  const inZone = (zone: BodyZone) => garments.find((item) => CATEGORY_ZONE[item.category] === zone) ?? null;
  const top = inZone('torso');
  const bottom = inZone('piernas');

  const shoe = inZone('pies');
  const rating = top && bottom ? rateOutfit(top, bottom, shoe) : null;

  const styleColors = saved.styleId ? STYLE_GRADIENTS[saved.styleId] : null;
  const fallback = deckGradient({ garments });
  const styleName = STYLE_REFERENCES.find((reference) => reference.id === saved.styleId)?.name;
  return {
    saved,
    garments,
    variant: {
      id: saved.id,
      top,
      bottom,
      shoe,
      complete: garments.length === 3,
      // Sin arriba o abajo no hay coherencia que medir: queda solo el color, como antes.
      matchPercent: rating?.matchPercent ?? Math.min(100, scoreOutfit(garments.map((item) => item.colorHex)) + echoBonus(garments)),
    },
    gradient: styleColors ? { from: styleColors.c1, to: styleColors.c2 } : { from: fallback.bg1, to: fallback.bg2 },
    // Si solo queda el calzado, no hay arriba ni abajo para nombrar el look.
    title: saved.title ?? ([top, bottom].flatMap((item) => (item ? [item.name] : [])).join(' + ') || garments[0].name),
    origin: styleName ?? 'Por color',
    rating,
    conflict: rating?.conflict ?? null,
  };
}

export function matchesSavedFilter(view: SavedOutfitView, filter: SavedFilter): boolean {
  if (filter === 'todos') return true;
  return filter === 'estilo' ? view.saved.styleId !== null : view.saved.styleId === null;
}

/** Lo que necesita la ventana "Ver por qué", la misma de Outfits. */
export function savedOutfitDetail({ saved, garments, variant, title, rating, conflict }: SavedOutfitView): Outfit {
  const explanation = explainOutfit(garments);
  return {
    id: saved.id,
    garments,
    matchPercent: variant.matchPercent,
    title,
    ...(rating?.sharedStyle ? { sharedStyle: rating.sharedStyle } : {}),
    ...(rating?.lookFormality ? { lookFormality: rating.lookFormality } : {}),
    ...(conflict ? { conflict } : {}),
    summary: garments.map((garment) => garment.colorName).join(' + '),
    description: explanation.description,
    explanation,
  };
}
