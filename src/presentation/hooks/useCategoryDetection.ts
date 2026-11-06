import { useCallback, useRef, useState } from 'react';
import { env } from '../../core/config/env';
import { container } from '../../core/di/container';
import type { DetectionResult } from '../../domain/services/CategoryDetector';

/**
 * Detecta qué prenda es a partir de la foto. Si no hay clave configurada, no hace nada (ni muestra el "analizando").
 * `retrying` queda en true mientras la IA está con mucha demanda y se vuelve a intentar.
 * Los análisis van en fila (uno por vez, con una pausa entre uno y otro): eso lo maneja el caso de uso.
 */
export function useCategoryDetection() {
  const [pending, setPending] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const latest = useRef(0);

  const detect = useCallback(async (photoUri: string): Promise<DetectionResult> => {
    if (env.geminiApiKey === '') {
      if (__DEV__) console.log('[detección de prenda] desactivada: falta EXPO_PUBLIC_GEMINI_API_KEY en .env.local');
      return { status: 'ok', detection: null };
    }
    const id = ++latest.current;
    setPending((count) => count + 1);
    setRetrying(false);
    try {
      return await container.detectGarmentCategory.execute(photoUri, {
        onRetry: () => {
          if (id === latest.current) setRetrying(true);
        },
      });
    } finally {
      setPending((count) => count - 1);
      if (id === latest.current) setRetrying(false);
    }
  }, []);

  return { detect, analyzing: pending > 0, retrying };
}
