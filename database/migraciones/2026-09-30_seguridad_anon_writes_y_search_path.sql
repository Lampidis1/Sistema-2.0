-- 2026-09-30 · Endurecimiento de seguridad (auditoría del sistema)
-- ─────────────────────────────────────────────────────────────────────────────
-- Hallazgos de la auditoría de seguridad de Supabase:
--
-- #1 (ALTO) Escritura anónima. Varias políticas INSERT estaban definidas para el
--   rol `public` (que incluye `anon`) sin WITH CHECK, y `anon` tenía privilegio
--   de INSERT/UPDATE/DELETE sobre las tablas → cualquiera con la anon key podía
--   insertar filas (spam / contaminación; NO robo, los SELECT sí están gateados).
--   Se verificó que TODOS los flujos públicos (link de CV `cv_link_guardar`,
--   feria `feria_guardar_cv`, portal de empresa `gestion_vacante_*`, lavanderías
--   `lav_*`) escriben por RPC SECURITY DEFINER (corren como dueño, no como anon),
--   por lo que `anon` no necesita escritura directa. Se le revoca.
--
-- #4 (BAJO) 5 validadores SECURITY INVOKER sin search_path fijo → se fija.
--
-- Aplicado en Supabase el 2026-09-30.
-- ─────────────────────────────────────────────────────────────────────────────

-- #1 — quitar escritura directa del rol anónimo (los flujos públicos usan RPC).
revoke insert, update, delete, truncate on all tables in schema public       from anon;
revoke insert, update, delete, truncate on all tables in schema q100         from anon;
revoke insert, update, delete, truncate on all tables in schema lavanderias  from anon;

-- #4 — search_path fijo en los validadores.
alter function public.am_rut_valido(text)      set search_path = public, pg_temp;
alter function public.am_email_valido(text)    set search_path = public, pg_temp;
alter function public.am_fono_valido(text)     set search_path = public, pg_temp;
alter function public.cv_personas_validar()    set search_path = public, pg_temp;
alter function public.mgi_rubro_norm(text)     set search_path = public, pg_temp;

-- ─────────────────────────────────────────────────────────────────────────────
-- PENDIENTE (decisiones / no aplicado aquí):
-- #2 (MEDIO) Vista pública `hoteles_sg_publico` es SECURITY DEFINER (necesario
--    para servir a anon). Expone correo y teléfono de proveedores públicamente
--    → confirmar si es deseado; si no, quitar esas columnas o migrar a RPC.
-- #3 (BAJO) Activar "Leaked password protection" en Supabase Auth (dashboard).
-- #5 (INFO) Tablas de respaldo con datos personales en `public` (RLS sin
--    políticas → inaccesibles por API): mover fuera de `public` o eliminar.
-- Nota: las políticas INSERT del rol `authenticated` siguen sin WITH CHECK
--    (cualquier usuario logueado puede insertar en tablas de otros módulos).
--    Menor riesgo; endurecer con checks por módulo en una pasada futura.
-- ─────────────────────────────────────────────────────────────────────────────
