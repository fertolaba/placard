import type { SeasonSelection } from '../entities/Season';
import type { SeasonPreferenceRepository } from '../repositories/SeasonPreferenceRepository';

export class GetSeasonPreference {
  constructor(private readonly repository: SeasonPreferenceRepository) {}

  async execute(): Promise<SeasonSelection> {
    return (await this.repository.get()) ?? 'todas';
  }
}
