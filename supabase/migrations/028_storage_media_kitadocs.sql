-- Phase 0: Buckets "media" und "kita-docs" nach Einrichtung/Kind absichern
-- Vorher: media – jede angemeldete Person durfte ALLE Dateien lesen (auch Kind-Dokumente fremder Einrichtungen);
--         kita-docs – jede angemeldete Person durfte lesen, hochladen und löschen.
-- Beide Buckets sind privat; die App lädt Dateien über /api/storage/<bucket> (signierte URLs).
--
-- Pfade in der App:
--   media:     <site_id>/<datei>                      (Galerie)
--              kind-dokumente/<child_id>/<datei>      (Kind-Dokumente)
--              tagesberichte/<child_id>/<tag>/<datei> (Tagesbericht-Fotos)
--              avatars/<user_id>.<ext>                (Profilbilder)
--   kita-docs: <site_id>/<datei>                      (Einrichtungs-Dokumente)

-- Hilfsfunktion: darf die angemeldete Person Dateien zu diesem Kind sehen?
create or replace function public.can_access_child(p_child_id text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_child uuid;
begin
  begin
    v_child := p_child_id::uuid;
  exception when others then
    return false;
  end;
  return (public.is_staff() and public.child_site_id(v_child) = public.my_site_id())
      or exists (select 1 from public.guardians g where g.child_id = v_child and g.user_id = auth.uid());
end;
$$;

revoke execute on function public.can_access_child(text) from public, anon;
grant  execute on function public.can_access_child(text) to authenticated, service_role;

-- ── media ────────────────────────────────────────────────────────────────────
drop policy if exists "Authenticated users can view media" on storage.objects;
drop policy if exists "Educators can upload media"         on storage.objects;
drop policy if exists "Educators can delete own media"     on storage.objects;

create policy "media_select" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (
       (storage.foldername(name))[1] = public.my_site_id()::text
    or ((storage.foldername(name))[1] in ('kind-dokumente', 'tagesberichte')
        and public.can_access_child((storage.foldername(name))[2]))
    or (storage.foldername(name))[1] = 'avatars'
  ));

create policy "media_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (
       (public.is_staff() and (storage.foldername(name))[1] = public.my_site_id()::text)
    or (public.is_staff() and (storage.foldername(name))[1] in ('kind-dokumente', 'tagesberichte')
        and public.can_access_child((storage.foldername(name))[2]))
    or ((storage.foldername(name))[1] = 'avatars'
        and split_part(storage.filename(name), '.', 1) = (select auth.uid())::text)
  ));

-- Überschreiben (upsert) für Avatare und Tagesbericht-Fotos
create policy "media_update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (
       (public.is_staff() and (storage.foldername(name))[1] in ('kind-dokumente', 'tagesberichte')
        and public.can_access_child((storage.foldername(name))[2]))
    or ((storage.foldername(name))[1] = 'avatars'
        and split_part(storage.filename(name), '.', 1) = (select auth.uid())::text)
  ));

create policy "media_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (
       owner = (select auth.uid())
    or (public.my_role() in ('admin', 'group_lead') and (storage.foldername(name))[1] = public.my_site_id()::text)
  ));

-- ── kita-docs ────────────────────────────────────────────────────────────────
drop policy if exists "site_members_read_docs" on storage.objects;
drop policy if exists "staff_upload_docs"      on storage.objects;
drop policy if exists "staff_delete_docs"      on storage.objects;

create policy "kitadocs_select" on storage.objects for select to authenticated
  using (bucket_id = 'kita-docs' and (storage.foldername(name))[1] = public.my_site_id()::text);

create policy "kitadocs_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'kita-docs' and public.is_staff()
              and (storage.foldername(name))[1] = public.my_site_id()::text);

create policy "kitadocs_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'kita-docs' and public.my_role() in ('admin', 'group_lead')
         and (storage.foldername(name))[1] = public.my_site_id()::text);
