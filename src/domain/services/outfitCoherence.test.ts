import type { Garment, GarmentCategory } from '../entities/Garment';
import type { GarmentRepository } from '../repositories/GarmentRepository';
import { finalMatch, MIN_COHERENCE, SuggestOutfits } from '../usecases/SuggestOutfits';
import { evaluateOutfitCoherence, garmentFormality, PENALTY_HEM_CHUNKY } from './outfitCoherence';

function garment(id: string, name: string, category: GarmentCategory, colorHex: string, extra: Partial<Garment> = {}): Garment {
  return {
    id,
    name,
    category,
    colorHex,
    colorName: id,
    secondaryColors: [],
    seasons: ['verano'],
    sporty: false,
    classic: false,
    photoRef: null,
    imageUri: null,
    createdAt: new Date(0),
    ...extra,
  };
}

const chomba = garment('chomba', 'Chomba blanca', 'arriba', '#F4F4F2', { classic: true, corte: 'regular' });
const joggerTech = garment('jogger', 'Jogger tech negro', 'abajo', '#1A1A1D', { corte: 'skinny' });
const zapatillas = garment('zapas', 'Zapatillas blancas', 'calzado', '#F2F2F2');
const sastrero = garment('sastrero', 'Pantalón sastrero', 'abajo', '#8E8A84', { classic: true, corte: 'straight' });
const mocasin = garment('mocasin', 'Mocasines', 'calzado', '#3B2A20', { classic: true, calzadoTipo: 'baja' });
const jeanRecto = garment('jean', 'Jean recto', 'abajo', '#4A6A90', { corte: 'straight' });
const zapatillaBaja = garment('baja', 'Zapatilla baja clásica', 'calzado', '#F0F0F0', { calzadoTipo: 'baja' });
const camperaTech = garment('campera', 'Campera tech negra', 'arriba', '#1A1A1D', { corte: 'ajustado' });
const zapatillaGruesa = garment('gruesa', 'Zapatilla gruesa', 'calzado', '#26262B', { calzadoTipo: 'gruesa' });
const camisetaFutbol = garment('camiseta', 'Camiseta de fútbol', 'arriba', '#C8102E', { sporty: true });
const remeraOversize = garment('remera', 'Remera oversize', 'arriba', '#26262B', { corte: 'oversize' });
const jeanBaggy = garment('baggy', 'Jean baggy', 'abajo', '#5B7AA0', { corte: 'baggy' });

describe('evaluateOutfitCoherence', () => {
  it('chomba blanca + jogger tech skinny + zapatillas: conflicto duro', () => {
    const result = evaluateOutfitCoherence(chomba, joggerTech, zapatillas);
    expect(result.hardConflict).toBe(true);
    expect(result.sharedStyles).toEqual([]);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('chomba + pantalón sastrero + mocasín: coherencia alta', () => {
    const result = evaluateOutfitCoherence(chomba, sastrero, mocasin);
    expect(result.hardConflict).toBe(false);
    expect(result.score).toBe(1);
    expect(result.sharedStyles[0]).toBe('old-money');
  });

  it('chomba + jean recto + zapatilla baja: aceptada con coherencia media', () => {
    const result = evaluateOutfitCoherence(chomba, jeanRecto, zapatillaBaja);
    expect(result.hardConflict).toBe(false);
    expect(result.score).toBeGreaterThanOrEqual(0.6);
    expect(result.score).toBeLessThan(1);
  });

  it('campera tech + jogger tech + zapatilla gruesa: coherencia alta (con la penalización leve de la suela) y estilo Techwear', () => {
    const result = evaluateOutfitCoherence(camperaTech, joggerTech, zapatillaGruesa);
    expect(result.hardConflict).toBe(false);
    expect(result.score).toBe(1 - PENALTY_HEM_CHUNKY);
    expect(result.sharedStyles[0]).toBe('techwear');
  });

  it('camiseta de fútbol + pantalón sastrero: conflicto duro', () => {
    expect(evaluateOutfitCoherence(camisetaFutbol, sastrero).hardConflict).toBe(true);
  });

  it('remera oversize + jean baggy se acepta; con pantalón sastrero queda por debajo del mínimo', () => {
    const baggy = evaluateOutfitCoherence(remeraOversize, jeanBaggy, zapatillas);
    expect(baggy.hardConflict).toBe(false);
    expect(baggy.score).toBe(1);
    expect(baggy.sharedStyles[0]).toBe('streetwear');

    const formal = evaluateOutfitCoherence(remeraOversize, sastrero, zapatillas);
    expect(formal.score).toBeLessThan(MIN_COHERENCE);
  });

  it('mocasín con prendas deportivas resta mucho', () => {
    // Contra una zapatilla sin tipo: la gruesa ya resta por la bocamanga y mezclaría las dos reglas.
    const withSneakers = evaluateOutfitCoherence(camperaTech, joggerTech, zapatillas).score;
    const withLoafers = evaluateOutfitCoherence(camperaTech, joggerTech, mocasin).score;
    expect(withLoafers).toBeLessThan(withSneakers - 0.2);
  });

  it('una prenda sin corte, tipo ni flags no se excluye por falta de datos', () => {
    const sinDatos = garment('x', 'Prenda', 'abajo', '#777777');
    expect(garmentFormality(sinDatos)).toBeNull();
    for (const top of [chomba, remeraOversize, camperaTech]) {
      const result = evaluateOutfitCoherence(top, sinDatos);
      expect(result.hardConflict).toBe(false);
      expect(result.score).toBeGreaterThanOrEqual(MIN_COHERENCE);
    }
  });
});

describe('finalMatch', () => {
  it('es 100 solo si color y coherencia son perfectos', () => {
    expect(finalMatch(100, 1)).toBe(100);
    expect(finalMatch(100, 0.999)).toBeLessThan(100);
    expect(finalMatch(100, 0.64)).toBe(82);
    expect(finalMatch(99, 1)).toBeLessThan(100);
  });
});

describe('SuggestOutfits con coherencia', () => {
  const suggest = (wardrobe: Garment[], limit = 30) =>
    new SuggestOutfits({ getAll: async () => wardrobe } as unknown as GarmentRepository).execute(limit);
  const ids = (outfit: { garments: Garment[] }) => outfit.garments.map((item) => item.id);

  it('no propone la chomba con el jogger tech, sí con el sastrero o el jean, y la campera tech con el jogger', async () => {
    const outfits = await suggest([chomba, camperaTech, joggerTech, sastrero, jeanRecto, zapatillas, mocasin, zapatillaGruesa]);
    const combos = outfits.map(ids);
    expect(combos.some((items) => items.includes('chomba') && items.includes('jogger'))).toBe(false);
    expect(combos.some((items) => items.includes('chomba') && items.includes('sastrero'))).toBe(true);
    expect(combos.some((items) => items.includes('chomba') && items.includes('jean'))).toBe(true);
    expect(combos.some((items) => items.includes('campera') && items.includes('jogger'))).toBe(true);
  });

  it('ordena por match final y nunca muestra 100% con coherencia imperfecta', async () => {
    const outfits = await suggest([chomba, camperaTech, remeraOversize, joggerTech, sastrero, jeanRecto, jeanBaggy, zapatillas, mocasin]);
    const scores = outfits.map((outfit) => outfit.matchPercent);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    for (const outfit of outfits) {
      const [top, bottom, shoe] = outfit.garments;
      if (evaluateOutfitCoherence(top, bottom, shoe).score < 1) expect(outfit.matchPercent).toBeLessThan(100);
    }
  });

  it('con pocas prendas que no combinan no rellena: devuelve menos ideas o ninguna', async () => {
    expect(await suggest([chomba, joggerTech, zapatillas])).toEqual([]);
    const few = await suggest([chomba, joggerTech, sastrero, mocasin]);
    expect(few.map(ids)).toEqual([['chomba', 'sastrero', 'mocasin']]);
  });

  it('agrega el estilo en común', async () => {
    const [outfit] = await suggest([remeraOversize, jeanBaggy, zapatillas]);
    expect(outfit.sharedStyle).toBe('Streetwear');
  });
});
