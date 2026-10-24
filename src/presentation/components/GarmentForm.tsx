import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GarmentCategory } from '../../domain/entities/Garment';
import type { Season } from '../../domain/entities/Season';
import type { GarmentTypeDetection } from '../../domain/services/CategoryDetector';
import { GARMENT_COLORS, type GarmentColor } from '../../domain/services/garmentColors';
import { useCategoryDetection } from '../hooks/useCategoryDetection';
import { useColorDetection } from '../hooks/useColorDetection';
import { usePhotoPicker, type PhotoSource } from '../hooks/usePhotoPicker';
import { SEASON_UI } from '../seasonUi';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';
import { ColorPicker } from './ColorPicker';
import { FormGroup, TextRow } from './FormGroup';
import { SeasonPicker } from './SeasonPicker';
import { SegmentedControl } from './SegmentedControl';

const MAX_CONTENT_WIDTH = 480;

const CATEGORY_OPTIONS: { value: GarmentCategory; label: string }[] = [
  { value: 'arriba', label: 'Arriba' },
  { value: 'abajo', label: 'Abajo' },
  { value: 'calzado', label: 'Calzado' },
];

function categoryLabel(value: GarmentCategory): string {
  return CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function seasonsLabel(values: readonly Season[]): string {
  return values.map((season) => SEASON_UI[season].label).join(', ');
}

const sameSeasons = (a: readonly Season[], b: readonly Season[]) => a.join(',') === b.join(',');

/** De dónde salen las épocas sugeridas: el largo de manga, o el tipo de prenda si no tiene mangas. */
function seasonsSource(detection: GarmentTypeDetection): string {
  return detection.sleeve ? `manga ${detection.sleeve}` : detection.type.toLowerCase();
}

export interface GarmentFormValues {
  name: string;
  category: GarmentCategory;
  seasons: Season[];
  color: GarmentColor;
  newPhotoUri: string | null; // null = no se eligió una foto nueva
}

export interface GarmentFormInitial {
  name: string;
  category: GarmentCategory;
  colorHex: string;
  colorName: string;
  seasons: Season[];
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
  const { detect, detecting } = useColorDetection();
  const { detect: detectType, analyzing: analyzingType } = useCategoryDetection();

  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<GarmentCategory>(initial?.category ?? 'arriba');
  const [seasons, setSeasons] = useState<Season[]>(initial?.seasons ?? []);
  const [color, setColor] = useState<GarmentColor | null>(
    initial ? { name: initial.colorName, hex: initial.colorHex } : null,
  );
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);
  const [detected, setDetected] = useState<GarmentColor | null>(null);
  const [detectedType, setDetectedType] = useState<GarmentTypeDetection | null>(null);
  // Si la persona ya eligió una categoría a mano (o está editando una prenda), la detección no se la pisa.
  const categoryTouched = useRef(Boolean(initial));
  const seasonsTouched = useRef(Boolean(initial)); // lo mismo con las épocas
  const latestRequest = useRef(0); // para ignorar resultados de una foto anterior

  // Los colores que no están en la lista (el de la prenda guardada y el detectado en la foto) van primero.
  const colorOptions = useMemo<readonly GarmentColor[]>(() => {
    const isKnown = (hex: string) => GARMENT_COLORS.some((option) => option.hex.toLowerCase() === hex.toLowerCase());
    const extras: GarmentColor[] = [];
    if (initial && !isKnown(initial.colorHex)) extras.push({ name: initial.colorName, hex: initial.colorHex });
    if (detected && !isKnown(detected.hex) && !extras.some((extra) => extra.hex.toLowerCase() === detected.hex.toLowerCase())) {
      extras.push(detected);
    }
    return [...extras, ...GARMENT_COLORS];
  }, [initial, detected]);

  const shownPhoto = newPhotoUri ?? initial?.imageUri ?? null;
  const canSave = name.trim() !== '' && seasons.length > 0 && color !== null && !submitting;
  const missing = [
    name.trim() === '' ? 'un nombre' : null,
    seasons.length === 0 ? 'al menos una época' : null,
    color === null ? 'un color' : null,
  ].filter((item): item is string => item !== null);
  const shownError = error ?? pickerError;
  const analyzing = detecting || analyzingType;

  const chooseCategory = (value: GarmentCategory) => {
    categoryTouched.current = true;
    setCategory(value);
  };

  const chooseSeasons = (value: Season[]) => {
    seasonsTouched.current = true;
    setSeasons(value);
  };

  const choosePhoto = async (source: PhotoSource) => {
    const uri = await pick(source);
    if (!uri) return;
    const requestId = ++latestRequest.current;
    setNewPhotoUri(uri);
    setDetected(null);
    setDetectedType(null);

    // El color y el tipo de prenda se analizan a la vez.
    const [foundColor, foundType] = await Promise.all([detect(uri), detectType(uri)]);
    if (requestId !== latestRequest.current) return; // mientras tanto eligió otra foto

    setDetected(foundColor);
    if (foundColor) setColor((current) => current ?? foundColor); // si todavía no hay color elegido, se propone el detectado
    setDetectedType(foundType);
    if (foundType) {
      if (!categoryTouched.current) setCategory(foundType.category);
      setName((current) => (current.trim() === '' ? foundType.type : current)); // solo si el nombre está vacío
    }

    // Las épocas deducidas de la foto (largo de manga y tipo de prenda) se aplican solo si la persona no las eligió a mano.
    const deducedSeasons = foundType?.seasons ?? null;
    const applySeasons = deducedSeasons !== null && !seasonsTouched.current;
    if (applySeasons) setSeasons(deducedSeasons);
    if (__DEV__) {
      const reason = deducedSeasons ? 'ya se habían elegido a mano' : 'no se pudo deducir de la foto';
      console.log(
        '[detección de prenda] temporada final:',
        applySeasons ? seasonsLabel(deducedSeasons) : `${seasonsLabel(seasons) || '(ninguna)'} (sin cambios: ${reason})`,
      );
    }
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
            <Text style={styles.photoSubHint}>Recortala ajustada a la prenda · es opcional</Text>
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

      {analyzing ? (
        <View style={styles.analyzing} accessibilityLiveRegion="polite">
          <ActivityIndicator size="small" color={colors.link} />
          <Text style={styles.analyzingText}>Analizando prenda…</Text>
        </View>
      ) : null}

      <FormGroup>
        <TextRow label="Nombre" value={name} onChangeText={setName} maxLength={40} placeholder="Ej: Remera negra" />
      </FormGroup>

      <Text style={styles.groupLabel} accessibilityRole="header">
        Categoría
      </Text>
      <View style={styles.section}>
        <SegmentedControl options={CATEGORY_OPTIONS} value={category} onChange={chooseCategory} />
        {!analyzing && detectedType && detectedType.category === category ? (
          <Text style={styles.detectHint}>Detectado de la foto: {detectedType.type}</Text>
        ) : null}
        {!analyzing && detectedType && detectedType.category !== category ? (
          <View style={styles.suggestion}>
            <Text style={styles.suggestionText}>
              Parece ser: {detectedType.type} ({categoryLabel(detectedType.category)})
            </Text>
            <Pressable onPress={() => chooseCategory(detectedType.category)} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.suggestionAction}>Usar</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <Text style={styles.groupLabel} accessibilityRole="header">
        Clima
      </Text>
      <View style={styles.section}>
        <SeasonPicker value={seasons} onChange={chooseSeasons} />
        {!analyzing && detectedType?.seasons && sameSeasons(detectedType.seasons, seasons) ? (
          <Text style={styles.detectHint}>Deducido de la foto: {seasonsSource(detectedType)}</Text>
        ) : null}
        {!analyzing && detectedType?.seasons && !sameSeasons(detectedType.seasons, seasons) ? (
          <View style={styles.suggestion}>
            <Text style={styles.suggestionText}>
              Por la foto ({seasonsSource(detectedType)}): {seasonsLabel(detectedType.seasons)}
            </Text>
            <Pressable onPress={() => chooseSeasons(detectedType.seasons!)} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.suggestionAction}>Usar</Text>
            </Pressable>
          </View>
        ) : null}
        <Text style={styles.seasonHint}>Elegí todas las épocas en las que la usarías.</Text>
      </View>

      <Text style={styles.groupLabel} accessibilityRole="header">
        Color
      </Text>
      <View style={styles.colorCard}>
        <ColorPicker options={colorOptions} selectedHex={color?.hex ?? null} onSelect={setColor} />
        <Text style={styles.colorName}>{color ? `Color: ${color.name}` : 'Elegí el color de la prenda'}</Text>
        {!detecting && detected && color?.hex === detected.hex ? (
          <Text style={styles.detectHint}>Color detectado de la foto</Text>
        ) : null}
        {!detecting && detected && color?.hex !== detected.hex ? (
          <View style={styles.suggestion}>
            <View style={[styles.suggestionDot, { backgroundColor: detected.hex }]} />
            <Text style={styles.suggestionText}>Detectamos {detected.name} en la foto</Text>
            <Pressable onPress={() => setColor(detected)} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.suggestionAction}>Usar</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {shownError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {shownError}
        </Text>
      ) : null}
      <Pressable
        onPress={() => color && onSubmit({ name, category, seasons, color, newPhotoUri })}
        disabled={!canSave}
        accessibilityRole="button"
        style={[styles.save, !canSave && styles.saveDisabled]}
      >
        <Text style={styles.saveLabel}>{submitting ? busyLabel : submitLabel}</Text>
      </Pressable>
      {!canSave && !submitting ? <Text style={styles.saveHint}>Para guardar, falta: {missing.join(', ')}.</Text> : null}

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
  photoSubHint: { fontSize: 13, color: colors.textMuted, marginTop: 2, paddingHorizontal: 16, textAlign: 'center' },
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
  seasonHint: { fontSize: 13, color: colors.textMuted, marginTop: 6, paddingHorizontal: 4 },
  colorCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 20 },
  colorName: { fontSize: 14, color: colors.textMuted, marginTop: 10, paddingHorizontal: 4 },
  analyzing: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, paddingHorizontal: 4 },
  analyzingText: { fontSize: 14, color: colors.textMuted },
  detectHint: { fontSize: 13, color: colors.textMuted, marginTop: 6, paddingHorizontal: 4 },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingHorizontal: 4 },
  suggestionDot: { width: 16, height: 16, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.swatchBorder },
  suggestionText: { flex: 1, fontSize: 14, color: colors.text },
  suggestionAction: { fontSize: 15, fontWeight: '600', color: colors.link },
  error: { fontSize: 14, color: colors.danger, marginBottom: 8 },
  save: { height: 50, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveDisabled: { opacity: 0.4 },
  saveLabel: { fontSize: 17, fontWeight: '600', color: colors.onPrimary },
  saveHint: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 10 },
}));