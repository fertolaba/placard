import type { Garment } from '../entities/Garment';
import type { StyleReference, StyleSlot } from '../entities/StyleReference';
import { garmentFitsSlot } from './garmentFitsSlot';

/** Lo que resta `principalScore` cuando el mejor estilo de la prenda es otro. */
const OTHER_HOME_PENALTY = 3;

/** Cuánto encaja la prenda en una pieza que ya la acepta. */
function slotScore(garment: Garment, slot: StyleSlot): number {
  let score = 1;
  if (slot.tone !== 'cualquiera') score += 2;
  if (slot.requiresSporty || slot.requiresClassic) score += 2;
  if (slot.cuts && garment.corte !== undefined && slot.cuts.includes(garment.corte)) score += 1;
  if (slot.categories[0] === garment.category) score += 1;
  return score;
}

/**
 * Puntaje de la prenda en un estilo, tomando la mejor pieza que la acepta.
 * Devuelve null si no encaja en ninguna. Los cortes preferidos son del estilo: suman una sola vez.
 * Es la base común a todos los estilos: con ella se elige el estilo de casa de la prenda.
 */
function baseAffinity(garment: Garment, reference: StyleReference): number | null {
  const scores = reference.slots.filter((slot) => garmentFitsSlot(reference, slot, garment)).map((slot) => slotScore(garment, slot));
  if (scores.length === 0) return null;
  const preferred = garment.corte !== undefined && reference.preferredCuts?.includes(garment.corte) ? 2 : 0;
  return Math.max(...scores) + preferred;
}

/** Lo que resta un estampado que el estilo tolera pero no le queda (un logo en Old Money). */
export const ESTAMPADO_PENALTY = 2;

/** "Campera Nike Tech" → "campera nike tech"; "Técnico" → "tecnico". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Ajuste propio del estilo: penaliza un estampado tolerado y suma lo técnico, lo liso y los colores sobrios. */
function styleAdjustment(garment: Garment, reference: StyleReference): number {
  let adjustment = garment.estampado !== undefined && reference.estampados?.[garment.estampado] === 'penaliza' ? -ESTAMPADO_PENALTY : 0;
  const boost = reference.affinityBoost;
  if (!boost) return adjustment;
  if (boost.technical) {
    const { keywords, formalidades, uncleanCuts, bonus } = boost.technical;
    const name = normalize(garment.name);
    const byName = keywords.some((keyword) => new RegExp(`\\b${keyword}`).test(name));
    const byFormality = garment.formalidad !== undefined && formalidades.includes(garment.formalidad);
    const cleanCut = garment.corte === undefined || !uncleanCuts.includes(garment.corte);
    if ((byName || byFormality) && cleanCut) adjustment += bonus;
  }
  if (garment.estampado !== undefined) adjustment += boost.estampado?.[garment.estampado] ?? 0;
  if (boost.colors?.names.includes(garment.colorName)) adjustment += boost.colors.bonus;
  return adjustment;
}

/**
 * Qué tanto le queda la prenda al estilo: la base más el ajuste propio del estilo (Techwear premia lo técnico y liso).
 * Devuelve null si no encaja en ninguna pieza.
 */
export function affinity(garment: Garment, reference: StyleReference): number | null {
  const base = baseAffinity(garment, reference);
  return base === null ? null : base + styleAdjustment(garment, reference);
}

/**
 * El estilo donde mejor encaja la prenda. null si no entra en ninguno o si hay empate en el primer lugar.
 * Usa la base sin los ajustes propios de cada estilo: así sumar afinidad en Techwear no le cambia el estilo de casa
 * a una prenda ni, por la penalización de "otro estilo de casa", el orden de los demás estilos.
 */
export function homeStyle(garment: Garment, references: readonly StyleReference[]): StyleReference | null {
  let best: StyleReference | null = null;
  let bestScore = -Infinity;
  let tied = false;
  for (const reference of references) {
    const score = baseAffinity(garment, reference);
    if (score === null) continue;
    if (score > bestScore) {
      best = reference;
      bestScore = score;
      tied = false;
    } else if (score === bestScore) {
      tied = true;
    }
  }
  return tied ? null : best;
}

/**
 * Qué tan protagonista es la prenda en un estilo: su afinidad, con una penalización si su mejor estilo es otro.
 * Así solo le gana a otra prenda del estilo cuando no hay una alternativa que le pertenezca más.
 * Devuelve null si la prenda no entra en el estilo.
 */
export function principalScore(garment: Garment, reference: StyleReference, references: readonly StyleReference[]): number | null {
  const score = affinity(garment, reference);
  if (score === null) return null;
  const home = homeStyle(garment, references);
  return home !== null && home.id !== reference.id ? score - OTHER_HOME_PENALTY : score;
}

/**
 * Ordena de más a menos protagonista. A igual puntaje va primero la que tiene foto y después la más nueva;
 * el id resuelve el último empate, así el resultado no depende del orden de entrada.
 */
export function sortByPrincipal(garments: readonly Garment[], reference: StyleReference, references: readonly StyleReference[]): Garment[] {
  const scores = new Map(garments.map((garment) => [garment.id, principalScore(garment, reference, references) ?? -Infinity]));
  return [...garments].sort((a, b) => {
    const byScore = scores.get(b.id)! - scores.get(a.id)!;
    if (byScore !== 0) return byScore;
    const byPhoto = Number(b.imageUri !== null) - Number(a.imageUri !== null);
    if (byPhoto !== 0) return byPhoto;
    const byDate = b.createdAt.getTime() - a.createdAt.getTime();
    if (byDate !== 0) return byDate;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}
