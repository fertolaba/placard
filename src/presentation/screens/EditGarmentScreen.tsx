import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { container } from '../../core/di/container';
import { GarmentForm, type GarmentFormValues } from '../components/GarmentForm';
import { StateMessage } from '../components/StateMessage';
import { useGarment } from '../hooks/useGarment';
import { notifyDataChanged } from '../state/dataVersion';
import { makeStyles } from '../theme/makeStyles';
import { confirmDestructive } from '../utils/confirm';

export function EditGarmentScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { garment, status } = useGarment(id);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: GarmentFormValues) => {
    if (!garment) return;
    setSubmitting(true);
    setError(null);
    try {
      await container.updateGarment.execute({
        id: garment.id,
        name: values.name,
        category: values.category,
        colorHex: values.color.hex,
        colorName: values.color.name,
        seasons: values.seasons,
        newPhotoUri: values.newPhotoUri,
      });
      notifyDataChanged();
      router.back();
    } catch {
      setError('No pudimos guardar los cambios. Probá de nuevo.');
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!garment) return;
    const confirmed = await confirmDestructive(
      '¿Borrar esta prenda?',
      'Se borra también su foto y no se puede deshacer.',
      'Borrar',
    );
    if (!confirmed) return;
    setSubmitting(true);
    setDeleting(true);
    setError(null);
    try {
      await container.deleteGarment.execute(garment.id);
      notifyDataChanged();
      router.back();
    } catch {
      setError('No pudimos borrar la prenda. Probá de nuevo.');
      setSubmitting(false);
      setDeleting(false);
    }
  };

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (status !== 'ready' || !garment) {
    return (
      <View style={styles.center}>
        <StateMessage
          title={status === 'notFound' ? 'Esta prenda ya no existe' : 'No pudimos cargar la prenda'}
          detail={status === 'notFound' ? 'Puede que ya la hayas borrado.' : 'Probá de nuevo en unos segundos.'}
          actionLabel="Volver"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  return (
    <GarmentForm
      key={garment.id}
      title="Editar prenda"
      submitLabel="Guardar cambios"
      busyLabel={deleting ? 'Borrando…' : 'Guardando…'}
      initial={{
        name: garment.name,
        category: garment.category,
        colorHex: garment.colorHex,
        colorName: garment.colorName,
        seasons: garment.seasons,
        imageUri: garment.imageUri,
      }}
      submitting={submitting}
      error={error}
      onSubmit={onSubmit}
      onCancel={() => router.back()}
    >
      <Pressable onPress={onDelete} disabled={submitting} accessibilityRole="button" style={styles.delete}>
        <Text style={styles.deleteLabel}>Borrar prenda</Text>
      </Pressable>
    </GarmentForm>
  );
}

const useStyles = makeStyles((colors) => ({
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  delete: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  deleteLabel: { fontSize: 17, fontWeight: '600', color: colors.danger },
}));