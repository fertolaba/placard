import { useCallback, useState } from 'react';
import { env } from '../../core/config/env';
import { container } from '../../core/di/container';
import type { GarmentTypeDetection } from '../../domain/services/CategoryDetector';

/** Detecta qué prenda es a partir de la foto. Si no hay clave configurada, no hace nada (ni muestra el "analizando"). */
export function useCategoryDetection() {
  const [analyzing, setAnalyzing] = useState(false);

  const detect = useCallback(async (photoUri: string): Promise<GarmentTypeDetection | null> => {
    if (env.geminiApiKey === '') {
      if (__DEV__) console.log('[detección de prenda] desactivada: falta EXPO_PUBLIC_GEMINI_API_KEY en .env.local');
      return null;
    }
    setAnalyzing(true);
    try {
      return await container.detectGarmentCategory.execute(photoUri);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return { detect, analyzing };
}