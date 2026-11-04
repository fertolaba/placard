-- Tipo de calzado: por el perfil de la suela y la altura de la caña. Solo se completa en category = 'calzado'.
-- Las prendas que ya existían quedan en null: ningún estilo las excluye por no tener tipo.

alter table public.garments add column if not exists calzado_tipo text;

alter table public.garments drop constraint if exists garments_calzado_tipo_check;
alter table public.garments
  add constraint garments_calzado_tipo_check
  check (calzado_tipo is null or calzado_tipo in ('baja', 'gruesa', 'alta', 'botita'));
