import {
  DetectionUnavailableError,
  type CategoryDetector,
  type DetectionHooks,
  type DetectionResult,
} from '../services/CategoryDetector';

/**
 * Pausa mínima entre el final de un análisis y el comienzo del siguiente. Si se cargan varias prendas seguidas,
 * los análisis van de a uno (nunca en paralelo) y con este respiro, para no saturar la cuota de la IA.
 */
export const MIN_PAUSE_BETWEEN_ANALYSES_MS = 4_000;

export interface DetectGarmentCategoryOptions {
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  minPauseMs?: number;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class DetectGarmentCategory {
  private queue: Promise<unknown> = Promise.resolve();
  private lastFinishedAt = Number.NEGATIVE_INFINITY;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly now: () => number;
  private readonly minPauseMs: number;

  constructor(
    private readonly detector: CategoryDetector,
    options: DetectGarmentCategoryOptions = {},
  ) {
    this.sleep = options.sleep ?? defaultSleep;
    this.now = options.now ?? Date.now;
    this.minPauseMs = options.minPauseMs ?? MIN_PAUSE_BETWEEN_ANALYSES_MS;
  }

  /**
   * La detección es una ayuda opcional: nunca lanza. Devuelve la prenda (o null si no es una prenda que la app maneje),
   * o por qué no se pudo analizar, para que la pantalla lo explique y ofrezca reintentar.
   * Los pedidos se encolan: uno por vez, con MIN_PAUSE_BETWEEN_ANALYSES_MS entre uno y otro.
   */
  execute(photoUri: string, hooks?: DetectionHooks): Promise<DetectionResult> {
    const run = this.queue.then(async () => {
      const wait = this.lastFinishedAt + this.minPauseMs - this.now();
      if (wait > 0) await this.sleep(wait);
      try {
        return await this.analyze(photoUri, hooks);
      } finally {
        this.lastFinishedAt = this.now();
      }
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async analyze(photoUri: string, hooks?: DetectionHooks): Promise<DetectionResult> {
    try {
      return { status: 'ok', detection: await this.detector.detect(photoUri, hooks) };
    } catch (error) {
      return { status: error instanceof DetectionUnavailableError ? error.reason : 'failed' };
    }
  }
}
