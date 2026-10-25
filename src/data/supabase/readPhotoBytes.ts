/** Versión para la web: la foto elegida es una dirección "blob:" que se puede leer con fetch. */
export async function readPhotoBytes(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  return response.arrayBuffer();
}
