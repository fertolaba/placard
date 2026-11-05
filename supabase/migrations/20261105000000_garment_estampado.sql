-- Estampado de la prenda: 'liso' (sin logos ni textos), 'logo' (logo o texto chico) o 'grafico' (estampa grande).
-- Lo completa la IA al cargar la prenda y se puede editar. Las prendas que ya existían quedan en null:
-- el matching de referentes las trata como neutras (no las excluye por falta del dato).

alter table public.garments add column if not exists estampado text;

alter table public.garments drop constraint if exists garments_estampado_check;
alter table public.garments
  add constraint garments_estampado_check
  check (estampado is null or estampado in ('liso', 'logo', 'grafico'));
