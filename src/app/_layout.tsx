import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../presentation/auth/AuthProvider';
import { ThemeProvider, useTheme } from '../presentation/theme/ThemeProvider';

// La pantalla de carga queda visible hasta saber si hay una sesión guardada (evita que se vea el login un instante).
SplashScreen.preventAutoHideAsync();

function ThemedStack() {
  const { scheme, colors } = useTheme();
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'loading') SplashScreen.hide();
  }, [status]);

  if (status === 'loading') return null; // en la web no hay pantalla de carga: así tampoco hay parpadeo
  const signedIn = status === 'signedIn';

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {/* La app solo con sesión; sin sesión, cualquier ruta lleva al login (y con sesión, el login no se puede ver).
            redirectTo asegura que al cerrar sesión se caiga en el login y no en otra pantalla de (auth). */}
        <Stack.Protected guard={signedIn} redirectTo="/login">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add-garment" options={{ presentation: 'modal' }} />
          <Stack.Screen name="garment/[id]" options={{ presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemedStack />
      </ThemeProvider>
    </AuthProvider>
  );
}
