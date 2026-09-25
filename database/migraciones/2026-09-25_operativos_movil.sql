-- 2026-09-25 · Operativos del móvil + dashboard con mapa (Fase 5)
-- Sistema AM · Antofagasta Minerals
--
-- Aplicado en Supabase como migración: operativos_movil_dashboard
-- El ejecutivo del móvil inicia un OPERATIVO marcando la posición del vehículo
-- (GPS; fallback al centro de la comuna). Las atenciones de esa jornada quedan
-- ligadas al punto (atenciones.operativo_id) y alimentan el dashboard con mapa de
-- la Región de Antofagasta en Empleabilidad (pestaña 🗺 Mapa): pines por punto,
-- agrupados por ciudad/comuna al alejar, filtro día/semana/mes/año y ficha por pin
-- (hombres/mujeres, servicios). La coordenada vive SOLO en Supabase (Reglas 5 y 6).
-- database/ no se publica; este archivo es la copia en el repo.

create table if not exists public.operativos(
  operativo_id text primary key,
  lugar text, comuna text,
  lat double precision, lng double precision,
  fecha date default current_date,
  estado text default 'activo',            -- activo | cerrado
  created_by text, created_at timestamptz default now(), cerrado_at timestamptz
);
alter table public.operativos enable row level security;
create policy operativos_rw on public.operativos for all to authenticated
  using (tiene_acceso('movil') or tiene_acceso('empleabilidad') or tiene_acceso('principal'))
  with check (tiene_acceso('movil') or tiene_acceso('empleabilidad') or tiene_acceso('principal'));

alter table public.atenciones add column if not exists operativo_id text;
create index if not exists idx_atenciones_operativo on public.atenciones(operativo_id);
