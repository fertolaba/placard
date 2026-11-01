import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CurrentUserId } from '../../domain/repositories/AuthRepository';
import type { AccountLocalData } from '../../domain/services/AccountLocalData';

/** Borra todas las claves de la cuenta: los repositorios locales las terminan en ".<id de la cuenta>". */
export class AsyncStorageAccountLocalData implements AccountLocalData {
  constructor(
    private readonly currentUserId: CurrentUserId,
    private readonly removeProfilePhoto: () => Promise<unknown>,
  ) {}

  async clear(): Promise<void> {
    const userId = await this.currentUserId();
    await this.removeProfilePhoto().catch(() => undefined); // necesita el perfil: va antes de borrar las claves
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter((key) => key.startsWith('placard.') && key.endsWith(`.${userId}`)));
  }
}
