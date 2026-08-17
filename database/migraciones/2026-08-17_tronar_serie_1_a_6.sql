-- 2026-08-17 · Hostal Tronar: serie completa 1 a 6
-- Aplicada en producción (sistema-am-v2) el 2026-08-17.
--
-- Son 6 hospedajes del mismo dueño (RUT 77.964.250-K). Los nombres estaban
-- inconsistentes: uno decía solo "Hostal Tronar" (sin número) y el 6 estaba
-- fuera del programa como "Tronar 6". Se numeran 1 a 6 ANCLANDO EN LA DIRECCIÓN
-- (lo físico no cambia) según el informe maestro de MGI (V11, 26/07/2026):
--   Cristóbal Colón #32   → Hostal Tronar 1  (cód. 49)
--   José Santos Ossa #233 → Hostal Tronar 2  (cód. 50)
--   José Díaz Gana #221   → Hostal Tronar 3  (cód. 57)
--   José Santos Ossa #219 → Hostal Tronar 4  (cód. 68)
--   Jaime Guzmán #101     → Hostal Tronar 5  (cód. 74)
--   José Santos Ossa #220 → Hostal Tronar 6  (sin código en el informe)
-- No se cambian direcciones; solo el nombre, el RUT de los que lo tenían vacío,
-- y la entrada del 6 al programa (con el contacto compartido de la cadena).
--
-- Nota: queda un registro suelto "Hotal Tronar 3" (proveedor_id re_, typo,
-- FUERA del programa) que no se tocó — revisar si es duplicado.

update proveedores set nombre_fantasia='Hostal Tronar 1', razon_social='Hostal Tronar 1',
  updated_by='serie Tronar 2026-08-17', updated_at=now() where proveedor_id='mgi2026_64_hostal_tronar_2';
update proveedores set nombre_fantasia='Hostal Tronar 2', razon_social='Hostal Tronar 2',
  updated_by='serie Tronar 2026-08-17', updated_at=now() where proveedor_id='mgi2026_63_hostal_tronar';
update proveedores set rut_empresa='77.964.250-K', updated_at=now()
  where proveedor_id='nm_tronar_5_mqtnqn9z' and coalesce(rut_empresa,'')='';

update proveedores set nombre_fantasia='Hostal Tronar 6', razon_social='Hostal Tronar 6',
  rut_empresa='77.964.250-K', programa_mgi=true, programa_mgi_rubro='hoteleria',
  localidad=coalesce(nullif(localidad,''),'Sierra Gorda'), direccion=_norm_dir(direccion),
  updated_by='serie Tronar 2026-08-17', updated_at=now() where proveedor_id='nm_tronar_6_mqtnvvzs';

insert into hospedajes_mgi (proveedor_id, participa, updated_by, updated_at)
select 'nm_tronar_6_mqtnvvzs','SI','serie Tronar 2026-08-17',now()
where not exists (select 1 from hospedajes_mgi where proveedor_id='nm_tronar_6_mqtnvvzs');

insert into contactos (contacto_id, proveedor_id, nombre, cargo, correo, fono, principal, estado_registro)
select 'cnt_tronar6_enc','nm_tronar_6_mqtnvvzs','Ingrid Guerrero','Encargado',
       'iguerrero.tronarltda@gmail.com','+56983951354','TRUE','Activo'
where not exists (select 1 from contactos where proveedor_id='nm_tronar_6_mqtnvvzs'
                    and coalesce(estado_registro,'Activo')<>'Eliminado');
