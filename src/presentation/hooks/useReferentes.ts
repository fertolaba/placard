import { useEffect, useMemo, useState } from 'react';
import { container } from '../../core/di/container';
import type { MatchReferente, Referente } from '../../domain/entities/Referente';
import { calcularMatch } from '../../domain/services/calcularMatch';
import { referentesParaPerfil } from '../../domain/services/referentesParaPerfil';
import { useAuth } from '../auth/AuthProvider';
import { useGarments } from './useGarments';

type Status = 'loading' | 'ready' | 'error';

export interface ReferenteConMatch {
  referente: Referente;
  match: MatchReferente;
}

/**
 * Los referentes que corresponden al perfil, con su match contra el placard. Lo usan la lista, los destacados,
 * el detalle y los guardados: filtrar acá evita que se cuele un referente en cualquiera de ellos.
 * Se recalcula cuando cambian las prendas o el sexo del perfil.
 */
export function useReferentes() {
  const [referentes, setReferentes] = useState<Referente[]>([]);
  const [referentesStatus, setReferentesStatus] = useState<Status>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const { garments, status: garmentsStatus, reload: reloadGarments } = useGarments('todo');
  const sex = useAuth().user?.sex ?? null;

  useEffect(() => {
    let cancelled = false;
    container.getReferentes
      .execute()
      .then((result) => {
        if (cancelled) return;
        setReferentes(result);
        setReferentesStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setReferentesStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const items = useMemo<ReferenteConMatch[]>(
    () => referentesParaPerfil(referentes, sex).map((referente) => ({ referente, match: calcularMatch(referente, garments) })),
    [referentes, garments, sex],
  );

  const status: Status =
    referentesStatus === 'error' || garmentsStatus === 'error'
      ? 'error'
      : referentesStatus === 'ready' && garmentsStatus === 'ready'
        ? 'ready'
        : 'loading';

  return {
    items,
    status,
    reload: () => {
      setReferentesStatus('loading');
      setReloadKey((key) => key + 1);
      reloadGarments();
    },
  };
}
