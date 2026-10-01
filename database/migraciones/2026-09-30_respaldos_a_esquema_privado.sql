-- 2026-09-30 · Mover tablas de respaldo fuera del esquema público
--
-- Contexto: había 4 tablas de respaldo (snapshots previos a ediciones) en
-- `public`, dos de ellas con datos personales (fonos, direcciones). Estaban
-- protegidas (RLS ON, 0 políticas = denegar todo), pero vivían en el esquema
-- que PostgREST expone, a un descuido de distancia de filtrarse.
--
-- Solución: moverlas a un esquema privado `backups` que la API NO expone.
-- Reversible (ALTER TABLE ... SET SCHEMA public) y no destructivo: conserva
-- los datos. Verificado antes: ninguna vista/función depende de ellas.

create schema if not exists backups;

-- El esquema privado no debe ser accesible por los roles de la API
revoke all on schema backups from anon, authenticated;
grant usage on schema backups to postgres, service_role;

-- Mover las 4 tablas de respaldo fuera de public
alter table public._respaldo_programas_20260809      set schema backups;
alter table public.respaldo_contactos_fono_20260817  set schema backups;
alter table public.respaldo_direcciones_20260817      set schema backups;
alter table public.respaldo_valores_libres_20260814   set schema backups;

-- Blindar: sin grants para los roles de la API sobre nada en backups
revoke all on all tables in schema backups from anon, authenticated;
