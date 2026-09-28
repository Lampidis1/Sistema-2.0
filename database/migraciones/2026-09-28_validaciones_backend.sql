-- 2026-09-28 · Validación en backend de RUT / teléfono / correo
-- ─────────────────────────────────────────────────────────────────────────────
-- El frontend valida con shared/js/validaciones.js (window.AMForm). Aquí se
-- replica en la BD para que ningún camino guarde datos inválidos.
--
--   · am_rut_valido(text)   → dígito verificador (módulo 11, acepta K).
--   · am_fono_valido(text)  → ^\+569[0-9]{8}$
--   · am_email_valido(text) → formato de correo.
--
-- Trigger en cv_personas: valida SOLO los campos que cambian y no nulos
-- (OLD IS DISTINCT FROM NEW), para no bloquear filas históricas al editarlas.
-- Código aplicado en Supabase el 2026-09-28; este archivo es el registro.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.am_rut_valido(p text) returns boolean
language plpgsql immutable as $$
declare s text; cuerpo text; dv text; suma int:=0; mul int:=2; i int; res int; dvc text;
begin
  s := upper(regexp_replace(coalesce(p,''),'[^0-9kK]','','g'));
  if s !~ '^[0-9]{7,8}[0-9K]$' then return false; end if;
  cuerpo := left(s, length(s)-1); dv := right(s,1);
  for i in reverse length(cuerpo)..1 loop
    suma := suma + (substr(cuerpo,i,1))::int * mul;
    mul := case when mul=7 then 2 else mul+1 end;
  end loop;
  res := 11 - (suma % 11);
  dvc := case when res=11 then '0' when res=10 then 'K' else res::text end;
  return dvc = dv;
end $$;

create or replace function public.am_fono_valido(p text) returns boolean
language sql immutable as $$ select coalesce(p,'') ~ '^\+569[0-9]{8}$' $$;

create or replace function public.am_email_valido(p text) returns boolean
language sql immutable as $$ select coalesce(p,'') ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$' $$;

create or replace function public.cv_personas_validar() returns trigger
language plpgsql as $$
begin
  if coalesce(new.rut,'')<>'' and (tg_op='INSERT' or new.rut is distinct from old.rut)
     and not public.am_rut_valido(new.rut) then
    raise exception 'RUT inválido: %', new.rut using errcode='23514';
  end if;
  if coalesce(new.email,'')<>'' and (tg_op='INSERT' or new.email is distinct from old.email)
     and not public.am_email_valido(new.email) then
    raise exception 'Correo inválido: %', new.email using errcode='23514';
  end if;
  if coalesce(new.telefono,'')<>'' and (tg_op='INSERT' or new.telefono is distinct from old.telefono)
     and not public.am_fono_valido(new.telefono) then
    raise exception 'Teléfono inválido: %', new.telefono using errcode='23514';
  end if;
  return new;
end $$;

drop trigger if exists trg_cv_personas_validar on cv_personas;
create trigger trg_cv_personas_validar before insert or update on cv_personas
  for each row execute function public.cv_personas_validar();
