import type { Garment, GarmentCategory } from '../../domain/entities/Garment';
import { STYLE_REFERENCES } from '../../domain/services/styleCatalog';
import { GetStyleMatches } from '../../domain/usecases/GetStyleMatches';
import type { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import { homeStyle } from '../../domain/services/styleAffinity';
import { buildStyleVariants, styleCoverage, zoneGarments } from './styleVariants';

function garment(id: string, category: GarmentCategory, colorHex: string, sporty = false, extra: Partial<Garment> = {}): Garment {
  return {
    id,
    name: id,
    category,
    colorHex,
    colorName: id,
    secondaryColors: [],
    seasons: ['verano'],
    sporty,
    classic: false,
    photoRef: null,
    imageUri: null,
    createdAt: new Date(0),
    ...extra,
  };
}

const streetwear = STYLE_REFERENCES.find((reference) => reference.id === 'streetwear')!;
const y2k = STYLE_REFERENCES.find((reference) => reference.id === 'y2k')!;
const techwear = STYLE_REFERENCES.find((reference) => reference.id === 'techwear')!;

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

describe('prenda principal', () => {
  const VERDE = '#1E7A46';
  const detalles = [
    { name: 'Blanco', hex: '#EDEAE4' },
    { name: 'Dorado', hex: '#D4AF37' },
  ];
  // Con dos colores de detalle, como una musculosa de los Celtics: por eso no entra en Techwear.
  const musculosa = garment('musculosa', 'arriba', VERDE, false, { corte: 'regular', secondaryColors: detalles });
  const remera = garment('remera', 'arriba', '#26262B', false, { corte: 'oversize' });
  const baggy = garment('baggy', 'abajo', '#5B7AA0', false, { corte: 'baggy' });
  const slim = garment('slim', 'abajo', '#26262B', false, { corte: 'slim' });

  it('la musculosa entra en Streetwear y en Y2K, y su estilo de casa es Y2K', () => {
    expect(styleCoverage(streetwear, [musculosa]).garments).toEqual([musculosa]);
    expect(styleCoverage(y2k, [musculosa]).garments).toEqual([musculosa]);
    expect(homeStyle(musculosa, STYLE_REFERENCES)?.id).toBe('y2k');
  });

  it('una musculosa regular sin detalles tiene a Techwear como estilo de casa', () => {
    expect(homeStyle(garment('lisa', 'arriba', VERDE, false, { corte: 'regular' }), STYLE_REFERENCES)?.id).toBe('techwear');
  });

  it('con una remera oversize, la principal de Streetwear es la remera y la de Y2K es la musculosa', () => {
    expect(zoneGarments(styleCoverage(streetwear, [musculosa, remera])).torso?.id).toBe('remera');
    expect(zoneGarments(styleCoverage(y2k, [musculosa, remera])).torso?.id).toBe('musculosa');
  });

  it('como única prenda de arriba, la musculosa es la principal en los dos estilos', () => {
    expect(zoneGarments(styleCoverage(streetwear, [musculosa])).torso?.id).toBe('musculosa');
    expect(zoneGarments(styleCoverage(y2k, [musculosa])).torso?.id).toBe('musculosa');
  });

  it('el pantalón baggy es el principal en Streetwear y el slim en Techwear', () => {
    expect(zoneGarments(styleCoverage(streetwear, [slim, baggy])).piernas?.id).toBe('baggy');
    expect(zoneGarments(styleCoverage(techwear, [baggy, slim])).piernas?.id).toBe('slim');
  });

  it('no saca prendas del estilo: la menos protagonista sigue en la lista', () => {
    expect(styleCoverage(streetwear, [musculosa, remera]).byZone.torso.map((item) => item.id)).toEqual(['remera', 'musculosa']);
  });

  it('en un empate va primero la que tiene foto y después la más nueva', () => {
    const vieja = garment('vieja', 'arriba', '#26262B', false, { createdAt: new Date(1000) });
    const nueva = garment('nueva', 'arriba', '#26262B', false, { createdAt: new Date(2000) });
    const conFoto = garment('foto', 'arriba', '#26262B', false, { imageUri: 'file://foto.png', createdAt: new Date(0) });
    expect(styleCoverage(streetwear, [vieja, nueva, conFoto]).byZone.torso.map((item) => item.id)).toEqual(['foto', 'nueva', 'vieja']);
  });

  it('el orden es estable en un empate: la misma entrada da el mismo resultado, sin importar el orden', () => {
    const a = garment('a', 'arriba', '#26262B');
    const b = garment('b', 'arriba', '#26262B');
    const first = styleCoverage(streetwear, [a, b]).byZone.torso.map((item) => item.id);
    expect(styleCoverage(streetwear, [a, b]).byZone.torso.map((item) => item.id)).toEqual(first);
    expect(styleCoverage(streetwear, [b, a]).byZone.torso.map((item) => item.id)).toEqual(first);
  });

  it('GetStyleMatches asigna la misma prenda principal', async () => {
    const repository = { getAll: async () => [musculosa, remera] } as unknown as GarmentRepository;
    const matches = await new GetStyleMatches(repository).execute();
    const assigned = (id: string) => matches.find((match) => match.reference.id === id)?.matched[0]?.garment.id;
    expect(assigned('streetwear')).toBe('remera');
    expect(assigned('y2k')).toBe('musculosa');
  });
});

describe('buildStyleVariants', () => {
  it('pone primero las prendas más protagonistas del estilo y deja las incompletas al final', () => {
    const remera = garment('remera', 'arriba', '#26262B', false, { corte: 'oversize' });
    const top = garment('top', 'top', '#E59BC4');
    const jean = garment('jean', 'abajo', '#5B7AA0', false, { corte: 'baggy' });
    const zapas = garment('zapas', 'calzado', '#F2F2F2');
    const complete = buildStyleVariants(styleCoverage(streetwear, [top, remera, jean, zapas]));
    expect(complete.map((variant) => variant.id)).toEqual(['remera-jean-zapas', 'top-jean-zapas']);

    const withGap = buildStyleVariants(styleCoverage(streetwear, [remera, top, jean]));
    expect(withGap.every((variant) => !variant.complete)).toBe(true);
    expect(withGap[0].id).toBe('remera-jean');
  });

  it('a igual protagonismo, ordena por match', () => {
    const variants = buildStyleVariants(styleCoverage(streetwear, [WARDROBE[0], WARDROBE[4], WARDROBE[5], WARDROBE[7]]));
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
