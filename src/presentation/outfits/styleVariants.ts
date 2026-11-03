import { CATEGORY_ZONE, type BodyZone, type Garment } from '../../domain/entities/Garment';
import type { StyleReference } from '../../domain/entities/StyleReference';
import { scoreOutfit } from '../../domain/services/colorHarmony';
import { garmentFitsSlot } from '../../domain/services/garmentFitsSlot';
import { echoBonus } from '../../domain/services/outfitExplanation';

export const STYLE_ZONES: readonly BodyZone[] = ['torso', 'piernas', 'pies'];
export const ZONE_LABELS: Record<BodyZone, string> = { torso: 'Arriba', piernas: 'Abajo', pies: 'Calzado' };

const MAX_VARIANTS = 60;
const MAX_EVALUATED = 2000; // tope de combinaciones a puntuar: un placard enorme no traba la pantalla

export interface StyleCoverage {
  reference: StyleReference;
  garments: Garment[]; // prendas del placard que encajan en alguna pieza del estilo
  byZone: Record<BodyZone, Garment[]>;
  missingZones: BodyZone[];
  coveredCount: number; // de 3
  combinations: number; // arriba x abajo x calzado, contando un hueco cuando falta un tipo
  complete: boolean;
}

export interface StyleVariant {
  id: string;
  top: Garment | null;
  bottom: Garment | null;
  shoe: Garment | null;
  complete: boolean;
  matchPercent: number;
}

export function styleCoverage(reference: StyleReference, wardrobe: readonly Garment[]): StyleCoverage {
  const garments = wardrobe.filter((garment) => reference.slots.some((slot) => garmentFitsSlot(reference, slot, garment)));
  const byZone: Record<BodyZone, Garment[]> = { torso: [], piernas: [], pies: [] };
  for (const garment of garments) byZone[CATEGORY_ZONE[garment.category]].push(garment);

  const missingZones = STYLE_ZONES.filter((zone) => byZone[zone].length === 0);
  return {
    reference,
    garments,
    byZone,
    missingZones,
    coveredCount: STYLE_ZONES.length - missingZones.length,
    combinations: garments.length === 0 ? 0 : STYLE_ZONES.reduce((total, zone) => total * Math.max(1, byZone[zone].length), 1),
    complete: missingZones.length === 0,
  };
}

/** La prenda que representa a una zona: la primera con foto o, si ninguna tiene, la primera. */
export function representativeGarment(items: readonly Garment[]): Garment | null {
  return items.find((item) => item.imageUri !== null) ?? items[0] ?? null;
}

export function zoneGarments({ byZone }: StyleCoverage): Record<BodyZone, Garment | null> {
  return {
    torso: representativeGarment(byZone.torso),
    piernas: representativeGarment(byZone.piernas),
    pies: representativeGarment(byZone.pies),
  };
}

/** Recorta la lista más larga hasta que el producto entre en el tope de combinaciones a puntuar. */
function boundedOptions({ byZone }: StyleCoverage): (Garment | null)[][] {
  const options: (Garment | null)[][] = STYLE_ZONES.map((zone) => (byZone[zone].length > 0 ? [...byZone[zone]] : [null]));
  const product = () => options.reduce((total, list) => total * list.length, 1);
  while (product() > MAX_EVALUATED) {
    options.reduce((longest, list) => (list.length > longest.length ? list : longest)).pop();
  }
  return options;
}

/** Todas las combinaciones, ordenadas por el mismo puntaje de color de SuggestOutfits; las incompletas van al final. */
export function buildStyleVariants(coverage: StyleCoverage, limit = MAX_VARIANTS): StyleVariant[] {
  if (coverage.garments.length === 0) return [];
  const [tops, bottoms, shoes] = boundedOptions(coverage);
  const variants: StyleVariant[] = [];
  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const items = [top, bottom, shoe].filter((item): item is Garment => item !== null);
        variants.push({
          id: items.map((item) => item.id).join('-'), // igual que SuggestOutfits: guardar un look lo marca en los dos lados
          top,
          bottom,
          shoe,
          complete: items.length === STYLE_ZONES.length,
          matchPercent: Math.min(100, scoreOutfit(items.map((item) => item.colorHex)) + echoBonus(items)),
        });
      }
    }
  }
  return variants
    .sort((a, b) => Number(b.complete) - Number(a.complete) || b.matchPercent - a.matchPercent)
    .slice(0, limit);
}
