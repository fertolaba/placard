import { useEffect, useState } from 'react';
import { container } from '../../core/di/container';
import type { Outfit } from '../../domain/entities/Outfit';
import { useDataVersion } from '../state/dataVersion';

type Status = 'loading' | 'ready' | 'error';

export function useOutfitSuggestions() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const dataVersion = useDataVersion();

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    container.suggestOutfits
      .execute()
      .then((result) => {
        if (cancelled) return;
        setOutfits(result);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey, dataVersion]);

  return { outfits, status, reload: () => setReloadKey((key) => key + 1) };
}