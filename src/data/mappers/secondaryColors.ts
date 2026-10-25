import type { GarmentColor } from '../../domain/services/garmentColors';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Lee los colores secundarios guardados (JSON en SQLite, jsonb en Supabase). Lo que esté dañado se descarta. */
export function parseSecondaryColors(raw: unknown): GarmentColor[] {
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) => {
    if (typeof item !== 'object' || item === null) return [];
    const { name, hex } = item as Record<string, unknown>;
    return typeof name === 'string' && name !== '' && typeof hex === 'string' && HEX_COLOR.test(hex) ? [{ name, hex }] : [];
  });
}
