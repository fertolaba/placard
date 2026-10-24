import type { AuthRepository } from '../repositories/AuthRepository';

export class SignOut {
  constructor(private readonly repository: AuthRepository) {}

  /** Cierra la sesión. Las prendas y el perfil quedan en el teléfono: todavía no dependen de la cuenta. */
  execute(): Promise<void> {
    return this.repository.signOut();
  }
}
