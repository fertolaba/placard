import type { SavedOutfit } from '../entities/SavedOutfit';
import type { SavedOutfitRepository } from '../repositories/SavedOutfitRepository';

export class ToggleSavedOutfit {
  constructor(private readonly repository: SavedOutfitRepository) {}

  /** Guarda el look o lo quita si ya estaba, y devuelve cómo quedó la lista (lo nuevo va primero, salvo que se indique otra posición). */
  async execute(outfit: SavedOutfit, position = 0): Promise<SavedOutfit[]> {
    const current = await this.repository.getAll();
    const next = current.some((item) => item.id === outfit.id)
      ? current.filter((item) => item.id !== outfit.id)
      : [...current.slice(0, position), outfit, ...current.slice(position)];
    await this.repository.setAll(next);
    return next;
  }
}
