-- 2026-09-30 · Q100 — evidencia por archivo en comentarios (ítem 4, parte 2)
-- ─────────────────────────────────────────────────────────────────────────────
-- Bucket PRIVADO `q100-evidencias` (límite 50 MB, tipos MIME permitidos). RLS en
-- storage.objects acotada al bucket y a usuarios con acceso q100 (borrar: solo
-- corporativo). La subida la hace el cliente (anon key) tras validar RLS; el
-- comentario guarda la RUTA en el bucket (no una URL pública), y la descarga usa
-- una URL firmada temporal. q100_comentario_agregar acepta ruta+nombre.
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('q100-evidencias','q100-evidencias', false, 52428800,
  array['application/pdf','image/png','image/jpeg','image/gif','image/webp',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain','text/csv','application/zip'])
on conflict (id) do update set file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "q100_evi_insert" on storage.objects;
drop policy if exists "q100_evi_select" on storage.objects;
drop policy if exists "q100_evi_delete" on storage.objects;
create policy "q100_evi_insert" on storage.objects for insert to authenticated
  with check (bucket_id='q100-evidencias' and public.tiene_acceso('q100'));
create policy "q100_evi_select" on storage.objects for select to authenticated
  using (bucket_id='q100-evidencias' and public.tiene_acceso('q100'));
create policy "q100_evi_delete" on storage.objects for delete to authenticated
  using (bucket_id='q100-evidencias' and q100.es_corporativo());

drop function if exists public.q100_comentario_agregar(text,text,text);
create or replace function public.q100_comentario_agregar(
  p_accion text, p_texto text, p_ciclo text default null,
  p_evidencia_path text default null, p_evidencia_nombre text default null)
returns jsonb language plpgsql security definer set search_path to 'q100','public','pg_temp' as $function$
declare v_ciclo text; v_actor text;
begin
  if not public.tiene_acceso('q100') then return jsonb_build_object('error','sin_acceso'); end if;
  if not q100.puede_ver_accion(p_accion) then return jsonb_build_object('error','sin_permiso'); end if;
  if coalesce(q100.mi_rol(),'')='lector' then return jsonb_build_object('error','solo_lectura'); end if;
  if coalesce(trim(p_texto),'')='' and coalesce(p_evidencia_path,'')='' then return jsonb_build_object('error','texto_vacio'); end if;
  v_ciclo := coalesce(p_ciclo,(select ciclo_id from q100.ciclos where estado='abierto' order by numero desc limit 1),
    (select ciclo_id from q100.ciclos order by numero desc limit 1));
  v_actor := coalesce(auth.jwt()->>'email',(select nombre from q100.usuarios where user_id=auth.uid()),'sistema');
  insert into q100.comentarios(accion_id,ciclo_id,texto,evidencia_url,evidencia_nombre,autor)
    values (p_accion,v_ciclo,trim(coalesce(p_texto,'')),nullif(p_evidencia_path,''),nullif(p_evidencia_nombre,''),v_actor);
  return jsonb_build_object('ok',true);
end$function$;

grant execute on function public.q100_comentario_agregar(text,text,text,text,text) to authenticated;
