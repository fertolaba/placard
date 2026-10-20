import { useEffect, useState } from 'react';
import { container } from '../../core/di/container';
import type { Garment, GarmentCategory } from '../../domain/entities/Garment';
import { useDataVersion } from '../state/dataVersion';

export type CategoryFilterValue = GarmentCategory | 'todo';
type Status = 'loading' | 'ready' | 'error';

export function useGarments(category: CategoryFilterValue) {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const dataVersion = useDataVersion();

  useEffect(() => {
    let cancelled = false; // evita pisar datos si el usuario cambia de filtro rápido
    setStatus('loading');
    container.getGarments
      .execute(category === 'todo' ? undefined : category)
      .then((result) => {
        if (cancelled) return;
        setGarments(result);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [category, reloadKey, dataVersion]);

  return { garments, status, reload: () => setReloadKey((key) => key + 1) };
}