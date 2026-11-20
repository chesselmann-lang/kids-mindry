-- Phase 0a: SECURITY-DEFINER-Funktionen absichern
-- Feste search_path, Ausführrechte entziehen, Rolle bzw. Täter aus auth.uid()

-- 1) Feste search_path für alle Funktionen ohne Einstellung
alter function public.anonymize_child_data(p_child_id uuid) set search_path = public;
alter function public.get_unread_conversation_count(p_user_id uuid) set search_path = public;
alter function public.handle_new_user() set search_path = public;
alter function public.handle_updated_at() set search_path = public;
alter function public.is_admin() set search_path = public;
alter function public.is_staff() set search_path = public;
alter function public.log_parental_action(p_action text, p_actor_id uuid, p_target_id uuid, p_target_type text, p_site_id uuid, p_details jsonb) set search_path = public;
alter function public.my_role() set search_path = public;
alter function public.my_site_id() set search_path = public;
alter function public.set_consent_expiry() set search_path = public;
alter function public.set_updated_at() set search_path = public;
alter function public.update_conversations_updated_at() set search_path = public;
alter function public.update_updated_at() set search_path = public;
alter function public.update_updated_at_column() set search_path = public;

-- 2) Audit: Täter immer auth.uid(), Einrichtung bei Nutzeraufruf immer die eigene
create or replace function public.log_parental_action(
  p_action text, p_actor_id uuid, p_target_id uuid, p_target_type text,
  p_site_id uuid default null, p_details jsonb default '{}'::jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_actor uuid := auth.uid();           -- p_actor_id wird bewusst ignoriert
  v_site uuid := case when auth.uid() is null then p_site_id else public.my_site_id() end;
begin
  insert into public.audit_log (action, actor_id, target_id, target_type, site_id, details)
  values (p_action, v_actor, p_target_id, p_target_type, v_site, coalesce(p_details, '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$$;

-- 3) Anonymisierung: nur Server oder Admin der Einrichtung des Kindes
create or replace function public.anonymize_child_data(p_child_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anon_name text := 'Kind-' || substring(p_child_id::text, 1, 8);
begin
  if auth.uid() is not null and not exists (
    select 1 from public.profiles p
    join public.children c on c.site_id = p.site_id
    where p.id = auth.uid() and p.role = 'admin' and c.id = p_child_id
  ) then
    raise exception 'Keine Berechtigung' using errcode = '42501';
  end if;

  update public.children set
    first_name = v_anon_name,
    last_name = 'ANONYMISIERT',
    date_of_birth = null,
    photo_url = null,
    allergies = null,
    medical_notes = null,
    emergency_contact_name = 'ANONYMISIERT',
    emergency_contact_phone = 'ANONYMISIERT',
    doctor_name = null,
    doctor_phone = null,
    address = null,
    parent_email = null,
    consent_status = 'revoked'
  where id = p_child_id;

  delete from public.portfolio_photos where child_id = p_child_id;

  update public.messages set content = '[Nachricht gelöscht]'
  where sender_id in (select parent_user_id from public.parental_consent where child_id = p_child_id);

  update public.parental_consent set
    revoked_at = now(),
    revocation_reason = 'DSGVO Art. 17 — Löschantrag'
  where child_id = p_child_id and revoked_at is null;

  delete from public.screen_time_log where child_id = p_child_id;

  perform public.log_parental_action(
    'GDPR_ANONYMIZE', auth.uid(), p_child_id, 'children', null,
    jsonb_build_object('timestamp', now(), 'reason', 'Art. 17 DSGVO Löschantrag'));
end;
$$;

-- 4) Ungelesene Gespräche nur für den eigenen Nutzer
create or replace function public.get_unread_conversation_count(p_user_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct m.conversation_id)
  from public.messages m
  join public.conversation_participants cp
    on cp.conversation_id = m.conversation_id and cp.user_id = p_user_id
  where p_user_id = auth.uid()
    and m.sender_id <> p_user_id
    and not exists (
      select 1 from public.message_reads mr where mr.message_id = m.id and mr.user_id = p_user_id
    );
$$;

-- 5) Ausführrechte
revoke execute on function public.anonymize_child_data(uuid) from public, anon, authenticated;
grant  execute on function public.anonymize_child_data(uuid) to service_role;

revoke execute on function public.log_parental_action(text, uuid, uuid, text, uuid, jsonb) from public, anon, authenticated;
grant  execute on function public.log_parental_action(text, uuid, uuid, text, uuid, jsonb) to service_role;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.get_unread_conversation_count(uuid) from public, anon;
grant  execute on function public.get_unread_conversation_count(uuid) to authenticated, service_role;

-- Hilfsfunktionen für RLS: nur angemeldet
revoke execute on function public.is_admin()   from public, anon;
revoke execute on function public.is_staff()   from public, anon;
revoke execute on function public.my_role()    from public, anon;
revoke execute on function public.my_site_id() from public, anon;
grant  execute on function public.is_admin()   to authenticated, service_role;
grant  execute on function public.is_staff()   to authenticated, service_role;
grant  execute on function public.my_role()    to authenticated, service_role;
grant  execute on function public.my_site_id() to authenticated, service_role;
