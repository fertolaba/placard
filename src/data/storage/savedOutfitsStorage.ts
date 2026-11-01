import type { SavedOutfit } from '../../domain/entities/SavedOutfit';
import { STYLE_IDS } from '../../domain/entities/StyleReference';

/** Lee los looks guardados como texto. Lo que esté dañado se descarta, sin perder el resto. */
export function parseSavedOutfits(text: string | null): SavedOutfit[] {
  if (text === null) return [];
  try {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item: Partial<SavedOutfit> | null) => {
      if (typeof item?.id !== 'string' || !Array.isArray(item.garmentIds)) return [];
      const styleId = STYLE_IDS.find((id) => id === item.styleId) ?? null;
      return [{ id: item.id, garmentIds: item.garmentIds.filter((id) => typeof id === 'string'), styleId }];
    });
  } catch {
    return [];
  }
}
