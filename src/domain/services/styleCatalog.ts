import type { StyleReference } from '../entities/StyleReference';

/** Catálogo de referencias. Agregar un estilo nuevo es agregar un objeto a esta lista. */
export const STYLE_REFERENCES: StyleReference[] = [
  {
    id: 'asap-rocky',
    name: 'A$AP Rocky',
    description: 'Capas oscuras con un color de contraste',
    note: 'Interpretación libre del estilo, no es un look real.',
    palette: ['#26262B', '#7A2E3A', '#6B705C'],
    slots: [
      { label: 'prenda base oscura', category: 'arriba', tone: 'oscuro' },
      { label: 'capa de color de contraste', category: 'arriba', tone: 'color' },
      { label: 'pantalón', category: 'abajo', tone: 'cualquiera' },
      { label: 'zapatillas', category: 'calzado', tone: 'cualquiera' },
      { label: 'campera oscura', category: 'arriba', tone: 'oscuro' },
    ],
  },
  {
    id: 'streetwear',
    name: 'Streetwear urbano',
    description: 'Prendas cómodas y zapatillas claras',
    palette: ['#26262B', '#E4DED2'],
    slots: [
      { label: 'remera o buzo', category: 'arriba', tone: 'cualquiera' },
      { label: 'pantalón', category: 'abajo', tone: 'cualquiera' },
      { label: 'zapatillas claras', category: 'calzado', tone: 'claro' },
    ],
  },
  {
    id: 'minimal',
    name: 'Minimal neutro',
    description: 'Todo en tonos neutros',
    palette: ['#CDB99A', '#E4DED2', '#26262B'],
    slots: [
      { label: 'prenda de arriba neutra', category: 'arriba', tone: 'neutro' },
      { label: 'pantalón neutro', category: 'abajo', tone: 'neutro' },
      { label: 'calzado neutro', category: 'calzado', tone: 'neutro' },
    ],
  },
  {
    id: 'smart-casual',
    name: 'Smart casual',
    description: 'Arriba claro y abajo oscuro',
    palette: ['#5B7AA0', '#CDB99A'],
    slots: [
      { label: 'camisa o remera clara', category: 'arriba', tone: 'claro' },
      { label: 'pantalón oscuro', category: 'abajo', tone: 'oscuro' },
      { label: 'calzado oscuro', category: 'calzado', tone: 'oscuro' },
    ],
  },
];