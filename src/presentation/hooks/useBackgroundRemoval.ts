import { useCallback, useEffect, useRef, useState } from 'react';
import { container } from '../../core/di/container';

const SLOW_AFTER_MS = 8000;

export type PhotoChoice = 'original' | 'cutout';

export interface CutoutReview {
  cutoutUri: string;
  selected: PhotoChoice;
}

/** Estado del recorte de una foto. checkOnMount averigua de entrada si se puede ofrecer el botón "Quitar fondo". */
export function useBackgroundRemoval(checkOnMount: boolean) {
  const [available, setAvailable] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [slow, setSlow] = useState(false); // el recorte en curso ya lleva un rato
  const [review, setReview] = useState<CutoutReview | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const latestRequest = useRef(0); // para ignorar el resultado de una foto anterior o de un recorte cancelado

  useEffect(() => {
    if (!checkOnMount) return;
    let cancelled = false;
    void container.removeGarmentBackground.isAvailable().then((result) => {
      if (!cancelled) setAvailable(result);
    });
    return () => {
      cancelled = true;
    };
  }, [checkOnMount]);

  useEffect(() => {
    if (!removing) return;
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [removing]);

  /** Sin servidor no muestra nada: el flujo sigue como si el recorte no existiera. */
  const start = useCallback(async (photoUri: string) => {
    const requestId = ++latestRequest.current;
    setRemoving(false);
    setReview(null);
    setNotice(null);

    if (!(await container.removeGarmentBackground.isAvailable())) return;
    if (requestId !== latestRequest.current) return;

    setRemoving(true);
    const result = await container.removeGarmentBackground.execute(photoUri);
    if (requestId !== latestRequest.current) return;

    setRemoving(false);
    if (result.removed) setReview({ cutoutUri: result.uri, selected: 'cutout' });
    else setNotice(result.notice);
  }, []);

  const select = useCallback((selected: PhotoChoice) => {
    setReview((current) => (current ? { ...current, selected } : current));
  }, []);

  /** Cierra la comparación o cancela el recorte en curso. */
  const dismiss = useCallback(() => {
    latestRequest.current += 1;
    setRemoving(false);
    setReview(null);
  }, []);

  return { available, removing, slow, review, notice, start, select, dismiss };
}
