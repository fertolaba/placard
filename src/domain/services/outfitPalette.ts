import type { Garment } from '../entities/Garment';
import { hexToHsl, isNeutral, type Hsl } from './colorHarmony';
import type { GarmentColor } from './garmentColors';

/**
 * La paleta efectiva de un look: los colores principales y también los secundarios saturados (el rojo de unas
 * Jordan blancas, el verde de un escudo). Los secundarios no tienen peso guardado: todo secundario saturado se toma
 * como un acento visible.
 */

/** Un color vivo del look y de dónde sale. */
export interface PaletteAccent {
  color: GarmentColor;
  hsl: Hsl;
  garment: Garment;
  principal: boolean; // false = viene de los colores secundarios
}

/** Acentos del mismo tono (a ±ACCENT_GROUP_DISTANCE°), como el rojo de una remera y el de unas zapatillas. */
export interface AccentGroup {
  color: GarmentColor; // el que da nombre al grupo: el primer principal, o el primer secundario si no hay principal
  accents: PaletteAccent[];
  fromPrincipal: boolean; // al menos un acento del grupo es el color principal de una prenda
}

export interface PaletteEvaluation {
  groups: AccentGroup[];
  /** true = la idea no se propone: más de dos acentos, o dos que chocan (rojo con verde, por ejemplo). */
  discard: boolean;
  /** Un acento que solo está en los detalles y suma un segundo color al look: el match no llega a 90%. */
  offRule: boolean;
  reasons: string[];
}

/** Tonos a esta distancia o menos cuentan como el mismo acento ("verde" y "verde botella"). */
export const ACCENT_GROUP_DISTANCE = 30;
/** El match máximo de una idea con un acento fuera de su regla. */
export const OFF_RULE_MAX_MATCH = 89;
/** Dos principales a esta distancia o más son la regla de "Colores complementarios" que ya existe (ver explainOutfit). */
const COMPLEMENTARY_RULE_DISTANCE = 150;

export function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

/**
 * Neutros de la moda: los de isNeutral (negro, blanco, grises, beige, camel, verdes apagados) y además el denim
 * apagado, que en la ropa acompaña como un neutro.
 */
export function isFashionNeutral(hsl: Hsl): boolean {
  if (isNeutral(hsl)) return true;
  return hsl.h >= 195 && hsl.h <= 235 && hsl.s <= 0.35 && hsl.l >= 0.3 && hsl.l <= 0.65;
}

/** Los acentos de una prenda: su color principal si es vivo, y sus secundarios vivos de otro tono que el principal. */
export function garmentAccents(garment: Garment): PaletteAccent[] {
  const accents: PaletteAccent[] = [];
  const principal = hexToHsl(garment.colorHex);
  if (!isFashionNeutral(principal)) {
    accents.push({ color: { name: garment.colorName, hex: garment.colorHex }, hsl: principal, garment, principal: true });
  }
  for (const color of garment.secondaryColors) {
    const hsl = hexToHsl(color.hex);
    if (isFashionNeutral(hsl)) continue;
    if (accents.some((accent) => hueDistance(accent.hsl.h, hsl.h) <= ACCENT_GROUP_DISTANCE)) continue; // un tono que la prenda ya aporta
    accents.push({ color, hsl, garment, principal: false });
  }
  return accents;
}

/** Agrupa los acentos del look por tono. Los principales van primero, así le dan nombre al grupo. */
export function accentGroups(garments: readonly Garment[]): AccentGroup[] {
  const all = garments.flatMap(garmentAccents);
  const ordered = [...all.filter((accent) => accent.principal), ...all.filter((accent) => !accent.principal)];
  const groups: AccentGroup[] = [];
  for (const accent of ordered) {
    const group = groups.find((item) => hueDistance(hexToHsl(item.color.hex).h, accent.hsl.h) <= ACCENT_GROUP_DISTANCE);
    if (group) {
      group.accents.push(accent);
      group.fromPrincipal ||= accent.principal;
    } else {
      groups.push({ color: accent.color, accents: [accent], fromPrincipal: accent.principal });
    }
  }
  return groups;
}

type HueFamily = 'rojo' | 'naranja' | 'amarillo' | 'verde' | 'azul' | 'violeta' | 'rosa';

/** Familia de un tono, como se nombran en la ropa (el círculo HSL pone el rojo y el verde a solo ~130°). */
function hueFamily(h: number): HueFamily {
  if (h < 15 || h >= 350) return 'rojo';
  if (h < 40) return 'naranja';
  if (h < 70) return 'amarillo';
  if (h < 170) return 'verde';
  if (h < 250) return 'azul';
  if (h < 295) return 'violeta';
  return 'rosa';
}

/** Complementarios saturados que chocan cuando aparecen en prendas distintas. */
const CLASHING_FAMILIES: readonly [HueFamily, HueFamily][] = [
  ['rojo', 'verde'],
  ['azul', 'naranja'],
  ['violeta', 'amarillo'],
];

function clash(a: AccentGroup, b: AccentGroup): boolean {
  const familyA = hueFamily(hexToHsl(a.color.hex).h);
  const familyB = hueFamily(hexToHsl(b.color.hex).h);
  if (!CLASHING_FAMILIES.some(([x, y]) => (familyA === x && familyB === y) || (familyA === y && familyB === x))) return false;
  // Tienen que venir de prendas distintas: una camiseta roja y verde es una sola prenda pensada así.
  const acrossGarments = a.accents.some((x) => b.accents.some((y) => x.garment.id !== y.garment.id));
  if (!acrossGarments) return false;
  // La regla "Colores complementarios" del catálogo ya existe para dos protagonistas opuestos (por ejemplo, azul y
  // naranja): se respeta solo si los dos son colores principales y están opuestos de verdad.
  const principalA = a.accents.find((accent) => accent.principal);
  const principalB = b.accents.find((accent) => accent.principal);
  return !(principalA && principalB && hueDistance(principalA.hsl.h, principalB.hsl.h) >= COMPLEMENTARY_RULE_DISTANCE);
}

/** Si la paleta del look se sostiene, contando los secundarios vivos de todas las prendas. */
export function evaluatePalette(garments: readonly Garment[]): PaletteEvaluation {
  const groups = accentGroups(garments);
  const reasons: string[] = [];
  let discard = false;

  if (groups.length > 2) {
    discard = true;
    reasons.push(`Tiene demasiados acentos: ${groups.map((group) => group.color.name.toLowerCase()).join(', ')}`);
  }
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      if (clash(groups[i], groups[j])) {
        discard = true;
        reasons.push(`El ${groups[i].color.name.toLowerCase()} y el ${groups[j].color.name.toLowerCase()} chocan`);
      }
    }
  }
  // Con dos acentos, uno que solo está en los detalles queda fuera de la regla de la idea.
  const offRule = groups.length === 2 && groups.some((group) => !group.fromPrincipal);
  return { groups, discard, offRule, reasons };
}

/** Los colores que se ven en la carta: el principal de cada prenda y, después, sus secundarios vivos. */
export function paletteDots(garments: readonly Garment[]): GarmentColor[] {
  return garments.flatMap((garment) => [
    { name: garment.colorName, hex: garment.colorHex },
    ...garmentAccents(garment)
      .filter((accent) => !accent.principal)
      .map((accent) => accent.color),
  ]);
}

/** Los colores con los que se califica la armonía: los principales más los secundarios vivos. */
export function paletteHexes(garments: readonly Garment[]): string[] {
  return paletteDots(garments).map((color) => color.hex);
}
