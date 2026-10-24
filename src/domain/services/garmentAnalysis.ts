import { GARMENT_CATEGORIES, type GarmentCategory } from '../entities/Garment';
import { normalizeSeasons, type Season } from '../entities/Season';
import type { GarmentTypeDetection, SleeveLength } from './CategoryDetector';

/** Lo que el modelo de IA tiene que devolver al mirar la foto (los nombres coinciden con el esquema JSON que se le pide). */
export interface GarmentAnalysis {
  esPrenda: boolean; // false si la foto no muestra una prenda que la app maneje (un vestido, una cartera, nada)
  tipo: string; // "Remera", "Jean", "Zapatillas"…
  categoria: GarmentCategory;
  manga: SleeveLength | 'no_aplica';
  temporadas: Season[];
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
 */
export function parseGarmentAnalysis(raw: unknown): GarmentTypeDetection | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const data = raw as Partial<Record<keyof GarmentAnalysis, unknown>>;
  if (data.esPrenda !== true || !isCategory(data.categoria)) return null;

  const type = typeof data.tipo === 'string' ? data.tipo.trim().slice(0, 40) : '';
  if (type === '') return null;

  const category = data.categoria;
  const sleeve = category === 'arriba' && (data.manga === 'larga' || data.manga === 'corta') ? data.manga : null;
  const fromModel = normalizeSeasons(Array.isArray(data.temporadas) ? data.temporadas : []);
  const seasons = fromModel.length > 0 ? fromModel : seasonsForSleeve(sleeve);
  return { type, category, sleeve, seasons };
}
