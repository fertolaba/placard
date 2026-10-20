import { useEffect, useState } from 'react';
import { container } from '../../core/di/container';
import type { Garment } from '../../domain/entities/Garment';

type Status = 'loading' | 'ready' | 'notFound' | 'error';

/** Carga una prenda por su id. Se carga una sola vez: así, al borrarla, la pantalla no parpadea. */
export function useGarment(id: string | undefined) {
  const [garment, setGarment] = useState<Garment | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!id) {
      setStatus('notFound');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    container.getGarment
      .execute(id)
      .then((result) => {
        if (cancelled) return;
        setGarment(result);
        setStatus(result ? 'ready' : 'notFound');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { garment, status };
}