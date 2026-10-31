import type { Referente } from '../entities/Referente';
import type { ReferenteRepository } from '../repositories/ReferenteRepository';

export class GetReferentes {
  constructor(private readonly repository: ReferenteRepository) {}

  execute(): Promise<Referente[]> {
    return this.repository.getAll();
  }
}
