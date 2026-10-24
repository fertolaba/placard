import type { GarmentCategory } from '../entities/Garment';
import type { Season } from '../entities/Season';

/** Largo de manga que se ve en la foto. */
export type SleeveLength = 'larga' | 'corta';

/** Qué prenda parece ser: su tipo ("Remera") y a cuál de las categorías de la app pertenece. */
export interface GarmentTypeDetection {
  type: string;
  category: GarmentCategory;
  sleeve: SleeveLength | null; // null = no se sabe o no aplica (un pantalón, un calzado)
  seasons: Season[] | null; // épocas deducidas del largo de manga; null = no se pudo deducir
}

/** Mira una foto y dice qué prenda es (null si no pudo saberlo). */
export interface CategoryDetector {
  detect(photoUri: string): Promise<GarmentTypeDetection | null>;
}
