import { normalizeSeasons } from '../entities/Season';
import { GARMENT_CUTS, MAX_SECONDARY_COLORS, type NewGarment } from '../entities/Garment';
import type { GarmentColor } from './garmentColors';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Los colores secundarios limpios: con formato válido, sin repetir, sin el dominante y como mucho MAX_SECONDARY_COLORS. */
export function normalizeSecondaryColors(colors: readonly GarmentColor[], dominantHex: string): GarmentColor[] {
  const seen = new Set([dominantHex.toUpperCase()]);
  const result: GarmentColor[] = [];
  for (const color of colors) {
    const hex = color.hex.toUpperCase();
    if (!HEX_COLOR.test(hex) || color.name.trim() === '' || seen.has(hex)) continue;
    seen.add(hex);
    result.push({ name: color.name.trim(), hex });
    if (result.length === MAX_SECONDARY_COLORS) break;
  }
  return result;
}

/** Reglas de negocio de una prenda: devuelve los datos limpios o lanza un error con el motivo. */
export function normalizeGarmentData(input: NewGarment): NewGarment {
  const name = input.name.trim();
  if (name === '') throw new Error('La prenda necesita un nombre.');
  if (name.length > 40) throw new Error('El nombre puede tener hasta 40 caracteres.');
  if (!HEX_COLOR.test(input.colorHex)) throw new Error('El color tiene que tener el formato #RRGGBB.');
  const seasons = normalizeSeasons(input.seasons ?? []);
  if (seasons.length === 0) throw new Error('Elegí al menos una época del año.');
  // Un corte que no corresponde a la categoría (por ejemplo "baggy" en una remera) no se guarda.
  const corte = input.corte !== undefined && GARMENT_CUTS[input.category].includes(input.corte) ? input.corte : undefined;
  const secondaryColors = normalizeSecondaryColors(input.secondaryColors ?? [], input.colorHex);
  return { ...input, name, seasons, corte, secondaryColors };
}