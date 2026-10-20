import type { SQLiteDatabase } from 'expo-sqlite';
import { SAMPLE_GARMENTS } from '../seed/sampleGarments';

export const LATEST_VERSION = 2;

/**
 * Lleva la base a la última versión. La versión se guarda en la propia base (PRAGMA user_version),
 * así que para cambiar la estructura más adelante se agrega un bloque "if (version < 3)" y se sube LATEST_VERSION.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  if (version >= LATEST_VERSION) return;

  await db.withTransactionAsync(async () => {
    if (version < 1) {
      await db.execAsync(`
        CREATE TABLE garments (
          id         TEXT PRIMARY KEY NOT NULL,
          name       TEXT NOT NULL,
          category   TEXT NOT NULL CHECK (category IN ('arriba', 'abajo', 'calzado')),
          color_hex  TEXT NOT NULL,
          color_name TEXT NOT NULL,
          image_uri  TEXT,
          created_at TEXT NOT NULL
        );
      `);
    }
    if (version < 2) {
      // La columna guarda la referencia de la foto (no una dirección), así que se renombra para no confundir.
      await db.execAsync('ALTER TABLE garments RENAME COLUMN image_uri TO photo_ref');
      // Las prendas de prueba de las primeras versiones ya no se cargan: se sacan de las bases que las tenían.
      const ids = SAMPLE_GARMENTS.map((sample) => sample.id);
      await db.runAsync(`DELETE FROM garments WHERE id IN (${ids.map(() => '?').join(', ')})`, ...ids);
    }
    await db.execAsync(`PRAGMA user_version = ${LATEST_VERSION}`);
  });
}