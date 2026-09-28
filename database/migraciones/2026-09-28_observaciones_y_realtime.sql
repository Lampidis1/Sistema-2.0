-- 2026-09-28 · Observaciones con historial + realtime de cargos (Fase D)
-- ─────────────────────────────────────────────────────────────────────────────
-- · cv_observaciones: historial de observaciones por candidato (fecha + usuario),
--   con RLS (empleabilidad / movil / principal / admin). Ya no se sobrescribe.
-- · Realtime: se publican vacantes y cursos para que la Recepción refresque la
--   lista de cargos sin recargar la página. RLS sigue aplicando.
-- Aplicado en Supabase el 2026-09-28; este archivo es el registro.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists cv_observaciones (
  id bigint generated always as identity primary key,
  cv_id text not null,
  texto text not null,
  creado_por text,
  creado_at timestamptz not null default now()
);
create index if not exists idx_cv_obs_cv on cv_observaciones(cv_id, creado_at desc);
alter table cv_observaciones enable row level security;

drop policy if exists cv_obs_sel on cv_observaciones;
create policy cv_obs_sel on cv_observaciones for select to authenticated
  using (public.es_admin() or public.tiene_acceso('empleabilidad') or public.tiene_acceso('movil') or public.tiene_acceso('principal'));
drop policy if exists cv_obs_ins on cv_observaciones;
create policy cv_obs_ins on cv_observaciones for insert to authenticated
  with check (public.es_admin() or public.tiene_acceso('empleabilidad') or public.tiene_acceso('movil') or public.tiene_acceso('principal'));

-- Realtime de cargos (idempotente).
do $$ begin
  begin alter publication supabase_realtime add table vacantes; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table cursos;   exception when duplicate_object then null; end;
end $$;
