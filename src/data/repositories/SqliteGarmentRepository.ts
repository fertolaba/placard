import type { SQLiteDatabase } from 'expo-sqlite';
import type { Garment, GarmentCategory, NewGarment } from '../../domain/entities/Garment';
import { SEASONS, normalizeSeasons, type Season } from '../../domain/entities/Season';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';

/** Forma de la fila tal como está en la tabla (con nombres en snake_case). */
interface GarmentRow {
  id: string;
  name: string;
  category: GarmentCategory;
  color_hex: string;
  color_name: string;
  seasons: string; // "verano,invierno"
  photo_ref: string | null;
  created_at: string;
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseSeasons(text: string): Season[] {
  const seasons = normalizeSeasons(text.split(','));
  return seasons.length > 0 ? seasons : [...SEASONS]; // si el dato está dañado, no se esconde la prenda
}

export class SqliteGarmentRepository implements GarmentRepository {
  constructor(
    private readonly getDatabase: () => Promise<SQLiteDatabase>,
    private readonly resolvePhoto: (ref: string) => string,
  ) {}

  private toGarment(row: GarmentRow): Garment {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      colorHex: row.color_hex,
      colorName: row.color_name,
      seasons: parseSeasons(row.seasons),
      photoRef: row.photo_ref,
      imageUri: row.photo_ref === null ? null : this.resolvePhoto(row.photo_ref),
      createdAt: new Date(row.created_at),
    };
  }

  async getAll(): Promise<Garment[]> {
    const db = await this.getDatabase();
    // Las más nuevas primero; las que se crearon juntas, en el orden en que entraron.
    const rows = await db.getAllAsync<GarmentRow>('SELECT * FROM garments ORDER BY created_at DESC, rowid ASC');
    return rows.map((row) => this.toGarment(row));
  }

  async getById(id: string): Promise<Garment | null> {
    const db = await this.getDatabase();
    const row = await db.getFirstAsync<GarmentRow>('SELECT * FROM garments WHERE id = ?', id);
    return row ? this.toGarment(row) : null;
  }

  async add(input: NewGarment): Promise<Garment> {
    const db = await this.getDatabase();
    const id = newId();
    const createdAt = new Date();
    await db.runAsync(
      'INSERT INTO garments (id, name, category, color_hex, color_name, seasons, photo_ref, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      id,
      input.name,
      input.category,
      input.colorHex,
      input.colorName,
      input.seasons.join(','),
      input.photoRef,
      createdAt.toISOString(),
    );
    return {
      ...input,
      id,
      createdAt,
      imageUri: input.photoRef === null ? null : this.resolvePhoto(input.photoRef),
    };
  }

  async update(id: string, data: NewGarment): Promise<Garment> {
    const db = await this.getDatabase();
    const result = await db.runAsync(
      'UPDATE garments SET name = ?, category = ?, color_hex = ?, color_name = ?, seasons = ?, photo_ref = ? WHERE id = ?',
      data.name,
      data.category,
      data.colorHex,
      data.colorName,
      data.seasons.join(','),
      data.photoRef,
      id,
    );
    if (result.changes === 0) throw new Error('La prenda ya no existe.');
    const updated = await this.getById(id);
    if (!updated) throw new Error('La prenda ya no existe.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const db = await this.getDatabase();
    await db.runAsync('DELETE FROM garments WHERE id = ?', id);
  }
}