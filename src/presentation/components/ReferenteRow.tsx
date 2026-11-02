import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReferenteConMatch } from '../hooks/useReferentes';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';
import { PaletteDots } from './PaletteDots';
import { ReferenteAvatar } from './ReferenteAvatar';
import { SaveButton } from './SaveButton';

const MATCH_ALTO = 70;

interface Props {
  item: ReferenteConMatch;
  first: boolean;
  last: boolean;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onPress: (id: string) => void;
}

/** Fila de la lista agrupada: las esquinas y el separador dependen de su lugar en el grupo. */
export const ReferenteRow = memo(function ReferenteRow({ item, first, last, saved, onToggleSave, onPress }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { referente, match } = item;
  const alto = match.porcentaje >= MATCH_ALTO;
  return (
    <View style={[styles.row, first && styles.first, last && styles.last, !first && styles.separator]}>
      <Pressable
        onPress={() => onPress(referente.id)}
        accessibilityRole="button"
        accessibilityLabel={`${referente.nombre}. ${referente.resumen}. ${match.porcentaje}% con tu placard`}
        accessibilityHint="Abre el detalle de su estilo"
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <ReferenteAvatar referenteId={referente.id} iniciales={referente.iniciales} color={referente.colorAvatar} size={48} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {referente.nombre}
          </Text>
          <Text style={styles.summary} numberOfLines={2}>
            {referente.resumen}
          </Text>
          <View style={styles.meta}>
            <PaletteDots colors={referente.paleta} size={12} />
            <Text style={[styles.match, alto && styles.matchAlto]}>{match.porcentaje}% con tu placard</Text>
          </View>
        </View>
      </Pressable>
      <SaveButton
        nombre={referente.nombre}
        saved={saved}
        color={saved ? colors.link : colors.textMuted}
        onPress={() => onToggleSave(referente.id)}
      />
    </View>
  );
});

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingLeft: 12,
    paddingRight: 4,
    backgroundColor: colors.surface,
  },
  first: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  last: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.swatchBorder },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  pressed: { opacity: 0.7 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  summary: { fontSize: 13, color: colors.textMuted, marginTop: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  match: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  matchAlto: { color: colors.successText },
}));
