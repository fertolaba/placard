import type { SupabaseClient } from '@supabase/supabase-js';
import type { CurrentUserId } from '../../domain/repositories/AuthRepository';
import type { PhotoStorage } from '../../domain/services/PhotoStorage';
import { buildPhotoRef, extensionOf } from '../photos/photoRefs';
import { readPhotoBytes } from './readPhotoBytes';

/** Bucket privado de Supabase Storage (ver supabase/migrations). */
export const GARMENT_PHOTOS_BUCKET = 'garment-photos';

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  webp: 'image/webp',
};

/**
 * Fotos de las prendas en Supabase Storage. Cada cuenta sube a su propia carpeta ("<user_id>/archivo.jpg"):
 * las políticas del bucket no dejan leer ni escribir en la carpeta de otra.
 */
export class SupabasePhotoStorage implements PhotoStorage {
  constructor(
    private readonly client: SupabaseClient,
    private readonly currentUserId: CurrentUserId,
  ) {}

  async save(sourceUri: string): Promise<string> {
    const userId = await this.currentUserId();
    const ref = buildPhotoRef(userId, sourceUri);
    const bytes = await readPhotoBytes(sourceUri);
    const { error } = await this.client.storage.from(GARMENT_PHOTOS_BUCKET).upload(ref, bytes, {
      contentType: CONTENT_TYPES[extensionOf(sourceUri)] ?? 'image/jpeg',
      upsert: false,
    });
    if (error) throw new Error('No pudimos subir la foto. Revisá tu conexión y probá de nuevo.');
    return ref;
  }

  async remove(ref: string): Promise<void> {
    const { error } = await this.client.storage.from(GARMENT_PHOTOS_BUCKET).remove([ref]);
    if (error) throw new Error('No pudimos borrar la foto.');
  }
}
