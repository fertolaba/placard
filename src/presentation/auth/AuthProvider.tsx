import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { container } from '../../core/di/container';
import type { AuthUser, SignUpInput } from '../../domain/entities/AuthUser';
import { AuthError } from '../../domain/repositories/AuthRepository';
import { notifyDataChanged } from '../state/dataVersion';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

export type SignUpOutcome = { error: string } | { error: null; needsEmailConfirmation: boolean };

interface AuthValue {
  user: AuthUser | null;
  status: AuthStatus;
  configured: boolean; // false si falta configurar Supabase
  /** Devuelve null si entró, o el mensaje de error para mostrarle a la persona. */
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (input: SignUpInput) => Promise<SignUpOutcome>;
  /** Devuelve null si cerró la sesión, o el mensaje de error. */
  signOut: () => Promise<string | null>;
}

const AuthContext = createContext<AuthValue | null>(null);

const messageFor = (error: unknown) =>
  error instanceof AuthError ? error.message : 'Algo salió mal. Probá de nuevo en un rato.';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const update = (next: AuthUser | null) => {
      if (cancelled) return;
      setUser(next);
      setLoaded(true);
    };
    // Primero la sesión guardada en el teléfono; después, cada inicio o cierre de sesión (también si vence).
    const unsubscribe = container.getSession.subscribe(update);
    container.getSession.execute().then(update);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Al cerrar sesión (a mano o porque venció) o al entrar con otra cuenta, se olvida lo que quedó en memoria
  // de la anterior y todas las pantallas vuelven a cargar: la cuenta nueva arranca vacía y solo ve lo suyo.
  const userId = user?.id ?? null;
  const previousUserId = useRef<string | null>(null);
  useEffect(() => {
    if (previousUserId.current === userId) return;
    previousUserId.current = userId;
    container.clearSessionData.execute();
    notifyDataChanged();
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setUser(await container.signIn.execute(email, password));
      return null;
    } catch (error) {
      return messageFor(error);
    }
  }, []);

  const signUp = useCallback(async (input: SignUpInput): Promise<SignUpOutcome> => {
    try {
      const result = await container.signUp.execute(input);
      if (!result.needsEmailConfirmation && result.user) setUser(result.user);
      return { error: null, needsEmailConfirmation: result.needsEmailConfirmation };
    } catch (error) {
      return { error: messageFor(error) };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await container.signOut.execute();
      setUser(null);
      return null;
    } catch (error) {
      return messageFor(error);
    }
  }, []);

  const status: AuthStatus = !loaded ? 'loading' : user ? 'signedIn' : 'signedOut';
  const value = useMemo<AuthValue>(
    () => ({ user, status, configured: container.authConfigured, signIn, signUp, signOut }),
    [user, status, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth tiene que usarse dentro de <AuthProvider>.');
  return value;
}
