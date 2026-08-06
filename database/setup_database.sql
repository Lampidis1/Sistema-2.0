-- ═══════════════════════════════════════════════════════════════════════════
-- setup_database.sql — Sistema Proveedores Comunitarios AM (V100)
-- INSTALADOR COMPLETO Y REPLICABLE de la base de datos
--
-- Mapeado desde el proyecto Supabase productivo (sa-east-1) el 05-07-2026.
-- Ejecutar COMPLETO en el SQL Editor de un proyecto Supabase NUEVO.
-- Es idempotente: puede re-ejecutarse sin duplicar objetos.
--
-- CONTENIDO
--   1. Funciones de autorización (JWT app_metadata: rol + accesos)
--   2. Funciones del ciclo de aprobación de usuarios
--   3. 23 tablas (PK, FK, defaults) + trigger es_hoteleria
--   4. Row Level Security completo (patrón: DELETE solo admin)
--   5. Storage: bucket 'documentos' + políticas
--   6. Seed: criterios de estandarización iniciales
--   7. Pasos manuales post-instalación (crear primer admin, config.js)
--
-- REQUISITOS PREVIOS (consola Supabase del proyecto nuevo):
--   • Authentication → Providers → Email: habilitado.
--   • Authentication → Email: desactivar "Confirm email" (la función
--     registrar_solicitud() autoconfirma) o dejarlo y aceptar el correo.
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. FUNCIONES DE AUTORIZACIÓN
--    El JWT de cada usuario aprobado trae en app_metadata:
--      rol: 'admin' | 'usuario'      estado: 'aprobado'
--      accesos: ['principal','mgi','centinela','antucoya','zaldivar']
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.es_admin()
returns boolean language sql stable
set search_path to 'public','pg_temp'
as $$ select coalesce((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin', false); $$;

create or replace function public.jwt_rol()
returns text language sql stable
set search_path to 'public','pg_temp'
as $$ select coalesce(auth.jwt() -> 'app_metadata' ->> 'rol',''); $$;

create or replace function public.es_aprobado()
returns boolean language sql stable
set search_path to 'public','pg_temp'
as $$ select es_admin() or coalesce((auth.jwt() -> 'app_metadata' ->> 'estado') = 'aprobado', false); $$;

create or replace function public.tiene_acceso(p_plat text)
returns boolean language sql stable
set search_path to 'public','pg_temp'
as $$
  select es_admin() or (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'estado') = 'aprobado', false)
    and (auth.jwt() -> 'app_metadata' -> 'accesos') ? p_plat
  );
$$;

create or replace function public.es_principal()
returns boolean language sql stable
set search_path to 'public','pg_temp'
as $$ select tiene_acceso('principal'); $$;

create or replace function public.es_mgi()
returns boolean language sql stable
set search_path to 'public','pg_temp'
as $$
  select es_admin() or (
    coalesce((auth.jwt() -> 'app_metadata' ->> 'estado') = 'aprobado', false)
    and (auth.jwt() -> 'app_metadata' -> 'accesos') ? 'mgi'
  );
$$;

create or replace function public.faena_usuario()
returns text language sql stable
set search_path to 'public','pg_temp'
as $$ select auth.jwt() -> 'app_metadata' ->> 'faena'; $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CICLO DE APROBACIÓN DE USUARIOS (SECURITY DEFINER)
--    Flujo: el usuario se registra → registrar_solicitud() crea fila 'pendiente'
--    en perfiles → un admin aprueba con aprobar_usuario_v2() (escribe rol y
--    accesos en app_metadata) o rechaza con rechazar_usuario().
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text, apellido text, email text,
  estado text default 'pendiente',
  rol_solicitado text, faena_solicitada text, origen text,
  creado_en timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.registrar_solicitud(
  p_uid uuid, p_nombre text, p_apellido text, p_email text,
  p_origen text, p_rol_sol text, p_faena_sol text)
returns text language plpgsql security definer
set search_path to 'public','pg_temp'
as $$
begin
  update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now())
  where id = p_uid;

  insert into perfiles(id, nombre, apellido, email, estado, rol_solicitado, faena_solicitada, origen, creado_en)
  values (p_uid, p_nombre, p_apellido, p_email, 'pendiente', p_rol_sol, p_faena_sol, p_origen, now())
  on conflict (id) do update set
    nombre=excluded.nombre, apellido=excluded.apellido, email=excluded.email,
    estado='pendiente', rol_solicitado=excluded.rol_solicitado,
    faena_solicitada=excluded.faena_solicitada, origen=excluded.origen;
  return 'OK';
end $$;

create or replace function public.listar_solicitudes()
returns table(id uuid, email text, nombre text, apellido text, estado text,
              rol_solicitado text, faena_solicitada text, origen text, creado_en timestamptz)
language sql stable security definer
set search_path to 'public','pg_temp'
as $$
  select p.id, coalesce(u.email,p.email), p.nombre, p.apellido, p.estado,
         p.rol_solicitado, p.faena_solicitada, p.origen, p.creado_en
  from perfiles p left join auth.users u on u.id=p.id
  where es_admin()
  order by (p.estado='pendiente') desc, p.creado_en desc;
$$;

create or replace function public.aprobar_usuario_v2(p_uid uuid, p_rol text, p_accesos text[])
returns text language plpgsql security definer
set search_path to 'public','pg_temp'
as $$
declare v_email text;
begin
  if not es_admin() then return 'NO_AUTORIZADO'; end if;
  if p_rol not in ('admin','usuario') then return 'ROL_INVALIDO'; end if;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb)
      || jsonb_build_object('rol', p_rol, 'estado','aprobado',
            'accesos', case when p_rol='admin'
                            then to_jsonb(array['principal','mgi','centinela','antucoya','zaldivar'])
                            else to_jsonb(coalesce(p_accesos, array[]::text[])) end)
  where id = p_uid
  returning email into v_email;

  if v_email is null then return 'USUARIO_NO_ENCONTRADO'; end if;
  update perfiles set estado='aprobado', rol_solicitado=p_rol,
         faena_solicitada = array_to_string(coalesce(p_accesos,array[]::text[]),',')
  where id=p_uid;
  return 'OK: '||v_email||' → '||p_rol;
end $$;

create or replace function public.rechazar_usuario(p_uid uuid)
returns text language plpgsql security definer
set search_path to 'public','pg_temp'
as $$
begin
  if not es_admin() then return 'NO_AUTORIZADO'; end if;
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"estado":"rechazado","rol":null}'::jsonb
  where id = p_uid;
  update perfiles set estado='rechazado' where id=p_uid;
  return 'RECHAZADO';
end $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABLAS DE NEGOCIO
--    Convenciones: PK de texto con prefijo; estado_registro 'Activo'/'Eliminado'
--    (borrado lógico); updated_at/updated_by para auditoría.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.proveedores (
  proveedor_id text primary key,
  rut_empresa text, razon_social text, nombre_fantasia text,
  localidad text, direccion text, correo_empresa text, fono_empresa text,
  giros_sii text,
  rubros_norm text,                 -- rubros normalizados separados por |
  actividad_principal text, descripcion_general text,
  plataformas_mineras text, categoria_sii text, estado_facturacion text,
  agrupacion_gremial text, servicios_am text, rango_trabajos text,
  acceso_publico boolean default false,
  pub_centinela boolean default false,   -- visibilidad página Centinela
  pub_antucoya boolean default false,    -- visibilidad página Antucoya
  pub_zaldivar boolean default false,    -- visibilidad página Zaldívar
  es_hoteleria boolean default false,    -- calculado por trigger
  flota_json text,                       -- JSON array maquinaria
  fotos_json text,                       -- JSON array URLs (máx 3)
  notas_ficha text,
  estado_registro text default 'Activo',
  fuente text default 'web_v2',
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, created_by text, updated_by text
);

create or replace function public.recalc_hoteleria()
returns trigger language plpgsql
set search_path to 'public','pg_temp'
as $$
begin
  new.es_hoteleria := lower(coalesce(new.giros_sii,'')||' '||coalesce(new.rubros_norm,'')||' '||coalesce(new.actividad_principal,''))
    ~ '(hospedaj|hoteler|hotel|hostal|residenci|arriendo de habitac|alojamiento|caba.a|pensi.n)';
  return new;
end $$;

drop trigger if exists trg_recalc_hoteleria on public.proveedores;
create trigger trg_recalc_hoteleria before insert or update on public.proveedores
for each row execute function public.recalc_hoteleria();

create table if not exists public.contactos (
  contacto_id text primary key,
  proveedor_id text references public.proveedores(proveedor_id),
  rut_persona text, nombre text, cargo text, correo text, fono text,
  principal text default 'FALSE',
  estado_registro text default 'Activo',
  updated_at timestamptz default now()
);

create table if not exists public.hoteleria (
  hotel_id text primary key,
  proveedor_id text references public.proveedores(proveedor_id),
  hab_simples integer default 0,
  hab_dobles integer default 0,
  -- Bundle JSON: {total, contratos:[], servicios:[], simples_banio, dobles_banio}
  contratos_json text,
  estado_registro text default 'Activo',
  updated_at timestamptz default now()
);

create table if not exists public.hoteleria_trabajadores (
  trabajador_id text primary key,
  proveedor_id text, nombre text, sexo text,
  funciones jsonb default '[]'::jsonb,
  estado_registro text default 'Activo',
  created_by text, updated_at timestamptz default now()
);

create table if not exists public.visitas (
  visita_id text primary key,
  proveedor_id text references public.proveedores(proveedor_id),
  fecha text, titulo text,
  responsable_email text, responsable_nombre text,
  faena text, comuna text,
  estado text default 'Borrador',
  minuta_pdf_url text, firma_data text,
  resumen text,                          -- "de qué se trató la reunión"
  fotos_json text default '[]',          -- hasta 3 URLs de fotos de la visita
  origen_plataforma text default 'principal',  -- 'principal' | 'mgi'
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.visita_participantes (
  id text primary key,
  visita_id text references public.visitas(visita_id),
  nombre text, empresa text, correo text, telefono text
);

create table if not exists public.visita_compromisos (
  compromiso_id text primary key,
  visita_id text references public.visitas(visita_id),
  proveedor_id text,
  descripcion text, responsable text, fecha_limite text,
  estado text default 'abierto', cerrado boolean default false,
  orden integer default 0
);

create table if not exists public.compromiso_responsables (
  id text primary key,
  compromiso_id text references public.visita_compromisos(compromiso_id),
  nombre text, area text, fecha_limite text,
  origen text default 'asistente'
);

create table if not exists public.compromiso_seguimiento (
  seg_id text primary key,
  compromiso_id text, visita_id text,
  tipo text, telefono text, detalle text,
  fecha_anterior text, fecha_nueva text,
  creado_por text, creado_en timestamptz default now()
);

create table if not exists public.visita_firmas (
  firma_id text primary key,
  visita_id text references public.visitas(visita_id),
  nombre text, empresa text,
  firma_data text,                       -- dataURL del canvas de firma
  firmado_en timestamptz default now()
);

create table if not exists public.acuerdos (
  acuerdo_id text primary key,
  proveedor_id text references public.proveedores(proveedor_id),
  compania text, proveedor text, servicio text, area text, adc text, os text,
  monto_clp bigint default 0, usd_manual numeric, periodo text, anio text,
  fecha_inicio text, fecha_fin text, localidad text, rubro text,
  descripcion_servicio text, pdf_url text,
  foto1_url text, foto2_url text, foto3_url text,
  visitas_json jsonb default '[]'::jsonb,
  completado boolean default false, fecha_completado text,
  estado_registro text default 'Activo',
  created_by text, updated_by text, updated_at timestamptz default now()
);

create table if not exists public.programas_catalogo (
  programa_cat_id text primary key,
  titulo text not null, contexto text,
  fecha_inicio text, fecha_fin text,
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.programas (
  programa_id text primary key,
  proveedor_id text references public.proveedores(proveedor_id),
  programa_cat_id text,
  nombre_programa text, inicio text, fin text,
  activo text default 'TRUE',
  estado_registro text default 'Activo',
  updated_at timestamptz default now()
);

create table if not exists public.kanban_cards (
  card_id text primary key,
  tablero text not null,
  columna text not null default 'pendiente',
  titulo text, descripcion text, responsable text, faena text, localidad text,
  prioridad text default 'media', fecha text, fecha_limite text,
  ref_proveedor text, datos jsonb default '{}'::jsonb, orden integer default 0,
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.contratistas (
  contratista_id text primary key,
  nombre text not null, rut text, comuna text, faena text, notas text,
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.contratista_contactos (
  contacto_id text primary key,
  contratista_id text references public.contratistas(contratista_id),
  nombre text, correo text, telefono text, cargo text, notas text,
  estado_registro text default 'Activo',
  created_by text, updated_by text, updated_at timestamptz default now()
);

create table if not exists public.compras (
  compra_id text primary key,
  contratista_id text references public.contratistas(contratista_id),
  anio text, fecha text, nombre_empresa text, rut text, comuna text,
  num_factura text, tipo_bien_servicio text, monto_neto bigint default 0,
  estado_registro text default 'Activo',
  created_by text, updated_by text, updated_at timestamptz default now()
);

create table if not exists public.moli_beneficiarios (
  moli_id text primary key,
  acuerdo_id text references public.acuerdos(acuerdo_id),
  proveedor_id text,
  nombre text, sexo text, tipo_servicio text, nacionalidad text, pais_origen text,
  comuna text, tipo_contrato text, empresa_subcontrato text,
  estado_registro text default 'Activo',
  created_by text, updated_at timestamptz default now()
);

create table if not exists public.registro_ediciones (
  log_id bigint generated by default as identity primary key,
  usuario_email text, usuario_nombre text,
  entidad text, entidad_id text, accion text, detalle text,
  creado_en timestamptz default now()
);

-- Estandarización v1 (conservada por compatibilidad)
create table if not exists public.estandarizacion (
  id text primary key,
  proveedor_id text not null,
  criterio text not null,
  categoria text default 'General',
  porcentaje integer default 0 check (porcentaje >= 0 and porcentaje <= 100),
  notas text default '',
  estado_registro text default 'Activo',
  updated_by text default '', updated_at timestamptz default now()
);

-- Estandarización v2: criterios ponderados con hitos
create table if not exists public.est_criterios (
  id text primary key,
  nombre text not null,
  rubro text not null,                   -- 'Hotelería' | 'Lavandería' | 'Alimentación'
  icono text default '📋',               -- emoji o imagen dataURL
  ponderacion integer default 25,        -- % del total del rubro
  hitos_json text default '[]',          -- [{"n":"Instalación regulada","p":40},...] suma 100
  estado_registro text default 'Activo',
  updated_by text default '', updated_at timestamptz default now()
);

create table if not exists public.est_avance (
  id text primary key,                   -- 'av_'+proveedor_id+'_'+criterio_id
  proveedor_id text not null,
  criterio_id text not null,
  hitos_done text default '[]',          -- índices de hitos cumplidos
  estado_registro text default 'Activo',
  updated_by text default '', updated_at timestamptz default now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
--    Patrón: SELECT/INSERT/UPDATE → admin + principal (+ mgi en su ámbito);
--    DELETE → EXCLUSIVAMENTE admin. Páginas de faena: SELECT solo filas con
--    su flag pub_<faena>.
-- ─────────────────────────────────────────────────────────────────────────────

-- Habilitar RLS en todo
do $$
declare t text;
begin
  foreach t in array array['perfiles','proveedores','contactos','hoteleria','hoteleria_trabajadores',
    'visitas','visita_participantes','visita_compromisos','compromiso_responsables','compromiso_seguimiento',
    'visita_firmas','acuerdos','programas','programas_catalogo','kanban_cards','contratistas',
    'contratista_contactos','compras','moli_beneficiarios','registro_ediciones',
    'estandarizacion','est_criterios','est_avance']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- perfiles
-- P-12 (docs/PENDIENTES.md): antes "using (true)" -- cualquier autenticado,
-- aprobado o no, leia la tabla completa. El frontend solo lee su propio
-- perfil (id=auth.uid()); el panel de admin usa listar_solicitudes(),
-- SECURITY DEFINER, no pasa por esta politica.
drop policy if exists perfiles_read on public.perfiles;
create policy perfiles_read on public.perfiles for select
  to authenticated
  using (id = auth.uid() OR es_admin());
drop policy if exists perfiles_upsert_own on public.perfiles;
create policy perfiles_upsert_own on public.perfiles for insert with check (id = auth.uid());
drop policy if exists perfiles_update_own on public.perfiles;
create policy perfiles_update_own on public.perfiles for update using (id = auth.uid());
drop policy if exists perfiles_admin_all on public.perfiles;
create policy perfiles_admin_all on public.perfiles for all using (es_admin()) with check (es_admin());

-- proveedores (SELECT abierto por faena según flags pub_*)
drop policy if exists prov_select on public.proveedores;
create policy prov_select on public.proveedores for select using (
  es_admin() or es_principal()
  or (es_mgi() and es_hoteleria and lower(coalesce(localidad,'')) like '%sierra gorda%')
  or (tiene_acceso('centinela') and pub_centinela)
  or (tiene_acceso('antucoya') and pub_antucoya)
  or (tiene_acceso('zaldivar') and pub_zaldivar)
);
drop policy if exists prov_write_ins on public.proveedores;
create policy prov_write_ins on public.proveedores for insert with check (
  es_admin() or es_principal()
  or (es_mgi() and es_hoteleria and lower(coalesce(localidad,'')) like '%sierra gorda%')
);
drop policy if exists prov_write_upd on public.proveedores;
create policy prov_write_upd on public.proveedores for update using (
  es_admin() or es_principal()
  or (es_mgi() and es_hoteleria and lower(coalesce(localidad,'')) like '%sierra gorda%')
) with check (
  es_admin() or es_principal()
  or (es_mgi() and es_hoteleria and lower(coalesce(localidad,'')) like '%sierra gorda%')
);
drop policy if exists prov_write_del on public.proveedores;
create policy prov_write_del on public.proveedores for delete using (es_admin());

-- NOTA MGI: la política actual restringe el ámbito de escritura de MGI a
-- proveedores de hotelería de Sierra Gorda. Si se desea que MGI también cree
-- y edite proveedores de Lavandería y Alimentación (ampliación funcional 2026),
-- ejecutar además el bloque opcional §4.b al final de esta sección.

-- contactos
drop policy if exists cont_select on public.contactos;
create policy cont_select on public.contactos for select using (
  es_admin() or es_principal()
  or (es_mgi() and proveedor_id in (select proveedor_id from proveedores
        where es_hoteleria and lower(coalesce(localidad,'')) like '%sierra gorda%'))
  or (proveedor_id in (select proveedor_id from proveedores
        where (tiene_acceso('centinela') and pub_centinela)
           or (tiene_acceso('antucoya') and pub_antucoya)
           or (tiene_acceso('zaldivar') and pub_zaldivar)))
);
drop policy if exists cont_write_ins on public.contactos;
create policy cont_write_ins on public.contactos for insert with check (
  es_admin() or es_principal()
  or (es_mgi() and proveedor_id in (select proveedor_id from proveedores
        where es_hoteleria and lower(coalesce(localidad,'')) like '%sierra gorda%'))
);
drop policy if exists cont_write_upd on public.contactos;
create policy cont_write_upd on public.contactos for update using (
  es_admin() or es_principal()
  or (es_mgi() and proveedor_id in (select proveedor_id from proveedores
        where es_hoteleria and lower(coalesce(localidad,'')) like '%sierra gorda%'))
);
drop policy if exists cont_write_del on public.contactos;
create policy cont_write_del on public.contactos for delete using (es_admin());

-- Grupo A: admin + principal + mgi (hotelería, visitas, estandarización)
do $$
declare t text;
begin
  foreach t in array array['hoteleria','hoteleria_trabajadores','visitas','visita_participantes',
    'visita_compromisos','compromiso_responsables','compromiso_seguimiento','visita_firmas',
    'estandarizacion','est_criterios','est_avance']
  loop
    execute format('drop policy if exists %I_select on public.%I', t, t);
    execute format('create policy %I_select on public.%I for select using (es_admin() or es_principal() or es_mgi())', t, t);
    execute format('drop policy if exists %I_ins on public.%I', t, t);
    execute format('create policy %I_ins on public.%I for insert with check (es_admin() or es_principal() or es_mgi())', t, t);
    execute format('drop policy if exists %I_upd on public.%I', t, t);
    execute format('create policy %I_upd on public.%I for update using (es_admin() or es_principal() or es_mgi()) with check (es_admin() or es_principal() or es_mgi())', t, t);
    execute format('drop policy if exists %I_del on public.%I', t, t);
    execute format('create policy %I_del on public.%I for delete using (es_admin())', t, t);
  end loop;
end $$;

-- Grupo B: solo admin + principal (gestión interna)
do $$
declare t text;
begin
  foreach t in array array['acuerdos','programas','programas_catalogo','kanban_cards',
    'contratistas','contratista_contactos','compras','moli_beneficiarios']
  loop
    execute format('drop policy if exists %I_select on public.%I', t, t);
    execute format('create policy %I_select on public.%I for select using (es_admin() or es_principal())', t, t);
    execute format('drop policy if exists %I_ins on public.%I', t, t);
    execute format('create policy %I_ins on public.%I for insert with check (es_admin() or es_principal())', t, t);
    execute format('drop policy if exists %I_upd on public.%I', t, t);
    execute format('create policy %I_upd on public.%I for update using (es_admin() or es_principal()) with check (es_admin() or es_principal())', t, t);
    execute format('drop policy if exists %I_del on public.%I', t, t);
    execute format('create policy %I_del on public.%I for delete using (es_admin())', t, t);
  end loop;
end $$;

-- registro_ediciones: los autenticados insertan su log; admin todo
drop policy if exists admin_all_registro_ediciones on public.registro_ediciones;
create policy admin_all_registro_ediciones on public.registro_ediciones for all using (es_admin()) with check (es_admin());
drop policy if exists log_ins_auth on public.registro_ediciones;
create policy log_ins_auth on public.registro_ediciones for insert to authenticated with check (true);
drop policy if exists log_sel_auth on public.registro_ediciones;
create policy log_sel_auth on public.registro_ediciones for select to authenticated using (true);

-- §4.b OPCIONAL — Ampliar el ámbito de escritura de MGI a Lavandería y
-- Alimentación (descomentarlo si se quiere aplicar):
-- drop policy if exists prov_write_upd on public.proveedores;
-- create policy prov_write_upd on public.proveedores for update using (
--   es_admin() or es_principal()
--   or (es_mgi() and (es_hoteleria or rubros_norm ilike '%lavand%' or rubros_norm ilike '%aliment%'))
-- ) with check (
--   es_admin() or es_principal()
--   or (es_mgi() and (es_hoteleria or rubros_norm ilike '%lavand%' or rubros_norm ilike '%aliment%'))
-- );
-- (replicar el mismo cambio en prov_write_ins, cont_select, cont_write_ins, cont_write_upd)


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. STORAGE — bucket 'documentos'
--    Carpetas usadas por el frontend:
--      minutas/                  → PDF de minutas de visitas
--      fichas/{proveedor_id}/    → fotos de la ficha (máx 3)
--      visitas/{proveedor_id}/   → fotos de la visita (máx 3)
--      licitaciones/fotos/       → fotos y PDF de licitaciones
-- ─────────────────────────────────────────────────────────────────────────────

-- ⚠ El bucket sigue siendo público: las URLs de getPublicUrl() no pasan por
--   RLS, así que quien tenga el enlace abre el archivo sin sesión. Cerrar eso
--   requiere URLs firmadas en el frontend. Ver docs/PENDIENTES.md → P-1b.
insert into storage.buckets (id, name, public)
values ('documentos','documentos', true)
on conflict (id) do nothing;

-- LECTURA: solo usuarios autenticados Y aprobados.
--   La política anterior (doc_public_read) no tenía cláusula `to`, así que
--   aplicaba al rol `anon` y permitía a cualquiera con la anon key enumerar y
--   descargar el bucket completo sin cuenta. Ver docs/PENDIENTES.md → P-1.
--   El `es_aprobado()` es necesario porque signUp() está abierto: sin él,
--   bastaría con registrarse para leer todos los documentos.
drop policy if exists doc_public_read on storage.objects;
drop policy if exists doc_auth_read   on storage.objects;
create policy doc_auth_read on storage.objects for select
  to authenticated
  using (bucket_id = 'documentos' and public.es_aprobado());

drop policy if exists doc_auth_insert on storage.objects;
create policy doc_auth_insert on storage.objects for insert
with check (bucket_id = 'documentos' and (es_admin() or es_principal() or es_mgi()));

drop policy if exists doc_auth_update on storage.objects;
create policy doc_auth_update on storage.objects for update
using (bucket_id = 'documentos' and (es_admin() or es_principal() or es_mgi()));

drop policy if exists doc_auth_delete on storage.objects;
create policy doc_auth_delete on storage.objects for delete
using (bucket_id = 'documentos' and es_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SEED — criterios de estandarización iniciales (3 rubros × 4 criterios)
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.est_criterios (id,nombre,rubro,icono,ponderacion,hitos_json) values
('ec_elec_hot','Regularización eléctrica','Hotelería','⚡',25,'[{"n":"Instalación regulada","p":40},{"n":"Firma SEC","p":30},{"n":"Planos disponibles","p":30}]'),
('ec_elec_lav','Regularización eléctrica','Lavandería','⚡',25,'[{"n":"Instalación regulada","p":40},{"n":"Firma SEC","p":30},{"n":"Planos disponibles","p":30}]'),
('ec_elec_ali','Regularización eléctrica','Alimentación','⚡',25,'[{"n":"Instalación regulada","p":40},{"n":"Firma SEC","p":30},{"n":"Planos disponibles","p":30}]'),
('ec_plag_hot','Control de Plagas','Hotelería','🐀',25,'[{"n":"Programa vigente","p":50},{"n":"Certificados al día","p":50}]'),
('ec_plag_lav','Control de Plagas','Lavandería','🐀',25,'[{"n":"Programa vigente","p":50},{"n":"Certificados al día","p":50}]'),
('ec_plag_ali','Control de Plagas','Alimentación','🐀',25,'[{"n":"Programa vigente","p":50},{"n":"Certificados al día","p":50}]'),
('ec_plan_hot','Planos y layout definido','Hotelería','📐',25,'[{"n":"Layout definido","p":50},{"n":"Planos disponibles","p":50}]'),
('ec_plan_lav','Planos y layout definido','Lavandería','📐',25,'[{"n":"Layout definido","p":50},{"n":"Planos disponibles","p":50}]'),
('ec_plan_ali','Planos y layout definido','Alimentación','📐',25,'[{"n":"Layout definido","p":50},{"n":"Planos disponibles","p":50}]'),
('ec_salud_hot','Permisos de salud','Hotelería','🏥',25,'[{"n":"Resolución sanitaria","p":60},{"n":"Permisos municipales","p":40}]'),
('ec_salud_lav','Permisos de salud','Lavandería','🏥',25,'[{"n":"Resolución sanitaria","p":60},{"n":"Permisos municipales","p":40}]'),
('ec_salud_ali','Permisos de salud','Alimentación','🏥',25,'[{"n":"Resolución sanitaria","p":60},{"n":"Permisos municipales","p":40}]')
on conflict (id) do nothing;


-- ═══════════════════════════════════════════════════════════════════════════
-- 7. PASOS MANUALES POST-INSTALACIÓN
--
-- 7.1 PRIMER ADMINISTRADOR (una sola vez, con el correo del admin ya
--     registrado desde la página de login del sistema):
--
--     update auth.users
--     set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb)
--       || '{"rol":"admin","estado":"aprobado",
--            "accesos":["principal","mgi","centinela","antucoya","zaldivar"]}'::jsonb
--     where email = 'CORREO_DEL_ADMIN@dominio.cl';
--
--     (El admin debe cerrar sesión y volver a entrar para que su JWT
--      traiga los permisos.)
--
-- 7.2 CONECTAR EL FRONTEND: editar config.js con los datos del proyecto nuevo
--     (Consola Supabase → Settings → API):
--
--     window.SUPA_CFG = {
--       url: "https://<PROJECT_REF>.supabase.co",
--       key: "<ANON_KEY>"
--     };
--
--     Subir config.js junto a los 5 HTML al repositorio (raíz) y desplegar
--     (Vercel u otro hosting estático).
--
-- 7.3 MIGRAR DATOS (si se replica desde el proyecto original):
--     • Tablas: usar pg_dump/pg_restore solo de datos
--       (pg_dump --data-only --schema=public <conexión_origen> | psql <destino>)
--       o exportar CSV por tabla desde el editor de Supabase e importarlos.
--     • Archivos: copiar el contenido del bucket 'documentos' (las URLs
--       públicas cambian de dominio; las columnas *_url y fotos_json
--       almacenan URL absolutas, por lo que hay que reescribirlas con
--       replace() al nuevo dominio:
--       update proveedores set fotos_json =
--         replace(fotos_json,'https://ORIGEN.supabase.co','https://DESTINO.supabase.co');
--       -- ídem visitas.fotos_json, visitas.minuta_pdf_url,
--       --      acuerdos.pdf_url/foto1..3_url ).
--
-- 7.4 AUTH: en el proyecto nuevo habilitar el proveedor Email. Los usuarios
--     se registran desde las páginas y quedan 'pendientes' hasta que un
--     administrador los apruebe en la pestaña Usuarios del index.
-- ═══════════════════════════════════════════════════════════════════════════
