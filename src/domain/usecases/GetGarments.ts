import type { Garment, GarmentCategory } from '../entities/Garment';
import type { Season } from '../entities/Season';
import type { GarmentRepository } from '../repositories/GarmentRepository';

export interface GarmentFilters {
  category?: GarmentCategory;
  season?: Season;
}

export class GetGarments {
  constructor(private readonly repository: GarmentRepository) {}

  /** Sin filtros devuelve todas; con varios filtros, deja solo las prendas que cumplen todos. */
  async execute(filters: GarmentFilters = {}): Promise<Garment[]> {
    const all = await this.repository.getAll();
    return all.filter(
      (garment) =>
        (!filters.category || garment.category === filters.category) &&
        (!filters.season || garment.seasons.includes(filters.season)),
    );
  }
}