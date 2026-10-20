import type { NewGarment } from '../entities/Garment';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Reglas de negocio de una prenda: devuelve los datos limpios o lanza un error con el motivo. */
export function normalizeGarmentData(input: NewGarment): NewGarment {
  const name = input.name.trim();
  if (name === '') throw new Error('La prenda necesita un nombre.');
  if (name.length > 40) throw new Error('El nombre puede tener hasta 40 caracteres.');
  if (!HEX_COLOR.test(input.colorHex)) throw new Error('El color tiene que tener el formato #RRGGBB.');
  return { ...input, name };
}