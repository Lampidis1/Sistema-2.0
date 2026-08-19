-- 2026-08-19 · Feria de Empleabilidad Digital (CV Minero QR)
-- Sistema AM · Antofagasta Minerals
--
-- Digitaliza la feria laboral minera: el postulante arma su Currículum Minero
-- (foto/PDF/Word → OCR → estructura → valida), obtiene un QR reutilizable, y
-- postula a cargos. Las empresas publican cargos y ven candidatos; los
-- reclutadores escanean el QR en el stand y registran la interacción; el
-- administrador (AMSA) crea ferias, gobierna datos y saca reportes.
--
-- PRIVACIDAD (Reglas 5 y 6): el OCR y el matching corren en el navegador
-- (tesseract + diccionario minero); NADA de Azure/OpenAI. El QR lleva SOLO un
-- token aleatorio, nunca el RUT ni el nombre. Todo dato personal vive en
-- Supabase; el postulante entra sin sesión pero solo por RPCs acotados.
--
-- Reutiliza el motor de empleabilidad y sus tablas:
--   cv_personas       → el Currículum Minero (ya trae casi todos los campos)
--   cv_ofertas        → los cargos (criterios_json alimenta el matching)
--   cv_postulaciones  → las postulaciones
-- A esas tres se les agregan columnas de enlace con la feria.
--
-- Slugs de acceso nuevos:
--   feria          → administrador AMSA de la feria
--   feria_empresa  → empresa contratista y su reclutador de stand
-- (el postulante NO usa slug: entra por código de evento vía RPC anónimo)

-- ── columnas de enlace en las tablas de empleabilidad ───────────────────────
alter table public.cv_ofertas       add column if not exists feria_id text;
alter table public.cv_ofertas       add column if not exists feria_empresa_id text;
alter table public.cv_postulaciones add column if not exists feria_id text;
alter table public.cv_postulaciones add column if not exists feria_empresa_id text;
alter table public.cv_postulaciones add column if not exists canal text;         -- 'app' | 'stand'
alter table public.cv_personas      add column if not exists equipos text;        -- equipos/maquinaria (PPT)

-- ── tablas de la feria ──────────────────────────────────────────────────────
create table if not exists public.ferias (
  feria_id text primary key,
  codigo text unique not null,              -- código de acceso del evento (para postulantes)
  nombre text, lugar text, descripcion text,
  fecha_inicio date, fecha_fin date,
  estado text default 'borrador',           -- borrador | activa | cerrada
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.feria_empresas (
  feria_empresa_id text primary key,
  feria_id text not null references public.ferias(feria_id),
  proveedor_id text,                        -- enlace opcional al directorio
  nombre text not null, rut text, rubro text, descripcion text,
  stand text, logo_url text, contacto text,
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Enlace usuario autenticado ↔ empresa (define quién opera cada stand).
create table if not exists public.feria_empresa_usuarios (
  id text primary key,
  feria_empresa_id text not null references public.feria_empresas(feria_empresa_id),
  user_id uuid not null,
  rol text default 'empresa',               -- empresa | reclutador
  nombre text,
  estado_registro text default 'Activo',
  created_by text, created_at timestamptz default now()
);

create table if not exists public.feria_participantes (
  feria_participante_id text primary key,
  feria_id text not null references public.ferias(feria_id),
  cv_id text,                               -- cv_personas.cv_id (se llena al guardar el CV)
  rut text, nombre text, telefono text, comuna text,
  credencial_token uuid unique default gen_random_uuid(),   -- lo que va en el QR
  consentimiento boolean default false, consentimiento_at timestamptz,
  inscrito_at timestamptz default now(),
  checkin_at timestamptz,                   -- cuando el QR se escanea por primera vez en la feria
  estado text default 'inscrito',
  estado_registro text default 'Activo',
  updated_at timestamptz default now()
);

-- Bitácora de trazabilidad: cada escaneo/acción en un stand.
create table if not exists public.feria_bitacora (
  bitacora_id text primary key,
  feria_id text not null references public.ferias(feria_id),
  feria_empresa_id text references public.feria_empresas(feria_empresa_id),
  feria_participante_id text references public.feria_participantes(feria_participante_id),
  cv_id text,
  reclutador_user uuid, reclutador_nombre text, stand text,
  accion text,                              -- escaneo | estado | comentario | derivacion
  estado text,                              -- nuevo | preseleccionado | contactar | descartado | contratado
  comentario text,
  oferta_id text, match_pct int,
  estado_registro text default 'Activo',
  created_at timestamptz default now()
);

create index if not exists idx_fe_empresas_feria on public.feria_empresas(feria_id);
create index if not exists idx_fe_emp_usuarios_user on public.feria_empresa_usuarios(user_id);
create index if not exists idx_fe_part_feria on public.feria_participantes(feria_id);
create index if not exists idx_fe_part_rut on public.feria_participantes(rut);
create index if not exists idx_fe_bit_empresa on public.feria_bitacora(feria_empresa_id);
create index if not exists idx_cv_ofertas_feria on public.cv_ofertas(feria_empresa_id);

-- ── helper: empresas del usuario actual (SECURITY DEFINER evita recursión RLS) ─
create or replace function public.feria_mis_empresas() returns setof text
language sql stable security definer set search_path to 'public','pg_temp' as $$
  select feria_empresa_id from public.feria_empresa_usuarios
  where user_id = auth.uid() and coalesce(estado_registro,'Activo') <> 'Eliminado'
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.ferias                  enable row level security;
alter table public.feria_empresas          enable row level security;
alter table public.feria_empresa_usuarios  enable row level security;
alter table public.feria_participantes     enable row level security;
alter table public.feria_bitacora          enable row level security;

-- ferias: admin gestiona; empresa/reclutador la leen.
drop policy if exists ferias_admin on public.ferias;
create policy ferias_admin on public.ferias for all to authenticated
  using (tiene_acceso('feria')) with check (tiene_acceso('feria'));
drop policy if exists ferias_read on public.ferias;
create policy ferias_read on public.ferias for select to authenticated
  using (tiene_acceso('feria') or tiene_acceso('feria_empresa'));

-- feria_empresas: admin todo; empresa lee todas de la feria y edita la suya.
drop policy if exists fe_empresas_admin on public.feria_empresas;
create policy fe_empresas_admin on public.feria_empresas for all to authenticated
  using (tiene_acceso('feria')) with check (tiene_acceso('feria'));
drop policy if exists fe_empresas_read on public.feria_empresas;
create policy fe_empresas_read on public.feria_empresas for select to authenticated
  using (tiene_acceso('feria') or tiene_acceso('feria_empresa'));
drop policy if exists fe_empresas_upd_own on public.feria_empresas;
create policy fe_empresas_upd_own on public.feria_empresas for update to authenticated
  using (feria_empresa_id in (select public.feria_mis_empresas()))
  with check (feria_empresa_id in (select public.feria_mis_empresas()));

-- feria_empresa_usuarios: admin gestiona; el usuario ve sus propios enlaces.
drop policy if exists fe_emp_usr_admin on public.feria_empresa_usuarios;
create policy fe_emp_usr_admin on public.feria_empresa_usuarios for all to authenticated
  using (tiene_acceso('feria')) with check (tiene_acceso('feria'));
drop policy if exists fe_emp_usr_own on public.feria_empresa_usuarios;
create policy fe_emp_usr_own on public.feria_empresa_usuarios for select to authenticated
  using (user_id = auth.uid());

-- feria_participantes: admin todo; empresa/reclutador leen (para armar candidatos).
drop policy if exists fe_part_admin on public.feria_participantes;
create policy fe_part_admin on public.feria_participantes for all to authenticated
  using (tiene_acceso('feria')) with check (tiene_acceso('feria'));
drop policy if exists fe_part_read on public.feria_participantes;
create policy fe_part_read on public.feria_participantes for select to authenticated
  using (tiene_acceso('feria') or tiene_acceso('feria_empresa'));

-- feria_bitacora: admin todo; empresa/reclutador escriben y leen lo de su empresa.
drop policy if exists fe_bit_admin on public.feria_bitacora;
create policy fe_bit_admin on public.feria_bitacora for all to authenticated
  using (tiene_acceso('feria')) with check (tiene_acceso('feria'));
drop policy if exists fe_bit_emp on public.feria_bitacora;
create policy fe_bit_emp on public.feria_bitacora for all to authenticated
  using (feria_empresa_id in (select public.feria_mis_empresas()))
  with check (feria_empresa_id in (select public.feria_mis_empresas()));

-- cv_ofertas: además de lo de empleabilidad, la empresa gestiona SUS cargos de feria.
drop policy if exists cv_ofertas_feria_emp on public.cv_ofertas;
create policy cv_ofertas_feria_emp on public.cv_ofertas for all to authenticated
  using (feria_empresa_id is not null and (tiene_acceso('feria') or feria_empresa_id in (select public.feria_mis_empresas())))
  with check (feria_empresa_id is not null and (tiene_acceso('feria') or feria_empresa_id in (select public.feria_mis_empresas())));

-- cv_postulaciones: la empresa lee las postulaciones a SUS cargos de feria.
drop policy if exists cv_post_feria_emp on public.cv_postulaciones;
create policy cv_post_feria_emp on public.cv_postulaciones for select to authenticated
  using (feria_empresa_id is not null and (tiene_acceso('feria') or feria_empresa_id in (select public.feria_mis_empresas())));

-- ── RPCs (aplicadas como migración feria_digital_rpcs) ──────────────────────
-- Flujo público del postulante (anon) y resolución del QR (reclutador):
--   feria_feria_por_codigo(codigo)      → feria_id si el código es válido
--   feria_buscar_cv(codigo, rut)        → CV precargado de ese RUT (jsonb) o null
--   feria_guardar_cv(codigo, cv, cons)  → upsert cv_personas + feria_participantes; devuelve credencial_token
--   feria_cargos_publicos(codigo)       → cargos de la feria para el matching en el navegador
--   feria_postular(codigo, token, of, %) → inserta cv_postulaciones (canal 'app')
--   feria_resolver_qr(token)            → [auth feria/feria_empresa] CV del participante desde su token
-- Todas SECURITY DEFINER con search_path fijo; GRANT EXECUTE a anon solo en las
-- del flujo público. El QR lleva SOLO el token aleatorio (sin RUT ni nombre).
