import type { AuthUser } from '../entities/AuthUser';
import { AuthError, type AuthRepository } from '../repositories/AuthRepository';
import { normalizeEmail, validateSignIn } from '../services/authValidation';

export class SignIn {
  constructor(private readonly repository: AuthRepository) {}

  async execute(email: string, password: string): Promise<AuthUser> {
    const problem = validateSignIn(email, password);
    if (problem) throw new AuthError(problem);
    return this.repository.signIn(normalizeEmail(email), password);
  }
}
