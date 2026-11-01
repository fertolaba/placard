import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { container } from '../../core/di/container';
import type { Profile, ProfileDraft } from '../../domain/entities/Profile';
import { ValidationError } from '../../domain/usecases/UpdateProfile';
import { useAuth } from '../auth/AuthProvider';
import { useDataVersion } from './dataVersion';

interface ProfileValue {
  profile: Profile | null;
  status: 'loading' | 'ready' | 'error';
  reload: () => void;
  /** Devuelve null si se guardó bien, o el mensaje de error para mostrarle a la persona. */
  save: (draft: ProfileDraft) => Promise<string | null>;
  /** Cambia la foto de perfil (o la quita con null). Devuelve null si salió bien, o el mensaje de error. */
  changePhoto: (photoUri: string | null) => Promise<string | null>;
}

const ProfileContext = createContext<ProfileValue | null>(null);

/** Única fuente de verdad del perfil: el avatar de todas las pantallas y la pantalla de Perfil leen de acá. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const userId = useAuth().user?.id ?? null;
  const dataVersion = useDataVersion();
  const [reloadKey, setReloadKey] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [failedLoad, setFailedLoad] = useState<string | null>(null);
  const loadKey = `${userId}:${dataVersion}:${reloadKey}`;

  // Al cambiar de cuenta no puede quedar a la vista ni un instante el perfil de la anterior.
  const [shownUserId, setShownUserId] = useState(userId);
  if (userId !== shownUserId) {
    setShownUserId(userId);
    setProfile(null);
  }

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    container.getProfile
      .execute()
      .then((loaded) => {
        if (!cancelled) setProfile(loaded);
      })
      .catch(() => {
        if (!cancelled) setFailedLoad(loadKey);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, loadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const save = useCallback(async (draft: ProfileDraft) => {
    try {
      setProfile(await container.updateProfile.execute(draft));
      return null;
    } catch (error) {
      return error instanceof ValidationError ? error.message : 'No pudimos guardar los cambios. Probá de nuevo.';
    }
  }, []);

  const changePhoto = useCallback(async (photoUri: string | null) => {
    try {
      setProfile(await container.setProfilePhoto.execute(photoUri));
      return null;
    } catch {
      return 'No pudimos guardar la foto. Probá de nuevo.';
    }
  }, []);

  const status = profile ? 'ready' : failedLoad === loadKey ? 'error' : 'loading';
  const value = useMemo<ProfileValue>(
    () => ({ profile, status, reload, save, changePhoto }),
    [profile, status, reload, save, changePhoto],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileValue {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile tiene que usarse dentro de <ProfileProvider>.');
  return value;
}
