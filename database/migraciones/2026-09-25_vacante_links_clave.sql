-- 2026-09-25 · Portal empresa: clave de visualización + vigencia + cierre
-- ─────────────────────────────────────────────────────────────────────────────
-- El link del portal de la empresa (gestion-vacante.html?t=token) ahora puede
-- llevar una CLAVE de visualización y una VIGENCIA (días). Empleabilidad/Móvil
-- deciden si cierran o reabren el acceso.
--
--   · vacante_links.clave_hash  → hash bcrypt (pgcrypto crypt/gen_salt('bf')).
--                                 NULL = link sin clave (como antes).
--   · vacante_links.activo/expira ya existían.
--
-- RPC nuevas (SECURITY DEFINER, validan acceso adentro con auth.uid()+tiene_acceso):
--   · vacante_link_crear(vacante_id, empresa, clave, dias) → {token}
--   · vacante_link_estado(token, activo, dias)             → cerrar/reabrir/extender
-- RPC modificadas (ahora exigen la clave si el link la tiene):
--   · gestion_vacante_publico(token, clave)
--   · gestion_vacante_seguimiento(token, derivacion_id, estado, seguimiento, clave)
--
-- El texto plano de la clave NUNCA se guarda ni viaja fuera de la verificación
-- server-side; anon no puede leer vacante_links (RLS). El código completo quedó
-- aplicado en Supabase; este archivo es el registro.
-- ─────────────────────────────────────────────────────────────────────────────

alter table vacante_links add column if not exists clave_hash text;

-- (funciones vacante_link_crear, vacante_link_estado, gestion_vacante_publico y
--  gestion_vacante_seguimiento: ver definición aplicada en Supabase el 2026-09-25)
