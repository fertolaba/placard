import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Garment } from '../../domain/entities/Garment';
import { useAuth } from '../auth/AuthProvider';
import { AddGarmentCard } from '../components/AddGarmentCard';
import { CategoryFilter, categoryFilterOptions } from '../components/CategoryFilter';
import { GarmentCard } from '../components/GarmentCard';
import { PressableScale } from '../components/PressableScale';
import { SeasonFilter } from '../components/SeasonFilter';
import { StateMessage } from '../components/StateMessage';
import { SwipeableContent } from '../components/SwipeableContent';
import { ThemeToggle } from '../components/ThemeToggle';
import { useGarments, type CategoryFilterValue } from '../hooks/useGarments';
import { SeasonScene } from '../scenes/SeasonScene';
import { SEASON_UI } from '../seasonUi';
import { useSeasonTheme, useThemeColors, type ThemeColorMap } from '../theme/SeasonThemeProvider';
import { neighbor } from '../utils/swipe';

const MAX_CONTENT_WIDTH = 480; // en la web se ve como un celular, no estirado
const SIDE_PADDING = 20;
const GAP = 12;
const HEADER_TOP = 56;
const SEASONS_TOP = 188; // la franja entre el contador y los círculos deja ver el paisaje de la escena
const ENTRANCE_MS = 800; // lo que tarda en aparecer la primera tanda de tarjetas

// Hacia dónde hay que deslizar para pasar a la siguiente categoría (Todo → Arriba → … → Calzado).
// false = dedo hacia la IZQUIERDA (como pasar páginas). true = dedo hacia la DERECHA.
const SWIPE_RIGHT_GOES_NEXT = false;

// Elemento fijo al final de la grilla: la tarjeta para agregar prendas.
const ADD_ITEM = 'add' as const;
type GridItem = Garment | typeof ADD_ITEM;

const keyOf = (item: GridItem) => (item === ADD_ITEM ? ADD_ITEM : item.id);

const SCREEN_COLORS: ThemeColorMap = { backgroundColor: 'background' };
const TITLE_COLORS: ThemeColorMap = { color: 'text' };
const SUBTITLE_COLORS: ThemeColorMap = { color: 'headerMuted' };
const CLEAR_CHIP_COLORS: ThemeColorMap = { backgroundColor: 'categoryTrack' };
const CLEAR_LABEL_COLORS: ThemeColorMap = { color: 'categoryText' };

export function PlacardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<GridItem>>(null);
  const sex = useAuth().user?.sex ?? null;
  const categoryOptions = categoryFilterOptions(sex);
  const categoryOrder = categoryOptions.map((option) => option.value);
  const [category, setCategory] = useState<CategoryFilterValue>('todo');
  const { season, setSeason } = useSeasonTheme();
  const { garments, status, reload } = useGarments(category, season);

  const screenColors = useThemeColors(SCREEN_COLORS);
  const titleColors = useThemeColors(TITLE_COLORS);
  const subtitleColors = useThemeColors(SUBTITLE_COLORS);
  const clearChipColors = useThemeColors(CLEAR_CHIP_COLORS);
  const clearLabelColors = useThemeColors(CLEAR_LABEL_COLORS);

  const reducedMotion = useReducedMotion();
  const entranceDone = useSharedValue(reducedMotion);

  // El scroll se lee en el hilo nativo: mueve la escena sin renderizar esta pantalla.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const cardWidth = (contentWidth - SIDE_PADDING * 2 - GAP) / 2;

  const filtering = category !== 'todo' || season !== 'todas';
  const openAddGarment = useCallback(() => router.push('/add-garment'), [router]);
  const openGarment = useCallback((id: string) => router.push({ pathname: '/garment/[id]', params: { id } }), [router]);
  const clearFilters = () => {
    setCategory('todo');
    setSeason('todas');
  };

  // Al cambiar de categoría o de clima, la lista vuelve al principio.
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    scrollY.set(0); // si la lista no está (sin resultados), no llega ningún evento de scroll
  }, [category, season, scrollY]);

  // Solo la primera tanda entra animada: después, al filtrar o scrollear, las tarjetas aparecen directo.
  useEffect(() => {
    if (status !== 'ready') return;
    const timer = setTimeout(() => entranceDone.set(true), ENTRANCE_MS);
    return () => clearTimeout(timer);
  }, [status, entranceDone]);

  const data = useMemo<GridItem[]>(() => [...garments, ADD_ITEM], [garments]);
  const renderItem = useCallback(
    ({ item, index }: { item: GridItem; index: number }) =>
      item === ADD_ITEM ? (
        <AddGarmentCard width={cardWidth} index={index} entranceDone={entranceDone} onPress={openAddGarment} />
      ) : (
        <GarmentCard garment={item} width={cardWidth} index={index} entranceDone={entranceDone} onPress={openGarment} />
      ),
    [cardWidth, entranceDone, openAddGarment, openGarment],
  );

  const count = `${garments.length} ${garments.length === 1 ? 'prenda' : 'prendas'}`;
  const subtitle = status !== 'ready' ? ' ' : season === 'todas' ? count : `${count} · ${SEASON_UI[season].label}`;

  return (
    <Animated.View style={[styles.container, { paddingTop: Math.max(HEADER_TOP, insets.top) }, screenColors]}>
      <SeasonScene width={contentWidth} scrollY={scrollY} />
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Animated.Text style={[styles.title, titleColors]} accessibilityRole="header">
            Mi Pilchapp
          </Animated.Text>
          <ThemeToggle />
        </View>
        <Animated.Text style={[styles.subtitle, subtitleColors]}>{subtitle}</Animated.Text>
      </View>
      <SeasonFilter value={season} onChange={setSeason} />
      <CategoryFilter options={categoryOptions} value={category} onChange={setCategory} />
      {filtering ? (
        <View style={styles.clearRow}>
          <PressableScale
            onPress={clearFilters}
            accessibilityRole="button"
            accessibilityLabel="Quitar filtros"
            hitSlop={8}
            style={[styles.clearChip, clearChipColors]}
          >
            <Animated.Text style={[styles.clearLabel, clearLabelColors]}>Quitar filtro</Animated.Text>
          </PressableScale>
        </View>
      ) : null}

      <SwipeableContent
        index={categoryOrder.indexOf(category)}
        onSwipe={(direction) => setCategory((current) => neighbor(categoryOrder, current, direction, SWIPE_RIGHT_GOES_NEXT))}
      >
        {status === 'loading' && <ActivityIndicator style={styles.loader} />}
        {status === 'error' && (
          <StateMessage
            title="No pudimos cargar tus prendas"
            detail="Revisá tu conexión a internet y probá de nuevo."
            actionLabel="Reintentar"
            onAction={reload}
          />
        )}
        {status === 'ready' && garments.length === 0 && filtering && (
          <StateMessage
            title="No hay prendas con esos filtros"
            detail="Probá con otra época o categoría, o marcá más épocas en tus prendas."
            actionLabel="Quitar filtros"
            onAction={clearFilters}
          />
        )}
        {/* Sin filtros la grilla se muestra aunque esté vacía, para que siempre esté la tarjeta de agregar. */}
        {status === 'ready' && (garments.length > 0 || !filtering) && (
          <Animated.FlatList<GridItem>
            ref={listRef}
            onScroll={onScroll}
            scrollEventThrottle={16}
            data={data}
            keyExtractor={keyOf}
            numColumns={2}
            columnWrapperStyle={styles.column}
            contentContainerStyle={styles.grid}
            renderItem={renderItem}
          />
        )}
      </SwipeableContent>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  header: { paddingHorizontal: SIDE_PADDING, minHeight: SEASONS_TOP - HEADER_TOP },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 34, fontWeight: '700' },
  subtitle: { fontSize: 15 },
  clearRow: { alignItems: 'flex-end', paddingHorizontal: SIDE_PADDING, paddingTop: 10 },
  clearChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  clearLabel: { fontSize: 12, fontWeight: '600' },
  loader: { marginTop: 40 },
  column: { gap: GAP },
  grid: { gap: GAP, padding: SIDE_PADDING },
});
