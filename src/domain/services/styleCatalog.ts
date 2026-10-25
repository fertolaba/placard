import type { StyleReference } from '../entities/StyleReference';

/**
 * Catálogo de referencias. Agregar un estilo nuevo es sumar su id a STYLE_IDS y un objeto a esta lista.
 * "top" y "pollera" entran en las piezas donde quedan bien; en Y2K son las preferidas.
 */
export const STYLE_REFERENCES: StyleReference[] = [
  {
    id: 'streetwear',
    name: 'Streetwear',
    description: 'Prendas holgadas y cómodas, con zapatillas claras',
    palette: ['#26262B', '#8A8D91', '#E4DED2'],
    slots: [
      { label: 'buzo, remera o top', categories: ['arriba', 'top'], tone: 'cualquiera' },
      { label: 'pantalón o pollera', categories: ['abajo', 'pollera'], tone: 'cualquiera' },
      { label: 'zapatillas claras', categories: ['calzado'], tone: 'claro' },
    ],
  },
  {
    id: 'old-money',
    name: 'Old Money',
    description: 'Clásico y prolijo, en tonos claros y neutros',
    palette: ['#E9E1D0', '#B08D63', '#23324A'],
    slots: [
      { label: 'camisa o sweater claro', categories: ['arriba'], tone: 'claro' },
      { label: 'pantalón o pollera neutra', categories: ['abajo', 'pollera'], tone: 'neutro' },
      { label: 'mocasines oscuros', categories: ['calzado'], tone: 'oscuro' },
    ],
  },
  {
    id: 'y2k',
    name: 'Y2K',
    description: 'Colores vivos y aire de los 2000',
    palette: ['#E59BC4', '#9CC6E8', '#C9CCD1'],
    slots: [
      { label: 'top de color', categories: ['top', 'arriba'], tone: 'color' },
      { label: 'pollera o jean', categories: ['pollera', 'abajo'], tone: 'cualquiera' },
      { label: 'zapatillas claras', categories: ['calzado'], tone: 'claro' },
    ],
  },
  {
    id: 'techwear',
    name: 'Techwear',
    description: 'Capas funcionales, todo en oscuro',
    palette: ['#1A1A1D', '#3B3F45', '#5A6150'],
    slots: [
      { label: 'prenda base oscura', categories: ['arriba', 'top'], tone: 'oscuro' },
      { label: 'campera oscura', categories: ['arriba'], tone: 'oscuro' },
      { label: 'pantalón oscuro', categories: ['abajo'], tone: 'oscuro' },
      { label: 'zapatillas oscuras', categories: ['calzado'], tone: 'oscuro' },
    ],
  },
  {
    id: 'blokecore',
    name: 'Blokecore',
    description: 'Camiseta de fútbol con jean o pollera y zapatillas clásicas',
    palette: ['#C8102E', '#1F3A93', '#F2F2F2'],
    allowsSporty: true, // el único estilo que usa ropa deportiva
    slots: [
      { label: 'camiseta de fútbol', categories: ['arriba'], tone: 'cualquiera', requiresSporty: true },
      { label: 'jean o pollera', categories: ['abajo', 'pollera'], tone: 'cualquiera' },
      { label: 'zapatillas', categories: ['calzado'], tone: 'cualquiera' },
    ],
  },
];
