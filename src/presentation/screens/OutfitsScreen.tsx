import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Outfit } from '../../domain/entities/Outfit';
import type { StyleId } from '../../domain/entities/StyleReference';
import { OutfitCard } from '../components/OutfitCard';
import { OutfitExplanationModal } from '../components/OutfitExplanationModal';
import { OutfitMiniCard } from '../components/OutfitMiniCard';
import { StateMessage } from '../components/StateMessage';
import { StyleList } from '../components/StyleList';
import { StyleProgressCard } from '../components/StyleProgressCard';
import { useOutfitSuggestions } from '../hooks/useOutfitSuggestions';
import { useStyleMatches } from '../hooks/useStyleMatches';
import { makeStyles } from '../theme/makeStyles';

const MAX_CONTENT_WIDTH = 480;

export function OutfitsScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { outfits, status, reload } = useOutfitSuggestions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Por ahora "Guardar" vive solo mientras la app está abierta; se persiste cuando agreguemos la base de datos.
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(new Set());
  const [explained, setExplained] = useState<Outfit | null>(null); // el look que muestra "Ver por qué"
  // Los estilos van aparte de los outfits por color: cada parte carga (o falla) sin afectar a la otra.
  const { matches, status: stylesStatus, reload: reloadStyles } = useStyleMatches();
  const [selectedStyleId, setSelectedStyleId] = useState<StyleId | null>(null);
  const currentStyle = matches.find((match) => match.reference.id === selectedStyleId) ?? matches[0];

  const current = outfits.find((outfit) => outfit.id === selectedId) ?? outfits[0];
  const others = outfits.filter((outfit) => outfit.id !== current?.id).slice(0, 2);

  const showNext = () => {
    if (!current || outfits.length < 2) return;
    const index = outfits.findIndex((outfit) => outfit.id === current.id);
    setSelectedId(outfits[(index + 1) % outfits.length].id);
  };

  const toggleSave = (id: string) =>
    setSavedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
    >
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Outfits
        </Text>
        <Text style={styles.subtitle}>Combinaciones según el color de tu ropa</Text>
      </View>

      {status === 'loading' && <ActivityIndicator style={styles.loader} />}
      {status === 'error' && (
        <StateMessage
          title="No pudimos armar tus outfits"
          detail="Revisá tu conexión a internet y probá de nuevo."
          actionLabel="Reintentar"
          onAction={reload}
        />
      )}
      {status === 'ready' && !current && (
        <StateMessage
          title="Todavía no hay combinaciones"
          detail="Para armar un look necesitás al menos una prenda de arriba (o un top) y una de abajo (o una pollera)."
        />
      )}
      {status === 'ready' && current && (
        <>
          <OutfitCard
            outfit={current}
            saved={savedIds.has(current.id)}
            onToggleSave={() => toggleSave(current.id)}
            onNext={outfits.length > 1 ? showNext : undefined}
            onExplain={() => setExplained(current)}
          />
          {others.length > 0 && (
            <>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Más combinaciones
              </Text>
              <View style={styles.others}>
                {others.map((outfit) => (
                  <OutfitMiniCard
                    key={outfit.id}
                    outfit={outfit}
                    onPress={() => setSelectedId(outfit.id)}
                    onExplain={() => setExplained(outfit)}
                  />
                ))}
              </View>
            </>
          )}
        </>
      )}

      {stylesStatus === 'loading' && status !== 'loading' && <ActivityIndicator style={styles.loader} />}
      {stylesStatus === 'error' && (
        <StateMessage
          title="No pudimos cargar los estilos"
          detail="Revisá tu conexión a internet y probá de nuevo."
          actionLabel="Reintentar"
          onAction={reloadStyles}
        />
      )}
      {stylesStatus === 'ready' && currentStyle && (
        <>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            {currentStyle.reference.name}
          </Text>
          <StyleProgressCard match={currentStyle} />

          <Text style={styles.sectionTitle} accessibilityRole="header">
            Estilos
          </Text>
          <StyleList matches={matches} selectedId={currentStyle.reference.id} onSelect={setSelectedStyleId} />
        </>
      )}

      {/* El Modal se dibuja encima de toda la pantalla, aunque esté declarado dentro del ScrollView. */}
      <OutfitExplanationModal outfit={explained} onClose={() => setExplained(null)} />
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 32 },
  header: { paddingBottom: 14 },
  title: { fontSize: 34, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted },
  loader: { marginTop: 40 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 22, marginBottom: 10 },
  others: { flexDirection: 'row', gap: 12 },
}));