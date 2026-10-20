import { useSyncExternalStore } from 'react';

let version = 0;
const listeners = new Set<() => void>();

/** Avisa a todas las pantallas que los datos cambiaron (por ejemplo, se agregó una prenda). */
export function notifyDataChanged(): void {
  version += 1;
  listeners.forEach((listener) => listener());
}

/** Devuelve un número que sube cada vez que cambian los datos: sirve para volver a cargar. */
export function useDataVersion(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => version,
    () => version,
  );
}