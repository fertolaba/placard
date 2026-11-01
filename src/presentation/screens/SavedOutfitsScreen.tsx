import { useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderActions } from '../components/HeaderActions';
import { VariantCard } from '../components/outfits/StyleVariantsSection';
import { StateMessage } from '../components/StateMessage';
import { useGarments } from '../hooks/useGarments';
import { useOutfitsTheme } from '../outfits/outfitsTheme';
import { savedOutfitView } from '../outfits/savedOutfitView';
import type { StyleVariant } from '../outfits/styleVariants';
import { useWarmTabBar } from '../outfits/useWarmTabBar';
import { toggleSavedOutfit, useSavedOutfits } from '../state/savedOutfits';

const MAX_CONTENT_WIDTH = 480;

export function SavedOutfitsScreen() {
  const insets = useSafeAreaInsets();
  const { tokens, transition } = useOutfitsTheme();
  useWarmTabBar();
  const saved = useSavedOutfits();
  const { garments, status, reload } = useGarments('todo');

  const views = useMemo(() => {
    const wardrobe = new Map(garments.map((garment) => [garment.id, garment]));
    return saved.flatMap((item) => savedOutfitView(item, wardrobe) ?? []);
  }, [saved, garments]);

  const remove = useCallback(
    ({ id }: StyleVariant) => {
      const item = saved.find((outfit) => outfit.id === id);
      if (item) toggleSavedOutfit(item);
    },
    [saved],
  );

  return (
    <Animated.View style={[styles.root, { backgroundColor: tokens.body }, transition]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Animated.Text style={[styles.title, { color: tokens.text }, transition]} accessibilityRole="header">
              Guardados
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, { color: tokens.sub }, transition]}>Los outfits que marcaste</Animated.Text>
          </View>
          <HeaderActions />
        </View>

        {status === 'loading' && <ActivityIndicator style={styles.loader} color={tokens.accent} />}
        {status === 'error' && (
          <StateMessage
            title="No pudimos cargar tus guardados"
            detail="Revisá tu conexión a internet y probá de nuevo."
            actionLabel="Reintentar"
            onAction={reload}
          />
        )}
        {status === 'ready' && views.length === 0 && (
          <Animated.View style={[styles.empty, { borderColor: tokens.line }, transition]}>
            <Animated.Text style={[styles.emptyText, { color: tokens.sub }, transition]}>
              Todavía no guardaste outfits. Deslizá a la derecha en Outfits para guardar.
            </Animated.Text>
          </Animated.View>
        )}
        {status === 'ready' && views.length > 0 && (
          <View style={styles.grid}>
            {views.map(({ variant, gradient }) => (
              <VariantCard key={variant.id} variant={variant} gradient={gradient} width="48%" saved onToggleSave={remove} />
            ))}
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, paddingBottom: 14 },
  headerText: { flex: 1 },
  title: { fontSize: 34, fontWeight: '700' },
  subtitle: { fontSize: 16 },
  loader: { marginTop: 40 },
  empty: { marginHorizontal: 20, marginTop: 16, padding: 24, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 24 },
  emptyText: { fontSize: 15, lineHeight: 21, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, paddingHorizontal: 20 },
});
