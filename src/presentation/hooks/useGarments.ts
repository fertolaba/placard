import { useEffect, useState } from 'react';
import { container } from '../../core/di/container';
import type { Garment, GarmentCategory } from '../../domain/entities/Garment';
import type { Season } from '../../domain/entities/Season';
import { useDataVersion } from '../state/dataVersion';

export type CategoryFilterValue = GarmentCategory | 'todo';
export type SeasonFilterValue = Season | 'todas';
type Status = 'loading' | 'ready' | 'error';

export function useGarments(category: CategoryFilterValue, season: SeasonFilterValue = 'todas') {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const dataVersion = useDataVersion();

  useEffect(() => {
    let cancelled = false; // evita pisar datos si el usuario cambia de filtro rápido
    // Si ya hay datos en pantalla, se dejan hasta que lleguen los nuevos (evita el parpadeo al deslizar).
    setStatus((current) => (current === 'ready' ? current : 'loading'));
    container.getGarments
      .execute({
        category: category === 'todo' ? undefined : category,
        season: season === 'todas' ? undefined : season,
      })
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
  }, [category, season, reloadKey, dataVersion]);

  return { garments, status, reload: () => setReloadKey((key) => key + 1) };
}