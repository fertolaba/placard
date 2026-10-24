import type { GarmentTypeDetection } from '../../domain/services/CategoryDetector';
import { parseGarmentAnalysis } from '../../domain/services/garmentAnalysis';

/** La foto en base64 (sin el prefijo "data:…;base64,") y su formato. */
export interface GeminiImage {
  base64: string;
  mimeType: string;
}

export interface GeminiOptions {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

// gemini-1.5-flash ya fue dado de baja por Google. Flash-Lite es el modelo más rápido y barato, y alcanza para esto.
export const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_TIMEOUT_MS = 15_000;

const PROMPT = `Mirá la foto y decí qué prenda es. Usá nombres comunes en Argentina (Remera, Musculosa, Camisa, Chomba, Buzo, Sweater, Campera, Abrigo, Jean, Pantalón, Jogger, Short, Bermuda, Pollera, Calza, Zapatillas, Botas, Sandalias, Ojotas, Zapatos).
- categoria: "arriba" (remeras, camisas, buzos, camperas), "abajo" (pantalones, shorts, polleras) o "calzado".
- esPrenda: false si la foto no muestra una sola prenda de esas categorías (por ejemplo un vestido, un accesorio, o algo que no es ropa).
- manga: "larga" o "corta" para prendas de arriba (sin mangas cuenta como "corta"); "no_aplica" para abajo y calzado.
- temporadas: en qué épocas se usa, según el largo de manga y el tipo de prenda. Manga larga: ["entretiempo", "invierno"]. Manga corta o sin mangas: ["verano"]. Abrigos gruesos y botas: ["invierno"]. Sandalias y ojotas: ["verano"]. Prendas que sirven todo el año (por ejemplo, zapatillas): las tres.
- Ropa de abajo: pantalones largos y jeans (también joggers y calzas largas): ["entretiempo", "invierno"]. Shorts y bermudas: ["verano"].`;

/** Esquema de la respuesta: Gemini devuelve un JSON que lo cumple. */
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    esPrenda: { type: 'BOOLEAN' },
    tipo: { type: 'STRING' },
    categoria: { type: 'STRING', enum: ['arriba', 'abajo', 'calzado'] },
    manga: { type: 'STRING', enum: ['larga', 'corta', 'no_aplica'] },
    temporadas: { type: 'ARRAY', items: { type: 'STRING', enum: ['verano', 'entretiempo', 'invierno'] } },
  },
  required: ['esPrenda', 'tipo', 'categoria', 'manga', 'temporadas'],
  propertyOrdering: ['esPrenda', 'tipo', 'categoria', 'manga', 'temporadas'],
};

export class GeminiApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, GeminiApiError.prototype);
    this.name = 'GeminiApiError';
  }
}

interface GeminiResponse {
  error?: { code?: number; message?: string };
  promptFeedback?: { blockReason?: string };
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
}

/** Manda la foto a Gemini y devuelve el texto JSON que respondió el modelo. */
export async function fetchGeminiAnalysis(image: GeminiImage, options: GeminiOptions): Promise<string> {
  if (!options.apiKey) throw new GeminiApiError(0, 'Falta la clave de la API de Gemini.');

  const doFetch = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    // La clave va en un encabezado y no en la URL, así no queda en logs de red.
    const response = await doFetch(`${ENDPOINT}/${options.model ?? GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': options.apiKey },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: image.mimeType, data: image.base64.replace(/^data:[^;]+;base64,/, '') } },
              { text: PROMPT },
            ],
          },
        ],
        generationConfig: { responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA },
      }),
      signal: controller.signal,
    });
    const json = (await response.json().catch(() => null)) as GeminiResponse | null;
    if (!response.ok) {
      throw new GeminiApiError(response.status, json?.error?.message ?? `Gemini respondió ${response.status}.`);
    }
    if (json?.promptFeedback?.blockReason) {
      throw new GeminiApiError(0, `Gemini no analizó la foto (${json.promptFeedback.blockReason}).`);
    }
    const text = json?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    if (text === '') throw new GeminiApiError(0, 'Gemini no devolvió ninguna respuesta.');
    return text;
  } catch (error) {
    if (error instanceof GeminiApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') throw new GeminiApiError(0, 'Gemini tardó demasiado en responder.');
    throw new GeminiApiError(0, 'No se pudo conectar con Gemini.');
  } finally {
    clearTimeout(timer);
  }
}

/** Servicio principal: manda la foto a Gemini y devuelve la prenda, su categoría y en qué épocas se usa. */
export async function detectGarmentCategory(image: GeminiImage, options: GeminiOptions): Promise<GarmentTypeDetection | null> {
  const text = await fetchGeminiAnalysis(image, options);
  if (__DEV__) console.log('[detección de prenda] resultado de la IA:', text);

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new GeminiApiError(0, 'Gemini devolvió un JSON inválido.');
  }
  const detection = parseGarmentAnalysis(raw);
  if (__DEV__) {
    console.log(
      '[detección de prenda] categoría asignada:',
      detection ? `${detection.type} → ${detection.category} · manga ${detection.sleeve ?? 'no aplica'} · épocas ${detection.seasons?.join(', ') ?? 'sin deducir'}` : 'ninguna (no es una prenda que la app maneje)',
    );
  }
  return detection;
}
