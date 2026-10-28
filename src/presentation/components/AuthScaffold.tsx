import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

const MAX_CONTENT_WIDTH = 420;

interface Props {
  hero: ReactNode; // la mascota de arriba
  title: string;
  configured: boolean;
  children: ReactNode; // los campos del formulario
  error: string | null;
  submitLabel: string;
  busyLabel: string;
  busy: boolean;
  valid: boolean; // con datos incompletos el botón se ve atenuado, pero se puede tocar para ver qué falta
  onSubmit: () => void;
  onForgotPassword?: () => void; // si no se pasa, no aparece "Olvidé mi contraseña"
  switchPrompt: string; // "¿No tenés cuenta?"
  switchLabel: string; // "Registrate"
  onSwitch: () => void;
}

/** Lo que comparten "Iniciar sesión" y "Crear cuenta": mascota, título, aviso de configuración, error, botón y enlaces. */
export function AuthScaffold({
  hero,
  title,
  configured,
  children,
  error,
  submitLabel,
  busyLabel,
  busy,
  valid,
  onSubmit,
  onForgotPassword,
  switchPrompt,
  switchLabel,
  onSwitch,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const disabled = busy || !configured;

  return (
    // En iOS el padding sube el contenido sobre el teclado; en Android alcanza con que la vista exista.
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>{hero}</View>

        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>

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
          style={[styles.submit, (disabled || !valid) && styles.submitDimmed]}
        >
          {busy ? <ActivityIndicator color={colors.onPrimary} /> : null}
          <Text style={styles.submitLabel}>{busy ? busyLabel : submitLabel}</Text>
        </Pressable>

        {onForgotPassword ? (
          <Pressable onPress={onForgotPassword} disabled={busy} accessibilityRole="link" style={styles.forgotButton}>
            <Text style={styles.forgot}>
              Olvidé <Text style={styles.forgotLink}>mi contraseña</Text>
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.switchRow}>
          <Text style={styles.switchPrompt}>{switchPrompt}</Text>
          <Pressable onPress={onSwitch} disabled={busy} accessibilityRole="link" style={styles.switchButton}>
            <Text style={styles.switchLabel}>{switchLabel}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingHorizontal: 26 },
  hero: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 20 },
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.fillMuted,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  noticeText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
  error: { fontSize: 14, color: colors.danger, marginBottom: 12, paddingHorizontal: 4 },
  submit: {
    height: 56,
    marginTop: 6,
    borderRadius: 28,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDimmed: { opacity: 0.45 },
  submitLabel: { fontSize: 17, fontWeight: '700', color: colors.onPrimary },
  forgotButton: { alignSelf: 'center', minHeight: 44, paddingHorizontal: 6, justifyContent: 'center' },
  forgot: { fontSize: 13, color: colors.textMuted },
  forgotLink: { color: colors.link, textDecorationLine: 'underline' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' },
  switchPrompt: { fontSize: 15, color: colors.textMuted },
  switchButton: { minHeight: 44, paddingHorizontal: 6, justifyContent: 'center' },
  switchLabel: { fontSize: 15, color: colors.link, textDecorationLine: 'underline' },
}));
