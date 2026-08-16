-- 2026-08-15 · Planilla de hospedajes del programa MGI
-- Aplicada en producción (sistema-am-v2) el 2026-08-15.
--
-- MGI llevaba la disponibilidad de camas en un Excel aparte
-- ("Informe_Disponibilidad_Hospedajes"). Esta tabla es lo que faltaba para
-- que esa planilla viva en el sistema.
--
-- NO duplica nada de lo que ya existe:
--   proveedores    → nombre, dirección, RUT
--   hoteleria      → habitaciones simples/dobles y cuáles tienen baño privado
--   contactos      → encargado (principal) y dueño
--   hospedajes_mgi → solo lo propio del programa (esta tabla)
-- Por eso lo que MGI edita en la planilla se refleja de inmediato en el
-- directorio de proveedores y en la página pública de Hoteles SG.
--
-- BAJA: un hospedaje nunca se borra. Se marca `baja` con motivo obligatorio y
-- se le quita `programa_mgi` al proveedor, así deja de contar y de aparecer en
-- la página pública, pero la ficha y su historia quedan.

create table if not exists public.hospedajes_mgi (
  proveedor_id        text primary key references public.proveedores(proveedor_id) on delete cascade,
  codigo_mgi          text,
  participa           text,          -- 'SI' o el motivo por el que no participa
  camas_instaladas    int,           -- lo declarado; puede diferir del cálculo
  eecc_hospeda        text,          -- empresa colaboradora que arrienda
  es_eecc_mcen        text,          -- 'Si' | 'No' | 'No sabe'
  contrato_inicio     date,
  contrato_fin        date,
  arrendado_completo  boolean default false,
  hab_disponibles     int,
  n_hospedados        int,
  camas_disponibles   int,
  al_dia_pagos        text,
  volver_a_llamar     date,          -- el contador: hasta cuándo no hay que llamar
  notas               text,
  baja                boolean default false,
  baja_motivo         text,
  baja_fecha          timestamptz,
  baja_por            text,
  created_by          text,
  updated_by          text,
  updated_at          timestamptz default now()
);
create index if not exists idx_hospedajes_mgi_llamar on public.hospedajes_mgi(volver_a_llamar);

alter table public.hospedajes_mgi enable row level security;

drop policy if exists hospedajes_mgi_select on public.hospedajes_mgi;
drop policy if exists hospedajes_mgi_ins on public.hospedajes_mgi;
drop policy if exists hospedajes_mgi_upd on public.hospedajes_mgi;
drop policy if exists hospedajes_mgi_del on public.hospedajes_mgi;

create policy hospedajes_mgi_select on public.hospedajes_mgi
  for select using (es_admin() or es_principal() or es_mgi());
create policy hospedajes_mgi_ins on public.hospedajes_mgi
  for insert with check (es_admin() or es_mgi() or es_principal());
create policy hospedajes_mgi_upd on public.hospedajes_mgi
  for update using (es_admin() or es_mgi() or es_principal())
  with check (es_admin() or es_mgi() or es_principal());
create policy hospedajes_mgi_del on public.hospedajes_mgi
  for delete using (es_admin());
