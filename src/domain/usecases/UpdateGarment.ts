import type { Garment, GarmentCategory } from '../entities/Garment';
import type { GarmentRepository } from '../repositories/GarmentRepository';
import { normalizeGarmentData } from '../services/garmentRules';
import type { PhotoStorage } from '../services/PhotoStorage';

export interface GarmentEdit {
  id: string;
  name: string;
  category: GarmentCategory;
  colorHex: string;
  colorName: string;
  newPhotoUri: string | null; // null = dejar la foto que ya tiene
}

export class UpdateGarment {
  constructor(
    private readonly repository: GarmentRepository,
    private readonly photos: PhotoStorage,
  ) {}

  async execute(edit: GarmentEdit): Promise<Garment> {
    const current = await this.repository.getById(edit.id);
    if (!current) throw new Error('La prenda ya no existe.');

    const { id, newPhotoUri, ...fields } = edit;
    const data = normalizeGarmentData({ ...fields, photoRef: current.photoRef });
    if (newPhotoUri === null) return this.repository.update(id, data);

    const newRef = await this.photos.save(newPhotoUri);
    try {
      const updated = await this.repository.update(id, { ...data, photoRef: newRef });
      if (current.photoRef !== null && current.photoRef !== newRef) {
        await this.photos.remove(current.photoRef).catch(() => undefined); // la foto vieja ya no se usa
      }
      return updated;
    } catch (error) {
      await this.photos.remove(newRef).catch(() => undefined); // no dejar la foto nueva huérfana
      throw error;
    }
  }
}