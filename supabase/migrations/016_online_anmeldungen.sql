-- Migration 016: Online Anmeldungen (public waitlist portal)
-- Stores registrations submitted via the public /anmelden page

create table if not exists public.online_anmeldungen (
  id              uuid primary key default gen_random_uuid(),
  site_id         uuid not null references public.sites(id) on delete cascade,

  -- Kind
  kind_vorname    text not null,
  kind_nachname   text not null,
  kind_geburtsdatum date,
  betreuungsart   text not null default 'Kindergarten (3–6 Jahre)',

  -- Elternteil / Sorgeberechtigte/r
  eltern_name     text not null,
  email           text not null,
  telefon         text,
  adresse         text,

  -- Wunsch
  wunsch_datum    date,
  betreuungszeit  text default '35 Std./Woche',
  geschwisterkind boolean not null default false,
  anmerkungen     text,

  -- Verarbeitung
  status          text not null default 'neu'
                    check (status in ('neu','in_bearbeitung','aufgenommen','abgelehnt','wartend')),
  internal_note   text,
  processed_by    uuid references public.profiles(id) on delete set null,
  processed_at    timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Indexes
create index if not exists online_anmeldungen_site_id_idx  on public.online_anmeldungen(site_id);
create index if not exists online_anmeldungen_status_idx   on public.online_anmeldungen(site_id, status);
create index if not exists online_anmeldungen_created_idx  on public.online_anmeldungen(created_at desc);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists online_anmeldungen_updated_at on public.online_anmeldungen;
create trigger online_anmeldungen_updated_at
  before update on public.online_anmeldungen
  for each row execute function public.set_updated_at();

-- RLS
alter table public.online_anmeldungen enable row level security;

-- Admins and group leads see all anmeldungen for their site
create policy "admin_all_anmeldungen" on public.online_anmeldungen
  for all using (
    site_id = (select site_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) in ('admin','group_lead')
  );

-- Public insert (unauthenticated) – for the /anmelden form
create policy "public_insert_anmeldungen" on public.online_anmeldungen
  for insert with check (true);
