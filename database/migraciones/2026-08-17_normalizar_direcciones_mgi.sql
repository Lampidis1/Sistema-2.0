-- 2026-08-17 · Normalización de direcciones de hospedajes MGI
-- Aplicada en producción (sistema-am-v2) el 2026-08-17.
--
-- Reglas pedidas por Relaciones Comunitarias:
--   · "Diaz Gana"  → José Díaz Gana
--   · "Ossa"       → José Santos Ossa
--   · "Colon"      → Cristóbal Colón
--   · el número de la casa siempre con "#" (Diego Portales 108 → #108)
-- Más limpieza incidental: Salvador Allende, Diego Portales, Santa María,
-- Jaime Guzmán (typo "Huzman"), Eduardo Frei (typo "Freí"), Arturo Prat,
-- Caracoles, O'Higgins, Bolívar, Eleuterio Ramírez.
--
-- La lógica vive en la función _norm_dir(text), que se deja instalada para
-- poder re-normalizar cuando entren direcciones nuevas.
--
-- Alcance: 47 de 67 hospedajes MGI de Sierra Gorda cambiaron su dirección.
-- Como el directorio de Proveedores y la vista pública hoteles_sg_publico leen
-- proveedores.direccion, la corrección se propagó sola a ambos.
--
-- Respaldo: respaldo_direcciones_20260817. Revertir con:
--   update proveedores p set direccion = r.direccion
--   from respaldo_direcciones_20260817 r where r.proveedor_id = p.proveedor_id;

create or replace function _norm_dir(raw text) returns text language plpgsql as $$
declare s text; b text; calle text; num text; m text[];
begin
  if raw is null then return null; end if;
  s := btrim(regexp_replace(raw, '\s+', ' ', 'g'));
  if s = '' then return ''; end if;
  s := btrim(split_part(s, ' / ', 1));            -- si trae dos direcciones, la primera
  m := regexp_match(s, '(\d{1,4})\s*([A-Da-d])?');
  if m is not null then num := m[1] || upper(coalesce(m[2],'')); end if;
  b := lower(translate(s,'áéíóúÁÉÍÓÚñÑ','aeiouAEIOUnN'));
  if    b ~ 'd[ií]a[sz] *gana'        then calle:='José Díaz Gana';
  elsif b ~ 'santos *ossa' or b ~ '\yossa\y' then calle:='José Santos Ossa';
  elsif b ~ 'colon'                   then calle:='Cristóbal Colón';
  elsif b ~ 'allende'                 then calle:='Salvador Allende';
  elsif b ~ 'diego *portales'         then calle:='Diego Portales';
  elsif b ~ 'eduardo *frei'           then calle:='Eduardo Frei';
  elsif b ~ 'santa *maria'            then calle:='Santa María';
  elsif b ~ 'jaime *(guzman|huzman)'  then calle:='Jaime Guzmán';
  elsif b ~ 'eleuterio *ramirez'      then calle:='Eleuterio Ramírez';
  elsif b ~ 'caracoles'               then calle:='Caracoles';
  elsif b ~ 'o.?higgins'              then calle:='O''Higgins';
  elsif b ~ 'bolivar'                 then calle:='Bolívar';
  elsif b ~ 'prat'                    then calle:='Arturo Prat';
  end if;
  if    calle is not null and num is not null then return calle||' #'||num;
  elsif calle is not null then return calle;
  elsif num is not null   then return btrim(regexp_replace(s, '(\d{1,4})([A-Da-d])?', '#\1\2'));
  else return s;
  end if;
end $$;

create table if not exists public.respaldo_direcciones_20260817 as
select proveedor_id, direccion
from public.proveedores
where programa_mgi is true and coalesce(programa_mgi_rubro,'hoteleria')='hoteleria'
  and estado_registro<>'Eliminado' and lower(coalesce(localidad,'')) like '%sierra gorda%';

update public.proveedores
set direccion = _norm_dir(direccion),
    updated_by = 'normalización direcciones MGI 2026-08-17',
    updated_at = now()
where programa_mgi is true and coalesce(programa_mgi_rubro,'hoteleria')='hoteleria'
  and estado_registro<>'Eliminado' and lower(coalesce(localidad,'')) like '%sierra gorda%'
  and direccion is distinct from _norm_dir(direccion);
