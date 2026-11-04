import type { Garment } from '../entities/Garment';
import type { StyleReference, StyleSlot } from '../entities/StyleReference';
import { matchesTone } from './tone';

/**
 * Si una prenda puede cubrir una pieza de un estilo. Además de la categoría y el tono:
 * una pieza que pide camiseta de fútbol solo acepta esas, y las demás solo las aceptan si el estilo lo permite;
 * una pieza que pide una prenda clásica solo acepta clásicas, y un estilo que las excluye no usa ninguna;
 * una pieza con lista de cortes rechaza los demás (sin corte guardado pasa), lo mismo con los tipos de calzado,
 * y un estilo puede limitar los colores de detalle.
 */
export function garmentFitsSlot(reference: StyleReference, slot: StyleSlot, garment: Garment): boolean {
  if (!slot.categories.includes(garment.category) || !matchesTone(garment.colorHex, slot.tone)) return false;
  if (slot.requiresClassic && !garment.classic) return false;
  if (reference.excludesClassic && garment.classic) return false;
  if (slot.cuts && garment.corte !== undefined && !slot.cuts.includes(garment.corte)) return false;
  if (slot.calzadoTipos && garment.calzadoTipo !== undefined && !slot.calzadoTipos.includes(garment.calzadoTipo)) return false;
  if (reference.maxSecondaryColors !== undefined && garment.secondaryColors.length > reference.maxSecondaryColors) return false;
  if (slot.requiresSporty) return garment.sporty;
  return reference.allowsSporty === true || !garment.sporty;
}
