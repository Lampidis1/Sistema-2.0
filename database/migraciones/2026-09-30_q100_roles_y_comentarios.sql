-- 2026-09-30 · Q100 — roles (lector/ejecutor) + hilo de comentarios (ítem 4, parte 1)
-- ─────────────────────────────────────────────────────────────────────────────
-- Roles q100.usuarios.rol: 'corporativo' | 'area' | 'ejecutor' | 'lector'.
--   lector   → nunca edita (solo ve).
--   ejecutor → edita solo tareas con grant 'editar' (no toda su área).
--   area     → edita su área + grants 'editar'.
--   corporativo/admin → todo.
-- Hilo de comentarios por acción (texto; columnas de evidencia listas para la
-- parte 2 = subida de archivo a Storage). RLS: acceso solo por RPC.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function q100.puede_editar_accion(p_accion text)
returns boolean language sql stable security definer set search_path to 'q100','public','pg_temp' as $function$
  select case
    when q100.es_corporativo() then true
    when coalesce(q100.mi_rol(),'') = 'lector' then false
    else (
      (coalesce(q100.mi_rol(),'') <> 'ejecutor'
        and exists(select 1 from q100.acciones a where a.accion_id=p_accion and a.area_id=q100.mi_area()))
      or exists(
        select 1 from q100.grants g join q100.acciones a on a.accion_id=p_accion
        where g.user_id=auth.uid() and g.nivel='editar'
          and ( (g.ambito='accion' and g.ref_id=a.accion_id)
             or (g.ambito='linea'  and g.ref_id=a.linea_id)
             or (g.ambito='meta'   and g.ref_id=a.meta_id)
             or (g.ambito='area'   and g.ref_id=a.area_id) ))
    )
  end;
$function$;

create table if not exists q100.comentarios(
  comentario_id    bigint generated always as identity primary key,
  accion_id        text not null,
  ciclo_id         text not null,
  texto            text not null,
  evidencia_url    text,
  evidencia_nombre text,
  autor            text,
  created_at       timestamptz not null default now()
);
alter table q100.comentarios enable row level security;
revoke all on q100.comentarios from anon, authenticated;
create index if not exists q100_comentarios_accion_idx on q100.comentarios(accion_id, ciclo_id, created_at desc);

create or replace function public.q100_comentarios_listar(p_accion text, p_ciclo text default null)
returns jsonb language plpgsql stable security definer set search_path to 'q100','public','pg_temp' as $function$
declare v_ciclo text; v jsonb;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  if not q100.puede_ver_accion(p_accion) then return jsonb_build_object('error','sin_permiso'); end if;
  v_ciclo := coalesce(p_ciclo,(select ciclo_id from q100.ciclos where estado='abierto' order by numero desc limit 1),
    (select ciclo_id from q100.ciclos order by numero desc limit 1));
  select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc),'[]'::jsonb) into v from (
    select comentario_id, texto, evidencia_url, evidencia_nombre, autor,
      to_char(created_at at time zone 'America/Santiago','DD-MM-YYYY HH24:MI') as fecha, created_at
    from q100.comentarios where accion_id=p_accion and ciclo_id=v_ciclo
  ) x;
  return v;
end$function$;

create or replace function public.q100_comentario_agregar(p_accion text, p_texto text, p_ciclo text default null)
returns jsonb language plpgsql security definer set search_path to 'q100','public','pg_temp' as $function$
declare v_ciclo text; v_actor text;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  if not q100.puede_ver_accion(p_accion) then return jsonb_build_object('error','sin_permiso'); end if;
  if coalesce(q100.mi_rol(),'')='lector' then return jsonb_build_object('error','solo_lectura'); end if;
  if coalesce(trim(p_texto),'')='' then return jsonb_build_object('error','texto_vacio'); end if;
  v_ciclo := coalesce(p_ciclo,(select ciclo_id from q100.ciclos where estado='abierto' order by numero desc limit 1),
    (select ciclo_id from q100.ciclos order by numero desc limit 1));
  v_actor := coalesce(auth.jwt()->>'email',(select nombre from q100.usuarios where user_id=auth.uid()),'sistema');
  insert into q100.comentarios(accion_id,ciclo_id,texto,autor) values (p_accion,v_ciclo,trim(p_texto),v_actor);
  return jsonb_build_object('ok',true);
end$function$;

create or replace function public.q100_usuario_rol(p_user uuid, p_rol text)
returns jsonb language plpgsql security definer set search_path to 'q100','public','pg_temp' as $function$
begin
  if not q100.es_corporativo() then return jsonb_build_object('error','sin_permiso'); end if;
  if p_rol not in ('corporativo','area','ejecutor','lector') then return jsonb_build_object('error','rol_invalido'); end if;
  update q100.usuarios set rol=p_rol where user_id=p_user;
  if not found then return jsonb_build_object('error','no_encontrado'); end if;
  return jsonb_build_object('ok',true);
end$function$;

grant execute on function public.q100_comentarios_listar(text,text) to authenticated;
grant execute on function public.q100_comentario_agregar(text,text,text) to authenticated;
grant execute on function public.q100_usuario_rol(uuid,text) to authenticated;
