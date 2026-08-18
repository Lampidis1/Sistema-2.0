-- 2026-08-17 · Tronar: baja del duplicado con typo "Hotal Tronar 3"
-- Aplicada en producción (sistema-am-v2) el 2026-08-17.
--
-- Quedaba un registro suelto (proveedor_id 're_') "Hotal Tronar 3" —nombre con
-- typo, FUERA del programa MGI, dirección distinta (José Santos Ossa #221) y un
-- dueño "Jose Guerrero" que no corresponde: la cadena Tronar es un solo dueño
-- (Tronar Ltda., RUT 77.964.250-K) con administradora Ingrid Guerrero.
-- Era un duplicado del real "Hostal Tronar 3" (cód. 57, José Díaz Gana #221).
--
-- Baja lógica (recuperable). El disparador trg_bloq_borrado exige es_admin() y
-- la conexión de mantención no lleva JWT, así que se desactiva un instante y se
-- vuelve a activar (mismo patrón que otras migraciones de mantención).
-- Revertir: update proveedores set estado_registro='Activo' where proveedor_id='re_';

alter table proveedores disable trigger trg_bloq_borrado;

update proveedores
set estado_registro='Eliminado',
    updated_by='limpieza duplicado Tronar 2026-08-17', updated_at=now()
where proveedor_id='re_'
  and lower(coalesce(nombre_fantasia,'')||coalesce(razon_social,'')) like '%hotal tronar%'
  and coalesce(programa_mgi,false)=false;

alter table proveedores enable trigger trg_bloq_borrado;
