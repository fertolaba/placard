/** Algo que guarda datos de la cuenta con sesión mientras la app está abierta (por ejemplo, direcciones de fotos). */
export interface SessionCache {
  /** Olvida todo lo guardado: se llama cuando se cierra la sesión o entra otra cuenta. */
  clear(): void;
}
