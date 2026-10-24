import { Stack } from 'expo-router';
import { useTheme } from '../../presentation/theme/ThemeProvider';

/** Pantallas para entrar sin sesión. Se pasa de una a otra reemplazando, así "atrás" no salta entre ellas. */
export default function AuthLayout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="registro" />
    </Stack>
  );
}
