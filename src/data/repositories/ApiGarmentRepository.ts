import type { Garment, NewGarment } from '../../domain/entities/Garment';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import type { HttpClient } from '../http/HttpClient';
import { toGarment, type GarmentDto } from '../mappers/garmentMapper';

/** Habla con el servidor de /server (o con cualquier API que respete el mismo contrato). */
export class ApiGarmentRepository implements GarmentRepository {
  constructor(private readonly http: HttpClient) {}

  async getAll(): Promise<Garment[]> {
    const dtos = await this.http.get<GarmentDto[]>('/api/garments');
    return dtos.map(toGarment);
  }

  async getById(id: string): Promise<Garment | null> {
    return (await this.getAll()).find((garment) => garment.id === id) ?? null;
  }

  async add(input: NewGarment): Promise<Garment> {
    const dto = await this.http.post<GarmentDto>('/api/garments', input);
    return toGarment(dto);
  }

  async update(_id: string, _data: NewGarment): Promise<Garment> {
    throw new Error('El servidor de ejemplo todavía no permite editar prendas.');
  }

  async remove(_id: string): Promise<void> {
    throw new Error('El servidor de ejemplo todavía no permite borrar prendas.');
  }
}