import type { ColorDetector } from '../services/ColorDetector';
import type { GarmentColor } from '../services/garmentColors';

export class DetectGarmentColor {
  constructor(private readonly detector: ColorDetector) {}

  /** La detección es una ayuda opcional: si falla, devuelve null y la persona elige el color a mano. */
  async execute(photoUri: string): Promise<GarmentColor | null> {
    try {
      return await this.detector.detect(photoUri);
    } catch {
      return null;
    }
  }
}