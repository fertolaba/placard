import { File } from 'expo-file-system';

/** Versión para iPhone y Android: lee la foto del teléfono para subirla. */
export function readPhotoBytes(uri: string): Promise<ArrayBuffer> {
  return new File(uri).arrayBuffer();
}
