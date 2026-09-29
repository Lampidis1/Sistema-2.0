-- 2026-09-29 · Plan de Acción Q100 — esquema base (Fase A)
-- ─────────────────────────────────────────────────────────────────────────────
-- Módulo nuevo para el seguimiento de las metas prioritarias anuales de la VPAC
-- (Taller "100 días"). Un PLAN es anual; se revisa cada ~100 días = un CICLO (Q).
-- Estructura: plan → metas → líneas → acciones (los "hitos") → avances por ciclo.
-- Cada acción pertenece a un ÁREA; los responsables internos (personas) se asignan
-- aguas abajo del área y no los ve la mirada corporativa (se resuelve en las
-- RPC/vistas de reporte, no aquí).
--
-- Todo vive en el schema `q100`, aislado, con RLS. NO toca ninguna tabla existente.
-- Acceso por slug `q100` (JWT). Preparado para 3 niveles de rol
-- (corporativo / area / subgerencia); las reglas finas de visibilidad se afinan
-- en una migración posterior (RPC de reporte).
--
-- Aplicado en Supabase el 2026-09-29 (migración q100_plataforma). Registro en repo.
-- ─────────────────────────────────────────────────────────────────────────────

create schema if not exists q100;

-- ── Áreas / equipos ──────────────────────────────────────────────────────────
create table if not exists q100.areas(
  area_id text primary key,           -- slug corto: aacc, mlp, norte, ...
  nombre  text not null,
  color   text,                       -- para el dashboard
  orden   int default 0,
  activo  boolean not null default true,
  created_at timestamptz default now());

-- ── Usuarios del módulo (cuenta Auth ↔ área ↔ rol) ───────────────────────────
-- rol: 'corporativo' (mirada gerencia corporativa, ve rollup por área),
--      'area'        (gerente de área, edita lo suyo, asigna responsables),
--      'subgerencia' (ve/edita su subárbol).
-- parent_user_id habilita el árbol de jerarquía (nivel superior ve el rollup).
create table if not exists q100.usuarios(
  user_id uuid primary key references auth.users(id) on delete cascade,
  nombre  text,
  area_id text references q100.areas(area_id),
  rol     text not null default 'area' check (rol in ('corporativo','area','subgerencia')),
  parent_user_id uuid references auth.users(id) on delete set null,
  activo  boolean not null default true,
  created_at timestamptz default now());

-- ── Plan anual y ciclos (Q) ──────────────────────────────────────────────────
create table if not exists q100.planes(
  plan_id text primary key,
  anio    int not null,
  nombre  text not null,
  estado  text not null default 'activo' check (estado in ('borrador','activo','cerrado')),
  created_by text, created_at timestamptz default now(),
  unique(anio));

create table if not exists q100.ciclos(
  ciclo_id text primary key,
  plan_id  text not null references q100.planes(plan_id) on delete cascade,
  numero   int not null,               -- 1..4 (Q)
  nombre   text not null,              -- "100 días jul-ago-sep"
  fecha_inicio date, fecha_fin date,
  estado   text not null default 'abierto' check (estado in ('abierto','cerrado')),
  created_at timestamptz default now(),
  unique(plan_id, numero));

-- ── Metas → Líneas → Acciones (hitos) ────────────────────────────────────────
create table if not exists q100.metas(
  meta_id text primary key,
  plan_id text not null references q100.planes(plan_id) on delete cascade,
  numero  int not null,               -- 1..10
  titulo  text not null,
  descripcion text,
  orden   int default 0,
  unique(plan_id, numero));

create table if not exists q100.lineas(
  linea_id text primary key,
  meta_id  text not null references q100.metas(meta_id) on delete cascade,
  titulo   text not null,
  orden    int default 0);

create table if not exists q100.acciones(
  accion_id  text primary key,
  linea_id   text not null references q100.lineas(linea_id) on delete cascade,
  meta_id    text not null references q100.metas(meta_id) on delete cascade,   -- denormalizado para consulta
  area_id    text references q100.areas(area_id),
  accion     text not null,
  subacciones text,
  origen     text,
  criticidad text check (criticidad in ('critica','no_critica')),
  justificacion text,
  fecha_termino date,
  orden      int default 0,
  activo     boolean not null default true,
  created_by text, created_at timestamptz default now());

-- ── Avance por ciclo (el histórico Q a Q) ────────────────────────────────────
create table if not exists q100.avances(
  avance_id  bigint generated always as identity primary key,
  accion_id  text not null references q100.acciones(accion_id) on delete cascade,
  ciclo_id   text not null references q100.ciclos(ciclo_id) on delete cascade,
  pct_avance numeric check (pct_avance >= 0 and pct_avance <= 100),
  comentario text,
  estado     text,
  actualizado_por text, actualizado_at timestamptz default now(),
  unique(accion_id, ciclo_id));

-- ── Responsables internos (aguas abajo del área) ─────────────────────────────
-- nivel: 'area' o 'subgerencia'. persona por nombre (catálogo libre) y/o user_id.
create table if not exists q100.responsables(
  resp_id   bigint generated always as identity primary key,
  accion_id text not null references q100.acciones(accion_id) on delete cascade,
  persona_nombre text,
  user_id   uuid references auth.users(id) on delete set null,
  area_id   text references q100.areas(area_id),
  nivel     text not null default 'area' check (nivel in ('area','subgerencia')),
  asignado_por text, created_at timestamptz default now());

-- ── API keys por área (para integraciones futuras) ───────────────────────────
create table if not exists q100.api_keys(
  key_id  text primary key,
  area_id text references q100.areas(area_id) on delete cascade,
  nombre  text, api_key text not null unique, activo boolean not null default true,
  created_by text, created_at timestamptz default now(), last_used_at timestamptz);

-- ── Auditoría ────────────────────────────────────────────────────────────────
create table if not exists q100.log(
  log_id bigint generated always as identity primary key,
  entidad text, entidad_id text, accion text, detalle jsonb,
  actor text, created_at timestamptz default now());

-- ── Índices ──────────────────────────────────────────────────────────────────
create index if not exists q100_lineas_meta_idx    on q100.lineas(meta_id);
create index if not exists q100_acciones_linea_idx on q100.acciones(linea_id);
create index if not exists q100_acciones_meta_idx  on q100.acciones(meta_id);
create index if not exists q100_acciones_area_idx  on q100.acciones(area_id);
create index if not exists q100_avances_accion_idx on q100.avances(accion_id);
create index if not exists q100_avances_ciclo_idx  on q100.avances(ciclo_id);
create index if not exists q100_resp_accion_idx    on q100.responsables(accion_id);

-- ── Helpers de rol (SECURITY DEFINER, search_path fijo) ──────────────────────
create or replace function q100.mi_area() returns text
  language sql stable security definer set search_path to 'q100','public','pg_temp'
as $$ select area_id from q100.usuarios where user_id = auth.uid() and activo $$;

create or replace function q100.mi_rol() returns text
  language sql stable security definer set search_path to 'q100','public','pg_temp'
as $$ select rol from q100.usuarios where user_id = auth.uid() and activo $$;

-- Corporativo = rol corporativo del módulo, o admin del sistema.
create or replace function q100.es_corporativo() returns boolean
  language sql stable security definer set search_path to 'q100','public','pg_temp'
as $$ select public.es_admin() or coalesce(
        (select rol = 'corporativo' from q100.usuarios where user_id = auth.uid() and activo), false) $$;

-- Puede editar una acción: corporativo, o pertenece a su área.
create or replace function q100.puede_editar_accion(p_accion text) returns boolean
  language sql stable security definer set search_path to 'q100','public','pg_temp'
as $$ select q100.es_corporativo() or exists(
        select 1 from q100.acciones a where a.accion_id = p_accion and a.area_id = q100.mi_area()) $$;

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table q100.areas         enable row level security;
alter table q100.usuarios      enable row level security;
alter table q100.planes        enable row level security;
alter table q100.ciclos        enable row level security;
alter table q100.metas         enable row level security;
alter table q100.lineas        enable row level security;
alter table q100.acciones      enable row level security;
alter table q100.avances       enable row level security;
alter table q100.responsables  enable row level security;
alter table q100.api_keys      enable row level security;
alter table q100.log           enable row level security;

-- Lectura: cualquiera con acceso al módulo (o admin). El filtrado fino
-- (ocultar personas a corporativo, subárbol de subgerencia) se hace en las RPC
-- de reporte que se agregan en la fase siguiente.
do $$
declare t text;
begin
  foreach t in array array['areas','usuarios','planes','ciclos','metas','lineas','acciones','avances','responsables'] loop
    execute format('drop policy if exists q100_%1$s_sel on q100.%1$s', t);
    execute format($f$create policy q100_%1$s_sel on q100.%1$s for select to authenticated
      using (public.tiene_acceso('q100'))$f$, t);
  end loop;
end $$;

-- Escritura del catálogo (plan/ciclos/metas/líneas/áreas): corporativo o admin.
do $$
declare t text;
begin
  foreach t in array array['areas','planes','ciclos','metas','lineas'] loop
    execute format('drop policy if exists q100_%1$s_wr on q100.%1$s', t);
    execute format($f$create policy q100_%1$s_wr on q100.%1$s for all to authenticated
      using (q100.es_corporativo()) with check (q100.es_corporativo())$f$, t);
  end loop;
end $$;

-- Acciones: corporativo edita todas; área solo las suyas.
drop policy if exists q100_acciones_wr on q100.acciones;
create policy q100_acciones_wr on q100.acciones for all to authenticated
  using (q100.es_corporativo() or area_id = q100.mi_area())
  with check (q100.es_corporativo() or area_id = q100.mi_area());

-- Avances y responsables: según el área de la acción.
drop policy if exists q100_avances_wr on q100.avances;
create policy q100_avances_wr on q100.avances for all to authenticated
  using (q100.puede_editar_accion(accion_id)) with check (q100.puede_editar_accion(accion_id));

drop policy if exists q100_resp_wr on q100.responsables;
create policy q100_resp_wr on q100.responsables for all to authenticated
  using (q100.puede_editar_accion(accion_id)) with check (q100.puede_editar_accion(accion_id));

-- Usuarios del módulo: los administra corporativo/admin; cada quien se lee a sí mismo.
drop policy if exists q100_usuarios_self on q100.usuarios;
create policy q100_usuarios_self on q100.usuarios for select to authenticated
  using (public.tiene_acceso('q100'));
drop policy if exists q100_usuarios_wr on q100.usuarios;
create policy q100_usuarios_wr on q100.usuarios for all to authenticated
  using (q100.es_corporativo()) with check (q100.es_corporativo());

-- API keys y log: solo corporativo/admin.
drop policy if exists q100_keys_wr on q100.api_keys;
create policy q100_keys_wr on q100.api_keys for all to authenticated
  using (q100.es_corporativo()) with check (q100.es_corporativo());
drop policy if exists q100_log_sel on q100.log;
create policy q100_log_sel on q100.log for select to authenticated using (q100.es_corporativo());

-- ── Semilla de áreas (VPAC) ──────────────────────────────────────────────────
insert into q100.areas(area_id, nombre, color, orden) values
  ('aacc',        'Asuntos Corporativos',            '#1f6f5c', 1),
  ('pcg',         'Planificación y Control de Gestión','#2d6a9f', 2),
  ('proteccion',  'Protección Industrial',           '#b0561a', 3),
  ('mlp',         'MLP',                             '#6a4fb0', 4),
  ('mlp_lp',      'MLP - LP',                        '#8a6fd0', 5),
  ('fmlp',        'FMLP',                            '#a0439a', 6),
  ('norte',       'Norte',                           '#c19a2e', 7),
  ('comunicaciones','Comunicaciones',                '#3aa0a0', 8)
on conflict (area_id) do nothing;

grant usage on schema q100 to authenticated;
