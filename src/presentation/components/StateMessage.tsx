import { Pressable, Text, View } from 'react-native';
import { makeStyles } from '../theme/makeStyles';

interface Props {
  title: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StateMessage({ title, detail, actionLabel, onAction }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { alignItems: 'center', padding: 32, gap: 8 },
  title: { fontSize: 17, fontWeight: '600', color: colors.text, textAlign: 'center' },
  detail: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  button: {
    marginTop: 8,
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  buttonLabel: { color: colors.onPrimary, fontSize: 15, fontWeight: '600' },
}));