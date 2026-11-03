import { parseGarmentAnalysis } from './garmentAnalysis';

function analysis(tipo: string, es_deportiva: boolean, extra: Record<string, unknown> = {}) {
  return {
    esPrenda: true,
    tipo,
    categoria: 'arriba',
    manga: 'corta',
    temporadas: ['verano'],
    corte: 'regular',
    es_deportiva,
    color_dominante: '',
    colores_secundarios: [],
    ...extra,
  };
}

describe('parseGarmentAnalysis: prenda clásica', () => {
  it('respeta al modelo en una prenda claramente clásica', () => {
    expect(parseGarmentAnalysis(analysis('Chomba', false, { es_clasica: true }))?.classic).toBe(true);
  });

  it('asume que no es clásica si el modelo no lo dice', () => {
    expect(parseGarmentAnalysis(analysis('Chomba', false))?.classic).toBe(false);
  });

  it('nunca es clásica con corte oversize o baggy, aunque el corte no corresponda a la categoría', () => {
    expect(parseGarmentAnalysis(analysis('Camisa', false, { es_clasica: true, corte: 'oversize' }))?.classic).toBe(false);
    expect(parseGarmentAnalysis(analysis('Camisa', false, { es_clasica: true, corte: 'baggy' }))?.classic).toBe(false);
  });

  it('nunca es clásica si el tipo la delata, sin distinguir mayúsculas', () => {
    for (const tipo of ['Buzo', 'HOODIE', 'Jogger', 'Zapatillas', 'Camiseta de fútbol', 'Musculosa']) {
      expect(parseGarmentAnalysis(analysis(tipo, false, { es_clasica: true }))?.classic).toBe(false);
    }
  });
});

describe('parseGarmentAnalysis: camiseta de fútbol', () => {
  it('una musculosa no es deportiva aunque el modelo diga que sí', () => {
    expect(parseGarmentAnalysis(analysis('Musculosa', true))?.sporty).toBe(false);
  });

  it('una camiseta de fútbol con mangas sigue siendo deportiva', () => {
    expect(parseGarmentAnalysis(analysis('Camiseta de fútbol', true))?.sporty).toBe(true);
  });

  it('una "Musculosa NBA" no es deportiva', () => {
    expect(parseGarmentAnalysis(analysis('Musculosa NBA', true))?.sporty).toBe(false);
  });

  it('compara sin distinguir mayúsculas ni tildes', () => {
    expect(parseGarmentAnalysis(analysis('CAMISETA DE BÁSQUET', true))?.sporty).toBe(false);
    expect(parseGarmentAnalysis(analysis('Camiseta de basquet', true))?.sporty).toBe(false);
  });

  it('no marca como deportiva lo que el modelo no marcó', () => {
    expect(parseGarmentAnalysis(analysis('Camiseta de fútbol', false))?.sporty).toBe(false);
  });
});
