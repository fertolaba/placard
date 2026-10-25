import type { OutfitExplanation } from '../services/outfitExplanation';
import type { Garment } from './Garment';

export interface Outfit {
  id: string;
  garments: Garment[];
  matchPercent: number; // 0 a 100
  title: string;
  summary: string; // los colores dominantes: "Negro + Beige + Blanco"
  description: string; // una línea corta con la idea del look ("Opuestos que se realzan")
  explanation: OutfitExplanation; // por qué combinan (lo que muestra "Ver por qué")
}
