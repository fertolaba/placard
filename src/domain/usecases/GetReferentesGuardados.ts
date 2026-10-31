import type { ReferenteRepository } from '../repositories/ReferenteRepository';

export class GetReferentesGuardados {
  constructor(private readonly repository: ReferenteRepository) {}

  execute(): Promise<string[]> {
    return this.repository.getGuardados();
  }
}
