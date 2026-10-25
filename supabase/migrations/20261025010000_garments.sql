-- Prendas de cada cuenta. Cada fila tiene dueño (user_id) y RLS hace que nadie pueda leer ni tocar las de otro,
-- aunque la app se equivoque en una consulta. La app igual filtra por user_id en cada consulta.

create table if not exists public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  category text not null check (category in ('arriba', 'top', 'abajo', 'pollera', 'calzado')),
  color_hex text not null check (color_hex ~ '^#[0-9a-fA-F]{6}$'),
  color_name text not null,
  seasons text[] not null check (cardinality(seasons) > 0 and seasons <@ array['verano', 'entretiempo', 'invierno']),
  sporty boolean not null default false,
  corte text,
  photo_path text, -- ruta de la foto en el bucket garment-photos ("<user_id>/<archivo>"); null = sin foto
  created_at timestamptz not null default now()
);

-- El placard se lee siempre por dueño y de la más nueva a la más vieja.
create index if not exists garments_user_created_idx on public.garments (user_id, created_at desc);

alter table public.garments enable row level security;

drop policy if exists "Cada persona ve sus prendas" on public.garments;
create policy "Cada persona ve sus prendas" on public.garments
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Cada persona agrega sus prendas" on public.garments;
create policy "Cada persona agrega sus prendas" on public.garments
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Cada persona edita sus prendas" on public.garments;
create policy "Cada persona edita sus prendas" on public.garments
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Cada persona borra sus prendas" on public.garments;
create policy "Cada persona borra sus prendas" on public.garments
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Fotos de las prendas: bucket privado. Cada cuenta solo usa la carpeta con su id ("<user_id>/...").
-- La app las muestra con direcciones firmadas que vencen.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('garment-photos', 'garment-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/heic', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "Cada persona ve sus fotos de prendas" on storage.objects;
create policy "Cada persona ve sus fotos de prendas" on storage.objects
  for select to authenticated
  using (bucket_id = 'garment-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Cada persona sube sus fotos de prendas" on storage.objects;
create policy "Cada persona sube sus fotos de prendas" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'garment-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Cada persona borra sus fotos de prendas" on storage.objects;
create policy "Cada persona borra sus fotos de prendas" on storage.objects
  for delete to authenticated
  using (bucket_id = 'garment-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
