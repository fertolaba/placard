import type { Garment } from '../entities/Garment';
import type { GarmentRepository } from '../repositories/GarmentRepository';

export class GetGarment {
  constructor(private readonly repository: GarmentRepository) {}

  /** Devuelve null si la prenda no existe (por ejemplo, ya se borró). */
  execute(id: string): Promise<Garment | null> {
    return this.repository.getById(id);
  }
}