import type { Garment } from '../entities/Garment';
import type { StyleMatch, StyleReference } from '../entities/StyleReference';
import type { GarmentRepository } from '../repositories/GarmentRepository';
import { garmentFitsSlot } from '../services/garmentFitsSlot';
import { sortByPrincipal } from '../services/styleAffinity';
import { STYLE_REFERENCES } from '../services/styleCatalog';

function matchReference(reference: StyleReference, garments: Garment[]): StyleMatch {
  // Se asignan primero las piezas con menos candidatas, así una prenda versátil no le "roba" el lugar a otra.
  const order = reference.slots
    .map((slot, index) => ({
      slot,
      index,
      // Entre las candidatas va primero la protagonista del estilo, igual que en la pantalla Outfits.
      candidates: sortByPrincipal(
        garments.filter((garment) => garmentFitsSlot(reference, slot, garment)),
        reference,
        STYLE_REFERENCES,
      ),
    }))
    .sort((a, b) => a.candidates.length - b.candidates.length);

  const used = new Set<string>();
  const assigned = new Map<number, Garment>();
  for (const { index, candidates } of order) {
    const pick = candidates.find((garment) => !used.has(garment.id));
    if (pick) {
      used.add(pick.id);
      assigned.set(index, pick);
    }
  }

  return {
    reference,
    matched: reference.slots.flatMap((slot, index) => {
      const garment = assigned.get(index);
      return garment ? [{ slot, garment }] : [];
    }),
    missing: reference.slots.filter((_, index) => !assigned.has(index)),
  };
}

export class GetStyleMatches {
  constructor(private readonly repository: GarmentRepository) {}

  async execute(): Promise<StyleMatch[]> {
    const garments = await this.repository.getAll();
    return STYLE_REFERENCES.map((reference) => matchReference(reference, garments));
  }
}