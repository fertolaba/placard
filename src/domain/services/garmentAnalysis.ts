import {
  GARMENT_CATEGORIES,
  GARMENT_CUTS,
  isCalzadoTipo,
  isEstampado,
  MAX_SECONDARY_COLORS,
  type CalzadoTipo,
  type Estampado,
  type GarmentCategory,
} from '../entities/Garment';
import { isFormalidad, type Formalidad } from '../entities/Formality';
import { normalizeSeasons, type Season } from '../entities/Season';
import type { GarmentTypeDetection, SleeveLength } from './CategoryDetector';
import { GARMENT_COLORS, type GarmentColor } from './garmentColors';

/** Lo que el modelo de IA tiene que devolver al mirar la foto (los nombres coinciden con el esquema JSON que se le pide). */
export interface GarmentAnalysis {
  esPrenda: boolean; // false si la foto no muestra una prenda que la app maneje (un vestido, una cartera, nada)
  tipo: string; // "Remera", "Crop top", "Jean", "Pollera", "Zapatillas"…
  categoria: GarmentCategory;
  manga: SleeveLength | 'no_aplica';
  temporadas: Season[];
  corte: string; // uno de GARMENT_CUTS[categoria], o "no_aplica" para calzado
  calzado_tipo: CalzadoTipo | 'no_aplica'; // solo calzado: "no_aplica" para el resto
  es_deportiva: boolean; // camiseta de fútbol con mangas, short de fútbol o botines
  es_clasica: boolean; // camisa, chomba, sweater fino, blazer, pantalón sastrero, mocasines
  estampado: Estampado; // liso, logo chico o estampa grande
  formalidad: Formalidad; // clasico, casual o deportivo
  color_dominante: string; // uno de los nombres de GARMENT_COLORS
  colores_secundarios: string[]; // nombres de GARMENT_COLORS; vacío si la prenda es lisa
}

/** El color de la lista con ese nombre (sin importar mayúsculas), o null si el modelo inventó uno. */
function colorNamed(name: unknown): GarmentColor | null {
  if (typeof name !== 'string') return null;
  const wanted = name.trim().toLowerCase();
  return GARMENT_COLORS.find((color) => color.name.toLowerCase() === wanted) ?? null;
}

/** Manga larga abriga: sirve para entretiempo e invierno. Manga corta (o sin mangas): verano. */
const SLEEVE_SEASONS: Record<SleeveLength, Season[]> = {
  larga: ['entretiempo', 'invierno'],
  corta: ['verano'],
};

/** Las épocas que corresponden a un largo de manga (null si no se sabe). */
export function seasonsForSleeve(sleeve: SleeveLength | null): Season[] | null {
  return sleeve ? [...SLEEVE_SEASONS[sleeve]] : null;
}

/**
 * Si el tipo contiene alguna de estas palabras, la prenda nunca es deportiva, aunque el modelo diga lo contrario.
 * Para ampliar la lista, agregá la palabra acá: se compara sin distinguir mayúsculas ni tildes.
 */
const NEVER_SPORTY_WORDS = ['musculosa', 'tank', 'sin mangas', 'nba', 'básquet', 'basquet', 'basket', 'jersey de basket'];

const withoutAccents = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Si el tipo contiene alguna de estas palabras, o el corte es uno de estos, la prenda nunca es clásica. */
const NEVER_CLASSIC_WORDS = ['buzo', 'hoodie', 'jogger', 'zapatilla', 'camiseta', 'musculosa'];
const NEVER_CLASSIC_CUTS = ['oversize', 'baggy'];

function containsAnyWord(type: string, words: readonly string[]): boolean {
  const wanted = withoutAccents(type);
  return words.some((word) => wanted.includes(withoutAccents(word)));
}

const isCategory = (value: unknown): value is GarmentCategory =>
  typeof value === 'string' && (GARMENT_CATEGORIES as readonly string[]).includes(value);

/**
 * Revisa la respuesta del modelo (puede venir incompleta o con valores inventados) y la convierte en una detección.
 * Devuelve null si no es una prenda que la app maneje: la persona elige a mano.
 * Si el modelo no dio épocas válidas, se deducen del largo de manga.
 * Un corte que no corresponde a la categoría (por ejemplo "baggy" en una remera) se descarta.
 * Los colores que no están en la lista se descartan; los secundarios no repiten el dominante.
 * El tipo de calzado solo vale en calzado y si es uno de CALZADO_TIPOS; si falta o no corresponde, queda null.
 */
export function parseGarmentAnalysis(raw: unknown): GarmentTypeDetection | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const data = raw as Partial<Record<keyof GarmentAnalysis, unknown>>;
  if (data.esPrenda !== true || !isCategory(data.categoria)) return null;

  const type = typeof data.tipo === 'string' ? data.tipo.trim().slice(0, 40) : '';
  if (type === '') return null;

  const category = data.categoria;
  const hasSleeves = category === 'arriba' || category === 'top';
  const sleeve = hasSleeves && (data.manga === 'larga' || data.manga === 'corta') ? data.manga : null;
  const fromModel = normalizeSeasons(Array.isArray(data.temporadas) ? data.temporadas : []);
  const seasons = fromModel.length > 0 ? fromModel : seasonsForSleeve(sleeve);
  const cut = typeof data.corte === 'string' && GARMENT_CUTS[category].includes(data.corte) ? data.corte : null;
  const calzadoTipo = category === 'calzado' && isCalzadoTipo(data.calzado_tipo) ? data.calzado_tipo : null;
  const sporty = data.es_deportiva === true && !containsAnyWord(type, NEVER_SPORTY_WORDS); // si el modelo no lo dice, se asume que no es deportiva
  // Se mira el corte que dijo el modelo y no `cut`: un "baggy" descartado por no corresponder a la categoría igual delata la prenda.
  const classic =
    data.es_clasica === true &&
    !(typeof data.corte === 'string' && NEVER_CLASSIC_CUTS.includes(data.corte)) &&
    !containsAnyWord(type, NEVER_CLASSIC_WORDS);
  const dominantColor = colorNamed(data.color_dominante);
  const secondaryColors: GarmentColor[] = [];
  for (const name of Array.isArray(data.colores_secundarios) ? data.colores_secundarios : []) {
    const color = colorNamed(name);
    if (!color || color.hex === dominantColor?.hex || secondaryColors.some((item) => item.hex === color.hex)) continue;
    secondaryColors.push(color);
    if (secondaryColors.length === MAX_SECONDARY_COLORS) break;
  }
  // Un estampado fuera de la lista (o que no vino) queda en null: la prenda es neutra para los referentes.
  const estampado = isEstampado(data.estampado) ? data.estampado : null;
  const formalidad = isFormalidad(data.formalidad) ? data.formalidad : null; // lo mismo con la formalidad
  return { type, category, sleeve, seasons, cut, calzadoTipo, sporty, classic, estampado, formalidad, dominantColor, secondaryColors };
}
