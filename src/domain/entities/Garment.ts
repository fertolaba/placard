import type { Season } from './Season';

// "top" y "pollera" son categorías propias (no variantes de "arriba" y "abajo"): solo se ofrecen en perfiles femeninos.
export const GARMENT_CATEGORIES = ['arriba', 'top', 'abajo', 'pollera', 'calzado'] as const;
export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number];

/** En qué parte del cuerpo va cada categoría: un look lleva una prenda de torso, una de piernas y, si hay, calzado. */
export type BodyZone = 'torso' | 'piernas' | 'pies';
export const CATEGORY_ZONE: Record<GarmentCategory, BodyZone> = {
  arriba: 'torso',
  top: 'torso',
  abajo: 'piernas',
  pollera: 'piernas',
  calzado: 'pies',
};

/** Cortes posibles según la categoría (el calzado no tiene). */
export const GARMENT_CUTS: Record<GarmentCategory, readonly string[]> = {
  arriba: ['ajustado', 'regular', 'oversize', 'boxy', 'cropped'],
  top: ['ajustado', 'regular', 'oversize', 'cropped'],
  abajo: ['skinny', 'slim', 'straight', 'baggy', 'wide leg', 'flared'],
  pollera: ['lápiz', 'recta', 'acampanada', 'tableada', 'cruzada'],
  calzado: [],
};

/** Todos los cortes, sin repetir (para el esquema que se le pide a la IA). */
export const ALL_GARMENT_CUTS: readonly string[] = [...new Set(Object.values(GARMENT_CUTS).flat())];

export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  colorHex: string; // formato #RRGGBB
  colorName: string;
  seasons: Season[]; // épocas del año en las que se usa (al menos una)
  corte?: string; // uno de GARMENT_CUTS[category]; opcional
  sporty: boolean; // ropa deportiva (camiseta de fútbol, etc.): en los estilos solo se usa en Blokecore
  photoRef: string | null; // referencia de la foto en PhotoStorage (es lo que se guarda)
  imageUri: string | null; // dirección lista para mostrar la foto (se calcula desde photoRef)
  createdAt: Date;
}

/** Datos editables de una prenda (el id, la fecha y la dirección de la foto los resuelve el repositorio). */
export type NewGarment = Omit<Garment, 'id' | 'createdAt' | 'imageUri'>;