-- Migration 018: reported_messages — KJM §5 JMStV Meldepflicht-Infrastruktur
-- Eltern und Erzieher können Chat-Nachrichten melden; Kita-Admin sieht die Queue

create table if not exists public.reported_messages (
  id           uuid primary key default gen_random_uuid(),
  message_id   uuid not null references public.messages(id) on delete cascade,
  reported_by  uuid not null references public.profiles(id) on delete cascade,
  reason       text not null default 'inappropriate',
  -- reason enum: inappropriate | spam | harassment | illegal | other
  note         text,
  status       text not null default 'pending',
  -- status: pending | reviewed | dismissed | actioned
  reviewed_by  uuid references public.profiles(id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  unique(message_id, reported_by)  -- kein Doppel-Report pro User
);

-- RLS aktivieren
alter table public.reported_messages enable row level security;

-- Jeder eingeloggte User kann eigene Reports erstellen
create policy "users can create reports"
  on public.reported_messages for insert
  to authenticated
  with check (reported_by = auth.uid());

-- User sieht nur eigene Reports
create policy "users see own reports"
  on public.reported_messages for select
  to authenticated
  using (reported_by = auth.uid());

-- Kita-Admin (profiles.role = admin) sieht alle Reports
create policy "admins see all reports"
  on public.reported_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- Admin kann Status ändern (review)
create policy "admins update reports"
  on public.reported_messages for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- Index für Admin-Queue
create index if not exists idx_reported_messages_status on public.reported_messages(status, created_at desc);
create index if not exists idx_reported_messages_message_id on public.reported_messages(message_id);
