-- 2026-09-24 · Programas (Proveedores): empresa ejecutora + vínculo a repo +
-- participantes sincronizados + origen de proveedores (filtro de subsistemas)
-- Sistema AM · Antofagasta Minerals
--
-- Aplicado en Supabase como migración: programas_ejecutor_repo_participantes
-- Documentación del contrato JSON: docs/modulos/programas-repo.md
-- database/ no se publica (Regla 9). Este archivo es la copia en el repo.
--
-- Modelo: cada programa (programas_catalogo) puede tener un EJECUTOR (empresa/
-- consultora, ej. Dos Barbas) y un informe público (repo_url). El sistema
-- sincroniza los participantes del informe a programa_participantes (los datos
-- personales quedan SOLO en Supabase — Regla 5) y arma un dashboard por programa.

alter table public.programas_catalogo
  add column if not exists ejecutor text,
  add column if not exists ejecutor_contacto text,
  add column if not exists repo_url text,
  add column if not exists datos_url text,
  add column if not exists ultima_sync timestamptz;

-- Marca de qué subsistema creó un proveedor (para el filtro del directorio).
alter table public.proveedores
  add column if not exists origen text default 'directo',
  add column if not exists origen_ref text;

create table if not exists public.programa_participantes(
  pp_id text primary key,
  programa_cat_id text not null references public.programas_catalogo(programa_cat_id),
  rut text,
  representante text,
  empresa_principal text,
  empresas jsonb default '[]'::jsonb,     -- una o varias sucursales por persona
  sucursales int default 1,
  localidad text,
  avance_plataforma numeric default 0,
  categoria text,
  estado_plataforma text,                 -- completo | en_curso | sin_conexion
  metricas jsonb default '{}'::jsonb,
  proveedor_id text,                       -- vínculo al directorio si se creó/emparejó
  origen text default 'repo',
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique(programa_cat_id, rut)
);
create index if not exists idx_pp_prog on public.programa_participantes(programa_cat_id);
create index if not exists idx_pp_rut  on public.programa_participantes(rut);

alter table public.programa_participantes enable row level security;
-- RLS espejo del resto de tablas de proveedores (slug 'principal').
create policy pp_select on public.programa_participantes for select to authenticated using (es_admin() or es_principal());
create policy pp_ins    on public.programa_participantes for insert to authenticated with check (es_editor());
create policy pp_upd    on public.programa_participantes for update to authenticated using (es_editor()) with check (es_editor());
create policy pp_del    on public.programa_participantes for delete to authenticated using (es_admin());
