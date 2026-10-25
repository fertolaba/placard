import type { Garment, GarmentCategory } from '../../domain/entities/Garment';
import { SEASONS } from '../../domain/entities/Season';
import { parseSecondaryColors } from './secondaryColors';

/** Forma de la prenda tal como viaja por la API (la fecha llega como texto). */
export interface GarmentDto {
  id: string;
  name: string;
  category: GarmentCategory;
  colorHex: string;
  colorName: string;
  secondaryColors?: unknown; // el servidor de ejemplo todavía no lo manda
  corte?: string; // el servidor de ejemplo todavía no lo manda; si llega, se usa
  imageUri: string | null;
  createdAt: string;
}

/** El servidor de ejemplo todavía no maneja épocas ni ropa deportiva: se asume que sirve para las tres y que no es deportiva. */
export function toGarment(dto: GarmentDto): Garment {
  return {
    ...dto,
    secondaryColors: parseSecondaryColors(dto.secondaryColors),
    photoRef: null,
    seasons: [...SEASONS],
    sporty: false,
    createdAt: new Date(dto.createdAt),
  };
}