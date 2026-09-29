-- 2026-09-29 · Q100 — RPCs públicas de lectura (dashboard).
-- SECURITY DEFINER, validan tiene_acceso('q100'). El schema q100 no se expone
-- vía PostgREST: toda lectura del navegador pasa por estas funciones.
-- Aplicado en Supabase el 2026-09-29 (migraciones q100_rpc_lectura + _fix).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.q100_contexto()
returns jsonb language plpgsql stable security definer set search_path to 'q100','public','pg_temp'
as $$
declare v jsonb;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  select jsonb_build_object(
    'es_corporativo', q100.es_corporativo(),
    'mi_area', q100.mi_area(),
    'mi_rol', q100.mi_rol(),
    'planes', (select coalesce(jsonb_agg(jsonb_build_object('plan_id',plan_id,'anio',anio,'nombre',nombre) order by anio desc),'[]'::jsonb) from q100.planes),
    'ciclos', (select coalesce(jsonb_agg(jsonb_build_object('ciclo_id',ciclo_id,'plan_id',plan_id,'numero',numero,'nombre',nombre,'estado',estado) order by plan_id, numero),'[]'::jsonb) from q100.ciclos),
    'areas',  (select coalesce(jsonb_agg(jsonb_build_object('area_id',area_id,'nombre',nombre,'color',color) order by orden),'[]'::jsonb) from q100.areas where activo)
  ) into v;
  return v;
end$$;

create or replace function public.q100_dashboard(p_ciclo text default null)
returns jsonb language plpgsql stable security definer set search_path to 'q100','public','pg_temp'
as $$
declare v_ciclo text; v_prev text; v jsonb;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  v_ciclo := coalesce(p_ciclo,
    (select ciclo_id from q100.ciclos where estado='abierto' order by numero desc limit 1),
    (select ciclo_id from q100.ciclos order by numero desc limit 1));
  if v_ciclo is null then return jsonb_build_object('error','sin_ciclos'); end if;
  select ciclo_id into v_prev from q100.ciclos
    where plan_id=(select plan_id from q100.ciclos where ciclo_id=v_ciclo)
      and numero=(select numero from q100.ciclos where ciclo_id=v_ciclo)-1;

  with q as (
    select a.*, av.pct_avance pct, av.estado est
    from q100.acciones a
    join q100.avances av on av.accion_id=a.accion_id and av.ciclo_id=v_ciclo
    where a.activo)
  select jsonb_build_object(
    'ciclo', v_ciclo,
    'global', (select jsonb_build_object(
        'n',count(*),'avg',round(avg(pct)),
        'lista',count(*) filter(where est='LISTA'),
        'riesgo',count(*) filter(where est='EN RIESGO'),
        'criticas',count(*) filter(where criticidad='critica'),
        'nocriticas',count(*) filter(where criticidad='no_critica'),
        'avg_crit',round(avg(pct) filter(where criticidad='critica')),
        'avg_nocrit',round(avg(pct) filter(where criticidad='no_critica')),
        'crit_bajo30',count(*) filter(where criticidad='critica' and pct<30),
        'vencidas',count(*) filter(where fecha_termino<current_date and pct<100)) from q),
    'metas', (select jsonb_agg(x) from (
        select jsonb_build_object('numero',m.numero,'titulo',m.titulo,
          'avg',round(avg(q.pct)),'n',count(*),
          'criticas',count(*) filter(where q.criticidad='critica')) x
        from q join q100.metas m on m.meta_id=q.meta_id
        group by m.numero,m.titulo order by m.numero) t),
    'areas', (select jsonb_agg(x) from (
        select jsonb_build_object('area',coalesce(ar.nombre,'(sin área)'),
          'avg',round(avg(q.pct)),'n',count(*),
          'criticas',count(*) filter(where q.criticidad='critica'),
          'riesgo',count(*) filter(where q.est='EN RIESGO')) x
        from q left join q100.areas ar on ar.area_id=q.area_id
        group by ar.nombre order by count(*) desc) t),
    'matriz', (select jsonb_agg(x) from (
        select jsonb_build_object(
          'meta',m.numero,'area',coalesce(ar.nombre,'(s/á)'),
          'avg',round(avg(q.pct)),'n',count(*)) x
        from q join q100.metas m on m.meta_id=q.meta_id
        left join q100.areas ar on ar.area_id=q.area_id
        group by m.numero, ar.nombre order by m.numero) t),
    'momentum', case when v_prev is null then null else (
        select jsonb_build_object('n',count(*),
          'prev',round(avg(pp.pct_avance)),'cur',round(avg(cc.pct_avance)))
        from q100.avances cc join q100.avances pp on pp.accion_id=cc.accion_id
        where cc.ciclo_id=v_ciclo and pp.ciclo_id=v_prev) end
  ) into v;
  return v;
end$$;

grant execute on function public.q100_contexto() to authenticated;
grant execute on function public.q100_dashboard(text) to authenticated;
