-- 2026-09-25 · Portal de la empresa (EECC) para gestionar candidatos derivados
-- Sistema AM · Antofagasta Minerals · Fase 3 (Intermediación)
--
-- Aplicado en Supabase como migración: gestion_vacante_portal_empresa
-- La empresa recibe un link ?t=<token> (modules/empleabilidad/gestion-vacante.html):
-- ve la vacante y sus candidatos derivados, descarga sus CV (PDF Harvard, generado
-- en el navegador desde cv_personas) y marca estado + seguimiento de contratación.
-- El token es un UUID aleatorio (no viaja RUT en la URL — Regla 5). database/ no se
-- publica; este archivo es la copia en el repo.

create table if not exists public.vacante_links(
  token uuid primary key default gen_random_uuid(),
  vacante_id text not null,
  empresa text,
  activo boolean not null default true,
  expira timestamptz,
  created_by text, created_at timestamptz default now()
);
alter table public.vacante_links enable row level security;
create policy vacante_links_rw on public.vacante_links for all to authenticated
  using (tiene_acceso('empleabilidad') or tiene_acceso('movil') or tiene_acceso('principal'))
  with check (tiene_acceso('empleabilidad') or tiene_acceso('movil') or tiene_acceso('principal'));

-- Público (anon + token): devuelve la vacante + candidatos derivados (con datos de
-- CV para descarga). SECURITY DEFINER, gated por el token.
--   gestion_vacante_publico(p_token uuid) -> jsonb {vacante, candidatos[], empresa}
-- La empresa actualiza estado/seguimiento de un candidato (validando el token):
--   gestion_vacante_seguimiento(p_token uuid, p_derivacion_id text, p_estado text, p_seguimiento text)
-- Ambas: revoke de public; grant execute a anon, authenticated.
-- (Definición completa aplicada en Supabase; ver el panel de funciones.)

-- Para REVOCAR un link: update public.vacante_links set activo=false where token='...';
