-- 2026-08-14 · Listas maestras del directorio + detalle público de hospedajes
-- Aplicada en producción (sistema-am-v2) el 2026-08-14.
--
-- 1) catalogo_listas: "Plataformas Mineras" y "Agrupación Gremial" se escribían
--    a mano en cada ficha y la base terminó con "ARIBA,", "Arriba, C sep, Pc
--    Factory, hola" y "grha". Ahora los valores se crean una vez en Gestión
--    Interna → Listas del directorio, y en la ficha se eligen de una lista.
--
-- 2) Se vaciaron los valores escritos a mano (45 fichas), previo respaldo en
--    respaldo_valores_libres_20260814. Para revertir:
--       update proveedores p set plataformas_mineras = r.plataformas_mineras,
--                                agrupacion_gremial  = r.agrupacion_gremial
--       from respaldo_valores_libres_20260814 r
--       where r.proveedor_id = p.proveedor_id;
--
-- 3) hoteles_sg_publico: la página pública exporta un Excel con el detalle de
--    baños, el contacto y las camas instaladas. Todo eso ya estaba en la base;
--    la vista lo dejaba fuera. Sigue sin exponer el RUT (`grupo` es un hash).

-- ── 1 · catálogo de listas ─────────────────────────────────────────────────
create table if not exists public.catalogo_listas (
  item_id         text primary key,
  tipo            text not null check (tipo in ('plataforma','agrupacion')),
  valor           text not null,
  orden           int  default 0,
  estado_registro text default 'Activo',
  created_by      text,
  updated_by      text,
  updated_at      timestamptz default now()
);
create index if not exists idx_catalogo_listas_tipo on public.catalogo_listas(tipo);
create unique index if not exists idx_catalogo_listas_valor
  on public.catalogo_listas(tipo, lower(valor)) where estado_registro <> 'Eliminado';

alter table public.catalogo_listas enable row level security;

drop policy if exists catalogo_listas_select on public.catalogo_listas;
drop policy if exists catalogo_listas_ins on public.catalogo_listas;
drop policy if exists catalogo_listas_upd on public.catalogo_listas;
drop policy if exists catalogo_listas_del on public.catalogo_listas;

create policy catalogo_listas_select on public.catalogo_listas
  for select using (es_admin() or es_principal());
create policy catalogo_listas_ins on public.catalogo_listas
  for insert with check (es_editor());
create policy catalogo_listas_upd on public.catalogo_listas
  for update using (es_editor()) with check (es_editor());
create policy catalogo_listas_del on public.catalogo_listas
  for delete using (es_admin());

-- ── 2 · respaldo y purga de los valores escritos a mano ────────────────────
create table if not exists public.respaldo_valores_libres_20260814 as
select proveedor_id, plataformas_mineras, agrupacion_gremial
from public.proveedores
where coalesce(plataformas_mineras,'') <> '' or coalesce(agrupacion_gremial,'') <> '';

update public.proveedores
set plataformas_mineras = '', agrupacion_gremial = ''
where coalesce(plataformas_mineras,'') <> '' or coalesce(agrupacion_gremial,'') <> '';

-- ── 3 · vista pública de hospedajes, con el detalle que pide el Excel ──────
drop view if exists public.hoteles_sg_publico;

create view public.hoteles_sg_publico as
select
  p.proveedor_id as id,
  coalesce(nullif(p.nombre_fantasia,''), p.razon_social) as nombre,
  p.direccion,
  p.correo_empresa as correo,
  p.fono_empresa   as fono,
  -- contacto principal; si ninguno está marcado, el primero cargado
  (select c.nombre from contactos c
    where c.proveedor_id = p.proveedor_id
      and coalesce(c.estado_registro,'Activo') <> 'Eliminado'
      and coalesce(c.nombre,'') <> ''
    order by (upper(coalesce(c.principal::text,'')) in ('TRUE','SI','SÍ','1')) desc, c.contacto_id
    limit 1) as contacto,
  p.lat, p.lng,
  encode(sha256(upper(regexp_replace(coalesce(p.rut_empresa,''),'[^0-9kK]','','g'))::bytea),'hex') as grupo,

  -- capacidad instalada
  coalesce(h.hab_simples,0) as hab_simples_total,
  coalesce(h.hab_dobles,0)  as hab_dobles_total,
  coalesce(h.hab_simples,0) + coalesce(h.hab_dobles,0) as hab_total,
  coalesce(h.hab_simples,0) + coalesce(h.hab_dobles,0)*2 as camas_instaladas,

  -- detalle de baño, tal como se carga en la ficha de habitabilidad
  least(coalesce(b.simples_banio,0), coalesce(h.hab_simples,0)) as simples_privado,
  least(coalesce(b.dobles_banio,0),  coalesce(h.hab_dobles,0))  as dobles_privado,
  greatest(coalesce(h.hab_simples,0) - coalesce(b.simples_banio,0), 0) as simples_compartido,
  greatest(coalesce(h.hab_dobles,0)  - coalesce(b.dobles_banio,0),  0) as dobles_compartido,

  -- disponibilidad ahora (descontando lo comprometido en contratos)
  greatest(coalesce(h.hab_simples,0) - o.simples, 0) as hab_simples,
  greatest(coalesce(h.hab_dobles,0)  - o.dobles,  0) as hab_dobles,
  greatest(coalesce(h.hab_simples,0) - o.simples, 0)
    + greatest(coalesce(h.hab_dobles,0) - o.dobles, 0) as hab_disponibles,
  greatest(coalesce(h.hab_simples,0) - o.simples, 0)
    + greatest(coalesce(h.hab_dobles,0) - o.dobles, 0) * 2 as camas_max,
  o.simples + o.dobles as hab_ocupadas,

  coalesce(p.fotos_json, '[]') as fotos
from proveedores p
left join hoteleria h on h.proveedor_id = p.proveedor_id
left join lateral _hot_ocupadas(h.contratos_json) o(simples, dobles) on true
left join lateral (
  select nullif(h.contratos_json::jsonb ->> 'simples_banio','')::int as simples_banio,
         nullif(h.contratos_json::jsonb ->> 'dobles_banio','')::int  as dobles_banio
) b on true
where p.programa_mgi is true
  and coalesce(p.programa_mgi_rubro,'hoteleria') = 'hoteleria'
  and p.estado_registro <> 'Eliminado'
  and lower(coalesce(p.localidad,'')) like '%sierra gorda%';

grant select on public.hoteles_sg_publico to anon, authenticated;
