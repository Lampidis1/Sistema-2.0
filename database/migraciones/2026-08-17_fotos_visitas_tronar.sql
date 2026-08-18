-- 2026-08-17 · Fotos: mover visitas del duplicado Tronar al Hostal Tronar 3 real
-- Aplicada en producción (sistema-am-v2) el 2026-08-17.
--
-- Las fotos de una "Visita Técnica" a Tronar estaban en el registro duplicado
-- "Hotal Tronar 3" (proveedor_id 're_'), que se dio de baja. Los archivos siguen
-- en Storage (documentos/visitas/re_/...) y se resuelven por su ruta, así que
-- basta con reasignar la visita al hospedaje correcto.
-- Revertir: update visitas set proveedor_id='re_' where visita_id in
--   ('vis_mr53ddeb','vis_mqtmj7rj');

update visitas
set proveedor_id='mgi2026_65_hostal_tronar_3', updated_at=now()
where proveedor_id='re_';
