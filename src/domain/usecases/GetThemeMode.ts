import type { ThemeMode } from '../entities/ThemeMode';
import type { ThemePreferenceRepository } from '../repositories/ThemePreferenceRepository';

export class GetThemeMode {
  constructor(private readonly repository: ThemePreferenceRepository) {}

  async execute(): Promise<ThemeMode> {
    return (await this.repository.get()) ?? 'system';
  }
}