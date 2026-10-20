import { useRouter } from 'expo-router';
import { useState } from 'react';
import { container } from '../../core/di/container';
import { GarmentForm, type GarmentFormValues } from '../components/GarmentForm';
import { notifyDataChanged } from '../state/dataVersion';

export function AddGarmentScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: GarmentFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await container.addGarmentWithPhoto.execute({
        name: values.name,
        category: values.category,
        colorHex: values.color.hex,
        colorName: values.color.name,
        photoUri: values.newPhotoUri,
      });
      notifyDataChanged(); // avisa a Placard, Outfits, Inspiración y Perfil que hay una prenda nueva
      router.back();
    } catch {
      setError('No pudimos guardar la prenda. Probá de nuevo.');
      setSubmitting(false);
    }
  };

  return (
    <GarmentForm
      title="Nueva prenda"
      submitLabel="Guardar prenda"
      submitting={submitting}
      error={error}
      onSubmit={onSubmit}
      onCancel={() => router.back()}
    />
  );
}