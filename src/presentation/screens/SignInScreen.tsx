import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, type TextInputInstance } from 'react-native';
import { validateSignIn } from '../../domain/services/authValidation';
import { useAuth } from '../auth/AuthProvider';
import { AuthScaffold } from '../components/AuthScaffold';
import { AuthTextField } from '../components/AuthTextField';
import { MascotAvatar, type MascotFocus } from '../components/MascotAvatar';

export function SignInScreen() {
  const { signIn, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [focus, setFocus] = useState<MascotFocus>('none');
  const [emailWidth, setEmailWidth] = useState(0);
  const passwordRef = useRef<TextInputInstance>(null);

  const submit = async () => {
    if (busy || !configured) return;
    setBusy(true);
    setError(null);
    // Si entra bien, la navegación lleva sola a la app: esta pantalla deja de estar disponible.
    const message = await signIn(email, password);
    setBusy(false);
    setError(message);
  };

  const edit = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setError(null);
  };

  return (
    <AuthScaffold
      hero={<MascotAvatar focus={focus} emailLength={email.length} fieldWidth={emailWidth} />}
      title="Iniciá sesión en Placard"
      configured={configured}
      error={error}
      submitLabel="Entrar"
      busyLabel="Entrando…"
      busy={busy}
      valid={validateSignIn(email, password) === null}
      onSubmit={submit}
      onForgotPassword={() => Alert.alert('Olvidé mi contraseña', 'Recuperar la contraseña todavía no está disponible.')}
      switchPrompt="¿No tenés cuenta?"
      switchLabel="Registrate"
      onSwitch={() => router.replace('/registro')}
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
        onSubmitEditing={() => passwordRef.current?.focus()}
        editable={!busy}
        maxLength={254}
      />
      <AuthTextField
        ref={passwordRef}
        label="Contraseña"
        password
        value={password}
        onChangeText={edit(setPassword)}
        onFocus={() => setFocus('password')}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
        editable={!busy}
        maxLength={72}
      />
    </AuthScaffold>
  );
}
