/** Lo que la cuenta con sesión dejó guardado en este teléfono. */
export interface AccountLocalData {
  clear(): Promise<void>;
}
