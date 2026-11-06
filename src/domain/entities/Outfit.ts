import type { OutfitExplanation } from '../services/outfitExplanation';
import type { Garment } from './Garment';

export interface Outfit {
  id: string;
  garments: Garment[];
  matchPercent: number; // 0 a 100
  sharedStyle?: string; // el estilo en común de las prendas ("Streetwear"), si lo hay
  lookFormality?: string; // "Look casual", "Look clásico con toques casuales"; sin valor si no se sabe
  conflict?: string; // solo en Guardados: por qué un look guardado ya no combina con las reglas actuales
  title: string;
  summary: string; // los colores dominantes: "Negro + Beige + Blanco"
  description: string; // una línea corta con la idea del look ("Opuestos que se realzan")
  explanation: OutfitExplanation; // por qué combinan (lo que muestra "Ver por qué")
}
