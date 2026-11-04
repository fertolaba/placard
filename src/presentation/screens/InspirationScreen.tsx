import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DESTACADO_CARD_WIDTH, DestacadoCard } from '../components/DestacadoCard';
import { HeaderActions } from '../components/HeaderActions';
import { ReferenteFilter, type ReferenteFilterValue } from '../components/ReferenteFilter';
import { ReferenteRow } from '../components/ReferenteRow';
import { StateMessage } from '../components/StateMessage';
import { useReferentes, type ReferenteConMatch } from '../hooks/useReferentes';
import { toggleReferenteGuardado, useReferentesGuardados } from '../hooks/useReferentesGuardados';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

const MAX_CONTENT_WIDTH = 480;
const CARD_GAP = 12;
const CARD_INTERVAL = DESTACADO_CARD_WIDTH + CARD_GAP;

const keyOf = (item: ReferenteConMatch) => item.referente.id;

export function InspirationScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, status, reload } = useReferentes();
  const guardados = useReferentesGuardados();
  const [filter, setFilter] = useState<ReferenteFilterValue>('Todos');

  const openDetail = useCallback((id: string) => router.push(`/inspiracion/${id}`), [router]);

  const filtered = useMemo(
    () => (filter === 'Todos' ? items : items.filter((item) => item.referente.estilo === filter)),
    [items, filter],
  );
  const destacados = useMemo(() => filtered.filter((item) => item.referente.destacado), [filtered]);
  const referentes = useMemo(() => filtered.filter((item) => !item.referente.destacado), [filtered]);
  // Se toma de la lista completa: el referente de la semana no cambia al filtrar.
  const semanaId = useMemo(() => items.find((item) => item.referente.destacado)?.referente.id, [items]);

  const renderDestacado = useCallback(
    ({ item }: { item: ReferenteConMatch }) => (
      <DestacadoCard
        item={item}
        etiqueta={item.referente.id === semanaId ? 'Referente de la semana' : item.referente.estilo}
        saved={guardados.has(item.referente.id)}
        onToggleSave={toggleReferenteGuardado}
        onPress={openDetail}
      />
    ),
    [semanaId, guardados, openDetail],
  );

  const renderReferente = useCallback(
    ({ item, index }: { item: ReferenteConMatch; index: number }) => (
      <ReferenteRow
        item={item}
        first={index === 0}
        last={index === referentes.length - 1}
        saved={guardados.has(item.referente.id)}
        onToggleSave={toggleReferenteGuardado}
        onPress={openDetail}
      />
    ),
    [referentes.length, guardados, openDetail],
  );

  // Va como elemento y no como componente: si fuera un componente nuevo en cada render, el carrusel perdería su posición.
  const header = (
    <View>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit>
            Inspiración
          </Text>
          <HeaderActions />
        </View>
        <Text style={styles.subtitle}>Referentes de la moda y su estilo</Text>
      </View>
      <ReferenteFilter value={filter} onChange={setFilter} />

      {status === 'loading' && <ActivityIndicator color={colors.textMuted} style={styles.loader} />}
      {status === 'error' && (
        <View style={styles.message}>
          <StateMessage
            title="No pudimos cargar los referentes"
            detail="Revisá tu conexión a internet y probá de nuevo."
            actionLabel="Reintentar"
            onAction={reload}
          />
        </View>
      )}

      {status === 'ready' && destacados.length > 0 && (
        <>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Destacados
          </Text>
          <FlatList
            horizontal
            data={destacados}
            extraData={guardados}
            keyExtractor={keyOf}
            renderItem={renderDestacado}
            ItemSeparatorComponent={CardGap}
            getItemLayout={(_, index) => ({ length: DESTACADO_CARD_WIDTH, offset: CARD_INTERVAL * index, index })}
            initialNumToRender={2}
            windowSize={3}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_INTERVAL}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            contentContainerStyle={styles.carousel}
          />
        </>
      )}

      {status === 'ready' && referentes.length > 0 && (
        <View style={styles.listHeader}>
          <Text style={styles.listTitle} accessibilityRole="header">
            Referentes
          </Text>
          <Text style={styles.count}>
            {referentes.length} {referentes.length === 1 ? 'persona' : 'personas'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={status === 'ready' ? referentes : []}
      extraData={guardados}
      keyExtractor={keyOf}
      renderItem={renderReferente}
      ListHeaderComponent={header}
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
    />
  );
}

function CardGap() {
  return <View style={{ width: CARD_GAP }} />;
}

const useStyles = makeStyles((colors) => ({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingBottom: 32 + 72 }, // 72: lugar para el botón flotante
  header: { paddingHorizontal: 20, paddingBottom: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontSize: 34, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted },
  loader: { marginTop: 40 },
  message: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 22, marginBottom: 10, paddingHorizontal: 20 },
  carousel: { paddingHorizontal: 20 },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  listTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  count: { fontSize: 14, color: colors.textMuted },
}));
