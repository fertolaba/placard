import { useSyncExternalStore } from 'react';
import { container } from '../../core/di/container';
import type { SavedOutfit } from '../../domain/entities/SavedOutfit';

// Estado compartido: guardar en Outfits tiene que verse en Guardados, y al revés.
let saved: readonly SavedOutfit[] = [];
let generation = 0; // sube cuando se deja de mostrar la cuenta actual: lo que llegue después se descarta
let pending = 0;
let queue: Promise<unknown> = Promise.resolve(); // las lecturas y escrituras van de a una, en orden
const listeners = new Set<() => void>();

function publish(next: readonly SavedOutfit[]): void {
  saved = next;
  listeners.forEach((listener) => listener());
}

function load(): void {
  const requested = generation;
  queue = queue
    .then(() => container.getSavedOutfits.execute())
    .then((list) => {
      if (requested === generation && pending === 0) publish(list);
    })
    .catch(() => undefined);
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) load();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Sin pantallas abiertas (se cerró la sesión) se olvidan: la próxima cuenta no ve los de la anterior.
    if (listeners.size === 0) {
      generation += 1;
      saved = [];
    }
  };
}

/** Se ve al instante y se escribe atrás; si falla la escritura, se vuelve a lo que quedó guardado. */
export function toggleSavedOutfit(outfit: SavedOutfit): void {
  const requested = generation;
  publish(saved.some((item) => item.id === outfit.id) ? saved.filter((item) => item.id !== outfit.id) : [outfit, ...saved]);

  pending += 1;
  queue = queue
    .then(() => container.toggleSavedOutfit.execute(outfit))
    .then((list) => {
      pending -= 1;
      if (requested === generation && pending === 0) publish(list);
    })
    .catch(() => {
      pending -= 1;
      load();
    });
}

export function useSavedOutfits(): readonly SavedOutfit[] {
  return useSyncExternalStore(
    subscribe,
    () => saved,
    () => saved,
  );
}
