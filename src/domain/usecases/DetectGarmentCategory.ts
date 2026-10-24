import type { CategoryDetector, GarmentTypeDetection } from '../services/CategoryDetector';

export class DetectGarmentCategory {
  constructor(private readonly detector: CategoryDetector) {}

  /** La detección es una ayuda opcional: si falla, devuelve null y la persona elige la categoría a mano. */
  async execute(photoUri: string): Promise<GarmentTypeDetection | null> {
    try {
      return await this.detector.detect(photoUri);
    } catch {
      return null;
    }
  }
}