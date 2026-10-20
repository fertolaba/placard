import { Directory, File, Paths } from 'expo-file-system';
import type { PhotoStorage } from '../../domain/services/PhotoStorage';
import { buildPhotoRef } from './photoRefs';

const PHOTOS_DIRECTORY = 'garments';

function fileFor(ref: string): File {
  return new File(Paths.document, ...ref.split('/'));
}

/** Versión para iPhone y Android: guarda las fotos en la carpeta privada de la app. */
export function createPhotoStorage(): PhotoStorage {
  return {
    async save(sourceUri) {
      new Directory(Paths.document, PHOTOS_DIRECTORY).create({ idempotent: true });
      const ref = buildPhotoRef(PHOTOS_DIRECTORY, sourceUri);
      await new File(sourceUri).copy(fileFor(ref));
      return ref;
    },
    resolve(ref) {
      return fileFor(ref).uri;
    },
    async remove(ref) {
      const file = fileFor(ref);
      if (file.exists) file.delete();
    },
  };
}