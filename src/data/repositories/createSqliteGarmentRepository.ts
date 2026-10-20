import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import type { PhotoStorage } from '../../domain/services/PhotoStorage';
import { InMemoryGarmentRepository } from './InMemoryGarmentRepository';

/**
 * Versión para la web: ahí no usamos SQLite, así que se usan datos en memoria.
 * En el celular, Expo elige automáticamente el archivo ".native" que está al lado.
 */
export function createSqliteGarmentRepository(photos: PhotoStorage): GarmentRepository {
  return new InMemoryGarmentRepository((ref) => photos.resolve(ref));
}