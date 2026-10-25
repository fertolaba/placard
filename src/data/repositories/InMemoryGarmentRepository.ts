import type { Garment, NewGarment } from '../../domain/entities/Garment';
import type { CurrentUserId } from '../../domain/repositories/AuthRepository';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import { SAMPLE_GARMENTS } from '../seed/sampleGarments';

type StoredGarment = Omit<Garment, 'imageUri'>;

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sampleRecords(): StoredGarment[] {
  return SAMPLE_GARMENTS.map((sample) => ({
    ...sample,
    secondaryColors: [],
    sporty: false,
    photoRef: null,
    createdAt: new Date(),
  }));
}

/**
 * Datos que viven en memoria (con prendas de prueba): sirve para desarrollar y para la versión web.
 * Cada cuenta tiene su propia lista, que arranca con las prendas de prueba.
 */
export class InMemoryGarmentRepository implements GarmentRepository {
  private recordsByUser = new Map<string, StoredGarment[]>();

  constructor(
    private readonly currentUserId: CurrentUserId,
    private readonly resolvePhoto: (ref: string) => string = (ref) => ref,
  ) {}

  private present(record: StoredGarment): Garment {
    return { ...record, imageUri: record.photoRef === null ? null : this.resolvePhoto(record.photoRef) };
  }

  /** La lista de la cuenta con sesión (la crea con las prendas de prueba la primera vez). */
  private async records(): Promise<{ userId: string; records: StoredGarment[] }> {
    const userId = await this.currentUserId();
    let records = this.recordsByUser.get(userId);
    if (!records) {
      records = sampleRecords();
      this.recordsByUser.set(userId, records);
    }
    return { userId, records };
  }

  async getAll(): Promise<Garment[]> {
    const { records } = await this.records();
    return records.map((record) => this.present(record));
  }

  async getById(id: string): Promise<Garment | null> {
    const { records } = await this.records();
    const record = records.find((item) => item.id === id);
    return record ? this.present(record) : null;
  }

  async add(input: NewGarment): Promise<Garment> {
    const { userId, records } = await this.records();
    const record: StoredGarment = { ...input, id: newId(), createdAt: new Date() };
    this.recordsByUser.set(userId, [record, ...records]);
    return this.present(record);
  }

  async update(id: string, data: NewGarment): Promise<Garment> {
    const { userId, records } = await this.records();
    const existing = records.find((item) => item.id === id);
    if (!existing) throw new Error('La prenda ya no existe.');
    const record: StoredGarment = { ...existing, ...data };
    this.recordsByUser.set(
      userId,
      records.map((item) => (item.id === id ? record : item)),
    );
    return this.present(record);
  }

  async remove(id: string): Promise<void> {
    const { userId, records } = await this.records();
    this.recordsByUser.set(
      userId,
      records.filter((item) => item.id !== id),
    );
  }
}
