import { DetectGarmentCategory } from '../../domain/usecases/DetectGarmentCategory';
import { analysisProblemOf, ANALYZING_RETRY_LABEL, analyzingLabel } from '../../presentation/components/garmentAnalysisStatus';
import { createGeminiCategoryDetector } from './createGeminiCategoryDetector';
import { GEMINI_MODEL, GeminiApiError, RETRY_DELAYS_MS } from './detectGarmentCategory';

const ANALYSIS = {
  esPrenda: true,
  tipo: 'Remera',
  categoria: 'arriba',
  manga: 'corta',
  temporadas: ['verano'],
  corte: 'regular',
  calzado_tipo: 'no_aplica',
  es_deportiva: false,
  es_clasica: false,
  estampado: 'liso',
  formalidad: 'casual',
  color_dominante: 'Negro',
  colores_secundarios: [],
};

const HIGH_DEMAND = {
  error: {
    code: 503,
    status: 'UNAVAILABLE',
    message: 'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
  },
};

type Reply = { status: number; body: unknown } | 'network';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    json: async () => body,
  } as unknown as Response;
}

const success = (): Reply => ({ status: 200, body: { candidates: [{ content: { parts: [{ text: JSON.stringify(ANALYSIS) }] } }] } });
const saturated = (): Reply => ({ status: 503, body: HIGH_DEMAND });

/** fetch falso: responde según el modelo pedido y anota cada llamada. */
function fakeFetch(replies: Record<string, Reply[]>) {
  const calls: string[] = [];
  const impl = jest.fn(async (url: string) => {
    const model = /models\/([^:]+):generateContent/.exec(url)![1];
    calls.push(model);
    const reply = replies[model]?.shift() ?? saturated();
    if (reply === 'network') throw new TypeError('Network request failed');
    return jsonResponse(reply.status, reply.body);
  });
  return { impl: impl as unknown as typeof fetch, calls };
}

function makeDetector(replies: Record<string, Reply[]>, config: { model?: string; fallbackModel?: string } = {}) {
  const { impl, calls } = fakeFetch(replies);
  const waits: number[] = [];
  const detector = createGeminiCategoryDetector({ apiKey: 'clave-de-prueba', ...config }, async () => ({ base64: 'AAAA', mimeType: 'image/jpeg' }), {
    fetchImpl: impl,
    sleep: async (ms) => {
      waits.push(ms);
    },
  });
  // Sin pausa real entre análisis: las pruebas no esperan.
  const useCase = new DetectGarmentCategory(detector, { sleep: async () => {}, minPauseMs: 0 });
  return { useCase, calls, waits };
}

let logSpy: jest.SpyInstance;
let warnSpy: jest.SpyInstance;
beforeEach(() => {
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  logSpy.mockRestore();
  warnSpy.mockRestore();
});

const logged = () => logSpy.mock.calls.map((args) => args.join(' '));

describe('detección de prenda con Gemini saturado', () => {
  it('503 "high demand" y después éxito: reintenta y completa la prenda', async () => {
    const { useCase, calls, waits } = makeDetector({ [GEMINI_MODEL]: [saturated(), success()] });
    const onRetry = jest.fn();
    const result = await useCase.execute('foto.jpg', { onRetry });

    expect(result.status).toBe('ok');
    expect(result.status === 'ok' && result.detection?.type).toBe('Remera');
    expect(result.status === 'ok' && result.detection?.formalidad).toBe('casual');
    expect(calls).toEqual([GEMINI_MODEL, GEMINI_MODEL]);
    expect(waits).toEqual([RETRY_DELAYS_MS[0]]);
    expect(onRetry).toHaveBeenCalledTimes(1); // la pantalla muestra "reintentando"
    expect(analysisProblemOf(result)).toBeNull();
    expect(logged()).toContain(`[detección de prenda] respondió el modelo ${GEMINI_MODEL}`);
  });

  it('espera 2 s, 5 s y 10 s, y respeta un retryDelay más largo de la respuesta', async () => {
    const withDelay: Reply = { status: 429, body: { error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'Quota', details: [{ retryDelay: '7s' }] } } };
    const { useCase, waits } = makeDetector({ [GEMINI_MODEL]: [withDelay, saturated(), 'network', success()] });
    const result = await useCase.execute('foto.jpg');
    expect(result.status).toBe('ok');
    expect(waits).toEqual([7_000, 5_000, 10_000]);
  });

  it('503 persistente en el principal y éxito en el alternativo: completa y loguea el alternativo', async () => {
    const { useCase, calls } = makeDetector(
      { [GEMINI_MODEL]: [saturated(), saturated(), saturated(), saturated()], 'gemini-alternativo': [success()] },
      { fallbackModel: 'gemini-alternativo' },
    );
    const result = await useCase.execute('foto.jpg');

    expect(result.status === 'ok' && result.detection?.type).toBe('Remera');
    expect(calls).toEqual([GEMINI_MODEL, GEMINI_MODEL, GEMINI_MODEL, GEMINI_MODEL, 'gemini-alternativo']);
    expect(logged()).toContain('[detección de prenda] respondió el modelo gemini-alternativo (alternativo)');
  });

  it('usa el modelo configurado como principal', async () => {
    const { useCase, calls } = makeDetector({ 'otro-modelo': [success()] }, { model: 'otro-modelo' });
    expect((await useCase.execute('foto.jpg')).status).toBe('ok');
    expect(calls).toEqual(['otro-modelo']);
  });

  it('falla todo: devuelve "saturated" con mensaje y botón Reintentar, sin lanzar', async () => {
    const { useCase, calls } = makeDetector({}, { fallbackModel: 'gemini-alternativo' });
    const result = await useCase.execute('foto.jpg');

    expect(result).toEqual({ status: 'saturated' });
    expect(calls).toHaveLength(RETRY_DELAYS_MS.length + 2); // 1 + 3 reintentos + 1 alternativo
    const problem = analysisProblemOf(result);
    expect(problem?.message).toBe('La IA está saturada en este momento. Tocá Reintentar en un minuto o completá los datos a mano.');
    expect(problem?.actionLabel).toBe('Reintentar análisis');
  });

  it('una clave inválida no se reintenta y no se informa como saturación', async () => {
    const { useCase, calls } = makeDetector({ [GEMINI_MODEL]: [{ status: 400, body: { error: { code: 400, status: 'INVALID_ARGUMENT', message: 'API key not valid' } } }] });
    const result = await useCase.execute('foto.jpg');
    expect(result).toEqual({ status: 'failed' });
    expect(calls).toHaveLength(1);
    expect(analysisProblemOf(result)?.actionLabel).toBe('Reintentar análisis');
  });

  it('el texto mientras reintenta', () => {
    expect(analyzingLabel(true)).toBe(ANALYZING_RETRY_LABEL);
    expect(ANALYZING_RETRY_LABEL).toBe('Analizando… (la IA está con mucha demanda, reintentando)');
  });

  it('reconoce la saturación por el texto aunque el código sea otro', () => {
    expect(new GeminiApiError(500, 'The model is overloaded.').saturated).toBe(true);
    expect(new GeminiApiError(0, 'No se pudo conectar con Gemini.', { network: true }).retriable).toBe(true);
    expect(new GeminiApiError(403, 'Permission denied').retriable).toBe(false);
  });
});

describe('fila de análisis', () => {
  it('analiza de a una prenda, con la pausa mínima entre una y otra', async () => {
    let clock = 0;
    const events: string[] = [];
    const detector = {
      detect: jest.fn(async (uri: string) => {
        events.push(`empieza ${uri} en ${clock}`);
        await Promise.resolve();
        clock += 1_000; // cada análisis tarda 1 s
        events.push(`termina ${uri} en ${clock}`);
        return null;
      }),
    };
    const useCase = new DetectGarmentCategory(detector, {
      now: () => clock,
      sleep: async (ms) => {
        events.push(`espera ${ms}`);
        clock += ms;
      },
      minPauseMs: 4_000,
    });

    await Promise.all([useCase.execute('a'), useCase.execute('b'), useCase.execute('c')]);
    expect(events).toEqual([
      'empieza a en 0',
      'termina a en 1000',
      'espera 4000',
      'empieza b en 5000',
      'termina b en 6000',
      'espera 4000',
      'empieza c en 10000',
      'termina c en 11000',
    ]);
  });

  it('un análisis que falla no traba la fila', async () => {
    const detector = {
      detect: jest.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(null),
    };
    const useCase = new DetectGarmentCategory(detector, { sleep: async () => {}, minPauseMs: 0 });
    expect(await useCase.execute('a')).toEqual({ status: 'failed' });
    expect(await useCase.execute('b')).toEqual({ status: 'ok', detection: null });
  });
});
