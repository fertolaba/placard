import type { ThemeMode } from '../entities/ThemeMode';

export interface ThemePreferenceRepository {
  /** Devuelve null si la persona todavía no eligió nada. */
  get(): Promise<ThemeMode | null>;
  set(mode: ThemeMode): Promise<void>;
}