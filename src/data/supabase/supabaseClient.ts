import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

// En la web con renderizado estático, la página se arma primero en Node, donde no hay window ni almacenamiento.
const isServerRender = Platform.OS === 'web' && typeof window === 'undefined';

/**
 * Crea el cliente de Supabase con la sesión guardada en AsyncStorage (en la web, AsyncStorage usa localStorage).
 * Devuelve null si falta la configuración o la URL es inválida: la app sigue abriendo sin cuentas.
 */
export function createSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  if (url === '' || anonKey === '') return null;

  let client: SupabaseClient;
  try {
    client = createClient(url, anonKey, {
      auth: {
        storage: isServerRender ? undefined : AsyncStorage,
        autoRefreshToken: !isServerRender,
        persistSession: !isServerRender,
        detectSessionInUrl: false, // en iOS y Android no hay una URL de donde leer la sesión
      },
    });
  } catch {
    console.warn('[cuentas] EXPO_PUBLIC_SUPABASE_URL no es una URL válida.');
    return null;
  }

  // En el teléfono, la sesión se renueva sola solo mientras la app está en pantalla (lo recomienda Supabase).
  // En la web no hace falta: Supabase ya escucha cuándo la pestaña está visible.
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    });
  }
  return client;
}
