import type { SeasonSelection } from '../entities/Season';

export interface SeasonPreferenceRepository {
  get(): Promise<SeasonSelection | null>;
  set(season: SeasonSelection): Promise<void>;
}
