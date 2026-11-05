import { SAMPLE_REFERENTES } from '../../data/seed/referentes';
import type { Estampado, Garment, GarmentCategory } from '../entities/Garment';
import type { Referente } from '../entities/Referente';
import { calcularMatch } from './calcularMatch';
import { formalityRangeOf, garmentsForReferente, referenteFit } from './referenteFit';

const NEGRO = '#26262B';
const BLANCO = '#EDEAE4';
const MARINO = '#1F2F4F';
const CELESTE = '#9CC3E6';

let nextId = 0;
function garment(
  name: string,
  category: GarmentCategory,
  colorHex: string,
  extra: { estampado?: Estampado; classic?: boolean; sporty?: boolean; corte?: string } = {},
): Garment {
  nextId += 1;
  return {
    id: String(nextId),
    name,
    category,
    colorHex,
    colorName: '',
    secondaryColors: [],
    seasons: ['verano'],
    sporty: extra.sporty ?? false,
    classic: extra.classic ?? false,
    corte: extra.corte,
    estampado: extra.estampado,
    photoRef: null,
    imageUri: null,
    createdAt: new Date(0),
  };
}

const ROCKY_SEED = SAMPLE_REFERENTES.find((referente) => referente.id === 'asap-rocky')!;

/** Rocky con el perfil del pedido: clásico a casual, solo liso. Las prendas clave son las del catálogo. */
const rocky: Referente = { ...ROCKY_SEED, formality: 'casual', formalityRange: ['clasico', 'casual'], graphics: 'solo-liso' };

/** Un streetwear deportivo que usa estampas grandes, con las mismas prendas clave para comparar. */
const streetwear: Referente = {
  ...ROCKY_SEED,
  id: 'streetwear-test',
  formality: 'deportivo',
  formalityRange: ['casual', 'deportivo'],
  graphics: 'grafico-ok',
};

// Las dos camperas del caso real: entran por color y categoría ("Chomba rugby a rayas" marino, "Campera de cuero negra").
const camperaAzulConLetras = () => garment('Campera azul', 'arriba', MARINO, { estampado: 'grafico' });
const camperaNikeTech = () => garment('Campera Nike Tech negra', 'arriba', NEGRO, { estampado: 'logo' });
const chombaBlanca = () => garment('Chomba blanca', 'arriba', BLANCO, { estampado: 'liso', classic: true });
const jeanBaggy = () => garment('Jean celeste', 'abajo', CELESTE, { estampado: 'liso', corte: 'baggy' });

describe('referenteFit: A$AP Rocky (clásico a casual, solo liso)', () => {
  it('la campera azul con estampa grande queda afuera', () => {
    expect(referenteFit(rocky, camperaAzulConLetras()).allowed).toBe(false);
  });

  it('la campera Nike Tech negra (deportiva/técnica) queda afuera', () => {
    expect(referenteFit(rocky, camperaNikeTech()).allowed).toBe(false);
  });

  it('la chomba blanca lisa y el jean baggy liso entran', () => {
    expect(referenteFit(rocky, chombaBlanca())).toEqual({ allowed: true, penalty: 0 });
    expect(referenteFit(rocky, jeanBaggy())).toEqual({ allowed: true, penalty: 0 });
  });

  it('un logo chico entra, pero penalizado', () => {
    const fit = referenteFit(rocky, garment('Remera negra', 'arriba', NEGRO, { estampado: 'logo' }));
    expect(fit.allowed).toBe(true);
    expect(fit.penalty).toBeGreaterThan(0);
  });

  it('una prenda sin estampado ni formalidad conocida no se excluye', () => {
    expect(referenteFit(rocky, garment('Campera', 'arriba', NEGRO))).toEqual({ allowed: true, penalty: 0 });
  });

  it('en "Tus prendas" quedan la chomba y el jean, y el "N de M" coincide con la lista', () => {
    const placard = [camperaAzulConLetras(), camperaNikeTech(), chombaBlanca(), jeanBaggy()];
    const match = calcularMatch(rocky, placard);
    const nombres = match.encontradas.map(({ garment: g }) => g.name);
    expect(nombres).toEqual(expect.arrayContaining(['Chomba blanca', 'Jean celeste']));
    expect(nombres).not.toContain('Campera azul');
    expect(nombres).not.toContain('Campera Nike Tech negra');
    expect(match.tengo).toBe(match.encontradas.length);
    expect(match.total).toBe(match.encontradas.length + match.faltantes.length);
    expect(match.porcentaje).toBe(Math.round((match.tengo / match.total) * 100));
  });

  it('el porcentaje baja respecto de no filtrar', () => {
    const placard = [camperaAzulConLetras(), camperaNikeTech(), chombaBlanca(), jeanBaggy()];
    const sinPerfil: Referente = { ...ROCKY_SEED, formality: undefined, formalityRange: undefined, graphics: undefined };
    expect(calcularMatch(sinPerfil, placard).tengo).toBe(4);
    expect(calcularMatch(rocky, placard).tengo).toBe(2);
  });

  it('entre dos candidatas, la lisa le gana a la que tiene logo', () => {
    const conLogo = garment('Jean celeste con logo', 'abajo', CELESTE, { estampado: 'logo' });
    const liso = jeanBaggy();
    const match = calcularMatch(rocky, [conLogo, liso]);
    expect(match.encontradas.map(({ garment: g }) => g.id)).toContain(liso.id);
  });
});

describe('referenteFit: el perfil de Rocky del catálogo', () => {
  it('también deja afuera las dos camperas', () => {
    expect(referenteFit(ROCKY_SEED, camperaAzulConLetras()).allowed).toBe(false);
    expect(referenteFit(ROCKY_SEED, camperaNikeTech()).allowed).toBe(false);
    expect(referenteFit(ROCKY_SEED, chombaBlanca()).allowed).toBe(true);
    expect(referenteFit(ROCKY_SEED, jeanBaggy()).allowed).toBe(true);
  });
});

describe('referenteFit: streetwear deportivo que admite estampas', () => {
  it('la campera azul con letras entra', () => {
    expect(referenteFit(streetwear, camperaAzulConLetras()).allowed).toBe(true);
    const match = calcularMatch(streetwear, [camperaAzulConLetras()]);
    expect(match.encontradas.map(({ garment: g }) => g.name)).toEqual(['Campera azul']);
  });

  it('la campera tech también entra', () => {
    expect(referenteFit(streetwear, camperaNikeTech()).allowed).toBe(true);
  });
});

describe('referenteFit: datos que faltan', () => {
  it('un referente sin perfil no filtra nada', () => {
    const sinPerfil: Referente = { ...ROCKY_SEED, formality: undefined, formalityRange: undefined, graphics: undefined };
    expect(formalityRangeOf(sinPerfil)).toBeNull();
    for (const g of [camperaAzulConLetras(), camperaNikeTech(), chombaBlanca()]) expect(referenteFit(sinPerfil, g).allowed).toBe(true);
  });

  it('logo-ok descarta la estampa grande pero no el logo', () => {
    const logoOk: Referente = { ...rocky, graphics: 'logo-ok' };
    expect(referenteFit(logoOk, garment('Remera', 'arriba', NEGRO, { estampado: 'grafico' })).allowed).toBe(false);
    expect(referenteFit(logoOk, garment('Remera', 'arriba', NEGRO, { estampado: 'logo' }))).toEqual({ allowed: true, penalty: 0 });
  });

  it('sin rango, un referente clásico admite casual pero no deportivo', () => {
    const clasico: Referente = { ...rocky, prendasClave: [], formality: 'clasico', formalityRange: undefined };
    expect(formalityRangeOf(clasico)).toEqual([0, 1]);
  });

  it('el rango se amplía con las prendas clave del propio referente (una camisa nunca queda afuera)', () => {
    const casual: Referente = {
      ...rocky,
      formality: 'casual',
      formalityRange: ['casual', 'casual'],
      prendasClave: [{ nombre: 'Camisa fucsia', categoria: 'arriba', colorHex: '#C2185B' }],
    };
    expect(formalityRangeOf(casual)).toEqual([0, 1]);
    expect(referenteFit(casual, garment('Camisa', 'arriba', BLANCO, { classic: true })).allowed).toBe(true);
  });

  it('garmentsForReferente deja solo las que pasan los filtros', () => {
    const placard = [camperaAzulConLetras(), camperaNikeTech(), chombaBlanca(), jeanBaggy()];
    expect(garmentsForReferente(rocky, placard).map((g) => g.name)).toEqual(['Chomba blanca', 'Jean celeste']);
  });
});
