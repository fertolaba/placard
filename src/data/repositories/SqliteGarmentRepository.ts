import type { SQLiteDatabase } from 'expo-sqlite';
import type { Garment, GarmentCategory, NewGarment } from '../../domain/entities/Garment';
import { SEASONS, normalizeSeasons, type Season } from '../../domain/entities/Season';
import type { CurrentUserId } from '../../domain/repositories/AuthRepository';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import { parseSecondaryColors } from '../mappers/secondaryColors';

/** Forma de la fila tal como está en la tabla (con nombres en snake_case). */
interface GarmentRow {
  id: string;
  name: string;
  category: GarmentCategory;
  color_hex: string;
  color_name: string;
  secondary_colors: string; // JSON: [{"name":"Blanco","hex":"#EDEAE4"}]
  seasons: string; // "verano,invierno"
  sporty: number; // 0 o 1
  corte: string | null; // null = sin corte
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

/** Cada consulta filtra por user_id: una cuenta nunca ve ni toca las prendas de otra que usó el mismo teléfono. */
export class SqliteGarmentRepository implements GarmentRepository {
  constructor(
    private readonly getDatabase: () => Promise<SQLiteDatabase>,
    private readonly resolvePhoto: (ref: string) => string,
    private readonly currentUserId: CurrentUserId,
  ) {}

  private toGarment(row: GarmentRow): Garment {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      colorHex: row.color_hex,
      colorName: row.color_name,
      secondaryColors: parseSecondaryColors(row.secondary_colors),
      seasons: parseSeasons(row.seasons),
      sporty: row.sporty === 1,
      corte: row.corte ?? undefined,
      photoRef: row.photo_ref,
      imageUri: row.photo_ref === null ? null : this.resolvePhoto(row.photo_ref),
      createdAt: new Date(row.created_at),
    };
  }

  async getAll(): Promise<Garment[]> {
    const [db, userId] = await Promise.all([this.getDatabase(), this.currentUserId()]);
    // Las más nuevas primero; las que se crearon juntas, en el orden en que entraron.
    const rows = await db.getAllAsync<GarmentRow>(
      'SELECT * FROM garments WHERE user_id = ? ORDER BY created_at DESC, rowid ASC',
      userId,
    );
    return rows.map((row) => this.toGarment(row));
  }

  async getById(id: string): Promise<Garment | null> {
    const [db, userId] = await Promise.all([this.getDatabase(), this.currentUserId()]);
    const row = await db.getFirstAsync<GarmentRow>('SELECT * FROM garments WHERE id = ? AND user_id = ?', id, userId);
    return row ? this.toGarment(row) : null;
  }

  async add(input: NewGarment): Promise<Garment> {
    const [db, userId] = await Promise.all([this.getDatabase(), this.currentUserId()]);
    const id = newId();
    const createdAt = new Date();
    await db.runAsync(
      'INSERT INTO garments (id, user_id, name, category, color_hex, color_name, secondary_colors, seasons, sporty, corte, photo_ref, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      id,
      userId,
      input.name,
      input.category,
      input.colorHex,
      input.colorName,
      JSON.stringify(input.secondaryColors),
      input.seasons.join(','),
      input.sporty ? 1 : 0,
      input.corte ?? null,
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
    const [db, userId] = await Promise.all([this.getDatabase(), this.currentUserId()]);
    const result = await db.runAsync(
      'UPDATE garments SET name = ?, category = ?, color_hex = ?, color_name = ?, secondary_colors = ?, seasons = ?, sporty = ?, corte = ?, photo_ref = ? WHERE id = ? AND user_id = ?',
      data.name,
      data.category,
      data.colorHex,
      data.colorName,
      JSON.stringify(data.secondaryColors),
      data.seasons.join(','),
      data.sporty ? 1 : 0,
      data.corte ?? null, // sin corte = se borra el que tenía
      data.photoRef,
      id,
      userId,
    );
    if (result.changes === 0) throw new Error('La prenda ya no existe.');
    const updated = await this.getById(id);
    if (!updated) throw new Error('La prenda ya no existe.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const [db, userId] = await Promise.all([this.getDatabase(), this.currentUserId()]);
    await db.runAsync('DELETE FROM garments WHERE id = ? AND user_id = ?', id, userId);
  }
}