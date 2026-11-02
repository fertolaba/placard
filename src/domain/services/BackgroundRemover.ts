/** Quita el fondo de una foto. Hoy lo hace un servidor local; al publicar, se reemplaza por uno nativo. */
export interface BackgroundRemover {
  isAvailable(): Promise<boolean>;
  /** Devuelve un PNG con fondo transparente. Si no puede, lanza un error con un mensaje para mostrar. */
  remove(imageUri: string): Promise<{ uri: string }>;
}
