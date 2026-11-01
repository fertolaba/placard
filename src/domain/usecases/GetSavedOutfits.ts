import type { SavedOutfit } from '../entities/SavedOutfit';
import type { SavedOutfitRepository } from '../repositories/SavedOutfitRepository';

export class GetSavedOutfits {
  constructor(private readonly repository: SavedOutfitRepository) {}

  execute(): Promise<SavedOutfit[]> {
    return this.repository.getAll();
  }
}
