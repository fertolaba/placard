/**
 * Dónde viven las fotos de las prendas.
 * "ref" es la referencia que se guarda en la base (no una ruta absoluta, porque en iPhone
 * la carpeta de la app puede cambiar de ruta cuando se actualiza; en la nube, la ruta dentro del bucket).
 * Convertir una referencia en una dirección para mostrar lo resuelve cada repositorio.
 */
export interface PhotoStorage {
  /** Copia (o sube) la foto a un lugar permanente y devuelve su referencia. */
  save(sourceUri: string): Promise<string>;
  /** Borra la foto (no falla si ya no existe). */
  remove(ref: string): Promise<void>;
}
