import type { SessionCache } from '../services/SessionCache';

export class ClearSessionData {
  constructor(private readonly caches: readonly SessionCache[]) {}

  /** Vacía lo que quedó en memoria de la cuenta anterior, para que la siguiente arranque de cero. */
  execute(): void {
    for (const cache of this.caches) cache.clear();
  }
}
