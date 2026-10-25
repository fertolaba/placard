import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GarmentCategory } from '../../domain/entities/Garment';
import type { Season } from '../../domain/entities/Season';
import type { GarmentTypeDetection } from '../../domain/services/CategoryDetector';
import { closestAllowedCategory, cutsFor } from '../../domain/services/garmentCatalog';
import { GARMENT_COLORS, type GarmentColor } from '../../domain/services/garmentColors';
import { useAuth } from '../auth/AuthProvider';
import { CATEGORY_LABELS, categoryOptionsFor } from '../categoryUi';
import { useCategoryDetection } from '../hooks/useCategoryDetection';
import { useColorDetection } from '../hooks/useColorDetection';
import { usePhotoPicker, type PhotoSource } from '../hooks/usePhotoPicker';
import { SEASON_UI } from '../seasonUi';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';
import { ColorPicker } from './ColorPicker';
import { CutPicker } from './CutPicker';
import { FormGroup, SwitchRow, TextRow } from './FormGroup';
import { SeasonPicker } from './SeasonPicker';
import { SegmentedControl } from './SegmentedControl';

const MAX_CONTENT_WIDTH = 480;

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
  corte?: string;
  sporty: boolean;
  color: GarmentColor;
  newPhotoUri: string | null; // null = no se eligió una foto nueva
}

export interface GarmentFormInitial {
  name: string;
  category: GarmentCategory;
  colorHex: string;
  colorName: string;
  seasons: Season[];
  corte?: string;
  sporty: boolean;
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
  const sex = useAuth().user?.sex ?? null;

  // Las categorías según el sexo del perfil. Al editar, la de la prenda se muestra igual aunque no corresponda.
  const allowedOptions = categoryOptionsFor(sex);
  const categoryOptions =
    initial && !allowedOptions.some((option) => option.value === initial.category)
      ? [...allowedOptions, { value: initial.category, label: CATEGORY_LABELS[initial.category] }]
      : allowedOptions;
  const isAllowedCategory = (value: GarmentCategory) => categoryOptions.some((option) => option.value === value);

  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<GarmentCategory>(initial?.category ?? categoryOptions[0].value);
  const [seasons, setSeasons] = useState<Season[]>(initial?.seasons ?? []);
  const [corte, setCorte] = useState<string | undefined>(initial?.corte);
  const [sporty, setSporty] = useState(initial?.sporty ?? false);
  const [color, setColor] = useState<GarmentColor | null>(
    initial ? { name: initial.colorName, hex: initial.colorHex } : null,
  );
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);
  const [detected, setDetected] = useState<GarmentColor | null>(null);
  const [detectedType, setDetectedType] = useState<GarmentTypeDetection | null>(null);
  // Si la persona ya eligió una categoría a mano (o está editando una prenda), la detección no se la pisa.
  const categoryTouched = useRef(Boolean(initial));
  const seasonsTouched = useRef(Boolean(initial)); // lo mismo con las épocas
  const corteTouched = useRef(Boolean(initial)); // y con el corte
  const sportyTouched = useRef(Boolean(initial)); // y con "deportiva"
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

  // Los cortes según la categoría y el sexo del perfil. Al editar, el corte guardado se muestra igual aunque no corresponda.
  // Si cambia la categoría, un corte que no le corresponde no se muestra ni se guarda (vuelve si se elige la categoría de nuevo).
  const allowedCuts = cutsFor(category, sex);
  const keepInitialCut = initial?.corte !== undefined && initial.category === category && !allowedCuts.includes(initial.corte);
  const cutOptions = keepInitialCut ? [...allowedCuts, initial.corte!] : allowedCuts;
  // Un corte detectado en la foto que no se ofrece (por ejemplo, "cropped" en un perfil masculino) no se sugiere.
  const detectedCut = detectedType?.cut && detectedType.category === category && cutOptions.includes(detectedType.cut) ? detectedType.cut : null;
  const shownCorte = corte !== undefined && cutOptions.includes(corte) ? corte : undefined;

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

  const chooseCorte = (value: string | undefined) => {
    corteTouched.current = true;
    setCorte(value);
  };

  const chooseSporty = (value: boolean) => {
    sportyTouched.current = true;
    setSporty(value);
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
      // Si la IA ve una categoría que el perfil no tiene (un top en un perfil masculino), se usa la de la misma parte del cuerpo.
      const categoryAllowed = isAllowedCategory(foundType.category);
      const fallback = closestAllowedCategory(foundType.category, sex);
      if (!categoryTouched.current && fallback) setCategory(fallback);
      setName((current) => (current.trim() === '' ? foundType.type : current)); // solo si el nombre está vacío
      // El corte deducido de la silueta se aplica solo si la persona no eligió uno a mano y se ofrece para su perfil.
      if (foundType.cut && !corteTouched.current && categoryAllowed && cutsFor(foundType.category, sex).includes(foundType.cut)) {
        setCorte(foundType.cut);
      }
      if (!sportyTouched.current) setSporty(foundType.sporty);
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
        <Pressable
          onPress={() => choosePhoto('camera')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.photoButton, pressed && styles.photoButtonPressed]}
        >
          <Ionicons name="camera-outline" size={20} color={colors.link} />
          <Text style={styles.photoButtonLabel}>Cámara</Text>
        </Pressable>
        <Pressable
          onPress={() => choosePhoto('library')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.photoButton, pressed && styles.photoButtonPressed]}
        >
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
        <SegmentedControl options={categoryOptions} value={category} onChange={chooseCategory} />
        {!analyzing && detectedType && detectedType.category === category ? (
          <Text style={styles.detectHint}>Detectado de la foto: {detectedType.type}</Text>
        ) : null}
        {!analyzing && detectedType && detectedType.category !== category && isAllowedCategory(detectedType.category) ? (
          <View style={styles.suggestion}>
            <Text style={styles.suggestionText}>
              Parece ser: {detectedType.type} ({CATEGORY_LABELS[detectedType.category]})
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

      {cutOptions.length > 0 ? (
        <>
          <Text style={styles.groupLabel} accessibilityRole="header">
            Corte
          </Text>
          <View style={styles.section}>
            <CutPicker options={cutOptions} value={shownCorte} onChange={chooseCorte} />
            {!analyzing && detectedCut && detectedCut === shownCorte ? (
              <Text style={styles.detectHint}>Deducido de la silueta en la foto</Text>
            ) : null}
            {!analyzing && detectedCut && detectedCut !== shownCorte ? (
              <View style={styles.suggestion}>
                <Text style={styles.suggestionText}>Por la silueta de la foto: {detectedCut}</Text>
                <Pressable onPress={() => chooseCorte(detectedCut)} accessibilityRole="button" hitSlop={8}>
                  <Text style={styles.suggestionAction}>Usar</Text>
                </Pressable>
              </View>
            ) : null}
            <Text style={styles.seasonHint}>Opcional.</Text>
          </View>
        </>
      ) : null}

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

      <FormGroup
        footer={
          !analyzing && detectedType && detectedType.sporty === sporty
            ? 'Detectado de la foto. Las prendas deportivas solo se usan en el estilo Blokecore.'
            : 'Camisetas de fútbol y ropa deportiva. Solo se usan en el estilo Blokecore.'
        }
      >
        <SwitchRow label="Prenda deportiva" value={sporty} onValueChange={chooseSporty} />
      </FormGroup>

      {shownError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {shownError}
        </Text>
      ) : null}
      <Pressable
        onPress={() => color && onSubmit({ name, category, seasons, corte: shownCorte, sporty, color, newPhotoUri })}
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
  photoButtonPressed: { opacity: 0.6 }, // respuesta inmediata al toque, antes de que aparezca el selector
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