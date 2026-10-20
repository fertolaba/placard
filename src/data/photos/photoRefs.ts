/** Extensión del archivo de una dirección (sin parámetros); si no se reconoce, "jpg". */
export function extensionOf(uri: string): string {
  const clean = uri.split('?')[0].split('#')[0];
  const match = /\.([a-zA-Z0-9]{2,5})$/.exec(clean);
  return match ? match[1].toLowerCase() : 'jpg';
}

/** Arma una referencia única como "garments/m1abc-x7k2pq.jpg". */
export function buildPhotoRef(directory: string, sourceUri: string, now = Date.now(), random = Math.random()): string {
  return `${directory}/${now.toString(36)}-${random.toString(36).slice(2, 8)}.${extensionOf(sourceUri)}`;
}