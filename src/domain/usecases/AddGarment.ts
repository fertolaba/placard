import type { Garment, NewGarment } from '../entities/Garment';
import type { GarmentRepository } from '../repositories/GarmentRepository';
import { normalizeGarmentData } from '../services/garmentRules';

export class AddGarment {
  constructor(private readonly repository: GarmentRepository) {}

  async execute(input: NewGarment): Promise<Garment> {
    return this.repository.add(normalizeGarmentData(input));
  }
}