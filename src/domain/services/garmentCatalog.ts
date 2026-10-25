import { CATEGORY_ZONE, GARMENT_CATEGORIES, GARMENT_CUTS, type GarmentCategory } from '../entities/Garment';
import type { Sex } from '../entities/Sex';

/**
 * Lo que no se ofrece al cargar una prenda según el sexo del perfil.
 * Femenino ve todo. Masculino ve todos los cortes, pero no las categorías "top" ni "pollera".
 */
const HIDDEN: Record<Sex, { categories: readonly GarmentCategory[]; cuts: Partial<Record<GarmentCategory, readonly string[]>> }> = {
  femenino: { categories: [], cuts: {} },
  masculino: { categories: ['top', 'pollera'], cuts: {} },
};

/** Las categorías que se ofrecen en el formulario y en los filtros (todas si no se sabe el sexo). */
export function categoriesFor(sex: Sex | null): readonly GarmentCategory[] {
  if (sex === null) return GARMENT_CATEGORIES;
  return GARMENT_CATEGORIES.filter((category) => !HIDDEN[sex].categories.includes(category));
}

/** Los cortes que se ofrecen para una categoría (todos si no se sabe el sexo). */
export function cutsFor(category: GarmentCategory, sex: Sex | null): readonly string[] {
  if (sex === null) return GARMENT_CUTS[category];
  const hidden = HIDDEN[sex].cuts[category] ?? [];
  return GARMENT_CUTS[category].filter((cut) => !hidden.includes(cut));
}

/**
 * La categoría a usar cuando la IA detecta una que el perfil no tiene (un "top" en un perfil masculino):
 * la primera permitida de la misma parte del cuerpo ("arriba"). null si no hay ninguna.
 */
export function closestAllowedCategory(category: GarmentCategory, sex: Sex | null): GarmentCategory | null {
  const allowed = categoriesFor(sex);
  if (allowed.includes(category)) return category;
  return allowed.find((candidate) => CATEGORY_ZONE[candidate] === CATEGORY_ZONE[category]) ?? null;
}
