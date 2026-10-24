import type { CategoryDetector } from '../../domain/services/CategoryDetector';
import { detectGarmentCategory, type GeminiImage } from './detectGarmentCategory';

/**
 * Arma el detector: lee la foto como base64 (cada plataforma lo hace a su manera), la manda a Gemini
 * y devuelve la prenda. Sin clave configurada, queda desactivado. Los errores no incluyen nunca la clave.
 */
export function createGeminiCategoryDetector(
  apiKey: string,
  readImage: (photoUri: string) => Promise<GeminiImage>,
  fetchImpl?: typeof fetch,
): CategoryDetector {
  return {
    async detect(photoUri) {
      if (!apiKey) return null;
      try {
        return await detectGarmentCategory(await readImage(photoUri), { apiKey, fetchImpl });
      } catch (error) {
        console.warn('[detección de prenda] no se pudo analizar la foto:', error instanceof Error ? error.message : 'error desconocido');
        return null;
      }
    },
  };
}
