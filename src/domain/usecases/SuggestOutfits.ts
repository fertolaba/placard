import { CATEGORY_ZONE, type Garment } from '../entities/Garment';
import type { Outfit } from '../entities/Outfit';
import type { GarmentRepository } from '../repositories/GarmentRepository';
import { scoreOutfit } from '../services/colorHarmony';
import { evaluateOutfitCoherence, lookFormalityLabel, type OutfitCoherence } from '../services/outfitCoherence';
import { echoBonus, explainOutfit } from '../services/outfitExplanation';
import { evaluatePalette, OFF_RULE_MAX_MATCH, paletteHexes, type AccentGroup, type PaletteEvaluation } from '../services/outfitPalette';
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

/** El título sale de los acentos del look, contando los secundarios vivos: "Rojo con neutros" incluye el rojo de unas zapatillas. */
function describe(garments: Garment[], groups: readonly AccentGroup[]): Pick<Outfit, 'title' | 'summary'> {
  const summary = garments.map((garment) => garment.colorName).join(' + ');
  if (groups.length === 0) return { title: 'Base neutra', summary };
  if (groups.length === 1) return { title: `${groups[0].color.name} con neutros`, summary };
  return { title: 'Combinación de colores', summary };
}

/** Cómo califican las reglas actuales un look, se proponga o no. Lo usan el mazo y Guardados. */
export interface OutfitRating {
  garments: Garment[];
  coherence: OutfitCoherence;
  palette: PaletteEvaluation;
  matchPercent: number;
  /** El motivo por el que no combina (formalidad, bocamanga, paleta…); null si no hay conflicto duro. */
  conflict: string | null;
  sharedStyle?: string; // el nombre del estilo en común ("Streetwear")
  lookFormality: string | null; // "Look casual", "Look clásico con toques casuales"
}

export function rateOutfit(top: Garment, bottom: Garment, shoe: Garment | null): OutfitRating {
  const coherence = evaluateOutfitCoherence(top, bottom, shoe);
  const garments = shoe ? [top, bottom, shoe] : [top, bottom];
  const palette = evaluatePalette(garments);
  // El color sale de los principales y de los secundarios vivos; los detalles que se repiten entre prendas suman un poco.
  const colorPercent = scoreOutfit(paletteHexes(garments)) + echoBonus(garments);
  const match = finalMatch(colorPercent, coherence.score);
  const sharedStyle = STYLE_REFERENCES.find((reference) => reference.id === coherence.sharedStyles[0])?.name;
  return {
    garments,
    coherence,
    palette,
    matchPercent: palette.offRule ? Math.min(match, OFF_RULE_MAX_MATCH) : match,
    conflict: coherence.conflictReason ?? (palette.discard ? (palette.reasons[0] ?? 'Los colores chocan') : null),
    ...(sharedStyle ? { sharedStyle } : {}),
    lookFormality: lookFormalityLabel(garments),
  };
}

/** La idea con estas prendas, o null si no combinan (coherencia, o una paleta que no se sostiene con los secundarios). */
function buildOutfit(top: Garment, bottom: Garment, shoe: Garment | null): Outfit | null {
  const rating = rateOutfit(top, bottom, shoe);
  const { coherence, palette, garments: items } = rating;
  if (coherence.hardConflict || coherence.score < MIN_COHERENCE || palette.discard) return null;
  const explanation = explainOutfit(items);
  return {
    id: items.map((item) => item.id).join('-'),
    garments: items,
    matchPercent: rating.matchPercent,
    ...(rating.sharedStyle ? { sharedStyle: rating.sharedStyle } : {}),
    ...(rating.lookFormality ? { lookFormality: rating.lookFormality } : {}),
    ...describe(items, palette.groups),
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