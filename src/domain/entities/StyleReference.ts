import type { Garment, GarmentCategory } from './Garment';

export type Tone = 'oscuro' | 'claro' | 'neutro' | 'color' | 'cualquiera';

/** Una pieza que pide el estilo: de qué categoría y con qué tono de color. */
export interface StyleSlot {
  label: string;
  category: GarmentCategory;
  tone: Tone;
}

export interface StyleReference {
  id: string;
  name: string;
  description: string;
  note?: string;
  palette: string[]; // colores representativos (#RRGGBB)
  slots: StyleSlot[];
}

/** Qué piezas de tu placard cubren el estilo y cuáles te faltan. */
export interface StyleMatch {
  reference: StyleReference;
  matched: { slot: StyleSlot; garment: Garment }[];
  missing: StyleSlot[];
}