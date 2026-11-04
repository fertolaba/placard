import type { NewGarment } from '../entities/Garment';
import { normalizeGarmentData } from './garmentRules';

const base: NewGarment = {
  name: 'Zapatillas',
  category: 'calzado',
  colorHex: '#EDEAE4',
  colorName: 'Blanco',
  secondaryColors: [],
  seasons: ['verano'],
  sporty: false,
  classic: false,
  photoRef: null,
};

describe('normalizeGarmentData: tipo de calzado', () => {
  it('se guarda en calzado', () => {
    expect(normalizeGarmentData({ ...base, calzadoTipo: 'botita' }).calzadoTipo).toBe('botita');
  });

  it('se descarta si la prenda no es calzado', () => {
    expect(normalizeGarmentData({ ...base, category: 'arriba', calzadoTipo: 'baja' }).calzadoTipo).toBeUndefined();
  });
});
