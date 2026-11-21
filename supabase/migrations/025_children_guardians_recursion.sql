-- Phase 0: Rekursion children <-> guardians beheben
-- Vorher: children-Richtlinie "Guardians can view own children" liest guardians,
-- guardians-Richtlinie "Educators can view guardians" liest children -> 42P17 bei jeder Abfrage.
-- Rechte bleiben gleich: Personal (educator, group_lead, admin, caretaker) sieht Erziehungsberechtigte
-- der Kinder seiner Einrichtung.

create or replace function public.child_site_id(p_child_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select site_id from public.children where id = p_child_id
$$;

revoke execute on function public.child_site_id(uuid) from public, anon;
grant  execute on function public.child_site_id(uuid) to authenticated, service_role;

drop policy if exists "Educators can view guardians" on public.guardians;
create policy "Educators can view guardians" on public.guardians
  for select to authenticated
  using (
    public.my_role() in ('educator', 'group_lead', 'admin', 'caretaker')
    and public.child_site_id(child_id) = public.my_site_id()
  );
