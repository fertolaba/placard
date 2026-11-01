import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useOutfitsTheme } from '../../outfits/outfitsTheme';

interface Props {
  hasSaved: boolean; // hay guardados, pero ninguno entra en este filtro
  onGoToOutfits: () => void;
}

export const SavedEmptyState = memo(function SavedEmptyState({ hasSaved, onGoToOutfits }: Props) {
  const { tokens, transition } = useOutfitsTheme();
  return (
    <Animated.View style={[styles.box, { borderColor: tokens.line }, transition]}>
      <Animated.View style={[styles.circle, { backgroundColor: tokens.soft }, transition]}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M6 3h12v18l-6-4-6 4z" fill="none" stroke={tokens.accent} strokeWidth={2} strokeLinejoin="round" />
        </Svg>
      </Animated.View>
      <Animated.Text style={[styles.title, { color: tokens.text }, transition]} accessibilityRole="header">
        {hasSaved ? 'No hay outfits en este filtro' : 'Todavía no guardaste outfits'}
      </Animated.Text>
      <Animated.Text style={[styles.detail, { color: tokens.sub }, transition]}>
        {hasSaved
          ? 'Probá con otro filtro o guardá más combinaciones desde Outfits.'
          : 'Deslizá a la derecha en Outfits, o tocá el corazón, para guardar tus combinaciones favoritas.'}
      </Animated.Text>
      <Pressable
        onPress={onGoToOutfits}
        accessibilityRole="button"
        accessibilityLabel="Ir a Outfits"
        style={[styles.button, { backgroundColor: tokens.primary }]}
      >
        <Text style={[styles.buttonLabel, { color: tokens.onPrimary }]}>Ir a Outfits</Text>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  box: {
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 26,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
  },
  circle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  detail: { fontSize: 15, lineHeight: 21, textAlign: 'center' },
  button: { height: 46, borderRadius: 23, paddingHorizontal: 24, marginTop: 6, alignItems: 'center', justifyContent: 'center' },
  buttonLabel: { fontSize: 15, fontWeight: '600' },
});
