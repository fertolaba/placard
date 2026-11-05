import { FORMALITY_OF, type Formality } from '../entities/Formality';
import type { Garment } from '../entities/Garment';
import type { Referente } from '../entities/Referente';
import { formalityFromName, garmentFormality } from './outfitCoherence';

/** Si una prenda del placard va con el estilo del referente, más allá del color y la categoría. */
export interface ReferenteFit {
  allowed: boolean; // false = no se propone para este referente
  penalty: number; // 0 = sin reparos; más alto = va después entre las que sirven
  reason?: string;
}

/** Penalización de un logo chico con un referente que se viste liso: entra, pero después de las lisas. */
export const PENALTY_LOGO_SOLO_LISO = 1;

const FORMALITY_LABEL: Record<Formality, string> = { 0: 'clásica', 1: 'casual', 2: 'deportiva o técnica' };

/**
 * Rango de formalidad que admite el referente, de lo más formal a lo más deportivo. Sin rango explícito, un nivel
 * para cada lado del predominante (un referente clásico no admite lo deportivo). null = sin datos: no filtra.
 * El rango se amplía para incluir sus propias prendas clave: si en su look hay una camisa, una camisa nunca queda
 * afuera, aunque el análisis de sus fotos haya dado "casual".
 */
export function formalityRangeOf(referente: Referente): readonly [Formality, Formality] | null {
  let range: [number, number];
  if (referente.formalityRange) {
    const [a, b] = referente.formalityRange.map((level) => FORMALITY_OF[level]);
    range = [Math.min(a, b), Math.max(a, b)];
  } else if (referente.formality) {
    const level = FORMALITY_OF[referente.formality];
    range = [Math.max(0, level - 1), Math.min(2, level + 1)];
  } else {
    return null;
  }
  for (const prenda of referente.prendasClave) {
    const level = formalityFromName(prenda.nombre);
    if (level !== null) range = [Math.min(range[0], level), Math.max(range[1], level)];
  }
  return range as [Formality, Formality];
}

/**
 * Formalidad y estampado de la prenda contra el perfil del referente. Si falta un dato (de la prenda o del
 * referente), ese criterio es neutro: nunca se descarta una prenda por falta de datos.
 */
export function referenteFit(referente: Referente, garment: Garment): ReferenteFit {
  const range = formalityRangeOf(referente);
  const level = garmentFormality(garment);
  if (range && level !== null && (level < range[0] || level > range[1])) {
    return { allowed: false, penalty: 0, reason: `Es una prenda ${FORMALITY_LABEL[level]}` };
  }

  const { graphics } = referente;
  const { estampado } = garment;
  if (graphics && estampado && graphics !== 'grafico-ok') {
    if (estampado === 'grafico') return { allowed: false, penalty: 0, reason: 'Tiene una estampa grande' };
    if (estampado === 'logo' && graphics === 'solo-liso') {
      return { allowed: true, penalty: PENALTY_LOGO_SOLO_LISO, reason: 'Tiene un logo chico' };
    }
  }
  return { allowed: true, penalty: 0 };
}

/** Las prendas del placard que van con el referente (para armar looks inspirados en él). */
export function garmentsForReferente(referente: Referente, garments: readonly Garment[]): Garment[] {
  return garments.filter((garment) => referenteFit(referente, garment).allowed);
}
