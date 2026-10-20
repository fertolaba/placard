/**
 * Dónde viven las fotos de las prendas.
 * "ref" es la referencia que se guarda en la base (no una ruta absoluta, porque en iPhone
 * la carpeta de la app puede cambiar de ruta cuando se actualiza).
 */
export interface PhotoStorage {
  /** Copia la foto a un lugar permanente y devuelve su referencia. */
  save(sourceUri: string): Promise<string>;
  /** Convierte una referencia en una dirección que la pantalla pueda mostrar. */
  resolve(ref: string): string;
  /** Borra la foto (no falla si ya no existe). */
  remove(ref: string): Promise<void>;
}