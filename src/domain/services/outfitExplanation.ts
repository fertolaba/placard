import type { Garment } from '../entities/Garment';
import { hexToRgb, rgbToLab } from './colorDetection';
import { hexToHsl, isNeutral, type Hsl } from './colorHarmony';
import type { GarmentColor } from './garmentColors';

/** La regla de teoría del color que explica la combinación de los colores dominantes. */
export type ColorRule = 'neutros' | 'acento' | 'monocromo' | 'analogos' | 'complementarios' | 'triada' | 'contraste';

/** Un color de los detalles de una prenda que se repite en otra: es lo que "une" el look. */
export interface DetailEcho {
  color: GarmentColor; // el color del detalle
  from: Garment; // la prenda que tiene el detalle
  to: Garment; // la prenda donde se repite
  text: string;
}

export interface OutfitExplanation {
  rule: ColorRule;
  ruleName: string; // "Colores complementarios"
  ruleText: string; // la explicación con los colores y las prendas de este look
  echoes: DetailEcho[];
  contrastText: string | null; // qué aporta la mezcla de claros y oscuros (null si no hay nada que decir)
  description: string; // una línea corta para mostrar debajo del título
}

const SAME_COLOR_DISTANCE = 15; // en CIELAB: por debajo de esto, el ojo los ve como el mismo color
const ECHO_BONUS = 4; // puntos de "match" por cada detalle que se repite
const MAX_ECHO_BONUS = 8;

const RULE_NAMES: Record<ColorRule, string> = {
  neutros: 'Base neutra',
  acento: 'Color de acento',
  monocromo: 'Monocromático',
  analogos: 'Colores análogos',
  complementarios: 'Colores complementarios',
  triada: 'Tríada',
  contraste: 'Contraste libre',
};

interface Dominant {
  garment: Garment;
  name: string;
  hsl: Hsl;
}

const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** "tu remera", "tus zapatillas" (si el nombre termina en s, se toma como plural). */
const yours = (garment: Garment) => `${/s$/i.test(garment.name.trim()) ? 'tus' : 'tu'} ${lower(garment.name.trim())}`;

/** "rojo", "rojo y azul", "rojo, azul y blanco" (sin repetir nombres). */
function listNames(names: string[]): string {
  const unique = [...new Set(names.map(lower))];
  if (unique.length <= 1) return unique[0] ?? '';
  return `${unique.slice(0, -1).join(', ')} y ${unique[unique.length - 1]}`;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

function sameColor(a: GarmentColor, b: GarmentColor): boolean {
  if (a.name.toLowerCase() === b.name.toLowerCase()) return true;
  const [l1, a1, b1] = rgbToLab(...hexToRgb(a.hex));
  const [l2, a2, b2] = rgbToLab(...hexToRgb(b.hex));
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2) < SAME_COLOR_DISTANCE;
}

/** Los detalles (colores secundarios) de cada prenda que repiten un color de otra prenda del look. */
export function detailEchoes(garments: readonly Garment[]): DetailEcho[] {
  const echoes: DetailEcho[] = [];
  for (const from of garments) {
    for (const color of from.secondaryColors) {
      for (const to of garments) {
        if (to.id === from.id) continue;
        const dominant = { name: to.colorName, hex: to.colorHex };
        const inDetails = to.secondaryColors.find((item) => sameColor(item, color));
        if (!sameColor(dominant, color) && !inDetails) continue;
        if (echoes.some((echo) => echo.to.id === from.id && echo.from.id === to.id && sameColor(echo.color, color))) continue; // ya se contó al revés
        const where = sameColor(dominant, color)
          ? `el ${lower(dominant.name)} de ${yours(to)}`
          : `los detalles en ${lower(inDetails!.name)} de ${yours(to)}`;
        echoes.push({
          color,
          from,
          to,
          text: `Los detalles en ${lower(color.name)} de ${yours(from)} repiten ${where}: esa repetición conecta las prendas.`,
        });
      }
    }
  }
  return echoes;
}

/** Puntos extra de "match" por los detalles que se repiten entre prendas. */
export function echoBonus(garments: readonly Garment[]): number {
  return Math.min(MAX_ECHO_BONUS, detailEchoes(garments).length * ECHO_BONUS);
}

function pickRule(colorful: Dominant[]): { rule: ColorRule; distance: number } {
  if (colorful.length === 0) return { rule: 'neutros', distance: 0 };
  if (colorful.length === 1) return { rule: 'acento', distance: 0 };
  const distances: number[] = [];
  for (let i = 0; i < colorful.length; i++) {
    for (let j = i + 1; j < colorful.length; j++) distances.push(hueDistance(colorful[i].hsl.h, colorful[j].hsl.h));
  }
  const max = Math.max(...distances);
  const min = Math.min(...distances);
  if (max <= 12) return { rule: 'monocromo', distance: max };
  if (max <= 30) return { rule: 'analogos', distance: max };
  if (colorful.length === 2) {
    if (max >= 150) return { rule: 'complementarios', distance: max };
    if (max >= 100 && max <= 140) return { rule: 'triada', distance: max };
    return { rule: 'contraste', distance: max };
  }
  return min >= 100 ? { rule: 'triada', distance: min } : { rule: 'contraste', distance: max };
}

function ruleText(rule: ColorRule, distance: number, colorful: Dominant[], neutrals: Dominant[]): string {
  const colorNames = listNames(colorful.map((item) => item.name));
  const neutralNames = listNames(neutrals.map((item) => item.name));
  const [first, second] = colorful;
  const pair = first && second ? `${capitalize(lower(first.name))} y ${lower(second.name)}` : '';
  const withNeutrals = neutrals.length > 0 ? ` ${capitalize(neutralNames)} ${neutrals.length > 1 ? 'suman' : 'suma'} una base neutra que ordena el conjunto.` : '';

  switch (rule) {
    case 'neutros':
      return `${capitalize(neutralNames)} son colores neutros: no compiten entre sí, por eso combinan con todo y el conjunto se ve prolijo. El interés lo ponen el contraste de luz y las texturas.`;
    case 'acento':
      return `El ${lower(first.name)} de ${yours(first.garment)} es el único color vivo, y ${neutralNames} lo ${neutrals.length > 1 ? 'acompañan' : 'acompaña'} sin competir. Es la regla del color de acento: un protagonista y el resto en calma.`;
    case 'monocromo':
      return `${capitalize(colorNames)} son el mismo tono en distintas intensidades. Un look monocromático se ve continuo, alarga la figura y es difícil que falle.${withNeutrals}`;
    case 'analogos':
      return `${colorful.length > 2 ? capitalize(colorNames) : pair} están a ${distance}° en el círculo cromático: son colores análogos, vecinos que comparten base y por eso se ven armónicos sin esfuerzo.${withNeutrals}`;
    case 'complementarios':
      return `${pair} están casi opuestos en el círculo cromático (${distance}°): son complementarios y se realzan entre sí. Funcionan mejor cuando uno domina y el otro acompaña.${withNeutrals}`;
    case 'triada':
      return colorful.length > 2
        ? `${capitalize(colorNames)} están separados alrededor de 120° en el círculo cromático: forman una tríada, una mezcla vibrante pero equilibrada.${withNeutrals}`
        : `${pair} están a ${distance}° en el círculo cromático, la distancia de una tríada: contrastan con energía sin llegar a chocar.${withNeutrals}`;
    case 'contraste':
      return `${colorful.length > 2 ? capitalize(colorNames) : pair} no son vecinos ni opuestos en el círculo cromático (${distance}°), así que la combinación es más arriesgada.${
        neutrals.length > 0
          ? ` ${capitalize(neutralNames)} ${neutrals.length > 1 ? 'ayudan' : 'ayuda'} a calmarla.`
          : ' Sumar un neutro o un detalle que los una la haría más segura.'
      }`;
  }
}

function contrastText(dominants: Dominant[]): string | null {
  const sorted = [...dominants].sort((a, b) => a.hsl.l - b.hsl.l);
  const darkest = sorted[0];
  const lightest = sorted[sorted.length - 1];
  const range = lightest.hsl.l - darkest.hsl.l;
  if (range >= 0.45) {
    return `Mezcla claros y oscuros (${lower(lightest.name)} con ${lower(darkest.name)}): ese contraste de luz le da estructura al look.`;
  }
  if (range < 0.15) return 'Todos los colores tienen una luminosidad parecida: el look se ve suave y parejo.';
  return null;
}

function shortDescription(rule: ColorRule, colorful: Dominant[], hasEchoes: boolean): string {
  const base: Record<ColorRule, string> = {
    neutros: 'Neutros que no compiten entre sí',
    acento: `Un toque de ${lower(colorful[0]?.name ?? 'color')} sobre neutros`,
    monocromo: 'Un mismo tono en distintas intensidades',
    analogos: 'Tonos vecinos del círculo cromático',
    complementarios: 'Opuestos que se realzan',
    triada: 'Contraste vibrante y equilibrado',
    contraste: 'Una mezcla atrevida',
  };
  return hasEchoes ? `${base[rule]}, con detalles que se repiten` : base[rule];
}

/** Explica por qué combinan las prendas de un look: la regla de color de los dominantes y los detalles que se repiten. */
export function explainOutfit(garments: readonly Garment[]): OutfitExplanation {
  const dominants: Dominant[] = garments.map((garment) => ({ garment, name: garment.colorName, hsl: hexToHsl(garment.colorHex) }));
  const colorful = dominants.filter((item) => !isNeutral(item.hsl));
  const neutrals = dominants.filter((item) => isNeutral(item.hsl));
  const { rule, distance } = pickRule(colorful);
  const echoes = detailEchoes(garments);
  return {
    rule,
    ruleName: RULE_NAMES[rule],
    ruleText: ruleText(rule, Math.round(distance), colorful, neutrals),
    echoes,
    contrastText: dominants.length > 0 ? contrastText(dominants) : null,
    description: shortDescription(rule, colorful, echoes.length > 0),
  };
}
