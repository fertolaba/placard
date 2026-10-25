import type { Garment, GarmentCategory } from './Garment';

export type Tone = 'oscuro' | 'claro' | 'neutro' | 'color' | 'cualquiera';

/** Una pieza que pide el estilo: de qué categorías y con qué tono de color. */
export interface StyleSlot {
  label: string;
  categories: readonly GarmentCategory[]; // las que cubren la pieza, de la preferida a la menos preferida
  tone: Tone;
  requiresSporty?: boolean; // true = solo la cubre una prenda deportiva (por ejemplo, la camiseta de fútbol)
}

export const STYLE_IDS = ['streetwear', 'old-money', 'y2k', 'techwear', 'blokecore'] as const;
export type StyleId = (typeof STYLE_IDS)[number];

export interface StyleReference {
  id: StyleId;
  name: string;
  description: string;
  note?: string;
  palette: string[]; // colores representativos (#RRGGBB)
  allowsSporty?: boolean; // sin esto, las prendas deportivas no se usan en ninguna pieza del estilo
  slots: StyleSlot[];
}

/** Qué piezas de tu placard cubren el estilo y cuáles te faltan. */
export interface StyleMatch {
  reference: StyleReference;
  matched: { slot: StyleSlot; garment: Garment }[];
  missing: StyleSlot[];
}