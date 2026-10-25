import { CATEGORY_ZONE, type Garment } from '../entities/Garment';
import type { Outfit } from '../entities/Outfit';
import type { GarmentRepository } from '../repositories/GarmentRepository';
import { hexToHsl, isNeutral, scoreOutfit } from '../services/colorHarmony';

function describe(garments: Garment[]): Pick<Outfit, 'title' | 'summary'> {
  const colorful = garments.filter((garment) => !isNeutral(hexToHsl(garment.colorHex)));
  const summary = garments.map((garment) => garment.colorName).join(' + ');
  if (colorful.length === 0) return { title: 'Base neutra', summary };
  if (colorful.length === 1) return { title: `${colorful[0].colorName} con neutros`, summary };
  return { title: 'Combinación de colores', summary };
}

export class SuggestOutfits {
  constructor(private readonly repository: GarmentRepository) {}

  /**
   * Arma looks con una prenda de torso (de "arriba" o un "top"), una de piernas (de "abajo" o una "pollera")
   * y calzado, y los ordena por puntaje de color.
   */
  async execute(limit = 5): Promise<Outfit[]> {
    const garments = await this.repository.getAll();
    const tops = garments.filter((garment) => CATEGORY_ZONE[garment.category] === 'torso');
    const bottoms = garments.filter((garment) => CATEGORY_ZONE[garment.category] === 'piernas');
    const shoes = garments.filter((garment) => CATEGORY_ZONE[garment.category] === 'pies');
    if (tops.length === 0 || bottoms.length === 0) return [];

    const shoeOptions: (Garment | null)[] = shoes.length > 0 ? shoes : [null];
    const outfits: Outfit[] = [];
    for (const top of tops) {
      for (const bottom of bottoms) {
        for (const shoe of shoeOptions) {
          const items = shoe ? [top, bottom, shoe] : [top, bottom];
          outfits.push({
            id: items.map((item) => item.id).join('-'),
            garments: items,
            matchPercent: scoreOutfit(items.map((item) => item.colorHex)),
            ...describe(items),
          });
        }
      }
    }
    return outfits.sort((a, b) => b.matchPercent - a.matchPercent).slice(0, limit);
  }
}