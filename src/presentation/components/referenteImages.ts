import type { ImageContentPosition } from 'expo-image';
import { REFERENTE_IMAGES, type FotoEncuadrada, type ReferenteImages } from '../../data/seed/referenteImages';

const SIN_IMAGENES: ReferenteImages = { looks: [], lookThumbs: [] };

/** Las fotos de un referente; si no tiene carpeta, no hay portada ni looks. */
export function getReferenteImages(id: string): ReferenteImages {
  return REFERENTE_IMAGES[id] ?? SIN_IMAGENES;
}

const percent = (value: number) => `${Math.round(Math.min(Math.max(value, 0), 1) * 100)}%` as const;

/**
 * Cómo alinear una foto con contentFit="cover". Un recorte ya tiene la proporción de su cuadro: va centrado. Una foto
 * sin recorte se alinea por su foco (el centro de la cara), que así queda siempre adentro del cuadro.
 */
export function contentPositionOf(foto: FotoEncuadrada, fallback: ImageContentPosition = 'center'): ImageContentPosition {
  return foto.focus ? { left: percent(foto.focus.x), top: percent(foto.focus.y) } : fallback;
}
