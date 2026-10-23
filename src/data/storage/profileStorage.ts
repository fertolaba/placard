import type { ProfileData } from '../../domain/entities/Profile';

export const DEFAULT_PROFILE: ProfileData = {
  displayName: 'Tu nombre',
  username: 'tu.usuario',
  showWatermark: true,
  photoRef: null,
};

/** Lee el perfil guardado como texto. Si falta o está dañado, usa los valores de siempre campo por campo. */
export function parseStoredProfile(text: string | null): ProfileData {
  if (!text) return { ...DEFAULT_PROFILE };
  try {
    const raw: unknown = JSON.parse(text);
    if (typeof raw !== 'object' || raw === null) return { ...DEFAULT_PROFILE };
    const value = raw as Record<string, unknown>;
    return {
      displayName:
        typeof value.displayName === 'string' && value.displayName.trim() !== ''
          ? value.displayName
          : DEFAULT_PROFILE.displayName,
      username:
        typeof value.username === 'string' && value.username !== '' ? value.username : DEFAULT_PROFILE.username,
      showWatermark:
        typeof value.showWatermark === 'boolean' ? value.showWatermark : DEFAULT_PROFILE.showWatermark,
      photoRef: typeof value.photoRef === 'string' && value.photoRef !== '' ? value.photoRef : null,
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function serializeProfile(data: ProfileData): string {
  return JSON.stringify(data);
}