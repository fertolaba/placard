import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile, ProfileData } from '../../domain/entities/Profile';
import type { CurrentUserId } from '../../domain/repositories/AuthRepository';
import type { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { parseStoredProfile, serializeProfile } from '../storage/profileStorage';

// Una clave por cuenta: si dos cuentas usan el mismo teléfono, cada una ve su propio perfil.
// (La clave vieja "placard.profile", compartida por todas, ya no se lee.)
const keyFor = (userId: string) => `placard.profile.${userId}`;

/** El perfil es un solo registro chico: se guarda como texto en el almacenamiento del teléfono. */
export class AsyncStorageProfileRepository implements ProfileRepository {
  constructor(
    private readonly resolvePhoto: (ref: string) => string,
    private readonly currentUserId: CurrentUserId,
  ) {}

  private present(data: ProfileData): Profile {
    return { ...data, photoUri: data.photoRef === null ? null : this.resolvePhoto(data.photoRef) };
  }

  async get(): Promise<Profile> {
    return this.present(parseStoredProfile(await AsyncStorage.getItem(keyFor(await this.currentUserId()))));
  }

  async save(data: ProfileData): Promise<Profile> {
    await AsyncStorage.setItem(keyFor(await this.currentUserId()), serializeProfile(data));
    return this.present(data);
  }
}