-- 2026-08-17 · Contacto único de la cadena Tronar: Ingrid Guerrero en los 6
-- Aplicada en producción (sistema-am-v2) el 2026-08-17.
--
-- Los 6 Hostal Tronar son de la misma empresa (Tronar Ltda.) y comparten
-- encargado: Ingrid Guerrero. Se deja su ficha de contacto idéntica en los 6
-- (mismo nombre, correo iguerrero.tronarltda@gmail.com y +56983951354).
-- Tronar 1/2/3/6 ya la tenían; faltaban Tronar 4 y 5.

update contactos c set
  nombre='Ingrid Guerrero', cargo='Encargado',
  correo='iguerrero.tronarltda@gmail.com', fono='+56983951354'
where c.proveedor_id in ('mgi2026_64_hostal_tronar_2','mgi2026_63_hostal_tronar',
   'mgi2026_65_hostal_tronar_3','nm_tronar_5_mqtnqn9z','re_77964250','nm_tronar_6_mqtnvvzs')
  and coalesce(c.estado_registro,'Activo')<>'Eliminado'
  and upper(coalesce(c.principal::text,''))='TRUE';

insert into contactos (contacto_id, proveedor_id, nombre, cargo, correo, fono, principal, estado_registro)
select 'cnt_ingrid_'||pid, pid, 'Ingrid Guerrero','Encargado',
       'iguerrero.tronarltda@gmail.com','+56983951354','TRUE','Activo'
from unnest(array['nm_tronar_5_mqtnqn9z','re_77964250']) as pid
where not exists (select 1 from contactos c where c.proveedor_id=pid
  and coalesce(c.estado_registro,'Activo')<>'Eliminado'
  and upper(coalesce(c.principal::text,''))='TRUE');
