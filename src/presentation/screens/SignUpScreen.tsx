import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, View, type TextInputInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Sex } from '../../domain/entities/Sex';
import { MIN_PASSWORD_LENGTH, validateSignUp } from '../../domain/services/authValidation';
import { useAuth } from '../auth/AuthProvider';
import { AuthScaffold } from '../components/AuthScaffold';
import { AuthTextField } from '../components/AuthTextField';
import { MascotAvatar, type MascotFocus } from '../components/MascotAvatar';
import { SexPicker } from '../components/SexPicker';
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
  const [username, setUsername] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mustConfirm, setMustConfirm] = useState(false);
  const [focus, setFocus] = useState<MascotFocus>('none');
  const [emailWidth, setEmailWidth] = useState(0);
  const usernameRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmationRef = useRef<TextInputInstance>(null);

  const submit = async () => {
    if (busy || !configured) return;
    setBusy(true);
    setError(null);
    // Si no hace falta confirmar el email, la persona ya queda con sesión y la navegación la lleva a la app.
    const outcome = await signUp({ email, password, confirmation, username, sex });
    setBusy(false);
    if (outcome.error !== null) setError(outcome.error);
    else if (outcome.needsEmailConfirmation) setMustConfirm(true);
  };

  const edit = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setError(null);
  };

  const chooseSex = (value: Sex) => {
    setSex(value);
    setError(null);
  };

  if (mustConfirm) return <CheckYourEmail email={email} />;

  return (
    <AuthScaffold
      hero={<MascotAvatar focus={focus} emailLength={email.length} fieldWidth={emailWidth} />}
      title="Creá tu cuenta"
      configured={configured}
      error={error}
      submitLabel="Crear cuenta"
      busyLabel="Creando cuenta…"
      busy={busy}
      valid={validateSignUp({ email, password, confirmation, username, sex }) === null}
      onSubmit={submit}
      switchPrompt="¿Ya tenés cuenta?"
      switchLabel="Iniciá sesión"
      onSwitch={() => router.replace('/login')}
    >
      <AuthTextField
        label="Correo"
        value={email}
        onChangeText={edit(setEmail)}
        onFocus={() => setFocus('email')}
        onInputWidth={setEmailWidth}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => usernameRef.current?.focus()}
        editable={!busy}
        maxLength={254}
      />
      <AuthTextField
        ref={usernameRef}
        label="Usuario"
        value={username}
        onChangeText={edit(setUsername)}
        onFocus={() => setFocus('none')}
        autoCapitalize="none"
        autoComplete="username-new"
        textContentType="username"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
        editable={!busy}
        maxLength={21}
      />
      <AuthTextField
        ref={passwordRef}
        label="Contraseña"
        password
        value={password}
        onChangeText={edit(setPassword)}
        onFocus={() => setFocus('password')}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => confirmationRef.current?.focus()}
        editable={!busy}
        maxLength={72}
      />
      <AuthTextField
        ref={confirmationRef}
        label="Repetir contraseña"
        password
        value={confirmation}
        onChangeText={edit(setConfirmation)}
        onFocus={() => setFocus('password')}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
        editable={!busy}
        maxLength={72}
      />
      <Text style={styles.hint}>
        El usuario tiene de 3 a 20 caracteres: letras, números, punto o guion bajo. La contraseña, al menos{' '}
        {MIN_PASSWORD_LENGTH} caracteres.
      </Text>
      <Text style={styles.groupLabel} accessibilityRole="header">
        Sexo
      </Text>
      <SexPicker value={sex} onChange={chooseSex} disabled={busy} />
      <Text style={styles.sexHint}>Lo usamos para mostrarte las categorías y cortes de ropa que te corresponden.</Text>
    </AuthScaffold>
  );
}

const useStyles = makeStyles((colors) => ({
  hint: { fontSize: 13, color: colors.textMuted, marginTop: 2, marginBottom: 20, paddingHorizontal: 4 },
  groupLabel: { fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 6, paddingHorizontal: 4 },
  sexHint: { fontSize: 13, color: colors.textMuted, marginTop: 6, marginBottom: 20, paddingHorizontal: 4 },
  done: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', paddingHorizontal: 28 },
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
