import type { CalzadoTipo, Garment, GarmentCategory } from './Garment';

export type Tone = 'oscuro' | 'claro' | 'neutro' | 'color' | 'cualquiera';

/** Una pieza que pide el estilo: de qué categorías y con qué tono de color. */
export interface StyleSlot {
  label: string;
  categories: readonly GarmentCategory[]; // las que cubren la pieza, de la preferida a la menos preferida
  tone: Tone;
  requiresSporty?: boolean; // true = solo la cubre una prenda con `sporty`, es decir, una camiseta de fútbol
  requiresClassic?: boolean; // true = solo la cubre una prenda con `classic`
  cuts?: readonly string[]; // cortes aceptados; una prenda sin corte guardado pasa igual
  calzadoTipos?: readonly CalzadoTipo[]; // tipos de calzado aceptados; un calzado sin tipo guardado pasa igual
}

export const STYLE_IDS = ['streetwear', 'old-money', 'y2k', 'techwear', 'blokecore'] as const;
export type StyleId = (typeof STYLE_IDS)[number];

export interface StyleReference {
  id: StyleId;
  name: string;
  description: string;
  note?: string;
  palette: string[]; // colores representativos (#RRGGBB)
  allowsSporty?: boolean; // sin esto, las prendas con `sporty` (camisetas de fútbol) no se usan en ninguna pieza del estilo
  excludesClassic?: boolean; // true = las prendas con `classic` no se usan en ninguna pieza del estilo
  maxSecondaryColors?: number; // las prendas con más colores de detalle que este número no se usan en el estilo
  preferredCuts?: readonly string[]; // cortes típicos del estilo: no deciden si una prenda entra, solo cuál es la protagonista
  slots: StyleSlot[];
}

/** Qué piezas de tu placard cubren el estilo y cuáles te faltan. */
export interface StyleMatch {
  reference: StyleReference;
  matched: { slot: StyleSlot; garment: Garment }[];
  missing: StyleSlot[];
}