import { Ionicons } from '@expo/vector-icons';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { PAPER, useOutfitsTheme } from '../../outfits/outfitsTheme';
import type { SavedOutfitView } from '../../outfits/savedOutfitView';
import { GradientFill } from '../outfits/GradientFill';
import { StyleGarmentsRow } from '../outfits/StyleGarmentsRow';

const ENTERING = FadeInDown.duration(350).withInitialValues({ opacity: 0, transform: [{ translateY: 12 }] });
const SHARE_ICON = 'M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6';

interface Props {
  view: SavedOutfitView;
  width: number;
  onRemove: (view: SavedOutfitView) => void;
  onOpen: (view: SavedOutfitView) => void;
}

export const SavedOutfitCard = memo(function SavedOutfitCard({ view, width, onRemove, onOpen }: Props) {
  const { tokens, transition, reducedMotion } = useOutfitsTheme();
  const { variant, gradient, title, origin } = view;
  const matchLabel = variant.complete ? `${variant.matchPercent}% match` : 'Incompleto';
  const garments = useMemo(() => ({ torso: variant.top, piernas: variant.bottom, pies: variant.shoe }), [variant]);

  return (
    <Animated.View entering={reducedMotion ? undefined : ENTERING} style={{ width }}>
      <Animated.View style={[styles.card, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }, transition]}>
        {/* Lo lee el lector de pantalla desde la zona táctil de abajo: un toque que envolviera a los botones los escondería. */}
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={styles.top}>
            <GradientFill from={gradient.from} to={gradient.to} />
            <View style={styles.circle} />
            <View style={styles.silhouettes}>
              <StyleGarmentsRow garments={garments} size={0.68} styleId={view.saved.styleId} />
            </View>
          </View>
          <View style={styles.bottom}>
            <Animated.Text style={[styles.origin, { color: tokens.accent }, transition]} numberOfLines={1}>
              {origin.toUpperCase()}
            </Animated.Text>
            <Animated.Text style={[styles.title, { color: tokens.text }, transition]} numberOfLines={2}>
              {title}
            </Animated.Text>
            <View style={styles.matchRow}>
              <Animated.Text style={[styles.match, { color: tokens.sub }, transition]}>{matchLabel}</Animated.Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => onOpen(view)}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={`${title}, ${origin}, ${matchLabel}. Ver por qué combina`}
        />
        <Pressable
          onPress={() => onRemove(view)}
          accessibilityRole="button"
          accessibilityLabel={`Quitar de guardados: ${title}`}
          hitSlop={2}
          style={styles.heart}
        >
          <Ionicons name="heart" size={20} color={PAPER.heart} />
        </Pressable>
        {/* Preparado: todavía no existe el flujo de compartir en historias. */}
        <Pressable
          disabled
          accessibilityRole="button"
          accessibilityLabel={`Compartir ${title} en una historia, próximamente`}
          accessibilityState={{ disabled: true }}
          style={styles.share}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d={SHARE_ICON} fill="none" stroke={tokens.sub} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 22, borderWidth: 1, overflow: 'hidden' },
  top: { height: 132, overflow: 'hidden' },
  circle: {
    position: 'absolute',
    top: -26,
    left: -22,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  silhouettes: { position: 'absolute', bottom: 12, left: 0, right: 0 },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  origin: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 16, lineHeight: 20, minHeight: 40, fontWeight: '600', marginTop: 2 },
  matchRow: { height: 44, justifyContent: 'center' },
  match: { fontSize: 13, fontWeight: '700' },
  share: { position: 'absolute', right: 4, bottom: 4, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: 0.45 },
});
