// Elimina la cuenta de quien la llama. La clave de servicio vive solo en este servidor: nunca va en la app.
// Las filas de profiles y garments se borran solas (on delete cascade); las fotos hay que borrarlas a mano.
import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'garment-photos';
const PAGE_SIZE = 100;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const reply = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' });

  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return reply(401, { error: 'unauthorized' });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // El id sale del token verificado, nunca de lo que mande la app: nadie puede borrar otra cuenta.
  const { data, error: userError } = await admin.auth.getUser(token);
  if (userError || !data.user) return reply(401, { error: 'unauthorized' });
  const userId = data.user.id;

  for (;;) {
    const { data: files, error } = await admin.storage.from(BUCKET).list(userId, { limit: PAGE_SIZE });
    if (error) return reply(500, { error: 'storage_list_failed' });
    if (!files || files.length === 0) break;
    const { error: removeError } = await admin.storage.from(BUCKET).remove(files.map((file) => `${userId}/${file.name}`));
    if (removeError) return reply(500, { error: 'storage_remove_failed' });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) return reply(500, { error: 'delete_failed' });
  return reply(200, { deleted: true });
});
