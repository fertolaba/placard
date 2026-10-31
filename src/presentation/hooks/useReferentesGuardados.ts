import { useSyncExternalStore } from 'react';
import { container } from '../../core/di/container';

// Estado compartido: guardar desde el detalle tiene que verse al volver a la lista, y al revés.
let guardados: ReadonlySet<string> = new Set();
let generacion = 0; // sube cuando se deja de mostrar la cuenta actual: lo que llegue después se descarta
let pendientes = 0;
let cola: Promise<unknown> = Promise.resolve(); // las lecturas y escrituras van de a una, en el orden en que se pidieron
const listeners = new Set<() => void>();

function publicar(ids: ReadonlySet<string>): void {
  guardados = ids;
  listeners.forEach((listener) => listener());
}

function cargar(): void {
  const generacionPedida = generacion;
  cola = cola
    .then(() => container.getReferentesGuardados.execute())
    .then((ids) => {
      // Con cambios en camino se espera al último: es el que trae el estado final.
      if (generacionPedida === generacion && pendientes === 0) publicar(new Set(ids));
    })
    .catch(() => {});
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) cargar();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Sin pantallas abiertas (se cerró la sesión) se olvidan: la próxima cuenta no ve los de la anterior.
    if (listeners.size === 0) {
      generacion += 1;
      guardados = new Set();
    }
  };
}

/** Se ve al instante y se escribe atrás; si falla la escritura, se vuelve a lo que quedó guardado. */
export function toggleReferenteGuardado(id: string): void {
  const generacionPedida = generacion;
  const siguiente = new Set(guardados);
  if (!siguiente.delete(id)) siguiente.add(id);
  publicar(siguiente);

  pendientes += 1;
  cola = cola
    .then(() => container.toggleReferenteGuardado.execute(id))
    .then((ids) => {
      pendientes -= 1;
      if (generacionPedida === generacion && pendientes === 0) publicar(new Set(ids));
    })
    .catch(() => {
      pendientes -= 1;
      cargar();
    });
}

export function useReferentesGuardados(): ReadonlySet<string> {
  return useSyncExternalStore(
    subscribe,
    () => guardados,
    () => guardados,
  );
}
