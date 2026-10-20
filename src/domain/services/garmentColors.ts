export interface GarmentColor {
  name: string;
  hex: string; // formato #RRGGBB
}

/** Colores entre los que se elige al cargar una prenda (la detección automática llega más adelante). */
export const GARMENT_COLORS: readonly GarmentColor[] = [
  { name: 'Negro', hex: '#26262B' },
  { name: 'Gris', hex: '#8E8E93' },
  { name: 'Blanco', hex: '#EDEAE4' },
  { name: 'Beige', hex: '#CDB99A' },
  { name: 'Marrón', hex: '#7B5B3F' },
  { name: 'Azul denim', hex: '#5B7AA0' },
  { name: 'Azul marino', hex: '#1F2F4F' },
  { name: 'Verde oliva', hex: '#6B705C' },
  { name: 'Verde', hex: '#3E7B4F' },
  { name: 'Bordó', hex: '#7A2E3A' },
  { name: 'Rojo', hex: '#C0392B' },
  { name: 'Rosa', hex: '#E3A1B5' },
  { name: 'Amarillo', hex: '#E5C24A' },
  { name: 'Naranja', hex: '#D9783A' },
];