import type { Garment, GarmentCategory } from '../entities/Garment';
import type { GarmentRepository } from '../repositories/GarmentRepository';
import type { StyleId } from '../entities/StyleReference';
import { GetStyleMatches } from '../usecases/GetStyleMatches';
import { buildStyleVariants, styleCoverage, zoneGarments } from '../../presentation/outfits/styleVariants';
import { garmentFitsSlot } from './garmentFitsSlot';
import { affinity, ESTAMPADO_PENALTY, homeStyle, principalScore } from './styleAffinity';
import { STYLE_REFERENCES } from './styleCatalog';

const style = (id: StyleId) => STYLE_REFERENCES.find((reference) => reference.id === id)!;
const techwear = style('techwear');
const oldMoney = style('old-money');

function garment(id: string, name: string, category: GarmentCategory, colorName: string, colorHex: string, extra: Partial<Garment> = {}): Garment {
  return {
    id,
    name,
    category,
    colorHex,
    colorName,
    secondaryColors: [],
    seasons: ['invierno'],
    sporty: false,
    classic: false,
    photoRef: null,
    imageUri: 'file://foto.jpg',
    createdAt: new Date(0),
    ...extra,
  };
}

const enters = (id: StyleId, item: Garment) => style(id).slots.some((slot) => garmentFitsSlot(style(id), slot, item));

// Como las prendas reales: el buzo es más nuevo, así que antes ganaba el empate en Techwear.
const buzoEstampado = garment('buzo', 'Buzo azul', 'arriba', 'Azul', '#2F5FA8', {
  corte: 'regular',
  estampado: 'grafico',
  formalidad: 'casual',
  secondaryColors: [{ name: 'Blanco', hex: '#EDEAE4' }],
  createdAt: new Date(2000),
});
const camperaTech = garment('campera', 'Campera Nike Tech', 'arriba', 'Negro', '#26262B', {
  corte: 'regular',
  estampado: 'logo',
  formalidad: 'deportivo',
  createdAt: new Date(1000),
});
const joggerTech = garment('jogger', 'Jogger Nike Tech', 'abajo', 'Negro', '#26262B', { corte: 'slim', estampado: 'logo', formalidad: 'deportivo' });
const jean = garment('jean', 'Jean', 'abajo', 'Azul denim', '#5B7AA0', { corte: 'straight', estampado: 'liso', formalidad: 'casual' });
const botitas = garment('botitas', 'Borcegos', 'calzado', 'Negro', '#26262B', { calzadoTipo: 'botita' });
const buzoLiso = garment('buzo-liso', 'Buzo canguro', 'arriba', 'Bordó', '#7A2E3A', {
  corte: 'regular',
  estampado: 'liso',
  formalidad: 'casual',
  createdAt: new Date(3000),
});

describe('estampado por estilo', () => {
  it('un buzo con estampa grande no entra en Techwear, sí en Streetwear y en Y2K', () => {
    expect(enters('techwear', buzoEstampado)).toBe(false);
    expect(enters('streetwear', buzoEstampado)).toBe(true);
    expect(enters('y2k', buzoEstampado)).toBe(true);
  });

  it('una prenda sin estampado guardado no se excluye', () => {
    const sinDato = { ...buzoEstampado, estampado: undefined };
    expect(enters('techwear', sinDato)).toBe(true);
  });

  it('Old Money: un logo penaliza y una estampa grande deja afuera', () => {
    const camisa = garment('camisa', 'Camisa', 'arriba', 'Blanco', '#EDEAE4', { classic: true, corte: 'regular', estampado: 'liso' });
    const conLogo = { ...camisa, id: 'logo', estampado: 'logo' as const };
    const conEstampa = { ...camisa, id: 'estampa', estampado: 'grafico' as const };
    expect(enters('old-money', conLogo)).toBe(true);
    expect(affinity(conLogo, oldMoney)).toBe(affinity(camisa, oldMoney)! - ESTAMPADO_PENALTY);
    expect(enters('old-money', conEstampa)).toBe(false);
  });
});

describe('afinidad de Techwear', () => {
  const wardrobe = [buzoEstampado, buzoLiso, camperaTech, joggerTech, jean, botitas];

  it('la campera tech y el jogger tech son los principales del look', () => {
    const coverage = styleCoverage(techwear, wardrobe);
    expect(zoneGarments(coverage)).toEqual({ torso: camperaTech, piernas: joggerTech, pies: botitas });
  });

  it('un buzo liso de color entra, pero por debajo de la campera tech', () => {
    const torso = styleCoverage(techwear, wardrobe).byZone.torso.map((item) => item.id);
    expect(torso).toEqual(['campera', 'buzo-liso']);
  });

  it('la campera tech lisa va antes que la misma con logo chico', () => {
    const lisa = { ...camperaTech, id: 'lisa', estampado: 'liso' as const };
    expect(affinity(lisa, techwear)!).toBeGreaterThan(affinity(camperaTech, techwear)!);
  });

  it('una campera tech sin corte guardado igual suma como técnica', () => {
    const tech = { ...camperaTech, corte: undefined };
    const comun = { ...tech, name: 'Campera', formalidad: 'casual' as const };
    expect(affinity(tech, techwear)! - affinity(comun, techwear)!).toBe(3);
  });

  it('la primera variante y GetStyleMatches usan la campera tech', async () => {
    const [first] = buildStyleVariants(styleCoverage(techwear, wardrobe));
    expect(first.top?.id).toBe('campera');
    expect(first.bottom?.id).toBe('jogger');

    const repository = { getAll: async () => wardrobe } as unknown as GarmentRepository;
    const match = (await new GetStyleMatches(repository).execute()).find((item) => item.reference.id === 'techwear')!;
    expect(match.matched.map(({ garment: item }) => item.id)).toContain('campera');
    expect(match.matched.map(({ garment: item }) => item.id)).not.toContain('buzo');
  });

  it('el contador de Techwear deja afuera al buzo estampado', () => {
    expect(styleCoverage(techwear, wardrobe).garments.map((item) => item.id)).not.toContain('buzo');
    expect(styleCoverage(techwear, wardrobe).garments).toHaveLength(5);
    // Sin el filtro (el mismo buzo sin estampado guardado) eran 6.
    expect(styleCoverage(techwear, [{ ...buzoEstampado, estampado: undefined }, ...wardrobe.slice(1)]).garments).toHaveLength(6);
  });

  it('los pesos de Techwear no cambian el estilo de casa ni el orden de los demás estilos', () => {
    // El estilo de casa sale de la base común: la campera tech es de Techwear por su corte, no por el plus.
    expect(homeStyle(camperaTech, STYLE_REFERENCES)?.id).toBe('techwear');
    const plain = (item: Garment): Garment => ({ ...item, name: 'Prenda', formalidad: undefined, colorName: 'x' });
    for (const id of ['streetwear', 'y2k', 'old-money', 'blokecore'] as const) {
      for (const item of wardrobe) {
        expect(principalScore(item, style(id), STYLE_REFERENCES)).toBe(principalScore(plain(item), style(id), STYLE_REFERENCES));
      }
    }
  });
});
