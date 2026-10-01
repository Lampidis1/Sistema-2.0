-- 2026-09-30 · Q100 — historial append-only de avances (ítem 2 del plan auditoría)
-- ─────────────────────────────────────────────────────────────────────────────
-- La auditoría pide registro inmutable de cada cambio de avance: valor anterior
-- y nuevo, actor, fecha (America/Santiago) y procedencia. Antes solo se guardaba
-- el valor actual (mutable) + un log básico.
--
-- Tabla q100.avances_hist: RLS habilitado y sin políticas (acceso solo por RPC).
-- Se hace backfill de una entrada por avance actual (procedencia 'Carga inicial').
-- q100_guardar_avance ahora registra anterior->nuevo en cada guardado.
-- q100_avance_historial devuelve el historial con fecha en America/Santiago.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists q100.avances_hist(
  hist_id bigint generated always as identity primary key,
  accion_id text not null,
  ciclo_id text not null,
  pct_anterior numeric,
  pct_nuevo numeric,
  estado_anterior text,
  estado_nuevo text,
  comentario text,
  actor text,
  procedencia text default 'app',
  registrado_at timestamptz not null default now()
);
alter table q100.avances_hist enable row level security;
revoke all on q100.avances_hist from anon, authenticated;
create index if not exists avances_hist_accion_idx on q100.avances_hist(accion_id, ciclo_id, registrado_at desc);

insert into q100.avances_hist(accion_id,ciclo_id,pct_anterior,pct_nuevo,estado_anterior,estado_nuevo,comentario,actor,procedencia,registrado_at)
select accion_id,ciclo_id,null,pct_avance,null,estado,comentario,actualizado_por,'Carga inicial',coalesce(actualizado_at,now())
from q100.avances;

create or replace function public.q100_guardar_avance(p_accion text, p_pct numeric, p_estado text, p_comentario text, p_ciclo text default null)
returns jsonb language plpgsql security definer set search_path to 'q100','public','pg_temp' as $function$
declare v_ciclo text; v_actor text; v_old_pct numeric; v_old_estado text;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  if not q100.puede_editar_accion(p_accion) then return jsonb_build_object('error','sin_permiso'); end if;
  if p_pct is not null and (p_pct<0 or p_pct>100) then return jsonb_build_object('error','pct_invalido'); end if;
  v_ciclo := coalesce(p_ciclo,
    (select ciclo_id from q100.ciclos where estado='abierto' order by numero desc limit 1),
    (select ciclo_id from q100.ciclos order by numero desc limit 1));
  if v_ciclo is null then return jsonb_build_object('error','sin_ciclo'); end if;
  v_actor := coalesce(auth.jwt()->>'email', (select nombre from q100.usuarios where user_id=auth.uid()), 'sistema');
  select pct_avance, estado into v_old_pct, v_old_estado from q100.avances where accion_id=p_accion and ciclo_id=v_ciclo;
  insert into q100.avances(accion_id,ciclo_id,pct_avance,estado,comentario,actualizado_por,actualizado_at)
  values (p_accion, v_ciclo, p_pct, nullif(p_estado,''), nullif(p_comentario,''), v_actor, now())
  on conflict (accion_id,ciclo_id) do update
    set pct_avance=excluded.pct_avance, estado=excluded.estado, comentario=excluded.comentario,
        actualizado_por=excluded.actualizado_por, actualizado_at=now();
  insert into q100.avances_hist(accion_id,ciclo_id,pct_anterior,pct_nuevo,estado_anterior,estado_nuevo,comentario,actor,procedencia)
    values (p_accion, v_ciclo, v_old_pct, p_pct, v_old_estado, nullif(p_estado,''), nullif(p_comentario,''), v_actor, 'app');
  insert into q100.log(entidad,entidad_id,accion,detalle,actor)
    values ('avance', p_accion, 'guardar',
      jsonb_build_object('ciclo',v_ciclo,'pct_anterior',v_old_pct,'pct_nuevo',p_pct,'estado',p_estado), v_actor);
  return jsonb_build_object('ok',true,'ciclo',v_ciclo,'pct_anterior',v_old_pct);
end$function$;

create or replace function public.q100_avance_historial(p_accion text, p_ciclo text default null)
returns jsonb language plpgsql stable security definer set search_path to 'q100','public','pg_temp' as $function$
declare v jsonb;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  select coalesce(jsonb_agg(to_jsonb(x) order by x.registrado_at desc),'[]'::jsonb) into v
  from (
    select hist_id, pct_anterior, pct_nuevo, estado_anterior, estado_nuevo, comentario, actor, procedencia,
           to_char(registrado_at at time zone 'America/Santiago','DD-MM-YYYY HH24:MI') as fecha
    from q100.avances_hist
    where accion_id=p_accion and (p_ciclo is null or ciclo_id=p_ciclo)
  ) x;
  return v;
end$function$;

grant execute on function public.q100_avance_historial(text,text) to authenticated;
