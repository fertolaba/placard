import { useCallback, useEffect, useState } from 'react';
import { container } from '../../core/di/container';
import type { Profile, ProfileDraft } from '../../domain/entities/Profile';
import type { WardrobeStats } from '../../domain/usecases/GetWardrobeStats';
import { ValidationError } from '../../domain/usecases/UpdateProfile';
import { useDataVersion } from '../state/dataVersion';

type Status = 'loading' | 'ready' | 'error';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<WardrobeStats | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const dataVersion = useDataVersion();

  useEffect(() => {
    let cancelled = false;
    // Si ya hay datos en pantalla, se dejan hasta que lleguen los nuevos (evita el parpadeo).
    setStatus((current) => (current === 'ready' ? current : 'loading'));
    Promise.all([container.getProfile.execute(), container.getWardrobeStats.execute()])
      .then(([loadedProfile, loadedStats]) => {
        if (cancelled) return;
        setProfile(loadedProfile);
        setStats(loadedStats);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey, dataVersion]);

  /** Devuelve null si se guardó bien, o el mensaje de error para mostrarle a la persona. */
  const save = useCallback(async (draft: ProfileDraft): Promise<string | null> => {
    try {
      setProfile(await container.updateProfile.execute(draft));
      return null;
    } catch (error) {
      return error instanceof ValidationError ? error.message : 'No pudimos guardar los cambios. Probá de nuevo.';
    }
  }, []);

  /** Cambia la foto de perfil (o la quita con null). Devuelve null si salió bien, o el mensaje de error. */
  const changePhoto = useCallback(async (photoUri: string | null): Promise<string | null> => {
    try {
      setProfile(await container.setProfilePhoto.execute(photoUri));
      return null;
    } catch {
      return 'No pudimos guardar la foto. Probá de nuevo.';
    }
  }, []);

  return { profile, stats, status, reload: () => setReloadKey((key) => key + 1), save, changePhoto };
}