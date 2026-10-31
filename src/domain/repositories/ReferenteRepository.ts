import type { Referente } from '../entities/Referente';

export interface ReferenteRepository {
  getAll(): Promise<Referente[]>;
  getGuardados(): Promise<string[]>;
  setGuardados(ids: string[]): Promise<void>;
}
