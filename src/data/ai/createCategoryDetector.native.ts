import { ImageFormat, Skia } from '@shopify/react-native-skia';
import type { CategoryDetector } from '../../domain/services/CategoryDetector';
import { createGeminiCategoryDetector } from './createGeminiCategoryDetector';
import type { GeminiImage } from './detectGarmentCategory';

const MAX_SIDE = 512; // la foto se achica antes de mandarla: llega rápido y gasta menos datos

/** Lee la foto, la achica a un máximo de 512 px y la devuelve como JPEG en base64. */
async function readSmallJpeg(photoUri: string): Promise<GeminiImage> {
  const data = await Skia.Data.fromURI(photoUri);
  const image = Skia.Image.MakeImageFromEncoded(data);
  if (!image) throw new Error('No se pudo leer la foto.');

  const scale = Math.min(1, MAX_SIDE / Math.max(image.width(), image.height()));
  const width = Math.max(1, Math.round(image.width() * scale));
  const height = Math.max(1, Math.round(image.height() * scale));
  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (!surface) throw new Error('No se pudo preparar la foto.');
  surface
    .getCanvas()
    .drawImageRect(image, Skia.XYWHRect(0, 0, image.width(), image.height()), Skia.XYWHRect(0, 0, width, height), Skia.Paint());
  surface.flush();
  return { base64: surface.makeImageSnapshot().encodeToBase64(ImageFormat.JPEG, 80), mimeType: 'image/jpeg' };
}

/** Versión para iPhone y Android. */
export function createCategoryDetector(apiKey: string): CategoryDetector {
  return createGeminiCategoryDetector(apiKey, readSmallJpeg);
}