import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../auth/AuthProvider';
import { AppThemeToggle } from '../components/HeaderActions';
import { IdentityCard } from '../components/profile/IdentityCard';
import { PillSwitch } from '../components/profile/PillSwitch';
import { StylePreferencesCard } from '../components/profile/StylePreferencesCard';
import { WardrobeSummary } from '../components/profile/WardrobeSummary';
import { StateMessage } from '../components/StateMessage';
import { useGarments } from '../hooks/useGarments';
import { useWardrobeStats } from '../hooks/useWardrobeStats';
import { useOutfitsTheme } from '../outfits/outfitsTheme';
import { useProfile } from '../state/ProfileProvider';
import { confirmDestructive } from '../utils/confirm';

const MAX_CONTENT_WIDTH = 480;

function Section({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  const { tokens, transition } = useOutfitsTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Animated.Text style={[styles.sectionTitle, { color: tokens.accent }, transition]} accessibilityRole="header">
          {title}
        </Animated.Text>
        {aside ? <Animated.Text style={[styles.sectionAside, { color: tokens.sub }, transition]}>{aside}</Animated.Text> : null}
      </View>
      {children}
    </View>
  );
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tokens, transition } = useOutfitsTheme();
  const { user, signOut, deleteAccount } = useAuth();
  const { profile, status, reload, save } = useProfile();
  const { garments } = useGarments('todo');
  const stats = useWardrobeStats();
  const [busy, setBusy] = useState<'signOut' | 'delete' | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [watermarkError, setWatermarkError] = useState<string | null>(null);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  const setWatermark = useCallback(
    async (showWatermark: boolean) => {
      if (!profile) return;
      setWatermarkError(await save({ displayName: profile.displayName, username: profile.username, showWatermark }));
    },
    [profile, save],
  );

  const onSignOut = async () => {
    const confirmed = await confirmDestructive(
      '¿Cerrar sesión?',
      'Tus prendas y tu perfil siguen guardados en este teléfono.',
      'Cerrar sesión',
    );
    if (!confirmed) return;
    setBusy('signOut');
    setAccountError(null);
    // Si sale bien, la navegación lleva sola al login.
    const message = await signOut();
    setBusy(null);
    setAccountError(message);
  };

  const onDeleteAccount = async () => {
    const confirmed = await confirmDestructive(
      '¿Eliminar tu cuenta?',
      'Se borran para siempre tu cuenta, tus prendas, tus fotos y tus outfits guardados. Esto no se puede deshacer.',
      'Eliminar cuenta',
    );
    if (!confirmed) return;
    setBusy('delete');
    setAccountError(null);
    const message = await deleteAccount();
    setBusy(null);
    setAccountError(message);
  };

  const total = stats?.total ?? garments.length;

  return (
    <Animated.View style={[styles.root, { backgroundColor: tokens.body }, transition]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.header}>
          <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel="Atrás" style={styles.back}>
            <Svg width={12} height={20} viewBox="0 0 12 20">
              <Path d="M10 2L2 10L10 18" fill="none" stroke={tokens.accent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Animated.Text style={[styles.title, { color: tokens.text }, transition]} accessibilityRole="header">
            Perfil
          </Animated.Text>
          <AppThemeToggle />
        </View>

        {status === 'loading' && <ActivityIndicator style={styles.loader} color={tokens.accent} />}
        {status === 'error' && (
          <StateMessage
            title="No pudimos cargar tu perfil"
            detail="Revisá tu conexión a internet y probá de nuevo."
            actionLabel="Reintentar"
            onAction={reload}
          />
        )}

        {status === 'ready' && profile && (
          <>
            <IdentityCard profile={profile} email={user?.email ?? ''} />

            <Section title="Tu placard" aside={`${total} ${total === 1 ? 'prenda' : 'prendas'}`}>
              <WardrobeSummary garments={garments} palette={stats?.palette ?? []} />
            </Section>

            <Section title="Tu estilo">
              <StylePreferencesCard />
            </Section>

            <Section title="Compartir">
              <Animated.View style={[styles.shareCard, { backgroundColor: tokens.card, borderColor: tokens.cardBorder }, transition]}>
                <View style={styles.shareText}>
                  <Animated.Text style={[styles.shareTitle, { color: tokens.text }, transition]}>Marca de Pilchapp en historias</Animated.Text>
                  <Animated.Text style={[styles.shareHint, { color: tokens.sub }, transition]}>
                    Aparece al pie de tus historias de outfits.
                  </Animated.Text>
                  {watermarkError ? (
                    <Text style={[styles.error, { color: tokens.danger }]} accessibilityRole="alert">
                      {watermarkError}
                    </Text>
                  ) : null}
                </View>
                <PillSwitch value={profile.showWatermark} label="Marca de Pilchapp en historias" onChange={setWatermark} />
              </Animated.View>
            </Section>
          </>
        )}

        {/* La cuenta va aparte del perfil: se puede cerrar sesión aunque el perfil no haya cargado. */}
        <Pressable
          onPress={onSignOut}
          disabled={busy !== null}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          accessibilityState={{ disabled: busy !== null, busy: busy === 'signOut' }}
        >
          <Animated.View style={[styles.signOut, { borderColor: tokens.danger }, transition]}>
            {busy === 'signOut' ? (
              <ActivityIndicator color={tokens.danger} />
            ) : (
              <Ionicons name="log-out-outline" size={20} color={tokens.danger} />
            )}
            <Animated.Text style={[styles.signOutLabel, { color: tokens.danger }, transition]}>
              {busy === 'signOut' ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </Animated.Text>
          </Animated.View>
        </Pressable>
        {accountError ? (
          <Text style={[styles.error, styles.accountError, { color: tokens.danger }]} accessibilityRole="alert">
            {accountError}
          </Text>
        ) : null}
        <Pressable
          onPress={onDeleteAccount}
          disabled={busy !== null}
          accessibilityRole="button"
          accessibilityLabel="Eliminar cuenta"
          accessibilityState={{ disabled: busy !== null, busy: busy === 'delete' }}
          style={styles.deleteAccount}
        >
          {busy === 'delete' ? (
            <ActivityIndicator color={tokens.sub} />
          ) : (
            <Animated.Text style={[styles.deleteLabel, { color: tokens.sub }, transition]}>Eliminar cuenta</Animated.Text>
          )}
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  back: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 6, marginRight: -8 },
  title: { flex: 1, fontSize: 34, fontWeight: '700' },
  loader: { marginTop: 40 },
  section: { marginTop: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '600' },
  sectionAside: { fontSize: 14 },
  shareCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 24, padding: 16, borderWidth: 1 },
  shareText: { flex: 1 },
  shareTitle: { fontSize: 16, fontWeight: '600' },
  shareHint: { fontSize: 13, marginTop: 2 },
  signOut: { height: 50, marginTop: 28, borderRadius: 16, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  signOutLabel: { fontSize: 16, fontWeight: '600' },
  deleteAccount: { minHeight: 44, marginTop: 6, alignItems: 'center', justifyContent: 'center' },
  deleteLabel: { fontSize: 14 },
  error: { fontSize: 13, marginTop: 6 },
  accountError: { textAlign: 'center' },
});
