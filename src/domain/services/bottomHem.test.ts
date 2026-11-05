import type { Garment, GarmentCategory } from '../entities/Garment';
import type { GarmentRepository } from '../repositories/GarmentRepository';
import { SuggestOutfits } from '../usecases/SuggestOutfits';
import { bottomHem, hemShoeFit, shoeType } from './bottomHem';
import { evaluateOutfitCoherence, PENALTY_HEM_CHUNKY } from './outfitCoherence';

function garment(id: string, name: string, category: GarmentCategory, colorHex: string, extra: Partial<Garment> = {}): Garment {
  return {
    id,
    name,
    category,
    colorHex,
    colorName: id,
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

const NEGRO = '#1A1A1D';
const camperaTech = garment('campera', 'Campera Nike Tech negra', 'arriba', NEGRO, { corte: 'ajustado' });
const joggerTech = garment('jogger', 'Jogger tech con puño', 'abajo', NEGRO);
const remera = garment('remera', 'Remera blanca', 'arriba', '#F2F2F2', { corte: 'oversize' });
const jeanBaggy = garment('baggy', 'Jean baggy', 'abajo', '#5B7AA0', { corte: 'baggy' });
const jeanRecto = garment('recto', 'Jean', 'abajo', '#4A6A90', { corte: 'straight' });
const pantalonSinCorte = garment('pantalon', 'Pantalón', 'abajo', '#777777');
const timberland = garment('botas', 'Timberland', 'calzado', '#C08A3E', { calzadoTipo: 'botita' });
const gruesa = garment('gruesa', 'Zapatilla chunky', 'calzado', '#26262B', { calzadoTipo: 'gruesa' });
const canaAlta = garment('alta', 'Jordan 1', 'calzado', '#26262B', { calzadoTipo: 'alta' });
const baja = garment('baja', 'Zapatilla baja', 'calzado', '#26262B', { calzadoTipo: 'baja' });

describe('bottomHem', () => {
  it('jogger y pantalón tech o deportivo son ajustados, aunque el corte diga otra cosa', () => {
    expect(bottomHem(joggerTech)).toBe('ajustada');
    expect(bottomHem(garment('j', 'Jogger gris', 'abajo', NEGRO, { corte: 'straight' }))).toBe('ajustada');
    expect(bottomHem(garment('p', 'Pantalón deportivo', 'abajo', NEGRO))).toBe('ajustada');
    expect(bottomHem(garment('c', 'Calza negra', 'abajo', NEGRO))).toBe('ajustada');
  });

  it('por el corte: skinny y slim ajustados, straight recto, baggy/wide leg/flared anchos', () => {
    const hem = (corte: string) => bottomHem(garment('x', 'Jean', 'abajo', NEGRO, { corte }));
    expect(hem('skinny')).toBe('ajustada');
    expect(hem('slim')).toBe('ajustada');
    expect(hem('straight')).toBe('recta');
    expect(hem('baggy')).toBe('ancha');
    expect(hem('wide leg')).toBe('ancha');
    expect(hem('flared')).toBe('ancha');
  });

  it('sin corte, por el nombre: sastrero y chino rectos, cargo amplio ancho', () => {
    expect(bottomHem(garment('s', 'Pantalón sastrero', 'abajo', NEGRO))).toBe('recta');
    expect(bottomHem(garment('ch', 'Chino beige', 'abajo', NEGRO))).toBe('recta');
    expect(bottomHem(garment('cg', 'Cargo amplio', 'abajo', NEGRO))).toBe('ancha');
  });

  it('sin datos, cortos o fuera de "abajo": desconocida', () => {
    expect(bottomHem(pantalonSinCorte)).toBeNull();
    expect(bottomHem(garment('b', 'Bermuda jogger', 'abajo', NEGRO))).toBeNull();
    expect(bottomHem(garment('p', 'Pollera lápiz', 'pollera', NEGRO, { corte: 'lápiz' }))).toBeNull();
    expect(bottomHem(remera)).toBeNull();
  });
});

describe('hemShoeFit', () => {
  it('matriz pantalón × calzado', () => {
    expect(hemShoeFit(joggerTech, timberland)).toBe('conflicto');
    expect(hemShoeFit(joggerTech, gruesa)).toBe('leve');
    expect(hemShoeFit(joggerTech, canaAlta)).toBe('ok');
    expect(hemShoeFit(joggerTech, baja)).toBe('ok');
    for (const bottom of [jeanBaggy, jeanRecto]) {
      for (const shoe of [timberland, gruesa, canaAlta, baja]) expect(hemShoeFit(bottom, shoe)).toBe('ok');
    }
  });

  it('calzado clásico, tipo de calzado o bocamanga desconocidos: neutro', () => {
    const mocasin = garment('m', 'Mocasines', 'calzado', '#3B2A20', { classic: true, calzadoTipo: 'baja' });
    expect(hemShoeFit(joggerTech, mocasin)).toBe('ok');
    expect(hemShoeFit(joggerTech, garment('z', 'Zapatillas', 'calzado', NEGRO))).toBe('ok');
    expect(hemShoeFit(pantalonSinCorte, timberland)).toBe('ok');
  });

  it('una bota vieja sin tipo se reconoce por el nombre', () => {
    const botasViejas = garment('bv', 'Botas tipo Timberland', 'calzado', '#C08A3E');
    expect(shoeType(botasViejas)).toBe('botita');
    expect(hemShoeFit(joggerTech, botasViejas)).toBe('conflicto');
  });
});

describe('evaluateOutfitCoherence: bocamanga con calzado', () => {
  it('campera tech + jogger tech con puño + botita: descartada', () => {
    const result = evaluateOutfitCoherence(camperaTech, joggerTech, timberland);
    expect(result.hardConflict).toBe(true);
    expect(result.score).toBe(0);
  });

  it('campera tech + jogger tech + zapatilla gruesa: aceptada con penalización leve', () => {
    const conGruesa = evaluateOutfitCoherence(camperaTech, joggerTech, gruesa);
    const conAlta = evaluateOutfitCoherence(camperaTech, joggerTech, canaAlta);
    expect(conGruesa.hardConflict).toBe(false);
    expect(conGruesa.score).toBeCloseTo(conAlta.score - PENALTY_HEM_CHUNKY, 5);
  });

  it('campera tech + jogger tech + caña alta: aceptada', () => {
    const result = evaluateOutfitCoherence(camperaTech, joggerTech, canaAlta);
    expect(result.hardConflict).toBe(false);
    expect(result.score).toBe(1);
  });

  it('remera + jean baggy + botita: aceptada', () => {
    expect(evaluateOutfitCoherence(remera, jeanBaggy, timberland).hardConflict).toBe(false);
  });

  it('jean recto + botita: aceptada', () => {
    expect(evaluateOutfitCoherence(remera, jeanRecto, timberland).hardConflict).toBe(false);
  });

  it('pantalón sin corte + botita: neutro, no se descarta por falta de datos', () => {
    const conBotita = evaluateOutfitCoherence(remera, pantalonSinCorte, timberland);
    const conBaja = evaluateOutfitCoherence(remera, pantalonSinCorte, baja);
    expect(conBotita.hardConflict).toBe(false);
    expect(conBotita.score).toBe(conBaja.score);
  });
});

describe('SuggestOutfits: elige el calzado de cada idea', () => {
  const suggest = (wardrobe: Garment[]) =>
    new SuggestOutfits({ getAll: async () => wardrobe } as unknown as GarmentRepository).execute(30);
  const ids = (outfit: { garments: Garment[] }) => outfit.garments.map((item) => item.id);

  it('con botita y baja para el mismo jogger, elige la baja', async () => {
    const outfits = await suggest([camperaTech, joggerTech, timberland, baja]);
    expect(outfits.map(ids)).toEqual([['campera', 'jogger', 'baja']]);
  });

  it('una sola idea por arriba + abajo, con el calzado que mejor puntúa', async () => {
    const outfits = await suggest([camperaTech, joggerTech, gruesa, canaAlta]);
    expect(outfits.map(ids)).toEqual([['campera', 'jogger', 'alta']]);
  });

  it('si ningún calzado va, la idea se muestra sin calzado', async () => {
    const outfits = await suggest([camperaTech, joggerTech, timberland]);
    expect(outfits.map(ids)).toEqual([['campera', 'jogger']]);
  });

  it('las botas siguen apareciendo con un jean baggy', async () => {
    const outfits = await suggest([remera, jeanBaggy, joggerTech, timberland]);
    expect(outfits.map(ids)).toContainEqual(['remera', 'baggy', 'botas']);
    expect(outfits.some((outfit) => ids(outfit).includes('jogger') && ids(outfit).includes('botas'))).toBe(false);
  });
});
