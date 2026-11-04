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
    preferredCuts: ['oversize', 'boxy', 'baggy', 'wide leg'],
    excludesClassic: true,
    slots: [
      { label: 'buzo, remera o top', categories: ['arriba', 'top'], tone: 'cualquiera' },
      { label: 'pantalón o pollera', categories: ['abajo', 'pollera'], tone: 'cualquiera' },
      { label: 'zapatillas claras', categories: ['calzado'], tone: 'claro', calzadoTipos: ['baja', 'gruesa', 'alta'] },
    ],
  },
  {
    id: 'old-money',
    name: 'Old Money',
    description: 'Clásico y prolijo, en tonos claros y neutros',
    palette: ['#E9E1D0', '#B08D63', '#23324A'],
    preferredCuts: ['regular', 'straight', 'slim'],
    slots: [
      { label: 'camisa o sweater claro', categories: ['arriba'], tone: 'claro', requiresClassic: true },
      { label: 'pantalón o pollera neutra', categories: ['abajo', 'pollera'], tone: 'neutro', requiresClassic: true },
      { label: 'mocasines oscuros', categories: ['calzado'], tone: 'oscuro', requiresClassic: true },
    ],
  },
  {
    id: 'y2k',
    name: 'Y2K',
    description: 'Baggy, remeras oversize y colores vivos con aire retro de los 2000',
    palette: ['#E59BC4', '#9CC6E8', '#C9CCD1'],
    preferredCuts: ['baggy', 'oversize', 'flared', 'cropped'],
    excludesClassic: true,
    slots: [
      { label: 'top de color', categories: ['top', 'arriba'], tone: 'color' },
      { label: 'jean, pantalón baggy o pollera', categories: ['pollera', 'abajo'], tone: 'cualquiera' },
      { label: 'zapatillas claras', categories: ['calzado'], tone: 'claro', calzadoTipos: ['baja', 'gruesa', 'botita'] },
    ],
  },
  {
    id: 'techwear',
    name: 'Techwear',
    description: 'Táctico y minimalista: prendas ajustadas, sin estampas llamativas',
    palette: ['#1A1A1D', '#8E8E93', '#7B5B3F'],
    preferredCuts: ['ajustado', 'slim', 'skinny', 'straight', 'regular'],
    excludesClassic: true,
    maxSecondaryColors: 1,
    slots: [
      { label: 'prenda base ajustada', categories: ['arriba', 'top'], tone: 'cualquiera', cuts: ['ajustado', 'regular'] },
      { label: 'buzo o campera ajustada', categories: ['arriba'], tone: 'cualquiera', cuts: ['ajustado', 'regular'] },
      { label: 'pantalón o jogger ajustado', categories: ['abajo'], tone: 'cualquiera', cuts: ['slim', 'skinny', 'straight'] },
      { label: 'botitas o zapatillas de suela gruesa', categories: ['calzado'], tone: 'cualquiera', calzadoTipos: ['botita', 'gruesa'] },
    ],
  },
  {
    id: 'blokecore',
    name: 'Blokecore',
    description: 'Camiseta de fútbol con jean o pollera y zapatillas clásicas',
    palette: ['#C8102E', '#1F3A93', '#F2F2F2'],
    preferredCuts: ['oversize', 'regular', 'baggy', 'straight'],
    allowsSporty: true, // el único estilo que usa ropa deportiva
    slots: [
      { label: 'camiseta de fútbol', categories: ['arriba'], tone: 'cualquiera', requiresSporty: true },
      { label: 'jean o pollera', categories: ['abajo', 'pollera'], tone: 'cualquiera' },
      { label: 'zapatillas', categories: ['calzado'], tone: 'cualquiera', calzadoTipos: ['baja'] },
    ],
  },
];
