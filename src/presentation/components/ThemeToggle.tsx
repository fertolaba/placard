import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ThemeMode } from '../../domain/entities/ThemeMode';
import { useSeasonTheme, useThemeColors, type ThemeColorMap } from '../theme/SeasonThemeProvider';
import { useTheme } from '../theme/ThemeProvider';
import { PressableScale } from './PressableScale';

type IconName = keyof typeof Ionicons.glyphMap;

const OPTIONS: { value: ThemeMode; label: string; icon: IconName }[] = [
  { value: 'system', label: 'Automático', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Día', icon: 'sunny-outline' },
  { value: 'dark', label: 'Noche', icon: 'moon-outline' },
];

const BUTTON_COLORS: ThemeColorMap = { backgroundColor: 'headerButtonBackground', borderColor: 'headerButtonBorder' };

/** Botón del encabezado: de día muestra una luna y de noche un sol. Abre un menú con Automático, Día y Noche. */
export function ThemeToggle() {
  const { scheme, mode, setMode } = useTheme();
  const { theme } = useSeasonTheme();
  const insets = useSafeAreaInsets();
  const buttonColors = useThemeColors(BUTTON_COLORS);
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((option) => option.value === mode)?.label;

  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Modo de la pantalla: ${current}`}
        accessibilityHint="Abre las opciones Automático, Día y Noche"
        hitSlop={4}
        style={[styles.button, buttonColors]}
      >
        <Ionicons name={scheme === 'dark' ? 'sunny-outline' : 'moon-outline'} size={20} color={theme.headerButtonColor} />
      </PressableScale>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={[styles.backdrop, { paddingTop: insets.top + 56 }]}
          onPress={() => setOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Cerrar opciones de modo"
        >
          <View style={[styles.menu, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} accessibilityViewIsModal>
            {OPTIONS.map((option) => {
              const selected = option.value === mode;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setMode(option.value);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Modo ${option.label}`}
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  <Ionicons name={option.icon} size={20} color={theme.text} />
                  <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
                  {selected ? <Ionicons name="checkmark" size={20} color={theme.addButton} /> : <View style={styles.checkSpace} />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: { flex: 1, alignItems: 'flex-end', paddingHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.25)' },
  menu: { minWidth: 210, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingHorizontal: 14 },
  optionLabel: { flex: 1, fontSize: 16 },
  checkSpace: { width: 20 },
  pressed: { opacity: 0.6 },
});
