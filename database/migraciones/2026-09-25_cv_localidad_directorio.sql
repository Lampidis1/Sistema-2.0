-- 2026-09-25 · Directorio CCV: localidad + marca manual de directorio
-- ─────────────────────────────────────────────────────────────────────────────
-- Contexto
--   El Directorio CV (Empleabilidad) ahora filtra por comuna Y localidad, y
--   destaca los CV que el ejecutivo marca en el APRESTO con "Vincular al
--   Directorio CV". La inclusión es 100% manual (no hay regla automática por
--   comuna): solo entran al Directorio CCV los CV con directorio_cv = true.
--
-- Cambios
--   · cv_personas.localidad     text  → pueblo/localidad dentro de la comuna
--                                       (selector dependiente en el móvil).
--   · cv_personas.directorio_cv boolean default false → marca manual del apresto.
--
-- No requiere cambios de RLS: son columnas nuevas de una tabla ya protegida.
-- ─────────────────────────────────────────────────────────────────────────────

alter table cv_personas
  add column if not exists localidad text,
  add column if not exists directorio_cv boolean not null default false;

comment on column cv_personas.directorio_cv is
  'Marcado manualmente en el apresto: incluir este CV en el Directorio CCV (localidades prioritarias).';
comment on column cv_personas.localidad is
  'Localidad/pueblo dentro de la comuna (para filtrar el Directorio CV).';
