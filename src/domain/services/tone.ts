import type { Tone } from '../entities/StyleReference';
import { hexToHsl, isNeutral } from './colorHarmony';

/** Dice si un color (#RRGGBB) encaja con el tono que pide una pieza del estilo. */
export function matchesTone(hex: string, tone: Tone): boolean {
  const hsl = hexToHsl(hex);
  switch (tone) {
    case 'oscuro':
      return hsl.l < 0.35;
    case 'claro':
      return hsl.l > 0.75;
    case 'neutro':
      return isNeutral(hsl);
    case 'color':
      return !isNeutral(hsl);
    case 'cualquiera':
      return true;
  }
}