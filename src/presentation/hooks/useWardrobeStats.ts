import { useEffect, useState } from 'react';
import { container } from '../../core/di/container';
import type { WardrobeStats } from '../../domain/usecases/GetWardrobeStats';
import { useDataVersion } from '../state/dataVersion';

/** Los números del placard. Si no se pueden leer queda en null y la pantalla simplemente no muestra la paleta. */
export function useWardrobeStats(): WardrobeStats | null {
  const [stats, setStats] = useState<WardrobeStats | null>(null);
  const dataVersion = useDataVersion();

  useEffect(() => {
    let cancelled = false;
    container.getWardrobeStats
      .execute()
      .then((loaded) => {
        if (!cancelled) setStats(loaded);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [dataVersion]);

  return stats;
}
