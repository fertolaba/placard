import type { AuthRepository } from '../repositories/AuthRepository';

export class SignOut {
  constructor(private readonly repository: AuthRepository) {}

  /** Cierra la sesión. Lo que quedó en memoria de la cuenta lo limpia ClearSessionData (AuthProvider lo llama al cambiar de cuenta). */
  execute(): Promise<void> {
    return this.repository.signOut();
  }
}
