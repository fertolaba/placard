import { Ionicons } from '@expo/vector-icons';
import { memo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { Profile } from '../../../domain/entities/Profile';
import { usePhotoPicker } from '../../hooks/usePhotoPicker';
import { useOutfitsTheme } from '../../outfits/outfitsTheme';
import { useProfile } from '../../state/ProfileProvider';
import { Avatar } from '../Avatar';

export const IdentityCard = memo(function IdentityCard({ profile, email }: { profile: Profile; email: string }) {
  const { tokens, transition } = useOutfitsTheme();
  const { save, changePhoto } = useProfile();
  const { pick, error: pickerError } = usePhotoPicker();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const startEditing = () => {
    setName(profile.displayName);
    setUsername(profile.username);
    setFormError(null);
    setEditing(true);
  };

  const onSave = async () => {
    if (/\s/.test(username.trim())) {
      setFormError('El usuario no puede tener espacios.');
      return;
    }
    setSaving(true);
    const message = await save({ displayName: name, username, showWatermark: profile.showWatermark });
    setSaving(false);
    setFormError(message);
    if (message === null) setEditing(false);
  };

  const choosePhoto = async () => {
    setPhotoError(null);
    const uri = await pick('library');
    if (uri) setPhotoError(await changePhoto(uri));
  };

  const shownPhotoError = photoError ?? pickerError;
  const inputStyle = [styles.input, { color: tokens.text }];

  return (
    <Animated.View style={[styles.card, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }, transition]}>
      <View style={styles.top}>
        <View style={styles.avatarWrap}>
          <Avatar name={profile.displayName} photoUri={profile.photoUri} size={72} fontSize={26} />
          <Pressable
            onPress={choosePhoto}
            hitSlop={7}
            accessibilityRole="button"
            accessibilityLabel="Cambiar foto de perfil"
            style={[styles.camera, { borderColor: tokens.card, backgroundColor: tokens.primary }]}
          >
            <Ionicons name="camera" size={13} color={tokens.onPrimary} />
          </Pressable>
        </View>
        <View style={styles.identity}>
          <Animated.Text style={[styles.name, { color: tokens.text }, transition]} numberOfLines={1}>
            {profile.displayName}
          </Animated.Text>
          <Animated.Text style={[styles.username, { color: tokens.sub }, transition]} numberOfLines={1}>
            @{profile.username}
          </Animated.Text>
          <Animated.Text style={[styles.email, { color: tokens.sub2 }, transition]} numberOfLines={1}>
            {email}
          </Animated.Text>
        </View>
        {editing ? null : (
          <Pressable onPress={startEditing} hitSlop={4} accessibilityRole="button" accessibilityLabel="Editar nombre y usuario">
            <Animated.View style={[styles.editButton, { borderColor: tokens.line }, transition]}>
              <Animated.Text style={[styles.editLabel, { color: tokens.text }, transition]}>Editar</Animated.Text>
            </Animated.View>
          </Pressable>
        )}
      </View>

      {shownPhotoError ? (
        <Text style={[styles.error, { color: tokens.danger }]} accessibilityRole="alert">
          {shownPhotoError}
        </Text>
      ) : null}

      {editing ? (
        <View style={styles.form}>
          <Animated.View style={[styles.field, { borderColor: tokens.line }, transition]}>
            <Animated.Text style={[styles.fieldLabel, { color: tokens.text }, transition]}>Nombre</Animated.Text>
            <TextInput
              value={name}
              onChangeText={setName}
              maxLength={40}
              style={inputStyle}
              accessibilityLabel="Nombre"
              placeholderTextColor={tokens.sub2}
            />
          </Animated.View>
          <Animated.View style={[styles.field, { borderColor: tokens.line }, transition]}>
            <Animated.Text style={[styles.fieldLabel, { color: tokens.text }, transition]}>Usuario</Animated.Text>
            {/* El "@" va dentro del valor para quedar pegado al texto alineado a la derecha; no se puede borrar. */}
            <TextInput
              value={`@${username}`}
              onChangeText={(text) => setUsername(text.replace(/^@+/, ''))}
              maxLength={21}
              autoCapitalize="none"
              autoCorrect={false}
              style={inputStyle}
              accessibilityLabel="Usuario"
            />
          </Animated.View>
          {formError ? (
            <Text style={[styles.error, { color: tokens.danger }]} accessibilityRole="alert">
              {formError}
            </Text>
          ) : null}
          <View style={styles.formActions}>
            <Pressable
              onPress={() => setEditing(false)}
              accessibilityRole="button"
              accessibilityLabel="Cancelar edición"
              style={[styles.formButton, styles.cancel, { borderColor: tokens.line }]}
            >
              <Text style={[styles.formLabel, { color: tokens.text }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Guardar nombre y usuario"
              accessibilityState={{ busy: saving, disabled: saving }}
              style={[styles.formButton, { backgroundColor: tokens.primary }]}
            >
              {saving ? <ActivityIndicator color={tokens.onPrimary} /> : <Text style={[styles.formLabel, { color: tokens.onPrimary }]}>Guardar</Text>}
            </Pressable>
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 26, padding: 16, borderWidth: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { width: 72, height: 72 },
  camera: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { flex: 1, minWidth: 0 },
  name: { fontSize: 22, fontWeight: '700' },
  username: { fontSize: 16 },
  email: { fontSize: 13 },
  editButton: { height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  editLabel: { fontSize: 14, fontWeight: '700' },
  form: { marginTop: 12 },
  field: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1 },
  fieldLabel: { fontSize: 15, fontWeight: '600' },
  input: { flex: 1, minHeight: 44, fontSize: 15, textAlign: 'right' },
  error: { fontSize: 13, marginTop: 8 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  formButton: { flex: 1, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cancel: { borderWidth: 1.5 },
  formLabel: { fontSize: 15, fontWeight: '600' },
});
