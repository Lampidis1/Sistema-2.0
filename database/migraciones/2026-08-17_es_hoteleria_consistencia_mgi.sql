-- 2026-08-17 · Consistencia: es_hoteleria=true en todos los hospedajes MGI
-- Aplicada en producción (sistema-am-v2) el 2026-08-17.
--
-- Varios hospedajes del programa MGI (entre ellos Hostal Tronar 1, 2 y 3) tenían
-- es_hoteleria=false y rubros_norm vacío. La planilla de MGI cargaba los
-- proveedores con un OR que exigía es_hoteleria=true o un rubro de hotelería, así
-- que esos NO aparecían en la lista aunque estuvieran en el programa.
--
-- Arreglo doble: el código de la planilla ahora incluye programa_mgi.eq.true en
-- ese OR (mgi.js), y acá se corrige el dato para que quede consistente también
-- en el directorio de Proveedores.

update proveedores
set es_hoteleria=true,
    rubros_norm=coalesce(nullif(rubros_norm,''),'Hospedaje / Alojamiento'),
    updated_by='consistencia es_hoteleria MGI 2026-08-17', updated_at=now()
where programa_mgi is true and coalesce(programa_mgi_rubro,'hoteleria')='hoteleria'
  and estado_registro<>'Eliminado'
  and coalesce(es_hoteleria,false)=false;
