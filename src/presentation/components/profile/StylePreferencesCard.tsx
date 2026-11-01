import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { StyleId } from '../../../domain/entities/StyleReference';
import { STYLE_REFERENCES } from '../../../domain/services/styleCatalog';
import { useFavoriteStyles } from '../../hooks/useFavoriteStyles';
import { useOutfitsTheme } from '../../outfits/outfitsTheme';

const StyleChip = memo(function StyleChip({ id, name, active, onToggle }: { id: StyleId; name: string; active: boolean; onToggle: (id: StyleId) => void }) {
  const { tokens, transition } = useOutfitsTheme();
  return (
    <Pressable
      onPress={() => onToggle(id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      accessibilityLabel={`Estilo favorito: ${name}`}
    >
      <Animated.View
        style={[
          styles.chip,
          active ? { backgroundColor: tokens.primary, borderColor: tokens.primary } : { backgroundColor: tokens.soft, borderColor: tokens.line },
          transition,
        ]}
      >
        <Text style={[styles.chipLabel, { color: active ? tokens.onPrimary : tokens.chipFg }]}>{name}</Text>
      </Animated.View>
    </Pressable>
  );
});

export function StylePreferencesCard() {
  const { tokens, transition } = useOutfitsTheme();
  const { favorites, toggle } = useFavoriteStyles();
  return (
    <Animated.View style={[styles.card, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }, transition]}>
      <Animated.Text style={[styles.title, { color: tokens.text }, transition]} accessibilityRole="header">
        Estilos favoritos
      </Animated.Text>
      <Animated.Text style={[styles.hint, { color: tokens.sub }, transition]}>Los usamos para ordenar tus outfits.</Animated.Text>
      <View style={styles.chips}>
        {STYLE_REFERENCES.map((reference) => (
          <StyleChip key={reference.id} id={reference.id} name={reference.name} active={favorites.includes(reference.id)} onToggle={toggle} />
        ))}
      </View>
      <Animated.View style={[styles.divider, { backgroundColor: tokens.line }, transition]} />
      {/* Fila preparada: falta el selector de ciudad. Queda deshabilitada para no parecer rota ni inventar un valor. */}
      <Pressable disabled accessibilityRole="button" accessibilityLabel="Ciudad y clima, próximamente" accessibilityState={{ disabled: true }} style={styles.cityRow}>
        <Animated.Text style={[styles.cityLabel, { color: tokens.text }, transition]}>Ciudad y clima</Animated.Text>
        <View style={styles.cityValue}>
          <Animated.Text style={[styles.cityText, { color: tokens.sub2 }, transition]}>Próximamente</Animated.Text>
          <Ionicons name="chevron-forward" size={18} color={tokens.sub2} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 16, borderWidth: 1 },
  title: { fontSize: 17, fontWeight: '600' },
  hint: { fontSize: 14, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chipLabel: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, marginTop: 14 },
  cityRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 4 },
  cityLabel: { fontSize: 16, fontWeight: '600' },
  cityValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityText: { fontSize: 15 },
});
