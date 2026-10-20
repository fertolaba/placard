import type { Garment, NewGarment } from '../../domain/entities/Garment';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import { SAMPLE_GARMENTS } from '../seed/sampleGarments';

type StoredGarment = Omit<Garment, 'imageUri'>;

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Datos que viven en memoria (con prendas de prueba): sirve para desarrollar y para la versión web. */
export class InMemoryGarmentRepository implements GarmentRepository {
  private records: StoredGarment[] = SAMPLE_GARMENTS.map((sample) => ({
    ...sample,
    photoRef: null,
    createdAt: new Date(),
  }));

  constructor(private readonly resolvePhoto: (ref: string) => string = (ref) => ref) {}

  private present(record: StoredGarment): Garment {
    return { ...record, imageUri: record.photoRef === null ? null : this.resolvePhoto(record.photoRef) };
  }

  async getAll(): Promise<Garment[]> {
    return this.records.map((record) => this.present(record));
  }

  async getById(id: string): Promise<Garment | null> {
    const record = this.records.find((item) => item.id === id);
    return record ? this.present(record) : null;
  }

  async add(input: NewGarment): Promise<Garment> {
    const record: StoredGarment = { ...input, id: newId(), createdAt: new Date() };
    this.records = [record, ...this.records];
    return this.present(record);
  }

  async update(id: string, data: NewGarment): Promise<Garment> {
    const existing = this.records.find((item) => item.id === id);
    if (!existing) throw new Error('La prenda ya no existe.');
    const record: StoredGarment = { ...existing, ...data };
    this.records = this.records.map((item) => (item.id === id ? record : item));
    return this.present(record);
  }

  async remove(id: string): Promise<void> {
    this.records = this.records.filter((item) => item.id !== id);
  }
}