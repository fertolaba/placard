import { isCalzadoTipo, type Garment, type GarmentCategory } from '../../domain/entities/Garment';
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
  calzadoTipo?: unknown; // lo mismo: si llega un tipo válido, se usa
  imageUri: string | null;
  createdAt: string;
}

/** El servidor de ejemplo todavía no maneja épocas, ropa deportiva ni clásica: se asume que sirve para las tres y que no es ninguna de las dos. */
export function toGarment(dto: GarmentDto): Garment {
  return {
    ...dto,
    secondaryColors: parseSecondaryColors(dto.secondaryColors),
    calzadoTipo: dto.category === 'calzado' && isCalzadoTipo(dto.calzadoTipo) ? dto.calzadoTipo : undefined,
    photoRef: null,
    seasons: [...SEASONS],
    sporty: false,
    classic: false,
    createdAt: new Date(dto.createdAt),
  };
}