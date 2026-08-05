-- ═══════════════════════════════════════════════════════════════════════════
-- P-1a · Bloquear el listado anónimo del bucket 'documentos'
--
-- QUÉ ARREGLA
--   La política actual es:
--       create policy doc_public_read on storage.objects for select
--       using (bucket_id = 'documentos');
--   Sin cláusula `to`, aplica al rol `public`, que incluye a `anon`. Como la
--   anon key es pública por diseño (va en config.js y en cada navegador),
--   cualquiera puede llamar a storage.from('documentos').list() y enumerar
--   los archivos del bucket, sin cuenta. Después los descarga uno a uno.
--   (list() pagina por prefijo, pero los prefijos están documentados arriba
--   en este mismo repo, así que recorrerlos es trivial.)
--   Con SELECT abierto a `anon`, además se podían acuñar URLs firmadas de
--   cualquier objeto con createSignedUrl(). Esto también lo cierra.
--
-- POR QUÉ `es_aprobado()` Y NO SOLO `to authenticated`
--   signUp() está expuesto en los 7 módulos: el registro es ABIERTO. Una
--   cuenta recién creada, aunque quede en estado 'pendiente' y el frontend la
--   bloquee, tiene un JWT con rol `authenticated`. Sin el filtro de estado,
--   cualquiera que se registre podría listar y descargar todo el bucket.
--   es_aprobado() (setup_database.sql:42) exige estado='aprobado' y deja
--   pasar al admin.
--
-- QUÉ NO ROMPE
--   Nada. El frontend solo usa upload() y getPublicUrl(); nunca list(),
--   download() ni remove(). Las URLs públicas ya guardadas en la base
--   (pdf_url, foto1_url, minuta_pdf_url...) siguen funcionando igual, porque
--   el bucket sigue siendo público y ese endpoint no pasa por RLS.
--
-- QUÉ NO ARREGLA TODAVÍA
--   Quien ya tenga una URL de documento sigue pudiendo abrirla sin iniciar
--   sesión. Eso se cierra en P-1b, que requiere cambios en el frontend.
--
-- REVERSIBLE
--   Sí. Para volver atrás, ver el bloque comentado al final.
--
-- CÓMO APLICAR
--   Supabase → SQL Editor → pegar y ejecutar.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

drop policy if exists doc_public_read on storage.objects;
drop policy if exists doc_auth_read   on storage.objects;   -- idempotente: re-ejecutable

create policy doc_auth_read on storage.objects for select
  to authenticated
  using (bucket_id = 'documentos' and public.es_aprobado());

commit;

-- ── VERIFICAR DESPUÉS DE APLICAR ──────────────────────────────────────────
-- 1. Debe aparecer doc_auth_read con roles={authenticated}:
--      select policyname, roles, cmd from pg_policies
--       where tablename='objects' and policyname like 'doc_%';
--
-- 2. En el navegador, SIN iniciar sesión, en la consola del sistema:
--      await supabase.storage.from('documentos').list()
--    Antes devolvía la lista de archivos. Ahora debe devolver vacío o error.
--
-- 2b. Con una cuenta registrada pero NO aprobada, la misma llamada también
--     debe devolver vacío. Si devuelve archivos, es_aprobado() no se aplicó.
--
-- 3. Abrir un documento ya guardado desde Proveedores o MGI: debe seguir
--    funcionando igual que siempre.
--
-- 4. Subir un archivo nuevo desde Proveedores: debe seguir funcionando.

-- ── PARA REVERTIR ─────────────────────────────────────────────────────────
-- drop policy if exists doc_auth_read on storage.objects;
-- create policy doc_public_read on storage.objects for select
--   using (bucket_id = 'documentos');
--
-- OJO: database/setup_database.sql ya fue actualizado para crear doc_auth_read
-- en vez de doc_public_read, así que re-ejecutar el setup NO reabre el agujero.
