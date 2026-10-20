import { Children, type ReactNode } from 'react';
import { StyleSheet, Switch, Text, TextInput, View, type TextInputProps } from 'react-native';
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
  extends Pick<TextInputProps, 'value' | 'onChangeText' | 'maxLength' | 'autoCapitalize' | 'placeholder'> {
  label: string;
}

export function TextRow({ label, ...input }: TextRowProps) {
  const styles = useStyles();
  const { scheme, colors } = useTheme();
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...input}
        accessibilityLabel={label}
        autoCorrect={false}
        keyboardAppearance={scheme}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </>
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
  input: { flex: 1, fontSize: 17, textAlign: 'right', color: colors.text },
  footer: { fontSize: 13, color: colors.textMuted, marginTop: 6, paddingHorizontal: 16 },
}));