import AsyncStorage from '@react-native-async-storage/async-storage';
import { STYLE_IDS, type StyleId } from '../../domain/entities/StyleReference';
import type { CurrentUserId } from '../../domain/repositories/AuthRepository';
import type { FavoriteStylesRepository } from '../../domain/repositories/FavoriteStylesRepository';

const keyFor = (userId: string) => `placard.favoriteStyles.${userId}`;

/** Local por ahora, una clave por cuenta. Cuando pase a Supabase solo cambia esta clase. */
export class AsyncStorageFavoriteStylesRepository implements FavoriteStylesRepository {
  constructor(private readonly currentUserId: CurrentUserId) {}

  async get(): Promise<StyleId[]> {
    const text = await AsyncStorage.getItem(keyFor(await this.currentUserId()));
    if (text === null) return [];
    try {
      const parsed: unknown = JSON.parse(text);
      return Array.isArray(parsed) ? STYLE_IDS.filter((id) => parsed.includes(id)) : [];
    } catch {
      return [];
    }
  }

  async set(styles: StyleId[]): Promise<void> {
    await AsyncStorage.setItem(keyFor(await this.currentUserId()), JSON.stringify(styles));
  }
}
