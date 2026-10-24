export const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // Supabase no acepta contraseñas más largas

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** El email sin espacios alrededor y en minúsculas, para que "Ana@Mail.com " y "ana@mail.com" sean la misma cuenta. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Devuelve el motivo por el que el email no sirve, o null si está bien. */
export function validateEmail(email: string): string | null {
  const value = normalizeEmail(email);
  if (value === '') return 'Escribí tu email.';
  if (!EMAIL.test(value)) return 'Ese email no parece válido. Revisá que tenga la forma nombre@ejemplo.com.';
  return null;
}

/** Reglas para una contraseña nueva. Devuelve el motivo por el que no sirve, o null si está bien. */
export function validateNewPassword(password: string): string | null {
  if (password === '') return 'Escribí una contraseña.';
  if (password.length < MIN_PASSWORD_LENGTH) return `La contraseña tiene que tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  if (password.length > MAX_PASSWORD_LENGTH) return `La contraseña puede tener hasta ${MAX_PASSWORD_LENGTH} caracteres.`;
  return null;
}

/** Revisa los datos para iniciar sesión. Una cuenta vieja podría tener otra regla de contraseña: solo se pide que no esté vacía. */
export function validateSignIn(email: string, password: string): string | null {
  return validateEmail(email) ?? (password === '' ? 'Escribí tu contraseña.' : null);
}

/** Revisa los datos para crear una cuenta. */
export function validateSignUp(email: string, password: string, confirmation: string): string | null {
  return (
    validateEmail(email) ??
    validateNewPassword(password) ??
    (password !== confirmation ? 'Las contraseñas no coinciden.' : null)
  );
}
