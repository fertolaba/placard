import type { SeasonSelection } from '../entities/Season';
import type { SeasonPreferenceRepository } from '../repositories/SeasonPreferenceRepository';

export class SetSeasonPreference {
  constructor(private readonly repository: SeasonPreferenceRepository) {}

  execute(season: SeasonSelection): Promise<void> {
    return this.repository.set(season);
  }
}
