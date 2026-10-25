-- Colores secundarios de cada prenda (detalles, estampa, logo, costuras).
-- El color dominante sigue en color_hex y color_name. Formato: [{"name": "Blanco", "hex": "#EDEAE4"}], hasta 3.

alter table public.garments
  add column if not exists secondary_colors jsonb not null default '[]'::jsonb;

alter table public.garments drop constraint if exists garments_secondary_colors_check;
alter table public.garments
  add constraint garments_secondary_colors_check
  check (jsonb_typeof(secondary_colors) = 'array' and jsonb_array_length(secondary_colors) <= 3);
