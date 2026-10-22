import type { GarmentColor } from './garmentColors';

/** Mira una foto y dice de qué color es la prenda (null si no pudo saberlo). */
export interface ColorDetector {
  detect(photoUri: string): Promise<GarmentColor | null>;
}