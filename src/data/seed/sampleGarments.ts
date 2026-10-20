import type { GarmentCategory } from '../../domain/entities/Garment';

export interface SampleGarment {
  id: string;
  name: string;
  category: GarmentCategory;
  colorHex: string;
  colorName: string;
}

/** Prendas de prueba para desarrollar. Se sacan cuando la cámara ya cargue prendas reales. */
export const SAMPLE_GARMENTS: SampleGarment[] = [
  { id: '1', name: 'Remera negra', category: 'arriba', colorHex: '#26262B', colorName: 'Negro' },
  { id: '2', name: 'Chino beige', category: 'abajo', colorHex: '#CDB99A', colorName: 'Beige' },
  { id: '3', name: 'Campera oliva', category: 'arriba', colorHex: '#6B705C', colorName: 'Verde oliva' },
  { id: '4', name: 'Zapatillas', category: 'calzado', colorHex: '#E4DED2', colorName: 'Blanco' },
  { id: '5', name: 'Jean azul', category: 'abajo', colorHex: '#5B7AA0', colorName: 'Azul denim' },
  { id: '6', name: 'Buzo bordó', category: 'arriba', colorHex: '#7A2E3A', colorName: 'Bordó' },
];