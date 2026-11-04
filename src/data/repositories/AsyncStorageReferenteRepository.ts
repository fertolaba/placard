import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Referente } from '../../domain/entities/Referente';
import type { CurrentUserId } from '../../domain/repositories/AuthRepository';
import type { ReferenteRepository } from '../../domain/repositories/ReferenteRepository';
import { SAMPLE_REFERENTES } from '../seed/referentes';

// Una clave por cuenta: si dos cuentas usan el mismo teléfono, cada una ve sus propios guardados.
const keyFor = (userId: string) => `placard.referentesGuardados.${userId}`;

function parseGuardados(raw: string | null): string[] {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/** Los referentes salen del seed local; los guardados, del almacenamiento del teléfono. */
export class AsyncStorageReferenteRepository implements ReferenteRepository {
  constructor(private readonly currentUserId: CurrentUserId) {}

  async getAll(): Promise<Referente[]> {
    return SAMPLE_REFERENTES;
  }

  /** Un id de un referente que ya no está en el catálogo se ignora; se borra del teléfono la próxima vez que se guarde. */
  async getGuardados(): Promise<string[]> {
    const ids = parseGuardados(await AsyncStorage.getItem(keyFor(await this.currentUserId())));
    return ids.filter((id) => SAMPLE_REFERENTES.some((referente) => referente.id === id));
  }

  async setGuardados(ids: string[]): Promise<void> {
    await AsyncStorage.setItem(keyFor(await this.currentUserId()), JSON.stringify(ids));
  }
}
