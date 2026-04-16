-- ============================================================
-- KitaHub – Vollständiges Datenbankschema
-- Ausführen in: Supabase SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- SITES (Kita-Standorte)
-- ============================================================
create table if not exists public.sites (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  address     text,
  phone       text,
  email       text,
  logo_url    text,
  config      jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- GROUPS
-- ============================================================
create table if not exists public.groups (
  id               uuid primary key default uuid_generate_v4(),
  site_id          uuid not null references public.sites(id) on delete cascade,
  name             text not null,
  age_min_months   int not null default 0,
  age_max_months   int not null default 72,
  capacity         int not null default 20,
  color            text not null default '#3B6CE8',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- PROFILES (extended auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  site_id     uuid references public.sites(id),
  full_name   text,
  phone       text,
  role        text not null default 'parent'
                check (role in ('parent','educator','group_lead','admin','caretaker')),
  avatar_url  text,
  language    text not null default 'de',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, site_id, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    (new.raw_user_meta_data->>'site_id')::uuid,
    coalesce(new.raw_user_meta_data->>'role', 'parent')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CHILDREN
-- ============================================================
create table if not exists public.children (
  id             uuid primary key default uuid_generate_v4(),
  site_id        uuid not null references public.sites(id) on delete cascade,
  group_id       uuid references public.groups(id) on delete set null,
  first_name     text not null,
  last_name      text not null,
  date_of_birth  date,
  gender         text check (gender in ('male','female','diverse','unknown')),
  photo_url      text,
  allergies      text[],
  medical_notes  text,
  status         text not null default 'active'
                   check (status in ('active','inactive','waitlist')),
  start_date     date,
  end_date       date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================
-- GUARDIANS (Eltern/Erziehungsberechtigte)
-- ============================================================
create table if not exists public.guardians (
  id                 uuid primary key default uuid_generate_v4(),
  child_id           uuid not null references public.children(id) on delete cascade,
  user_id            uuid references auth.users(id) on delete set null,
  full_name          text not null,
  phone              text,
  email              text,
  relationship       text not null default 'parent',
  is_primary         boolean not null default false,
  can_pickup         boolean not null default true,
  consent_photos     boolean not null default false,
  consent_signed_at  timestamptz,
  created_at         timestamptz not null default now()
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
create table if not exists public.attendance (
  id              uuid primary key default uuid_generate_v4(),
  child_id        uuid not null references public.children(id) on delete cascade,
  site_id         uuid not null references public.sites(id) on delete cascade,
  date            date not null,
  status          text not null default 'unknown'
                    check (status in ('present','absent_sick','absent_vacation','absent_other','unknown')),
  check_in_at     timestamptz,
  check_out_at    timestamptz,
  absence_reason  text,
  absence_note    text,
  reported_by     uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (child_id, date)
);

-- ============================================================
-- DAILY REPORTS (Tagesberichte)
-- ============================================================
create table if not exists public.daily_reports (
  id            uuid primary key default uuid_generate_v4(),
  child_id      uuid not null references public.children(id) on delete cascade,
  author_id     uuid references auth.users(id) on delete set null,
  report_date   date not null,
  mood          text check (mood in ('great','good','okay','sad','sick')),
  meals         jsonb not null default '{}',
  sleep_minutes int,
  sleep_notes   text,
  activities    text,
  notes         text,
  shared_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (child_id, report_date)
);

-- ============================================================
-- ANNOUNCEMENTS (Feed-Beiträge)
-- ============================================================
create table if not exists public.announcements (
  id            uuid primary key default uuid_generate_v4(),
  site_id       uuid not null references public.sites(id) on delete cascade,
  group_id      uuid references public.groups(id) on delete set null,
  author_id     uuid references auth.users(id) on delete set null,
  title         text not null,
  body          text not null default '',
  type          text not null default 'info'
                  check (type in ('info','important','event','menu','reminder')),
  published_at  timestamptz not null default now(),
  expires_at    timestamptz,
  pinned        boolean not null default false,
  attachments   jsonb not null default '[]',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.announcement_reads (
  announcement_id  uuid not null references public.announcements(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  read_at          timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

-- ============================================================
-- EVENTS (Kalender)
-- ============================================================
create table if not exists public.events (
  id               uuid primary key default uuid_generate_v4(),
  site_id          uuid not null references public.sites(id) on delete cascade,
  group_id         uuid references public.groups(id) on delete set null,
  author_id        uuid references auth.users(id) on delete set null,
  title            text not null,
  description      text,
  location         text,
  starts_at        timestamptz not null,
  ends_at          timestamptz,
  all_day          boolean not null default false,
  type             text not null default 'event'
                     check (type in ('event','excursion','parent_evening','holiday','closed','other')),
  rsvp_required    boolean not null default false,
  max_participants int,
  color            text not null default '#3B6CE8',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.event_rsvps (
  event_id    uuid not null references public.events(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  status      text not null check (status in ('yes','no','maybe')),
  note        text,
  created_at  timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ============================================================
-- MEDIA / GALERIE
-- ============================================================
create table if not exists public.albums (
  id          uuid primary key default uuid_generate_v4(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  group_id    uuid references public.groups(id) on delete set null,
  title       text not null,
  cover_url   text,
  description text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.media_assets (
  id               uuid primary key default uuid_generate_v4(),
  site_id          uuid not null references public.sites(id) on delete cascade,
  album_id         uuid references public.albums(id) on delete set null,
  uploader_id      uuid references auth.users(id) on delete set null,
  url              text not null,
  thumbnail_url    text,
  file_name        text,
  file_size        bigint,
  mime_type        text,
  width            int,
  height           int,
  caption          text,
  child_ids        uuid[] not null default '{}',
  consent_required boolean not null default true,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- MESSAGING
-- ============================================================
create table if not exists public.conversations (
  id          uuid primary key default uuid_generate_v4(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  subject     text,
  type        text not null default 'direct' check (type in ('direct','group')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  last_read_at     timestamptz,
  joined_at        timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid not null references auth.users(id) on delete cascade,
  body             text not null,
  type             text not null default 'text' check (type in ('text','absence_report','system')),
  meta             jsonb not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  data        jsonb not null default '{}',
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_attendance_child_date on public.attendance(child_id, date);
create index if not exists idx_attendance_site_date on public.attendance(site_id, date);
create index if not exists idx_daily_reports_child_date on public.daily_reports(child_id, report_date);
create index if not exists idx_announcements_site_published on public.announcements(site_id, published_at desc);
create index if not exists idx_events_site_starts on public.events(site_id, starts_at);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);
create index if not exists idx_guardians_user on public.guardians(user_id);
create index if not exists idx_guardians_child on public.guardians(child_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ declare
  t text;
begin
  foreach t in array array[
    'sites','groups','profiles','children','attendance',
    'daily_reports','announcements','events','albums','conversations','messages'
  ] loop
    execute format('
      drop trigger if exists set_updated_at on public.%I;
      create trigger set_updated_at before update on public.%I
        for each row execute procedure public.set_updated_at();
    ', t, t);
  end loop;
end $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.sites                    enable row level security;
alter table public.groups                   enable row level security;
alter table public.profiles                 enable row level security;
alter table public.children                 enable row level security;
alter table public.guardians                enable row level security;
alter table public.attendance               enable row level security;
alter table public.daily_reports            enable row level security;
alter table public.announcements            enable row level security;
alter table public.announcement_reads       enable row level security;
alter table public.events                   enable row level security;
alter table public.event_rsvps              enable row level security;
alter table public.albums                   enable row level security;
alter table public.media_assets             enable row level security;
alter table public.conversations            enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages                 enable row level security;
alter table public.notifications            enable row level security;

-- Helper: get current user's site_id
create or replace function public.my_site_id()
returns uuid language sql security definer stable as $$
  select site_id from public.profiles where id = auth.uid() limit 1;
$$;

-- Helper: get current user's role
create or replace function public.my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

-- Helper: is staff
create or replace function public.is_staff()
returns boolean language sql security definer stable as $$
  select role in ('educator','group_lead','admin','caretaker')
  from public.profiles where id = auth.uid() limit 1;
$$;

-- ---- SITES ----
drop policy if exists "Site read" on public.sites;
create policy "Site read" on public.sites for select
  using (id = public.my_site_id());

drop policy if exists "Admin update site" on public.sites;
create policy "Admin update site" on public.sites for update
  using (id = public.my_site_id() and public.my_role() = 'admin');

-- ---- GROUPS ----
drop policy if exists "Groups read" on public.groups;
create policy "Groups read" on public.groups for select
  using (site_id = public.my_site_id());

drop policy if exists "Staff manage groups" on public.groups;
create policy "Staff manage groups" on public.groups for all
  using (site_id = public.my_site_id() and public.is_staff())
  with check (site_id = public.my_site_id() and public.is_staff());

-- ---- PROFILES ----
drop policy if exists "Own profile" on public.profiles;
create policy "Own profile" on public.profiles for select
  using (id = auth.uid() or site_id = public.my_site_id());

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles for update
  using (id = auth.uid());

drop policy if exists "Insert own profile" on public.profiles;
create policy "Insert own profile" on public.profiles for insert
  with check (id = auth.uid());

-- ---- CHILDREN ----
drop policy if exists "Children read" on public.children;
create policy "Children read" on public.children for select
  using (
    site_id = public.my_site_id()
    and (
      public.is_staff()
      or id in (select child_id from public.guardians where user_id = auth.uid())
    )
  );

drop policy if exists "Staff manage children" on public.children;
create policy "Staff manage children" on public.children for all
  using (site_id = public.my_site_id() and public.is_staff())
  with check (site_id = public.my_site_id() and public.is_staff());

-- ---- GUARDIANS ----
drop policy if exists "Guardian read" on public.guardians;
create policy "Guardian read" on public.guardians for select
  using (
    user_id = auth.uid()
    or public.is_staff()
  );

drop policy if exists "Staff manage guardians" on public.guardians;
create policy "Staff manage guardians" on public.guardians for all
  using (public.is_staff())
  with check (public.is_staff());

-- ---- ATTENDANCE ----
drop policy if exists "Attendance read" on public.attendance;
create policy "Attendance read" on public.attendance for select
  using (
    site_id = public.my_site_id()
    and (
      public.is_staff()
      or child_id in (select child_id from public.guardians where user_id = auth.uid())
    )
  );

drop policy if exists "Attendance write" on public.attendance;
create policy "Attendance write" on public.attendance for insert
  with check (site_id = public.my_site_id());

drop policy if exists "Attendance update" on public.attendance;
create policy "Attendance update" on public.attendance for update
  using (site_id = public.my_site_id());

-- ---- DAILY REPORTS ----
drop policy if exists "Reports read" on public.daily_reports;
create policy "Reports read" on public.daily_reports for select
  using (
    public.is_staff()
    or child_id in (select child_id from public.guardians where user_id = auth.uid())
  );

drop policy if exists "Staff write reports" on public.daily_reports;
create policy "Staff write reports" on public.daily_reports for all
  using (public.is_staff())
  with check (public.is_staff());

-- ---- ANNOUNCEMENTS ----
drop policy if exists "Announcements read" on public.announcements;
create policy "Announcements read" on public.announcements for select
  using (site_id = public.my_site_id());

drop policy if exists "Staff write announcements" on public.announcements;
create policy "Staff write announcements" on public.announcements for insert
  with check (site_id = public.my_site_id() and public.is_staff());

drop policy if exists "Staff update announcements" on public.announcements;
create policy "Staff update announcements" on public.announcements for update
  using (site_id = public.my_site_id() and public.is_staff());

-- ---- ANNOUNCEMENT READS ----
drop policy if exists "Own reads" on public.announcement_reads;
create policy "Own reads" on public.announcement_reads for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---- EVENTS ----
drop policy if exists "Events read" on public.events;
create policy "Events read" on public.events for select
  using (site_id = public.my_site_id());

drop policy if exists "Staff write events" on public.events;
create policy "Staff write events" on public.events for all
  using (site_id = public.my_site_id() and public.is_staff())
  with check (site_id = public.my_site_id() and public.is_staff());

-- ---- EVENT RSVPS ----
drop policy if exists "Own rsvps" on public.event_rsvps;
create policy "Own rsvps" on public.event_rsvps for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Staff read rsvps" on public.event_rsvps;
create policy "Staff read rsvps" on public.event_rsvps for select
  using (public.is_staff());

-- ---- ALBUMS ----
drop policy if exists "Albums read" on public.albums;
create policy "Albums read" on public.albums for select
  using (site_id = public.my_site_id());

drop policy if exists "Staff write albums" on public.albums;
create policy "Staff write albums" on public.albums for all
  using (site_id = public.my_site_id() and public.is_staff())
  with check (site_id = public.my_site_id() and public.is_staff());

-- ---- MEDIA ASSETS ----
drop policy if exists "Media read" on public.media_assets;
create policy "Media read" on public.media_assets for select
  using (site_id = public.my_site_id());

drop policy if exists "Staff write media" on public.media_assets;
create policy "Staff write media" on public.media_assets for insert
  with check (site_id = public.my_site_id() and public.is_staff());

-- ---- CONVERSATIONS ----
drop policy if exists "Conversation read" on public.conversations;
create policy "Conversation read" on public.conversations for select
  using (
    site_id = public.my_site_id()
    and id in (
      select conversation_id from public.conversation_participants where user_id = auth.uid()
    )
  );

drop policy if exists "Create conversation" on public.conversations;
create policy "Create conversation" on public.conversations for insert
  with check (site_id = public.my_site_id());

-- ---- CONVERSATION PARTICIPANTS ----
drop policy if exists "Participants read" on public.conversation_participants;
create policy "Participants read" on public.conversation_participants for select
  using (
    conversation_id in (
      select conversation_id from public.conversation_participants where user_id = auth.uid()
    )
  );

drop policy if exists "Join conversation" on public.conversation_participants;
create policy "Join conversation" on public.conversation_participants for insert
  with check (user_id = auth.uid() or public.is_staff());

drop policy if exists "Update own participation" on public.conversation_participants;
create policy "Update own participation" on public.conversation_participants for update
  using (user_id = auth.uid());

-- ---- MESSAGES ----
drop policy if exists "Messages read" on public.messages;
create policy "Messages read" on public.messages for select
  using (
    conversation_id in (
      select conversation_id from public.conversation_participants where user_id = auth.uid()
    )
  );

drop policy if exists "Send message" on public.messages;
create policy "Send message" on public.messages for insert
  with check (
    sender_id = auth.uid()
    and conversation_id in (
      select conversation_id from public.conversation_participants where user_id = auth.uid()
    )
  );

-- ---- NOTIFICATIONS ----
drop policy if exists "Own notifications" on public.notifications;
create policy "Own notifications" on public.notifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.announcements;
alter publication supabase_realtime add table public.attendance;
alter publication supabase_realtime add table public.notifications;

-- ============================================================
-- STORAGE BUCKET (Galerie)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "Staff upload media" on storage.objects;
create policy "Staff upload media" on storage.objects for insert
  with check (
    bucket_id = 'media'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Authenticated read media" on storage.objects;
create policy "Authenticated read media" on storage.objects for select
  using (
    bucket_id = 'media'
    and auth.role() = 'authenticated'
  );

-- ============================================================
-- SEED: Default site
-- ============================================================
insert into public.sites (id, name, address, phone, email)
values (
  'a0000000-0000-0000-0000-000000000001',
  'KitaHub Demo',
  'Musterstraße 1, 12345 Musterstadt',
  '+49 123 456789',
  'info@kitahub.de'
)
on conflict (id) do nothing;
