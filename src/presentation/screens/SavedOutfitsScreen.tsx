import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, LayoutAnimation, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Outfit } from '../../domain/entities/Outfit';
import type { SavedOutfit } from '../../domain/entities/SavedOutfit';
import { HeaderActions } from '../components/HeaderActions';
import { OutfitExplanationModal } from '../components/OutfitExplanationModal';
import { SavedEmptyState } from '../components/saved/SavedEmptyState';
import { SavedFilters } from '../components/saved/SavedFilters';
import { SavedOutfitCard } from '../components/saved/SavedOutfitCard';
import { UndoToast } from '../components/saved/UndoToast';
import { StateMessage } from '../components/StateMessage';
import { useGarments } from '../hooks/useGarments';
import { useOutfitsTheme } from '../outfits/outfitsTheme';
import {
  matchesSavedFilter,
  savedOutfitDetail,
  savedOutfitView,
  type SavedFilter,
  type SavedOutfitView,
} from '../outfits/savedOutfitView';
import { useWarmTabBar } from '../outfits/useWarmTabBar';
import { restoreSavedOutfit, toggleSavedOutfit, useSavedOutfits } from '../state/savedOutfits';

const MAX_CONTENT_WIDTH = 480;
const SIDE_PADDING = 20;
const GAP = 12;
const UNDO_MS = 4000;
const REFLOW = LayoutAnimation.create(200, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity);

const keyOf = (view: SavedOutfitView) => view.saved.id;

export function SavedOutfitsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { tokens, transition, reducedMotion } = useOutfitsTheme();
  useWarmTabBar();
  const saved = useSavedOutfits();
  const { garments, status, reload } = useGarments('todo');
  const [filter, setFilter] = useState<SavedFilter>('todos');
  const [explained, setExplained] = useState<Outfit | null>(null);
  // Se borra enseguida y "Deshacer" lo repone en su lugar: así Outfits nunca muestra un corazón desactualizado.
  const [removed, setRemoved] = useState<{ outfit: SavedOutfit; index: number } | null>(null);

  useEffect(() => {
    if (!removed) return;
    const timer = setTimeout(() => setRemoved(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [removed]);

  const views = useMemo(() => {
    const wardrobe = new Map(garments.map((garment) => [garment.id, garment]));
    return saved.flatMap((item) => savedOutfitView(item, wardrobe) ?? []);
  }, [saved, garments]);

  const counts = useMemo(
    () => ({
      todos: views.length,
      color: views.filter((view) => matchesSavedFilter(view, 'color')).length,
      estilo: views.filter((view) => matchesSavedFilter(view, 'estilo')).length,
    }),
    [views],
  );
  const visible = useMemo(() => views.filter((view) => matchesSavedFilter(view, filter)), [views, filter]);

  const animateReflow = useCallback(() => {
    if (!reducedMotion) LayoutAnimation.configureNext(REFLOW);
  }, [reducedMotion]);

  const remove = useCallback(
    (view: SavedOutfitView) => {
      animateReflow();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      setRemoved({ outfit: view.saved, index: saved.findIndex((item) => item.id === view.saved.id) });
      toggleSavedOutfit(view.saved);
    },
    [saved, animateReflow],
  );

  const undo = useCallback(() => {
    if (!removed) return;
    animateReflow();
    restoreSavedOutfit(removed.outfit, removed.index);
    setRemoved(null);
  }, [removed, animateReflow]);

  const open = useCallback((view: SavedOutfitView) => setExplained(savedOutfitDetail(view)), []);
  const goToOutfits = useCallback(() => router.navigate('/outfits'), [router]);

  const cardWidth = (Math.min(width, MAX_CONTENT_WIDTH) - SIDE_PADDING * 2 - GAP) / 2;
  const renderItem = useCallback(
    ({ item }: { item: SavedOutfitView }) => <SavedOutfitCard view={item} width={cardWidth} onRemove={remove} onOpen={open} />,
    [cardWidth, remove, open],
  );

  const total = counts.todos;
  const header = (
    <View>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Animated.Text style={[styles.title, { color: tokens.text }, transition]} accessibilityRole="header">
            Guardados
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { color: tokens.sub }, transition]}>
            {total} {total === 1 ? 'outfit guardado' : 'outfits guardados'}
          </Animated.Text>
        </View>
        <HeaderActions />
      </View>
      <SavedFilters value={filter} counts={counts} onChange={setFilter} />
      {status === 'loading' && <ActivityIndicator style={styles.loader} color={tokens.accent} />}
      {status === 'error' && (
        <StateMessage
          title="No pudimos cargar tus guardados"
          detail="Revisá tu conexión a internet y probá de nuevo."
          actionLabel="Reintentar"
          onAction={reload}
        />
      )}
    </View>
  );

  return (
    <Animated.View style={[styles.root, { backgroundColor: tokens.body }, transition]}>
      <FlatList
        data={status === 'ready' ? visible : []}
        keyExtractor={keyOf}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.column}
        ListHeaderComponent={header}
        ListEmptyComponent={status === 'ready' ? <SavedEmptyState hasSaved={total > 0} onGoToOutfits={goToOutfits} /> : undefined}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: (removed ? 84 : 24) + 72 }]} // 72: lugar para el botón flotante
      />
      {removed ? <UndoToast onUndo={undo} /> : null}
      <OutfitExplanationModal outfit={explained} onClose={() => setExplained(null)} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', gap: GAP },
  column: { gap: GAP, paddingHorizontal: SIDE_PADDING },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingHorizontal: SIDE_PADDING, paddingBottom: 14 },
  headerText: { flex: 1 },
  title: { fontSize: 34, fontWeight: '700' },
  subtitle: { fontSize: 16 },
  loader: { marginTop: 40 },
});
