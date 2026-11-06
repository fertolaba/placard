import { parseSavedOutfits } from '../../data/storage/savedOutfitsStorage';
import type { Garment, GarmentCategory } from '../../domain/entities/Garment';
import { matchesSavedFilter, savedOutfitDetail, savedOutfitView } from './savedOutfitView';

function garment(id: string, category: GarmentCategory, colorHex: string): Garment {
  return {
    id,
    name: id,
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
  };
}

const wardrobe = new Map(
  [garment('t', 'top', '#26262B'), garment('p', 'pollera', '#CDB99A'), garment('z', 'calzado', '#F2F2F2')].map((item) => [item.id, item]),
);

describe('savedOutfitView', () => {
  it('ubica cada prenda por zona y usa el degradé del estilo', () => {
    const view = savedOutfitView({ id: 'x', garmentIds: ['t', 'p', 'z'], styleId: 'y2k' }, wardrobe);
    expect(view?.variant).toMatchObject({ complete: true, top: { id: 't' }, bottom: { id: 'p' }, shoe: { id: 'z' } });
    expect(view?.gradient.from).toBe('#E88FC0');
  });

  it('marca incompleto un look sin calzado', () => {
    expect(savedOutfitView({ id: 'x', garmentIds: ['t', 'p'], styleId: null }, wardrobe)?.variant.complete).toBe(false);
  });

  it('conserva el look incompleto si se borró una prenda', () => {
    const view = savedOutfitView({ id: 'x', garmentIds: ['t', 'borrada', 'z'], styleId: null }, wardrobe);
    expect(view?.variant).toMatchObject({ complete: false, top: { id: 't' }, bottom: null, shoe: { id: 'z' } });
  });

  it('nombra el look con la prenda que queda si solo sobrevive el calzado', () => {
    expect(savedOutfitView({ id: 'x', garmentIds: ['borrada', 'z'], styleId: null }, wardrobe)?.title).toBe('z');
  });

  it('descarta el look si se borraron todas sus prendas', () => {
    expect(savedOutfitView({ id: 'x', garmentIds: ['borrada'], styleId: null }, wardrobe)).toBeNull();
  });
});

describe('Guardados', () => {
  const fromDeck = savedOutfitView({ id: 'c', garmentIds: ['t', 'p'], styleId: null, title: 'Base neutra' }, wardrobe)!;
  const fromStyle = savedOutfitView({ id: 'e', garmentIds: ['t', 'p', 'z'], styleId: 'techwear' }, wardrobe)!;

  it('nombra cada look según su origen', () => {
    expect(fromDeck).toMatchObject({ title: 'Base neutra', origin: 'Por color' });
    expect(fromStyle).toMatchObject({ title: 't + p', origin: 'Techwear' });
  });

  it('filtra por origen', () => {
    expect(matchesSavedFilter(fromDeck, 'color')).toBe(true);
    expect(matchesSavedFilter(fromDeck, 'estilo')).toBe(false);
    expect(matchesSavedFilter(fromStyle, 'estilo')).toBe(true);
    expect(matchesSavedFilter(fromStyle, 'todos')).toBe(true);
  });

  it('arma el detalle de "Ver por qué"', () => {
    expect(savedOutfitDetail(fromStyle)).toMatchObject({ id: 'e', title: 't + p', summary: 't + p + z' });
  });
});

describe('parseSavedOutfits', () => {
  it('tolera datos dañados', () => {
    expect(parseSavedOutfits('no es json')).toEqual([]);
    expect(parseSavedOutfits('[{"id":1},{"id":"a","garmentIds":["t"],"styleId":"inventado"}]')).toEqual([
      { id: 'a', garmentIds: ['t'], styleId: null },
    ]);
    expect(parseSavedOutfits('[{"id":"b","garmentIds":[],"styleId":null,"title":"Base"}]')[0].title).toBe('Base');
  });
});

describe('Guardados con las reglas actuales', () => {
  const tech: Garment = { ...garment('tech', 'arriba', '#26262B'), name: 'Campera negra', formalidad: 'deportivo' };
  const sastrero: Garment = { ...garment('sastrero', 'abajo', '#26262B'), name: 'Pantalón negro', formalidad: 'clasico' };
  const zapas: Garment = { ...garment('zapas', 'calzado', '#F2F2F2'), name: 'Zapatillas blancas' };
  const closet = new Map([tech, sastrero, zapas].map((item) => [item.id, item]));
  // Guardado con el corazón antes de la regla de formalidad: el dato guardado no cambia.
  const viejo = Object.freeze({ id: 'viejo', garmentIds: ['tech', 'sastrero', 'zapas'], styleId: null, title: 'Base neutra' });

  it('un outfit guardado viejo con conflicto se marca "Ya no combina" y no se borra', () => {
    const view = savedOutfitView(viejo, closet);
    expect(view).not.toBeNull();
    expect(view!.saved).toBe(viejo);
    expect(view!.conflict).toBe('Prenda deportiva (Campera negra) con prenda clásica (Pantalón negro)');
    expect(view!.variant.complete).toBe(true);
  });

  it('el % match se recalcula con la coherencia: ya no muestra 100%', () => {
    expect(savedOutfitView(viejo, closet)!.variant.matchPercent).toBeLessThan(60);
  });

  it('el detalle de "Por qué combinan" lleva el motivo en lugar del estilo', () => {
    const detail = savedOutfitDetail(savedOutfitView(viejo, closet)!);
    expect(detail.conflict).toContain('Prenda deportiva');
  });

  it('un guardado que sigue combinando no lleva aviso y muestra la formalidad del look', () => {
    const remera: Garment = { ...garment('remera', 'arriba', '#EDEAE4'), name: 'Remera blanca', formalidad: 'casual' };
    const jean: Garment = { ...garment('jean', 'abajo', '#5B7AA0'), name: 'Jean', formalidad: 'casual', corte: 'straight' };
    const view = savedOutfitView({ id: 'ok', garmentIds: ['remera', 'jean', 'zapas'], styleId: null }, new Map([remera, jean, zapas].map((item) => [item.id, item])))!;
    expect(view.conflict).toBeNull();
    expect(savedOutfitDetail(view).lookFormality).toBe('Look casual');
  });
});
