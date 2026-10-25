import type { Sex } from './Sex';

/** La persona que inició sesión. Sus prendas siguen siendo locales; estos datos vienen de la cuenta. */
export interface AuthUser {
  id: string;
  email: string;
  username: string | null; // null en cuentas creadas antes de pedir el nombre de usuario
  sex: Sex | null; // null en cuentas viejas: el formulario de prendas muestra todas las opciones
}

/** Lo que se pide al crear una cuenta (todo obligatorio). */
export interface SignUpInput {
  email: string;
  password: string;
  confirmation: string;
  username: string;
  sex: Sex | null; // null = todavía no eligió
}
