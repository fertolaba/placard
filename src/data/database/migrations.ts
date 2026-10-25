import type { SQLiteDatabase } from 'expo-sqlite';
import { SEASONS } from '../../domain/entities/Season';
import { SAMPLE_GARMENTS } from '../seed/sampleGarments';

export const LATEST_VERSION = 7;

/**
 * Lleva la base a la última versión. La versión se guarda en la propia base (PRAGMA user_version),
 * así que para cambiar la estructura más adelante se agrega un bloque "if (version < 8)" y se sube LATEST_VERSION.
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
    if (version < 3) {
      // Épocas del año en que se usa cada prenda, como texto: "verano,entretiempo,invierno".
      // Las prendas que ya existían quedan con las tres, para que no desaparezcan de ningún filtro.
      await db.execAsync(`ALTER TABLE garments ADD COLUMN seasons TEXT NOT NULL DEFAULT '${SEASONS.join(',')}'`);
    }
    if (version < 4) {
      // Ropa deportiva (0 o 1). Las prendas que ya existían quedan como no deportivas; se pueden marcar al editarlas.
      await db.execAsync('ALTER TABLE garments ADD COLUMN sporty INTEGER NOT NULL DEFAULT 0 CHECK (sporty IN (0, 1))');
    }
    if (version < 5) {
      // Corte de la prenda ("oversize", "wide leg"…). NULL = sin corte elegido, como quedan las prendas que ya existían.
      await db.execAsync('ALTER TABLE garments ADD COLUMN corte TEXT');
    }
    if (version < 6) {
      // Categorías nuevas "top" y "pollera". SQLite no deja cambiar un CHECK: se arma la tabla de nuevo y se copian las prendas.
      await db.execAsync(`
        CREATE TABLE garments_new (
          id         TEXT PRIMARY KEY NOT NULL,
          name       TEXT NOT NULL,
          category   TEXT NOT NULL CHECK (category IN ('arriba', 'top', 'abajo', 'pollera', 'calzado')),
          color_hex  TEXT NOT NULL,
          color_name TEXT NOT NULL,
          photo_ref  TEXT,
          created_at TEXT NOT NULL,
          seasons    TEXT NOT NULL DEFAULT '${SEASONS.join(',')}',
          sporty     INTEGER NOT NULL DEFAULT 0 CHECK (sporty IN (0, 1)),
          corte      TEXT
        );
        INSERT INTO garments_new (id, name, category, color_hex, color_name, photo_ref, created_at, seasons, sporty, corte)
          SELECT id, name, category, color_hex, color_name, photo_ref, created_at, seasons, sporty, corte FROM garments ORDER BY rowid; -- mismo orden: la lista desempata por rowid
        DROP TABLE garments;
        ALTER TABLE garments_new RENAME TO garments;
      `);
    }
    if (version < 7) {
      // Dueño de cada prenda (el id de la cuenta de Supabase). Todas las consultas filtran por esta columna.
      // Las prendas que ya existían quedan sin dueño (NULL): no se le muestran a ninguna cuenta, pero no se borran.
      await db.execAsync(`
        ALTER TABLE garments ADD COLUMN user_id TEXT;
        CREATE INDEX garments_user_created ON garments (user_id, created_at DESC);
      `);
    }
    await db.execAsync(`PRAGMA user_version = ${LATEST_VERSION}`);
  });
}