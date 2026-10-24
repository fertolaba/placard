import { AuthError, type AuthRepository, type SignUpResult } from '../repositories/AuthRepository';
import { normalizeEmail, validateSignUp } from '../services/authValidation';

export class SignUp {
  constructor(private readonly repository: AuthRepository) {}

  /** Crea la cuenta. Si el proyecto pide confirmar el email, la persona todavía no queda con sesión. */
  async execute(email: string, password: string, confirmation: string): Promise<SignUpResult> {
    const problem = validateSignUp(email, password, confirmation);
    if (problem) throw new AuthError(problem);
    return this.repository.signUp(normalizeEmail(email), password);
  }
}
