-- ═══════════════════════════════════════════════════════════════════════════
-- 2026-09-22 · Plataforma "Lavanderías Sierra Gorda" (Fase 1)
--
-- Vive en su PROPIO esquema `lavanderias` (no en public) para poder exportarla
-- e independizarla con un solo comando:  pg_dump -n lavanderias
-- No tiene llaves foráneas a tablas de otros módulos (el uid de auth.users se
-- guarda como uuid, sin FK dura), así el dump es autosuficiente.
--
-- El frontend NO toca estas tablas directo: entra por funciones public.lav_*
-- (SECURITY DEFINER). Las tablas tienen RLS activa SIN políticas → nadie las lee
-- por la API directa; solo las funciones (dueñas del esquema) las tocan.
--
-- Aplicado en Supabase como migraciones:
--   lavanderias_schema_tablas  ·  lavanderias_funciones_rpc
-- Este archivo es la copia en el repo (database/ no se publica — ver .vercelignore).
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists lavanderias;

-- ── Tablas ──────────────────────────────────────────────────────────────────
create table if not exists lavanderias.empresas(
  empresa_id text primary key, nombre text not null, razon_social text, rut text,
  direccion text, contacto_nombre text, contacto_fono text, contacto_correo text,
  tipo text not null default 'lavanderia' check (tipo in ('lavanderia','retiro')),
  estado text not null default 'activo',
  created_by text, created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists lavanderias.usuarios(
  user_id uuid primary key,
  empresa_id text references lavanderias.empresas(empresa_id) on delete set null,
  correo text, rol text not null default 'lavanderia',
  estado text not null default 'pendiente' check (estado in ('pendiente','aprobado','rechazado')),
  aprobado_por text, aprobado_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists lavanderias.prendas_catalogo(
  prenda_id text primary key,
  empresa_id text references lavanderias.empresas(empresa_id) on delete cascade,
  categoria text not null check (categoria in ('cama','trabajo')),
  nombre text not null, orden int default 0, activo boolean default true,
  created_at timestamptz default now());

create table if not exists lavanderias.contratos(
  contrato_id text primary key, nombre text not null, numero text,
  empresa_entrega_id text references lavanderias.empresas(empresa_id),
  empresa_retira_id text references lavanderias.empresas(empresa_id),
  empresa_retira_nombre text, estado text not null default 'activo',
  created_by text, created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists lavanderias.bolsas(
  bolsa_id text primary key, codigo text not null,
  contrato_id text references lavanderias.contratos(contrato_id) on delete cascade,
  empresa_entrega_id text references lavanderias.empresas(empresa_id),
  empresa_entrega_nombre text, kilogramos numeric, total_prendas int default 0,
  estado text not null default 'activa', created_by text,
  created_at timestamptz default now(),
  expira_at timestamptz default (now() + interval '3 months'));

create table if not exists lavanderias.bolsa_items(
  item_id bigint generated always as identity primary key,
  bolsa_id text references lavanderias.bolsas(bolsa_id) on delete cascade,
  categoria text not null, prenda_nombre text not null, cantidad int not null default 0);

create index if not exists lav_bolsas_codigo_idx   on lavanderias.bolsas(codigo);
create index if not exists lav_bolsas_expira_idx   on lavanderias.bolsas(expira_at);
create index if not exists lav_items_bolsa_idx     on lavanderias.bolsa_items(bolsa_id);
create index if not exists lav_bolsas_contrato_idx on lavanderias.bolsas(contrato_id);

alter table lavanderias.empresas         enable row level security;
alter table lavanderias.usuarios         enable row level security;
alter table lavanderias.prendas_catalogo enable row level security;
alter table lavanderias.contratos        enable row level security;
alter table lavanderias.bolsas           enable row level security;
alter table lavanderias.bolsa_items      enable row level security;

-- Catálogo inicial (global).
insert into lavanderias.prendas_catalogo(prenda_id, empresa_id, categoria, nombre, orden) values
  ('g_cama_1', null, 'cama', 'Funda colchón', 1), ('g_cama_2', null, 'cama', 'Sábana', 2),
  ('g_cama_3', null, 'cama', 'Cobertor', 3),      ('g_cama_4', null, 'cama', 'Funda almohada', 4),
  ('g_trab_1', null, 'trabajo', 'Camisa', 1),     ('g_trab_2', null, 'trabajo', 'Chaqueta ácido', 2),
  ('g_trab_3', null, 'trabajo', 'Pantalón', 3),   ('g_trab_4', null, 'trabajo', 'Calcetín', 4)
on conflict (prenda_id) do nothing;

-- ── Funciones y RPCs ────────────────────────────────────────────────────────
-- El detalle completo de las funciones (lavanderias.nuevo_codigo, mi_empresa,
-- puede; y public.lav_mi_acceso / lav_registrar / lav_contrato_crear /
-- lav_contratos / lav_catalogo / lav_bolsa_crear / lav_bolsas / lav_buscar)
-- está aplicado en Supabase (migración lavanderias_funciones_rpc). Resumen del
-- código único: 3 letras A-Z + 4 dígitos 1-9 mezclados, único entre bolsas
-- vigentes (no vencidas); tras 3 meses el código se reutiliza. lav_buscar tiene
-- GRANT EXECUTE a anon (página pública); el resto solo a authenticated.
