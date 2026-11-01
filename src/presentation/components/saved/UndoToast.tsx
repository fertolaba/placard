import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useOutfitsTheme } from '../../outfits/outfitsTheme';

const NIGHT = { background: '#F0E2D2', text: '#2B1810', action: '#C8432B' };
const DAY = { background: '#2B1810', text: '#FFF4EA', action: '#F4A259' };

export const UndoToast = memo(function UndoToast({ onUndo }: { onUndo: () => void }) {
  const { scheme, reducedMotion } = useOutfitsTheme();
  const colors = scheme === 'dark' ? NIGHT : DAY;
  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown.duration(200)}
      exiting={reducedMotion ? undefined : FadeOutDown.duration(200)}
      style={[styles.toast, { backgroundColor: colors.background }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Text style={[styles.message, { color: colors.text }]}>Outfit quitado</Text>
      <Pressable onPress={onUndo} accessibilityRole="button" accessibilityLabel="Deshacer: volver a guardar el outfit" style={styles.action}>
        <Text style={[styles.actionLabel, { color: colors.action }]}>Deshacer</Text>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 72, // arriba del botón flotante, que si no tapa "Deshacer"
    height: 52,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 8px 20px rgba(0,0,0,0.25)',
  },
  message: { fontSize: 15, fontWeight: '600' },
  action: { minWidth: 44, height: 44, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 15, fontWeight: '700' },
});
