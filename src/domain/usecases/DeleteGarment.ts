import type { GarmentRepository } from '../repositories/GarmentRepository';
import type { PhotoStorage } from '../services/PhotoStorage';

export class DeleteGarment {
  constructor(
    private readonly repository: GarmentRepository,
    private readonly photos: PhotoStorage,
  ) {}

  /** Borra la prenda y su foto. Si la prenda ya no existe, no hace nada. */
  async execute(id: string): Promise<void> {
    const current = await this.repository.getById(id);
    if (!current) return;
    await this.repository.remove(id);
    if (current.photoRef !== null) await this.photos.remove(current.photoRef).catch(() => undefined);
  }
}