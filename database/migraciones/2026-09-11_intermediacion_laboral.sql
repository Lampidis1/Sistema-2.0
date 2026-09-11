-- 2026-09-11 · Intermediación Laboral (Empleabilidad) — Fase A
-- Sistema AM · Antofagasta Minerals
--
-- Nueva pestaña "Intermediación Laboral" en Empleabilidad para publicar puestos
-- disponibles y llevar el seguimiento de las derivaciones (personas enviadas a
-- una vacante), reemplazando las planillas "Ficha Vacantes EECC-AMSA" y
-- "Seguimiento Derivaciones EECC".
--
-- Convive con la pestaña "Ofertas" existente (match %): son cosas distintas.
-- Acá NO hay match %; el calce se define por competencias EXCLUYENTES / no
-- excluyentes (se guarda el % para una etapa futura).
--
-- Acceso: mismo que Empleabilidad — slug 'empleabilidad', o 'movil', o
-- 'principal' (el equipo que atiende la Oficina Móvil). RLS en el mismo cambio.

create table if not exists public.vacantes (
  vacante_id text primary key,
  empresa text,                          -- EECC que contrata
  compania text,                         -- faena / holding: Antucoya, Zaldívar, Centinela, AMSA…
  tipo_contrato text default 'externo',  -- 'propio' (AMSA/faena, requiere código) | 'externo' (EECC, código autogenerado)
  codigo_puesto text,                    -- manual si propio; autogenerado si externo
  cargo text not null,
  n_vacantes int default 1,
  formacion text,                        -- nivel educacional requerido
  descripcion text,
  turno text,
  con_campamento boolean,
  fecha_ingreso date,
  residencia text,                       -- residencia/localidad requerida
  datos_adicionales text,                -- renta, beneficios, etc.
  competencias_json text default '[]',   -- [{texto, excluyente:bool}]
  estado text default 'abierta',         -- abierta | cerrada
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.derivaciones (
  derivacion_id text primary key,
  vacante_id text references public.vacantes(vacante_id),
  cv_id text,                            -- cv_personas.cv_id si la persona ya está en la base
  rut text, nombre text, apellidos text, telefono text,
  eecc text, localidad text,
  cargo_txt text,                        -- snapshot del cargo derivado
  seguimiento_eecc text,                 -- respuesta/seguimiento de la EECC
  estado text default 'registrada',      -- registrada | efectiva | descartada
  comentarios text,
  fecha_derivacion date default current_date,
  derivado_por text,
  estado_registro text default 'Activo',
  created_by text, updated_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create index if not exists idx_deriv_vacante on public.derivaciones(vacante_id);
create index if not exists idx_deriv_rut on public.derivaciones(rut);
create index if not exists idx_vacantes_estado on public.vacantes(estado);

alter table public.vacantes     enable row level security;
alter table public.derivaciones enable row level security;

drop policy if exists vacantes_rw on public.vacantes;
create policy vacantes_rw on public.vacantes for all to authenticated
  using (tiene_acceso('empleabilidad') or tiene_acceso('movil') or tiene_acceso('principal'))
  with check (tiene_acceso('empleabilidad') or tiene_acceso('movil') or tiene_acceso('principal'));

drop policy if exists derivaciones_rw on public.derivaciones;
create policy derivaciones_rw on public.derivaciones for all to authenticated
  using (tiene_acceso('empleabilidad') or tiene_acceso('movil') or tiene_acceso('principal'))
  with check (tiene_acceso('empleabilidad') or tiene_acceso('movil') or tiene_acceso('principal'));
