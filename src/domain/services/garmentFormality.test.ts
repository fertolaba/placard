import type { Garment, GarmentCategory } from '../entities/Garment';
import { rateOutfit } from '../usecases/SuggestOutfits';
import { parseGarmentAnalysis } from './garmentAnalysis';
import { evaluateOutfitCoherence, garmentFormality, lookFormalityLabel } from './outfitCoherence';

function garment(id: string, name: string, category: GarmentCategory, extra: Partial<Garment> = {}): Garment {
  return {
    id,
    name,
    category,
    colorHex: '#26262B',
    colorName: 'Negro',
    secondaryColors: [],
    seasons: ['invierno'],
    sporty: false,
    classic: false,
    photoRef: null,
    imageUri: null,
    createdAt: new Date(0),
    ...extra,
  };
}

// Como la IA nombra las prendas antes de esta regla: "Campera" y "Pantalón", sin pistas en el nombre.
const camperaTech = garment('campera', 'Campera negra', 'arriba', { formalidad: 'deportivo' });
const sastrero = garment('sastrero', 'Pantalón negro', 'abajo', { formalidad: 'clasico', corte: 'straight' });

describe('garmentFormality', () => {
  it('usa la formalidad guardada antes que cualquier deducción', () => {
    expect(garmentFormality(camperaTech)).toBe(2);
    expect(garmentFormality(sastrero)).toBe(0);
    // Aunque el nombre diga "sastrero", si la persona la marcó casual, manda lo marcado.
    expect(garmentFormality(garment('x', 'Pantalón sastrero', 'abajo', { formalidad: 'casual' }))).toBe(1);
  });

  it('sin formalidad, deduce del nombre, del corte y de las marcas', () => {
    expect(garmentFormality(garment('a', 'Campera Nike Tech', 'arriba'))).toBe(2);
    expect(garmentFormality(garment('b', 'Pantalón negro', 'abajo', { corte: 'sastrero' }))).toBe(0);
    expect(garmentFormality(garment('c', 'Pantalón negro', 'abajo', { classic: true }))).toBe(0);
  });

  it('una prenda sin ningún dato es neutra', () => {
    expect(garmentFormality(garment('d', 'Pantalón', 'abajo'))).toBeNull();
  });
});

describe('formalidad en la coherencia', () => {
  it('campera tech (deportivo) + pantalón sastrero (clásico): conflicto duro con motivo', () => {
    const result = evaluateOutfitCoherence(camperaTech, sastrero);
    expect(result.hardConflict).toBe(true);
    expect(result.score).toBe(0);
    expect(result.conflictReason).toBe('Prenda deportiva (Campera negra) con prenda clásica (Pantalón negro)');
  });

  it('campera tech + pantalón sin formalidad pero con corte "sastrero": conflicto duro por deducción', () => {
    const pantalon = garment('p', 'Pantalón negro', 'abajo', { corte: 'sastrero' });
    expect(evaluateOutfitCoherence(camperaTech, pantalon).hardConflict).toBe(true);
  });

  it('prendas sin ningún dato: neutro', () => {
    const result = evaluateOutfitCoherence(garment('t', 'Campera', 'arriba'), garment('b', 'Pantalón', 'abajo'));
    expect(result.hardConflict).toBe(false);
    expect(result.conflictReason).toBeNull();
  });

  it('rateOutfit expone el conflicto y no llega a 100%', () => {
    const rating = rateOutfit(camperaTech, sastrero, null);
    expect(rating.conflict).toContain('Prenda deportiva');
    expect(rating.matchPercent).toBeLessThan(60);
  });
});

describe('lookFormalityLabel', () => {
  it('nombra la formalidad del look', () => {
    const remera = garment('r', 'Remera', 'arriba', { formalidad: 'casual' });
    const jean = garment('j', 'Jean', 'abajo', { formalidad: 'casual' });
    const camisa = garment('c', 'Camisa', 'arriba', { formalidad: 'clasico' });
    expect(lookFormalityLabel([remera, jean])).toBe('Look casual');
    expect(lookFormalityLabel([camisa, sastrero])).toBe('Look clásico');
    expect(lookFormalityLabel([camisa, jean])).toBe('Look casual con toques clásicos');
    expect(lookFormalityLabel([camisa, sastrero, jean])).toBe('Look clásico con toques casuales');
    expect(lookFormalityLabel([garment('x', 'Prenda', 'arriba')])).toBeNull();
    expect(lookFormalityLabel([camperaTech, sastrero])).toBeNull(); // eso es un conflicto, no un estilo
  });
});

describe('parseGarmentAnalysis: formalidad', () => {
  const analysis = (formalidad: unknown) => ({
    esPrenda: true,
    tipo: 'Campera',
    categoria: 'arriba',
    manga: 'larga',
    temporadas: ['invierno'],
    corte: 'regular',
    es_deportiva: false,
    color_dominante: '',
    colores_secundarios: [],
    formalidad,
  });

  it('acepta clasico, casual y deportivo; fuera de la lista queda en null', () => {
    for (const value of ['clasico', 'casual', 'deportivo']) expect(parseGarmentAnalysis(analysis(value))?.formalidad).toBe(value);
    expect(parseGarmentAnalysis(analysis('formal'))?.formalidad).toBeNull();
    expect(parseGarmentAnalysis(analysis(undefined))?.formalidad).toBeNull();
  });
});
