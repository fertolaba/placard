import type { ThemeMode } from '../entities/ThemeMode';
import type { ThemePreferenceRepository } from '../repositories/ThemePreferenceRepository';

export class SetThemeMode {
  constructor(private readonly repository: ThemePreferenceRepository) {}

  execute(mode: ThemeMode): Promise<void> {
    return this.repository.set(mode);
  }
}