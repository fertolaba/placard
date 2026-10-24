/**
 * Lee y valida las variables de entorno UNA sola vez.
 * Importante: Expo solo reemplaza referencias estáticas, por eso se escribe
 * process.env.EXPO_PUBLIC_XXX completo (no process.env[nombre]).
 */
export type DataSource = 'local' | 'sqlite' | 'api';

function parseDataSource(value: string | undefined): DataSource {
  if (value === undefined || value === '') return 'local';
  if (value === 'local' || value === 'sqlite' || value === 'api') return value;
  throw new Error(
    `EXPO_PUBLIC_DATA_SOURCE tiene un valor inválido ("${value}"). Usá "local", "sqlite" o "api" en tu archivo .env.`,
  );
}

const dataSource = parseDataSource(process.env.EXPO_PUBLIC_DATA_SOURCE);
const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

if (dataSource === 'api' && apiUrl === '') {
  throw new Error(
    'Falta EXPO_PUBLIC_API_URL en tu archivo .env (es obligatoria cuando EXPO_PUBLIC_DATA_SOURCE=api).',
  );
}

export const env = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  dataSource,
  apiUrl,
  // Clave de la API de Gemini. Si está vacía, la detección automática de la prenda queda desactivada.
  // Va en .env.local (que no se sube a Git), no en .env.
  // OJO: todo lo que empieza con EXPO_PUBLIC_ queda dentro de la app (cualquiera podría extraerlo).
  geminiApiKey: (process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '').trim(),
} as const;