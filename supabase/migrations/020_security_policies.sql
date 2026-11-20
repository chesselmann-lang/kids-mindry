-- Phase 0a: RLS-Richtlinien ohne "true" für Nutzerdaten

-- Portfolio: offene Richtlinien entfernen (Personal der Einrichtung + Eltern-Lesezugriff bleiben)
drop policy if exists "Staff can manage portfolio entries" on public.portfolio_entries;
drop policy if exists "Staff can manage portfolio photos"  on public.portfolio_photos;

-- Kiosk-PINs: nur Personal der Einrichtung
drop policy if exists "Authenticated staff can manage kiosk pins" on public.kiosk_pins;
drop policy if exists "Admin manage kiosk_pins" on public.kiosk_pins;
create policy "Admin manage kiosk_pins" on public.kiosk_pins
  for all to authenticated
  using (site_id = public.my_site_id() and public.my_role() in ('admin','group_lead'))
  with check (site_id = public.my_site_id() and public.my_role() in ('admin','group_lead'));
create policy "Staff read kiosk_pins" on public.kiosk_pins
  for select to authenticated
  using (site_id = public.my_site_id() and public.is_staff());

-- Audit-Log (audit_logs): Eintrag nur mit eigener ID
drop policy if exists "Insert audit log" on public.audit_logs;
create policy "Insert own audit log" on public.audit_logs
  for insert to authenticated
  with check (user_id = auth.uid() and (site_id is null or site_id = public.my_site_id()));

-- Audit-Log (audit_log): Eintrag nur mit eigener ID, Lesen nur Admin der Einrichtung
drop policy if exists "Admins können audit_log lesen" on public.audit_log;
create policy "Admin reads audit_log" on public.audit_log
  for select to authenticated
  using (public.my_role() = 'admin' and site_id = public.my_site_id());
create policy "Insert own audit_log" on public.audit_log
  for insert to authenticated
  with check (actor_id = auth.uid() and (site_id is null or site_id = public.my_site_id()));

-- Bildschirmzeit: schreiben nur serverseitig (service_role umgeht RLS)
drop policy if exists "service_insert_screen_time" on public.screen_time_log;
drop policy if exists "service_update_screen_time" on public.screen_time_log;
