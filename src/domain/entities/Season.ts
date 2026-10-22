export const SEASONS = ['verano', 'entretiempo', 'invierno'] as const;
export type Season = (typeof SEASONS)[number];

export function isSeason(value: unknown): value is Season {
  return typeof value === 'string' && (SEASONS as readonly string[]).includes(value);
}

/** Deja solo épocas válidas, sin repetir y siempre en el mismo orden (verano, entretiempo, invierno). */
export function normalizeSeasons(values: readonly unknown[]): Season[] {
  return SEASONS.filter((season) => values.includes(season));
}