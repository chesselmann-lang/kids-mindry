-- Phase 0: DSGVO-Anonymisierung reparieren
-- anonymize_child_data schrieb in messages.content – die Spalte heißt body.
-- Die Funktion brach dadurch mit 42703 ab, die Löschung nach Art. 17 DSGVO lief nie durch.
-- Rechte unverändert (nur service_role, Admin-Prüfung im Funktionskörper).

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

  update public.messages set body = '[Nachricht gelöscht]'
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

revoke execute on function public.anonymize_child_data(uuid) from public, anon, authenticated;
grant  execute on function public.anonymize_child_data(uuid) to service_role;
