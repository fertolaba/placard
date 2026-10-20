import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryFilter } from '../components/CategoryFilter';
import { GarmentCard } from '../components/GarmentCard';
import { StateMessage } from '../components/StateMessage';
import { useGarments, type CategoryFilterValue } from '../hooks/useGarments';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

const MAX_CONTENT_WIDTH = 480; // en la web se ve como un celular, no estirado
const SIDE_PADDING = 20;
const GAP = 12;

export function PlacardScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState<CategoryFilterValue>('todo');
  const { garments, status, reload } = useGarments(category);

  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const cardWidth = (contentWidth - SIDE_PADDING * 2 - GAP) / 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} accessibilityRole="header">
            Mi Placard
          </Text>
          <Pressable
            onPress={() => router.push('/add-garment')}
            accessibilityRole="button"
            accessibilityLabel="Agregar prenda"
            style={styles.addButton}
          >
            <Ionicons name="add" size={26} color={colors.onPrimary} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>{status === 'ready' ? `${garments.length} prendas` : ' '}</Text>
      </View>
      <CategoryFilter value={category} onChange={setCategory} />

      {status === 'loading' && <ActivityIndicator style={styles.loader} />}
      {status === 'error' && (
        <StateMessage
          title="No pudimos cargar tus prendas"
          detail="Revisá tu conexión y que el servidor esté encendido."
          actionLabel="Reintentar"
          onAction={reload}
        />
      )}
      {status === 'ready' && garments.length === 0 && (
        <StateMessage title="Todavía no hay prendas acá" detail="Tocá el botón + para agregar una foto de tu ropa." />
      )}
      {status === 'ready' && garments.length > 0 && (
        <FlatList
          data={garments}
          keyExtractor={(garment) => garment.id}
          numColumns={2}
          columnWrapperStyle={{ gap: GAP }}
          contentContainerStyle={{ gap: GAP, padding: SIDE_PADDING }}
          renderItem={({ item }) => (
            <GarmentCard
              garment={item}
              width={cardWidth}
              onPress={() => router.push({ pathname: '/garment/[id]', params: { id: item.id } })}
            />
          )}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', backgroundColor: colors.background },
  header: { paddingHorizontal: SIDE_PADDING, paddingBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 34, fontWeight: '700', color: colors.text },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: { fontSize: 15, color: colors.textMuted },
  loader: { marginTop: 40 },
}));