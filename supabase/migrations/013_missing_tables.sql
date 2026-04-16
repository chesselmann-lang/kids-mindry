-- ============================================================
-- Migration 013: Missing tables — complete schema coverage
-- All tables referenced in frontend but not yet in migrations
-- ============================================================

-- ============================================================
-- NOTIFICATION SETTINGS
-- ============================================================
create table if not exists public.notification_settings (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  notify_feed           boolean not null default true,
  notify_tagesbericht   boolean not null default true,
  notify_kalender       boolean not null default true,
  notify_nachrichten    boolean not null default true,
  notify_protokolle     boolean not null default false,
  notify_abwesenheit    boolean not null default false,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  unique(user_id)
);
alter table public.notification_settings enable row level security;
drop policy if exists "Own notification settings" on public.notification_settings;
create policy "Own notification settings" on public.notification_settings for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_notification_settings_user on public.notification_settings(user_id);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid references public.sites(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  action      text not null,     -- create, update, delete, login, dsgvo_export, consent
  table_name  text,
  record_id   uuid,
  changes     jsonb,
  ip_address  text,
  created_at  timestamptz default now()
);
alter table public.audit_logs enable row level security;
drop policy if exists "Admin reads audit log" on public.audit_logs;
create policy "Admin reads audit log" on public.audit_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin') and site_id = audit_logs.site_id
    )
  );
drop policy if exists "Insert audit log" on public.audit_logs;
create policy "Insert audit log" on public.audit_logs for insert
  with check (true); -- server-side only
create index if not exists idx_audit_logs_site on public.audit_logs(site_id);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);

-- ============================================================
-- SICK REPORTS (staff sick leave)
-- ============================================================
create table if not exists public.sick_reports (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  staff_id    uuid not null references auth.users(id) on delete cascade,
  start_date  date not null,
  end_date    date,
  notes       text,
  status      text not null default 'pending'
              check (status in ('pending','approved','rejected','returned')),
  processed_by uuid references auth.users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.sick_reports enable row level security;
drop policy if exists "Own sick reports" on public.sick_reports;
create policy "Own sick reports" on public.sick_reports for all
  using (staff_id = auth.uid()) with check (staff_id = auth.uid());
drop policy if exists "Admin reads sick reports" on public.sick_reports;
create policy "Admin reads sick reports" on public.sick_reports for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead') and site_id = sick_reports.site_id
  ));
drop policy if exists "Admin updates sick reports" on public.sick_reports;
create policy "Admin updates sick reports" on public.sick_reports for update
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead') and site_id = sick_reports.site_id
  ));
create index if not exists idx_sick_reports_site on public.sick_reports(site_id);
create index if not exists idx_sick_reports_staff on public.sick_reports(staff_id);

-- ============================================================
-- PICKUP PERSONS (authorized to pick up child)
-- ============================================================
create table if not exists public.pickup_persons (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references public.children(id) on delete cascade,
  full_name    text not null,
  relationship text,
  phone        text,
  id_required  boolean not null default false,
  notes        text,
  created_by   uuid references auth.users(id),
  created_at   timestamptz default now()
);
alter table public.pickup_persons enable row level security;
drop policy if exists "Staff reads pickup persons" on public.pickup_persons;
create policy "Staff reads pickup persons" on public.pickup_persons for select
  using (exists (
    select 1 from public.profiles p
    join public.children c on c.id = pickup_persons.child_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and c.site_id = p.site_id
  ));
drop policy if exists "Staff manages pickup persons" on public.pickup_persons;
create policy "Staff manages pickup persons" on public.pickup_persons for all
  using (exists (
    select 1 from public.profiles p
    join public.children c on c.id = pickup_persons.child_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and c.site_id = p.site_id
  ));
drop policy if exists "Parent reads own child pickup persons" on public.pickup_persons;
create policy "Parent reads own child pickup persons" on public.pickup_persons for select
  using (exists (
    select 1 from public.guardians
    where user_id = auth.uid() and child_id = pickup_persons.child_id
  ));
create index if not exists idx_pickup_persons_child on public.pickup_persons(child_id);

-- ============================================================
-- HEALTH RECORDS
-- ============================================================
create table if not exists public.health_records (
  id               uuid primary key default gen_random_uuid(),
  child_id         uuid not null references public.children(id) on delete cascade,
  record_type      text not null,  -- allergy, vaccination, medication, note, weight, height
  title            text not null,
  description      text,
  record_date      date not null default current_date,
  notes            text,
  is_confidential  boolean not null default false,
  created_by       uuid references auth.users(id),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
alter table public.health_records enable row level security;
drop policy if exists "Staff reads health records" on public.health_records;
create policy "Staff reads health records" on public.health_records for select
  using (exists (
    select 1 from public.profiles p
    join public.children c on c.id = health_records.child_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and c.site_id = p.site_id
  ));
drop policy if exists "Staff manages health records" on public.health_records;
create policy "Staff manages health records" on public.health_records for all
  using (exists (
    select 1 from public.profiles p
    join public.children c on c.id = health_records.child_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and c.site_id = p.site_id
  ));
drop policy if exists "Parent reads non-confidential health records" on public.health_records;
create policy "Parent reads non-confidential health records" on public.health_records for select
  using (
    not is_confidential
    and exists (
      select 1 from public.guardians
      where user_id = auth.uid() and child_id = health_records.child_id
    )
  );
create index if not exists idx_health_records_child on public.health_records(child_id);

-- ============================================================
-- MEDICATION LOGS
-- ============================================================
create table if not exists public.medication_logs (
  id                uuid primary key default gen_random_uuid(),
  child_id          uuid not null references public.children(id) on delete cascade,
  site_id           uuid not null references public.sites(id) on delete cascade,
  medication_name   text not null,
  dosage            text not null,
  administered_at   timestamptz not null default now(),
  administered_by   uuid references auth.users(id),
  notes             text,
  parent_consent    boolean not null default false,
  created_at        timestamptz default now()
);
alter table public.medication_logs enable row level security;
drop policy if exists "Staff manages medication logs" on public.medication_logs;
create policy "Staff manages medication logs" on public.medication_logs for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = medication_logs.site_id
  ));
create index if not exists idx_medication_logs_child on public.medication_logs(child_id);
create index if not exists idx_medication_logs_site on public.medication_logs(site_id);

-- ============================================================
-- INCIDENT REPORTS
-- ============================================================
create table if not exists public.incident_reports (
  id               uuid primary key default gen_random_uuid(),
  site_id          uuid not null references public.sites(id) on delete cascade,
  child_id         uuid references public.children(id) on delete set null,
  incident_type    text not null default 'accident',  -- accident, injury, conflict, illness
  title            text not null,
  description      text,
  occurred_at      timestamptz not null default now(),
  location         text,
  witnesses        text,
  first_aid        text,
  parent_notified  boolean not null default false,
  parent_notified_at timestamptz,
  reported_by      uuid references auth.users(id),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
alter table public.incident_reports enable row level security;
drop policy if exists "Staff manages incidents" on public.incident_reports;
create policy "Staff manages incidents" on public.incident_reports for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = incident_reports.site_id
  ));
create index if not exists idx_incident_reports_site on public.incident_reports(site_id);
create index if not exists idx_incident_reports_child on public.incident_reports(child_id);

-- ============================================================
-- EMERGENCY CONTACTS
-- ============================================================
create table if not exists public.emergency_contacts (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references public.children(id) on delete cascade,
  full_name    text not null,
  relationship text,
  phone        text not null,
  phone2       text,
  is_primary   boolean not null default false,
  notes        text,
  created_at   timestamptz default now()
);
alter table public.emergency_contacts enable row level security;
drop policy if exists "Staff reads emergency contacts" on public.emergency_contacts;
create policy "Staff reads emergency contacts" on public.emergency_contacts for select
  using (exists (
    select 1 from public.profiles p
    join public.children c on c.id = emergency_contacts.child_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and c.site_id = p.site_id
  ));
drop policy if exists "Staff manages emergency contacts" on public.emergency_contacts;
create policy "Staff manages emergency contacts" on public.emergency_contacts for all
  using (exists (
    select 1 from public.profiles p
    join public.children c on c.id = emergency_contacts.child_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and c.site_id = p.site_id
  ));
drop policy if exists "Parent reads own child emergency contacts" on public.emergency_contacts;
create policy "Parent reads own child emergency contacts" on public.emergency_contacts for select
  using (exists (
    select 1 from public.guardians
    where user_id = auth.uid() and child_id = emergency_contacts.child_id
  ));
create index if not exists idx_emergency_contacts_child on public.emergency_contacts(child_id);

-- ============================================================
-- FAVORITE CHILDREN (staff bookmarks)
-- ============================================================
create table if not exists public.favorite_children (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  child_id   uuid not null references public.children(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, child_id)
);
alter table public.favorite_children enable row level security;
drop policy if exists "Own favorites" on public.favorite_children;
create policy "Own favorites" on public.favorite_children for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists idx_favorite_children_user on public.favorite_children(user_id);

-- ============================================================
-- SLEEP RECORDS (Schlafbuch)
-- ============================================================
create table if not exists public.sleep_records (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children(id) on delete cascade,
  date        date not null default current_date,
  sleep_start time,
  sleep_end   time,
  duration_min int,
  quality     text,  -- good, okay, restless, none
  notes       text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now()
);
alter table public.sleep_records enable row level security;
drop policy if exists "Staff manages sleep records" on public.sleep_records;
create policy "Staff manages sleep records" on public.sleep_records for all
  using (exists (
    select 1 from public.profiles p
    join public.children c on c.id = sleep_records.child_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and c.site_id = p.site_id
  ));
drop policy if exists "Parent reads own child sleep records" on public.sleep_records;
create policy "Parent reads own child sleep records" on public.sleep_records for select
  using (exists (
    select 1 from public.guardians
    where user_id = auth.uid() and child_id = sleep_records.child_id
  ));
create index if not exists idx_sleep_records_child on public.sleep_records(child_id);
create index if not exists idx_sleep_records_date on public.sleep_records(date desc);

-- ============================================================
-- OBSERVATIONS (für Portfolio / Beobachtungen)
-- ============================================================
create table if not exists public.observations (
  id                    uuid primary key default gen_random_uuid(),
  child_id              uuid not null references public.children(id) on delete cascade,
  site_id               uuid references public.sites(id) on delete cascade,
  title                 text,                          -- optional short title
  content               text,                          -- main observation text
  notes                 text,                          -- additional notes
  observed_at           date not null default current_date,  -- canonical date field
  observation_date      date generated always as (observed_at) stored,  -- alias for compat
  domain                text,  -- sozial, motorik, sprache, kreativ, kognitiv, emotional
  is_highlight          boolean not null default false,
  mood                  text,
  photo_urls            text[] default '{}',
  shared_with_parents   boolean not null default false,
  author_id             uuid references auth.users(id),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
alter table public.observations enable row level security;
drop policy if exists "Staff manages observations" on public.observations;
create policy "Staff manages observations" on public.observations for all
  using (exists (
    select 1 from public.profiles p
    join public.children c on c.id = observations.child_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and c.site_id = p.site_id
  ));
drop policy if exists "Parent reads shared observations" on public.observations;
create policy "Parent reads shared observations" on public.observations for select
  using (
    shared_with_parents = true
    and exists (
      select 1 from public.guardians
      where user_id = auth.uid() and child_id = observations.child_id
    )
  );
create index if not exists idx_observations_child on public.observations(child_id);

-- ============================================================
-- MILESTONES (Entwicklungs-Meilensteine)
-- ============================================================
create table if not exists public.milestones (
  id             uuid primary key default gen_random_uuid(),
  child_id       uuid not null references public.children(id) on delete cascade,
  title          text not null,
  description    text,
  category       text,  -- motorik, sprache, sozial, kognitiv
  achieved_date  date,
  notes          text,
  photo_url      text,
  created_by     uuid references auth.users(id),
  created_at     timestamptz default now()
);
alter table public.milestones enable row level security;
drop policy if exists "Staff manages milestones" on public.milestones;
create policy "Staff manages milestones" on public.milestones for all
  using (exists (
    select 1 from public.profiles p
    join public.children c on c.id = milestones.child_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and c.site_id = p.site_id
  ));
drop policy if exists "Parent reads milestones" on public.milestones;
create policy "Parent reads milestones" on public.milestones for select
  using (exists (
    select 1 from public.guardians
    where user_id = auth.uid() and child_id = milestones.child_id
  ));
create index if not exists idx_milestones_child on public.milestones(child_id);

-- ============================================================
-- DEVELOPMENT MILESTONES (template library)
-- ============================================================
create table if not exists public.dev_milestones (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  age_months  int,
  title       text not null,
  description text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);
alter table public.dev_milestones enable row level security;
drop policy if exists "Anyone reads dev_milestones" on public.dev_milestones;
create policy "Anyone reads dev_milestones" on public.dev_milestones for select using (true);

-- ============================================================
-- HYGIENE CHECKS
-- ============================================================
create table if not exists public.hygiene_checks (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references public.sites(id) on delete cascade,
  check_date   date not null default current_date,
  checked_by   uuid references auth.users(id),
  room         text,
  items        jsonb default '[]',  -- [{label, status, notes}]
  notes        text,
  status       text default 'ok' check (status in ('ok','issues','critical')),
  created_at   timestamptz default now()
);
alter table public.hygiene_checks enable row level security;
drop policy if exists "Staff manages hygiene checks" on public.hygiene_checks;
create policy "Staff manages hygiene checks" on public.hygiene_checks for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = hygiene_checks.site_id
  ));
create index if not exists idx_hygiene_checks_site on public.hygiene_checks(site_id);

-- ============================================================
-- NEWSLETTERS
-- ============================================================
create table if not exists public.newsletters (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references public.sites(id) on delete cascade,
  title        text not null,
  content      text not null,
  sent_at      timestamptz,
  author_id    uuid references auth.users(id),
  recipient_count int default 0,
  created_at   timestamptz default now()
);
alter table public.newsletters enable row level security;
drop policy if exists "Staff manages newsletters" on public.newsletters;
create policy "Staff manages newsletters" on public.newsletters for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = newsletters.site_id
  ));
drop policy if exists "Parent reads sent newsletters" on public.newsletters;
create policy "Parent reads sent newsletters" on public.newsletters for select
  using (
    sent_at is not null
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and site_id = newsletters.site_id
    )
  );
create index if not exists idx_newsletters_site on public.newsletters(site_id);

-- Newsletter read tracking
create table if not exists public.newsletter_reads (
  id             uuid primary key default gen_random_uuid(),
  newsletter_id  uuid not null references public.newsletters(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  read_at        timestamptz default now(),
  unique(newsletter_id, user_id)
);
alter table public.newsletter_reads enable row level security;
drop policy if exists "Own newsletter reads" on public.newsletter_reads;
create policy "Own newsletter reads" on public.newsletter_reads for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- POLLS / SURVEYS
-- ============================================================
create table if not exists public.polls (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  title       text not null,
  description text,
  options     jsonb not null default '[]',  -- [{id, label}]
  multiple    boolean not null default false,
  closed_at   timestamptz,
  author_id   uuid references auth.users(id),
  created_at  timestamptz default now()
);
alter table public.polls enable row level security;
drop policy if exists "Staff manages polls" on public.polls;
create policy "Staff manages polls" on public.polls for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = polls.site_id
  ));
drop policy if exists "Authenticated reads polls" on public.polls;
create policy "Authenticated reads polls" on public.polls for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and site_id = polls.site_id
  ));
create index if not exists idx_polls_site on public.polls(site_id);

create table if not exists public.poll_votes (
  id         uuid primary key default gen_random_uuid(),
  poll_id    uuid not null references public.polls(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  option_ids jsonb not null default '[]',
  created_at timestamptz default now(),
  unique(poll_id, user_id)
);
alter table public.poll_votes enable row level security;
drop policy if exists "Own poll votes" on public.poll_votes;
create policy "Own poll votes" on public.poll_votes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Staff reads poll votes" on public.poll_votes;
create policy "Staff reads poll votes" on public.poll_votes for select
  using (exists (
    select 1 from public.profiles p
    join public.polls pl on pl.id = poll_votes.poll_id
    where p.id = auth.uid() and p.role in ('admin','group_lead') and p.site_id = pl.site_id
  ));

-- ============================================================
-- SURVEYS
-- ============================================================
create table if not exists public.surveys (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  title       text not null,
  description text,
  questions   jsonb not null default '[]',
  published   boolean not null default false,
  closed_at   timestamptz,
  author_id   uuid references auth.users(id),
  created_at  timestamptz default now()
);
alter table public.surveys enable row level security;
drop policy if exists "Staff manages surveys" on public.surveys;
create policy "Staff manages surveys" on public.surveys for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = surveys.site_id
  ));
drop policy if exists "Authenticated reads published surveys" on public.surveys;
create policy "Authenticated reads published surveys" on public.surveys for select
  using (
    published = true
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and site_id = surveys.site_id
    )
  );

create table if not exists public.survey_responses (
  id          uuid primary key default gen_random_uuid(),
  survey_id   uuid not null references public.surveys(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  answers     jsonb not null default '{}',
  submitted_at timestamptz default now(),
  unique(survey_id, user_id)
);
alter table public.survey_responses enable row level security;
drop policy if exists "Own survey responses" on public.survey_responses;
create policy "Own survey responses" on public.survey_responses for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Staff reads survey responses" on public.survey_responses;
create policy "Staff reads survey responses" on public.survey_responses for select
  using (exists (
    select 1 from public.profiles p
    join public.surveys s on s.id = survey_responses.survey_id
    where p.id = auth.uid() and p.role in ('admin','group_lead') and p.site_id = s.site_id
  ));

-- ============================================================
-- COUNCIL (Elternrat)
-- ============================================================
create table if not exists public.council_meetings (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references public.sites(id) on delete cascade,
  title        text not null,
  meeting_date date not null,
  location     text,
  agenda       text,
  minutes      text,
  published    boolean not null default false,
  created_at   timestamptz default now()
);
alter table public.council_meetings enable row level security;
drop policy if exists "Staff manages council meetings" on public.council_meetings;
create policy "Staff manages council meetings" on public.council_meetings for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = council_meetings.site_id
  ));
drop policy if exists "Parents reads published council meetings" on public.council_meetings;
create policy "Parents reads published council meetings" on public.council_meetings for select
  using (published = true and exists (
    select 1 from public.profiles
    where id = auth.uid() and site_id = council_meetings.site_id
  ));
create index if not exists idx_council_meetings_site on public.council_meetings(site_id);

create table if not exists public.council_members (
  id            uuid primary key default gen_random_uuid(),
  site_id       uuid not null references public.sites(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete set null,
  full_name     text not null,
  role_in_council text,  -- Vorsitzende/r, Stellvertretung, etc.
  email         text,
  phone         text,
  term_until    date,
  created_at    timestamptz default now()
);
alter table public.council_members enable row level security;
drop policy if exists "Reads council members" on public.council_members;
create policy "Reads council members" on public.council_members for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and site_id = council_members.site_id
  ));
drop policy if exists "Admin manages council members" on public.council_members;
create policy "Admin manages council members" on public.council_members for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = council_members.site_id
  ));

-- ============================================================
-- HANDBOOK (Mitarbeiter-Handbuch)
-- ============================================================
create table if not exists public.handbook_chapters (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  title       text not null,
  content     text,
  category    text,
  sort_order  int default 0,
  author_id   uuid references auth.users(id),
  updated_at  timestamptz default now(),
  created_at  timestamptz default now()
);
alter table public.handbook_chapters enable row level security;
drop policy if exists "Staff reads handbook" on public.handbook_chapters;
create policy "Staff reads handbook" on public.handbook_chapters for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = handbook_chapters.site_id
  ));
drop policy if exists "Admin manages handbook" on public.handbook_chapters;
create policy "Admin manages handbook" on public.handbook_chapters for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = handbook_chapters.site_id
  ));
create index if not exists idx_handbook_chapters_site on public.handbook_chapters(site_id);

-- ============================================================
-- RULEBOOK (Hausordnung)
-- ============================================================
create table if not exists public.rulebook_entries (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  title       text not null,
  content     text,
  category    text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);
alter table public.rulebook_entries enable row level security;
drop policy if exists "Reads rulebook" on public.rulebook_entries;
create policy "Reads rulebook" on public.rulebook_entries for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and site_id = rulebook_entries.site_id
  ));
drop policy if exists "Admin manages rulebook" on public.rulebook_entries;
create policy "Admin manages rulebook" on public.rulebook_entries for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = rulebook_entries.site_id
  ));

-- ============================================================
-- KITA DOCUMENTS (site-wide documents)
-- ============================================================
create table if not exists public.kita_documents (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references public.sites(id) on delete cascade,
  title        text not null,
  description  text,
  file_url     text,
  file_type    text,
  file_size    int,
  category     text,  -- policy, form, letter, other
  visible_to   text default 'all', -- all, staff, parents
  author_id    uuid references auth.users(id),
  created_at   timestamptz default now()
);
alter table public.kita_documents enable row level security;
drop policy if exists "Staff reads all kita docs" on public.kita_documents;
create policy "Staff reads all kita docs" on public.kita_documents for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = kita_documents.site_id
  ));
drop policy if exists "Parent reads parent-visible docs" on public.kita_documents;
create policy "Parent reads parent-visible docs" on public.kita_documents for select
  using (
    visible_to in ('all','parents')
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent' and site_id = kita_documents.site_id
    )
  );
drop policy if exists "Admin manages kita docs" on public.kita_documents;
create policy "Admin manages kita docs" on public.kita_documents for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = kita_documents.site_id
  ));
create index if not exists idx_kita_documents_site on public.kita_documents(site_id);

-- ============================================================
-- MATERIAL ORDERS
-- ============================================================
create table if not exists public.material_orders (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references public.sites(id) on delete cascade,
  requested_by uuid references auth.users(id),
  title        text not null,
  description  text,
  quantity     int default 1,
  unit         text,
  estimated_cost numeric(10,2),
  status       text not null default 'pending'
               check (status in ('pending','approved','ordered','delivered','rejected')),
  notes        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table public.material_orders enable row level security;
drop policy if exists "Staff manages material orders" on public.material_orders;
create policy "Staff manages material orders" on public.material_orders for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = material_orders.site_id
  ));
create index if not exists idx_material_orders_site on public.material_orders(site_id);

-- ============================================================
-- MEAL ORDERS (Essensbestellung per Kind pro Woche)
-- ============================================================
create table if not exists public.meal_orders (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children(id) on delete cascade,
  site_id     uuid not null references public.sites(id) on delete cascade,
  week_start  date not null,
  monday      boolean default false,
  tuesday     boolean default false,
  wednesday   boolean default false,
  thursday    boolean default false,
  friday      boolean default false,
  ordered_by  uuid references auth.users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(child_id, week_start)
);
alter table public.meal_orders enable row level security;
drop policy if exists "Parent manages own meal orders" on public.meal_orders;
create policy "Parent manages own meal orders" on public.meal_orders for all
  using (exists (
    select 1 from public.guardians
    where user_id = auth.uid() and child_id = meal_orders.child_id
  ));
drop policy if exists "Staff reads meal orders" on public.meal_orders;
create policy "Staff reads meal orders" on public.meal_orders for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = meal_orders.site_id
  ));
create index if not exists idx_meal_orders_child on public.meal_orders(child_id);
create index if not exists idx_meal_orders_week on public.meal_orders(week_start);

-- ============================================================
-- WEEKLY MENUS (Speiseplan)
-- ============================================================
create table if not exists public.weekly_menus (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  week_start  date not null,
  monday      jsonb,  -- {main, side, soup, dessert, allergens}
  tuesday     jsonb,
  wednesday   jsonb,
  thursday    jsonb,
  friday      jsonb,
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(site_id, week_start)
);
alter table public.weekly_menus enable row level security;
drop policy if exists "Authenticated reads weekly menus" on public.weekly_menus;
create policy "Authenticated reads weekly menus" on public.weekly_menus for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and site_id = weekly_menus.site_id
  ));
drop policy if exists "Staff manages weekly menus" on public.weekly_menus;
create policy "Staff manages weekly menus" on public.weekly_menus for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = weekly_menus.site_id
  ));
create index if not exists idx_weekly_menus_site on public.weekly_menus(site_id);
create index if not exists idx_weekly_menus_week on public.weekly_menus(week_start);

-- ============================================================
-- FEES (Gebühren)
-- ============================================================
create table if not exists public.fees (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children(id) on delete cascade,
  site_id     uuid not null references public.sites(id) on delete cascade,
  period      text not null,  -- YYYY-MM
  amount      numeric(10,2) not null,
  status      text not null default 'pending'
              check (status in ('pending','paid','overdue','waived')),
  due_date    date,
  paid_at     date,
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.fees enable row level security;
drop policy if exists "Parent reads own fees" on public.fees;
create policy "Parent reads own fees" on public.fees for select
  using (exists (
    select 1 from public.guardians
    where user_id = auth.uid() and child_id = fees.child_id
  ));
drop policy if exists "Staff manages fees" on public.fees;
create policy "Staff manages fees" on public.fees for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = fees.site_id
  ));
create index if not exists idx_fees_child on public.fees(child_id);
create index if not exists idx_fees_site on public.fees(site_id);

-- fee_records alias view for compatibility
create table if not exists public.fee_records (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  child_id    uuid not null references public.children(id) on delete cascade,
  period      text not null,
  amount      numeric(10,2) not null default 0,
  status      text not null default 'pending',
  description text,
  invoice_url text,
  due_date    date,
  paid_at     date,
  created_at  timestamptz default now(),
  unique(child_id, period)
);
alter table public.fee_records enable row level security;
drop policy if exists "Parent reads own fee records" on public.fee_records;
create policy "Parent reads own fee records" on public.fee_records for select
  using (exists (
    select 1 from public.guardians
    where user_id = auth.uid() and child_id = fee_records.child_id
  ));
drop policy if exists "Staff manages fee records" on public.fee_records;
create policy "Staff manages fee records" on public.fee_records for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = fee_records.site_id
  ));
create index if not exists idx_fee_records_site on public.fee_records(site_id);
create index if not exists idx_fee_records_child on public.fee_records(child_id);

-- ============================================================
-- PROTOCOLS (Elternabend-Protokolle)
-- ============================================================
create table if not exists public.protocols (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references public.sites(id) on delete cascade,
  title        text not null,
  meeting_date date not null,
  content      text,
  published_at timestamptz,
  author_id    uuid references auth.users(id),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table public.protocols enable row level security;
drop policy if exists "Staff manages protocols" on public.protocols;
create policy "Staff manages protocols" on public.protocols for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = protocols.site_id
  ));
drop policy if exists "Parents read published protocols" on public.protocols;
create policy "Parents read published protocols" on public.protocols for select
  using (
    published_at is not null
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and site_id = protocols.site_id
    )
  );
create index if not exists idx_protocols_site on public.protocols(site_id);

-- ============================================================
-- LEAVE REQUESTS (staff vacation / Urlaubsanträge)
-- ============================================================
create table if not exists public.leave_requests (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  staff_id    uuid not null references auth.users(id) on delete cascade,
  start_date  date not null,
  end_date    date not null,
  leave_type  text not null default 'vacation'
              check (leave_type in ('vacation','sick','personal','training','other')),
  notes       text,
  status      text not null default 'pending'
              check (status in ('pending','approved','rejected')),
  processed_by uuid references auth.users(id),
  processed_at timestamptz,
  created_at  timestamptz default now()
);
alter table public.leave_requests enable row level security;
drop policy if exists "Own leave requests" on public.leave_requests;
create policy "Own leave requests" on public.leave_requests for all
  using (staff_id = auth.uid()) with check (staff_id = auth.uid());
drop policy if exists "Admin reads leave requests" on public.leave_requests;
create policy "Admin reads leave requests" on public.leave_requests for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead') and site_id = leave_requests.site_id
  ));
drop policy if exists "Admin updates leave requests" on public.leave_requests;
create policy "Admin updates leave requests" on public.leave_requests for update
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead') and site_id = leave_requests.site_id
  ));
create index if not exists idx_leave_requests_staff on public.leave_requests(staff_id);
create index if not exists idx_leave_requests_site on public.leave_requests(site_id);

-- ============================================================
-- SUBSTITUTIONS (Vertretungsplan)
-- ============================================================
create table if not exists public.substitutions (
  id              uuid primary key default gen_random_uuid(),
  site_id         uuid not null references public.sites(id) on delete cascade,
  date            date not null,
  absent_staff_id uuid references auth.users(id),
  substitute_id   uuid references auth.users(id),
  group_id        uuid references public.groups(id),
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz default now()
);
alter table public.substitutions enable row level security;
drop policy if exists "Staff manages substitutions" on public.substitutions;
create policy "Staff manages substitutions" on public.substitutions for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = substitutions.site_id
  ));
create index if not exists idx_substitutions_site on public.substitutions(site_id);
create index if not exists idx_substitutions_date on public.substitutions(date desc);

-- ============================================================
-- QUICK NOTES (Notizen)
-- ============================================================
create table if not exists public.quick_notes (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references public.sites(id) on delete cascade,
  child_id   uuid references public.children(id) on delete set null,
  group_id   uuid references public.groups(id) on delete set null,
  author_id  uuid not null references auth.users(id) on delete cascade,
  content    text not null,
  pinned     boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.quick_notes enable row level security;
drop policy if exists "Staff manages quick notes" on public.quick_notes;
create policy "Staff manages quick notes" on public.quick_notes for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = quick_notes.site_id
  ));
create index if not exists idx_quick_notes_site on public.quick_notes(site_id);
create index if not exists idx_quick_notes_author on public.quick_notes(author_id);

-- ============================================================
-- DAILY SCHEDULE ITEMS
-- ============================================================
create table if not exists public.daily_schedule_items (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  group_id    uuid references public.groups(id) on delete set null,
  day_of_week int check (day_of_week between 0 and 6),  -- 0=Sun, 1=Mon...
  start_time  time not null,
  end_time    time,
  title       text not null,
  description text,
  category    text,  -- arrival, meal, activity, rest, outdoor, departure
  sort_order  int default 0,
  created_at  timestamptz default now()
);
alter table public.daily_schedule_items enable row level security;
drop policy if exists "Reads daily schedule" on public.daily_schedule_items;
create policy "Reads daily schedule" on public.daily_schedule_items for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and site_id = daily_schedule_items.site_id
  ));
drop policy if exists "Admin manages daily schedule" on public.daily_schedule_items;
create policy "Admin manages daily schedule" on public.daily_schedule_items for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = daily_schedule_items.site_id
  ));

-- ============================================================
-- ANNUAL EVENTS
-- ============================================================
create table if not exists public.annual_events (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  title       text not null,
  month       int not null check (month between 1 and 12),
  day         int check (day between 1 and 31),
  category    text,
  recurs      boolean not null default true,
  notes       text,
  created_at  timestamptz default now()
);
alter table public.annual_events enable row level security;
drop policy if exists "Reads annual events" on public.annual_events;
create policy "Reads annual events" on public.annual_events for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and site_id = annual_events.site_id
  ));
drop policy if exists "Admin manages annual events" on public.annual_events;
create policy "Admin manages annual events" on public.annual_events for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = annual_events.site_id
  ));

-- ============================================================
-- EINGEWÖHNUNG (Settling-in process tracking)
-- ============================================================
create table if not exists public.eingewoehnung_processes (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children(id) on delete cascade,
  phase       text not null default 'preparation'
              check (phase in ('preparation','base','stabilization','intensive','farewell','complete')),
  started_at  date,
  completed_at date,
  notes       text,
  educator_id uuid references auth.users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(child_id)
);
alter table public.eingewoehnung_processes enable row level security;
drop policy if exists "Staff manages eingewoehnung" on public.eingewoehnung_processes;
create policy "Staff manages eingewoehnung" on public.eingewoehnung_processes for all
  using (exists (
    select 1 from public.profiles p
    join public.children c on c.id = eingewoehnung_processes.child_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and c.site_id = p.site_id
  ));
create index if not exists idx_eingewoehnung_child on public.eingewoehnung_processes(child_id);

-- ============================================================
-- FOERDER GOALS (Förderziele)
-- ============================================================
create table if not exists public.foerder_goals (
  id              uuid primary key default gen_random_uuid(),
  foerderplan_id  uuid not null references public.foerderplaene(id) on delete cascade,
  title           text not null,
  description     text,
  domain          text,
  target_date     date,
  status          text not null default 'active'
                  check (status in ('active','achieved','paused','cancelled')),
  achieved_at     date,
  notes           text,
  sort_order      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table public.foerder_goals enable row level security;
drop policy if exists "Staff manages foerder goals" on public.foerder_goals;
create policy "Staff manages foerder goals" on public.foerder_goals for all
  using (exists (
    select 1 from public.foerderplaene fp
    join public.children c on c.id = fp.child_id
    join public.profiles p on p.site_id = c.site_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and fp.id = foerder_goals.foerderplan_id
  ));
create index if not exists idx_foerder_goals_plan on public.foerder_goals(foerderplan_id);

-- foerderplan_goals alias (some pages use this name)
create table if not exists public.foerderplan_goals (
  id              uuid primary key default gen_random_uuid(),
  foerderplan_id  uuid not null references public.foerderplaene(id) on delete cascade,
  title           text not null,
  domain          text,
  status          text not null default 'active',
  target_date     date,
  created_at      timestamptz default now()
);
alter table public.foerderplan_goals enable row level security;
drop policy if exists "Staff manages foerderplan goals" on public.foerderplan_goals;
create policy "Staff manages foerderplan goals" on public.foerderplan_goals for all
  using (exists (
    select 1 from public.foerderplaene fp
    join public.children c on c.id = fp.child_id
    join public.profiles p on p.site_id = c.site_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and fp.id = foerderplan_goals.foerderplan_id
  ));

-- ============================================================
-- GROUP HANDOVERS (Übergabeprotokoll)
-- ============================================================
create table if not exists public.group_handovers (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references public.sites(id) on delete cascade,
  group_id     uuid references public.groups(id) on delete set null,
  shift_date   date not null default current_date,
  content      text,
  items        jsonb default '[]',
  from_staff   uuid references auth.users(id),
  to_staff     uuid references auth.users(id),
  created_at   timestamptz default now()
);
alter table public.group_handovers enable row level security;
drop policy if exists "Staff manages group handovers" on public.group_handovers;
create policy "Staff manages group handovers" on public.group_handovers for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = group_handovers.site_id
  ));
create index if not exists idx_group_handovers_site on public.group_handovers(site_id);

-- ============================================================
-- CHILD HANDOVER CHECKS (Checkliste Abholen)
-- ============================================================
create table if not exists public.child_handover_checks (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children(id) on delete cascade,
  check_date  date not null default current_date,
  items       jsonb default '[]',
  completed   boolean not null default false,
  staff_id    uuid references auth.users(id),
  created_at  timestamptz default now()
);
alter table public.child_handover_checks enable row level security;
drop policy if exists "Staff manages child handover checks" on public.child_handover_checks;
create policy "Staff manages child handover checks" on public.child_handover_checks for all
  using (exists (
    select 1 from public.profiles p
    join public.children c on c.id = child_handover_checks.child_id
    where p.id = auth.uid() and p.role in ('educator','group_lead','admin','caretaker')
    and c.site_id = p.site_id
  ));
create index if not exists idx_child_handover_child on public.child_handover_checks(child_id);

-- ============================================================
-- TRAININGS (Fortbildungen)
-- ============================================================
create table if not exists public.trainings (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references public.sites(id) on delete cascade,
  title        text not null,
  description  text,
  training_date date,
  provider     text,
  location     text,
  duration_hours numeric(4,1),
  max_participants int,
  notes        text,
  created_by   uuid references auth.users(id),
  created_at   timestamptz default now()
);
alter table public.trainings enable row level security;
drop policy if exists "Staff reads trainings" on public.trainings;
create policy "Staff reads trainings" on public.trainings for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = trainings.site_id
  ));
drop policy if exists "Admin manages trainings" on public.trainings;
create policy "Admin manages trainings" on public.trainings for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = trainings.site_id
  ));
create index if not exists idx_trainings_site on public.trainings(site_id);

-- ============================================================
-- ROOMS (Räume)
-- ============================================================
create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  name        text not null,
  capacity    int,
  description text,
  floor       text,
  equipment   text[],
  created_at  timestamptz default now()
);
alter table public.rooms enable row level security;
drop policy if exists "Staff reads rooms" on public.rooms;
create policy "Staff reads rooms" on public.rooms for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = rooms.site_id
  ));
drop policy if exists "Admin manages rooms" on public.rooms;
create policy "Admin manages rooms" on public.rooms for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = rooms.site_id
  ));

-- ============================================================
-- FORM TEMPLATES
-- ============================================================
create table if not exists public.form_templates (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  title       text not null,
  description text,
  fields      jsonb default '[]',  -- [{id, label, type, required, options}]
  category    text,
  active      boolean not null default true,
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now()
);
alter table public.form_templates enable row level security;
drop policy if exists "Staff reads form templates" on public.form_templates;
create policy "Staff reads form templates" on public.form_templates for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = form_templates.site_id
  ));
drop policy if exists "Admin manages form templates" on public.form_templates;
create policy "Admin manages form templates" on public.form_templates for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = form_templates.site_id
  ));

-- ============================================================
-- TEAM MESSAGES (internal broadcast)
-- ============================================================
create table if not exists public.team_messages (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  author_id   uuid not null references auth.users(id) on delete cascade,
  content     text not null,
  pinned      boolean not null default false,
  created_at  timestamptz default now()
);
alter table public.team_messages enable row level security;
drop policy if exists "Staff manages team messages" on public.team_messages;
create policy "Staff manages team messages" on public.team_messages for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = team_messages.site_id
  ));
create index if not exists idx_team_messages_site on public.team_messages(site_id);

-- ============================================================
-- MESSAGE TEMPLATES
-- ============================================================
create table if not exists public.message_templates (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  title       text not null,
  subject     text,
  body        text not null,
  category    text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now()
);
alter table public.message_templates enable row level security;
drop policy if exists "Staff reads message templates" on public.message_templates;
create policy "Staff reads message templates" on public.message_templates for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = message_templates.site_id
  ));
drop policy if exists "Admin manages message templates" on public.message_templates;
create policy "Admin manages message templates" on public.message_templates for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','group_lead')
    and site_id = message_templates.site_id
  ));

-- ============================================================
-- BULLETIN POSTS (Pinnwand posts)
-- ============================================================
create table if not exists public.bulletin_posts (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  author_id   uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  content     text,
  photo_urls  text[] default '{}',
  pinned      boolean not null default false,
  group_id    uuid references public.groups(id) on delete set null,
  created_at  timestamptz default now()
);
alter table public.bulletin_posts enable row level security;
drop policy if exists "Staff manages bulletin posts" on public.bulletin_posts;
create policy "Staff manages bulletin posts" on public.bulletin_posts for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = bulletin_posts.site_id
  ));
drop policy if exists "Reads bulletin posts" on public.bulletin_posts;
create policy "Reads bulletin posts" on public.bulletin_posts for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and site_id = bulletin_posts.site_id
  ));
create index if not exists idx_bulletin_posts_site on public.bulletin_posts(site_id);

-- ============================================================
-- INCIDENTS (Unfallberichte / Zwischenfälle — lightweight alias)
-- ============================================================
create table if not exists public.incidents (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  child_id    uuid references public.children(id) on delete set null,
  title       text not null,
  description text,
  severity    text default 'minor' check (severity in ('minor','moderate','serious')),
  occurred_at timestamptz not null default now(),
  location    text,
  first_aid   text,
  parent_notified boolean not null default false,
  reported_by uuid references auth.users(id),
  created_at  timestamptz default now()
);
alter table public.incidents enable row level security;
drop policy if exists "Staff manages incidents table" on public.incidents;
create policy "Staff manages incidents table" on public.incidents for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('educator','group_lead','admin','caretaker')
    and site_id = incidents.site_id
  ));
create index if not exists idx_incidents_site on public.incidents(site_id);
create index if not exists idx_incidents_child on public.incidents(child_id);
create index if not exists idx_incidents_created on public.incidents(created_at desc);

-- ============================================================
-- UPDATED_AT triggers for new tables
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'notification_settings','sick_reports','health_records','material_orders',
    'meal_orders','weekly_menus','fees','fee_records','protocols',
    'foerder_goals','foerderplan_goals','group_handovers','quick_notes',
    'eingewoehnung_processes'
  ] loop
    execute format('
      drop trigger if exists set_updated_at on public.%I;
      create trigger set_updated_at
        before update on public.%I
        for each row execute procedure public.handle_updated_at();
    ', t, t);
  end loop;
end $$;
