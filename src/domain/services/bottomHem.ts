import type { CalzadoTipo, Garment } from '../entities/Garment';

/**
 * Bocamanga de un pantalón: cómo termina en el tobillo. No es un campo de la prenda: se deriva del corte y del nombre.
 * - 'ajustada': skinny, slim, jogger con puño, pantalón tech o deportivo, calza; todo lo que cierra en el tobillo.
 * - 'recta': straight, regular, sastrero, chino.
 * - 'ancha': baggy, wide leg, flared, oversize, cargo amplio.
 */
export type BottomHem = 'ajustada' | 'recta' | 'ancha';

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// El corte no distingue un jogger con puño de uno recto: todo jogger o pantalón tech cuenta como ajustado (lo más común).
// Por eso el nombre va antes que el corte.
const AJUSTADA_NAME = /\b(jogger\w*|jogging|tech|tecnic\w*|deportiv\w*|calzas?|leggings?|pu[nñ]os?|elastic\w*|chupin\w*)\b/;
const ANCHA_NAME = /\b(baggy|wide|amplio\w*|anch[oa]s?|oversize|palazzo|flare\w*|oxford|bombach\w*)\b/;
const RECTA_NAME = /\b(rect[oa]s?|straight|regular|sastrer\w*|chinos?|vestir)\b/;
// Los cortos no llegan al tobillo: el calzado no se encuentra con la bocamanga.
const SHORT_NAME = /\b(shorts?|bermudas?)\b/;

const CUT_HEM: Record<string, BottomHem> = {
  skinny: 'ajustada',
  slim: 'ajustada',
  straight: 'recta',
  baggy: 'ancha',
  'wide leg': 'ancha',
  flared: 'ancha',
};

/** La bocamanga de una prenda de abajo. null = no se sabe, no es un pantalón o es corto (neutro). */
export function bottomHem(garment: Garment): BottomHem | null {
  if (garment.category !== 'abajo') return null;
  const name = normalize(garment.name);
  if (SHORT_NAME.test(name)) return null;
  if (AJUSTADA_NAME.test(name)) return 'ajustada';
  if (garment.corte !== undefined && CUT_HEM[garment.corte]) return CUT_HEM[garment.corte];
  if (ANCHA_NAME.test(name)) return 'ancha';
  if (RECTA_NAME.test(name)) return 'recta';
  return null;
}

// Prendas viejas sin tipo de calzado: una bota se reconoce por el nombre. El resto queda sin tipo (neutro).
const BOTITA_NAME = /\b(botas?|botitas?|borcego\w*|borsego\w*|timberland\w*|borcegui\w*)\b/;

/** Tipo de calzado guardado o, si no tiene, el que delata el nombre (solo botas). null = no se sabe. */
export function shoeType(shoe: Garment): CalzadoTipo | null {
  if (shoe.calzadoTipo) return shoe.calzadoTipo;
  return BOTITA_NAME.test(normalize(shoe.name)) ? 'botita' : null;
}

/** Cómo se lleva la bocamanga con el calzado: 'ok', 'leve' (resta un poco) o 'conflicto' (el look no se propone). */
export type HemShoeFit = 'ok' | 'leve' | 'conflicto';

/**
 * Matriz pantalón × calzado. Una bota con un pantalón que cierra en el tobillo queda encajada y corta la pierna;
 * una zapatilla de suela gruesa con uno ajustado resulta pesada, pero se usa. Mocasines y calzado clásico quedan
 * neutros: los resuelve la regla de formalidad. Un dato que falta también es neutro.
 */
export function hemShoeFit(bottom: Garment, shoe: Garment): HemShoeFit {
  if (shoe.classic) return 'ok';
  const hem = bottomHem(bottom);
  const type = shoeType(shoe);
  if (hem !== 'ajustada' || type === null) return 'ok';
  if (type === 'botita') return 'conflicto';
  if (type === 'gruesa') return 'leve';
  return 'ok'; // caña alta (sobre o dentro de la caña) y baja van con todo
}
