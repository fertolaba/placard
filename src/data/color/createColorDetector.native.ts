import { AlphaType, ColorType, Skia } from '@shopify/react-native-skia';
import type { ColorDetector } from '../../domain/services/ColorDetector';
import { detectGarmentColorFromPixels } from '../../domain/services/colorDetection';

const SAMPLE_SIZE = 48; // la foto se reduce a 48 x 48 píxeles antes de analizarla (rápido y liviano)

/** Versión para iPhone y Android: lee los píxeles de la foto con Skia (viene incluida en Expo Go). */
export function createColorDetector(): ColorDetector {
  return {
    async detect(photoUri) {
      try {
        const data = await Skia.Data.fromURI(photoUri);
        const image = Skia.Image.MakeImageFromEncoded(data);
        if (!image) return null;

        // Se dibuja la foto reducida en una superficie chica y se leen sus píxeles.
        const surface = Skia.Surface.MakeOffscreen(SAMPLE_SIZE, SAMPLE_SIZE);
        if (!surface) return null;
        surface.getCanvas().drawImageRect(
          image,
          Skia.XYWHRect(0, 0, image.width(), image.height()),
          Skia.XYWHRect(0, 0, SAMPLE_SIZE, SAMPLE_SIZE),
          Skia.Paint(),
        );
        surface.flush();
        const pixels = surface.makeImageSnapshot().readPixels(0, 0, {
          width: SAMPLE_SIZE,
          height: SAMPLE_SIZE,
          colorType: ColorType.RGBA_8888,
          alphaType: AlphaType.Unpremul,
        });
        if (!(pixels instanceof Uint8Array)) return null;

        return detectGarmentColorFromPixels(pixels, SAMPLE_SIZE, SAMPLE_SIZE);
      } catch (error) {
        console.warn('[detección de color] no se pudo analizar la foto:', error);
        return null;
      }
    },
  };
}