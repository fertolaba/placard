import type { StyleId } from '../entities/StyleReference';

export interface FavoriteStylesRepository {
  get(): Promise<StyleId[]>;
  set(styles: StyleId[]): Promise<void>;
}
