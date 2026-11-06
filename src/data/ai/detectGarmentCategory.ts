import { FORMALIDADES } from '../../domain/entities/Formality';
import { ALL_GARMENT_CUTS, CALZADO_TIPOS, ESTAMPADOS, GARMENT_CATEGORIES, MAX_SECONDARY_COLORS } from '../../domain/entities/Garment';
import { GARMENT_COLORS } from '../../domain/services/garmentColors';
import type { GarmentTypeDetection } from '../../domain/services/CategoryDetector';
import { parseGarmentAnalysis } from '../../domain/services/garmentAnalysis';

/** La foto en base64 (sin el prefijo "data:…;base64,") y su formato. */
export interface GeminiImage {
  base64: string;
  mimeType: string;
}

export interface GeminiOptions {
  apiKey: string;
  /** Modelo principal (vacío o sin valor = GEMINI_MODEL). */
  model?: string;
  /** Modelo alternativo: se prueba UNA vez si el principal sigue saturado después de los reintentos. */
  fallbackModel?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  /** Esperas entre reintentos del modelo principal (por defecto RETRY_DELAYS_MS). */
  retryDelaysMs?: readonly number[];
  sleep?: (ms: number) => Promise<void>;
  /** Se llama antes de cada reintento (y antes de probar el alternativo): la pantalla avisa "reintentando". */
  onRetry?: () => void;
}

// gemini-1.5-flash ya fue dado de baja por Google. Flash-Lite es el modelo más rápido y barato, y alcanza para esto.
export const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_TIMEOUT_MS = 15_000;
/** Hasta 3 reintentos con espera creciente cuando Gemini está saturado o falla la red. */
export const RETRY_DELAYS_MS: readonly number[] = [2_000, 5_000, 10_000];
/** Tope al retryDelay que pide Gemini, para que la pantalla no quede esperando minutos. */
export const MAX_RETRY_DELAY_MS = 30_000;
const LOG = '[detección de prenda]';

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const COLOR_NAMES = GARMENT_COLORS.map((color) => `"${color.name}"`).join(', ');

const PROMPT = `Mirá la foto y decí qué prenda es. Usá nombres comunes en Argentina (Remera, Musculosa, Camisa, Chomba, Buzo, Sweater, Campera, Abrigo, Top, Crop top, Corset, Body, Jean, Pantalón, Jogger, Short, Bermuda, Pollera, Minifalda, Calza, Zapatillas, Botas, Sandalias, Ojotas, Zapatos). Si es ropa deportiva o técnica (una campera tipo Nike Tech o de nylon deportivo, un buzo de entrenamiento, un conjunto deportivo), decilo en el tipo: "Campera deportiva", "Buzo deportivo".
- categoria: elegí uno de estos valores exactos.
  - "top": prenda de arriba femenina, corta o de tiras, que suele dejar ver hombros, escote o cintura: top de tiras, crop top, top strapless o bandeau, corset, corpiño deportivo usado como prenda, body, top halter.
  - "arriba": el resto de las prendas de arriba: remeras, musculosas comunes, camisas, chombas, buzos, sweaters, camperas, abrigos.
  - "pollera": falda de cualquier largo (mini, midi o larga), también la pollera-short. Se reconoce porque es una sola pieza de tela que cae desde la cintura sin separarse en dos piernas.
  - "abajo": pantalones, jeans, joggers, calzas, shorts y bermudas (todo lo que tiene dos piernas).
  - "calzado": zapatillas, zapatos, botas, sandalias, ojotas.
- esPrenda: false si la foto no muestra una sola prenda de esas categorías (por ejemplo un vestido, un accesorio, o algo que no es ropa).
- manga: "larga" o "corta" para "arriba" y "top" (sin mangas o de tiras cuenta como "corta"); "no_aplica" para "abajo", "pollera" y "calzado".
- temporadas: en qué épocas se usa, según el largo de manga y el tipo de prenda. Manga larga: ["entretiempo", "invierno"]. Manga corta o sin mangas: ["verano"]. Abrigos gruesos y botas: ["invierno"]. Sandalias y ojotas: ["verano"]. Prendas que sirven todo el año (por ejemplo, zapatillas): las tres.
- Ropa de abajo: pantalones largos y jeans (también joggers y calzas largas): ["entretiempo", "invierno"]. Shorts y bermudas: ["verano"].
- Polleras: mini o de tela liviana: ["verano"]. Midi o larga de tela liviana: ["verano", "entretiempo"]. De tela gruesa (lana, cuero, corderoy): ["entretiempo", "invierno"].
- corte: mirá la silueta de la prenda (qué tan pegada va al cuerpo, el ancho y el largo) y elegí uno de estos valores exactos.
  - Arriba: "ajustado" (pegada al cuerpo), "regular" (calce clásico, ni pegada ni suelta), "oversize" (holgada, hombros caídos, más grande que el talle), "boxy" (recta y ancha, de forma cuadrada, largo hasta la cadera), "cropped" (corta, deja ver la cintura).
  - Top: "ajustado" (pegado al cuerpo, como un corset o un body), "regular" (calce clásico), "oversize" (holgado), "cropped" (corto, deja ver la cintura).
  - Abajo: "skinny" (pegado a toda la pierna), "slim" (angosto pero no pegado), "straight" (recto desde la cadera hasta el tobillo), "baggy" (holgado, con mucha tela, suele angostarse abajo), "wide leg" (ancho desde la cadera y en toda la pierna), "flared" (acampanado, oxford o pata de elefante: ajustado hasta la rodilla y se abre recién de la rodilla para abajo).
  - Pollera: "lápiz" (angosta y pegada, se cierra hacia la rodilla), "recta" (cae derecha desde la cadera, sin abrirse), "acampanada" (se abre desde la cintura en forma de A, sin pliegues marcados), "tableada" (con tablas o pliegues planchados, como la de colegio o una plisada), "cruzada" (envolvente o wrap: una tela se cruza sobre la otra adelante).
  - Calzado: "no_aplica".
- calzado_tipo: solo para calzado; para "arriba", "top", "abajo" y "pollera" devolvé "no_aplica". Elegí por el perfil de la suela y la altura de la caña; si dudás entre "baja" y "gruesa", mirá el grosor de la suela.
  - "baja": zapatilla baja deportiva o urbana (Dunk low, Air Force 1 low, Samba, Stan Smith, zapatillas de skate bajas).
  - "gruesa": suela gruesa o plataforma (zapatillas chunky, suela notoriamente alta).
  - "alta": zapatilla de caña alta que cubre el tobillo (Jordan 1, botas de básquet, Dunk high).
  - "botita": bota o botita (Timberland, borcegos, botas tácticas o militares).
  - Mocasines y zapatos de vestir: "baja" (y es_clasica true).
- color_dominante: el color que ocupa más superficie de la prenda (no del fondo ni de la piel). Elegí el nombre más parecido de esta lista, escrito exactamente igual: ${COLOR_NAMES}.
- colores_secundarios: los colores de los detalles que se ven a simple vista (rayas, estampa, logo, escudo, cuello, puños, costuras contrastantes, suela de un calzado), de más a menos visible, como mucho ${MAX_SECONDARY_COLORS}. Mismos nombres exactos de la lista. No repitas el dominante ni pongas sombras o pliegues del mismo color. Si la prenda es lisa, devolvé [].
- es_deportiva: true SOLO para camisetas de fútbol con mangas (de un club, de una selección o retro: suelen tener escudo, sponsor o número), shorts de fútbol y botines. false para todo lo demás: musculosas y cualquier prenda sin mangas, camisetas de otros deportes (básquet/NBA, NFL, hockey, rugby, béisbol), ropa de entrenamiento o gimnasio y ropa urbana cómoda (una remera lisa, un buzo, un jogger, unas zapatillas urbanas). Ejemplos: musculosa de la NBA → false; camiseta de Boca → true; camiseta de manga corta de River → true.
- es_clasica: true para camisas, chombas o polos, sweaters o cardigans finos y lisos, blazers, pantalones de vestir o sastreros (incluidos los de pinzas y los chinos), polleras lápiz o tableadas de tela fina, mocasines y zapatos de vestir. false para remeras (lisas o estampadas), buzos y hoodies, camperas deportivas o técnicas, joggers, jeans, shorts, cualquier prenda oversize o baggy, zapatillas, botas urbanas y ropa deportiva. Si no es claramente clásica, false.
- estampado: cuánto texto, logo o dibujo tiene la prenda a la vista.
  - "liso": sin logos ni textos visibles (rayas, cuadros o costuras contrastantes cuentan como liso).
  - "logo": un logo o texto chico (por ejemplo, el swoosh de Nike o un escudo chico en el pecho).
  - "grafico": una estampa, letras o un dibujo grande y protagonista (letras grandes en el pecho o la espalda, un estampado de banda, un personaje).
- formalidad: elegí uno de estos valores exactos.
  - "clasico": sastrería, pantalón de vestir o sastrero, camisa, chomba, piloto, blazer, mocasines y zapatos de vestir.
  - "casual": remera, jean, buzo liso, sweater, campera urbana, zapatilla urbana.
  - "deportivo": jogger, pantalón o campera tech (tipo Nike Tech) o de nylon deportivo, ropa de entrenamiento, camiseta de fútbol o de básquet, botines.`;

/** Esquema de la respuesta: Gemini devuelve un JSON que lo cumple. */
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    esPrenda: { type: 'BOOLEAN' },
    tipo: { type: 'STRING' },
    categoria: { type: 'STRING', enum: [...GARMENT_CATEGORIES] },
    manga: { type: 'STRING', enum: ['larga', 'corta', 'no_aplica'] },
    temporadas: { type: 'ARRAY', items: { type: 'STRING', enum: ['verano', 'entretiempo', 'invierno'] } },
    // El esquema no puede atar el corte a la categoría: eso lo revisa parseGarmentAnalysis.
    corte: { type: 'STRING', enum: [...ALL_GARMENT_CUTS, 'no_aplica'] },
    // Tampoco puede atarlo a "calzado": parseGarmentAnalysis lo descarta en las demás categorías.
    calzado_tipo: { type: 'STRING', enum: [...CALZADO_TIPOS, 'no_aplica'] },
    es_deportiva: { type: 'BOOLEAN' },
    es_clasica: { type: 'BOOLEAN' },
    estampado: { type: 'STRING', enum: [...ESTAMPADOS] },
    formalidad: { type: 'STRING', enum: [...FORMALIDADES] },
    color_dominante: { type: 'STRING', enum: GARMENT_COLORS.map((color) => color.name) },
    colores_secundarios: {
      type: 'ARRAY',
      items: { type: 'STRING', enum: GARMENT_COLORS.map((color) => color.name) },
      maxItems: MAX_SECONDARY_COLORS,
    },
  },
  required: ['esPrenda', 'tipo', 'categoria', 'manga', 'temporadas', 'corte', 'calzado_tipo', 'es_deportiva', 'es_clasica', 'estampado', 'formalidad', 'color_dominante', 'colores_secundarios'],
  propertyOrdering: [
    'esPrenda',
    'tipo',
    'categoria',
    'manga',
    'temporadas',
    'corte',
    'calzado_tipo',
    'es_deportiva',
    'es_clasica',
    'estampado',
    'formalidad',
    'color_dominante',
    'colores_secundarios',
  ],
};

interface GeminiErrorExtra {
  /** El "status" del cuerpo del error ("UNAVAILABLE", "RESOURCE_EXHAUSTED"). */
  apiStatus?: string;
  /** Cuánto pidió Gemini esperar antes de reintentar (retryDelay o Retry-After), en milisegundos. */
  retryDelayMs?: number;
  /** No hubo respuesta: sin conexión o se pasó el tiempo de espera. */
  network?: boolean;
}

const SATURATION_PATTERN = /high demand|overloaded|UNAVAILABLE|RESOURCE_EXHAUSTED/i;

export class GeminiApiError extends Error {
  public readonly apiStatus?: string;
  public readonly retryDelayMs?: number;
  public readonly network: boolean;

  constructor(
    public readonly status: number,
    message: string,
    extra: GeminiErrorExtra = {},
  ) {
    super(message);
    Object.setPrototypeOf(this, GeminiApiError.prototype);
    this.name = 'GeminiApiError';
    this.apiStatus = extra.apiStatus;
    this.retryDelayMs = extra.retryDelayMs;
    this.network = extra.network ?? false;
  }

  /** El modelo está con mucha demanda o se acabó la cuota del momento (503, 429 o el texto que lo dice). */
  get saturated(): boolean {
    return this.status === 503 || this.status === 429 || SATURATION_PATTERN.test(`${this.apiStatus ?? ''} ${this.message}`);
  }

  /** Vale la pena volver a intentar: saturación o error de red. Una clave inválida o una foto rechazada, no. */
  get retriable(): boolean {
    return this.saturated || this.network;
  }
}

/** "12s" o "1.5s" → milisegundos; null si no se entiende. */
function parseDuration(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d+(?:\.\d+)?)s$/.exec(value.trim());
  return match ? Math.round(Number(match[1]) * 1000) : null;
}

/** El retryDelay del cuerpo (google.rpc.RetryInfo) o, si no viene, el encabezado Retry-After en segundos. */
function retryDelayOf(json: GeminiResponse | null, response: Response): number | undefined {
  for (const detail of json?.error?.details ?? []) {
    const ms = parseDuration(detail?.retryDelay);
    if (ms !== null) return ms;
  }
  const header = Number(response.headers?.get?.('retry-after'));
  return Number.isFinite(header) && header > 0 ? header * 1000 : undefined;
}

interface GeminiResponse {
  error?: { code?: number; message?: string; status?: string; details?: { retryDelay?: unknown }[] };
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
      throw new GeminiApiError(response.status, json?.error?.message ?? `Gemini respondió ${response.status}.`, {
        apiStatus: json?.error?.status,
        retryDelayMs: retryDelayOf(json, response),
      });
    }
    if (json?.promptFeedback?.blockReason) {
      throw new GeminiApiError(0, `Gemini no analizó la foto (${json.promptFeedback.blockReason}).`);
    }
    const text = json?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    if (text === '') throw new GeminiApiError(0, 'Gemini no devolvió ninguna respuesta.');
    return text;
  } catch (error) {
    if (error instanceof GeminiApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new GeminiApiError(0, 'Gemini tardó demasiado en responder.', { network: true });
    }
    throw new GeminiApiError(0, 'No se pudo conectar con Gemini.', { network: true });
  } finally {
    clearTimeout(timer);
  }
}

/** Un modelo con hasta RETRY_DELAYS_MS.length reintentos si está saturado o falla la red. */
async function fetchWithRetries(image: GeminiImage, options: GeminiOptions, model: string): Promise<string> {
  const delays = options.retryDelaysMs ?? RETRY_DELAYS_MS;
  const sleep = options.sleep ?? defaultSleep;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetchGeminiAnalysis(image, { ...options, model });
    } catch (error) {
      if (!(error instanceof GeminiApiError) || !error.retriable || attempt >= delays.length) throw error;
      // Se respeta lo que pide Gemini, pero nunca menos que la espera creciente ni más que el tope.
      const wait = Math.max(delays[attempt], Math.min(error.retryDelayMs ?? 0, MAX_RETRY_DELAY_MS));
      console.warn(`${LOG} ${model} no respondió (${error.status || 'red'}: ${error.message}). Reintento ${attempt + 1} de ${delays.length} en ${wait / 1000} s.`);
      options.onRetry?.();
      await sleep(wait);
    }
  }
}

/**
 * Pide el análisis al modelo principal con reintentos; si sigue saturado y hay un modelo alternativo, lo prueba
 * una vez con el mismo pedido. Devuelve el texto y qué modelo respondió.
 */
export async function analyzeWithFallback(image: GeminiImage, options: GeminiOptions): Promise<{ text: string; model: string }> {
  const primary = options.model || GEMINI_MODEL;
  try {
    return { text: await fetchWithRetries(image, options, primary), model: primary };
  } catch (error) {
    const fallback = options.fallbackModel;
    if (!(error instanceof GeminiApiError) || !error.saturated || !fallback || fallback === primary) throw error;
    console.warn(`${LOG} ${primary} sigue saturado después de los reintentos; pruebo con ${fallback}.`);
    options.onRetry?.();
    return { text: await fetchGeminiAnalysis(image, { ...options, model: fallback }), model: fallback };
  }
}

/** Servicio principal: manda la foto a Gemini y devuelve la prenda, su categoría y en qué épocas se usa. */
export async function detectGarmentCategory(image: GeminiImage, options: GeminiOptions): Promise<GarmentTypeDetection | null> {
  const { text, model } = await analyzeWithFallback(image, options);
  const primary = options.model || GEMINI_MODEL;
  if (__DEV__) console.log(`${LOG} respondió el modelo ${model}${model === primary ? '' : ' (alternativo)'}`);
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
      detection ? `${detection.type} → ${detection.category} · manga ${detection.sleeve ?? 'no aplica'} · épocas ${detection.seasons?.join(', ') ?? 'sin deducir'} · corte ${detection.cut ?? 'sin deducir'}${detection.calzadoTipo ? ` · calzado ${detection.calzadoTipo}` : ''}${detection.sporty ? ' · deportiva' : ''}${detection.classic ? ' · clásica' : ''}${detection.estampado ? ` · estampado ${detection.estampado}` : ''}${detection.formalidad ? ` · ${detection.formalidad}` : ''} · color ${detection.dominantColor?.name ?? 'sin deducir'}${detection.secondaryColors.length > 0 ? ` + ${detection.secondaryColors.map((color) => color.name).join(', ')}` : ''}` : 'ninguna (no es una prenda que la app maneje)',
    );
  }
  return detection;
}
