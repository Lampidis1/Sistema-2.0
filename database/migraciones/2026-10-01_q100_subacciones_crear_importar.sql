-- 2026-10-01 · Q100 — subacciones (ítem 5) + crear acción/subacción + importador (ítem 6)
-- ─────────────────────────────────────────────────────────────────────────────
-- parent_accion_id: una subacción apunta a su acción padre. Un padre (con hijos)
-- NO cuenta en el promedio (solo hojas). Las 316 históricas no tienen padre, así
-- que los promedios verificados (C3 74%, C2 86%) no cambian.
-- q100_dashboard y q100_acciones se recrean con la exclusión de padres y con
-- parent_accion_id/es_sub. Se agregan q100_accion_crear, q100_subaccion_crear y
-- q100_importar (dry-run de preview + confirmar). Ver el cuerpo completo aplicado
-- en Supabase; aquí el DDL clave (los dashboards se resumen por brevedad).
-- ─────────────────────────────────────────────────────────────────────────────

alter table q100.acciones add column if not exists parent_accion_id text;
create index if not exists q100_acciones_parent_idx on q100.acciones(parent_accion_id);

-- q100_dashboard: el CTE `q` añade
--   and not exists(select 1 from q100.acciones c where c.parent_accion_id=a.accion_id and c.activo)
-- para promediar solo hojas. (Resto idéntico a la versión previa.)
-- q100_acciones: añade 'parent_accion_id' y 'es_sub' (a.parent_accion_id is not null)
-- a cada objeto, y ordena subacciones tras su padre. (Resto idéntico.)

create or replace function public.q100_accion_crear(
  p_meta integer, p_linea_id text, p_titulo text, p_area text,
  p_criticidad text default 'no_critica', p_termino date default null, p_ciclo text default null)
returns jsonb language plpgsql security definer set search_path to 'q100','public','pg_temp' as $function$
declare v_ciclo text; v_id text; v_meta text; v_actor text;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  if not (q100.es_corporativo() or (q100.mi_area() is not null and q100.mi_area()=p_area)) then
    return jsonb_build_object('error','sin_permiso'); end if;
  if coalesce(trim(p_titulo),'')='' then return jsonb_build_object('error','titulo_vacio'); end if;
  if coalesce(p_criticidad,'') not in ('critica','no_critica') then return jsonb_build_object('error','criticidad_invalida'); end if;
  v_meta := 'm'||lpad(p_meta::text,2,'0');
  if not exists(select 1 from q100.lineas where linea_id=p_linea_id and meta_id=v_meta) then
    return jsonb_build_object('error','linea_invalida'); end if;
  v_ciclo := coalesce(p_ciclo,(select ciclo_id from q100.ciclos where estado='abierto' order by numero desc limit 1),
    (select ciclo_id from q100.ciclos order by numero desc limit 1));
  v_actor := coalesce(auth.jwt()->>'email',(select nombre from q100.usuarios where user_id=auth.uid()),'sistema');
  v_id := 'man-'||replace(gen_random_uuid()::text,'-','');
  insert into q100.acciones(accion_id,linea_id,meta_id,area_id,accion,criticidad,fecha_termino,origen,created_by)
    values(v_id,p_linea_id,v_meta,p_area,trim(p_titulo),p_criticidad,p_termino,'manual',v_actor);
  insert into q100.avances(accion_id,ciclo_id,pct_avance,estado,actualizado_por) values(v_id,v_ciclo,0,'pendiente',v_actor);
  return jsonb_build_object('ok',true,'accion_id',v_id);
end$function$;

create or replace function public.q100_subaccion_crear(
  p_parent text, p_titulo text, p_criticidad text default 'no_critica', p_termino date default null, p_ciclo text default null)
returns jsonb language plpgsql security definer set search_path to 'q100','public','pg_temp' as $function$
declare v_ciclo text; v_id text; v_p record; v_actor text;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  if not q100.puede_editar_accion(p_parent) then return jsonb_build_object('error','sin_permiso'); end if;
  if coalesce(trim(p_titulo),'')='' then return jsonb_build_object('error','titulo_vacio'); end if;
  select linea_id,meta_id,area_id into v_p from q100.acciones where accion_id=p_parent;
  if not found then return jsonb_build_object('error','padre_no_encontrado'); end if;
  v_ciclo := coalesce(p_ciclo,(select ciclo_id from q100.ciclos where estado='abierto' order by numero desc limit 1),
    (select ciclo_id from q100.ciclos order by numero desc limit 1));
  v_actor := coalesce(auth.jwt()->>'email',(select nombre from q100.usuarios where user_id=auth.uid()),'sistema');
  v_id := 'sub-'||replace(gen_random_uuid()::text,'-','');
  insert into q100.acciones(accion_id,linea_id,meta_id,area_id,accion,criticidad,fecha_termino,origen,parent_accion_id,created_by)
    values(v_id,v_p.linea_id,v_p.meta_id,v_p.area_id,trim(p_titulo),coalesce(p_criticidad,'no_critica'),p_termino,'manual',p_parent,v_actor);
  insert into q100.avances(accion_id,ciclo_id,pct_avance,estado,actualizado_por) values(v_id,v_ciclo,0,'pendiente',v_actor);
  return jsonb_build_object('ok',true,'accion_id',v_id);
end$function$;

-- Importador: p_dry=true devuelve conteos sin escribir; p_dry=false aplica.
-- p_filas = array de {accion_id?, meta, linea, titulo, area_id, criticidad, pct, estado, termino}.
create or replace function public.q100_importar(p_ciclo text, p_filas jsonb, p_dry boolean default true)
returns jsonb language plpgsql security definer set search_path to 'q100','public','pg_temp' as $function$
declare f jsonb; v_meta text; v_lin text; v_aid text; v_actor text;
  n_filas int:=0; n_lin_new int:=0; n_acc_new int:=0; n_acc_upd int:=0;
begin
  if not q100.es_corporativo() then return jsonb_build_object('error','sin_permiso'); end if;
  if p_ciclo is null or not exists(select 1 from q100.ciclos where ciclo_id=p_ciclo) then
    return jsonb_build_object('error','ciclo_invalido'); end if;
  v_actor := coalesce(auth.jwt()->>'email','(import)');
  for f in select * from jsonb_array_elements(coalesce(p_filas,'[]'::jsonb)) loop
    n_filas := n_filas+1;
    v_meta := 'm'||lpad((f->>'meta')::int::text,2,'0');
    if not exists(select 1 from q100.metas where meta_id=v_meta) then continue; end if;
    select linea_id into v_lin from q100.lineas where meta_id=v_meta and titulo=f->>'linea' limit 1;
    if v_lin is null then
      v_lin := 'imp-'||replace(gen_random_uuid()::text,'-','');
      if not p_dry then
        insert into q100.lineas(linea_id,meta_id,titulo,orden)
          values(v_lin,v_meta,coalesce(f->>'linea','(sin línea)'),
            coalesce((select max(orden)+1 from q100.lineas where meta_id=v_meta),1));
      end if;
      n_lin_new := n_lin_new+1;
    end if;
    v_aid := nullif(f->>'accion_id','');
    if v_aid is null then v_aid := 'imp-'||replace(gen_random_uuid()::text,'-',''); end if;
    if exists(select 1 from q100.acciones where accion_id=v_aid) then n_acc_upd:=n_acc_upd+1; else n_acc_new:=n_acc_new+1; end if;
    if not p_dry then
      insert into q100.acciones(accion_id,linea_id,meta_id,area_id,accion,criticidad,fecha_termino,origen,created_by)
        values(v_aid,v_lin,v_meta,nullif(f->>'area_id',''),coalesce(f->>'titulo','(sin título)'),
          coalesce(nullif(f->>'criticidad',''),'no_critica'),nullif(f->>'termino','')::date,'import',v_actor)
      on conflict(accion_id) do update set linea_id=excluded.linea_id,meta_id=excluded.meta_id,
        area_id=excluded.area_id,accion=excluded.accion,criticidad=excluded.criticidad,fecha_termino=excluded.fecha_termino;
      insert into q100.avances(accion_id,ciclo_id,pct_avance,estado,actualizado_por)
        values(v_aid,p_ciclo,nullif(f->>'pct','')::numeric,nullif(f->>'estado',''),'Carga inicial')
      on conflict(accion_id,ciclo_id) do update set pct_avance=excluded.pct_avance,estado=excluded.estado,actualizado_at=now();
    end if;
  end loop;
  return jsonb_build_object('ok',true,'dry',p_dry,'filas',n_filas,
    'lineas_nuevas',n_lin_new,'acciones_nuevas',n_acc_new,'acciones_actualizadas',n_acc_upd);
end$function$;

grant execute on function public.q100_accion_crear(integer,text,text,text,text,date,text) to authenticated;
grant execute on function public.q100_subaccion_crear(text,text,text,date,text) to authenticated;
grant execute on function public.q100_importar(text,jsonb,boolean) to authenticated;
