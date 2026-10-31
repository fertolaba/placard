import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { SeasonThemeProvider, useSeasonTheme } from '../../presentation/theme/SeasonThemeProvider';
import { useTheme } from '../../presentation/theme/ThemeProvider';

type IconName = keyof typeof Ionicons.glyphMap;

// La barra pasa el color como ColorValue y los íconos esperan texto: los colores de la paleta siempre son texto.
const tabIcon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />;
  };

function ThemedTabs() {
  const { colors } = useTheme();
  const { theme } = useSeasonTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.link,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.swatchBorder },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pilchapp',
          tabBarIcon: tabIcon('shirt-outline'),
          // La barra toma las opciones de la pestaña abierta: la estación se ve solo en Mi Pilchapp.
          tabBarActiveTintColor: theme.tabActive,
          tabBarInactiveTintColor: theme.tabInactive,
          tabBarStyle: { backgroundColor: theme.tabBar, borderTopColor: theme.tabBarBorder },
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: 'Outfits',
          tabBarIcon: tabIcon('sparkles-outline'),
        }}
      />
      <Tabs.Screen
        name="inspiracion"
        options={{
          title: 'Inspiración',
          tabBarIcon: tabIcon('star-outline'),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: tabIcon('person-outline'),
        }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  return (
    <SeasonThemeProvider>
      <ThemedTabs />
    </SeasonThemeProvider>
  );
}
