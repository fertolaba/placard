-- Formalidad de la prenda: 'clasico', 'casual' o 'deportivo'. La completa la IA al cargar la prenda y se puede editar.
-- Las prendas que ya existían quedan en null: la app deduce la formalidad del nombre, el corte y las marcas
-- "clásica" / "camiseta de fútbol", y si tampoco hay datos la trata como neutra.

alter table public.garments add column if not exists formalidad text;

alter table public.garments drop constraint if exists garments_formalidad_check;
alter table public.garments
  add constraint garments_formalidad_check
  check (formalidad is null or formalidad in ('clasico', 'casual', 'deportivo'));
