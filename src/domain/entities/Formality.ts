/**
 * Formalidad de una prenda o de un estilo. La comparten la coherencia de los looks (mazo por color) y el matching
 * de los referentes, así los dos usan los mismos niveles.
 */
export const FORMALIDADES = ['clasico', 'casual', 'deportivo'] as const;
export type Formalidad = (typeof FORMALIDADES)[number];

/** 0 = clásico/formal, 1 = casual, 2 = deportivo/técnico. Sirve para medir distancias entre niveles. */
export type Formality = 0 | 1 | 2;

export const FORMALITY_OF: Record<Formalidad, Formality> = { clasico: 0, casual: 1, deportivo: 2 };

export const isFormalidad = (value: unknown): value is Formalidad =>
  typeof value === 'string' && (FORMALIDADES as readonly string[]).includes(value);
