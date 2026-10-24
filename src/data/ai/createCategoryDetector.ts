import type { CategoryDetector } from '../../domain/services/CategoryDetector';
import { createGeminiCategoryDetector } from './createGeminiCategoryDetector';
import type { GeminiImage } from './detectGarmentCategory';

/** Lee la foto (una dirección del navegador) y la devuelve en base64 junto con su formato. */
async function readImage(photoUri: string): Promise<GeminiImage> {
  const blob = await (await fetch(photoUri)).blob();
  return new Promise<GeminiImage>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la foto.'));
    reader.onload = () => {
      const result = String(reader.result); // "data:image/png;base64,...."
      resolve({ base64: result.slice(result.indexOf(',') + 1), mimeType: blob.type || 'image/jpeg' });
    };
    reader.readAsDataURL(blob);
  });
}

/** Versión para la web. En el celular, Expo usa el archivo ".native" de al lado. */
export function createCategoryDetector(apiKey: string): CategoryDetector {
  return createGeminiCategoryDetector(apiKey, readImage);
}