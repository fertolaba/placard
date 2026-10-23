import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile, ProfileData } from '../../domain/entities/Profile';
import type { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { parseStoredProfile, serializeProfile } from '../storage/profileStorage';

const KEY = 'placard.profile';

/** El perfil es un solo registro chico: se guarda como texto en el almacenamiento del teléfono. */
export class AsyncStorageProfileRepository implements ProfileRepository {
  constructor(private readonly resolvePhoto: (ref: string) => string) {}

  private present(data: ProfileData): Profile {
    return { ...data, photoUri: data.photoRef === null ? null : this.resolvePhoto(data.photoRef) };
  }

  async get(): Promise<Profile> {
    return this.present(parseStoredProfile(await AsyncStorage.getItem(KEY)));
  }

  async save(data: ProfileData): Promise<Profile> {
    await AsyncStorage.setItem(KEY, serializeProfile(data));
    return this.present(data);
  }
}