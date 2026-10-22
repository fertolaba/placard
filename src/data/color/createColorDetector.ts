import type { ColorDetector } from '../../domain/services/ColorDetector';

/**
 * Versión para la web: ahí no se detecta el color (Skia necesitaría una configuración extra),
 * así que la persona lo elige a mano. En el celular, Expo usa el archivo ".native" de al lado.
 */
export function createColorDetector(): ColorDetector {
  return {
    async detect() {
      return null;
    },
  };
}