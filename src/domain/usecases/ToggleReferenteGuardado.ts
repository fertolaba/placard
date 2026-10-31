import type { ReferenteRepository } from '../repositories/ReferenteRepository';

export class ToggleReferenteGuardado {
  constructor(private readonly repository: ReferenteRepository) {}

  /** Marca o desmarca el referente y devuelve cómo quedaron los guardados. */
  async execute(id: string): Promise<string[]> {
    const actuales = await this.repository.getGuardados();
    const siguientes = actuales.includes(id) ? actuales.filter((guardado) => guardado !== id) : [...actuales, id];
    await this.repository.setGuardados(siguientes);
    return siguientes;
  }
}
