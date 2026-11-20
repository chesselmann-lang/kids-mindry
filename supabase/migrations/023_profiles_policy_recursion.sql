-- Phase 0a: Rekursion in profiles-Richtlinie beheben und auf Einrichtung beschränken
-- Vorher: "Admins can view all profiles" fragte profiles in sich selbst ab -> 42P17 bei jeder Abfrage,
-- und Personal sah Profile aller Einrichtungen.

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Staff view profiles of own site" on public.profiles
  for select to authenticated
  using (public.my_role() in ('admin', 'educator', 'group_lead')
         and site_id = public.my_site_id());
