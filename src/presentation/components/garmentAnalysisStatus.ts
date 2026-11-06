import type { DetectionFailure, DetectionResult } from '../../domain/services/CategoryDetector';

export const ANALYZING_LABEL = 'Analizando prenda…';
export const ANALYZING_RETRY_LABEL = 'Analizando… (la IA está con mucha demanda, reintentando)';
export const RETRY_ANALYSIS_LABEL = 'Reintentar análisis';

const FAILURE_MESSAGES: Record<DetectionFailure, string> = {
  saturated: 'La IA está saturada en este momento. Tocá Reintentar en un minuto o completá los datos a mano.',
  failed: 'No pudimos analizar la foto. Tocá Reintentar o completá los datos a mano.',
};

/** El aviso que reemplaza al análisis cuando no lo hubo; siempre con el botón "Reintentar análisis". */
export interface AnalysisProblem {
  reason: DetectionFailure;
  message: string;
  actionLabel: string;
}

/** null si hubo análisis (aunque no sea una prenda que la app maneje); si no, qué decir y qué botón mostrar. */
export function analysisProblemOf(result: DetectionResult): AnalysisProblem | null {
  if (result.status === 'ok') return null;
  return { reason: result.status, message: FAILURE_MESSAGES[result.status], actionLabel: RETRY_ANALYSIS_LABEL };
}

export function analyzingLabel(retrying: boolean): string {
  return retrying ? ANALYZING_RETRY_LABEL : ANALYZING_LABEL;
}
