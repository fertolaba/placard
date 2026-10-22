import type { Garment, GarmentCategory } from '../../domain/entities/Garment';
import { SEASONS } from '../../domain/entities/Season';

/** Forma de la prenda tal como viaja por la API (la fecha llega como texto). */
export interface GarmentDto {
  id: string;
  name: string;
  category: GarmentCategory;
  colorHex: string;
  colorName: string;
  imageUri: string | null;
  createdAt: string;
}

/** El servidor de ejemplo todavía no maneja épocas: se asume que sirve para las tres. */
export function toGarment(dto: GarmentDto): Garment {
  return { ...dto, photoRef: null, seasons: [...SEASONS], createdAt: new Date(dto.createdAt) };
}