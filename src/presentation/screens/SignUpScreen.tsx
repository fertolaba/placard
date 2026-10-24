import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, View, type TextInputInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MIN_PASSWORD_LENGTH } from '../../domain/services/authValidation';
import { useAuth } from '../auth/AuthProvider';
import { AuthScaffold } from '../components/AuthScaffold';
import { FormGroup, PasswordRow, TextRow } from '../components/FormGroup';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

/** Aviso después de registrarse cuando Supabase pide confirmar el email ("Confirm email" activado). */
function CheckYourEmail({ email }: { email: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.done, { paddingTop: insets.top + 80 }]}>
      <View style={styles.doneIcon}>
        <Ionicons name="mail-unread-outline" size={36} color={colors.link} />
      </View>
      <Text style={styles.doneTitle} accessibilityRole="header">
        Revisá tu correo
      </Text>
      <Text style={styles.doneText} accessibilityLiveRegion="polite">
        Te mandamos un enlace a {email.trim()} para confirmar tu cuenta. Tocalo y después volvé para iniciar sesión.
        Si no lo ves, buscalo en la carpeta de spam.
      </Text>
      <Pressable onPress={() => router.replace('/login')} accessibilityRole="button" style={styles.doneButton}>
        <Text style={styles.doneButtonLabel}>Ir a iniciar sesión</Text>
      </Pressable>
    </View>
  );
}

export function SignUpScreen() {
  const styles = useStyles();
  const { signUp, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mustConfirm, setMustConfirm] = useState(false);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmationRef = useRef<TextInputInstance>(null);

  const submit = async () => {
    if (busy || !configured) return;
    setBusy(true);
    setError(null);
    // Si no hace falta confirmar el email, la persona ya queda con sesión y la navegación la lleva a la app.
    const outcome = await signUp(email, password, confirmation);
    setBusy(false);
    if (outcome.error !== null) setError(outcome.error);
    else if (outcome.needsEmailConfirmation) setMustConfirm(true);
  };

  const edit = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setError(null);
  };

  if (mustConfirm) return <CheckYourEmail email={email} />;

  return (
    <AuthScaffold
      title="Crear cuenta"
      subtitle="Por ahora tus prendas siguen guardadas solo en este teléfono."
      configured={configured}
      error={error}
      submitLabel="Crear cuenta"
      busyLabel="Creando cuenta…"
      busy={busy}
      onSubmit={submit}
      switchPrompt="¿Ya tenés cuenta?"
      switchLabel="Iniciá sesión"
      onSwitch={() => router.replace('/login')}
    >
      <FormGroup>
        <TextRow
          label="Email"
          value={email}
          onChangeText={edit(setEmail)}
          placeholder="nombre@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!busy}
          maxLength={254}
        />
        <PasswordRow
          ref={passwordRef}
          label="Contraseña"
          value={password}
          onChangeText={edit(setPassword)}
          placeholder={`Mínimo ${MIN_PASSWORD_LENGTH}`}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmationRef.current?.focus()}
          editable={!busy}
          maxLength={72}
        />
        <PasswordRow
          ref={confirmationRef}
          label="Repetir"
          value={confirmation}
          onChangeText={edit(setConfirmation)}
          placeholder="La misma contraseña"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
          editable={!busy}
          maxLength={72}
        />
      </FormGroup>
      <Text style={styles.hint}>La contraseña tiene que tener al menos {MIN_PASSWORD_LENGTH} caracteres.</Text>
    </AuthScaffold>
  );
}

const useStyles = makeStyles((colors) => ({
  hint: { fontSize: 13, color: colors.textMuted, marginTop: -12, marginBottom: 20, paddingHorizontal: 16 },
  done: { flex: 1, backgroundColor: colors.background, alignItems: 'center', paddingHorizontal: 28 },
  doneIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: 18 },
  doneText: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 21, maxWidth: 360 },
  doneButton: {
    marginTop: 28,
    height: 50,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonLabel: { fontSize: 17, fontWeight: '600', color: colors.onPrimary },
}));
