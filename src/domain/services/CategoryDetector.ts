import type { GarmentCategory } from '../entities/Garment';
import type { Season } from '../entities/Season';
import type { GarmentColor } from './garmentColors';

/** Largo de manga que se ve en la foto. */
export type SleeveLength = 'larga' | 'corta';

/** Qué prenda parece ser: su tipo ("Remera", "Crop top", "Pollera") y a cuál de las categorías de la app pertenece. */
export interface GarmentTypeDetection {
  type: string;
  category: GarmentCategory;
  sleeve: SleeveLength | null; // null = no se sabe o no aplica (solo "arriba" y "top" tienen mangas)
  seasons: Season[] | null; // épocas deducidas del largo de manga; null = no se pudo deducir
  cut: string | null; // corte deducido de la silueta (uno de GARMENT_CUTS[category]); null = no se sabe o no aplica (calzado)
  sporty: boolean; // camiseta de fútbol u otra ropa deportiva (viene de "es_deportiva" en la respuesta de la IA)
  dominantColor: GarmentColor | null; // el color que ocupa más superficie de la prenda (de "color_dominante"); null = no lo dijo
  secondaryColors: GarmentColor[]; // colores de detalles (de "colores_secundarios"), sin el dominante; vacío si es lisa
}

/** Mira una foto y dice qué prenda es (null si no pudo saberlo). */
export interface CategoryDetector {
  detect(photoUri: string): Promise<GarmentTypeDetection | null>;
}
