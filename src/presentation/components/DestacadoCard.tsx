import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { readableOn } from '../../core/utils/color';
import type { ReferenteConMatch } from '../hooks/useReferentes';
import { LookIllustration } from './LookIllustration';
import { MatchRing } from './MatchRing';
import { PaletteDots } from './PaletteDots';
import { PressableScale } from './PressableScale';
import { getReferenteImages } from './referenteImages';
import { SaveButton } from './SaveButton';

export const DESTACADO_CARD_WIDTH = 300;

interface Props {
  item: ReferenteConMatch;
  etiqueta: string;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onPress: (id: string) => void;
}

/** Los colores salen del referente y no del tema: la tarjeta se ve igual en modo claro y oscuro. */
export const DestacadoCard = memo(function DestacadoCard({ item, etiqueta, saved, onToggleSave, onPress }: Props) {
  const { referente, match } = item;
  const foreground = readableOn(referente.colorTarjeta);
  const { avatar } = getReferenteImages(referente.id);
  const tag = (
    <View style={styles.tag}>
      <Text style={styles.tagLabel} numberOfLines={1}>
        {etiqueta}
      </Text>
    </View>
  );
  return (
    <PressableScale
      onPress={() => onPress(referente.id)}
      accessibilityRole="button"
      accessibilityLabel={`${referente.nombre}. ${referente.resumen}`}
      accessibilityHint="Abre el detalle de su estilo"
      // En iOS, VoiceOver no entra a los hijos de la tarjeta: el marcador se ofrece como una acción.
      accessibilityActions={[{ name: 'toggleSave', label: saved ? `Quitar a ${referente.nombre} de guardados` : `Guardar a ${referente.nombre}` }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'toggleSave') onToggleSave(referente.id);
      }}
      style={[styles.card, { backgroundColor: referente.colorTarjeta }]}
    >
      {avatar !== undefined ? (
        <View style={styles.photoWrap}>
          <Image
            source={avatar}
            contentFit="cover"
            contentPosition="top"
            cachePolicy="memory-disk"
            recyclingKey={referente.id}
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, styles.photoScrim]} pointerEvents="none" />
          <View style={styles.photoTop}>
            {tag}
            <SaveButton nombre={referente.nombre} saved={saved} color="#FFFFFF" onPress={() => onToggleSave(referente.id)} />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.top}>
            {tag}
            <SaveButton nombre={referente.nombre} saved={saved} color={foreground} onPress={() => onToggleSave(referente.id)} />
          </View>

          <View style={styles.center}>
            <Text
              style={[styles.initials, { color: foreground }]}
              numberOfLines={1}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              {referente.iniciales}
            </Text>
            <LookIllustration referente={referente} height={160} />
          </View>
        </>
      )}

      <Text style={[styles.name, { color: foreground }]} numberOfLines={1} adjustsFontSizeToFit accessibilityRole="header">
        {referente.nombre}
      </Text>
      <Text style={[styles.summary, { color: foreground }]} numberOfLines={2}>
        {referente.resumen}
      </Text>

      <View style={styles.spacer} />

      <View style={styles.matchRow}>
        <MatchRing percent={match.porcentaje} color={foreground} trackColor={`${foreground}33`} />
        <View style={styles.matchInfo}>
          <Text style={[styles.matchText, { color: foreground }]}>
            Tenés {match.tengo} de {match.total} prendas
          </Text>
          <PaletteDots colors={referente.paleta} size={18} />
        </View>
      </View>

      <Pressable
        onPress={() => onPress(referente.id)}
        accessible={false}
        importantForAccessibility="no"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonLabel}>Ver su estilo</Text>
        <Ionicons name="chevron-forward" size={18} color={BUTTON_TEXT} />
      </Pressable>
    </PressableScale>
  );
});

const BUTTON_TEXT = '#1C1C1E';

const styles = StyleSheet.create({
  // flexGrow: todas las tarjetas del carrusel miden lo que la más alta, tengan foto o ilustración.
  card: { width: DESTACADO_CARD_WIDTH, flexGrow: 1, borderRadius: 24, padding: 16, overflow: 'hidden' },
  photoWrap: { height: 160, marginTop: -16, marginHorizontal: -16, borderRadius: 16, overflow: 'hidden' },
  photoScrim: { backgroundColor: 'rgba(0,0,0,0.25)' },
  photoTop: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spacer: { flexGrow: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: -10, marginTop: -6 },
  tag: {
    flexShrink: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagLabel: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  center: { height: 168, alignItems: 'center', justifyContent: 'center' },
  initials: { position: 'absolute', fontSize: 130, fontWeight: '800', letterSpacing: -4, opacity: 0.08 },
  name: { fontSize: 28, fontWeight: '700', marginTop: 8 },
  summary: { fontSize: 14, lineHeight: 19, minHeight: 38, marginTop: 2, opacity: 0.85 },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  matchInfo: { flex: 1, gap: 6 },
  matchText: { fontSize: 15, fontWeight: '600' },
  button: {
    flexDirection: 'row',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 14,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
  },
  pressed: { opacity: 0.7 },
  buttonLabel: { fontSize: 16, fontWeight: '600', color: BUTTON_TEXT },
});
