import type { SavedOutfit } from '../entities/SavedOutfit';

export interface SavedOutfitRepository {
  getAll(): Promise<SavedOutfit[]>;
  setAll(outfits: SavedOutfit[]): Promise<void>;
}
