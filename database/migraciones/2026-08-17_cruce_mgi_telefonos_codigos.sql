-- 2026-08-17 · Cruce de datos MGI: formato de teléfonos + códigos faltantes
-- Aplicada en producción (sistema-am-v2) el 2026-08-17.
--
-- Segundo paso del ordenamiento de hospedajes MGI (el primero fue normalizar
-- direcciones, ver 2026-08-17_normalizar_direcciones_mgi.sql).
--
-- NO se pisan nombres ni correos: la base ya los tenía, muchas veces más
-- completos que el Excel del informe. Solo se normaliza el FORMATO del teléfono
-- a +569XXXXXXXX y se rellenan los códigos MGI que faltaban. Lo que no existe
-- queda en blanco, para completarlo durante la semana con las llamadas.
--
-- Alcance: 100 teléfonos de contacto → 99 quedaron en +569XXXXXXXX. El único
-- que no (Hostal C19) trae un dígito de menos en la fuente; se deja tal cual
-- para corregirlo en la llamada. 5 códigos MGI rellenados (Camila 83, C19 73,
-- Vista Verde 28, Tronar 4 → 68, Tronar 5 → 74).
--
-- Respaldo: respaldo_contactos_fono_20260817. Revertir con:
--   update contactos c set fono=r.fono from respaldo_contactos_fono_20260817 r
--   where r.contacto_id=c.contacto_id;

create or replace function _norm_fono(raw text) returns text language plpgsql as $$
declare d text;
begin
  if raw is null then return null; end if;
  d := regexp_replace(raw, '\D', '', 'g');
  if d = '' then return raw; end if;
  if left(d,2) = '56' then d := substr(d,3); end if;
  d := regexp_replace(d, '^0+', '');
  if    length(d) = 9 and left(d,1) = '9'  then return '+56' || d;
  elsif length(d) = 8 and left(d,1) <> '9' then return '+569' || d;
  else  return '+56' || d;
  end if;
end $$;

create table if not exists public.respaldo_contactos_fono_20260817 as
select c.contacto_id, c.fono
from contactos c join proveedores p on p.proveedor_id=c.proveedor_id
where p.programa_mgi is true and coalesce(p.programa_mgi_rubro,'hoteleria')='hoteleria'
  and p.estado_registro<>'Eliminado' and lower(coalesce(p.localidad,''))like'%sierra gorda%';

update contactos c set fono = _norm_fono(c.fono)
from proveedores p
where p.proveedor_id=c.proveedor_id
  and p.programa_mgi is true and coalesce(p.programa_mgi_rubro,'hoteleria')='hoteleria'
  and p.estado_registro<>'Eliminado' and lower(coalesce(p.localidad,''))like'%sierra gorda%'
  and coalesce(c.fono,'')<>'' and c.fono is distinct from _norm_fono(c.fono);

update hospedajes_mgi set codigo_mgi='83' where proveedor_id='re_772783663' and codigo_mgi is null;
update hospedajes_mgi set codigo_mgi='73' where proveedor_id='re_774530827' and codigo_mgi is null;
update hospedajes_mgi set codigo_mgi='28' where proveedor_id='nm_vista_verde_mqttq6ir' and codigo_mgi is null;
update hospedajes_mgi set codigo_mgi='68' where proveedor_id='nm_tronar_5_mqtnqn9z' and codigo_mgi is null;
update hospedajes_mgi set codigo_mgi='74' where proveedor_id='re_77964250' and codigo_mgi is null;
insert into hospedajes_mgi (proveedor_id, codigo_mgi, participa, updated_by, updated_at)
select v.pid, v.cod, 'SI', 'cruce MGI 2026-08-17', now()
from (values ('re_772783663','83'),('re_774530827','73'),('nm_vista_verde_mqttq6ir','28'),
             ('nm_tronar_5_mqtnqn9z','68'),('re_77964250','74')) v(pid,cod)
where not exists (select 1 from hospedajes_mgi m where m.proveedor_id=v.pid);
