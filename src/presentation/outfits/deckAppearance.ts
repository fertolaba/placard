import type { Outfit } from '../../domain/entities/Outfit';
import { hexToHsl, isNeutral } from '../../domain/services/colorHarmony';

const NEUTRAL_GRADIENT = { bg1: '#8B7B6B', bg2: '#D9C8B2' };

function hslToHex(h: number, s: number, l: number): string {
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`.toUpperCase();
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((start) => parseInt(clean.slice(start, start + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Outfit no trae colores de fondo: salen del color más vivo del look, o de un arena si todo es neutro. */
export function deckGradient(outfit: Pick<Outfit, 'garments'>): { bg1: string; bg2: string } {
  const colorful = outfit.garments
    .map((garment) => hexToHsl(garment.colorHex))
    .filter((hsl) => !isNeutral(hsl))
    .sort((a, b) => b.s - a.s);
  const base = colorful[0];
  if (!base) return NEUTRAL_GRADIENT;
  const saturation = Math.max(0.55, base.s);
  return {
    bg1: hslToHex(base.h, saturation, Math.min(0.55, Math.max(0.38, base.l))),
    bg2: hslToHex((base.h + 22) % 360, saturation, 0.7),
  };
}

/** "Rojo + neutros", "Rojo + Azul" o "Neutros". */
export function paletteLabel(outfit: Outfit): string {
  const colorful = outfit.garments.filter((garment) => !isNeutral(hexToHsl(garment.colorHex)));
  const names = [...new Set(colorful.map((garment) => garment.colorName))];
  if (names.length === 0) return 'Neutros';
  return colorful.length < outfit.garments.length ? [...names, 'neutros'].join(' + ') : names.join(' + ');
}
