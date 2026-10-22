import type { GarmentCategory } from '../../domain/entities/Garment';
import type { Season } from '../../domain/entities/Season';

export interface SampleGarment {
  id: string;
  name: string;
  category: GarmentCategory;
  colorHex: string;
  colorName: string;
  seasons: Season[];
}

/** Prendas de prueba que usa la versión web (en el celular ya no se cargan). */
export const SAMPLE_GARMENTS: SampleGarment[] = [
  { id: '1', name: 'Remera negra', category: 'arriba', colorHex: '#26262B', colorName: 'Negro', seasons: ['verano', 'entretiempo'] },
  { id: '2', name: 'Chino beige', category: 'abajo', colorHex: '#CDB99A', colorName: 'Beige', seasons: ['verano', 'entretiempo'] },
  { id: '3', name: 'Campera oliva', category: 'arriba', colorHex: '#6B705C', colorName: 'Verde oliva', seasons: ['entretiempo', 'invierno'] },
  { id: '4', name: 'Zapatillas', category: 'calzado', colorHex: '#E4DED2', colorName: 'Blanco', seasons: ['verano', 'entretiempo', 'invierno'] },
  { id: '5', name: 'Jean azul', category: 'abajo', colorHex: '#5B7AA0', colorName: 'Azul denim', seasons: ['verano', 'entretiempo', 'invierno'] },
  { id: '6', name: 'Buzo bordó', category: 'arriba', colorHex: '#7A2E3A', colorName: 'Bordó', seasons: ['entretiempo', 'invierno'] },
];