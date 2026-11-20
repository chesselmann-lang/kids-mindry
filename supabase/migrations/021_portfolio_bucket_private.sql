-- Phase 0a: Bucket "portfolio" privat, Zugriff nach Einrichtung/Kind/Gespräch
-- Pfade: <site_id>/<child_id>/<datei> (Portfolio) und messages/<conversation_id>/<datei> (Chat)

update storage.buckets set public = false where id = 'portfolio';

drop policy if exists "Portfolio photos public read"          on storage.objects;
drop policy if exists "Portfolio photos authenticated upload" on storage.objects;
drop policy if exists "Portfolio photos authenticated delete" on storage.objects;

-- Personal der Einrichtung
create policy "portfolio_staff_select" on storage.objects for select to authenticated
  using (bucket_id = 'portfolio' and public.is_staff()
         and (storage.foldername(name))[1] = public.my_site_id()::text);
create policy "portfolio_staff_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and public.is_staff()
              and (storage.foldername(name))[1] = public.my_site_id()::text);
create policy "portfolio_staff_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and public.is_staff()
         and (storage.foldername(name))[1] = public.my_site_id()::text);

-- Eltern: nur freigegebene Fotos des eigenen Kindes
create policy "portfolio_parent_select" on storage.objects for select to authenticated
  using (bucket_id = 'portfolio' and exists (
    select 1 from public.portfolio_photos pp
    join public.guardians g on g.child_id = pp.child_id
    where pp.storage_path = storage.objects.name
      and pp.is_shared_with_parents
      and g.user_id = auth.uid()));

-- Chat-Anhänge: nur Teilnehmer des Gesprächs
create policy "portfolio_chat_select" on storage.objects for select to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = 'messages' and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id::text = (storage.foldername(name))[2] and cp.user_id = auth.uid()));
create policy "portfolio_chat_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = 'messages' and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id::text = (storage.foldername(name))[2] and cp.user_id = auth.uid()));
