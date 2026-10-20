import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GarmentCategory } from '../../domain/entities/Garment';
import { GARMENT_COLORS, type GarmentColor } from '../../domain/services/garmentColors';
import { usePhotoPicker, type PhotoSource } from '../hooks/usePhotoPicker';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';
import { ColorPicker } from './ColorPicker';
import { FormGroup, TextRow } from './FormGroup';
import { SegmentedControl } from './SegmentedControl';

const MAX_CONTENT_WIDTH = 480;

const CATEGORY_OPTIONS: { value: GarmentCategory; label: string }[] = [
  { value: 'arriba', label: 'Arriba' },
  { value: 'abajo', label: 'Abajo' },
  { value: 'calzado', label: 'Calzado' },
];

export interface GarmentFormValues {
  name: string;
  category: GarmentCategory;
  color: GarmentColor;
  newPhotoUri: string | null; // null = no se eligió una foto nueva
}

export interface GarmentFormInitial {
  name: string;
  category: GarmentCategory;
  colorHex: string;
  colorName: string;
  imageUri: string | null;
}

interface Props {
  title: string;
  submitLabel: string;
  busyLabel?: string;
  initial?: GarmentFormInitial;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: GarmentFormValues) => void;
  onCancel: () => void;
  children?: ReactNode; // acciones extra al final (por ejemplo, "Borrar prenda")
}

/** Formulario que comparten "Nueva prenda" y "Editar prenda". */
export function GarmentForm({
  title,
  submitLabel,
  busyLabel = 'Guardando…',
  initial,
  submitting,
  error,
  onSubmit,
  onCancel,
  children,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { pick, error: pickerError } = usePhotoPicker();

  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<GarmentCategory>(initial?.category ?? 'arriba');
  const [color, setColor] = useState<GarmentColor | null>(
    initial ? { name: initial.colorName, hex: initial.colorHex } : null,
  );
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);

  // Si el color de la prenda no está en la paleta, se agrega como primera opción para no perderlo.
  const colorOptions = useMemo<readonly GarmentColor[]>(() => {
    if (!initial) return GARMENT_COLORS;
    const known = GARMENT_COLORS.some((option) => option.hex.toLowerCase() === initial.colorHex.toLowerCase());
    return known ? GARMENT_COLORS : [{ name: initial.colorName, hex: initial.colorHex }, ...GARMENT_COLORS];
  }, [initial]);

  const shownPhoto = newPhotoUri ?? initial?.imageUri ?? null;
  const canSave = name.trim() !== '' && color !== null && !submitting;
  const shownError = error ?? pickerError;

  const choosePhoto = async (source: PhotoSource) => {
    const uri = await pick(source);
    if (uri) setNewPhotoUri(uri);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) }]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.topBar}>
        <Pressable onPress={onCancel} accessibilityRole="button" hitSlop={8} style={styles.sideSlot}>
          <Text style={styles.cancel}>Cancelar</Text>
        </Pressable>
        <Text style={styles.topTitle} accessibilityRole="header">
          {title}
        </Text>
        <View style={styles.sideSlot} />
      </View>

      <View style={styles.photoBox}>
        {shownPhoto ? (
          <Image source={{ uri: shownPhoto }} style={styles.photo} resizeMode="cover" accessibilityLabel="Foto de la prenda" />
        ) : (
          <>
            <Ionicons name="shirt-outline" size={44} color={colors.textMuted} />
            <Text style={styles.photoHint}>Sacá una foto de la prenda</Text>
            <Text style={styles.photoSubHint}>La foto es opcional</Text>
          </>
        )}
      </View>
      <View style={styles.photoActions}>
        <Pressable onPress={() => choosePhoto('camera')} accessibilityRole="button" style={styles.photoButton}>
          <Ionicons name="camera-outline" size={20} color={colors.link} />
          <Text style={styles.photoButtonLabel}>Cámara</Text>
        </Pressable>
        <Pressable onPress={() => choosePhoto('library')} accessibilityRole="button" style={styles.photoButton}>
          <Ionicons name="images-outline" size={20} color={colors.link} />
          <Text style={styles.photoButtonLabel}>Galería</Text>
        </Pressable>
      </View>

      <FormGroup>
        <TextRow label="Nombre" value={name} onChangeText={setName} maxLength={40} placeholder="Ej: Remera negra" />
      </FormGroup>

      <Text style={styles.groupLabel} accessibilityRole="header">
        Categoría
      </Text>
      <View style={styles.section}>
        <SegmentedControl options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
      </View>

      <Text style={styles.groupLabel} accessibilityRole="header">
        Color
      </Text>
      <View style={styles.colorCard}>
        <ColorPicker options={colorOptions} selectedHex={color?.hex ?? null} onSelect={setColor} />
        <Text style={styles.colorName}>{color ? `Color: ${color.name}` : 'Elegí el color de la prenda'}</Text>
      </View>

      {shownError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {shownError}
        </Text>
      ) : null}
      <Pressable
        onPress={() => color && onSubmit({ name, category, color, newPhotoUri })}
        disabled={!canSave}
        accessibilityRole="button"
        style={[styles.save, !canSave && styles.saveDisabled]}
      >
        <Text style={styles.saveLabel}>{submitting ? busyLabel : submitLabel}</Text>
      </Pressable>
      {!canSave && !submitting ? <Text style={styles.saveHint}>Poné un nombre y elegí un color para guardar.</Text> : null}

      {children}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  sideSlot: { minWidth: 80 },
  cancel: { fontSize: 17, color: colors.link },
  topTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  photoBox: {
    aspectRatio: 1,
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: '100%', height: '100%' },
  photoHint: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 10 },
  photoSubHint: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  photoActions: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 20 },
  photoButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoButtonLabel: { fontSize: 16, fontWeight: '600', color: colors.link },
  groupLabel: { fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 6, paddingHorizontal: 16 },
  section: { marginBottom: 20 },
  colorCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 20 },
  colorName: { fontSize: 14, color: colors.textMuted, marginTop: 10, paddingHorizontal: 4 },
  error: { fontSize: 14, color: colors.danger, marginBottom: 8 },
  save: { height: 50, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveDisabled: { opacity: 0.4 },
  saveLabel: { fontSize: 17, fontWeight: '600', color: colors.onPrimary },
  saveHint: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 10 },
}));