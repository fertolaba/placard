import type { GeneroReferente } from '../entities/Referente';
import { REFERENTE_IMAGES } from '../../data/seed/referenteImages';
import { SAMPLE_REFERENTES } from '../../data/seed/referentes';
import { referentesParaPerfil, seMuestraAlPerfil } from './referentesParaPerfil';

const con = (gender?: GeneroReferente) => ({ gender });

describe('referentesParaPerfil', () => {
  it('un perfil masculino no ve referentes mujeres', () => {
    expect(seMuestraAlPerfil(con('female'), 'masculino')).toBe(false);
    expect(seMuestraAlPerfil(con('male'), 'masculino')).toBe(true);
  });

  it('un perfil femenino no ve referentes hombres', () => {
    expect(seMuestraAlPerfil(con('male'), 'femenino')).toBe(false);
    expect(seMuestraAlPerfil(con('female'), 'femenino')).toBe(true);
  });

  it('unisex y sin género se muestran a todos', () => {
    for (const sex of ['masculino', 'femenino', null] as const) {
      expect(seMuestraAlPerfil(con('unisex'), sex)).toBe(true);
      expect(seMuestraAlPerfil(con(), sex)).toBe(true);
    }
  });

  it('el catálogo no repite ids y cada carpeta de fotos tiene su referente', () => {
    const ids = SAMPLE_REFERENTES.map((referente) => referente.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of Object.keys(REFERENTE_IMAGES)) expect(ids).toContain(id);
  });

  it('un perfil sin sexo definido ve todos', () => {
    const lista = [con('male'), con('female'), con('unisex'), con()];
    expect(referentesParaPerfil(lista, null)).toEqual(lista);
  });

  it('filtra la lista conservando el orden', () => {
    const lista = [con('male'), con('female'), con('unisex'), con()];
    expect(referentesParaPerfil(lista, 'masculino')).toEqual([lista[0], lista[2], lista[3]]);
    expect(referentesParaPerfil(lista, 'femenino')).toEqual([lista[1], lista[2], lista[3]]);
  });

  it('todos los referentes del catálogo tienen género, y los nuevos se le muestran a un perfil masculino', () => {
    for (const referente of SAMPLE_REFERENTES) expect(referente.gender).toBeDefined();
    const ids = referentesParaPerfil(SAMPLE_REFERENTES, 'masculino').map((referente) => referente.id);
    for (const id of ['bad-bunny', 'asap-rocky', 'central-cee', 'drake']) expect(ids).toContain(id);
  });

  it('cada referente del catálogo tiene fotos cargadas en referenteImages.ts', () => {
    const sinFotos = SAMPLE_REFERENTES.filter((referente) => {
      const images = REFERENTE_IMAGES[referente.id];
      return images === undefined || (images.portada === undefined && images.looks.length === 0);
    }).map((referente) => referente.id);
    expect(sinFotos).toEqual([]);
  });
});
