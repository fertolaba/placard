import { useCallback, useState } from 'react';
import { container } from '../../core/di/container';
import type { GarmentColor } from '../../domain/services/garmentColors';

export function useColorDetection() {
  const [detecting, setDetecting] = useState(false);

  /** Devuelve el color detectado en la foto, o null si no se pudo. */
  const detect = useCallback(async (photoUri: string): Promise<GarmentColor | null> => {
    setDetecting(true);
    try {
      return await container.detectGarmentColor.execute(photoUri);
    } finally {
      setDetecting(false);
    }
  }, []);

  return { detect, detecting };
}