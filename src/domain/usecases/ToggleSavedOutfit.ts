import type { SavedOutfit } from '../entities/SavedOutfit';
import type { SavedOutfitRepository } from '../repositories/SavedOutfitRepository';

export class ToggleSavedOutfit {
  constructor(private readonly repository: SavedOutfitRepository) {}

  /** Guarda el look o lo quita si ya estaba, y devuelve cómo quedó la lista (el último guardado va primero). */
  async execute(outfit: SavedOutfit): Promise<SavedOutfit[]> {
    const current = await this.repository.getAll();
    const next = current.some((item) => item.id === outfit.id)
      ? current.filter((item) => item.id !== outfit.id)
      : [outfit, ...current];
    await this.repository.setAll(next);
    return next;
  }
}
