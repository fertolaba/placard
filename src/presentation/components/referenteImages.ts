import { REFERENTE_IMAGES } from '../../data/seed/referenteImages';

const SIN_IMAGENES: { avatar?: number; looks: number[] } = { avatar: undefined, looks: [] };

/** Las fotos de un referente; si no tiene carpeta, no hay avatar ni looks. */
export function getReferenteImages(id: string) {
  return REFERENTE_IMAGES[id] ?? SIN_IMAGENES;
}
