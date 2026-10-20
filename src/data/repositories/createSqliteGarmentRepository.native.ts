import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import type { PhotoStorage } from '../../domain/services/PhotoStorage';
import { getDatabase } from '../database/sqliteDatabase';
import { SqliteGarmentRepository } from './SqliteGarmentRepository';

/** Versión para iPhone y Android: usa la base SQLite del teléfono. */
export function createSqliteGarmentRepository(photos: PhotoStorage): GarmentRepository {
  return new SqliteGarmentRepository(getDatabase, (ref) => photos.resolve(ref));
}