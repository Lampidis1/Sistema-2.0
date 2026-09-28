-- 2026-09-28 · Reestructura del cuestionario (Fase C)
-- ─────────────────────────────────────────────────────────────────────────────
-- Se movieron a Recepción las preguntas de salud y el levantamiento pasó a
-- oficios con selección múltiple. Se conservan las columnas antiguas.
--   · cv_personas.discapacidad / tipo_discapacidad / discapacidad_detalle
--   · cv_personas.contraindicaciones_json (checkbox múltiple + especifiques)
--   · formaciones.oficios_interes_json
-- Aplicado en Supabase el 2026-09-28; este archivo es el registro.
-- ─────────────────────────────────────────────────────────────────────────────

alter table cv_personas
  add column if not exists discapacidad text,
  add column if not exists tipo_discapacidad text,
  add column if not exists discapacidad_detalle text,
  add column if not exists contraindicaciones_json text;

alter table formaciones
  add column if not exists oficios_interes_json text;
