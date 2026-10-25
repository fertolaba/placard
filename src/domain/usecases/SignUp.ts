import type { SignUpInput } from '../entities/AuthUser';
import { isSex } from '../entities/Sex';
import { AuthError, type AuthRepository, type SignUpResult } from '../repositories/AuthRepository';
import { normalizeEmail, normalizeUsername, validateSignUp } from '../services/authValidation';

export class SignUp {
  constructor(private readonly repository: AuthRepository) {}

  /** Crea la cuenta. Si el proyecto pide confirmar el email, la persona todavía no queda con sesión. */
  async execute(input: SignUpInput): Promise<SignUpResult> {
    const problem = validateSignUp(input);
    if (problem || !isSex(input.sex)) throw new AuthError(problem ?? 'Elegí tu sexo.');
    return this.repository.signUp({
      email: normalizeEmail(input.email),
      password: input.password,
      username: normalizeUsername(input.username),
      sex: input.sex,
    });
  }
}
