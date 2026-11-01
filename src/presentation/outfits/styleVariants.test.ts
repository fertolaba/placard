import type { Garment, GarmentCategory } from '../../domain/entities/Garment';
import { STYLE_REFERENCES } from '../../domain/services/styleCatalog';
import { GetStyleMatches } from '../../domain/usecases/GetStyleMatches';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import { buildStyleVariants, styleCoverage } from './styleVariants';

function garment(id: string, category: GarmentCategory, colorHex: string, sporty = false): Garment {
  return {
    id,
    name: id,
    category,
    colorHex,
    colorName: id,
    secondaryColors: [],
    seasons: ['verano'],
    sporty,
    photoRef: null,
    imageUri: null,
    createdAt: new Date(0),
  };
}

const streetwear = STYLE_REFERENCES.find((reference) => reference.id === 'streetwear')!;

const WARDROBE = [
  garment('remera-negra', 'arriba', '#26262B'),
  garment('remera-roja', 'arriba', '#C8102E'),
  garment('top-rosa', 'top', '#E59BC4'),
  garment('camiseta', 'arriba', '#1F3A93', true),
  garment('jean', 'abajo', '#5B7AA0'),
  garment('jogger', 'abajo', '#1A1A1D'),
  garment('pollera', 'pollera', '#E9E1D0'),
  garment('zapas-claras', 'calzado', '#F2F2F2'),
  garment('mocasines', 'calzado', '#2A1D18'),
];

describe('styleCoverage', () => {
  it('cuenta las prendas por tipo y deja afuera las que el estilo no acepta', () => {
    const coverage = styleCoverage(streetwear, WARDROBE);
    expect(coverage.byZone.torso.map((item) => item.id)).toEqual(['remera-negra', 'remera-roja', 'top-rosa']);
    expect(coverage.byZone.pies.map((item) => item.id)).toEqual(['zapas-claras']); // pide zapatillas claras
    expect(coverage.combinations).toBe(9);
    expect(coverage.complete).toBe(true);
  });

  it('cuenta un hueco cuando falta un tipo', () => {
    const coverage = styleCoverage(streetwear, [WARDROBE[0], WARDROBE[1], WARDROBE[4]]);
    expect(coverage.missingZones).toEqual(['pies']);
    expect(coverage.coveredCount).toBe(2);
    expect(coverage.combinations).toBe(2);
    expect(coverage.complete).toBe(false);
  });

  it('coincide con la regla del dominio: lo que GetStyleMatches asigna está en la cobertura', async () => {
    const repository = { getAll: async () => WARDROBE } as unknown as GarmentRepository;
    const matches = await new GetStyleMatches(repository).execute();
    for (const match of matches) {
      const ids = styleCoverage(match.reference, WARDROBE).garments.map((item) => item.id);
      for (const { garment: assigned } of match.matched) expect(ids).toContain(assigned.id);
    }
  });
});

describe('buildStyleVariants', () => {
  it('ordena por match y deja las incompletas al final', () => {
    const variants = buildStyleVariants(styleCoverage(streetwear, WARDROBE));
    expect(variants).toHaveLength(9);
    const scores = variants.map((variant) => variant.matchPercent);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('usa huecos cuando falta un tipo y no arma nada sin prendas', () => {
    const [variant] = buildStyleVariants(styleCoverage(streetwear, [WARDROBE[0], WARDROBE[4]]));
    expect(variant).toMatchObject({ shoe: null, complete: false, id: 'remera-negra-jean' });
    expect(buildStyleVariants(styleCoverage(streetwear, []))).toEqual([]);
  });

  it('respeta los topes con un placard enorme', () => {
    const many = Array.from({ length: 40 }, (_, index) => [
      garment(`t${index}`, 'arriba', '#26262B'),
      garment(`b${index}`, 'abajo', '#5B7AA0'),
      garment(`s${index}`, 'calzado', '#F2F2F2'),
    ]).flat();
    const coverage = styleCoverage(streetwear, many);
    expect(coverage.combinations).toBe(64000);
    expect(buildStyleVariants(coverage)).toHaveLength(60);
  });
});
