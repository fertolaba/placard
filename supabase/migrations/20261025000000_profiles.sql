-- Perfil público de cada cuenta: nombre de usuario y sexo.
-- La app manda estos datos en user_metadata al crear la cuenta (auth.signUp → options.data) y
-- el trigger de abajo los copia acá. Se hace en la base y no desde la app porque, con "Confirm email"
-- activado, la persona todavía no tiene sesión y las políticas de RLS no la dejarían insertar.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9._]{3,20}$'),
  sex text not null check (sex in ('femenino', 'masculino')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Cada persona ve su perfil" on public.profiles;
create policy "Cada persona ve su perfil" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "Cada persona edita su perfil" on public.profiles;
create policy "Cada persona edita su perfil" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Corre como dueño de la tabla (security definer) para poder insertar sin sesión.
-- Si falla (por ejemplo, el nombre de usuario ya existe), Supabase cancela la creación de la cuenta
-- y devuelve "Database error saving new user".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, sex)
  values (
    new.id,
    lower(trim(new.raw_user_meta_data ->> 'username')),
    new.raw_user_meta_data ->> 'sex'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Las cuentas creadas antes de esta migración: se les crea el perfil si se registraron con usuario y sexo.
-- (Las más viejas, sin esos datos, quedan sin perfil; no se inventa nada.)
insert into public.profiles (id, username, sex)
select id, lower(trim(raw_user_meta_data ->> 'username')), raw_user_meta_data ->> 'sex'
from auth.users
where lower(trim(raw_user_meta_data ->> 'username')) ~ '^[a-z0-9._]{3,20}$'
  and raw_user_meta_data ->> 'sex' in ('femenino', 'masculino')
on conflict do nothing;
