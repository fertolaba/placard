import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Profile } from '../../domain/entities/Profile';
import type { ThemeMode } from '../../domain/entities/ThemeMode';
import { FormGroup, SwitchRow, TextRow } from '../components/FormGroup';
import { SegmentedControl } from '../components/SegmentedControl';
import { StateMessage } from '../components/StateMessage';
import { useProfile } from '../hooks/useProfile';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

const MAX_CONTENT_WIDTH = 480;

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
  return letters === '' ? '?' : letters;
}

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
  const { mode, setMode } = useTheme();
  const { profile, stats, status, reload, save } = useProfile();
  const [draft, setDraft] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (profile) setDraft(profile);
  }, [profile]);

  const dirty =
    profile !== null &&
    draft !== null &&
    (draft.displayName !== profile.displayName ||
      draft.username !== profile.username ||
      draft.showWatermark !== profile.showWatermark);

  const change = (patch: Partial<Profile>) => {
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
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>{initials(profile.displayName)}</Text>
            </View>
            <Text style={styles.name}>{profile.displayName}</Text>
            <Text style={styles.username}>@{profile.username}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.statsRow}>
              <Stat value={stats.total} label="Prendas" />
              <Stat value={stats.byCategory.arriba} label="Arriba" />
              <Stat value={stats.byCategory.abajo} label="Abajo" />
              <Stat value={stats.byCategory.calzado} label="Calzado" />
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
              label="Marca de Placard en historias"
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
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 34, fontWeight: '700', color: colors.text },
  loader: { marginTop: 40 },
  identity: { alignItems: 'center', marginVertical: 18 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primaryFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: { fontSize: 30, fontWeight: '700', color: colors.link },
  name: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 10 },
  username: { fontSize: 15, color: colors.textMuted },
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
}));