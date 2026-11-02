import type { BackgroundRemover } from '../services/BackgroundRemover';

export const BACKGROUND_NOT_REMOVED_NOTICE = 'No se pudo quitar el fondo, usamos la foto original';

export type RemoveBackgroundResult =
  | { removed: true; uri: string; notice: null }
  | { removed: false; uri: string; notice: string };

export class RemoveGarmentBackground {
  constructor(private readonly remover: BackgroundRemover) {}

  async isAvailable(): Promise<boolean> {
    try {
      return await this.remover.isAvailable();
    } catch {
      return false;
    }
  }

  /** Nunca falla: si el recorte no se puede hacer, devuelve la foto original y un aviso para la interfaz. */
  async execute(photoUri: string): Promise<RemoveBackgroundResult> {
    try {
      if (await this.remover.isAvailable()) {
        const { uri } = await this.remover.remove(photoUri);
        return { removed: true, uri, notice: null };
      }
    } catch {
      // Se resuelve igual que si no estuviera disponible.
    }
    return { removed: false, uri: photoUri, notice: BACKGROUND_NOT_REMOVED_NOTICE };
  }
}
