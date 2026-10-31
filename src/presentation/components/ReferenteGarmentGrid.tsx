import { Text, View } from 'react-native';
import type { MatchReferente } from '../../domain/entities/Referente';
import { makeStyles } from '../theme/makeStyles';
import { GarmentSwatch } from './GarmentSwatch';

const GAP = 12;

interface Props {
  match: MatchReferente;
  width: number; // ancho disponible para las dos columnas
}

/** Grilla de 2 columnas: las prendas del placard que sirven para el look y las que faltan. */
export function ReferenteGarmentGrid({ match, width }: Props) {
  const styles = useStyles();
  const side = (width - GAP) / 2;
  return (
    <View style={styles.grid}>
      {match.encontradas.map(({ prenda, garment }) => (
        <View
          key={`${prenda.nombre}-${garment.id}`}
          style={{ width: side }}
          accessible
          accessibilityLabel={`${prenda.nombre}: tenés ${garment.name}`}
        >
          {/* Las fotos todavía tienen el fondo: van como cuadrados iguales con resizeMode="cover" (lo hace GarmentSwatch).
              TODO: cambiar a recortes sin fondo cuando exista el quitar fondo. */}
          <GarmentSwatch garment={garment} height={side} />
          <Text style={styles.name} numberOfLines={1}>
            {garment.name}
          </Text>
        </View>
      ))}
      {match.faltantes.map((prenda) => (
        <View
          key={prenda.nombre}
          style={{ width: side }}
          accessible
          accessibilityLabel={`Te falta: ${prenda.nombre}`}
        >
          <View style={[styles.missing, { height: side }]}>
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>Te falta</Text>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {prenda.nombre}
          </Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  name: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 6 },
  missing: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: { backgroundColor: colors.fillMuted, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
}));
