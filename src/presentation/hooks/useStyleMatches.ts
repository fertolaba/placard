import { useEffect, useState } from 'react';
import { container } from '../../core/di/container';
import type { StyleMatch } from '../../domain/entities/StyleReference';
import { useDataVersion } from '../state/dataVersion';

type Status = 'loading' | 'ready' | 'error';

export function useStyleMatches() {
  const [matches, setMatches] = useState<StyleMatch[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const dataVersion = useDataVersion();

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    container.getStyleMatches
      .execute()
      .then((result) => {
        if (cancelled) return;
        setMatches(result);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey, dataVersion]);

  return { matches, status, reload: () => setReloadKey((key) => key + 1) };
}