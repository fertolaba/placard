import type { GarmentCategory } from '../domain/entities/Garment';
import type { Sex } from '../domain/entities/Sex';
import { categoriesFor } from '../domain/services/garmentCatalog';

/** Cómo se muestra el nombre de cada categoría. */
export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  arriba: 'Arriba',
  top: 'Top',
  abajo: 'Abajo',
  pollera: 'Pollera',
  calzado: 'Calzado',
};

/** Las categorías que corresponden al perfil, listas para un SegmentedControl. */
export function categoryOptionsFor(sex: Sex | null): { value: GarmentCategory; label: string }[] {
  return categoriesFor(sex).map((value) => ({ value, label: CATEGORY_LABELS[value] }));
}
