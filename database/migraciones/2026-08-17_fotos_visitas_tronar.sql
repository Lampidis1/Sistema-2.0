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

-- ── Reasignación de las FOTOS DE FICHA (segundo paso, mismo día) ──
-- Las 3 fotos de ficha de Tronar también estaban enlazadas al duplicado 're_'
-- (fotos_json), no al Hostal Tronar 3 real, así que no se veían. Se copian al
-- registro correcto. Los archivos en Storage (documentos/fichas/re_/...) no se
-- tocan: el visor firma la ruta guardada, sin importar la carpeta.
-- Un barrido de fichas/ confirmó que estas eran las ÚNICAS fotos huérfanas.
-- Revertir: update proveedores set fotos_json='[]' where proveedor_id='mgi2026_65_hostal_tronar_3';

update proveedores
set fotos_json = (select fotos_json from proveedores where proveedor_id='re_'),
    updated_at = now()
where proveedor_id='mgi2026_65_hostal_tronar_3'
  and coalesce(fotos_json::text,'') in ('','[]','null');
