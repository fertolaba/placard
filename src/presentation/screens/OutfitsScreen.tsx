import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Outfit } from '../../domain/entities/Outfit';
import type { SavedOutfit } from '../../domain/entities/SavedOutfit';
import { STYLE_IDS, type StyleId } from '../../domain/entities/StyleReference';
import { OutfitExplanationModal } from '../components/OutfitExplanationModal';
import { OutfitDeck, type DeckDecision } from '../components/outfits/OutfitDeck';
import { StyleCarousel } from '../components/outfits/StyleCarousel';
import { StyleDetailCard } from '../components/outfits/StyleDetailCard';
import { StyleVariantsSection } from '../components/outfits/StyleVariantsSection';
import { StateMessage } from '../components/StateMessage';
import { HeaderActions } from '../components/HeaderActions';
import { useGarments } from '../hooks/useGarments';
import { useOutfitSuggestions } from '../hooks/useOutfitSuggestions';
import { useStyleMatches } from '../hooks/useStyleMatches';
import { useOutfitsTheme } from '../outfits/outfitsTheme';
import { styleCoverage } from '../outfits/styleVariants';
import { useWarmTabBar } from '../outfits/useWarmTabBar';
import { toggleSavedOutfit, useSavedOutfits } from '../state/savedOutfits';

const MAX_CONTENT_WIDTH = 480;
const DECK_SIZE = 30; // el estado vacío invita a sumar prendas: el mazo no se puede cortar mucho antes de agotar las ideas

const saveHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined); // sin vibración, se guarda igual
};

export function OutfitsScreen() {
  const insets = useSafeAreaInsets();
  const { tokens, transition } = useOutfitsTheme();
  const { outfits, status, reload } = useOutfitSuggestions(DECK_SIZE);
  const saved = useSavedOutfits();
  const savedIds = useMemo(() => new Set(saved.map((outfit) => outfit.id)), [saved]);
  const [explained, setExplained] = useState<Outfit | null>(null); // el look que muestra "Ver por qué"

  // Si cambian las ideas (por ejemplo, una prenda nueva), el mazo arranca de cero.
  const [deckIndex, setDeckIndex] = useState(0);
  const deckKey = outfits.map((outfit) => outfit.id).join('|');
  const [shownDeckKey, setShownDeckKey] = useState(deckKey);
  if (deckKey !== shownDeckKey) {
    setShownDeckKey(deckKey);
    setDeckIndex(0);
  }

  // Los estilos van aparte de los outfits por color: cada parte carga (o falla) sin afectar a la otra.
  const { matches, status: stylesStatus, reload: reloadStyles } = useStyleMatches();
  // GetStyleMatches asigna una sola prenda por pieza; las variantes necesitan todas las del placard.
  const { garments, status: garmentsStatus, reload: reloadGarments } = useGarments('todo');
  const [selectedStyleId, setSelectedStyleId] = useState<StyleId | null>(null);
  const coverages = useMemo(() => matches.map((match) => styleCoverage(match.reference, garments)), [matches, garments]);
  const currentStyle = coverages.find((coverage) => coverage.reference.id === selectedStyleId) ?? coverages[0];
  const sectionStatus = stylesStatus === 'error' || garmentsStatus === 'error' ? 'error' : stylesStatus === 'ready' && garmentsStatus === 'ready' ? 'ready' : 'loading';

  // Inspiración puede abrir esta pestaña con un estilo: se selecciona y se baja hasta esa sección.
  const router = useRouter();
  const { estilo } = useLocalSearchParams<{ estilo?: string }>();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const stylesY = useRef<number | null>(null);
  const pendingScroll = useRef(false);

  const requestedStyleId = STYLE_IDS.find((styleId) => styleId === estilo);
  if (requestedStyleId && requestedStyleId !== selectedStyleId) setSelectedStyleId(requestedStyleId);

  useEffect(() => {
    if (!requestedStyleId) return;
    if (stylesY.current === null) pendingScroll.current = true;
    else scrollRef.current?.scrollTo({ y: stylesY.current, animated: true });
    router.setParams({ estilo: undefined }); // así el mismo estilo se puede volver a pedir más tarde
  }, [requestedStyleId, router]);

  useWarmTabBar();

  const decide = useCallback(
    (outfit: Outfit, decision: DeckDecision) => {
      if (decision !== 'save') return;
      saveHaptic();
      if (!savedIds.has(outfit.id)) {
        toggleSavedOutfit({ id: outfit.id, garmentIds: outfit.garments.map((garment) => garment.id), styleId: null, title: outfit.title });
      }
    },
    [savedIds],
  );
  const advance = useCallback(() => setDeckIndex((index) => index + 1), []);
  const restart = useCallback(() => setDeckIndex(0), []);

  const toggleVariant = useCallback(
    (outfit: SavedOutfit) => {
      if (!savedIds.has(outfit.id)) saveHaptic();
      toggleSavedOutfit(outfit);
    },
    [savedIds],
  );

  const ideaNumber = Math.min(deckIndex + 1, outfits.length);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Animated.View style={[styles.root, { backgroundColor: tokens.body }, transition]}>
        <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Animated.Text style={[styles.title, { color: tokens.text }, transition]} accessibilityRole="header">
                Outfits
              </Animated.Text>
              <Animated.Text style={[styles.subtitle, { color: tokens.sub }, transition]}>
                Combinaciones según el color de tu ropa
              </Animated.Text>
            </View>
            <HeaderActions />
          </View>

          {status === 'loading' && <ActivityIndicator style={styles.loader} color={tokens.accent} />}
          {status === 'error' && (
            <StateMessage
              title="No pudimos armar tus outfits"
              detail="Revisá tu conexión a internet y probá de nuevo."
              actionLabel="Reintentar"
              onAction={reload}
            />
          )}
          {status === 'ready' && outfits.length === 0 && (
            <StateMessage
              title="Todavía no hay combinaciones"
              detail="Para armar un look necesitás al menos una prenda de arriba (o un top) y una de abajo (o una pollera)."
            />
          )}
          {status === 'ready' && outfits.length > 0 && (
            <>
              <View style={styles.deckLabelRow}>
                <Animated.Text style={[styles.accentLabel, styles.deckLabel, { color: tokens.accent }, transition]}>
                  Outfits según combinación de color
                </Animated.Text>
                <View
                  style={styles.saved}
                  accessible
                  accessibilityLabel={`${savedIds.size} ${savedIds.size === 1 ? 'outfit guardado' : 'outfits guardados'}`}
                >
                  <Ionicons name="heart" size={14} color={tokens.primary} />
                  <Animated.Text style={[styles.savedCount, { color: tokens.primary }, transition]}>{savedIds.size}</Animated.Text>
                </View>
                <Animated.Text style={[styles.ideaCount, { color: tokens.sub }, transition]}>
                  Idea {ideaNumber} de {outfits.length}
                </Animated.Text>
              </View>
              <OutfitDeck
                outfits={outfits}
                index={deckIndex}
                savedCount={savedIds.size}
                onDecide={decide}
                onAdvance={advance}
                onExplain={setExplained}
                onRestart={restart}
              />
            </>
          )}

          {sectionStatus === 'loading' && status !== 'loading' && <ActivityIndicator style={styles.loader} color={tokens.accent} />}
          {sectionStatus === 'error' && (
            <StateMessage
              title="No pudimos cargar los estilos"
              detail="Revisá tu conexión a internet y probá de nuevo."
              actionLabel="Reintentar"
              onAction={() => {
                reloadStyles();
                reloadGarments();
              }}
            />
          )}
          {sectionStatus === 'ready' && currentStyle && (
            <View
              onLayout={(event) => {
                stylesY.current = event.nativeEvent.layout.y;
                // Mientras cargan los outfits de arriba, esta sección todavía se va a mover.
                if (pendingScroll.current && status !== 'loading') {
                  pendingScroll.current = false;
                  scrollRef.current?.scrollTo({ y: stylesY.current, animated: true });
                }
              }}
            >
              <Animated.View style={[styles.divider, { backgroundColor: tokens.line }, transition]} />
              <View style={styles.sectionHeader}>
                <Animated.Text style={[styles.accentLabel, { color: tokens.accent }, transition]}>Outfits según estilo</Animated.Text>
                <Animated.Text style={[styles.sectionTitle, { color: tokens.text }, transition]} accessibilityRole="header">
                  ¿Cómo querés vestirte hoy?
                </Animated.Text>
                <Animated.Text style={[styles.sectionSubtitle, { color: tokens.sub }, transition]}>
                  Elegí un estilo y mirá qué piezas ya tenés.
                </Animated.Text>
              </View>
              <StyleCarousel coverages={coverages} selectedId={currentStyle.reference.id} onSelect={setSelectedStyleId} />
              <StyleDetailCard coverage={currentStyle} />
              <StyleVariantsSection
                key={currentStyle.reference.id}
                coverage={currentStyle}
                savedIds={savedIds}
                onToggleSave={toggleVariant}
              />
            </View>
          )}
        </ScrollView>
      </Animated.View>
      <OutfitExplanationModal outfit={explained} onClose={() => setExplained(null)} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingBottom: 32 + 72, overflow: 'hidden' }, // 72: lugar para el botón flotante
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, paddingBottom: 14 },
  headerText: { flex: 1 },
  title: { fontSize: 34, fontWeight: '700' },
  subtitle: { fontSize: 16 },
  loader: { marginTop: 40 },
  deckLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20 },
  accentLabel: { fontSize: 15, fontWeight: '600' },
  deckLabel: { flex: 1 },
  saved: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  savedCount: { fontSize: 13, fontWeight: '700' },
  ideaCount: { fontSize: 13 },
  divider: { height: 1, marginHorizontal: 20, marginTop: 28 },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 6, gap: 4 },
  sectionTitle: { fontSize: 22, fontWeight: '700' },
  sectionSubtitle: { fontSize: 15 },
});
