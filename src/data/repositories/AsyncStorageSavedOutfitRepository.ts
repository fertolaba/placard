import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedOutfit } from '../../domain/entities/SavedOutfit';
import type { CurrentUserId } from '../../domain/repositories/AuthRepository';
import type { SavedOutfitRepository } from '../../domain/repositories/SavedOutfitRepository';
import { parseSavedOutfits } from '../storage/savedOutfitsStorage';

const keyFor = (userId: string) => `placard.savedOutfits.${userId}`;

/** Local por ahora, una clave por cuenta. Cuando pase a Supabase solo cambia esta clase. */
export class AsyncStorageSavedOutfitRepository implements SavedOutfitRepository {
  constructor(private readonly currentUserId: CurrentUserId) {}

  async getAll(): Promise<SavedOutfit[]> {
    return parseSavedOutfits(await AsyncStorage.getItem(keyFor(await this.currentUserId())));
  }

  async setAll(outfits: SavedOutfit[]): Promise<void> {
    await AsyncStorage.setItem(keyFor(await this.currentUserId()), JSON.stringify(outfits));
  }
}
