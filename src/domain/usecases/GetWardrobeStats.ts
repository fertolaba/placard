import type { GarmentCategory } from '../entities/Garment';
import type { GarmentRepository } from '../repositories/GarmentRepository';

export interface PaletteEntry {
  colorName: string;
  colorHex: string;
  count: number;
}

export interface WardrobeStats {
  total: number;
  byCategory: Record<GarmentCategory, number>;
  palette: PaletteEntry[]; // los colores más frecuentes de tu placard
}

export class GetWardrobeStats {
  constructor(private readonly repository: GarmentRepository) {}

  async execute(): Promise<WardrobeStats> {
    const garments = await this.repository.getAll();
    const byCategory: Record<GarmentCategory, number> = { arriba: 0, top: 0, abajo: 0, pollera: 0, calzado: 0 };
    const colors = new Map<string, PaletteEntry>();

    for (const garment of garments) {
      byCategory[garment.category] += 1;
      const entry = colors.get(garment.colorName);
      if (entry) entry.count += 1;
      else colors.set(garment.colorName, { colorName: garment.colorName, colorHex: garment.colorHex, count: 1 });
    }

    const palette = [...colors.values()]
      .sort((a, b) => b.count - a.count || a.colorName.localeCompare(b.colorName))
      .slice(0, 5);
    return { total: garments.length, byCategory, palette };
  }
}