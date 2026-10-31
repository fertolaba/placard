import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSeasonSelection, type SeasonSelection } from '../../domain/entities/Season';
import type { SeasonPreferenceRepository } from '../../domain/repositories/SeasonPreferenceRepository';

const KEY = 'placard.season';

export class AsyncStorageSeasonPreferenceRepository implements SeasonPreferenceRepository {
  async get(): Promise<SeasonSelection | null> {
    const value = await AsyncStorage.getItem(KEY);
    return isSeasonSelection(value) ? value : null;
  }

  async set(season: SeasonSelection): Promise<void> {
    await AsyncStorage.setItem(KEY, season);
  }
}
