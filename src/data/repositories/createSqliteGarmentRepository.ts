import type { CurrentUserId } from '../../domain/repositories/AuthRepository';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import type { LocalPhotoStorage } from '../photos/photoRefs';
import { InMemoryGarmentRepository } from './InMemoryGarmentRepository';

/**
 * Versión para la web: ahí no usamos SQLite, así que se usan datos en memoria.
 * En el celular, Expo elige automáticamente el archivo ".native" que está al lado.
 */
export function createSqliteGarmentRepository(photos: LocalPhotoStorage, currentUserId: CurrentUserId): GarmentRepository {
  return new InMemoryGarmentRepository(currentUserId, (ref) => photos.resolve(ref));
}