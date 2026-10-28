import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type Ref } from 'react';
import {
  Animated,
  Pressable,
  TextInput,
  View,
  useAnimatedValue,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';
import { makeStyles } from '../theme/makeStyles';
import { useTheme } from '../theme/ThemeProvider';

const HEIGHT = 58;
const LABEL_RESTING = { top: 19, fontSize: 16 }; // centrada, como un placeholder
const LABEL_FLOATING = { top: 8, fontSize: 12 }; // chica, arriba dentro del recuadro

interface Props
  extends Pick<
    TextInputProps,
    | 'value'
    | 'onChangeText'
    | 'maxLength'
    | 'autoCapitalize'
    | 'keyboardType'
    | 'textContentType'
    | 'autoComplete'
    | 'returnKeyType'
    | 'onSubmitEditing'
    | 'submitBehavior'
    | 'editable'
  > {
  label: string;
  ref?: Ref<TextInputInstance>; // para pasar al campo siguiente con el botón del teclado
  password?: boolean; // oculta el texto y muestra el botón del ojo
  onFocus?: () => void;
  onInputWidth?: (width: number) => void; // ancho donde se escribe el texto (lo usa la mascota)
}

/** Campo de login con etiqueta flotante: al enfocarlo o escribir, la etiqueta se achica y sube. */
export function AuthTextField({ label, ref, password = false, onFocus, onInputWidth, value, ...input }: Props) {
  const styles = useStyles();
  const { scheme, colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const floating = focused || (value ?? '') !== '';
  const progress = useAnimatedValue(floating ? 1 : 0);

  useEffect(() => {
    // fontSize y top no se pueden animar en el hilo nativo; para una etiqueta chica alcanza con JS.
    Animated.timing(progress, { toValue: floating ? 1 : 0, duration: 150, useNativeDriver: false }).start();
  }, [floating, progress]);

  const labelStyle = {
    top: progress.interpolate({ inputRange: [0, 1], outputRange: [LABEL_RESTING.top, LABEL_FLOATING.top] }),
    fontSize: progress.interpolate({ inputRange: [0, 1], outputRange: [LABEL_RESTING.fontSize, LABEL_FLOATING.fontSize] }),
  };

  return (
    <View style={[styles.box, focused && styles.boxFocused]}>
      <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
      <TextInput
        {...input}
        ref={ref}
        value={value}
        secureTextEntry={password && !visible}
        autoCapitalize={password ? 'none' : input.autoCapitalize}
        accessibilityLabel={label}
        autoCorrect={false}
        keyboardAppearance={scheme}
        selectionColor={colors.link}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        onLayout={(event) => onInputWidth?.(event.nativeEvent.layout.width)}
        style={styles.input}
      />
      {password ? (
        <Pressable
          onPress={() => setVisible((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          style={styles.eye}
        >
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  box: {
    height: HEIGHT,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.swatchBorder,
    backgroundColor: colors.fillMuted,
    marginBottom: 10,
  },
  boxFocused: { borderColor: colors.textMuted },
  // La etiqueta no recibe toques: tocarla enfoca el campo que está debajo.
  label: { position: 'absolute', left: 12, right: 12, color: colors.textMuted, pointerEvents: 'none' },
  input: { flex: 1, fontSize: 16, color: colors.text, paddingTop: 24, paddingBottom: 8, paddingHorizontal: 0 },
  eye: { width: 44, marginRight: -8, alignItems: 'center', justifyContent: 'center' },
}));
