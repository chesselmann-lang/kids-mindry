-- Phase 0: Chat-Richtlinien reparieren und absichern
-- Vorher:
--  * cp_select fragte conversation_participants in sich selbst ab -> 42P17, Chat für alle kaputt
--  * cp_insert: jeder durfte sich selbst in JEDES Gespräch eintragen und mitlesen
--  * cp_insert erlaubte nur die eigene Zeile -> App konnte Gesprächspartner nicht hinzufügen
--  * conversations: nach dem Anlegen nicht lesbar (Ersteller noch kein Teilnehmer) -> insert().select() leer
--  * message_reads: Richtlinie "true" -> alle Lesebestätigungen für alle sichtbar

-- Ersteller merken (App setzt das Feld nicht, Default übernimmt)
alter table public.conversations
  add column if not exists created_by uuid default auth.uid() references auth.users(id) on delete set null;
create index if not exists idx_conversations_created_by on public.conversations (created_by);

-- Hilfsfunktionen ohne RLS-Rekursion
create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = p_conversation_id and user_id = auth.uid()
  )
$$;

create or replace function public.is_conversation_creator(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversations
    where id = p_conversation_id and created_by = auth.uid()
  )
$$;

revoke execute on function public.is_conversation_member(uuid)  from public, anon;
revoke execute on function public.is_conversation_creator(uuid) from public, anon;
grant  execute on function public.is_conversation_member(uuid)  to authenticated, service_role;
grant  execute on function public.is_conversation_creator(uuid) to authenticated, service_role;

-- conversations
drop policy if exists conv_insert on public.conversations;
drop policy if exists conv_select on public.conversations;
drop policy if exists conv_update on public.conversations;
create policy conv_insert on public.conversations for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy conv_select on public.conversations for select to authenticated
  using (created_by = (select auth.uid()) or public.is_conversation_member(id));
create policy conv_update on public.conversations for update to authenticated
  using (public.is_conversation_member(id));

-- conversation_participants
drop policy if exists cp_select on public.conversation_participants;
drop policy if exists cp_insert on public.conversation_participants;
drop policy if exists cp_update on public.conversation_participants;
create policy cp_select on public.conversation_participants for select to authenticated
  using (user_id = (select auth.uid()) or public.is_conversation_member(conversation_id));
create policy cp_insert on public.conversation_participants for insert to authenticated
  with check (public.is_conversation_creator(conversation_id) or public.is_conversation_member(conversation_id));
create policy cp_update on public.conversation_participants for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- messages: unverändert in der Logik, aber ohne Rekursion über die Hilfsfunktion
drop policy if exists msg_select on public.messages;
drop policy if exists msg_insert on public.messages;
create policy msg_select on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id));
create policy msg_insert on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.is_conversation_member(conversation_id));

-- message_reads: offene und doppelte Richtlinien entfernen
drop policy if exists "Users can view conversation message reads" on public.message_reads;
drop policy if exists "Users manage own reads" on public.message_reads;
drop policy if exists "Participants see reads" on public.message_reads;
create policy "Participants see reads" on public.message_reads for select to authenticated
  using (exists (
    select 1 from public.messages m
    where m.id = message_reads.message_id and public.is_conversation_member(m.conversation_id)
  ));
-- "Users can manage own message reads" (ALL, user_id = auth.uid()) bleibt bestehen
