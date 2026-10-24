/** La persona que inició sesión. Por ahora solo hace falta saber quién es; sus datos siguen siendo locales. */
export interface AuthUser {
  id: string;
  email: string;
}
