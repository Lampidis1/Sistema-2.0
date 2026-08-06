-- ═══════════════════════════════════════════════════════════════════════════
-- P-1b · Hacer privado el bucket 'documentos'
--
-- ✅ EJECUTADO EN PRODUCCIÓN el 2026-08-05, en el orden que este archivo
--    exige: P-1a primero, frontend con createSignedUrl() desplegado y
--    verificado en sistema-2-0.vercel.app (commit 3d0e0cd), y recién
--    entonces este script. Detalle y verificación en docs/PENDIENTES.md → P-1.
--
--    Este script rompe TODAS las URLs de documentos guardadas en la base
--    (pdf_url, foto1_url, foto2_url, foto3_url, minuta_pdf_url, v.fotos[])
--    hasta que el frontend esté desplegado usando URLs firmadas.
--
--    ORDEN OBLIGATORIO:
--      1. Aplicar P-1a.
--      2. Desplegar el frontend con createSignedUrl() en Vercel.
--      3. Comprobar que los documentos abren bien.
--      4. Recién ahí ejecutar este script.
--
--    Si se ejecuta antes del paso 2, todos los documentos del sistema dejan
--    de abrirse. Se revierte volviendo public = true.
--
-- REQUIERE
--   La política doc_auth_read de P-1a: createSignedUrl() valida RLS, así que
--   el usuario necesita permiso de select sobre el objeto para poder firmar.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

update storage.buckets set public = false where id = 'documentos';

commit;

-- ── VERIFICAR ─────────────────────────────────────────────────────────────
-- 1. select id, public from storage.buckets where id='documentos';   → false
-- 2. Pegar una URL .../object/public/documentos/... en una ventana de
--    incógnito: ahora debe dar error. Antes descargaba el archivo.
-- 3. Abrir documentos desde Proveedores y MGI con sesión iniciada: deben
--    seguir funcionando, ahora con URL firmada.

-- ── PARA REVERTIR ─────────────────────────────────────────────────────────
-- update storage.buckets set public = true where id = 'documentos';
