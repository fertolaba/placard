import type { Garment, NewGarment } from '../entities/Garment';

/**
 * Contrato: el dominio dice QUÉ necesita, no CÓMO se guarda.
 * Hoy hay una versión en memoria, una con SQLite y una por API.
 */
export interface GarmentRepository {
  getAll(): Promise<Garment[]>;
  getById(id: string): Promise<Garment | null>;
  add(input: NewGarment): Promise<Garment>;
  update(id: string, data: NewGarment): Promise<Garment>;
  remove(id: string): Promise<void>;
}