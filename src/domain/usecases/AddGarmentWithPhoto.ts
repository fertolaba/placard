import type { Garment, GarmentCategory } from '../entities/Garment';
import type { Season } from '../entities/Season';
import type { PhotoStorage } from '../services/PhotoStorage';
import type { AddGarment } from './AddGarment';

export interface GarmentDraft {
  name: string;
  category: GarmentCategory;
  colorHex: string;
  colorName: string;
  seasons: Season[];
  sporty: boolean;
  corte?: string;
  photoUri: string | null; // foto recién sacada o elegida (todavía en una carpeta temporal)
}

export class AddGarmentWithPhoto {
  constructor(
    private readonly addGarment: AddGarment,
    private readonly photos: PhotoStorage,
  ) {}

  /** Guarda la foto de forma permanente y después la prenda; si la prenda falla, borra la foto. */
  async execute(draft: GarmentDraft): Promise<Garment> {
    const { photoUri, ...data } = draft;
    const photoRef = photoUri === null ? null : await this.photos.save(photoUri);
    try {
      return await this.addGarment.execute({ ...data, photoRef });
    } catch (error) {
      if (photoRef !== null) await this.photos.remove(photoRef).catch(() => undefined);
      throw error;
    }
  }
}