import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ESTILO_OUTFIT } from '../../domain/entities/Referente';
import { FormGroup } from '../components/FormGroup';
import { ReferenteAvatar } from '../components/ReferenteAvatar';
import { ReferenteGarmentGrid } from '../components/ReferenteGarmentGrid';
import { SaveButton } from '../components/SaveButton';
import { StateMessage } from '../components/StateMessage';
import { useReferentes } from '../hooks/useReferentes';
import { toggleReferenteGuardado, useReferentesGuardados } from '../hooks/useReferentesGuardados';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

const MAX_CONTENT_WIDTH = 480;
const SIDE_PADDING = 20;

export function ReferenteDetailScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, status, reload } = useReferentes();
  const guardados = useReferentesGuardados();

  const item = items.find(({ referente }) => referente.id === id);
  const saved = item !== undefined && guardados.has(item.referente.id);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/inspiracion'));

  const armarLook = () => {
    if (!item) return;
    const estilo = ESTILO_OUTFIT[item.referente.estilo];
    router.navigate({ pathname: '/outfits', params: estilo ? { estilo } : {} });
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 4 }]}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Atrás"
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.link} />
          <Text style={styles.backLabel}>Atrás</Text>
        </Pressable>
        {item && (
          <SaveButton
            nombre={item.referente.nombre}
            saved={saved}
            color={colors.link}
            onPress={() => toggleReferenteGuardado(item.referente.id)}
          />
        )}
      </View>

      {status === 'loading' && <ActivityIndicator style={styles.loader} />}
      {status === 'error' && (
        <StateMessage
          title="No pudimos cargar este referente"
          detail="Revisá tu conexión a internet y probá de nuevo."
          actionLabel="Reintentar"
          onAction={reload}
        />
      )}
      {status === 'ready' && !item && <StateMessage title="No encontramos este referente" detail="Volvé a Inspiración y elegí otro." />}

      {status === 'ready' && item && (
        <>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
            <View style={styles.hero}>
              <ReferenteAvatar iniciales={item.referente.iniciales} color={item.referente.colorAvatar} size={96} />
              <Text style={styles.name} accessibilityRole="header">
                {item.referente.nombre}
              </Text>
              <View style={styles.tags}>
                {item.referente.etiquetas.map((etiqueta) => (
                  <View key={etiqueta} style={styles.tag}>
                    <Text style={styles.tagLabel}>{etiqueta}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle} accessibilityRole="header">
              Su estilo en {item.referente.claves.length} claves
            </Text>
            <FormGroup>
              {item.referente.claves.map((clave) => (
                <View key={clave.titulo} style={styles.clave}>
                  <Text style={styles.claveTitle}>{clave.titulo}</Text>
                  <Text style={styles.claveDetail}>{clave.descripcion}</Text>
                </View>
              ))}
            </FormGroup>

            <View style={styles.garmentsHeader}>
              <Text style={styles.garmentsTitle} accessibilityRole="header">
                Tus prendas
              </Text>
              <Text style={styles.count}>
                {item.match.tengo} de {item.match.total}
              </Text>
            </View>
            <ReferenteGarmentGrid
              match={item.match}
              width={Math.min(width, MAX_CONTENT_WIDTH) - SIDE_PADDING * 2}
            />

            <Text style={styles.notice}>Estilo orientativo: es una interpretación, no una lista oficial de lo que usa.</Text>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <Pressable
              onPress={armarLook}
              accessibilityRole="button"
              accessibilityHint="Abre Outfits con este estilo preseleccionado"
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            >
              <Text style={styles.ctaLabel}>Armar un look inspirado</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  back: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingRight: 8 },
  backLabel: { fontSize: 17, color: colors.link },
  pressed: { opacity: 0.7 },
  loader: { marginTop: 40 },
  scroll: { flex: 1 },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingHorizontal: SIDE_PADDING, paddingBottom: 24 },
  hero: { alignItems: 'center', gap: 10, paddingTop: 4 },
  name: { fontSize: 28, fontWeight: '700', color: colors.text, textAlign: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  tag: { backgroundColor: colors.primaryFill, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagLabel: { fontSize: 12, fontWeight: '600', color: colors.link },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 22, marginBottom: 10 },
  clave: { flex: 1, paddingVertical: 10 },
  claveTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  claveDetail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  garmentsHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2, marginBottom: 10 },
  garmentsTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  count: { fontSize: 14, color: colors.textMuted },
  notice: { fontSize: 12, color: colors.textMuted, marginTop: 18 },
  footer: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 12,
    backgroundColor: colors.background,
  },
  cta: { minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  ctaLabel: { fontSize: 17, fontWeight: '600', color: colors.onPrimary },
}));
