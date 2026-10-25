import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleId, StyleMatch } from '../../domain/entities/StyleReference';
import { makeStyles } from '../theme/makeStyles';
import { FormGroup } from './FormGroup';

interface Props {
  matches: readonly StyleMatch[];
  selectedId: StyleId;
  onSelect: (id: StyleId) => void;
}

/** Lista de estilos de referencia: cuántas piezas tenés de cada uno y su paleta. */
export function StyleList({ matches, selectedId, onSelect }: Props) {
  const styles = useStyles();
  return (
    <FormGroup>
      {matches.map((match) => {
        const selected = match.reference.id === selectedId;
        const total = match.matched.length + match.missing.length;
        return (
          <Pressable
            key={match.reference.id}
            onPress={() => onSelect(match.reference.id)}
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
  );
}

const useStyles = makeStyles((colors) => ({
  styleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  styleInfo: { flex: 1 },
  styleName: { fontSize: 17, color: colors.text },
  styleMeta: { fontSize: 13, color: colors.textMuted },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.swatchBorder },
  check: { fontSize: 17, fontWeight: '700', color: colors.link },
}));
