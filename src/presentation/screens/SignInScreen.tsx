import { router } from 'expo-router';
import { useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { AuthScaffold } from '../components/AuthScaffold';
import { FormGroup, PasswordRow, TextRow } from '../components/FormGroup';

export function SignInScreen() {
  const { signIn, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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
      title="Iniciar sesión"
      subtitle="Entrá con el email y la contraseña de tu cuenta."
      configured={configured}
      error={error}
      submitLabel="Entrar"
      busyLabel="Entrando…"
      busy={busy}
      onSubmit={submit}
      switchPrompt="¿No tenés cuenta?"
      switchLabel="Creá una"
      onSwitch={() => router.replace('/registro')}
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
          placeholder="Tu contraseña"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          editable={!busy}
          maxLength={72}
        />
      </FormGroup>
    </AuthScaffold>
  );
}
