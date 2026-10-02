-- 2026-10-02 · Oficina Móvil — relaciones de la atención + campos por visita
-- Sistema AM · Antofagasta Minerals
--
-- Aplicado en Supabase como migración: 2026-10-02_movil_atencion_relaciones
-- Aditivo y seguro (no renombra ni borra). La RLS existente de cada tabla se
-- conserva (política permisiva por tiene_acceso movil/empleabilidad/principal).
--
--  · atenciones: comentario de la visita (#14), ubicación/localidad/teléfono y
--    resultado (#26) para el Resumen y el historial.
--  · derivaciones / formaciones: atencion_id para ligar cada derivación e
--    inscripción/levantamiento a SU atención (#9, #12, #26) y verlas en el historial.
--  · formaciones.licencias_json: licencias habilitantes del levantamiento (#11).

alter table public.atenciones add column if not exists comentario text;
alter table public.atenciones add column if not exists localidad text;
alter table public.atenciones add column if not exists telefono text;
alter table public.atenciones add column if not exists resultado text;

alter table public.derivaciones add column if not exists atencion_id text;
alter table public.formaciones  add column if not exists atencion_id text;
alter table public.formaciones  add column if not exists licencias_json text;

create index if not exists idx_derivaciones_atencion on public.derivaciones(atencion_id);
create index if not exists idx_formaciones_atencion  on public.formaciones(atencion_id);
create index if not exists idx_atenciones_rut on public.atenciones(rut);
