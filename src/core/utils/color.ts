/** Devuelve el color de texto (blanco o casi negro) que mejor se lee sobre un fondo #RRGGBB. */
export function readableOn(hex: string): '#FFFFFF' | '#1C1C1E' {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1C1C1E' : '#FFFFFF';
}
