import type { SupabaseClient } from '@supabase/supabase-js';
import type { Garment, GarmentCategory, NewGarment } from '../../domain/entities/Garment';
import { SEASONS, normalizeSeasons } from '../../domain/entities/Season';
import type { CurrentUserId } from '../../domain/repositories/AuthRepository';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import type { SessionCache } from '../../domain/services/SessionCache';
import { GARMENT_PHOTOS_BUCKET } from '../supabase/SupabasePhotoStorage';

/** Forma de la fila en la tabla public.garments (ver supabase/migrations). */
interface GarmentRow {
  id: string;
  name: string;
  category: GarmentCategory;
  color_hex: string;
  color_name: string;
  seasons: string[];
  sporty: boolean;
  corte: string | null;
  photo_path: string | null;
  created_at: string;
}

const COLUMNS = 'id, name, category, color_hex, color_name, seasons, sporty, corte, photo_path, created_at';
const SIGNED_URL_SECONDS = 60 * 60 * 24; // las direcciones de las fotos vencen en un día
const SIGNED_URL_MARGIN_MS = 60 * 60 * 1000; // se renuevan si les queda menos de una hora
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LOAD_ERROR = 'No pudimos cargar tus prendas. Revisá tu conexión y probá de nuevo.';
const SAVE_ERROR = 'No pudimos guardar la prenda. Revisá tu conexión y probá de nuevo.';
const NOT_FOUND = 'La prenda ya no existe.';

function toRow(data: NewGarment) {
  return {
    name: data.name,
    category: data.category,
    color_hex: data.colorHex,
    color_name: data.colorName,
    seasons: data.seasons,
    sporty: data.sporty,
    corte: data.corte ?? null, // sin corte = se borra el que tenía
    photo_path: data.photoRef,
  };
}

/**
 * Prendas en Supabase. Cada consulta filtra por el user_id de la sesión (y RLS lo exige del lado del servidor).
 * Las fotos están en un bucket privado: se muestran con direcciones firmadas que se guardan en memoria
 * para no pedirlas de nuevo en cada recarga. Ese caché se vacía al cerrar sesión.
 */
export class SupabaseGarmentRepository implements GarmentRepository, SessionCache {
  private signedUrls = new Map<string, { url: string; expiresAt: number }>();

  constructor(
    private readonly client: SupabaseClient,
    private readonly currentUserId: CurrentUserId,
  ) {}

  clear(): void {
    this.signedUrls.clear();
  }

  /** Direcciones firmadas para las fotos, pidiendo de una sola vez las que faltan o están por vencer. */
  private async signPhotos(paths: string[]): Promise<Map<string, string>> {
    const now = Date.now();
    const missing = [...new Set(paths)].filter((path) => {
      const cached = this.signedUrls.get(path);
      return !cached || cached.expiresAt - now < SIGNED_URL_MARGIN_MS;
    });
    if (missing.length > 0) {
      const { data } = await this.client.storage.from(GARMENT_PHOTOS_BUCKET).createSignedUrls(missing, SIGNED_URL_SECONDS);
      // Si falla, las prendas se muestran igual (sin foto) y se vuelve a intentar en la próxima carga.
      for (const item of data ?? []) {
        if (item.path && item.signedUrl) {
          this.signedUrls.set(item.path, { url: item.signedUrl, expiresAt: now + SIGNED_URL_SECONDS * 1000 });
        }
      }
    }
    const result = new Map<string, string>();
    for (const path of paths) {
      const cached = this.signedUrls.get(path);
      if (cached) result.set(path, cached.url);
    }
    return result;
  }

  private async toGarments(rows: GarmentRow[]): Promise<Garment[]> {
    const urls = await this.signPhotos(rows.flatMap((row) => (row.photo_path ? [row.photo_path] : [])));
    return rows.map((row) => {
      const seasons = normalizeSeasons(row.seasons ?? []);
      return {
        id: row.id,
        name: row.name,
        category: row.category,
        colorHex: row.color_hex,
        colorName: row.color_name,
        seasons: seasons.length > 0 ? seasons : [...SEASONS], // si el dato está dañado, no se esconde la prenda
        sporty: row.sporty,
        corte: row.corte ?? undefined,
        photoRef: row.photo_path,
        imageUri: row.photo_path ? (urls.get(row.photo_path) ?? null) : null,
        createdAt: new Date(row.created_at),
      };
    });
  }

  async getAll(): Promise<Garment[]> {
    const userId = await this.currentUserId();
    const { data, error } = await this.client
      .from('garments')
      .select(COLUMNS)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('id');
    if (error) throw new Error(LOAD_ERROR);
    return this.toGarments(data as GarmentRow[]);
  }

  async getById(id: string): Promise<Garment | null> {
    if (!UUID.test(id)) return null; // un id que no es de esta tabla (por ejemplo, de la base del teléfono)
    const userId = await this.currentUserId();
    const { data, error } = await this.client
      .from('garments')
      .select(COLUMNS)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new Error(LOAD_ERROR);
    return data ? (await this.toGarments([data as GarmentRow]))[0] : null;
  }

  async add(input: NewGarment): Promise<Garment> {
    const userId = await this.currentUserId();
    const { data, error } = await this.client
      .from('garments')
      .insert({ ...toRow(input), user_id: userId })
      .select(COLUMNS)
      .single();
    if (error) throw new Error(SAVE_ERROR);
    return (await this.toGarments([data as GarmentRow]))[0];
  }

  async update(id: string, data: NewGarment): Promise<Garment> {
    if (!UUID.test(id)) throw new Error(NOT_FOUND);
    const userId = await this.currentUserId();
    const { data: row, error } = await this.client
      .from('garments')
      .update(toRow(data))
      .eq('id', id)
      .eq('user_id', userId)
      .select(COLUMNS)
      .maybeSingle();
    if (error) throw new Error(SAVE_ERROR);
    if (!row) throw new Error(NOT_FOUND);
    return (await this.toGarments([row as GarmentRow]))[0];
  }

  async remove(id: string): Promise<void> {
    if (!UUID.test(id)) return;
    const userId = await this.currentUserId();
    const { error } = await this.client.from('garments').delete().eq('id', id).eq('user_id', userId);
    if (error) throw new Error('No pudimos borrar la prenda. Revisá tu conexión y probá de nuevo.');
  }
}
