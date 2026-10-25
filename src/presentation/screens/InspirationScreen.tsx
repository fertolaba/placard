import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StyleId } from '../../domain/entities/StyleReference';
import { StateMessage } from '../components/StateMessage';
import { StyleHero } from '../components/StyleHero';
import { StyleList } from '../components/StyleList';
import { StyleProgressCard } from '../components/StyleProgressCard';
import { useStyleMatches } from '../hooks/useStyleMatches';
import { makeStyles } from '../theme/makeStyles';

const MAX_CONTENT_WIDTH = 480;

export function InspirationScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const { matches, status, reload } = useStyleMatches();
  const [selectedId, setSelectedId] = useState<StyleId | null>(null);

  const current = matches.find((match) => match.reference.id === selectedId) ?? matches[0];

  const select = (id: StyleId) => {
    setSelectedId(id);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
    >
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Inspiración
        </Text>
        <Text style={styles.subtitle}>Referencias de estilo para armar con tu ropa</Text>
      </View>

      {status === 'loading' && <ActivityIndicator style={styles.loader} />}
      {status === 'error' && (
        <StateMessage
          title="No pudimos cargar las referencias"
          detail="Revisá tu conexión a internet y probá de nuevo."
          actionLabel="Reintentar"
          onAction={reload}
        />
      )}

      {status === 'ready' && current && (
        <>
          <StyleHero reference={current.reference} />
          <StyleProgressCard match={current} />

          <Text style={styles.sectionTitle} accessibilityRole="header">
            Estilos
          </Text>
          <StyleList matches={matches} selectedId={current.reference.id} onSelect={select} />
        </>
      )}
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
}));
