import { CATEGORY_ZONE, type BodyZone, type Garment } from '../../domain/entities/Garment';
import type { Outfit } from '../../domain/entities/Outfit';
import type { SavedOutfit } from '../../domain/entities/SavedOutfit';
import { scoreOutfit } from '../../domain/services/colorHarmony';
import { echoBonus, explainOutfit } from '../../domain/services/outfitExplanation';
import { STYLE_REFERENCES } from '../../domain/services/styleCatalog';
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
}

/** Arma lo que muestra Guardados. Devuelve null si alguna prenda del look ya no está en el placard. */
export function savedOutfitView(saved: SavedOutfit, wardrobe: ReadonlyMap<string, Garment>): SavedOutfitView | null {
  const found = saved.garmentIds.map((id) => wardrobe.get(id));
  if (found.length === 0 || found.some((garment) => garment === undefined)) return null;
  const garments = found as Garment[];
  const inZone = (zone: BodyZone) => garments.find((item) => CATEGORY_ZONE[item.category] === zone) ?? null;
  const top = inZone('torso');
  const bottom = inZone('piernas');

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
      shoe: inZone('pies'),
      complete: garments.length === 3,
      matchPercent: Math.min(100, scoreOutfit(garments.map((item) => item.colorHex)) + echoBonus(garments)),
    },
    gradient: styleColors ? { from: styleColors.c1, to: styleColors.c2 } : { from: fallback.bg1, to: fallback.bg2 },
    title: saved.title ?? [top, bottom].flatMap((item) => (item ? [item.name] : [])).join(' + '),
    origin: styleName ?? 'Por color',
  };
}

export function matchesSavedFilter(view: SavedOutfitView, filter: SavedFilter): boolean {
  if (filter === 'todos') return true;
  return filter === 'estilo' ? view.saved.styleId !== null : view.saved.styleId === null;
}

/** Lo que necesita la ventana "Ver por qué", la misma de Outfits. */
export function savedOutfitDetail({ saved, garments, variant, title }: SavedOutfitView): Outfit {
  const explanation = explainOutfit(garments);
  return {
    id: saved.id,
    garments,
    matchPercent: variant.matchPercent,
    title,
    summary: garments.map((garment) => garment.colorName).join(' + '),
    description: explanation.description,
    explanation,
  };
}
