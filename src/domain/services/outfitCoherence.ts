import type { Formality } from '../entities/Formality';
import type { Garment } from '../entities/Garment';
import type { StyleId, StyleReference } from '../entities/StyleReference';
import { hemShoeFit } from './bottomHem';
import { garmentFitsSlot } from './garmentFitsSlot';
import { STYLE_REFERENCES } from './styleCatalog';

/**
 * Si las prendas de un look combinan entre sí, más allá del color. Cuatro criterios:
 * estilo compartido (las mismas reglas de `garmentFitsSlot` que usan las pantallas de estilos),
 * formalidad (clásico ↔ casual ↔ deportivo/técnico), silueta (cortes y calzado) y la bocamanga del
 * pantalón con el calzado (ver bottomHem: una bota con un jogger ajustado es conflicto duro).
 * Un dato que falta nunca resta: la prenda queda neutra en ese criterio.
 */
export interface OutfitCoherence {
  score: number; // 0 a 1
  hardConflict: boolean; // true = el look no se propone, aunque el color sea perfecto
  sharedStyles: StyleId[]; // estilos donde entran arriba y abajo, del más afín al menos
  reasons: string[];
}

/** Peso de cada criterio dentro de la coherencia (suman 1). */
export const COHERENCE_WEIGHTS = { style: 0.4, formality: 0.3, silhouette: 0.3 } as const;

/** Estilo: sin estilo en común, pero con una prenda básica o sin datos de por medio. */
const STYLE_SCORE_BRIDGED = 0.4;
/** Estilo: arriba y abajo comparten estilo, pero el calzado no. */
const STYLE_SCORE_SHOE_APART = 0.75;
/** Formalidad: un nivel de distancia (clásico con casual, casual con deportivo). */
const FORMALITY_SCORE_ONE_STEP = 0.6;

const PENALTY_CUT_INTENT = 0.35; // un corte típico de un estilo con una prenda que no entra en ese estilo
const PENALTY_LOOSE_FORMAL = 0.6; // oversize, boxy, baggy o wide leg junto a una prenda clásica
const PENALTY_SHOE_CLASH = 0.6; // mocasín con prendas deportivas, o botines con prendas clásicas
const PENALTY_SHOE_RUGGED = 0.35; // botita o suela gruesa con prendas clásicas
/** Zapatilla de suela gruesa con un pantalón ajustado en el tobillo: se resta de la coherencia total (no se descarta). */
export const PENALTY_HEM_CHUNKY = 0.15;

/** Los niveles están en entities/Formality: también los usa el matching de referentes. null = no se sabe (neutro). */
export type { Formality };
const FORMALITY_NAMES: Record<Formality, string> = { 0: 'clásica', 1: 'casual', 2: 'deportiva' };

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// Las prendas no guardan su tipo: se lee del nombre, solo como respaldo de los flags classic/sporty.
const TECHNICAL_NAME = /\b(jogger\w*|tech|tecnic\w*|deportiv\w*|futbol|botin\w*|running|training|track\w*|tactic\w*)\b/;
const FORMAL_NAME = /\b(chomba\w*|polo|camisa|sastrer\w*|vestir|mocasin\w*|blazer|saco|oxford\w*|zapatos?)\b/;
const CASUAL_NAME = /\b(remera\w*|jeans?|musculosa\w*|buzo\w*|hoodie|canguro|bermuda\w*)\b/;
const RUGGED_SHOE_NAME = /\b(botas?|botitas?|borcego\w*|borsego\w*)\b/;

/** Nivel de formalidad que delata el nombre de una prenda ("Campera Nike Tech", "Chomba blanca"); null = no dice. */
export function formalityFromName(text: string): Formality | null {
  const name = normalize(text);
  if (TECHNICAL_NAME.test(name)) return 2;
  if (FORMAL_NAME.test(name)) return 0;
  if (CASUAL_NAME.test(name)) return 1;
  return null;
}

/** Nivel de formalidad de una prenda de arriba o de abajo. */
export function garmentFormality(garment: Garment): Formality | null {
  if (garment.classic) return 0;
  if (garment.sporty) return 2;
  return formalityFromName(garment.name);
}

type ShoeKind = 'formal' | 'technical' | 'rugged' | 'neutral';

function shoeKind(shoe: Garment): ShoeKind {
  const name = normalize(shoe.name);
  if (shoe.classic || FORMAL_NAME.test(name)) return 'formal';
  if (shoe.sporty || /\bbotin\w*\b/.test(name)) return 'technical';
  if (shoe.calzadoTipo === 'botita' || shoe.calzadoTipo === 'gruesa' || RUGGED_SHOE_NAME.test(name)) return 'rugged';
  return 'neutral';
}

/**
 * Estilos en los que entra la prenda, con las mismas reglas que las pantallas de estilos.
 * El tono se ignora: el color ya se puntúa aparte y no tiene que contar dos veces.
 */
export function stylesOf(garment: Garment, references: readonly StyleReference[] = STYLE_REFERENCES): StyleReference[] {
  return references.filter((reference) =>
    reference.slots.some((slot) => garmentFitsSlot(reference, { ...slot, tone: 'cualquiera' }, garment)),
  );
}

const LOOSE_CUTS = new Set(['oversize', 'boxy', 'baggy', 'wide leg']);

export function evaluateOutfitCoherence(
  top: Garment,
  bottom: Garment,
  shoe?: Garment | null,
  references: readonly StyleReference[] = STYLE_REFERENCES,
): OutfitCoherence {
  const reasons: string[] = [];
  let hardConflict = false;

  // 1. Estilo compartido
  const topStyles = stylesOf(top, references);
  const bottomStyles = stylesOf(bottom, references);
  const bottomIds = new Set(bottomStyles.map((reference) => reference.id));
  const shared = topStyles.filter((reference) => bottomIds.has(reference.id));
  const topLevel = garmentFormality(top);
  const bottomLevel = garmentFormality(bottom);
  // Una prenda casual o sin datos hace de puente: no es motivo para descartar, solo resta.
  const bridged = topLevel === null || topLevel === 1 || bottomLevel === null || bottomLevel === 1;

  let styleScore = 1;
  if (shared.length === 0) {
    if (bridged) {
      styleScore = STYLE_SCORE_BRIDGED;
      reasons.push(`${top.name} y ${bottom.name} no comparten ningún estilo`);
    } else {
      styleScore = 0;
      hardConflict = true;
      reasons.push(`${top.name} y ${bottom.name} son de estilos distintos`);
    }
  } else if (shoe) {
    const shoeIds = new Set(stylesOf(shoe, references).map((reference) => reference.id));
    if (!shared.some((reference) => shoeIds.has(reference.id))) {
      styleScore = STYLE_SCORE_SHOE_APART;
      reasons.push(`${shoe.name} no es del mismo estilo que el resto`);
    }
  }

  // Del estilo más afín al menos: el que más cortes típicos reúne; a igualdad, el orden del catálogo.
  const preferredCount = (reference: StyleReference) =>
    [top, bottom, shoe].filter((item) => item?.corte !== undefined && reference.preferredCuts?.includes(item.corte)).length;
  const sharedStyles = [...shared].sort((a, b) => preferredCount(b) - preferredCount(a)).map((reference) => reference.id);

  // 2. Formalidad
  let formalityScore = 1;
  if (topLevel !== null && bottomLevel !== null) {
    const distance = Math.abs(topLevel - bottomLevel);
    if (distance === 2) {
      formalityScore = 0;
      hardConflict = true;
      reasons.push(`Una prenda ${FORMALITY_NAMES[topLevel]} no va con una ${FORMALITY_NAMES[bottomLevel]}`);
    } else if (distance === 1) {
      formalityScore = FORMALITY_SCORE_ONE_STEP;
      reasons.push(`Mezcla una prenda ${FORMALITY_NAMES[topLevel]} con una ${FORMALITY_NAMES[bottomLevel]}`);
    }
  }

  // 3. Silueta: cortes y calzado
  let silhouetteScore = 1;
  const levels = [topLevel, bottomLevel];
  const hasFormal = levels.includes(0);
  const hasTechnical = levels.includes(2);
  // Un corte típico de un estilo (por ejemplo, skinny en Techwear) pide que la otra prenda también entre en ese estilo.
  for (const [garment, otherStyles] of [
    [top, bottomStyles],
    [bottom, topStyles],
  ] as const) {
    if (garment.corte === undefined) continue;
    const cut = garment.corte;
    const intended = references.filter((reference) => reference.preferredCuts?.includes(cut));
    if (intended.length > 0 && !intended.some((reference) => otherStyles.includes(reference))) {
      silhouetteScore -= PENALTY_CUT_INTENT;
      reasons.push(`El corte ${cut} de ${garment.name} no acompaña al resto del look`);
    }
  }
  // El volumen contrastado vale en lo casual; con una prenda clásica, lo holgado desentona.
  if (hasFormal && [top, bottom].some((garment) => garment.corte !== undefined && LOOSE_CUTS.has(garment.corte))) {
    silhouetteScore -= PENALTY_LOOSE_FORMAL;
    reasons.push('Un corte muy holgado no va con una prenda clásica');
  }
  if (shoe) {
    const kind = shoeKind(shoe);
    if ((kind === 'formal' && hasTechnical) || (kind === 'technical' && hasFormal)) {
      silhouetteScore -= PENALTY_SHOE_CLASH;
      reasons.push(`${shoe.name} no va con la formalidad del resto`);
    } else if (kind === 'rugged' && hasFormal) {
      silhouetteScore -= PENALTY_SHOE_RUGGED;
      reasons.push(`${shoe.name} es demasiado pesado para un look clásico`);
    }
  }
  silhouetteScore = Math.max(0, silhouetteScore);

  // 4. Bocamanga del pantalón con el calzado (ver hemShoeFit): resta directo de la coherencia, sin pasar por los pesos.
  let hemPenalty = 0;
  if (shoe) {
    const fit = hemShoeFit(bottom, shoe);
    if (fit === 'conflicto') {
      hardConflict = true;
      reasons.push(`${shoe.name} no va con un pantalón ajustado en el tobillo como ${bottom.name}`);
    } else if (fit === 'leve') {
      hemPenalty = PENALTY_HEM_CHUNKY;
      reasons.push(`${shoe.name} queda pesado con un pantalón ajustado en el tobillo`);
    }
  }

  const weighted =
    COHERENCE_WEIGHTS.style * styleScore +
    COHERENCE_WEIGHTS.formality * formalityScore +
    COHERENCE_WEIGHTS.silhouette * silhouetteScore -
    hemPenalty;
  // Redondeado a milésimas: sin esto, la suma de los pesos podría dar 0,9999… con todo perfecto.
  const score = hardConflict ? 0 : Math.max(0, Math.round(weighted * 1000) / 1000);
  return { score, hardConflict, sharedStyles, reasons };
}
