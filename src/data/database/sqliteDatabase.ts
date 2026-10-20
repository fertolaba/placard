import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

const DATABASE_NAME = 'placard.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Abre la base una sola vez, la deja actualizada y la comparte con todos los repositorios. */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    const opening = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL');
      await runMigrations(db);
      return db;
    })();
    opening.catch(() => {
      databasePromise = null; // si falló, el próximo intento vuelve a probar
    });
    databasePromise = opening;
  }
  return databasePromise;
}