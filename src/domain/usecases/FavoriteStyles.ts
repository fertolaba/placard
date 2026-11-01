import type { StyleId } from '../entities/StyleReference';
import type { FavoriteStylesRepository } from '../repositories/FavoriteStylesRepository';

export class GetFavoriteStyles {
  constructor(private readonly repository: FavoriteStylesRepository) {}

  execute(): Promise<StyleId[]> {
    return this.repository.get();
  }
}

export class SetFavoriteStyles {
  constructor(private readonly repository: FavoriteStylesRepository) {}

  execute(styles: StyleId[]): Promise<void> {
    return this.repository.set(styles);
  }
}
