import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View, type ColorValue } from 'react-native';
import { FloatingThemeToggle } from '../../presentation/components/FloatingThemeToggle';
import { useSeasonTheme } from '../../presentation/theme/SeasonThemeProvider';
import { useTheme } from '../../presentation/theme/ThemeProvider';

type IconName = keyof typeof Ionicons.glyphMap;

// La barra pasa el color como ColorValue y los íconos esperan texto: los colores de la paleta siempre son texto.
const tabIcon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />;
  };

export default function TabsLayout() {
  const { colors } = useTheme();
  const { theme } = useSeasonTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.sub2,
          tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.cardBorder },
          sceneStyle: { backgroundColor: colors.background }, // sin destellos al cambiar de pestaña
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
          name="guardados"
          options={{
            title: 'Guardados',
            tabBarIcon: tabIcon('bookmark-outline'),
          }}
        />
      </Tabs>
      <FloatingThemeToggle />
    </View>
  );
}
