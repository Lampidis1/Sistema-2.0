-- 2026-09-25 · Portal empresa: clave de visualización + vigencia + cierre
-- ─────────────────────────────────────────────────────────────────────────────
-- El link del portal de la empresa (gestion-vacante.html?t=token) puede llevar
-- una CLAVE de visualización y una VIGENCIA (días). Empleabilidad/Móvil deciden
-- si cierran o reabren el acceso.
--
--   · vacante_links.clave_hash  → hash bcrypt. NULL = link sin clave (como antes).
--   · vacante_links.activo/expira ya existían.
--
-- ⚠️ pgcrypto vive en el esquema `extensions` (Supabase). Como las funciones son
--    SECURITY DEFINER con search_path acotado a public/pg_temp, crypt()/gen_salt()
--    se llaman calificadas como extensions.crypt / extensions.gen_salt.
--
-- El texto plano de la clave NUNCA se guarda ni viaja fuera de la verificación
-- server-side; anon no puede leer vacante_links (RLS).
-- ─────────────────────────────────────────────────────────────────────────────

alter table vacante_links add column if not exists clave_hash text;

-- Crear link con clave opcional y vigencia. Lo llama Empleabilidad/Móvil
-- (usuario autenticado con acceso); valida el acceso adentro.
create or replace function public.vacante_link_crear(
  p_vacante_id text, p_empresa text, p_clave text default null, p_dias int default null)
returns jsonb language plpgsql security definer set search_path to 'public','pg_temp' as $$
declare v_token uuid;
begin
  if auth.uid() is null or not (public.es_admin() or public.tiene_acceso('empleabilidad') or public.tiene_acceso('movil')) then
    raise exception 'sin_permiso';
  end if;
  insert into vacante_links(vacante_id, empresa, activo, expira, clave_hash, created_by)
  values (p_vacante_id, nullif(p_empresa,''), true,
          case when coalesce(p_dias,0)>0 then now()+(p_dias||' days')::interval else null end,
          case when coalesce(p_clave,'')<>'' then extensions.crypt(p_clave, extensions.gen_salt('bf')) else null end,
          coalesce(auth.jwt()->>'email','(sistema)'))
  returning token into v_token;
  return jsonb_build_object('token', v_token);
end $$;

-- Cerrar / reabrir el acceso y/o extender la vigencia (Empleabilidad decide).
create or replace function public.vacante_link_estado(
  p_token uuid, p_activo boolean default null, p_dias int default null)
returns jsonb language plpgsql security definer set search_path to 'public','pg_temp' as $$
begin
  if auth.uid() is null or not (public.es_admin() or public.tiene_acceso('empleabilidad') or public.tiene_acceso('movil')) then
    raise exception 'sin_permiso';
  end if;
  update vacante_links set
    activo = coalesce(p_activo, activo),
    expira = case when p_dias is null then expira
                  when p_dias<=0 then null
                  else now()+(p_dias||' days')::interval end
  where token=p_token;
  if not found then return jsonb_build_object('error','no_encontrado'); end if;
  return jsonb_build_object('ok', true);
end $$;

-- Portal público: exige la clave si el link la tiene.
drop function if exists public.gestion_vacante_publico(uuid);
create or replace function public.gestion_vacante_publico(p_token uuid, p_clave text default null)
returns jsonb language plpgsql stable security definer set search_path to 'public','pg_temp' as $$
declare v_link record; v_vac jsonb; v_ders jsonb;
begin
  select * into v_link from vacante_links where token=p_token and activo=true and (expira is null or expira>now());
  if not found then return jsonb_build_object('error','no_encontrado'); end if;
  if v_link.clave_hash is not null then
    if coalesce(p_clave,'')='' then return jsonb_build_object('error','clave_requerida'); end if;
    if extensions.crypt(p_clave, v_link.clave_hash) <> v_link.clave_hash then return jsonb_build_object('error','clave_incorrecta'); end if;
  end if;
  select to_jsonb(x) into v_vac from (
    select vacante_id,empresa,compania,cargo,codigo_puesto,n_vacantes,turno,residencia,descripcion,datos_adicionales,formacion,competencias_json
    from vacantes where vacante_id=v_link.vacante_id and coalesce(estado_registro,'')<>'Eliminado') x;
  if v_vac is null then return jsonb_build_object('error','no_encontrado'); end if;
  select coalesce(jsonb_agg(to_jsonb(d) order by d.fecha_derivacion desc nulls last),'[]'::jsonb) into v_ders from (
    select de.derivacion_id, de.nombre, de.apellidos, de.rut, de.telefono, de.localidad,
           de.estado, de.seguimiento_eecc, de.fecha_derivacion, de.cv_pdf_url,
           p.nombres as cv_nombres, p.apellidos as cv_apellidos, p.email, p.comuna, p.resumen,
           p.experiencia_json, p.academico_json, p.cursos_json, p.idiomas_json, p.software_json
    from derivaciones de
    left join cv_personas p on p.cv_id=de.cv_id
    where de.vacante_id=v_link.vacante_id and coalesce(de.estado_registro,'')<>'Eliminado') d;
  return jsonb_build_object('vacante',v_vac,'candidatos',v_ders,'empresa',v_link.empresa);
end $$;

-- Seguimiento (estado / comentario EECC): misma verificación de clave.
drop function if exists public.gestion_vacante_seguimiento(uuid, text, text, text);
create or replace function public.gestion_vacante_seguimiento(
  p_token uuid, p_derivacion_id text, p_estado text, p_seguimiento text, p_clave text default null)
returns jsonb language plpgsql security definer set search_path to 'public','pg_temp' as $$
declare v_link record; v_row record;
begin
  select * into v_link from vacante_links where token=p_token and activo=true and (expira is null or expira>now());
  if not found then return jsonb_build_object('error','no_encontrado'); end if;
  if v_link.clave_hash is not null then
    if coalesce(p_clave,'')='' or extensions.crypt(p_clave, v_link.clave_hash) <> v_link.clave_hash then
      return jsonb_build_object('error','clave'); end if;
  end if;
  select * into v_row from derivaciones where derivacion_id=p_derivacion_id and vacante_id=v_link.vacante_id;
  if not found then return jsonb_build_object('error','no_encontrado'); end if;
  update derivaciones set
     estado=coalesce(nullif(p_estado,''),estado),
     seguimiento_eecc=coalesce(p_seguimiento,seguimiento_eecc),
     updated_at=now(), updated_by='empresa(portal)'
   where derivacion_id=p_derivacion_id;
  return jsonb_build_object('ok',true);
end $$;

grant execute on function public.vacante_link_crear(text,text,text,int) to authenticated;
grant execute on function public.vacante_link_estado(uuid,boolean,int) to authenticated;
grant execute on function public.gestion_vacante_publico(uuid,text) to anon, authenticated;
grant execute on function public.gestion_vacante_seguimiento(uuid,text,text,text,text) to anon, authenticated;
