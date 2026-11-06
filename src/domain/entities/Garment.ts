import type { GarmentColor } from '../services/garmentColors';
import type { Formalidad } from './Formality';
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

/** Tipo de calzado, por el perfil de la suela y la altura de la caña. Un mocasín o zapato de vestir es 'baja' + `classic`. */
export const CALZADO_TIPOS = ['baja', 'gruesa', 'alta', 'botita'] as const;
export type CalzadoTipo = (typeof CALZADO_TIPOS)[number];
export const CALZADO_TIPO_LABELS: Record<CalzadoTipo, string> = {
  baja: 'Baja',
  gruesa: 'Gruesa',
  alta: 'Caña alta',
  botita: 'Botita',
};

export const isCalzadoTipo = (value: unknown): value is CalzadoTipo =>
  typeof value === 'string' && (CALZADO_TIPOS as readonly string[]).includes(value);

/**
 * Estampado de la prenda: 'liso' (sin logos ni textos), 'logo' (logo o texto chico, como un swoosh en el pecho) o
 * 'grafico' (estampa, letras o dibujo grande y protagonista).
 */
export const ESTAMPADOS = ['liso', 'logo', 'grafico'] as const;
export type Estampado = (typeof ESTAMPADOS)[number];
export const ESTAMPADO_LABELS: Record<Estampado, string> = {
  liso: 'Liso',
  logo: 'Logo chico',
  grafico: 'Estampa grande',
};

export const isEstampado = (value: unknown): value is Estampado =>
  typeof value === 'string' && (ESTAMPADOS as readonly string[]).includes(value);

/** Cuántos colores secundarios se guardan como máximo por prenda. */
export const MAX_SECONDARY_COLORS = 3;

/** Todos los cortes, sin repetir (para el esquema que se le pide a la IA). */
export const ALL_GARMENT_CUTS: readonly string[] = [...new Set(Object.values(GARMENT_CUTS).flat())];

export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  colorHex: string; // color dominante, formato #RRGGBB
  colorName: string; // nombre del color dominante
  secondaryColors: GarmentColor[]; // colores de detalles (rayas, estampa, logo, costuras); hasta MAX_SECONDARY_COLORS
  seasons: Season[]; // épocas del año en las que se usa (al menos una)
  corte?: string; // uno de GARMENT_CUTS[category]; opcional
  calzadoTipo?: CalzadoTipo; // solo calzado; sin valor = prenda vieja o no se sabe (no la excluye de ningún estilo)
  estampado?: Estampado; // sin valor = prenda vieja o no se sabe (neutra: no la excluye de ningún referente)
  formalidad?: Formalidad; // clásico, casual o deportivo; sin valor = se deduce del nombre, el corte y los flags (ver garmentFormality)
  sporty: boolean; // camiseta de fútbol (la IA también marca shorts de fútbol y botines): en los estilos solo se usa en Blokecore
  classic: boolean; // prenda clásica o formal: camisa, chomba, sweater fino, pantalón de vestir o sastrero, mocasines
  photoRef: string | null; // referencia de la foto en PhotoStorage (es lo que se guarda)
  imageUri: string | null; // dirección lista para mostrar la foto (se calcula desde photoRef)
  createdAt: Date;
}

/** Datos editables de una prenda (el id, la fecha y la dirección de la foto los resuelve el repositorio). */
export type NewGarment = Omit<Garment, 'id' | 'createdAt' | 'imageUri'>;