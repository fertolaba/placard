import type { AuthUser } from '../entities/AuthUser';
import type { Sex } from '../entities/Sex';

/** Error de cuentas con un mensaje en español listo para mostrarle a la persona. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AuthError.prototype); // para que instanceof funcione en React Native
    this.name = 'AuthError';
  }
}

export interface SignUpResult {
  user: AuthUser | null;
  needsEmailConfirmation: boolean; // true si hay que confirmar el email antes de poder entrar
}

/** Datos ya validados y normalizados para crear la cuenta. */
export interface NewAccount {
  email: string;
  password: string;
  username: string;
  sex: Sex;
}

/**
 * Devuelve el id de la persona con sesión, o lanza un error si no hay sesión.
 * Los repositorios lo usan para guardar cada dato con su dueño y leer solo los de esa persona.
 */
export type CurrentUserId = () => Promise<string>;

/** Recibe la persona con sesión, o null cuando se cierra la sesión. */
export type AuthStateListener = (user: AuthUser | null) => void;

/** Las implementaciones lanzan AuthError (con el mensaje ya traducido) cuando algo sale mal. */
export interface AuthRepository {
  /** Crea la cuenta y guarda el nombre de usuario y el sexo en la cuenta y en su perfil. */
  signUp(account: NewAccount): Promise<SignUpResult>;
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  /** La sesión guardada en el teléfono (null si no hay). */
  getSession(): Promise<AuthUser | null>;
  /** Avisa cada vez que se inicia o se cierra la sesión. Devuelve la función para dejar de escuchar. */
  onAuthStateChange(listener: AuthStateListener): () => void;
}
