import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormGroup } from '../components/FormGroup';
import { StateMessage } from '../components/StateMessage';
import { StyleHero } from '../components/StyleHero';
import { StyleProgressCard } from '../components/StyleProgressCard';
import { useStyleMatches } from '../hooks/useStyleMatches';
import { makeStyles } from '../theme/makeStyles';

const MAX_CONTENT_WIDTH = 480;

export function InspirationScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const { matches, status, reload } = useStyleMatches();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const current = matches.find((match) => match.reference.id === selectedId) ?? matches[0];

  const select = (id: string) => {
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
          detail="Revisá tu conexión y que el servidor esté encendido."
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
          <FormGroup>
            {matches.map((match) => {
              const selected = match.reference.id === current.reference.id;
              const total = match.matched.length + match.missing.length;
              return (
                <Pressable
                  key={match.reference.id}
                  onPress={() => select(match.reference.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={styles.styleRow}
                >
                  <View style={styles.styleInfo}>
                    <Text style={styles.styleName}>{match.reference.name}</Text>
                    <Text style={styles.styleMeta}>
                      {match.matched.length} de {total} piezas
                    </Text>
                  </View>
                  <View style={styles.dots}>
                    {match.reference.palette.map((hex) => (
                      <View key={hex} style={[styles.dot, { backgroundColor: hex }]} />
                    ))}
                  </View>
                  <Text
                    style={[styles.check, { opacity: selected ? 1 : 0 }]}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  >
                    ✓
                  </Text>
                </Pressable>
              );
            })}
          </FormGroup>
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
  styleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  styleInfo: { flex: 1 },
  styleName: { fontSize: 17, color: colors.text },
  styleMeta: { fontSize: 13, color: colors.textMuted },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.swatchBorder },
  check: { fontSize: 17, fontWeight: '700', color: colors.link },
}));