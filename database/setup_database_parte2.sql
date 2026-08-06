-- ═══════════════════════════════════════════════════════════════════════════
-- setup_database_parte2.sql — Sistema AM · MÓDULOS EMPLEABILIDAD + LICITACIONES + BECADOS
--
-- Ejecutar DESPUÉS de setup_database.sql (que crea Proveedores y las funciones base).
-- Contiene todo lo agregado en las sesiones de Empleabilidad, Móvil, Licitaciones y Becados.
-- Es idempotente: puede re-ejecutarse sin duplicar objetos.
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. FUNCIONES DE AUTORIZACIÓN ADICIONALES
--    (además de es_admin, es_principal, es_mgi, tiene_acceso del archivo base)
-- ─────────────────────────────────────────────────────────────────────────────

-- Acceso a Empleabilidad (empleabilidad.html + movil.html)
create or replace function public.es_empleabilidad()
returns boolean language sql stable set search_path to 'public','pg_temp'
as $$ select tiene_acceso('empleabilidad') or tiene_acceso('movil'); $$;

-- Rol "solo ver": usuario con el flag 'lector' en sus accesos (bloquea escritura)
create or replace function public.es_lector()
returns boolean language sql stable set search_path to 'public','pg_temp'
as $$ select coalesce((auth.jwt() -> 'app_metadata' -> 'accesos') ? 'lector', false); $$;

-- Editor = puede crear/editar. Un 'lector' NO es editor.
create or replace function public.es_editor()
returns boolean language sql stable set search_path to 'public','pg_temp'
as $$ select es_admin() or ( (es_principal() or es_mgi() or es_empleabilidad()) and not es_lector() ); $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TRIGGER: proteger el borrado lógico (solo admin puede marcar 'Eliminado')
--    El "borrado" en el sistema es un UPDATE de estado_registro='Eliminado';
--    este trigger impide que un no-admin lo haga.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.bloquear_borrado_logico()
returns trigger language plpgsql security definer set search_path to 'public','pg_temp'
as $$
begin
  if TG_OP='UPDATE'
     and new.estado_registro='Eliminado'
     and coalesce(old.estado_registro,'') <> 'Eliminado'
     and not es_admin() then
    raise exception 'Solo un administrador puede eliminar registros';
  end if;
  return new;
end $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TRIGGER: crear perfil pendiente automáticamente al registrarse un usuario
--    (para que el nuevo usuario aparezca en la ventana Usuarios sin depender del
--     navegador). Complementa registrar_solicitud().
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.on_auth_user_created()
returns trigger language plpgsql security definer set search_path to 'public','pg_temp'
as $$
begin
  insert into public.perfiles(id, email, nombre, apellido, estado, origen, creado_en)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'apellido',''),
    'pendiente',
    case when new.email ilike '%@aminerals.cl' then 'principal' else 'mgi' end,
    now()
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.on_auth_user_created();


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. EMPLEABILIDAD — tablas
-- ─────────────────────────────────────────────────────────────────────────────

-- CV / Personas (incluye campos de captura móvil y cuestionario)
create table if not exists public.cv_personas (
  cv_id text primary key,
  rut text, nombres text, apellidos text,
  fecha_nacimiento text, sexo text, nacionalidad text,
  direccion text, comuna text, ciudad text,
  telefono text, telefono2 text, email text,
  resumen text,
  experiencia_json text default '[]',   -- [{empresa,ciudad,pais,cargo,desde,hasta,funciones:[],logro}]
  academico_json text default '[]',     -- [{periodo,titulo,institucion,ciudad}]
  cursos_json text default '[]',        -- [{anio,evento,tema,institucion}]
  idiomas_json text default '[]',
  software_json text default '[]',
  adjuntos_json text default '[]',
  -- campos de captura en terreno (movil.html)
  region text, licencia text, tipo_licencia text, disponibilidad text,
  exp_mineria text, anios_exp text, oficios text, certificaciones text,
  educacion text, observaciones text,
  cuestionario_json text default '{}',  -- respuestas del cuestionario de oficina móvil
  fecha_levantamiento text, levantado_por text,
  estado_registro text default 'Activo',
  fuente text default 'manual',          -- manual | excel | pdf | movil
  origen_plataforma text default 'empleabilidad',  -- 'empleabilidad' | 'movil'
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Ofertas laborales
create table if not exists public.cv_ofertas (
  oferta_id text primary key,
  empresa text, cargo text, descripcion text, comuna text,
  criterios_json text default '[]',      -- [{id,texto,ponderacion,tipo}]
  estado text default 'Abierta',
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Postulaciones
create table if not exists public.cv_postulaciones (
  postulacion_id text primary key,
  cv_id text, oferta_id text,
  estado text default 'Postulado',       -- Postulado|En proceso|Entrevista|Seleccionado|Descartado
  fecha_postulacion text, comentarios text, motivo_no text, resultado text,
  match_pct int default 0,
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Match calculado (cache opcional)
create table if not exists public.cv_match (
  id text primary key,                   -- 'm_'+cvId+'_'+ofertaId
  cv_id text, oferta_id text,
  criterios_cumplidos text default '[]',
  match_pct int default 0,
  updated_at timestamptz default now()
);

-- Logs de trazabilidad (usados por movil.html y todo el módulo)
create table if not exists public.cv_logs (
  log_id bigint generated by default as identity primary key,
  cv_id text, usuario_email text,
  accion text, campo text, valor_anterior text, valor_nuevo text,
  origen text default 'empleabilidad',
  creado_en timestamptz default now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. LICITACIONES — trazabilidad de procesos de licitación (distinto de "Contratos"/acuerdos)
--    Hitos: Invitación ARIBA → Documentación → Propuesta → Resultados → Estado final
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.licitaciones (
  licitacion_id text primary key,
  proveedor_id text references public.proveedores(proveedor_id),
  nombre text not null,                  -- obligatorio (validado también en el front)
  estado_proceso text default 'En curso',  -- En curso | Adjudicado | Perdido
  comentario_general text,
  hitos_json text default '[]',          -- [{k,hecho:bool,comentario}]  k: invitacion|documentacion|propuesta|resultados|final
  estado_final text default '',          -- Adjudicado | Perdido | ''
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. BECADOS — alumnos becados con carrera, duración e hitos (línea de tiempo)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.becados (
  becado_id text primary key,
  nombre text not null,
  carrera text, institucion text, duracion text,
  anio_inicio text, anio_termino text,
  estado text default 'Vigente',         -- Vigente | Egresado | Retirado
  contacto text, telefono text, email text,
  observaciones text,
  hitos_json text default '[]',          -- [{id,tipo,titulo,fecha,estado,comentario}]  tipo: Práctica|Beca|Ingreso|...
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY para los módulos nuevos
--    Patrón: ver = admin/principal/empleabilidad; crear/editar = es_editor();
--    eliminar = solo admin.
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare t text;
begin
  foreach t in array array['cv_personas','cv_ofertas','cv_postulaciones','cv_match',
                           'licitaciones','becados']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_sel on public.%I', t, t);
    execute format('drop policy if exists %I_ins on public.%I', t, t);
    execute format('drop policy if exists %I_upd on public.%I', t, t);
    execute format('drop policy if exists %I_del on public.%I', t, t);
    execute format('create policy %I_sel on public.%I for select using (es_admin() or es_principal() or es_empleabilidad() or es_mgi())', t, t);
    execute format('create policy %I_ins on public.%I for insert with check (es_editor())', t, t);
    execute format('create policy %I_upd on public.%I for update using (es_editor()) with check (es_editor())', t, t);
    execute format('create policy %I_del on public.%I for delete using (es_admin())', t, t);
  end loop;
end $$;

-- cv_logs: los autenticados insertan su log; admin/editores leen
alter table public.cv_logs enable row level security;
drop policy if exists cvlogs_sel on public.cv_logs;
create policy cvlogs_sel on public.cv_logs for select using (es_admin() or es_principal() or es_empleabilidad());
-- P-12 (docs/PENDIENTES.md): antes "with check (true)" -- cualquier
-- autenticado, aprobado o no, insertaba. Solo movil.js inserta aqui, y ya
-- exige acceso a movil/empleabilidad/principal en el frontend.
drop policy if exists cvlogs_ins on public.cv_logs;
create policy cvlogs_ins on public.cv_logs for insert to authenticated
  with check (es_admin() or es_principal() or es_empleabilidad());
drop policy if exists cvlogs_del on public.cv_logs;
create policy cvlogs_del on public.cv_logs for delete using (es_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. TRIGGERS de borrado lógico en TODAS las tablas (incluye Proveedores + nuevas)
--    Garantiza que solo el admin pueda marcar registros como 'Eliminado'.
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare t text;
begin
  foreach t in array array['proveedores','contactos','hoteleria','hoteleria_trabajadores',
    'visitas','acuerdos','programas','programas_catalogo','kanban_cards','contratistas',
    'contratista_contactos','compras','moli_beneficiarios','estandarizacion','est_criterios',
    'est_avance','cv_personas','cv_ofertas','cv_postulaciones','licitaciones','becados']
  loop
    execute format('drop trigger if exists trg_bloq_borrado on public.%I', t);
    execute format('create trigger trg_bloq_borrado before update on public.%I for each row execute function public.bloquear_borrado_logico()', t);
  end loop;
end $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. ESCRITURA que excluye a los lectores en Proveedores (rol "solo ver")
--    Reemplaza las políticas INSERT/UPDATE del archivo base para que un 'lector'
--    no pueda escribir en ninguna tabla.
-- ─────────────────────────────────────────────────────────────────────────────

-- proveedores
drop policy if exists prov_write_ins on public.proveedores;
create policy prov_write_ins on public.proveedores for insert with check (
  es_admin() or (es_principal() and not es_lector())
  or (es_mgi() and not es_lector() and es_hoteleria and lower(coalesce(localidad,'')) like '%sierra gorda%')
);
drop policy if exists prov_write_upd on public.proveedores;
create policy prov_write_upd on public.proveedores for update using (
  es_admin() or (es_principal() and not es_lector())
  or (es_mgi() and not es_lector() and es_hoteleria and lower(coalesce(localidad,'')) like '%sierra gorda%')
) with check (
  es_admin() or (es_principal() and not es_lector())
  or (es_mgi() and not es_lector() and es_hoteleria and lower(coalesce(localidad,'')) like '%sierra gorda%')
);

-- resto de tablas de Proveedores → es_editor()
do $$
declare t text;
begin
  foreach t in array array['contactos','hoteleria','hoteleria_trabajadores','visitas',
    'visita_participantes','visita_compromisos','compromiso_responsables','compromiso_seguimiento',
    'visita_firmas','estandarizacion','est_criterios','est_avance','acuerdos','programas',
    'programas_catalogo','kanban_cards','contratistas','contratista_contactos','compras','moli_beneficiarios']
  loop
    execute format('drop policy if exists %I_ins on public.%I', t, t);
    execute format('create policy %I_ins on public.%I for insert with check (es_editor())', t, t);
    execute format('drop policy if exists %I_upd on public.%I', t, t);
    execute format('create policy %I_upd on public.%I for update using (es_editor()) with check (es_editor())', t, t);
  end loop;
end $$;


-- ═══════════════════════════════════════════════════════════════════════════
-- FIN. Con setup_database.sql + este archivo, la base queda completa:
-- Proveedores + Empleabilidad + Móvil + Licitaciones + Becados, con el modelo
-- de roles admin / usuario(editor) / lector(solo ver) y borrado solo-admin.
-- ═══════════════════════════════════════════════════════════════════════════
