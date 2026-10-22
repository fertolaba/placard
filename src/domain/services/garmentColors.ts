export interface GarmentColor {
  name: string;
  hex: string; // formato #RRGGBB
}

/**
 * Colores para elegir a mano y también los "nombres" con los que se describe un color detectado.
 * Los primeros 14 son los de siempre (no se cambiaron, para no alterar prendas ya guardadas).
 */
export const GARMENT_COLORS: readonly GarmentColor[] = [
  { name: 'Negro', hex: '#26262B' },
  { name: 'Gris oscuro', hex: '#55555B' },
  { name: 'Gris', hex: '#8E8E93' },
  { name: 'Gris claro', hex: '#C7C7CC' },
  { name: 'Blanco', hex: '#EDEAE4' },
  { name: 'Crudo', hex: '#E8DFCB' },
  { name: 'Beige', hex: '#CDB99A' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Marrón', hex: '#7B5B3F' },
  { name: 'Celeste', hex: '#9CC3E6' },
  { name: 'Azul denim', hex: '#5B7AA0' },
  { name: 'Azul', hex: '#2F5FA8' },
  { name: 'Azul marino', hex: '#1F2F4F' },
  { name: 'Turquesa', hex: '#2BA6A4' },
  { name: 'Menta', hex: '#A8D8C0' },
  { name: 'Verde oliva', hex: '#6B705C' },
  { name: 'Verde', hex: '#3E7B4F' },
  { name: 'Verde botella', hex: '#1F4D3A' },
  { name: 'Rosa pastel', hex: '#F2C6D0' },
  { name: 'Rosa', hex: '#E3A1B5' },
  { name: 'Fucsia', hex: '#C2307A' },
  { name: 'Coral', hex: '#E8685D' },
  { name: 'Rojo', hex: '#C0392B' },
  { name: 'Bordó', hex: '#7A2E3A' },
  { name: 'Terracota', hex: '#B5573A' },
  { name: 'Mostaza', hex: '#C99A2E' },
  { name: 'Amarillo', hex: '#E5C24A' },
  { name: 'Naranja', hex: '#D9783A' },
  { name: 'Lila', hex: '#B9A6D8' },
  { name: 'Violeta', hex: '#7A5BA8' },
];