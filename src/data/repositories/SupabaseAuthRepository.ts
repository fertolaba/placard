import { isAuthError, isAuthRetryableFetchError, isAuthWeakPasswordError, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { AuthUser } from '../../domain/entities/AuthUser';
import { isSex } from '../../domain/entities/Sex';
import { AuthError, type AuthRepository, type AuthStateListener, type NewAccount, type SignUpResult } from '../../domain/repositories/AuthRepository';

const MESSAGES = {
  invalidCredentials: 'El email o la contraseña no son correctos.',
  alreadyRegistered: 'Ya hay una cuenta con ese email. Probá iniciar sesión.',
  // El trigger que crea el perfil falla sobre todo cuando el nombre de usuario ya existe (es único).
  profileNotSaved: 'No pudimos crear la cuenta. Puede que ese nombre de usuario ya esté en uso: probá con otro.',
  emailNotConfirmed: 'Todavía no confirmaste tu email. Revisá tu correo (también la carpeta de spam) y tocá el enlace.',
  tooManyAttempts: 'Hiciste demasiados intentos. Esperá unos minutos y probá de nuevo.',
  offline: 'No hay conexión. Revisá tu internet y probá de nuevo.',
  weakPassword: 'Esa contraseña es muy fácil de adivinar. Probá con una más larga, que mezcle letras y números.',
  invalidEmail: 'Ese email no es válido.',
  signupDisabled: 'Por ahora no se pueden crear cuentas nuevas.',
  unknown: 'Algo salió mal. Probá de nuevo en un rato.',
};

/** Traduce un error de Supabase a un mensaje que entienda cualquier persona. */
function toAuthError(error: unknown): AuthError {
  // Solo se registran el código y el estado: nunca el email, la contraseña ni los tokens.
  if (__DEV__) {
    const detail = isAuthError(error) ? `${error.code ?? 'sin código'} (${error.status ?? 'sin estado'})` : 'error de red u otro';
    console.warn('[cuentas] Supabase devolvió un error:', detail);
  }
  if (isAuthRetryableFetchError(error) || error instanceof TypeError) return new AuthError(MESSAGES.offline);
  if (isAuthWeakPasswordError(error)) return new AuthError(MESSAGES.weakPassword);
  if (!isAuthError(error)) return new AuthError(MESSAGES.unknown);

  switch (error.code) {
    case 'invalid_credentials':
      return new AuthError(MESSAGES.invalidCredentials);
    case 'user_already_exists':
    case 'email_exists':
      return new AuthError(MESSAGES.alreadyRegistered);
    case 'email_not_confirmed':
      return new AuthError(MESSAGES.emailNotConfirmed);
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return new AuthError(MESSAGES.tooManyAttempts);
    case 'weak_password':
      return new AuthError(MESSAGES.weakPassword);
    case 'email_address_invalid':
      return new AuthError(MESSAGES.invalidEmail);
    case 'signup_disabled':
    case 'email_provider_disabled':
      return new AuthError(MESSAGES.signupDisabled);
  }

  // Servidores viejos no mandan el código: se reconoce por el mensaje o el estado.
  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials')) return new AuthError(MESSAGES.invalidCredentials);
  if (message.includes('already registered')) return new AuthError(MESSAGES.alreadyRegistered);
  if (message.includes('email not confirmed')) return new AuthError(MESSAGES.emailNotConfirmed);
  if (message.includes('database error saving new user')) return new AuthError(MESSAGES.profileNotSaved);
  if (error.status === 429) return new AuthError(MESSAGES.tooManyAttempts);
  return new AuthError(MESSAGES.unknown);
}

function toAuthUser(user: User): AuthUser {
  // user_metadata lo puede cambiar la propia persona: se revisa antes de usarlo.
  const metadata: Record<string, unknown> = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? '',
    username: typeof metadata.username === 'string' && metadata.username !== '' ? metadata.username : null,
    sex: isSex(metadata.sex) ? metadata.sex : null,
  };
}

/** Cuentas con Supabase Auth (email y contraseña). */
export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  async signUp({ email, password, username, sex }: NewAccount): Promise<SignUpResult> {
    let result;
    try {
      // Los datos van a user_metadata; el trigger handle_new_user (supabase/migrations) los copia a public.profiles.
      result = await this.client.auth.signUp({ email, password, options: { data: { username, sex } } });
    } catch (error) {
      throw toAuthError(error);
    }
    if (result.error) throw toAuthError(result.error);
    const { user, session } = result.data;
    // Con "Confirm email" activado, Supabase no avisa que el email ya existe (para no revelar cuentas):
    // devuelve un usuario sin identidades.
    if (user && user.identities?.length === 0) throw new AuthError(MESSAGES.alreadyRegistered);
    return { user: user ? toAuthUser(user) : null, needsEmailConfirmation: session === null };
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    let result;
    try {
      result = await this.client.auth.signInWithPassword({ email, password });
    } catch (error) {
      throw toAuthError(error);
    }
    if (result.error) throw toAuthError(result.error);
    return toAuthUser(result.data.user);
  }

  async signOut(): Promise<void> {
    let result;
    try {
      result = await this.client.auth.signOut();
    } catch (error) {
      throw toAuthError(error);
    }
    if (result.error) throw toAuthError(result.error);
  }

  async getSession(): Promise<AuthUser | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw toAuthError(error);
    return data.session ? toAuthUser(data.session.user) : null;
  }

  onAuthStateChange(listener: AuthStateListener): () => void {
    // Supabase pide no esperar otras llamadas suyas dentro de este aviso: solo se pasa la persona.
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      listener(session ? toAuthUser(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
  }
}
