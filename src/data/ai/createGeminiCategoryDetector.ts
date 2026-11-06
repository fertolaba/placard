import { DetectionUnavailableError, type CategoryDetector } from '../../domain/services/CategoryDetector';
import { detectGarmentCategory, GeminiApiError, type GeminiImage, type GeminiOptions } from './detectGarmentCategory';

/** Clave y modelos (vacío = el modelo por defecto; sin alternativo = no se prueba otro). */
export interface GeminiDetectorConfig {
  apiKey: string;
  model?: string;
  fallbackModel?: string;
}

/** Para las pruebas: reemplazar la red y las esperas. */
export type GeminiDetectorTestOptions = Pick<GeminiOptions, 'fetchImpl' | 'sleep' | 'retryDelaysMs'>;

/**
 * Arma el detector: lee la foto como base64 (cada plataforma lo hace a su manera), la manda a Gemini
 * y devuelve la prenda. Sin clave configurada, queda desactivado. Los errores no incluyen nunca la clave.
 * Si no pudo analizarla, lanza DetectionUnavailableError: "saturated" si la IA siguió con mucha demanda, "failed" si no.
 */
export function createGeminiCategoryDetector(
  config: GeminiDetectorConfig,
  readImage: (photoUri: string) => Promise<GeminiImage>,
  testOptions: GeminiDetectorTestOptions = {},
): CategoryDetector {
  return {
    async detect(photoUri, hooks) {
      if (!config.apiKey) return null;
      try {
        return await detectGarmentCategory(await readImage(photoUri), {
          apiKey: config.apiKey,
          model: config.model || undefined,
          fallbackModel: config.fallbackModel || undefined,
          onRetry: hooks?.onRetry,
          ...testOptions,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'error desconocido';
        console.warn('[detección de prenda] no se pudo analizar la foto:', message);
        const saturated = error instanceof GeminiApiError && error.saturated;
        throw new DetectionUnavailableError(saturated ? 'saturated' : 'failed', message);
      }
    },
  };
}
