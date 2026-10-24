import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

const MAX_CONTENT_WIDTH = 420;

interface Props {
  title: string;
  subtitle: string;
  configured: boolean;
  children: ReactNode; // los campos del formulario
  error: string | null;
  submitLabel: string;
  busyLabel: string;
  busy: boolean;
  onSubmit: () => void;
  switchPrompt: string; // "¿No tenés cuenta?"
  switchLabel: string; // "Creá una"
  onSwitch: () => void;
}

/** Lo que comparten "Iniciar sesión" y "Crear cuenta": encabezado, aviso de configuración, error, botón y enlace. */
export function AuthScaffold({
  title,
  subtitle,
  configured,
  children,
  error,
  submitLabel,
  busyLabel,
  busy,
  onSubmit,
  switchPrompt,
  switchLabel,
  onSwitch,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const disabled = busy || !configured;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="shirt" size={34} color={colors.onPrimary} />
        </View>
        <Text style={styles.appName}>Pilchapp</Text>
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {!configured ? (
        <View style={styles.notice} accessibilityRole="alert">
          <Ionicons name="warning-outline" size={20} color={colors.danger} />
          <Text style={styles.noticeText}>
            Falta configurar Supabase. Agregá EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en el archivo
            .env.local y reiniciá la app con &quot;npx expo start -c&quot;.
          </Text>
        </View>
      ) : null}

      {children}

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <Pressable
        onPress={onSubmit}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled, busy }}
        style={[styles.submit, disabled && styles.submitDisabled]}
      >
        {busy ? <ActivityIndicator color={colors.onPrimary} /> : null}
        <Text style={styles.submitLabel}>{busy ? busyLabel : submitLabel}</Text>
      </Pressable>

      <View style={styles.switchRow}>
        <Text style={styles.switchPrompt}>{switchPrompt}</Text>
        <Pressable onPress={onSwitch} disabled={busy} accessibilityRole="link" style={styles.switchButton}>
          <Text style={styles.switchLabel}>{switchLabel}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingHorizontal: 20 },
  brand: { alignItems: 'center', marginBottom: 28 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { fontSize: 17, fontWeight: '600', color: colors.text, marginTop: 10 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: 4, marginBottom: 24 },
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  noticeText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
  error: { fontSize: 14, color: colors.danger, marginBottom: 12, paddingHorizontal: 4 },
  submit: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { opacity: 0.4 },
  submitLabel: { fontSize: 17, fontWeight: '600', color: colors.onPrimary },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' },
  switchPrompt: { fontSize: 15, color: colors.textMuted },
  switchButton: { minHeight: 44, paddingHorizontal: 6, justifyContent: 'center' },
  switchLabel: { fontSize: 15, fontWeight: '600', color: colors.link },
}));
