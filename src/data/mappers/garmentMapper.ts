import type { Garment, GarmentCategory } from '../../domain/entities/Garment';

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

export function toGarment(dto: GarmentDto): Garment {
  return { ...dto, photoRef: null, createdAt: new Date(dto.createdAt) };
}