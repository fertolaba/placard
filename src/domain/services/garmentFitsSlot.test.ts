import type { Garment, GarmentCategory } from '../entities/Garment';
import type { StyleId } from '../entities/StyleReference';
import { garmentFitsSlot } from './garmentFitsSlot';
import { STYLE_REFERENCES } from './styleCatalog';

// Los colores cumplen el tono de las piezas de los dos estilos: lo único que decide cada caso es la marca.
const CLARO_NEUTRO = '#EDEAE4';
const OSCURO_NEUTRO = '#26262B';

function garment(category: GarmentCategory, colorHex: string, flags: Partial<Pick<Garment, 'classic' | 'sporty'>> = {}): Garment {
  return {
    id: 'g',
    name: 'g',
    category,
    colorHex,
    colorName: 'g',
    secondaryColors: [],
    seasons: ['verano'],
    sporty: false,
    classic: false,
    photoRef: null,
    imageUri: null,
    createdAt: new Date(0),
    ...flags,
  };
}

/** Si la prenda cubre alguna pieza del estilo. */
function entersStyle(id: StyleId, item: Garment): boolean {
  const reference = STYLE_REFERENCES.find((style) => style.id === id)!;
  return reference.slots.some((slot) => garmentFitsSlot(reference, slot, item));
}

describe('garmentFitsSlot', () => {
  it('una chomba clásica no entra en Streetwear y sí en Old Money', () => {
    const chomba = garment('arriba', CLARO_NEUTRO, { classic: true });
    expect(entersStyle('streetwear', chomba)).toBe(false);
    expect(entersStyle('old-money', chomba)).toBe(true);
  });

  it('un jean baggy no entra en Old Money y sí en Streetwear', () => {
    const jean = garment('abajo', OSCURO_NEUTRO);
    expect(entersStyle('old-money', jean)).toBe(false);
    expect(entersStyle('streetwear', jean)).toBe(true);
  });

  it('un pantalón sastrero no entra en Streetwear', () => {
    const sastrero = garment('abajo', OSCURO_NEUTRO, { classic: true });
    expect(entersStyle('streetwear', sastrero)).toBe(false);
    expect(entersStyle('old-money', sastrero)).toBe(true);
  });

  it('los mocasines clásicos no entran en Streetwear, aunque sean claros', () => {
    const mocasines = garment('calzado', CLARO_NEUTRO, { classic: true });
    expect(entersStyle('streetwear', mocasines)).toBe(false);
  });

  it('unas zapatillas no entran en Old Money, aunque sean oscuras', () => {
    const zapatillas = garment('calzado', OSCURO_NEUTRO);
    expect(entersStyle('old-money', zapatillas)).toBe(false);
  });

  it('una prenda clásica sigue entrando en los otros estilos', () => {
    expect(entersStyle('techwear', garment('abajo', OSCURO_NEUTRO, { classic: true }))).toBe(true);
  });

  it('mantiene la regla de la camiseta de fútbol', () => {
    const camiseta = garment('arriba', CLARO_NEUTRO, { sporty: true });
    expect(entersStyle('blokecore', camiseta)).toBe(true);
    expect(entersStyle('streetwear', camiseta)).toBe(false);
    expect(entersStyle('blokecore', garment('arriba', CLARO_NEUTRO))).toBe(false);
  });
});
