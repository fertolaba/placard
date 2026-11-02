import { File, Paths } from 'expo-file-system';
import type { BackgroundRemover } from '../../domain/services/BackgroundRemover';

const HEALTH_TIMEOUT_MS = 1500;
const REMOVE_TIMEOUT_MS = 60000;

function cacheFile(prefix: string, extension: string): File {
  return new File(Paths.cache, `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${extension}`);
}

/** Corre un pedido con tiempo máximo: al vencer, cancela lo que use la señal. */
async function withTimeout<T>(ms: number, run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

interface LocalPhoto {
  file: File;
  temporary: boolean; // copia hecha solo para este envío: se borra al terminar
}

/** Deja la foto en un archivo file:// legible, que es lo único que se puede adjuntar al envío. */
async function prepareLocalPhoto(imageUri: string, signal: AbortSignal): Promise<LocalPhoto> {
  // Una prenda ya guardada en la nube tiene una dirección https: primero se baja al teléfono.
  if (/^https?:/i.test(imageUri)) {
    return { file: await File.downloadFileAsync(imageUri, cacheFile('original', 'jpg'), { signal }), temporary: true };
  }
  const source = new File(imageUri);
  if (/^file:/i.test(imageUri)) {
    if (!source.exists) throw new Error('El archivo de la foto no existe');
    return { file: source, temporary: false };
  }
  // ph://, content:// u otra dirección que no es un archivo común: se trabaja con una copia en la cache.
  const copy = cacheFile('original', 'jpg');
  await source.copy(copy);
  return { file: copy, temporary: true };
}

/**
 * Recorte con el servidor local de tools/rembg-server. Vale para todas las plataformas.
 * En la web el servidor no habilita CORS, así que /health falla, isAvailable() da false y no se ofrece el recorte.
 */
export function createBackgroundRemover(serverUrl: string): BackgroundRemover {
  return {
    async isAvailable() {
      if (serverUrl === '') return false;
      try {
        return await withTimeout(HEALTH_TIMEOUT_MS, async (signal) => (await fetch(`${serverUrl}/health`, { signal })).ok);
      } catch {
        return false;
      }
    },

    async remove(imageUri) {
      if (serverUrl === '') throw new Error('El servidor de recorte no está configurado.');

      return withTimeout(REMOVE_TIMEOUT_MS, async (signal) => {
        let phase = 'preparar foto';
        let photo: LocalPhoto | null = null;
        try {
          photo = await prepareLocalPhoto(imageUri, signal);

          phase = 'enviar';
          const form = new FormData();
          // El fetch global de Expo (expo/fetch) lee los bytes del File y arma solo el Content-Type con el boundary.
          form.append('file', photo.file);
          const response = await fetch(`${serverUrl}/remove`, { method: 'POST', body: form, signal });
          if (!response.ok) throw new Error(`El servidor respondió ${response.status}`);

          phase = 'leer respuesta';
          const bytes = new Uint8Array(await response.arrayBuffer());
          if (bytes.length === 0) throw new Error('El servidor respondió vacío');

          phase = 'guardar';
          const output = cacheFile('sin-fondo', 'png');
          output.create({ overwrite: true });
          await output.write(bytes);
          return { uri: output.uri };
        } catch (error) {
          console.warn(`[recorte] falló en la fase "${phase}":`, error instanceof Error ? error.message : error);
          // expo/fetch no siempre conserva el nombre AbortError: el tiempo agotado se reconoce por la señal.
          if (signal.aborted) throw new Error('El servidor de recorte tardó demasiado en responder.');
          if (phase === 'preparar foto') throw new Error('No pudimos leer la foto para quitarle el fondo.');
          if (phase === 'guardar') throw new Error('No pudimos guardar la foto sin fondo.');
          throw new Error('No pudimos conectarnos con el servidor de recorte. Revisá que esté encendido y en tu misma red.');
        } finally {
          if (photo?.temporary && photo.file.exists) photo.file.delete();
        }
      });
    },
  };
}
