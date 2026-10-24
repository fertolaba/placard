import type { AuthUser } from '../entities/AuthUser';
import type { AuthRepository, AuthStateListener } from '../repositories/AuthRepository';

export class GetSession {
  constructor(private readonly repository: AuthRepository) {}

  /** La sesión guardada (null si no hay). Si no se puede leer, se toma como sin sesión. */
  async execute(): Promise<AuthUser | null> {
    try {
      return await this.repository.getSession();
    } catch {
      return null;
    }
  }

  /** Escucha los cambios de sesión. Devuelve la función para dejar de escuchar. */
  subscribe(listener: AuthStateListener): () => void {
    return this.repository.onAuthStateChange(listener);
  }
}
