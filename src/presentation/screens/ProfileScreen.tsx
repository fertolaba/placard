import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ProfileDraft } from '../../domain/entities/Profile';
import type { ThemeMode } from '../../domain/entities/ThemeMode';
import { useAuth } from '../auth/AuthProvider';
import { categoryOptionsFor } from '../categoryUi';
import { Avatar } from '../components/Avatar';
import { FormGroup, SwitchRow, TextRow, ValueRow } from '../components/FormGroup';
import { SegmentedControl } from '../components/SegmentedControl';
import { StateMessage } from '../components/StateMessage';
import { usePhotoPicker, type PhotoSource } from '../hooks/usePhotoPicker';
import { useProfile } from '../hooks/useProfile';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';
import { confirmDestructive } from '../utils/confirm';

const MAX_CONTENT_WIDTH = 480;

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

function Stat({ value, label }: { value: number; label: string }) {
  const styles = useStyles();
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function ProfileScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { mode, setMode, colors } = useTheme();
  const { profile, stats, status, reload, save, changePhoto } = useProfile();
  const { pick, error: pickerError } = usePhotoPicker();
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  // El borrador del texto solo se reinicia cuando cambia lo guardado (no cuando cambia la foto).
  const savedName = profile?.displayName;
  const savedUsername = profile?.username;
  const savedWatermark = profile?.showWatermark;
  useEffect(() => {
    if (savedName === undefined || savedUsername === undefined || savedWatermark === undefined) return;
    setDraft({ displayName: savedName, username: savedUsername, showWatermark: savedWatermark });
  }, [savedName, savedUsername, savedWatermark]);

  const dirty =
    profile !== null &&
    draft !== null &&
    (draft.displayName !== profile.displayName ||
      draft.username !== profile.username ||
      draft.showWatermark !== profile.showWatermark);

  const change = (patch: Partial<ProfileDraft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
    setError(null);
    setJustSaved(false);
  };

  const onSave = async () => {
    if (!draft) return;
    const message = await save(draft);
    setError(message);
    setJustSaved(message === null);
  };

  const choosePhoto = async (source: PhotoSource) => {
    setMenuOpen(false);
    setPhotoError(null);
    const uri = await pick(source);
    if (!uri) return;
    setPhotoError(await changePhoto(uri));
  };

  const removePhoto = async () => {
    setMenuOpen(false);
    setPhotoError(await changePhoto(null));
  };

  const shownPhotoError = photoError ?? pickerError;

  const onSignOut = async () => {
    const confirmed = await confirmDestructive(
      '¿Cerrar sesión?',
      'Tus prendas y tu perfil siguen guardados en este teléfono.',
      'Cerrar sesión',
    );
    if (!confirmed) return;
    setSigningOut(true);
    setSignOutError(null);
    // Si sale bien, la navegación lleva sola al login.
    const message = await signOut();
    setSigningOut(false);
    setSignOutError(message);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <Text style={styles.title} accessibilityRole="header">
        Perfil
      </Text>

      {status === 'loading' && <ActivityIndicator style={styles.loader} />}
      {status === 'error' && (
        <StateMessage
          title="No pudimos cargar tu perfil"
          detail="Revisá tu conexión y que el servidor esté encendido."
          actionLabel="Reintentar"
          onAction={reload}
        />
      )}

      {status === 'ready' && profile && stats && draft && (
        <>
          <View style={styles.identity}>
            <Pressable
              onPress={() => setMenuOpen((open) => !open)}
              accessibilityRole="button"
              accessibilityLabel="Cambiar foto de perfil"
              accessibilityState={{ expanded: menuOpen }}
            >
              <Avatar name={profile.displayName} photoUri={profile.photoUri} />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color={colors.onPrimary} />
              </View>
            </Pressable>
            <Text style={styles.name}>{profile.displayName}</Text>
            <Text style={styles.username}>@{profile.username}</Text>

            {menuOpen ? (
              <View style={styles.photoMenu}>
                <Pressable onPress={() => choosePhoto('camera')} accessibilityRole="button" style={styles.menuButton}>
                  <Ionicons name="camera-outline" size={18} color={colors.link} />
                  <Text style={styles.menuLabel}>Cámara</Text>
                </Pressable>
                <Pressable onPress={() => choosePhoto('library')} accessibilityRole="button" style={styles.menuButton}>
                  <Ionicons name="images-outline" size={18} color={colors.link} />
                  <Text style={styles.menuLabel}>Galería</Text>
                </Pressable>
                {profile.photoUri ? (
                  <Pressable onPress={removePhoto} accessibilityRole="button" style={[styles.menuButton, styles.menuButtonDanger]}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    <Text style={styles.menuLabelDanger}>Quitar</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            {shownPhotoError ? (
              <Text style={styles.photoError} accessibilityRole="alert">
                {shownPhotoError}
              </Text>
            ) : null}
          </View>

          <View style={styles.card}>
            <View style={styles.statsRow}>
              <Stat value={stats.total} label="Prendas" />
              {categoryOptionsFor(user?.sex ?? null).map((option) => (
                <Stat key={option.value} value={stats.byCategory[option.value]} label={option.label} />
              ))}
            </View>
            {stats.palette.length > 0 && (
              <View
                style={styles.palette}
                accessible
                accessibilityLabel={`Tu paleta: ${stats.palette.map((entry) => entry.colorName).join(', ')}`}
              >
                <Text style={styles.paletteLabel}>Tu paleta</Text>
                <View style={styles.dots}>
                  {stats.palette.map((entry) => (
                    <View key={entry.colorName} style={[styles.dot, { backgroundColor: entry.colorHex }]} />
                  ))}
                </View>
              </View>
            )}
          </View>

          <Text style={styles.groupLabel} accessibilityRole="header">
            Apariencia
          </Text>
          <SegmentedControl options={THEME_OPTIONS} value={mode} onChange={setMode} />
          <Text style={styles.groupFooter}>"Sistema" usa la configuración de tu teléfono. Se aplica al instante.</Text>

          <FormGroup>
            <TextRow label="Nombre" value={draft.displayName} onChangeText={(value) => change({ displayName: value })} maxLength={40} />
            <TextRow
              label="Usuario"
              value={draft.username}
              onChangeText={(value) => change({ username: value })}
              autoCapitalize="none"
              maxLength={21}
            />
          </FormGroup>

          <FormGroup footer="Aparece al pie de tus historias de outfits.">
            <SwitchRow
              label="Marca de Pilchapp en historias"
              value={draft.showWatermark}
              onValueChange={(value) => change({ showWatermark: value })}
            />
          </FormGroup>

          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
          <Pressable
            onPress={onSave}
            disabled={!dirty}
            accessibilityRole="button"
            style={[styles.save, !dirty && styles.saveDisabled]}
          >
            <Text style={styles.saveLabel}>Guardar cambios</Text>
          </Pressable>
          {justSaved && !dirty ? <Text style={styles.success}>Cambios guardados</Text> : null}
        </>
      )}

      {/* La cuenta va aparte del perfil: se puede cerrar sesión aunque el perfil no haya cargado. */}
      <Text style={[styles.groupLabel, styles.accountLabel]} accessibilityRole="header">
        Cuenta
      </Text>
      <FormGroup>
        <ValueRow label="Email" value={user?.email ?? ''} />
        <Pressable
          onPress={onSignOut}
          disabled={signingOut}
          accessibilityRole="button"
          accessibilityState={{ disabled: signingOut, busy: signingOut }}
          style={styles.signOut}
        >
          {signingOut ? <ActivityIndicator color={colors.danger} /> : null}
          <Text style={styles.signOutLabel}>{signingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</Text>
        </Pressable>
      </FormGroup>
      {signOutError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {signOutError}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 34, fontWeight: '700', color: colors.text },
  loader: { marginTop: 40 },
  identity: { alignItems: 'center', marginVertical: 18 },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 10 },
  username: { fontSize: 15, color: colors.textMuted },
  photoMenu: { flexDirection: 'row', gap: 10, marginTop: 14 },
  menuButton: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: colors.primaryFill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuButtonDanger: { backgroundColor: colors.surface },
  menuLabel: { fontSize: 15, fontWeight: '600', color: colors.link },
  menuLabelDanger: { fontSize: 15, fontWeight: '600', color: colors.danger },
  photoError: { fontSize: 14, color: colors.danger, marginTop: 8, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted },
  palette: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  paletteLabel: { fontSize: 13, color: colors.textMuted },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.swatchBorder },
  groupLabel: { fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 6, paddingHorizontal: 16 },
  groupFooter: { fontSize: 13, color: colors.textMuted, marginTop: 6, marginBottom: 20, paddingHorizontal: 16 },
  error: { fontSize: 14, color: colors.danger, marginBottom: 8 },
  save: { height: 50, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveDisabled: { opacity: 0.4 },
  saveLabel: { fontSize: 17, fontWeight: '600', color: colors.onPrimary },
  success: { fontSize: 14, color: colors.successText, textAlign: 'center', marginTop: 10 },
  accountLabel: { marginTop: 28 },
  signOut: { flex: 1, minHeight: 44, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  signOutLabel: { fontSize: 17, color: colors.danger },
}));