import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

export type PhotoSource = 'camera' | 'library';

const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true, // deja recortar la foto en cuadrado
  aspect: [1, 1],
  quality: 0.7, // foto más liviana
};

export function usePhotoPicker() {
  const [error, setError] = useState<string | null>(null);

  /** Abre la cámara o la galería. Devuelve la dirección de la foto, o null si se canceló o falló. */
  const pick = useCallback(async (source: PhotoSource): Promise<string | null> => {
    setError(null);
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError('Necesitamos permiso para usar la cámara. Podés activarlo en los Ajustes de tu iPhone.');
          return null;
        }
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(OPTIONS)
          : await ImagePicker.launchImageLibraryAsync(OPTIONS);
      if (result.canceled) return null;
      return result.assets[0]?.uri ?? null;
    } catch {
      setError(
        source === 'camera'
          ? 'No pudimos abrir la cámara. Probá de nuevo o elegí una foto de la galería.'
          : 'No pudimos abrir la galería. Probá de nuevo.',
      );
      return null;
    }
  }, []);

  return { pick, error };
}