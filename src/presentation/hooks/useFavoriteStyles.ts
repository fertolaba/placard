import { useCallback, useEffect, useState } from 'react';
import { container } from '../../core/di/container';
import type { StyleId } from '../../domain/entities/StyleReference';

/** Los estilos favoritos: se ven al instante y se guardan atrás; si falla, se vuelve a lo que había. */
export function useFavoriteStyles() {
  const [favorites, setFavorites] = useState<readonly StyleId[]>([]);

  useEffect(() => {
    let cancelled = false;
    container.getFavoriteStyles
      .execute()
      .then((loaded) => {
        if (!cancelled) setFavorites(loaded);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback((id: StyleId) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      container.setFavoriteStyles.execute(next).catch(() => setFavorites(current));
      return next;
    });
  }, []);

  return { favorites, toggle };
}
