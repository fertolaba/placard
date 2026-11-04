import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from '../presentation/auth/AuthProvider';
import { ProfileProvider } from '../presentation/state/ProfileProvider';
import { SeasonThemeProvider } from '../presentation/theme/SeasonThemeProvider';
import { ThemeProvider, useTheme } from '../presentation/theme/ThemeProvider';

// La pantalla de carga queda visible hasta saber si hay una sesión guardada (evita que se vea el login un instante).
SplashScreen.preventAutoHideAsync();

function ThemedStack() {
  const { scheme, colors } = useTheme();
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'loading') SplashScreen.hide();
  }, [status]);

  // El fondo nativo de la ventana acompaña al tema: no se ve blanco ni negro detrás de las transiciones.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
  }, [colors.background]);

  // Tema de la navegación: fondos de pantallas, cabeceras y bordes por defecto con la paleta de la app.
  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.cardBorder,
        notification: colors.primary,
      },
    };
  }, [scheme, colors]);

  if (status === 'loading') return null; // en la web no hay pantalla de carga: así tampoco hay parpadeo
  const signedIn = status === 'signedIn';

  return (
    // El tema de la estación va acá porque el botón luna/sol también aparece en Perfil, fuera de las pestañas.
    <NavigationThemeProvider value={navigationTheme}>
      <SeasonThemeProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          {/* La app solo con sesión; sin sesión, cualquier ruta lleva al login (y con sesión, el login no se puede ver).
              redirectTo asegura que al cerrar sesión se caiga en el login y no en otra pantalla de (auth). */}
          <Stack.Protected guard={signedIn} redirectTo="/login">
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="add-garment" options={{ presentation: 'modal' }} />
            <Stack.Screen name="garment/[id]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="inspiracion/[id]" />
            <Stack.Screen name="perfil" dangerouslySingular />
          </Stack.Protected>
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </SeasonThemeProvider>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProfileProvider>
          <ThemedStack />
        </ProfileProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
