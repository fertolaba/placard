import type { AuthRepository } from '../repositories/AuthRepository';
import type { AccountLocalData } from '../services/AccountLocalData';

export class DeleteAccount {
  constructor(
    private readonly repository: AuthRepository,
    private readonly localData: AccountLocalData,
  ) {}

  /** Si falla el borrado en el servidor no se toca nada del teléfono: la cuenta sigue intacta. */
  async execute(): Promise<void> {
    await this.repository.deleteAccount();
    await this.localData.clear().catch(() => undefined); // la cuenta ya no existe: no se puede volver atrás
    await this.repository.signOut().catch(() => undefined);
  }
}
