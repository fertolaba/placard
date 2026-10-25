import type { CurrentUserId } from '../../domain/repositories/AuthRepository';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import type { LocalPhotoStorage } from '../photos/photoRefs';
import { getDatabase } from '../database/sqliteDatabase';
import { SqliteGarmentRepository } from './SqliteGarmentRepository';

/** Versión para iPhone y Android: usa la base SQLite del teléfono. */
export function createSqliteGarmentRepository(photos: LocalPhotoStorage, currentUserId: CurrentUserId): GarmentRepository {
  return new SqliteGarmentRepository(getDatabase, (ref) => photos.resolve(ref), currentUserId);
}