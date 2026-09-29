-- 2026-09-29 · Q100 — RPCs de detalle (drill-down interactivo) y edición por área.
-- Todas SECURITY DEFINER, validan tiene_acceso('q100') y respetan la jerarquía:
-- las personas responsables SOLO se muestran a su propia área (aguas abajo);
-- la mirada corporativa ve el área, no las personas. El comentario (el "por qué"
-- del avance) es visible para todos los que tienen acceso.
-- Aplicado en Supabase el 2026-09-29 (migración q100_rpc_detalle_edicion).

create or replace function public.q100_acciones(p_meta int default null, p_area text default null, p_ciclo text default null)
returns jsonb language plpgsql stable security definer set search_path to 'q100','public','pg_temp'
as $$
declare v_ciclo text; v jsonb;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  v_ciclo := coalesce(p_ciclo,
    (select ciclo_id from q100.ciclos where estado='abierto' order by numero desc limit 1),
    (select ciclo_id from q100.ciclos order by numero desc limit 1));
  select jsonb_build_object('ciclo', v_ciclo, 'acciones', coalesce((
    select jsonb_agg(x order by (x->>'meta')::int, x->>'linea', x->>'accion') from (
      select jsonb_build_object(
        'accion_id', a.accion_id, 'meta', m.numero, 'linea', l.titulo,
        'accion', a.accion, 'area', coalesce(ar.nombre,'(sin área)'), 'area_id', a.area_id,
        'criticidad', a.criticidad, 'fecha_termino', a.fecha_termino,
        'pct', av.pct_avance, 'estado', av.estado, 'comentario', av.comentario,
        'actualizado_por', av.actualizado_por, 'actualizado_at', av.actualizado_at,
        'puede_editar', q100.puede_editar_accion(a.accion_id),
        'ver_personas', (q100.mi_area() is not null and q100.mi_area() = a.area_id),
        'responsables', case when (q100.mi_area() is not null and q100.mi_area() = a.area_id)
          then (select coalesce(jsonb_agg(r.persona_nombre order by r.persona_nombre),'[]'::jsonb)
                from q100.responsables r where r.accion_id=a.accion_id)
          else null end
      ) x
      from q100.acciones a
      join q100.metas m on m.meta_id=a.meta_id
      join q100.lineas l on l.linea_id=a.linea_id
      left join q100.areas ar on ar.area_id=a.area_id
      left join q100.avances av on av.accion_id=a.accion_id and av.ciclo_id=v_ciclo
      where a.activo
        and (p_meta is null or m.numero=p_meta)
        and (p_area is null or a.area_id=p_area)
    ) t
  ), '[]'::jsonb)) into v;
  return v;
end$$;

create or replace function public.q100_guardar_avance(p_accion text, p_pct numeric, p_estado text, p_comentario text, p_ciclo text default null)
returns jsonb language plpgsql security definer set search_path to 'q100','public','pg_temp'
as $$
declare v_ciclo text; v_actor text;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  if not q100.puede_editar_accion(p_accion) then return jsonb_build_object('error','sin_permiso'); end if;
  if p_pct is not null and (p_pct<0 or p_pct>100) then return jsonb_build_object('error','pct_invalido'); end if;
  v_ciclo := coalesce(p_ciclo,
    (select ciclo_id from q100.ciclos where estado='abierto' order by numero desc limit 1),
    (select ciclo_id from q100.ciclos order by numero desc limit 1));
  if v_ciclo is null then return jsonb_build_object('error','sin_ciclo'); end if;
  v_actor := coalesce(auth.jwt()->>'email', (select nombre from q100.usuarios where user_id=auth.uid()), 'sistema');
  insert into q100.avances(accion_id,ciclo_id,pct_avance,estado,comentario,actualizado_por,actualizado_at)
  values (p_accion, v_ciclo, p_pct, nullif(p_estado,''), nullif(p_comentario,''), v_actor, now())
  on conflict (accion_id,ciclo_id) do update
    set pct_avance=excluded.pct_avance, estado=excluded.estado, comentario=excluded.comentario,
        actualizado_por=excluded.actualizado_por, actualizado_at=now();
  insert into q100.log(entidad,entidad_id,accion,detalle,actor)
    values ('avance', p_accion, 'guardar',
      jsonb_build_object('ciclo',v_ciclo,'pct',p_pct,'estado',p_estado), v_actor);
  return jsonb_build_object('ok',true,'ciclo',v_ciclo);
end$$;

create or replace function public.q100_responsable_guardar(p_accion text, p_personas text[])
returns jsonb language plpgsql security definer set search_path to 'q100','public','pg_temp'
as $$
declare v_area text; v_actor text;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  if not q100.puede_editar_accion(p_accion) then return jsonb_build_object('error','sin_permiso'); end if;
  select area_id into v_area from q100.acciones where accion_id=p_accion;
  v_actor := coalesce(auth.jwt()->>'email', 'sistema');
  delete from q100.responsables where accion_id=p_accion;
  insert into q100.responsables(accion_id,persona_nombre,area_id,nivel,asignado_por)
    select p_accion, trim(p), v_area, 'area', v_actor
    from unnest(coalesce(p_personas,'{}'::text[])) p
    where trim(coalesce(p,'')) <> '';
  return jsonb_build_object('ok',true);
end$$;

grant execute on function public.q100_acciones(int,text,text) to authenticated;
grant execute on function public.q100_guardar_avance(text,numeric,text,text,text) to authenticated;
grant execute on function public.q100_responsable_guardar(text,text[]) to authenticated;
