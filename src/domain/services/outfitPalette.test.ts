import type { Garment, GarmentCategory } from '../entities/Garment';
import type { GarmentRepository } from '../repositories/GarmentRepository';
import { finalMatch, SuggestOutfits } from '../usecases/SuggestOutfits';
import { scoreOutfit } from './colorHarmony';
import { evaluateOutfitCoherence } from './outfitCoherence';
import { echoBonus, explainOutfit } from './outfitExplanation';
import { evaluatePalette, OFF_RULE_MAX_MATCH, paletteDots } from './outfitPalette';
import type { GarmentColor } from './garmentColors';

// Los colores de la lista que usa la IA (GARMENT_COLORS).
const VERDE: GarmentColor = { name: 'Verde', hex: '#3E7B4F' };
const ROJO: GarmentColor = { name: 'Rojo', hex: '#C0392B' };
const NEGRO: GarmentColor = { name: 'Negro', hex: '#26262B' };
const BLANCO: GarmentColor = { name: 'Blanco', hex: '#EDEAE4' };
const GRIS_OSCURO: GarmentColor = { name: 'Gris oscuro', hex: '#55555B' };
const DENIM: GarmentColor = { name: 'Azul denim', hex: '#5B7AA0' };
const AMARILLO: GarmentColor = { name: 'Amarillo', hex: '#E5C24A' };
const AZUL: GarmentColor = { name: 'Azul', hex: '#2F5FA8' };
const NARANJA: GarmentColor = { name: 'Naranja', hex: '#D9783A' };
const VIOLETA: GarmentColor = { name: 'Violeta', hex: '#7A5BA8' };

function garment(
  id: string,
  name: string,
  category: GarmentCategory,
  color: GarmentColor,
  secondaryColors: GarmentColor[] = [],
  extra: Partial<Garment> = {},
): Garment {
  return {
    id,
    name,
    category,
    colorHex: color.hex,
    colorName: color.name,
    secondaryColors,
    seasons: ['verano'],
    sporty: false,
    classic: false,
    photoRef: null,
    imageUri: null,
    createdAt: new Date(0),
    ...extra,
  };
}

const musculosaCeltics = garment('celtics', 'Musculosa Celtics', 'arriba', VERDE, [BLANCO], { corte: 'regular' });
const jeanGris = garment('jean-gris', 'Jean gris oscuro', 'abajo', GRIS_OSCURO, [], { corte: 'straight' });
// Como la guardó la IA según lo que se ve en el caso real: principal blanco, rojo y negro de secundarios.
const jordan = garment('jordan', 'Jordan 1', 'calzado', BLANCO, [ROJO, NEGRO], { calzadoTipo: 'alta' });
const zapatillaBlanca = garment('blanca', 'Zapatilla blanca', 'calzado', BLANCO, [], { calzadoTipo: 'baja' });
const camisetaMilan = garment('milan', 'Camiseta del Milan', 'arriba', ROJO, [NEGRO], { corte: 'regular' });
const pantalonNegro = garment('pantalon-negro', 'Pantalón negro', 'abajo', NEGRO, [], { corte: 'straight' });
const remeraBlanca = garment('remera-blanca', 'Remera blanca', 'arriba', BLANCO, [], { corte: 'regular' });
const jean = garment('jean', 'Jean', 'abajo', DENIM, [], { corte: 'straight' });
const zapatillaConRojo = garment('zapa-rojo', 'Zapatilla blanca y roja', 'calzado', BLANCO, [ROJO], { calzadoTipo: 'baja' });

const suggest = (wardrobe: Garment[]) =>
  new SuggestOutfits({ getAll: async () => wardrobe } as unknown as GarmentRepository).execute(30);
const ids = (outfit: { garments: Garment[] }) => outfit.garments.map((item) => item.id);

describe('evaluatePalette', () => {
  it('musculosa verde + jean gris oscuro + Jordan blanca/roja/negra: descartada (el rojo choca con el verde)', () => {
    const result = evaluatePalette([musculosaCeltics, jeanGris, jordan]);
    expect(result.discard).toBe(true);
    expect(result.groups.map((group) => group.color.name)).toEqual(['Verde', 'Rojo']);
  });

  it('la misma musculosa + jean gris + zapatilla blanca lisa: un solo acento, el verde', () => {
    const result = evaluatePalette([musculosaCeltics, jeanGris, zapatillaBlanca]);
    expect(result.discard).toBe(false);
    expect(result.offRule).toBe(false);
    expect(result.groups.map((group) => group.color.name)).toEqual(['Verde']);
  });

  it('camiseta del Milan roja y negra + pantalón negro + zapatilla blanca: el negro es neutro, solo acento rojo', () => {
    const result = evaluatePalette([camisetaMilan, pantalonNegro, zapatillaBlanca]);
    expect(result.discard).toBe(false);
    expect(result.groups.map((group) => group.color.name)).toEqual(['Rojo']);
  });

  it('más de dos acentos distintos: descartada', () => {
    const top = garment('t', 'Remera', 'arriba', VERDE, [], { corte: 'regular' });
    const shoe = garment('s', 'Zapatilla', 'calzado', BLANCO, [AMARILLO, VIOLETA]);
    expect(evaluatePalette([top, jeanGris, shoe]).discard).toBe(true);
  });

  it('rojo y verde como principales de prendas distintas también chocan', () => {
    const top = garment('t', 'Remera', 'arriba', VERDE);
    const bottom = garment('b', 'Pantalón', 'abajo', ROJO);
    expect(evaluatePalette([top, bottom]).discard).toBe(true);
  });

  it('azul y naranja como principales siguen siendo "Colores complementarios" (la regla ya existe)', () => {
    const top = garment('t', 'Remera', 'arriba', AZUL);
    const bottom = garment('b', 'Pantalón', 'abajo', NARANJA);
    expect(evaluatePalette([top, bottom]).discard).toBe(false);
    expect(explainOutfit([top, bottom]).rule).toBe('complementarios');
  });

  it('azul y naranja chocan si uno solo está en los detalles', () => {
    const top = garment('t', 'Remera', 'arriba', AZUL);
    const shoe = garment('s', 'Zapatilla', 'calzado', BLANCO, [NARANJA]);
    expect(evaluatePalette([top, jeanGris, shoe]).discard).toBe(true);
  });

  it('una prenda con rojo y verde a la vez no choca consigo misma', () => {
    const top = garment('t', 'Remera navideña', 'arriba', ROJO, [VERDE]);
    expect(evaluatePalette([top, jeanGris, zapatillaBlanca]).discard).toBe(false);
  });

  it('el denim apagado cuenta como neutro', () => {
    expect(evaluatePalette([remeraBlanca, jean, zapatillaBlanca]).groups).toEqual([]);
  });
});

describe('SuggestOutfits con colores secundarios', () => {
  it('la musculosa de los Celtics no sale con las Jordan rojas: elige la zapatilla blanca y queda "Verde con neutros"', async () => {
    const outfits = await suggest([musculosaCeltics, jeanGris, jordan, zapatillaBlanca]);
    expect(outfits.map(ids)).toEqual([['celtics', 'jean-gris', 'blanca']]);
    expect(outfits[0].title).toBe('Verde con neutros');
  });

  it('si la Jordan es el único calzado, la idea sale sin calzado (nunca con el rojo)', async () => {
    const outfits = await suggest([musculosaCeltics, jeanGris, jordan]);
    expect(outfits.map(ids)).toEqual([['celtics', 'jean-gris']]);
  });

  it('camiseta del Milan + pantalón negro + zapatilla blanca: "Rojo con neutros"', async () => {
    const [outfit] = await suggest([camisetaMilan, pantalonNegro, zapatillaBlanca]);
    expect(ids(outfit)).toEqual(['milan', 'pantalon-negro', 'blanca']);
    expect(outfit.title).toBe('Rojo con neutros');
  });

  it('remera blanca + jean + zapatilla con secundario rojo: no es "Base neutra", es "Rojo con neutros"', async () => {
    const [outfit] = await suggest([remeraBlanca, jean, zapatillaConRojo]);
    expect(outfit.title).toBe('Rojo con neutros');
    expect(outfit.explanation.rule).toBe('acento');
    expect(outfit.explanation.ruleText).toContain('rojo');
  });

  it('la Jordan roja entra en una idea "Rojo con neutros"', async () => {
    const [outfit] = await suggest([camisetaMilan, pantalonNegro, jordan]);
    expect(ids(outfit)).toEqual(['milan', 'pantalon-negro', 'jordan']);
    expect(outfit.title).toBe('Rojo con neutros');
  });

  it('un acento de los detalles fuera de la regla deja el match por debajo de 90%', async () => {
    const top = garment('verde', 'Remera verde', 'arriba', VERDE, [], { corte: 'regular' });
    const shoe = garment('zapa-amarilla', 'Zapatilla blanca y amarilla', 'calzado', BLANCO, [AMARILLO], { calzadoTipo: 'baja' });
    const [outfit] = await suggest([top, jeanGris, shoe]);
    expect(evaluatePalette(outfit.garments).offRule).toBe(true);
    expect(outfit.matchPercent).toBeLessThanOrEqual(OFF_RULE_MAX_MATCH);
  });

  it('prendas sin secundarios: mismo título y mismo match que antes', async () => {
    const remeraRoja = garment('remera-roja', 'Remera roja', 'arriba', ROJO, [], { corte: 'regular' });
    const items = [remeraRoja, pantalonNegro, zapatillaBlanca];
    const [outfit] = await suggest(items);
    const before = finalMatch(
      scoreOutfit(items.map((item) => item.colorHex)) + echoBonus(items),
      evaluateOutfitCoherence(remeraRoja, pantalonNegro, zapatillaBlanca).score,
    );
    expect(outfit.title).toBe('Rojo con neutros');
    expect(outfit.matchPercent).toBe(before);
  });
});

describe('paletteDots', () => {
  it('muestra el principal de cada prenda y el rojo de la Jordan', () => {
    expect(paletteDots([camisetaMilan, pantalonNegro, jordan]).map((color) => color.name)).toEqual(['Rojo', 'Negro', 'Blanco', 'Rojo']);
  });

  it('sin secundarios vivos, un punto por prenda como hoy', () => {
    expect(paletteDots([remeraBlanca, jean, zapatillaBlanca])).toHaveLength(3);
  });
});
