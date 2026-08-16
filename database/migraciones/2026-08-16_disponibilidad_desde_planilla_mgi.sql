-- 2026-08-16 · La página pública toma la disponibilidad de la planilla de MGI
-- Aplicada en producción (sistema-am-v2) el 2026-08-16.
--
-- EL PROBLEMA
-- La página mostraba 60 hospedajes "con disponibilidad" y 1.124 camas libres.
-- El levantamiento de MGI dice que 46 de 73 están en CERO.
--
-- POR QUÉ PASABA
-- La vista calculaba disponible = instalado − lo comprometido en
-- `hoteleria.contratos_json`. Pero solo 1 de 67 hospedajes tiene contratos
-- cargados (Campamento Melipal): nadie los carga uno por uno. El dato real lo
-- levanta MGI por teléfono y lo anota en `hospedajes_mgi`, y esa tabla no
-- estaba conectada con la vista. Resultado: casi todos aparecían 100% libres.
--
-- ORDEN DE VERDAD, de mayor a menor confianza:
--   1. dado de baja del programa            → fuera de la página
--   2. no participa del programa 2026       → fuera de la página
--   3. arrendado completo (dicho por MGI)   → 0 disponibles
--   4. habitaciones disponibles declaradas  → ese número
--   5. sin nada declarado                   → cálculo por contratos (lo de antes)
--
-- Se agregan dos columnas para que la página pueda ser honesta con el dato:
--   `actualizado` → cuándo lo levantó MGI
--   `confirmado`  → si alguien lo verificó o es solo la capacidad instalada
--
-- CARGA INICIAL
-- Se cargaron 62 hospedajes desde el informe de MGI ("Hostales SG"), cruzados
-- por RUT + nombre y, en segunda pasada, por RUT + prefijo del nombre (en la
-- base varios nombres traen la dirección pegada: "Hospedaje Magaly, Díaz Gana
-- #200" es el "Hospedaje Magaly" del Excel). Quedaron 6 sin cruzar; se
-- resuelven desde la planilla del módulo MGI.
--
-- REVERTIR: delete from hospedajes_mgi where updated_by = 'carga inicial planilla MGI 2026';

drop view if exists public.hoteles_sg_publico;

create view public.hoteles_sg_publico as
with base as (
  select
    p.proveedor_id as id,
    coalesce(nullif(p.nombre_fantasia,''), p.razon_social) as nombre,
    p.direccion, p.correo_empresa as correo, p.fono_empresa as fono,
    (select c.nombre from contactos c
      where c.proveedor_id = p.proveedor_id
        and coalesce(c.estado_registro,'Activo') <> 'Eliminado'
        and coalesce(c.nombre,'') <> ''
      order by (upper(coalesce(c.principal::text,'')) in ('TRUE','SI','SÍ','1')) desc, c.contacto_id
      limit 1) as contacto,
    p.lat, p.lng,
    encode(sha256(upper(regexp_replace(coalesce(p.rut_empresa,''),'[^0-9kK]','','g'))::bytea),'hex') as grupo,
    coalesce(h.hab_simples,0) as s_tot,
    coalesce(h.hab_dobles,0)  as d_tot,
    least(coalesce(b.simples_banio,0), coalesce(h.hab_simples,0)) as simples_privado,
    least(coalesce(b.dobles_banio,0),  coalesce(h.hab_dobles,0))  as dobles_privado,
    greatest(coalesce(h.hab_simples,0) - coalesce(b.simples_banio,0), 0) as simples_compartido,
    greatest(coalesce(h.hab_dobles,0)  - coalesce(b.dobles_banio,0),  0) as dobles_compartido,
    greatest(coalesce(h.hab_simples,0) - o.simples, 0) as s_libre_contrato,
    greatest(coalesce(h.hab_dobles,0)  - o.dobles,  0) as d_libre_contrato,
    o.simples + o.dobles as hab_ocupadas,
    m.arrendado_completo, m.hab_disponibles as mgi_hab, m.camas_disponibles as mgi_camas,
    m.eecc_hospeda, m.updated_at as actualizado,
    coalesce(p.fotos_json, '[]') as fotos
  from proveedores p
  left join hoteleria h on h.proveedor_id = p.proveedor_id
  left join hospedajes_mgi m on m.proveedor_id = p.proveedor_id
  left join lateral _hot_ocupadas(h.contratos_json) o(simples, dobles) on true
  left join lateral (
    select nullif(h.contratos_json::jsonb ->> 'simples_banio','')::int as simples_banio,
           nullif(h.contratos_json::jsonb ->> 'dobles_banio','')::int  as dobles_banio
  ) b on true
  where p.programa_mgi is true
    and coalesce(p.programa_mgi_rubro,'hoteleria') = 'hoteleria'
    and p.estado_registro <> 'Eliminado'
    and lower(coalesce(p.localidad,'')) like '%sierra gorda%'
    and coalesce(m.baja, false) = false
    and coalesce(upper(nullif(m.participa,'')), 'SI') = 'SI'
)
select
  id, nombre, direccion, correo, fono, contacto, lat, lng, grupo,
  s_tot as hab_simples_total, d_tot as hab_dobles_total,
  s_tot + d_tot as hab_total, s_tot + d_tot*2 as camas_instaladas,
  simples_privado, dobles_privado, simples_compartido, dobles_compartido,
  case when arrendado_completo is true then 0
       when mgi_hab is not null then least(mgi_hab, s_tot + d_tot)
       else s_libre_contrato + d_libre_contrato end                       as hab_disponibles,
  case when arrendado_completo is true then 0
       when mgi_hab is not null then greatest(least(mgi_hab, s_tot + d_tot) - d_libre_contrato, 0)
       else s_libre_contrato end                                          as hab_simples,
  case when arrendado_completo is true then 0
       when mgi_hab is not null then least(mgi_hab, d_libre_contrato)
       else d_libre_contrato end                                          as hab_dobles,
  case when arrendado_completo is true then 0
       when mgi_camas is not null then mgi_camas
       when mgi_hab is not null then
         round(mgi_hab * (s_tot + d_tot*2)::numeric / nullif(s_tot + d_tot,0))::int
       else s_libre_contrato + d_libre_contrato*2 end                     as camas_max,
  hab_ocupadas, arrendado_completo, eecc_hospeda, actualizado, fotos,
  (actualizado is not null) as confirmado
from base;

grant select on public.hoteles_sg_publico to anon, authenticated;
