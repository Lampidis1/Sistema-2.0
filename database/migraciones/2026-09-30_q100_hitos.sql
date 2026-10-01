-- 2026-09-30 · Q100 — hitos (entidad nueva pedida en el encargo original)
-- ─────────────────────────────────────────────────────────────────────────────
-- Un hito es un control de entregas bajo una acción: nombre, criterio de
-- cumplimiento, responsable, fecha objetivo, estado (pendiente/cumplido) y si
-- requiere evidencia. El avance de la acción sigue siendo MANUAL; no se mezcla
-- con el promedio de hitos (el modo por pesos sería una mejora opcional futura).
-- RLS: acceso solo por RPC; ver = puede_ver_accion, editar = puede_editar_accion.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists q100.hitos(
  hito_id              bigint generated always as identity primary key,
  accion_id            text not null,
  nombre               text not null,
  criterio             text,
  responsable          text,
  fecha_objetivo       date,
  estado               text not null default 'pendiente' check (estado in ('pendiente','cumplido')),
  evidencia_requerida  boolean not null default false,
  created_by           text,
  created_at           timestamptz not null default now()
);
alter table q100.hitos enable row level security;
revoke all on q100.hitos from anon, authenticated;
create index if not exists q100_hitos_accion_idx on q100.hitos(accion_id, fecha_objetivo);

create or replace function public.q100_hitos_listar(p_accion text)
returns jsonb language plpgsql stable security definer set search_path to 'q100','public','pg_temp' as $function$
declare v jsonb;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  if not q100.puede_ver_accion(p_accion) then return jsonb_build_object('error','sin_permiso'); end if;
  select coalesce(jsonb_agg(to_jsonb(x) order by x.fecha_objetivo nulls last, x.hito_id),'[]'::jsonb) into v from (
    select hito_id, nombre, criterio, responsable,
      to_char(fecha_objetivo,'DD-MM-YYYY') as fecha, fecha_objetivo,
      estado, evidencia_requerida,
      (fecha_objetivo is not null and fecha_objetivo < current_date and estado<>'cumplido') as vencido
    from q100.hitos where accion_id=p_accion
  ) x;
  return v;
end$function$;

create or replace function public.q100_hito_agregar(
  p_accion text, p_nombre text, p_criterio text default null, p_responsable text default null,
  p_fecha date default null, p_evidencia_req boolean default false)
returns jsonb language plpgsql security definer set search_path to 'q100','public','pg_temp' as $function$
declare v_actor text;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  if not q100.puede_editar_accion(p_accion) then return jsonb_build_object('error','sin_permiso'); end if;
  if coalesce(trim(p_nombre),'')='' then return jsonb_build_object('error','nombre_vacio'); end if;
  v_actor := coalesce(auth.jwt()->>'email',(select nombre from q100.usuarios where user_id=auth.uid()),'sistema');
  insert into q100.hitos(accion_id,nombre,criterio,responsable,fecha_objetivo,evidencia_requerida,created_by)
    values (p_accion, trim(p_nombre), nullif(trim(coalesce(p_criterio,'')),''), nullif(trim(coalesce(p_responsable,'')),''),
            p_fecha, coalesce(p_evidencia_req,false), v_actor);
  return jsonb_build_object('ok',true);
end$function$;

create or replace function public.q100_hito_estado(p_hito bigint, p_estado text)
returns jsonb language plpgsql security definer set search_path to 'q100','public','pg_temp' as $function$
declare v_accion text;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  select accion_id into v_accion from q100.hitos where hito_id=p_hito;
  if v_accion is null then return jsonb_build_object('error','no_encontrado'); end if;
  if not q100.puede_editar_accion(v_accion) then return jsonb_build_object('error','sin_permiso'); end if;
  if p_estado not in ('pendiente','cumplido') then return jsonb_build_object('error','estado_invalido'); end if;
  update q100.hitos set estado=p_estado where hito_id=p_hito;
  return jsonb_build_object('ok',true);
end$function$;

create or replace function public.q100_hito_quitar(p_hito bigint)
returns jsonb language plpgsql security definer set search_path to 'q100','public','pg_temp' as $function$
declare v_accion text;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  select accion_id into v_accion from q100.hitos where hito_id=p_hito;
  if v_accion is null then return jsonb_build_object('error','no_encontrado'); end if;
  if not q100.puede_editar_accion(v_accion) then return jsonb_build_object('error','sin_permiso'); end if;
  delete from q100.hitos where hito_id=p_hito;
  return jsonb_build_object('ok',true);
end$function$;

grant execute on function public.q100_hitos_listar(text) to authenticated;
grant execute on function public.q100_hito_agregar(text,text,text,text,date,boolean) to authenticated;
grant execute on function public.q100_hito_estado(bigint,text) to authenticated;
grant execute on function public.q100_hito_quitar(bigint) to authenticated;
