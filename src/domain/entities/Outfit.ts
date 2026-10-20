import type { Garment } from './Garment';

export interface Outfit {
  id: string;
  garments: Garment[];
  matchPercent: number; // 0 a 100
  title: string;
  summary: string;
}