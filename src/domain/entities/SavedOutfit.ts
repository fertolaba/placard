import type { StyleId } from './StyleReference';

/** Un look guardado con el corazón. Guarda las prendas y no una copia: el match se recalcula al mostrarlo. */
export interface SavedOutfit {
  id: string;
  garmentIds: string[];
  styleId: StyleId | null; // null = viene del mazo por color; con estilo = viene de sus variantes
}
