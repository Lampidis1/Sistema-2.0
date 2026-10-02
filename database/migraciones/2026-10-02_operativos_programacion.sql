-- 2026-10-02 · Operativos programados + cierre automático server-side (#16, #17)
-- Sistema AM · Antofagasta Minerals
--
-- Aplicado en Supabase como migración: 2026-10-02_operativos_programacion
-- Aditivo. Estados: programado | activo | finalizado (compat: 'cerrado' = finalizado).
--
-- El operativo se CONFIGURA desde Empleabilidad (nombre, fecha, hora inicio/término,
-- ubicación/zona, responsable). En el móvil, el ejecutivo lo ACTIVA (puede ser
-- después de la hora de inicio; el inicio real = momento de activación). A la hora
-- de término se cierra SOLO, sin que nadie presione un botón, por dos vías en el
-- servidor (no depende de que el navegador quede abierto):
--   (a) RPC operativos_cerrar_vencidos() — la llama el frontend al cargar y, además,
--       se agenda con pg_cron cada 5 min;
--   (b) trigger en atenciones que NO liga una atención a un operativo ya vencido.

alter table public.operativos add column if not exists nombre text;
alter table public.operativos add column if not exists hora_inicio time;
alter table public.operativos add column if not exists hora_termino time;
alter table public.operativos add column if not exists inicio_real timestamptz;
alter table public.operativos add column if not exists responsable text;

create or replace function public.operativos_cerrar_vencidos()
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare n int;
begin
  update public.operativos
     set estado='finalizado', cerrado_at=coalesce(cerrado_at, now())
   where estado in ('activo','programado') and hora_termino is not null
     and (fecha + hora_termino) <= (now() at time zone 'America/Santiago');
  get diagnostics n = row_count;
  return n;
end$$;
grant execute on function public.operativos_cerrar_vencidos() to authenticated;

create or replace function public.operativo_activar(p_id text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.operativos; venc boolean;
begin
  if not (public.tiene_acceso('movil') or public.tiene_acceso('empleabilidad') or public.tiene_acceso('principal')) then
    return jsonb_build_object('error','sin_acceso'); end if;
  select * into o from public.operativos where operativo_id=p_id;
  if not found then return jsonb_build_object('error','no_existe'); end if;
  if o.estado in ('finalizado','cerrado') then return jsonb_build_object('error','finalizado'); end if;
  venc := o.hora_termino is not null and (o.fecha + o.hora_termino) <= (now() at time zone 'America/Santiago');
  if venc then
    update public.operativos set estado='finalizado', cerrado_at=now() where operativo_id=p_id;
    return jsonb_build_object('error','vencido');
  end if;
  update public.operativos set estado='activo', inicio_real=coalesce(inicio_real, now()) where operativo_id=p_id;
  return jsonb_build_object('ok',true);
end$$;
grant execute on function public.operativo_activar(text) to authenticated;

create or replace function public.atenciones_valida_operativo()
returns trigger language plpgsql set search_path=public,pg_temp as $$
declare o public.operativos;
begin
  if NEW.operativo_id is not null then
    select * into o from public.operativos where operativo_id=NEW.operativo_id;
    if found and o.hora_termino is not null
       and (o.fecha + o.hora_termino) <= (now() at time zone 'America/Santiago') then
      NEW.operativo_id := null;
    end if;
  end if;
  return NEW;
end$$;
drop trigger if exists trg_atenciones_operativo on public.atenciones;
create trigger trg_atenciones_operativo before insert on public.atenciones
  for each row execute function public.atenciones_valida_operativo();

-- pg_cron (habilitado en este proyecto el 2026-10-02): barrido cada 5 minutos.
--   create extension if not exists pg_cron;
--   select cron.schedule('operativos-cerrar-vencidos','*/5 * * * *',
--                        'select public.operativos_cerrar_vencidos();');
