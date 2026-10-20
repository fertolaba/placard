import type { Garment, GarmentCategory } from '../entities/Garment';
import type { GarmentRepository } from '../repositories/GarmentRepository';

export class GetGarments {
  constructor(private readonly repository: GarmentRepository) {}

  async execute(category?: GarmentCategory): Promise<Garment[]> {
    const all = await this.repository.getAll();
    return category ? all.filter((garment) => garment.category === category) : all;
  }
}