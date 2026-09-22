-- ═══════════════════════════════════════════════════════════════════════════
-- 2026-09-22 · API de MGI (integradores externos) + copia de seguridad previa
--
-- Modelo: COLA DE VALIDACIÓN. La API externa NO escribe directo; crea propuestas
-- en public.mgi_api_cambios que un admin MGI aprueba (mgi_cambio_aplicar) o
-- rechaza. Autenticación por api_key (public.mgi_api_keys).
--
-- Aplicado en Supabase como migraciones:
--   respaldo_mgi_20260922_foto_pre_api  (foto del día, esquema respaldo_mgi_20260922)
--   mgi_api_infra_lectura_propuestas    (tablas + lectura + proponer + llaves)
--   mgi_api_cola_admin_aplicar          (cola admin: pendientes/aplicar/rechazar)
--   helper_quien_soy
-- Documentación para desarrolladores: docs/modulos/mgi-api.md
-- Este archivo es la copia en el repo (database/ no se publica).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Copia de seguridad ("foto del día") antes de la API ─────────────────────
-- create schema respaldo_mgi_20260922;  -- copias de: proveedores, hoteleria,
--   hospedajes_mgi, contactos, est_criterios, est_avance, visitas,
--   visita_compromisos (create table as select * from public.<t>).
-- Restaurar una tabla: truncate public.<t>; insert into public.<t>
--   select * from respaldo_mgi_20260922.<t>;

-- ── Tablas de la API (public, con RLS: tiene_acceso('mgi') or es_principal()) ─
create table if not exists public.mgi_api_keys(
  key_id text primary key, nombre text, api_key text not null unique,
  activo boolean not null default true, confiable boolean not null default false,
  created_by text, created_at timestamptz default now(), last_used_at timestamptz);
alter table public.mgi_api_keys enable row level security;

create table if not exists public.mgi_api_cambios(
  cambio_id text primary key,
  api_key_id text references public.mgi_api_keys(key_id) on delete set null,
  proveedor_id text, rubro text, tipo text not null, payload jsonb not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','aplicado','rechazado')),
  resultado text, comentario text, created_at timestamptz default now(),
  resuelto_por text, resuelto_at timestamptz);
alter table public.mgi_api_cambios enable row level security;

-- ── Funciones (aplicadas en Supabase) ───────────────────────────────────────
--  API (anon + api_key en el cuerpo):
--    mgi_api_empresas / mgi_api_empresa / mgi_api_criterios /
--    mgi_api_proponer / mgi_api_estado_cambio
--  Admin MGI (tiene_acceso('mgi') o es_admin):
--    mgi_cambios_pendientes / mgi_cambio_aplicar / mgi_cambio_rechazar /
--    mgi_admin_key_crear / mgi_admin_keys / mgi_admin_key_borrar
--  Helpers: mgi_integracion_por_key, mgi_rubro_norm, quien_soy
--  Tipos de cambio (mgi_api_proponer.p_tipo): ficha | contacto | capacidad |
--    hospedaje_mgi | criterio_avance | empresa_crear (ver docs/modulos/mgi-api.md).
