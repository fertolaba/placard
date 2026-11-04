import type { Garment, GarmentCategory } from '../entities/Garment';
import type { StyleId } from '../entities/StyleReference';
import { garmentFitsSlot } from './garmentFitsSlot';
import { STYLE_REFERENCES } from './styleCatalog';

// Los colores cumplen el tono de las piezas de los dos estilos: lo único que decide cada caso es la marca.
const CLARO_NEUTRO = '#EDEAE4';
const OSCURO_NEUTRO = '#26262B';
const COLOR_VIVO = '#C8102E';

function garment(category: GarmentCategory, colorHex: string, flags: Partial<Pick<Garment, 'classic' | 'sporty' | 'corte' | 'secondaryColors'>> = {}): Garment {
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

  it('un pantalón clásico no entra en Y2K', () => {
    expect(entersStyle('y2k', garment('abajo', OSCURO_NEUTRO, { classic: true }))).toBe(false);
  });

  it('una chomba clásica no entra en Y2K, aunque sea de color', () => {
    expect(entersStyle('y2k', garment('arriba', COLOR_VIVO, { classic: true }))).toBe(false);
  });

  it('una remera oversize de color y un jean baggy entran en Y2K', () => {
    expect(entersStyle('y2k', garment('arriba', COLOR_VIVO))).toBe(true);
    expect(entersStyle('y2k', garment('abajo', OSCURO_NEUTRO))).toBe(true);
  });

  it('una prenda clásica sigue entrando en los otros estilos', () => {
    expect(entersStyle('blokecore', garment('abajo', OSCURO_NEUTRO, { classic: true }))).toBe(true);
  });

  describe('Techwear', () => {
    const BLANCO = { name: 'Blanco', hex: '#EDEAE4' };
    const NEGRO = { name: 'Negro', hex: '#26262B' };

    it('el color es libre', () => {
      expect(entersStyle('techwear', garment('arriba', '#C7C7CC', { corte: 'regular' }))).toBe(true); // buzo gris claro
      expect(entersStyle('techwear', garment('arriba', COLOR_VIVO, { corte: 'ajustado' }))).toBe(true); // buzo rojo
      expect(entersStyle('techwear', garment('abajo', OSCURO_NEUTRO, { corte: 'slim' }))).toBe(true); // jogger negro
    });

    it('acepta zapatillas de cualquier color', () => {
      expect(entersStyle('techwear', garment('calzado', '#F2F2F2'))).toBe(true);
      expect(entersStyle('techwear', garment('calzado', COLOR_VIVO))).toBe(true);
    });

    it('rechaza los cortes holgados', () => {
      expect(entersStyle('techwear', garment('abajo', OSCURO_NEUTRO, { corte: 'baggy' }))).toBe(false); // jean baggy
      expect(entersStyle('techwear', garment('arriba', OSCURO_NEUTRO, { corte: 'oversize' }))).toBe(false); // remera oversize
      for (const corte of ['boxy']) expect(entersStyle('techwear', garment('arriba', OSCURO_NEUTRO, { corte }))).toBe(false);
      for (const corte of ['wide leg', 'flared']) expect(entersStyle('techwear', garment('abajo', OSCURO_NEUTRO, { corte }))).toBe(false);
    });

    it('deja pasar una prenda sin corte guardado', () => {
      expect(entersStyle('techwear', garment('abajo', OSCURO_NEUTRO))).toBe(true);
    });

    it('rechaza un pantalón sastrero clásico, aunque el corte sirva', () => {
      expect(entersStyle('techwear', garment('abajo', OSCURO_NEUTRO, { classic: true, corte: 'slim' }))).toBe(false);
    });

    it('acepta hasta un color de detalle', () => {
      expect(entersStyle('techwear', garment('arriba', COLOR_VIVO, { corte: 'regular', secondaryColors: [BLANCO] }))).toBe(true);
      expect(entersStyle('techwear', garment('arriba', COLOR_VIVO, { corte: 'regular', secondaryColors: [BLANCO, NEGRO] }))).toBe(false);
    });
  });

  it('los cortes y los colores de detalle de Techwear no afectan a los demás estilos', () => {
    const colores = [
      { name: 'Blanco', hex: '#EDEAE4' },
      { name: 'Negro', hex: '#26262B' },
    ];
    expect(entersStyle('streetwear', garment('abajo', OSCURO_NEUTRO, { corte: 'baggy', secondaryColors: colores }))).toBe(true);
  });

  it('mantiene la regla de la camiseta de fútbol', () => {
    const camiseta = garment('arriba', CLARO_NEUTRO, { sporty: true });
    expect(entersStyle('blokecore', camiseta)).toBe(true);
    expect(entersStyle('streetwear', camiseta)).toBe(false);
    expect(entersStyle('blokecore', garment('arriba', CLARO_NEUTRO))).toBe(false);
  });
});
