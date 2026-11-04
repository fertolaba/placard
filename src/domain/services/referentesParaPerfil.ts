import type { GeneroReferente, Referente } from '../entities/Referente';
import type { Sex } from '../entities/Sex';

/** El género de referente que no se le muestra a cada perfil. */
const OCULTO_PARA: Record<Sex, GeneroReferente> = { masculino: 'female', femenino: 'male' };

/**
 * Si un referente se le muestra a un perfil: un perfil masculino no ve referentes 'female' y uno femenino no ve 'male'.
 * Los 'unisex' y los que no tienen género se muestran siempre; un perfil sin sexo definido ve todos.
 */
export function seMuestraAlPerfil(referente: Pick<Referente, 'gender'>, sex: Sex | null): boolean {
  return sex === null || referente.gender !== OCULTO_PARA[sex];
}

/** El único filtro de referentes por perfil: todo lo que muestra referentes pasa por acá (ver useReferentes). */
export function referentesParaPerfil<T extends Pick<Referente, 'gender'>>(referentes: readonly T[], sex: Sex | null): T[] {
  return referentes.filter((referente) => seMuestraAlPerfil(referente, sex));
}
