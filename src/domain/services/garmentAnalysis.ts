import { GARMENT_CATEGORIES, GARMENT_CUTS, type GarmentCategory } from '../entities/Garment';
import { normalizeSeasons, type Season } from '../entities/Season';
import type { GarmentTypeDetection, SleeveLength } from './CategoryDetector';

/** Lo que el modelo de IA tiene que devolver al mirar la foto (los nombres coinciden con el esquema JSON que se le pide). */
export interface GarmentAnalysis {
  esPrenda: boolean; // false si la foto no muestra una prenda que la app maneje (un vestido, una cartera, nada)
  tipo: string; // "Remera", "Crop top", "Jean", "Pollera", "Zapatillas"…
  categoria: GarmentCategory;
  manga: SleeveLength | 'no_aplica';
  temporadas: Season[];
  corte: string; // uno de GARMENT_CUTS[categoria], o "no_aplica" para calzado
  es_deportiva: boolean; // camiseta de fútbol, camiseta de un club o selección, ropa de entrenamiento
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

const isCategory = (value: unknown): value is GarmentCategory =>
  typeof value === 'string' && (GARMENT_CATEGORIES as readonly string[]).includes(value);

/**
 * Revisa la respuesta del modelo (puede venir incompleta o con valores inventados) y la convierte en una detección.
 * Devuelve null si no es una prenda que la app maneje: la persona elige a mano.
 * Si el modelo no dio épocas válidas, se deducen del largo de manga.
 * Un corte que no corresponde a la categoría (por ejemplo "baggy" en una remera) se descarta.
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
  const sporty = data.es_deportiva === true; // si el modelo no lo dice, se asume que no es deportiva
  return { type, category, sleeve, seasons, cut, sporty };
}
