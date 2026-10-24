import { Ionicons } from '@expo/vector-icons';
import { Children, useState, type ReactNode, type Ref } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

/** Grupo de filas con el estilo de los ajustes de iOS. */
export function FormGroup({ children, footer }: { children: ReactNode; footer?: string }) {
  const styles = useStyles();
  return (
    <View style={styles.wrapper}>
      <View style={styles.group}>
        {Children.toArray(children).map((row, index) => (
          <View key={index} style={[styles.row, index > 0 && styles.separator]}>
            {row}
          </View>
        ))}
      </View>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

interface TextRowProps
  extends Pick<
    TextInputProps,
    | 'value'
    | 'onChangeText'
    | 'maxLength'
    | 'autoCapitalize'
    | 'placeholder'
    | 'keyboardType'
    | 'secureTextEntry'
    | 'textContentType'
    | 'autoComplete'
    | 'returnKeyType'
    | 'onSubmitEditing'
    | 'submitBehavior'
    | 'editable'
  > {
  label: string;
  ref?: Ref<TextInputInstance>; // para pasar al campo siguiente con el botón del teclado
}

export function TextRow({ label, ref, ...input }: TextRowProps) {
  const styles = useStyles();
  const { scheme, colors } = useTheme();
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...input}
        ref={ref}
        accessibilityLabel={label}
        autoCorrect={false}
        keyboardAppearance={scheme}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </>
  );
}

/** Fila de contraseña: el texto va oculto y un botón con un ojo lo muestra u oculta. */
export function PasswordRow(props: Omit<TextRowProps, 'secureTextEntry'>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  return (
    <>
      <TextRow {...props} secureTextEntry={!visible} autoCapitalize="none" />
      <Pressable
        onPress={() => setVisible((current) => !current)}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        style={styles.eye}
      >
        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
      </Pressable>
    </>
  );
}

/** Fila de solo lectura: un dato a la derecha (por ejemplo, el email de la cuenta). */
export function ValueRow({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.valueRow} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
        {value}
      </Text>
    </View>
  );
}

interface SwitchRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function SwitchRow({ label, value, onValueChange }: SwitchRowProps) {
  const styles = useStyles();
  return (
    <>
      <Text style={[styles.label, styles.grow]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} accessibilityLabel={label} trackColor={{ true: '#34C759' }} />
    </>
  );
}

const useStyles = makeStyles((colors) => ({
  wrapper: { marginBottom: 20 },
  group: { backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 16, gap: 12 },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.swatchBorder },
  label: { fontSize: 17, color: colors.text },
  grow: { flex: 1 },
  input: { flex: 1, fontSize: 17, textAlign: 'right', color: colors.text, minHeight: 44 },
  eye: { width: 44, height: 44, marginRight: -10, alignItems: 'center', justifyContent: 'center' },
  valueRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  value: { flex: 1, fontSize: 17, textAlign: 'right', color: colors.textMuted },
  footer: { fontSize: 13, color: colors.textMuted, marginTop: 6, paddingHorizontal: 16 },
}));