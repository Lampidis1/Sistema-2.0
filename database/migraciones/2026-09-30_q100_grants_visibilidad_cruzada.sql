-- 2026-09-30 · Q100 — grants por tarea/ámbito (visibilidad cruzada, ítem 3)
-- ─────────────────────────────────────────────────────────────────────────────
-- La auditoría mostró gerentes que ven/editan tareas fuera de su área. El modelo
-- pasa de "usuario.area = tarea.area" a: área propia + grants. Sin grants, cada
-- no-corporativo ve/edita solo su área (corporativo/admin: todo).
--
-- ⚠️ CAMBIO DE COMPORTAMIENTO: antes TODOS los usuarios q100 veían TODAS las
-- tareas (solo se restringía editar). Ahora el dashboard y el drill-down se
-- scopean por `puede_ver` para no-corporativos. Los casos cruzados concretos se
-- cargan desde la UI de Permisos con validación (los IDs de la auditoría se
-- perdieron y NO se adivinan).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists q100.grants(
  grant_id    bigint generated always as identity primary key,
  user_id     uuid not null,
  ambito      text not null check (ambito in ('area','meta','linea','accion')),
  ref_id      text not null,
  nivel       text not null default 'ver' check (nivel in ('ver','editar')),
  asignado_por text,
  created_at  timestamptz not null default now(),
  unique (user_id, ambito, ref_id)
);
alter table q100.grants enable row level security;
revoke all on q100.grants from anon, authenticated;
create index if not exists q100_grants_user_idx on q100.grants(user_id);

create or replace function q100.puede_ver_accion(p_accion text)
returns boolean language sql stable security definer set search_path to 'q100','public','pg_temp' as $function$
  select q100.es_corporativo()
     or exists(select 1 from q100.acciones a where a.accion_id=p_accion and a.area_id=q100.mi_area())
     or exists(
        select 1 from q100.grants g join q100.acciones a on a.accion_id=p_accion
        where g.user_id=auth.uid()
          and ( (g.ambito='accion' and g.ref_id=a.accion_id)
             or (g.ambito='linea'  and g.ref_id=a.linea_id)
             or (g.ambito='meta'   and g.ref_id=a.meta_id)
             or (g.ambito='area'   and g.ref_id=a.area_id) ));
$function$;

create or replace function q100.puede_editar_accion(p_accion text)
returns boolean language sql stable security definer set search_path to 'q100','public','pg_temp' as $function$
  select q100.es_corporativo()
     or exists(select 1 from q100.acciones a where a.accion_id=p_accion and a.area_id=q100.mi_area())
     or exists(
        select 1 from q100.grants g join q100.acciones a on a.accion_id=p_accion
        where g.user_id=auth.uid() and g.nivel='editar'
          and ( (g.ambito='accion' and g.ref_id=a.accion_id)
             or (g.ambito='linea'  and g.ref_id=a.linea_id)
             or (g.ambito='meta'   and g.ref_id=a.meta_id)
             or (g.ambito='area'   and g.ref_id=a.area_id) ));
$function$;

-- q100_acciones y q100_dashboard: se recrean añadiendo `and q100.puede_ver_accion(...)`
-- al conjunto de acciones (y a momentum). Ver cuerpo completo aplicado en Supabase;
-- idéntico a la versión previa salvo ese filtro de visibilidad.
-- (Definiciones completas en la migración aplicada; resumidas aquí por brevedad.)

-- RPCs de administración de grants (solo corporativo/admin):
--   q100_grant_asignar(p_user uuid, p_ambito text, p_ref text, p_nivel text)
--   q100_grant_quitar(p_grant_id bigint)
--   q100_grants_listar()
--   q100_admin_datos()          -> usuarios + areas + metas + lineas para la UI
--   q100_buscar_accion(p_texto) -> acciones que coinciden (para ámbito 'accion')
-- Todas validan q100.es_corporativo() y están concedidas a authenticated.
