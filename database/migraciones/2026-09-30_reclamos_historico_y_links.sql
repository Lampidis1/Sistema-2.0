-- 2026-09-30 · Reclamos — histórico de informes + link público con clave
-- ─────────────────────────────────────────────────────────────────────────────
-- Fase 2 del módulo Reclamos. Al presionar el candado, el informe semanal se
-- CONGELA y se guarda como histórico (solo las 11 columnas del correo, SIN
-- datos personales del reclamante), con un link público opcional protegido por
-- clave aleatoria y con vigencia (por defecto 7 días).
--
-- Patrón idéntico a vacante_links / q100 / lavanderías:
--   · La tabla tiene RLS habilitado y SIN políticas → denegar todo acceso
--     directo por la API (anon y authenticated). Todo pasa por RPCs.
--   · Las RPCs son SECURITY DEFINER con search_path acotado.
--   · pgcrypto vive en el esquema `extensions` → extensions.crypt/gen_salt.
--   · El texto plano de la clave NUNCA se guarda: solo su hash bcrypt.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.reclamos_informes (
  id           uuid primary key default gen_random_uuid(),
  token        uuid not null unique default gen_random_uuid(),
  vista        text not null default 'norte',          -- 'norte' | 'mlp'
  titulo       text not null,
  fecha_informe date not null default current_date,
  filas        jsonb not null default '[]'::jsonb,      -- 11 columnas, sin PII
  meta         jsonb not null default '{}'::jsonb,      -- filtros, conteos, archivo origen
  clave_hash   text,                                    -- bcrypt de la clave del link (NULL = sin clave)
  activo       boolean not null default true,
  expira       timestamptz,
  creado_por   text,
  creado_at    timestamptz not null default now()
);

-- RLS: habilitado y sin políticas => nadie accede directo por la API.
alter table public.reclamos_informes enable row level security;
revoke all on public.reclamos_informes from anon, authenticated;

create index if not exists reclamos_informes_vista_fecha_idx
  on public.reclamos_informes (vista, fecha_informe desc);

-- ── Helper de acceso: quién puede operar el módulo Reclamos ──
create or replace function public.reclamos_puede()
returns boolean language sql stable security definer set search_path to 'public','pg_temp' as $$
  select auth.uid() is not null
     and (public.es_admin() or public.tiene_acceso('reclamos') or public.tiene_acceso('principal'));
$$;

-- ── Guardar (candado): congela el informe y opcionalmente le pone clave/vigencia ──
create or replace function public.reclamos_guardar(
  p_vista text, p_titulo text, p_fecha date, p_filas jsonb, p_meta jsonb,
  p_clave text default null, p_dias int default 7)
returns jsonb language plpgsql security definer set search_path to 'public','pg_temp' as $$
declare v_id uuid; v_token uuid;
begin
  if not public.reclamos_puede() then raise exception 'sin_permiso'; end if;
  insert into public.reclamos_informes(vista, titulo, fecha_informe, filas, meta, clave_hash, expira, creado_por)
  values (coalesce(nullif(p_vista,''),'norte'), coalesce(nullif(p_titulo,''),'Informe de reclamos'),
          coalesce(p_fecha, current_date), coalesce(p_filas,'[]'::jsonb), coalesce(p_meta,'{}'::jsonb),
          case when coalesce(p_clave,'')<>'' then extensions.crypt(p_clave, extensions.gen_salt('bf')) else null end,
          case when coalesce(p_dias,0)>0 then now()+(p_dias||' days')::interval else null end,
          coalesce(auth.jwt()->>'email','(sistema)'))
  returning id, token into v_id, v_token;
  return jsonb_build_object('id', v_id, 'token', v_token);
end $$;

-- ── Listado del histórico (sin exponer clave_hash ni las filas completas) ──
create or replace function public.reclamos_historico(p_vista text default null)
returns jsonb language plpgsql stable security definer set search_path to 'public','pg_temp' as $$
declare v jsonb;
begin
  if not public.reclamos_puede() then raise exception 'sin_permiso'; end if;
  select coalesce(jsonb_agg(to_jsonb(x) order by x.fecha_informe desc, x.creado_at desc),'[]'::jsonb) into v
  from (
    select id, token, vista, titulo, fecha_informe, creado_por, creado_at, expira, activo,
           (clave_hash is not null) as tiene_clave,
           jsonb_array_length(filas) as n_filas,
           (expira is not null and expira < now()) as vencido
    from public.reclamos_informes
    where p_vista is null or vista = p_vista
  ) x;
  return v;
end $$;

-- ── Abrir un informe guardado (dentro del módulo, usuario con acceso) ──
create or replace function public.reclamos_ver(p_id uuid)
returns jsonb language plpgsql stable security definer set search_path to 'public','pg_temp' as $$
declare v_r record;
begin
  if not public.reclamos_puede() then raise exception 'sin_permiso'; end if;
  select * into v_r from public.reclamos_informes where id = p_id;
  if not found then return jsonb_build_object('error','no_encontrado'); end if;
  return jsonb_build_object('id',v_r.id,'token',v_r.token,'vista',v_r.vista,'titulo',v_r.titulo,
    'fecha_informe',v_r.fecha_informe,'filas',v_r.filas,'meta',v_r.meta,
    'activo',v_r.activo,'expira',v_r.expira,'tiene_clave',(v_r.clave_hash is not null),'creado_por',v_r.creado_por);
end $$;

-- ── Cambiar estado del link: revocar/reabrir y/o extender vigencia ──
create or replace function public.reclamos_link_estado(
  p_id uuid, p_activo boolean default null, p_dias int default null)
returns jsonb language plpgsql security definer set search_path to 'public','pg_temp' as $$
begin
  if not public.reclamos_puede() then raise exception 'sin_permiso'; end if;
  update public.reclamos_informes set
    activo = coalesce(p_activo, activo),
    expira = case when p_dias is null then expira
                  when p_dias<=0 then null
                  else now()+(p_dias||' days')::interval end
  where id = p_id;
  if not found then return jsonb_build_object('error','no_encontrado'); end if;
  return jsonb_build_object('ok', true);
end $$;

-- ── Vista pública (link del correo): exige la clave si el informe la tiene ──
create or replace function public.reclamos_ver_publico(p_token uuid, p_clave text default null)
returns jsonb language plpgsql stable security definer set search_path to 'public','pg_temp' as $$
declare v_r record;
begin
  select * into v_r from public.reclamos_informes
   where token = p_token and activo = true and (expira is null or expira > now());
  if not found then return jsonb_build_object('error','no_disponible'); end if;
  if v_r.clave_hash is not null then
    if coalesce(p_clave,'')='' then return jsonb_build_object('error','clave_requerida'); end if;
    if extensions.crypt(p_clave, v_r.clave_hash) <> v_r.clave_hash then
      return jsonb_build_object('error','clave_incorrecta'); end if;
  end if;
  return jsonb_build_object('titulo',v_r.titulo,'vista',v_r.vista,'fecha_informe',v_r.fecha_informe,
    'filas',v_r.filas,'creado_por',v_r.creado_por);
end $$;

grant execute on function public.reclamos_puede()                         to authenticated;
grant execute on function public.reclamos_guardar(text,text,date,jsonb,jsonb,text,int) to authenticated;
grant execute on function public.reclamos_historico(text)                 to authenticated;
grant execute on function public.reclamos_ver(uuid)                       to authenticated;
grant execute on function public.reclamos_link_estado(uuid,boolean,int)   to authenticated;
grant execute on function public.reclamos_ver_publico(uuid,text)          to anon, authenticated;
