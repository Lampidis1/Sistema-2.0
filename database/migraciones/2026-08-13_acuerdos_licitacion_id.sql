-- 2026-08-13 · Vincular el contrato con la licitación que lo originó
--
-- Al marcar una licitación como "Adjudicado", el sistema lleva de inmediato a
-- la pestaña Contratos del mismo proveedor con el formulario abierto. Esta
-- columna deja registrado de qué proceso viene el contrato, para poder
-- mostrar "Contrato cargado" en la línea de tiempo y evitar que una
-- adjudicación quede sin su contrato.
--
-- Aplicada en producción (sistema-am-v2) el 2026-08-13.

alter table public.acuerdos
  add column if not exists licitacion_id text;

create index if not exists idx_acuerdos_licitacion
  on public.acuerdos(licitacion_id);

comment on column public.acuerdos.licitacion_id is
  'licitaciones.licitacion_id del proceso adjudicado que originó este contrato';
