export const SEXES = ['femenino', 'masculino'] as const;
export type Sex = (typeof SEXES)[number];

export const isSex = (value: unknown): value is Sex =>
  typeof value === 'string' && (SEXES as readonly string[]).includes(value);
