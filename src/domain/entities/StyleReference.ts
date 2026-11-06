import type { Formalidad } from './Formality';
import type { CalzadoTipo, Estampado, Garment, GarmentCategory } from './Garment';

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

/** Qué hace un estilo con cada estampado: lo acepta, lo deja pero más abajo, o no lo usa. Sin dato = lo acepta. */
export type EstampadoTolerance = 'acepta' | 'penaliza' | 'excluye';

/**
 * Afinidad propia de un estilo: cuánto suma una prenda a ser la protagonista. Solo ordena dentro del estilo
 * (no decide si una prenda entra ni cuál es su estilo de casa), así no mueve el orden de los demás estilos.
 */
export interface StyleAffinityBoost {
  /** Prendas técnicas por nombre ("Campera Nike Tech", "Rompevientos") o por formalidad, con corte limpio. */
  technical?: { keywords: readonly string[]; formalidades: readonly Formalidad[]; uncleanCuts: readonly string[]; bonus: number };
  /** Suma (o resta) según el estampado. */
  estampado?: Partial<Record<Estampado, number>>;
  /** Colores sobrios del estilo: un plus leve, sin dejar afuera a los demás. */
  colors?: { names: readonly string[]; bonus: number };
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
  estampados?: Partial<Record<Estampado, EstampadoTolerance>>; // una prenda sin estampado guardado es neutra (no se excluye)
  affinityBoost?: StyleAffinityBoost;
  slots: StyleSlot[];
}

/** Qué piezas de tu placard cubren el estilo y cuáles te faltan. */
export interface StyleMatch {
  reference: StyleReference;
  matched: { slot: StyleSlot; garment: Garment }[];
  missing: StyleSlot[];
}