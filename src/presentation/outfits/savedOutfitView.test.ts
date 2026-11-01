import { parseSavedOutfits } from '../../data/storage/savedOutfitsStorage';
import type { Garment, GarmentCategory } from '../../domain/entities/Garment';
import { savedOutfitView } from './savedOutfitView';

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

  it('descarta el look si se borró una prenda', () => {
    expect(savedOutfitView({ id: 'x', garmentIds: ['t', 'borrada'], styleId: null }, wardrobe)).toBeNull();
  });
});

describe('parseSavedOutfits', () => {
  it('tolera datos dañados', () => {
    expect(parseSavedOutfits('no es json')).toEqual([]);
    expect(parseSavedOutfits('[{"id":1},{"id":"a","garmentIds":["t"],"styleId":"inventado"}]')).toEqual([
      { id: 'a', garmentIds: ['t'], styleId: null },
    ]);
  });
});
