import { CATEGORY_ZONE, type Garment } from '../entities/Garment';
import type { Outfit } from '../entities/Outfit';
import type { GarmentRepository } from '../repositories/GarmentRepository';
import { hexToHsl, isNeutral, scoreOutfit } from '../services/colorHarmony';
import { evaluateOutfitCoherence } from '../services/outfitCoherence';
import { echoBonus, explainOutfit } from '../services/outfitExplanation';
import { STYLE_REFERENCES } from '../services/styleCatalog';

/** Peso del color y de la coherencia de las prendas en el match final (suman 1). */
export const COLOR_WEIGHT = 0.5;
export const COHERENCE_WEIGHT = 0.5;
/** Por debajo de esta coherencia la idea no se propone, aunque el color sea perfecto. */
export const MIN_COHERENCE = 0.4;

/** Match final de 0 a 100: solo llega a 100 si el color y la coherencia son perfectos. */
export function finalMatch(colorPercent: number, coherence: number): number {
  const value = COLOR_WEIGHT * Math.min(100, colorPercent) + COHERENCE_WEIGHT * 100 * coherence;
  return Math.floor(value + 1e-9); // el margen evita que 100 quede en 99 por el redondeo de los decimales
}

function describe(garments: Garment[]): Pick<Outfit, 'title' | 'summary'> {
  const colorful = garments.filter((garment) => !isNeutral(hexToHsl(garment.colorHex)));
  const summary = garments.map((garment) => garment.colorName).join(' + ');
  if (colorful.length === 0) return { title: 'Base neutra', summary };
  if (colorful.length === 1) return { title: `${colorful[0].colorName} con neutros`, summary };
  return { title: 'Combinación de colores', summary };
}

/** La idea con estas prendas, o null si no combinan (conflicto duro o coherencia por debajo del mínimo). */
function buildOutfit(top: Garment, bottom: Garment, shoe: Garment | null): Outfit | null {
  const coherence = evaluateOutfitCoherence(top, bottom, shoe);
  if (coherence.hardConflict || coherence.score < MIN_COHERENCE) return null;
  const items = shoe ? [top, bottom, shoe] : [top, bottom];
  const explanation = explainOutfit(items);
  // El color sale de los colores dominantes; los detalles que se repiten entre prendas suman un poco.
  const colorPercent = scoreOutfit(items.map((item) => item.colorHex)) + echoBonus(items);
  const sharedStyle = STYLE_REFERENCES.find((reference) => reference.id === coherence.sharedStyles[0])?.name;
  return {
    id: items.map((item) => item.id).join('-'),
    garments: items,
    matchPercent: finalMatch(colorPercent, coherence.score),
    ...(sharedStyle ? { sharedStyle } : {}),
    ...describe(items),
    description: explanation.description,
    explanation,
  };
}

export class SuggestOutfits {
  constructor(private readonly repository: GarmentRepository) {}

  /**
   * Arma looks con una prenda de torso (de "arriba" o un "top"), una de piernas (de "abajo" o una "pollera")
   * y el calzado que mejor puntúa para ese par. Descarta las que no combinan entre sí (corte, tipo, estilo y
   * bocamanga con calzado) y ordena el resto por el match final: mitad color, mitad coherencia.
   */
  async execute(limit = 5): Promise<Outfit[]> {
    const garments = await this.repository.getAll();
    const tops = garments.filter((garment) => CATEGORY_ZONE[garment.category] === 'torso');
    const bottoms = garments.filter((garment) => CATEGORY_ZONE[garment.category] === 'piernas');
    const shoes = garments.filter((garment) => CATEGORY_ZONE[garment.category] === 'pies');
    if (tops.length === 0 || bottoms.length === 0) return [];

    const outfits: Outfit[] = [];
    for (const top of tops) {
      for (const bottom of bottoms) {
        // Una idea por arriba + abajo, con el calzado que mejor puntúa (color y coherencia). Si ningún calzado va
        // (por ejemplo, solo botas para un jogger), la idea se muestra sin calzado, como cuando no hay calzado cargado.
        let best: Outfit | null = null;
        for (const shoe of shoes) {
          const outfit = buildOutfit(top, bottom, shoe);
          if (outfit && (!best || outfit.matchPercent > best.matchPercent)) best = outfit;
        }
        best ??= buildOutfit(top, bottom, null);
        if (best) outfits.push(best);
      }
    }
    return outfits.sort((a, b) => b.matchPercent - a.matchPercent).slice(0, limit);
  }
}