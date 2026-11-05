import { useEffect, useState } from 'react';
import { container } from '../../core/di/container';
import type { Referente } from '../../domain/entities/Referente';

/** Un referente del catálogo por id (sin el match con el placard). null mientras carga, si no existe o sin id. */
export function useReferente(id: string | null): Referente | null {
  const [loaded, setLoaded] = useState<{ id: string; referente: Referente | null } | null>(null);

  useEffect(() => {
    if (id === null) return;
    let cancelled = false;
    container.getReferentes
      .execute()
      .then((referentes) => {
        if (!cancelled) setLoaded({ id, referente: referentes.find((referente) => referente.id === id) ?? null });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ id, referente: null }); // sin referente, el look se arma sin su filtro
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return id !== null && loaded?.id === id ? loaded.referente : null;
}
