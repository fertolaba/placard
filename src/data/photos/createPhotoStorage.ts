import type { PhotoStorage } from '../../domain/services/PhotoStorage';

/**
 * Versión para la web: no copia nada, usa la dirección temporal de la foto tal cual
 * (alcanza para probar la pantalla). En el celular, Expo usa el archivo ".native" de al lado.
 */
export function createPhotoStorage(): PhotoStorage {
  return {
    async save(sourceUri) {
      return sourceUri;
    },
    resolve(ref) {
      return ref;
    },
    async remove() {},
  };
}