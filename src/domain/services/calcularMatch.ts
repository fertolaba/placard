import type { Garment } from '../entities/Garment';
import type { MatchReferente, PrendaClave, Referente } from '../entities/Referente';
import { hexToHsl, type Hsl } from './colorHarmony';
import { referenteFit } from './referenteFit';

const TOLERANCIA_TONO = 25; // grados del círculo cromático
const TOLERANCIA_LUZ_NEUTRO = 0.2;
const TOLERANCIA_LUZ_COLOR = 0.3;

/** Negros, blancos, grises y crudos: se comparan por luminosidad porque su tono no dice nada. */
function esAcromatico({ s, l }: Hsl): boolean {
  return s < 0.25 || l < 0.12 || l > 0.92 || (l > 0.8 && s < 0.5);
}

/**
 * Compara con tolerancia y no por igualdad: el color detectado en una foto casi nunca coincide
 * exactamente con el hex de la prenda clave.
 */
export function esMismoColor(hexA: string, hexB: string): boolean {
  const a = hexToHsl(hexA);
  const b = hexToHsl(hexB);
  const acromaticoA = esAcromatico(a);
  if (acromaticoA !== esAcromatico(b)) return false;

  const luz = Math.abs(a.l - b.l);
  if (acromaticoA) return luz <= TOLERANCIA_LUZ_NEUTRO;

  const diferencia = Math.abs(a.h - b.h);
  return Math.min(diferencia, 360 - diferencia) <= TOLERANCIA_TONO && luz <= TOLERANCIA_LUZ_COLOR;
}

/** Las prendas deportivas quedan afuera, igual que en los estilos que no son Blokecore. */
function sirve(garment: Garment, prenda: PrendaClave): boolean {
  return !garment.sporty && garment.category === prenda.categoria && esMismoColor(garment.colorHex, prenda.colorHex);
}

/**
 * Cada prenda del placard cubre una sola prenda clave. Antes del color y la categoría, la prenda tiene que ir con el
 * perfil del referente (formalidad y estampado, ver referenteFit): las descartadas no cuentan para el "N de M".
 */
export function calcularMatch(referente: Referente, prendasDelUsuario: readonly Garment[]): MatchReferente {
  const { prendasClave } = referente;

  // Entre las que pasan el filtro, las penalizadas (un logo con un referente liso) van después; a igualdad, el orden del placard.
  const aptas = prendasDelUsuario
    .map((garment) => ({ garment, fit: referenteFit(referente, garment) }))
    .filter(({ fit }) => fit.allowed)
    .sort((a, b) => a.fit.penalty - b.fit.penalty)
    .map(({ garment }) => garment);

  // Se asignan primero las prendas con menos candidatas, así una prenda versátil no le "roba" el lugar a otra.
  const orden = prendasClave
    .map((prenda, index) => ({ index, candidatas: aptas.filter((garment) => sirve(garment, prenda)) }))
    .sort((a, b) => a.candidatas.length - b.candidatas.length);

  const usadas = new Set<string>();
  const asignadas = new Map<number, Garment>();
  for (const { index, candidatas } of orden) {
    const elegida = candidatas.find((garment) => !usadas.has(garment.id));
    if (elegida) {
      usadas.add(elegida.id);
      asignadas.set(index, elegida);
    }
  }

  const total = prendasClave.length;
  return {
    tengo: asignadas.size,
    total,
    porcentaje: total === 0 ? 0 : Math.round((asignadas.size / total) * 100),
    encontradas: prendasClave.flatMap((prenda, index) => {
      const garment = asignadas.get(index);
      return garment ? [{ prenda, garment }] : [];
    }),
    faltantes: prendasClave.filter((_, index) => !asignadas.has(index)),
  };
}
