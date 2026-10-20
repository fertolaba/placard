import AsyncStorage from '@react-native-async-storage/async-storage';
import { isThemeMode, type ThemeMode } from '../../domain/entities/ThemeMode';
import type { ThemePreferenceRepository } from '../../domain/repositories/ThemePreferenceRepository';

const KEY = 'placard.themeMode';

export class AsyncStorageThemePreferenceRepository implements ThemePreferenceRepository {
  async get(): Promise<ThemeMode | null> {
    const value = await AsyncStorage.getItem(KEY);
    return isThemeMode(value) ? value : null;
  }

  async set(mode: ThemeMode): Promise<void> {
    await AsyncStorage.setItem(KEY, mode);
  }
}