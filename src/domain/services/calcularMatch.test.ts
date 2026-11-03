import type { Garment, GarmentCategory } from '../entities/Garment';
import type { PrendaClave, Referente } from '../entities/Referente';
import { calcularMatch, esMismoColor } from './calcularMatch';

const NEGRO = '#26262B';
const BLANCO = '#EDEAE4';
const ROJO = '#C0392B';
const AZUL = '#2F5FA8';

function prenda(categoria: GarmentCategory, colorHex: string): PrendaClave {
  return { nombre: `${categoria} ${colorHex}`, categoria, colorHex };
}

function referente(prendasClave: PrendaClave[]): Referente {
  return {
    id: 'test',
    nombre: 'Test',
    iniciales: 'T',
    colorAvatar: NEGRO,
    colorTarjeta: NEGRO,
    estilo: 'Minimal',
    etiquetas: [],
    resumen: '',
    claves: [],
    paleta: [],
    prendasClave,
    destacado: false,
  };
}

let nextId = 0;
function garment(category: GarmentCategory, colorHex: string, sporty = false): Garment {
  nextId += 1;
  return {
    id: String(nextId),
    name: 'Prenda',
    category,
    colorHex,
    colorName: '',
    secondaryColors: [],
    seasons: [],
    sporty,
    classic: false,
    photoRef: null,
    imageUri: null,
    createdAt: new Date(0),
  };
}

describe('esMismoColor', () => {
  it('acepta variaciones cercanas de un color', () => {
    expect(esMismoColor(ROJO, '#B5352A')).toBe(true);
    expect(esMismoColor(NEGRO, '#1A1A1D')).toBe(true);
  });

  it('distingue colores distintos', () => {
    expect(esMismoColor(ROJO, AZUL)).toBe(false);
    expect(esMismoColor(NEGRO, BLANCO)).toBe(false);
    expect(esMismoColor(NEGRO, ROJO)).toBe(false);
  });

  it('el tono da la vuelta en el círculo cromático', () => {
    expect(esMismoColor('#C0392F', '#C02F39')).toBe(true);
  });
});

describe('calcularMatch', () => {
  it('cuenta las prendas que coinciden en categoría y color', () => {
    const encontrada = garment('arriba', ROJO);
    const match = calcularMatch(referente([prenda('arriba', ROJO), prenda('abajo', NEGRO)]), [encontrada]);

    expect(match.tengo).toBe(1);
    expect(match.total).toBe(2);
    expect(match.porcentaje).toBe(50);
    expect(match.encontradas[0].garment).toBe(encontrada);
    expect(match.faltantes).toEqual([prenda('abajo', NEGRO)]);
  });

  it('no cuenta una prenda de otra categoría u otro color', () => {
    const match = calcularMatch(referente([prenda('arriba', ROJO)]), [garment('abajo', ROJO), garment('arriba', AZUL)]);
    expect(match.tengo).toBe(0);
  });

  it('usa cada prenda una sola vez', () => {
    const match = calcularMatch(referente([prenda('arriba', ROJO), prenda('arriba', ROJO)]), [garment('arriba', ROJO)]);
    expect(match.tengo).toBe(1);
    expect(match.faltantes).toHaveLength(1);
  });

  it('una prenda versátil no le quita el lugar a otra', () => {
    const clara = garment('arriba', BLANCO);
    const negra = garment('arriba', NEGRO);
    const match = calcularMatch(referente([prenda('arriba', NEGRO), prenda('arriba', BLANCO)]), [negra, clara]);
    expect(match.tengo).toBe(2);
  });

  it('no cuenta las prendas deportivas', () => {
    const match = calcularMatch(referente([prenda('arriba', ROJO)]), [garment('arriba', ROJO, true)]);
    expect(match.tengo).toBe(0);
  });

  it('devuelve 0% si el referente no tiene prendas clave', () => {
    expect(calcularMatch(referente([]), [garment('arriba', ROJO)]).porcentaje).toBe(0);
  });

  it('redondea el porcentaje', () => {
    const clave = [prenda('arriba', ROJO), prenda('abajo', NEGRO), prenda('calzado', BLANCO)];
    expect(calcularMatch(referente(clave), [garment('arriba', ROJO)]).porcentaje).toBe(33);
  });
});
