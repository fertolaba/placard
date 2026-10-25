import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Outfit } from '../../domain/entities/Outfit';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';
import { ColorBreakdown } from './ColorBreakdown';
import { GarmentSwatch } from './GarmentSwatch';

interface Props {
  outfit: Outfit | null; // null = cerrado
  onClose: () => void;
}

/** Ventana de "Ver por qué": la regla de color del look, los detalles que se repiten y el contraste de luz. */
export function OutfitExplanationModal({ outfit, onClose }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const explanation = outfit?.explanation;

  return (
    <Modal visible={outfit !== null} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar" accessibilityRole="button" />
        {outfit && explanation ? (
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]} accessibilityViewIsModal>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title} accessibilityRole="header">
                Por qué combinan
              </Text>
              <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={10} style={styles.close}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
              <View style={styles.pieces}>
                {outfit.garments.map((garment) => (
                  <View key={garment.id} style={styles.piece}>
                    <GarmentSwatch garment={garment} height={64} iconSize={24} />
                    <Text style={styles.pieceName} numberOfLines={1}>
                      {garment.name}
                    </Text>
                    <ColorBreakdown garment={garment} compact />
                  </View>
                ))}
              </View>

              <View style={styles.ruleRow}>
                <View style={styles.ruleBadge}>
                  <Ionicons name="color-palette-outline" size={14} color={colors.link} />
                  <Text style={styles.ruleBadgeLabel}>{explanation.ruleName}</Text>
                </View>
                <Text style={styles.match}>{outfit.matchPercent}% match</Text>
              </View>
              <Text style={styles.text}>{explanation.ruleText}</Text>

              {explanation.echoes.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle} accessibilityRole="header">
                    Detalles que se repiten
                  </Text>
                  {explanation.echoes.map((echo) => (
                    <View key={`${echo.from.id}-${echo.to.id}-${echo.color.hex}`} style={styles.echo}>
                      <View style={[styles.echoDot, { backgroundColor: echo.color.hex }]} />
                      <Text style={[styles.text, styles.echoText]}>{echo.text}</Text>
                    </View>
                  ))}
                </>
              ) : null}

              {explanation.contrastText ? (
                <>
                  <Text style={styles.sectionTitle} accessibilityRole="header">
                    Luz y contraste
                  </Text>
                  <Text style={styles.text}>{explanation.contrastText}</Text>
                </>
              ) : null}
            </ScrollView>

            <Pressable onPress={onClose} accessibilityRole="button" style={styles.done}>
              <Text style={styles.doneLabel}>Entendido</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handle: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: colors.fillMuted, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  close: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.fillMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingBottom: 16 },
  pieces: { flexDirection: 'row', gap: 8, marginTop: 8 },
  piece: { flex: 1 },
  pieceName: { fontSize: 12, fontWeight: '600', color: colors.text, marginTop: 6 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, gap: 8 },
  ruleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryFill,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ruleBadgeLabel: { fontSize: 13, fontWeight: '600', color: colors.link },
  match: { fontSize: 13, fontWeight: '600', color: colors.successText },
  text: { fontSize: 15, lineHeight: 21, color: colors.text, marginTop: 10 },
  sectionTitle: { fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', marginTop: 20 },
  echo: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  echoDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.swatchBorder,
  },
  echoText: { flex: 1 },
  done: { height: 50, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  doneLabel: { fontSize: 17, fontWeight: '600', color: colors.onPrimary },
}));
