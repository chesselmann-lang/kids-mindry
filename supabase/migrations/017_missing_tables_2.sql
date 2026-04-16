-- Migration 017: Missing tables for Förderantrag, SISMIK, and Absence Requests

-- Förderanträge (AI-generated grant applications)
create table if not exists public.foerderantraege (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references public.sites(id) on delete cascade,
  created_by   uuid references public.profiles(id),
  antrag_typ   text not null default 'kibiz_betriebskosten',
  jahr         integer not null,
  kita_name    text,
  betrag       numeric(12,2),
  inhalt       text,
  status       text not null default 'entwurf'
                 check (status in ('entwurf','eingereicht','bewilligt','abgelehnt')),
  submitted_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists idx_foerderantraege_site on public.foerderantraege(site_id);
create index if not exists idx_foerderantraege_status on public.foerderantraege(status);

alter table public.foerderantraege enable row level security;

create policy "foerderantraege_admin_all" on public.foerderantraege
  for all using (
    site_id = (select site_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) in ('admin','group_lead')
  );

-- SISMIK Beobachtungen (Sprachstandsbeobachtung für Migrantenkinder)
create table if not exists public.sismik_beobachtungen (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references public.sites(id) on delete cascade,
  child_id     uuid not null references public.children(id) on delete cascade,
  educator_id  uuid references public.profiles(id),
  beobachtung_datum date not null default current_date,
  sprachkompetenz_de integer check (sprachkompetenz_de between 1 and 4),
  sprachkompetenz_herkunft integer check (sprachkompetenz_herkunft between 1 and 4),
  kommunikation integer check (kommunikation between 1 and 4),
  woerter_de   integer,
  notizen      text,
  erstellt_at  timestamptz default now()
);

create index if not exists idx_sismik_child on public.sismik_beobachtungen(child_id);
create index if not exists idx_sismik_site on public.sismik_beobachtungen(site_id);

alter table public.sismik_beobachtungen enable row level security;

create policy "sismik_staff_all" on public.sismik_beobachtungen
  for all using (
    site_id = (select site_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) in ('admin','group_lead','educator','caretaker')
  );

-- Elterngespräch KI-Vorbereitung (AI-generated talking points)
create table if not exists public.elterngespraech_vorbereitung (
  id            uuid primary key default gen_random_uuid(),
  site_id       uuid not null references public.sites(id) on delete cascade,
  child_id      uuid not null references public.children(id) on delete cascade,
  meeting_id    uuid references public.parent_meetings(id) on delete set null,
  erstellt_von  uuid references public.profiles(id),
  ai_punkte     jsonb,
  notizen       text,
  erstellt_at   timestamptz default now()
);

create index if not exists idx_elterngespraech_vorbereitung_child on public.elterngespraech_vorbereitung(child_id);
create index if not exists idx_elterngespraech_vorbereitung_site on public.elterngespraech_vorbereitung(site_id);

alter table public.elterngespraech_vorbereitung enable row level security;

create policy "elterngespraech_vorbereitung_staff" on public.elterngespraech_vorbereitung
  for all using (
    site_id = (select site_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) in ('admin','group_lead','educator','caretaker')
  );

-- Push notification subscriptions (if not exists from migration 011)
-- Already exists from 011, skip

-- Stripe customers
create table if not exists public.stripe_customers (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references public.profiles(id) on delete cascade,
  site_id      uuid references public.sites(id),
  customer_id  text unique,
  created_at   timestamptz default now()
);

alter table public.stripe_customers enable row level security;

create policy "stripe_customers_own" on public.stripe_customers
  for select using (user_id = auth.uid());

-- Subscriptions
create table if not exists public.subscriptions (
  id              uuid primary key default gen_random_uuid(),
  site_id         uuid not null references public.sites(id) on delete cascade,
  stripe_sub_id   text unique,
  plan            text not null default 'basic',
  status          text not null default 'active'
                    check (status in ('active','trialing','past_due','canceled','unpaid')),
  current_period_end timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_admin" on public.subscriptions
  for all using (
    site_id = (select site_id from public.profiles where id = auth.uid())
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );
