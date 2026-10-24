import type { AuthUser } from '../../domain/entities/AuthUser';
import { AuthError, type AuthRepository, type SignUpResult } from '../../domain/repositories/AuthRepository';

const NOT_CONFIGURED = 'Las cuentas todavía no están configuradas en esta versión de la app.';

/** Se usa cuando falta configurar Supabase: nunca hay sesión y crear cuenta o entrar avisa el motivo. */
export class UnconfiguredAuthRepository implements AuthRepository {
  async signUp(): Promise<SignUpResult> {
    throw new AuthError(NOT_CONFIGURED);
  }

  async signIn(): Promise<AuthUser> {
    throw new AuthError(NOT_CONFIGURED);
  }

  async signOut(): Promise<void> {}

  async getSession(): Promise<AuthUser | null> {
    return null;
  }

  onAuthStateChange(): () => void {
    return () => undefined;
  }
}
